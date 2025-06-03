/**
 * Seller Repository Interface - Contract for seller data persistence
 * Follows Interface Segregation Principle and Dependency Inversion
 */

import { SellerProfile } from '../entities/SellerProfile';
import { UserId } from '../value-objects/UserId';

export interface ISellerRepository {
  findById(id: string): Promise<SellerProfile | null>;
  findByUserId(userId: UserId): Promise<SellerProfile | null>;
  save(seller: SellerProfile): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(limit?: number, offset?: number): Promise<SellerProfile[]>;
  findActiveCount(): Promise<number>;
}

export interface ISellerAnalyticsRepository {
  getRevenueTrend(sellerId: string, period: 'day' | 'week' | 'month' | 'year'): Promise<Array<{ date: Date; revenue: number }>>;
  getTopProducts(sellerId: string, limit: number): Promise<Array<{ productId: string; revenue: number; sales: number }>>;
  getCustomerMetrics(sellerId: string): Promise<{ totalCustomers: number; returningCustomers: number }>;
  getConversionMetrics(sellerId: string): Promise<{ views: number; conversions: number; rate: number }>;
}