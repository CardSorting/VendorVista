/**
 * Seller Profile Entity - Core domain entity representing a seller's business profile
 * Follows Apple's design philosophy: Simple, focused, and purposeful
 */

import { UserId } from '../value-objects/UserId';
import { Money } from '../value-objects/Money';
import { ProfileStatus } from '../value-objects/ProfileStatus';

export class SellerProfile {
  constructor(
    public readonly id: string,
    public readonly userId: UserId,
    public readonly displayName: string,
    public readonly businessName: string,
    public readonly status: ProfileStatus,
    public readonly totalRevenue: Money,
    public readonly joinedAt: Date,
    public readonly lastActiveAt: Date,
    public readonly verificationLevel: 'unverified' | 'basic' | 'premium',
    public readonly description?: string,
    public readonly avatarUrl?: string,
    public readonly websiteUrl?: string
  ) {}

  get isActive(): boolean {
    return this.status.isActive;
  }

  get isVerified(): boolean {
    return this.verificationLevel !== 'unverified';
  }

  get daysSinceJoined(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.joinedAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  updateLastActive(): SellerProfile {
    return new SellerProfile(
      this.id,
      this.userId,
      this.displayName,
      this.businessName,
      this.status,
      this.totalRevenue,
      this.joinedAt,
      new Date(),
      this.verificationLevel,
      this.description,
      this.avatarUrl,
      this.websiteUrl
    );
  }

  static create(params: {
    id: string;
    userId: string;
    displayName: string;
    businessName: string;
    description?: string;
  }): SellerProfile {
    return new SellerProfile(
      params.id,
      new UserId(params.userId),
      params.displayName,
      params.businessName,
      ProfileStatus.active(),
      Money.zero('USD'),
      new Date(),
      new Date(),
      'unverified',
      params.description
    );
  }
}