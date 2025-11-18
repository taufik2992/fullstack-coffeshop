import { OrderRepository } from '../repositories/order.repository';

export class AnalyticsService {
  private orderRepository: OrderRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
  }

  async getSales(startDate?: Date, endDate?: Date): Promise<{
    totalSales: number;
    totalOrders: number;
    averageOrderValue: number;
    revenueByDate?: Array<{ date: string; revenue: number; orders: number }>;
  }> {
    const analytics = await this.orderRepository.getAnalytics(startDate, endDate);

    return {
      ...analytics,
    };
  }

  async getTopProducts(limit: number = 10, startDate?: Date, endDate?: Date): Promise<
    Array<{
      productId: string;
      productName: string;
      totalQuantity: number;
      totalRevenue: number;
    }>
  > {
    return this.orderRepository.getTopProducts(limit, startDate, endDate);
  }

  async getBranchPerformance(limit: number = 10, startDate?: Date, endDate?: Date): Promise<
    Array<{
      branchId: string;
      branchName: string;
      totalOrders: number;
      totalRevenue: number;
    }>
  > {
    return this.orderRepository.getBranchPerformance(limit, startDate, endDate);
  }
}

