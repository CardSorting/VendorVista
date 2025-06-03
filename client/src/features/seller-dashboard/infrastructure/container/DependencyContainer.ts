/**
 * Dependency Injection Container - Clean Architecture implementation
 * Follows SOLID principles with proper dependency management
 */

import { ISellerRepository, ISellerAnalyticsRepository } from '../../domain/repositories/ISellerRepository';
import { ApiSellerRepository, ApiSellerAnalyticsRepository } from '../adapters/ApiSellerRepository';
import { GetSellerDashboardHandler } from '../../application/handlers/GetSellerDashboardHandler';

export class DependencyContainer {
  private static instance: DependencyContainer;
  private repositories: Map<string, any> = new Map();
  private handlers: Map<string, any> = new Map();

  private constructor() {
    this.setupRepositories();
    this.setupHandlers();
  }

  static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  private setupRepositories(): void {
    this.repositories.set('ISellerRepository', new ApiSellerRepository());
    this.repositories.set('ISellerAnalyticsRepository', new ApiSellerAnalyticsRepository());
  }

  private setupHandlers(): void {
    const sellerRepository = this.getRepository<ISellerRepository>('ISellerRepository');
    const analyticsRepository = this.getRepository<ISellerAnalyticsRepository>('ISellerAnalyticsRepository');
    
    this.handlers.set(
      'GetSellerDashboardHandler',
      new GetSellerDashboardHandler(sellerRepository, analyticsRepository)
    );
  }

  getRepository<T>(name: string): T {
    const repository = this.repositories.get(name);
    if (!repository) {
      throw new Error(`Repository ${name} not found`);
    }
    return repository as T;
  }

  getHandler<T>(name: string): T {
    const handler = this.handlers.get(name);
    if (!handler) {
      throw new Error(`Handler ${name} not found`);
    }
    return handler as T;
  }
}

// Factory function for easy access
export function createSellerDashboardHandler(): GetSellerDashboardHandler {
  const container = DependencyContainer.getInstance();
  return container.getHandler<GetSellerDashboardHandler>('GetSellerDashboardHandler');
}