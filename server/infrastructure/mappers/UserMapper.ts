// Infrastructure Mappers - Convert between domain entities and persistence models
import { User } from '../../domain/entities/User.js';
import { Artist } from '../../domain/entities/Artist.js';
import { User as UserData, Artist as ArtistData } from '../../../shared/schema.js';

export class UserMapper {
  static toDomain(userData: UserData): User {
    return User.fromPersistence(
      userData.id,
      userData.email,
      userData.username,
      userData.password,
      userData.firstName || undefined,
      userData.lastName || undefined,
      userData.isArtist || false,
      userData.avatarUrl || undefined,
      userData.bio || undefined,
      userData.createdAt || new Date()
    );
  }

  static toPersistence(user: User): Omit<UserData, 'id'> {
    return {
      username: user.username,
      email: user.email,
      password: user.password,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      isArtist: user.isArtist || null,
      avatarUrl: user.avatarUrl || null,
      bio: user.bio || null,
      createdAt: user.createdAt || null
    };
  }
}

export class ArtistMapper {
  static toDomain(artistData: ArtistData): Artist {
    return Artist.fromPersistence(
      artistData.id,
      artistData.userId,
      artistData.displayName,
      artistData.bio || undefined,
      artistData.specialties || [],
      artistData.portfolioUrl || undefined,
      artistData.isVerified || false,
      artistData.rating ? Number(artistData.rating) : undefined,
      artistData.totalSales || 0,
      artistData.followerCount || 0,
      artistData.createdAt || new Date()
    );
  }

  static toPersistence(artist: Artist): Omit<ArtistData, 'id'> {
    return {
      userId: artist.userId,
      displayName: artist.displayName,
      bio: artist.bio || null,
      specialties: artist.specialties || null,
      portfolioUrl: artist.portfolioUrl || null,
      isVerified: artist.isVerified || null,
      rating: artist.rating?.toString() || null,
      totalSales: artist.totalSales || null,
      followerCount: artist.followerCount || null,
      createdAt: artist.createdAt || null
    };
  }
}