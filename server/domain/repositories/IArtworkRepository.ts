import { Artwork } from '../entities/Artwork.js';

export interface SearchFilters {
  categoryId?: number;
  tags?: string[];
  trending?: boolean;
  artistId?: number;
  query?: string;
}

export interface IArtworkRepository {
  findById(id: number): Promise<Artwork | null>;
  findByArtist(artistId: number): Promise<Artwork[]>;
  save(artwork: Artwork): Promise<Artwork>;
  update(id: number, artwork: Partial<Artwork>): Promise<Artwork | null>;
  findAll(filters?: SearchFilters, limit?: number, offset?: number): Promise<Artwork[]>;
  findTrending(): Promise<Artwork[]>;
  incrementViews(id: number): Promise<void>;
  delete(id: number): Promise<boolean>;
}