// CQRS Commands following Command pattern and Apple's design philosophy
// Simple, focused commands with clear intent

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

export interface UpdateUserProfileCommand {
  userId: number;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface PromoteUserToArtistCommand {
  userId: number;
  displayName: string;
  bio?: string;
  specialties?: string[];
  portfolioUrl?: string;
}

export interface VerifyArtistCommand {
  artistId: number;
}

export interface FollowArtistCommand {
  followerId: number;
  artistId: number;
}

export interface UnfollowArtistCommand {
  followerId: number;
  artistId: number;
}