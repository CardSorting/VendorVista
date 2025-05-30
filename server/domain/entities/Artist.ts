// Artist Domain Entity - Following DDD and SOLID principles
import { Entity } from '../common/Entity.js';
import { Rating } from '../common/ValueObjects.js';
import { ArtistCreatedEvent, ArtistVerifiedEvent, ArtistFollowedEvent } from '../events/ArtistEvents.js';

export class Artist extends Entity<number> {
  private _userId: number;
  private _displayName: string;
  private _bio?: string;
  private _portfolioUrl?: string;
  private _isVerified: boolean;
  private _rating?: Rating;
  private _followerCount: number;
  private _totalSales: number;
  private _specialties: string[];
  private readonly _createdAt: Date;

  private constructor(
    id: number,
    userId: number,
    displayName: string,
    bio?: string,
    specialties: string[] = [],
    portfolioUrl?: string,
    isVerified: boolean = false,
    rating?: Rating,
    totalSales: number = 0,
    followerCount: number = 0,
    createdAt: Date = new Date()
  ) {
    super(id);
    this._userId = userId;
    this._displayName = displayName;
    this._bio = bio;
    this._portfolioUrl = portfolioUrl;
    this._isVerified = isVerified;
    this._rating = rating;
    this._followerCount = followerCount;
    this._totalSales = totalSales;
    this._specialties = specialties;
    this._createdAt = createdAt;
  }

  // Factory method for creating new artists
  static create(
    id: number,
    userId: number,
    displayName: string,
    bio?: string,
    specialties: string[] = [],
    portfolioUrl?: string
  ): Artist {
    if (!displayName || displayName.trim().length === 0) {
      throw new Error('Display name is required');
    }

    const artist = new Artist(id, userId, displayName.trim(), bio, specialties, portfolioUrl);
    artist.addDomainEvent(new ArtistCreatedEvent(id, userId, displayName));
    
    return artist;
  }

  // Factory method for reconstructing artists from persistence
  static fromPersistence(
    id: number,
    userId: number,
    displayName: string,
    bio?: string,
    specialties: string[] = [],
    portfolioUrl?: string,
    isVerified: boolean = false,
    ratingValue?: number,
    totalSales: number = 0,
    followerCount: number = 0,
    createdAt: Date = new Date()
  ): Artist {
    const rating = ratingValue ? new Rating(ratingValue) : undefined;
    return new Artist(id, userId, displayName, bio, specialties, portfolioUrl, isVerified, rating, totalSales, followerCount, createdAt);
  }

  // Getters
  get userId(): number {
    return this._userId;
  }

  get displayName(): string {
    return this._displayName;
  }

  get bio(): string | undefined {
    return this._bio;
  }

  get portfolioUrl(): string | undefined {
    return this._portfolioUrl;
  }

  get isVerified(): boolean {
    return this._isVerified;
  }

  get rating(): number | undefined {
    return this._rating?.value;
  }

  get followerCount(): number {
    return this._followerCount;
  }

  get totalSales(): number {
    return this._totalSales;
  }

  get specialties(): string[] {
    return [...this._specialties];
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  // Business methods
  updateProfile(bio?: string, portfolioUrl?: string, specialties?: string[]): void {
    if (bio !== undefined) {
      this._bio = bio;
    }
    if (portfolioUrl !== undefined) {
      this._portfolioUrl = portfolioUrl;
    }
    if (specialties !== undefined) {
      this._specialties = [...specialties];
    }
  }

  verify(): void {
    if (this._isVerified) {
      throw new Error('Artist is already verified');
    }
    
    this._isVerified = true;
    this.addDomainEvent(new ArtistVerifiedEvent(this.id));
  }

  incrementFollowers(followerId: number): void {
    this._followerCount += 1;
    this.addDomainEvent(new ArtistFollowedEvent(this.id, followerId));
  }

  decrementFollowers(): void {
    if (this._followerCount > 0) {
      this._followerCount -= 1;
    }
  }

  incrementSales(amount: number): void {
    if (amount < 0) {
      throw new Error('Sale amount cannot be negative');
    }
    this._totalSales += amount;
  }

  updateRating(newRatingValue: number): void {
    this._rating = new Rating(newRatingValue);
  }

  hasSpecialty(specialty: string): boolean {
    return this._specialties.includes(specialty);
  }

  addSpecialty(specialty: string): void {
    if (!this.hasSpecialty(specialty)) {
      this._specialties.push(specialty);
    }
  }

  removeSpecialty(specialty: string): void {
    this._specialties = this._specialties.filter(s => s !== specialty);
  }
}