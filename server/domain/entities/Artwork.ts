// Domain Entity - Artwork aggregate root
export class Artwork {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly artistId: number,
    public readonly imageUrl: string,
    public readonly description?: string,
    public readonly tags: string[] = [],
    public readonly categoryId?: number,
    public readonly isPublic: boolean = true,
    public readonly isTrending: boolean = false,
    public readonly viewCount: number = 0,
    public readonly likeCount: number = 0,
    public readonly createdAt: Date = new Date()
  ) {}

  updateContent(title: string, description?: string, tags?: string[]): Artwork {
    return new Artwork(
      this.id,
      title,
      this.artistId,
      this.imageUrl,
      description,
      tags || this.tags,
      this.categoryId,
      this.isPublic,
      this.isTrending,
      this.viewCount,
      this.likeCount,
      this.createdAt
    );
  }

  publish(): Artwork {
    return new Artwork(
      this.id,
      this.title,
      this.artistId,
      this.imageUrl,
      this.description,
      this.tags,
      this.categoryId,
      true,
      this.isTrending,
      this.viewCount,
      this.likeCount,
      this.createdAt
    );
  }

  unpublish(): Artwork {
    return new Artwork(
      this.id,
      this.title,
      this.artistId,
      this.imageUrl,
      this.description,
      this.tags,
      this.categoryId,
      false,
      this.isTrending,
      this.viewCount,
      this.likeCount,
      this.createdAt
    );
  }

  markAsTrending(): Artwork {
    return new Artwork(
      this.id,
      this.title,
      this.artistId,
      this.imageUrl,
      this.description,
      this.tags,
      this.categoryId,
      this.isPublic,
      true,
      this.viewCount,
      this.likeCount,
      this.createdAt
    );
  }

  incrementViews(): Artwork {
    return new Artwork(
      this.id,
      this.title,
      this.artistId,
      this.imageUrl,
      this.description,
      this.tags,
      this.categoryId,
      this.isPublic,
      this.isTrending,
      this.viewCount + 1,
      this.likeCount,
      this.createdAt
    );
  }

  incrementLikes(): Artwork {
    return new Artwork(
      this.id,
      this.title,
      this.artistId,
      this.imageUrl,
      this.description,
      this.tags,
      this.categoryId,
      this.isPublic,
      this.isTrending,
      this.viewCount,
      this.likeCount + 1,
      this.createdAt
    );
  }

  decrementLikes(): Artwork {
    return new Artwork(
      this.id,
      this.title,
      this.artistId,
      this.imageUrl,
      this.description,
      this.tags,
      this.categoryId,
      this.isPublic,
      this.isTrending,
      this.viewCount,
      Math.max(0, this.likeCount - 1),
      this.createdAt
    );
  }
}