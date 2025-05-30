// CQRS Queries for reading data
export interface GetUserByIdQuery {
  id: number;
}

export interface GetUserByEmailQuery {
  email: string;
}

export interface GetArtworkListQuery {
  categoryId?: number;
  tags?: string[];
  trending?: boolean;
  artistId?: number;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface GetArtistListQuery {
  limit?: number;
  offset?: number;
  featured?: boolean;
}