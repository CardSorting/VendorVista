/**
 * Get Seller Dashboard Query - CQRS Query for dashboard data
 * Follows Apple's principle of purposeful, focused functionality
 */

import { Money } from '../../domain/value-objects/Money';

export interface GetSellerDashboardQuery {
  sellerId: string;
  timeframe: 'day' | 'week' | 'month' | 'year';
}

export interface DashboardMetrics {
  totalRevenue: Money;
  totalOrders: number;
  totalProducts: number;
  conversionRate: number;
  averageOrderValue: Money;
  viewCount: number;
  growthMetrics: {
    revenueGrowth: number;
    orderGrowth: number;
    customerGrowth: number;
  };
}

export interface RecentOrder {
  id: string;
  customerName: string;
  total: Money;
  status: 'pending' | 'fulfilled' | 'shipped' | 'cancelled';
  createdAt: Date;
  itemCount: number;
}

export interface ProductSummary {
  id: string;
  name: string;
  price: Money;
  status: 'active' | 'inactive' | 'draft';
  inventory: number;
  salesCount: number;
  imageUrl?: string;
}

export interface SellerDashboardData {
  metrics: DashboardMetrics;
  recentOrders: RecentOrder[];
  topProducts: ProductSummary[];
  revenueTrend: Array<{ date: Date; revenue: number }>;
}