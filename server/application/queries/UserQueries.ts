// CQRS Queries following Apple's design philosophy - Simple, focused queries
export interface GetUserByIdQuery {
  userId: number;
}

export interface GetUserByEmailQuery {
  email: string;
}

export interface GetUserByUsernameQuery {
  username: string;
}

export interface GetArtistByIdQuery {
  artistId: number;
}

export interface GetArtistByUserIdQuery {
  userId: number;
}

export interface GetFeaturedArtistsQuery {
  limit?: number;
}

export interface GetArtistsQuery {
  limit?: number;
  offset?: number;
  specialties?: string[];
  verified?: boolean;
}

export interface GetArtworkByIdQuery {
  artworkId: number;
}

export interface GetArtworkByArtistQuery {
  artistId: number;
  limit?: number;
  offset?: number;
}

export interface GetTrendingArtworkQuery {
  limit?: number;
}

export interface SearchArtworkQuery {
  query?: string;
  categoryId?: number;
  tags?: string[];
  trending?: boolean;
  artistId?: number;
  limit?: number;
  offset?: number;
}