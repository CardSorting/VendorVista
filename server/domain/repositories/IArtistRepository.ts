import { Artist } from '../entities/Artist.js';

// Repository interface following Repository pattern and SOLID principles
export interface IArtistRepository {
  findById(id: number): Promise<Artist | null>;
  findByUserId(userId: number): Promise<Artist | null>;
  save(artist: Artist): Promise<Artist>;
  update(id: number, artist: Partial<Artist>): Promise<Artist | null>;
  delete(id: number): Promise<boolean>;
  findAll(limit?: number, offset?: number): Promise<Artist[]>;
  getFeatured(limit?: number): Promise<Artist[]>;
  findBySpecialty(specialty: string, limit?: number, offset?: number): Promise<Artist[]>;
  findVerified(limit?: number, offset?: number): Promise<Artist[]>;
}