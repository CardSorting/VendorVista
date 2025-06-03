/**
 * Get Seller Dashboard Handler - CQRS Query Handler
 * Implements Clean Architecture with dependency injection
 */

import { ISellerRepository, ISellerAnalyticsRepository } from '../../domain/repositories/ISellerRepository';
import { GetSellerDashboardQuery, SellerDashboardData, DashboardMetrics } from '../queries/GetSellerDashboardQuery';
import { Money } from '../../domain/value-objects/Money';

export class GetSellerDashboardHandler {
  constructor(
    private readonly sellerRepository: ISellerRepository,
    private readonly analyticsRepository: ISellerAnalyticsRepository
  ) {}

  async handle(query: GetSellerDashboardQuery): Promise<SellerDashboardData> {
    const seller = await this.sellerRepository.findById(query.sellerId);
    if (!seller) {
      throw new Error('Seller not found');
    }

    const [
      revenueTrend,
      topProducts,
      customerMetrics,
      conversionMetrics
    ] = await Promise.all([
      this.analyticsRepository.getRevenueTrend(query.sellerId, query.timeframe),
      this.analyticsRepository.getTopProducts(query.sellerId, 5),
      this.analyticsRepository.getCustomerMetrics(query.sellerId),
      this.analyticsRepository.getConversionMetrics(query.sellerId)
    ]);

    const totalRevenue = revenueTrend.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = topProducts.reduce((sum, product) => sum + product.sales, 0);

    const metrics: DashboardMetrics = {
      totalRevenue: Money.create(totalRevenue, 'USD'),
      totalOrders,
      totalProducts: topProducts.length,
      conversionRate: conversionMetrics.rate,
      averageOrderValue: Money.create(totalOrders > 0 ? totalRevenue / totalOrders : 0, 'USD'),
      viewCount: conversionMetrics.views,
      growthMetrics: {
        revenueGrowth: this.calculateGrowth(revenueTrend),
        orderGrowth: 0, // Will be calculated based on historical data
        customerGrowth: 0
      }
    };

    return {
      metrics,
      recentOrders: [], // Will be populated from order repository
      topProducts: [], // Will be mapped from analytics data
      revenueTrend
    };
  }

  private calculateGrowth(trend: Array<{ date: Date; revenue: number }>): number {
    if (trend.length < 2) return 0;
    
    const current = trend[trend.length - 1].revenue;
    const previous = trend[trend.length - 2].revenue;
    
    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  }
}