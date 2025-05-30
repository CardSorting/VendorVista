// Domain Entity - Artist aggregate root
export class Artist {
  constructor(
    public readonly id: number,
    public readonly userId: number,
    public readonly displayName: string,
    public readonly bio?: string,
    public readonly specialties: string[] = [],
    public readonly portfolioUrl?: string,
    public readonly isVerified: boolean = false,
    public readonly rating: number = 0,
    public readonly totalSales: number = 0,
    public readonly followerCount: number = 0,
    public readonly createdAt: Date = new Date()
  ) {}

  updateProfile(bio: string, portfolioUrl: string, specialties: string[]): Artist {
    return new Artist(
      this.id,
      this.userId,
      this.displayName,
      bio,
      specialties,
      portfolioUrl,
      this.isVerified,
      this.rating,
      this.totalSales,
      this.followerCount,
      this.createdAt
    );
  }

  verify(): Artist {
    return new Artist(
      this.id,
      this.userId,
      this.displayName,
      this.bio,
      this.specialties,
      this.portfolioUrl,
      true,
      this.rating,
      this.totalSales,
      this.followerCount,
      this.createdAt
    );
  }

  incrementSales(amount: number): Artist {
    return new Artist(
      this.id,
      this.userId,
      this.displayName,
      this.bio,
      this.specialties,
      this.portfolioUrl,
      this.isVerified,
      this.rating,
      this.totalSales + amount,
      this.followerCount,
      this.createdAt
    );
  }

  incrementFollowers(): Artist {
    return new Artist(
      this.id,
      this.userId,
      this.displayName,
      this.bio,
      this.specialties,
      this.portfolioUrl,
      this.isVerified,
      this.rating,
      this.totalSales,
      this.followerCount + 1,
      this.createdAt
    );
  }

  decrementFollowers(): Artist {
    return new Artist(
      this.id,
      this.userId,
      this.displayName,
      this.bio,
      this.specialties,
      this.portfolioUrl,
      this.isVerified,
      this.rating,
      this.totalSales,
      Math.max(0, this.followerCount - 1),
      this.createdAt
    );
  }
}