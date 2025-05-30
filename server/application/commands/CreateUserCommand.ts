// CQRS Command for creating users
export interface CreateUserCommand {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface CreateArtistCommand {
  userId: number;
  displayName: string;
  bio?: string;
  specialties?: string[];
  portfolioUrl?: string;
}

export interface CreateArtworkCommand {
  title: string;
  artistId: number;
  imageUrl: string;
  description?: string;
  tags?: string[];
  categoryId?: number;
  isPublic?: boolean;
}