import { Artist } from '../entities/Artist.js';

export interface IArtistRepository {
  findById(id: number): Promise<Artist | null>;
  findByUserId(userId: number): Promise<Artist | null>;
  save(artist: Artist): Promise<Artist>;
  update(id: number, artist: Partial<Artist>): Promise<Artist | null>;
  findAll(limit?: number, offset?: number): Promise<Artist[]>;
  findFeatured(): Promise<Artist[]>;
  delete(id: number): Promise<boolean>;
}