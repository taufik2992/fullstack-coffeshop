import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middlewares/errorHandler';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  createOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { branchId, items, paymentMethod } = req.body;
      const result = await this.orderService.createOrder(req.user.userId, {
        branchId,
        items,
        paymentMethod,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      next(error);
    }
  };

  getUserOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { page, limit, status, paymentStatus } = req.query;
      const result = await this.orderService.getUserOrders(req.user.userId, {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        status: status as any,
        paymentStatus: paymentStatus as any,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, status, paymentStatus, userId, branchId, startDate, endDate } = req.query;
      const result = await this.orderService.getAllOrders({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        status: status as any,
        paymentStatus: paymentStatus as any,
        userId: userId as string,
        branchId: branchId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderById(id);

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, 404);
      }
      next(error);
    }
  };

  updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await this.orderService.updateOrderStatus(id, status);

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, error.message === 'Order not found' ? 404 : 400);
      }
      next(error);
    }
  };

  handleMidtransCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.orderService.handleMidtransCallback(req.body);

      res.json({
        success: true,
        message: 'Callback processed',
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      next(error);
    }
  };
}

