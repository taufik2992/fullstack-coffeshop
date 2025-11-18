import { OrderRepository } from "../repositories/order.repository";
import { ProductRepository } from "../repositories/product.repository";
import { BranchRepository } from "../repositories/branch.repository";
import { UserRepository } from "../repositories/user.repository";
import { IOrder } from "../models/Order";
import {
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
  PaginationQuery,
  PaginationResult,
} from "../types";
import {
  createSnapTransaction,
  MidtransTransactionParams,
} from "../config/midtrans";
import logger from "../utils/logger";
import crypto from "crypto";

export class OrderService {
  private orderRepository: OrderRepository;
  private productRepository: ProductRepository;
  private branchRepository: BranchRepository;
  private userRepository: UserRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.productRepository = new ProductRepository();
    this.branchRepository = new BranchRepository();
    this.userRepository = new UserRepository();
  }

  private generateOrderId(): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString("hex");
    return `ORDER-${timestamp}-${random}`;
  }

  async createOrder(
    userId: string,
    data: {
      branchId: string;
      items: Array<{ productId: string; quantity: number }>;
      paymentMethod: PaymentMethod;
    }
  ): Promise<{
    order: IOrder;
    paymentToken?: string;
    paymentUrl?: string;
  }> {
    const branch = await this.branchRepository.findById(data.branchId);
    if (!branch || !branch.isActive) {
      throw new Error("Branch not found or inactive");
    }

    const productIds = data.items.map((item) => item.productId);
    const products = await this.productRepository.findByIds(productIds);

    if (products.length !== productIds.length) {
      throw new Error("Some products not found");
    }

    const orderItems = data.items.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if (!product.isAvailable) {
        throw new Error(`Product ${product.name} is not available`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const orderId = this.generateOrderId();

    let paymentStatus = PaymentStatus.PENDING;
    let orderStatus = OrderStatus.PENDING;
    let paymentToken: string | undefined;
    let paymentDetails: Record<string, unknown> = {};

    if (data.paymentMethod === PaymentMethod.CASH) {
      paymentStatus = PaymentStatus.SUCCESS;
      orderStatus = OrderStatus.PROCESSING;
      paymentDetails = {
        method: "CASH",
        paidAt: new Date().toISOString(),
      };
    } else if (data.paymentMethod === PaymentMethod.MIDTRANS) {
      try {
        const user = await this.userRepository.findById(userId);
        if (!user) {
          throw new Error("User not found");
        }

        const midtransParams: MidtransTransactionParams = {
          transaction_details: {
            order_id: orderId,
            gross_amount: totalAmount,
          },
          item_details: orderItems.map((item) => ({
            id: item.product.toString(),
            price: item.price,
            quantity: item.quantity,
            name: item.name,
          })),
          customer_details: {
            first_name: user.name.split(" ")[0] || user.name,
            last_name: user.name.split(" ").slice(1).join(" ") || "",
            email: user.email,
            phone: user.phone,
          },
        };

        const token = await createSnapTransaction(midtransParams);
        paymentToken = token;
        paymentDetails = {
          midtransToken: token,
          midtransOrderId: orderId,
        };
      } catch (error) {
        logger.error("Failed to create Midtrans transaction:");
        throw new Error("Failed to create payment transaction");
      }
    }

    const order = await this.orderRepository.create({
      orderId,
      user: userId as any,
      branch: data.branchId as any,
      items: orderItems as any,
      totalAmount,
      status: orderStatus,
      paymentMethod: data.paymentMethod,
      paymentStatus,
      paymentDetails: paymentDetails as any,
    });

    return {
      order,
      paymentToken:
        data.paymentMethod === PaymentMethod.MIDTRANS
          ? paymentToken
          : undefined,
    };
  }

  async getUserOrders(
    userId: string,
    query: PaginationQuery & {
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
    }
  ): Promise<PaginationResult<IOrder>> {
    return this.orderRepository.findByUserId(userId, query);
  }

  async getAllOrders(
    query: PaginationQuery & {
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
      userId?: string;
      branchId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<PaginationResult<IOrder>> {
    return this.orderRepository.findAll(query);
  }

  async getOrderById(id: string): Promise<IOrder> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<IOrder> {
    const updated = await this.orderRepository.updateById(id, { status });
    if (!updated) {
      throw new Error("Order not found");
    }
    return updated;
  }

  async handleMidtransCallback(data: {
    order_id: string;
    transaction_status: string;
    signature_key: string;
    status_code: string;
    gross_amount: string;
  }): Promise<void> {
    const order = await this.orderRepository.findByOrderId(data.order_id);
    if (!order) {
      logger.error(`Order not found for Midtrans callback: ${data.order_id}`);
      return;
    }

    const { verifyMidtransSignature } = require("../config/midtrans");
    const isValid = verifyMidtransSignature(
      data.order_id,
      data.status_code,
      data.gross_amount,
      data.signature_key
    );

    if (!isValid) {
      logger.error(`Invalid Midtrans signature for order: ${data.order_id}`);
      throw new Error("Invalid signature");
    }

    let paymentStatus: PaymentStatus = order.paymentStatus;
    let orderStatus: OrderStatus = order.status;

    switch (data.transaction_status) {
      case "settlement":
      case "capture":
        paymentStatus = PaymentStatus.SUCCESS;
        if (order.status === OrderStatus.PENDING) {
          orderStatus = OrderStatus.PROCESSING;
        }
        break;
      case "cancel":
      case "expire":
        paymentStatus = PaymentStatus.CANCELED;
        orderStatus = OrderStatus.CANCELLED;
        break;
      case "deny":
        paymentStatus = PaymentStatus.FAILED;
        break;
      default:
        // pending, challenge, etc.
        paymentStatus = PaymentStatus.PENDING;
    }

    await this.orderRepository.updateByOrderId(data.order_id, {
      paymentStatus,
      status: orderStatus,
      paymentDetails: {
        ...order.paymentDetails,
        midtransStatus: data.transaction_status,
        midtransStatusCode: data.status_code,
        updatedAt: new Date().toISOString(),
      } as any,
    });

    logger.info(`Order ${data.order_id} updated: ${paymentStatus}`);
  }
}
