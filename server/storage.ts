import { users, artists, categories, artwork, productTypes, products, cartItems, orders, orderItems, follows, likes, type User, type InsertUser, type Artist, type InsertArtist, type Category, type Artwork, type InsertArtwork, type ProductType, type Product, type InsertProduct, type CartItem, type InsertCartItem, type Order, type InsertOrder, type OrderItem, type Follow, type Like } from "@shared/schema.js";
import { db } from "./db.js";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Artist operations
  getArtist(id: number): Promise<Artist | undefined>;
  getArtistByUserId(userId: number): Promise<Artist | undefined>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  updateArtist(id: number, updates: Partial<Artist>): Promise<Artist | undefined>;
  getArtists(limit?: number, offset?: number): Promise<Artist[]>;
  getFeaturedArtists(): Promise<Artist[]>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;

  // Artwork operations
  getArtwork(id: number): Promise<Artwork | undefined>;
  getArtworkByArtist(artistId: number): Promise<Artwork[]>;
  createArtwork(artwork: InsertArtwork): Promise<Artwork>;
  updateArtwork(id: number, updates: Partial<Artwork>): Promise<Artwork | undefined>;
  getArtworkList(filters?: { categoryId?: number; tags?: string[]; trending?: boolean }, limit?: number, offset?: number): Promise<Artwork[]>;
  getTrendingArtwork(): Promise<Artwork[]>;
  incrementArtworkViews(id: number): Promise<void>;

  // Product operations
  getProductTypes(): Promise<ProductType[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByArtwork(artworkId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined>;

  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<void>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  addOrderItem(orderItem: Omit<OrderItem, 'id'>): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;

  // Social operations
  followArtist(followerId: number, artistId: number): Promise<Follow>;
  unfollowArtist(followerId: number, artistId: number): Promise<boolean>;
  isFollowing(followerId: number, artistId: number): Promise<boolean>;
  likeArtwork(userId: number, artworkId: number): Promise<Like>;
  unlikeArtwork(userId: number, artworkId: number): Promise<boolean>;
  isLiked(userId: number, artworkId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        firstName: insertUser.firstName || null,
        lastName: insertUser.lastName || null,
        isArtist: insertUser.isArtist || null,
        avatarUrl: insertUser.avatarUrl || null,
        bio: insertUser.bio || null
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Artist operations
  async getArtist(id: number): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.id, id));
    return artist || undefined;
  }

  async getArtistByUserId(userId: number): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.userId, userId));
    return artist || undefined;
  }

  async createArtist(insertArtist: InsertArtist): Promise<Artist> {
    const [artist] = await db
      .insert(artists)
      .values({
        ...insertArtist,
        bio: insertArtist.bio || null,
        specialties: insertArtist.specialties || null,
        portfolioUrl: insertArtist.portfolioUrl || null,
        isVerified: insertArtist.isVerified || null,
        rating: insertArtist.rating || null,
        totalSales: insertArtist.totalSales || null,
        followerCount: insertArtist.followerCount || null
      })
      .returning();
    return artist;
  }

  async updateArtist(id: number, updates: Partial<Artist>): Promise<Artist | undefined> {
    const [artist] = await db
      .update(artists)
      .set(updates)
      .where(eq(artists.id, id))
      .returning();
    return artist || undefined;
  }

  async getArtists(limit = 20, offset = 0): Promise<Artist[]> {
    return await db
      .select()
      .from(artists)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(artists.createdAt));
  }

  async getFeaturedArtists(): Promise<Artist[]> {
    return await db
      .select()
      .from(artists)
      .where(eq(artists.isVerified, true))
      .orderBy(desc(artists.followerCount))
      .limit(10);
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  // Artwork operations
  async getArtwork(id: number): Promise<Artwork | undefined> {
    const [work] = await db.select().from(artwork).where(eq(artwork.id, id));
    return work || undefined;
  }

  async getArtworkByArtist(artistId: number): Promise<Artwork[]> {
    return await db
      .select()
      .from(artwork)
      .where(eq(artwork.artistId, artistId))
      .orderBy(desc(artwork.createdAt));
  }

  async createArtwork(insertArtwork: InsertArtwork): Promise<Artwork> {
    const [work] = await db
      .insert(artwork)
      .values({
        ...insertArtwork,
        description: insertArtwork.description || null,
        tags: insertArtwork.tags || null,
        categoryId: insertArtwork.categoryId || null,
        isPublic: insertArtwork.isPublic || null,
        isTrending: insertArtwork.isTrending || null,
        viewCount: insertArtwork.viewCount || null,
        likeCount: insertArtwork.likeCount || null
      })
      .returning();
    return work;
  }

  async updateArtwork(id: number, updates: Partial<Artwork>): Promise<Artwork | undefined> {
    const [work] = await db
      .update(artwork)
      .set(updates)
      .where(eq(artwork.id, id))
      .returning();
    return work || undefined;
  }

  async getArtworkList(filters?: { categoryId?: number; tags?: string[]; trending?: boolean }, limit = 20, offset = 0): Promise<Artwork[]> {
    let query = db.select().from(artwork);
    
    if (filters?.categoryId) {
      query = query.where(eq(artwork.categoryId, filters.categoryId)) as any;
    }
    
    if (filters?.trending) {
      query = query.where(eq(artwork.isTrending, true)) as any;
    }

    return query.limit(limit).offset(offset).orderBy(desc(artwork.createdAt)) as Promise<Artwork[]>;
  }

  async getTrendingArtwork(): Promise<Artwork[]> {
    return await db
      .select()
      .from(artwork)
      .where(eq(artwork.isTrending, true))
      .orderBy(desc(artwork.viewCount))
      .limit(10);
  }

  async incrementArtworkViews(id: number): Promise<void> {
    await db
      .update(artwork)
      .set({ viewCount: sql`${artwork.viewCount} + 1` })
      .where(eq(artwork.id, id));
  }

  // Product operations
  async getProductTypes(): Promise<ProductType[]> {
    return await db.select().from(productTypes).orderBy(asc(productTypes.name));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductsByArtwork(artworkId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.artworkId, artworkId))
      .orderBy(asc(products.price));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values({
        ...insertProduct,
        artistMargin: insertProduct.artistMargin || null,
        isActive: insertProduct.isActive || null
      })
      .returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.userId, userId))
      .orderBy(desc(cartItems.createdAt));
  }

  async addCartItem(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(
        eq(cartItems.userId, insertCartItem.userId),
        eq(cartItems.productId, insertCartItem.productId)
      ));

    if (existingItem) {
      // Update quantity
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: (existingItem.quantity || 0) + (insertCartItem.quantity || 1) })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updated;
    }

    const [item] = await db
      .insert(cartItems)
      .values({
        ...insertCartItem,
        quantity: insertCartItem.quantity || null
      })
      .returning();
    return item;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [item] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return item || undefined;
  }

  async removeCartItem(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values({
        ...insertOrder,
        status: insertOrder.status || null,
        shippingAddress: insertOrder.shippingAddress || null,
        trackingNumber: insertOrder.trackingNumber || null
      })
      .returning();
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  async addOrderItem(orderItem: Omit<OrderItem, 'id'>): Promise<OrderItem> {
    const [item] = await db
      .insert(orderItems)
      .values(orderItem)
      .returning();
    return item;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  // Social operations
  async followArtist(followerId: number, artistId: number): Promise<Follow> {
    // Check if already following
    const [existing] = await db
      .select()
      .from(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.artistId, artistId)
      ));

    if (existing) {
      return existing;
    }

    const [follow] = await db
      .insert(follows)
      .values({ followerId, artistId })
      .returning();

    // Update artist follower count
    const artist = await this.getArtist(artistId);
    if (artist) {
      await db
        .update(artists)
        .set({ followerCount: (artist.followerCount || 0) + 1 })
        .where(eq(artists.id, artistId));
    }

    return follow;
  }

  async unfollowArtist(followerId: number, artistId: number): Promise<boolean> {
    const result = await db
      .delete(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.artistId, artistId)
      ));

    if (result.rowCount && result.rowCount > 0) {
      // Update artist follower count
      const artist = await this.getArtist(artistId);
      if (artist && (artist.followerCount || 0) > 0) {
        await db
          .update(artists)
          .set({ followerCount: (artist.followerCount || 0) - 1 })
          .where(eq(artists.id, artistId));
      }
      return true;
    }

    return false;
  }

  async isFollowing(followerId: number, artistId: number): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.artistId, artistId)
      ));
    return !!follow;
  }

  async likeArtwork(userId: number, artworkId: number): Promise<Like> {
    // Check if already liked
    const [existing] = await db
      .select()
      .from(likes)
      .where(and(
        eq(likes.userId, userId),
        eq(likes.artworkId, artworkId)
      ));

    if (existing) {
      return existing;
    }

    const [like] = await db
      .insert(likes)
      .values({ userId, artworkId })
      .returning();

    // Update artwork like count
    const work = await this.getArtwork(artworkId);
    if (work) {
      await db
        .update(artwork)
        .set({ likeCount: (work.likeCount || 0) + 1 })
        .where(eq(artwork.id, artworkId));
    }

    return like;
  }

  async unlikeArtwork(userId: number, artworkId: number): Promise<boolean> {
    const result = await db
      .delete(likes)
      .where(and(
        eq(likes.userId, userId),
        eq(likes.artworkId, artworkId)
      ));

    if (result.rowCount && result.rowCount > 0) {
      // Update artwork like count
      const work = await this.getArtwork(artworkId);
      if (work && (work.likeCount || 0) > 0) {
        await db
          .update(artwork)
          .set({ likeCount: (work.likeCount || 0) - 1 })
          .where(eq(artwork.id, artworkId));
      }
      return true;
    }

    return false;
  }

  async isLiked(userId: number, artworkId: number): Promise<boolean> {
    const [like] = await db
      .select()
      .from(likes)
      .where(and(
        eq(likes.userId, userId),
        eq(likes.artworkId, artworkId)
      ));
    return !!like;
  }

  // Product-focused query methods following CQRS pattern
  async getAllProductsWithDetails(): Promise<any[]> {
    const results = await db
      .select()
      .from(products)
      .leftJoin(artwork, eq(products.artworkId, artwork.id))
      .leftJoin(artists, eq(artwork.artistId, artists.id))
      .leftJoin(categories, eq(artwork.categoryId, categories.id))
      .leftJoin(productTypes, eq(products.productTypeId, productTypes.id))
      .where(eq(products.isActive, true));
    
    // Transform the flat results into nested objects
    return results.map((row: any) => ({
      id: row.products.id,
      artworkId: row.products.artworkId,
      productTypeId: row.products.productTypeId,
      price: row.products.price,
      isActive: row.products.isActive,
      artwork: {
        id: row.artwork.id,
        title: row.artwork.title,
        imageUrl: row.artwork.imageUrl,
        description: row.artwork.description,
        tags: row.artwork.tags,
        categoryId: row.artwork.categoryId,
        isTrending: row.artwork.isTrending,
        artist: {
          id: row.artists.id,
          displayName: row.artists.displayName,
          isVerified: row.artists.isVerified,
        },
        category: row.categories ? {
          id: row.categories.id,
          name: row.categories.name,
        } : null
      },
      productType: {
        id: row.product_types.id,
        name: row.product_types.name,
        description: row.product_types.description,
        basePrice: row.product_types.basePrice,
      }
    }));
  }
}

export const storage = new DatabaseStorage();