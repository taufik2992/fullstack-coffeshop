import Order, { IOrder } from "../models/Order";
import {
  PaginationResult,
  PaginationQuery,
  OrderStatus,
  PaymentStatus,
} from "../types";
import { Types } from "mongoose";

type LeanOrder = IOrder & { _id: Types.ObjectId };

export class OrderRepository {
  async create(orderData: Partial<IOrder>): Promise<IOrder> {
    const order = new Order(orderData);
    return order.save();
  }

  async findById(id: string): Promise<LeanOrder | null> {
    return Order.findById(id)
      .populate("user", "name email phone")
      .populate("branch", "name address phone location")
      .populate("items.product", "name image")
      .lean<LeanOrder>()
      .exec();
  }

  async findByOrderId(orderId: string): Promise<LeanOrder | null> {
    return Order.findOne({ orderId })
      .populate("user", "name email phone")
      .populate("branch", "name address phone location")
      .populate("items.product", "name image")
      .lean<LeanOrder>()
      .exec();
  }

  async findByUserId(
    userId: string,
    query: PaginationQuery & {
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
    }
  ): Promise<PaginationResult<LeanOrder>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {
      user: new Types.ObjectId(userId),
    };

    if (query.status) filter.status = query.status;
    if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;

    const [data, total] = await Promise.all([
      Order.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("branch", "name address")
        .lean<LeanOrder[]>(),
      Order.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findAll(
    query: PaginationQuery & {
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
      userId?: string;
      branchId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<PaginationResult<LeanOrder>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (query.status) filter.status = query.status;
    if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
    if (query.userId) filter.user = new Types.ObjectId(query.userId);
    if (query.branchId) filter.branch = new Types.ObjectId(query.branchId);

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = query.startDate;
      if (query.endDate) filter.createdAt.$lte = query.endDate;
    }

    const [data, total] = await Promise.all([
      Order.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("user", "name email phone")
        .populate("branch", "name address")
        .lean<LeanOrder[]>(),
      Order.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateById(
    id: string,
    updateData: Partial<IOrder>
  ): Promise<LeanOrder | null> {
    return Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("user", "name email phone")
      .populate("branch", "name address")
      .lean<LeanOrder>()
      .exec();
  }

  async updateByOrderId(
    orderId: string,
    updateData: Partial<IOrder>
  ): Promise<LeanOrder | null> {
    return Order.findOneAndUpdate({ orderId }, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("user", "name email phone")
      .populate("branch", "name address")
      .lean<LeanOrder>()
      .exec();
  }

  async getAnalytics(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
  }> {
    const filter: Record<string, any> = {
      paymentStatus: "SUCCESS",
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }

    const orders = await Order.find(filter).lean<LeanOrder[]>();

    const totalSales = orders.reduce(
      (sum, order) => sum + (order.totalAmount ?? 0),
      0
    );
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      totalSales,
      totalOrders,
      averageOrderValue,
    };
  }

  async getTopProducts(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date
  ): Promise<
    Array<{
      productId: string;
      productName: string;
      totalQuantity: number;
      totalRevenue: number;
    }>
  > {
    const filter: Record<string, any> = {
      paymentStatus: "SUCCESS",
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }

    const orders = await Order.find(filter).lean<LeanOrder[]>();

    const productStats = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.product.toString();
        const existing = productStats.get(productId) || {
          name: item.name,
          quantity: 0,
          revenue: 0,
        };
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
        productStats.set(productId, existing);
      });
    });

    return Array.from(productStats.entries())
      .map(([productId, stats]) => ({
        productId,
        productName: stats.name,
        totalQuantity: stats.quantity,
        totalRevenue: stats.revenue,
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);
  }

  async getBranchPerformance(
    limit: number = 10,
    startDate?: Date,
    endDate?: Date
  ): Promise<
    Array<{
      branchId: string;
      branchName: string;
      totalOrders: number;
      totalRevenue: number;
    }>
  > {
    const filter: Record<string, any> = {
      paymentStatus: "SUCCESS",
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }

    const orders = await Order.find(filter).populate("branch", "name").lean<
      (LeanOrder & {
        branch: { _id: Types.ObjectId; name: string };
      })[]
    >();

    const branchStats = new Map<
      string,
      { name: string; orders: number; revenue: number }
    >();

    orders.forEach((order) => {
      const branchId = order.branch._id.toString();
      const branchName = order.branch.name;

      const existing = branchStats.get(branchId) || {
        name: branchName,
        orders: 0,
        revenue: 0,
      };

      existing.orders += 1;
      existing.revenue += order.totalAmount ?? 0;
      branchStats.set(branchId, existing);
    });

    return Array.from(branchStats.entries())
      .map(([branchId, stats]) => ({
        branchId,
        branchName: stats.name,
        totalOrders: stats.orders,
        totalRevenue: stats.revenue,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }
}
