export interface ArtworkWithArtist {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  tags: string[] | null;
  categoryId: number | null;
  isPublic: boolean | null;
  isTrending: boolean | null;
  viewCount: number | null;
  likeCount: number | null;
  createdAt: Date | null;
  artist: {
    id: number;
    displayName: string;
    isVerified: boolean | null;
  };
}

export interface ProductWithDetails {
  id: number;
  price: string;
  artistMargin: string | null;
  isActive: boolean | null;
  productType: {
    id: number;
    name: string;
    basePrice: string;
    description: string | null;
  };
  artwork: {
    id: number;
    title: string;
    imageUrl: string;
    artist: {
      displayName: string;
    };
  };
}

export interface CartItemWithDetails {
  id: number;
  quantity: number | null;
  product: ProductWithDetails;
}

export interface OrderWithItems {
  id: number;
  totalAmount: string;
  status: string | null;
  shippingAddress: string | null;
  trackingNumber: string | null;
  createdAt: Date | null;
  items: Array<{
    id: number;
    quantity: number;
    price: string;
    product: ProductWithDetails;
  }>;
}

export interface SearchFilters {
  categoryId?: number;
  tags?: string[];
  trending?: boolean;
  artistId?: number;
  query?: string;
}
