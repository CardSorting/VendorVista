import {
  users, artists, categories, artwork, productTypes, products, cartItems, orders, orderItems, follows, likes, reviews,
  type User, type InsertUser, type Artist, type InsertArtist, type Category, type Artwork, type InsertArtwork,
  type ProductType, type Product, type InsertProduct, type CartItem, type InsertCartItem,
  type Order, type InsertOrder, type OrderItem, type Follow, type Like, type Review, type InsertReview
} from "@shared/schema";

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

  // Review operations
  getReviews(productId: number): Promise<Review[]>;
  getReview(id: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, updates: Partial<Review>): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;
  getUserReview(userId: number, productId: number): Promise<Review | undefined>;
  getProductRating(productId: number): Promise<{ averageRating: number; totalReviews: number }>;
  markReviewHelpful(reviewId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private artists: Map<number, Artist> = new Map();
  private categories: Map<number, Category> = new Map();
  private artwork: Map<number, Artwork> = new Map();
  private productTypes: Map<number, ProductType> = new Map();
  private products: Map<number, Product> = new Map();
  private cartItems: Map<number, CartItem> = new Map();
  private orders: Map<number, Order> = new Map();
  private orderItems: Map<number, OrderItem> = new Map();
  private follows: Map<number, Follow> = new Map();
  private likes: Map<number, Like> = new Map();
  private reviews: Map<number, Review> = new Map();

  private currentUserId = 1;
  private currentArtistId = 1;
  private currentCategoryId = 1;
  private currentArtworkId = 1;
  private currentProductTypeId = 1;
  private currentProductId = 1;
  private currentCartItemId = 1;
  private currentOrderId = 1;
  private currentOrderItemId = 1;
  private currentFollowId = 1;
  private currentLikeId = 1;
  private currentReviewId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize categories
    const categoriesData = [
      { name: "Digital Art", description: "Digital illustrations and graphics", iconName: "palette", colorHex: "#FF6B6B" },
      { name: "Watercolor", description: "Watercolor paintings and illustrations", iconName: "brush", colorHex: "#4ECDC4" },
      { name: "Geometric", description: "Geometric patterns and designs", iconName: "shapes", colorHex: "#45B7D1" },
      { name: "Illustration", description: "Hand-drawn illustrations", iconName: "feather-alt", colorHex: "#9B59B6" },
    ];

    categoriesData.forEach(data => {
      const category: Category = { id: this.currentCategoryId++, ...data };
      this.categories.set(category.id, category);
    });

    // Initialize product types
    const productTypesData = [
      { name: "T-Shirt", basePrice: "25.00", description: "Premium cotton t-shirt" },
      { name: "Poster", basePrice: "15.00", description: "High-quality art print" },
      { name: "Canvas", basePrice: "35.00", description: "Gallery-wrapped canvas" },
      { name: "Sticker", basePrice: "5.00", description: "Waterproof vinyl sticker" },
      { name: "Mug", basePrice: "18.00", description: "Ceramic coffee mug" },
      { name: "Hoodie", basePrice: "45.00", description: "Soft pullover hoodie" },
    ];

    productTypesData.forEach(data => {
      const productType: ProductType = { id: this.currentProductTypeId++, ...data };
      this.productTypes.set(productType.id, productType);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      ...insertUser,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Artist operations
  async getArtist(id: number): Promise<Artist | undefined> {
    return this.artists.get(id);
  }

  async getArtistByUserId(userId: number): Promise<Artist | undefined> {
    return Array.from(this.artists.values()).find(artist => artist.userId === userId);
  }

  async createArtist(insertArtist: InsertArtist): Promise<Artist> {
    const artist: Artist = {
      id: this.currentArtistId++,
      ...insertArtist,
      rating: "0",
      totalSales: 0,
      followerCount: 0,
      createdAt: new Date(),
    };
    this.artists.set(artist.id, artist);
    return artist;
  }

  async updateArtist(id: number, updates: Partial<Artist>): Promise<Artist | undefined> {
    const artist = this.artists.get(id);
    if (!artist) return undefined;
    
    const updatedArtist = { ...artist, ...updates };
    this.artists.set(id, updatedArtist);
    return updatedArtist;
  }

  async getArtists(limit = 20, offset = 0): Promise<Artist[]> {
    return Array.from(this.artists.values()).slice(offset, offset + limit);
  }

  async getFeaturedArtists(): Promise<Artist[]> {
    return Array.from(this.artists.values())
      .sort((a, b) => (b.followerCount || 0) - (a.followerCount || 0))
      .slice(0, 6);
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  // Artwork operations
  async getArtwork(id: number): Promise<Artwork | undefined> {
    return this.artwork.get(id);
  }

  async getArtworkByArtist(artistId: number): Promise<Artwork[]> {
    return Array.from(this.artwork.values()).filter(art => art.artistId === artistId);
  }

  async createArtwork(insertArtwork: InsertArtwork): Promise<Artwork> {
    const artwork: Artwork = {
      id: this.currentArtworkId++,
      ...insertArtwork,
      viewCount: 0,
      likeCount: 0,
      createdAt: new Date(),
    };
    this.artwork.set(artwork.id, artwork);
    return artwork;
  }

  async updateArtwork(id: number, updates: Partial<Artwork>): Promise<Artwork | undefined> {
    const artwork = this.artwork.get(id);
    if (!artwork) return undefined;
    
    const updatedArtwork = { ...artwork, ...updates };
    this.artwork.set(id, updatedArtwork);
    return updatedArtwork;
  }

  async getArtworkList(filters?: { categoryId?: number; tags?: string[]; trending?: boolean }, limit = 20, offset = 0): Promise<Artwork[]> {
    let artworks = Array.from(this.artwork.values()).filter(art => art.isPublic);

    if (filters?.categoryId) {
      artworks = artworks.filter(art => art.categoryId === filters.categoryId);
    }

    if (filters?.tags?.length) {
      artworks = artworks.filter(art => 
        art.tags?.some(tag => filters.tags!.includes(tag))
      );
    }

    if (filters?.trending) {
      artworks = artworks.filter(art => art.isTrending);
    }

    return artworks.slice(offset, offset + limit);
  }

  async getTrendingArtwork(): Promise<Artwork[]> {
    return Array.from(this.artwork.values())
      .filter(art => art.isPublic)
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 8);
  }

  async incrementArtworkViews(id: number): Promise<void> {
    const artwork = this.artwork.get(id);
    if (artwork) {
      artwork.viewCount = (artwork.viewCount || 0) + 1;
      this.artwork.set(id, artwork);
    }
  }

  // Product operations
  async getProductTypes(): Promise<ProductType[]> {
    return Array.from(this.productTypes.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByArtwork(artworkId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.artworkId === artworkId);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const product: Product = {
      id: this.currentProductId++,
      ...insertProduct,
      createdAt: new Date(),
    };
    this.products.set(product.id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.userId === userId);
  }

  async addCartItem(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.userId === insertCartItem.userId && item.productId === insertCartItem.productId
    );

    if (existingItem) {
      existingItem.quantity += insertCartItem.quantity || 1;
      this.cartItems.set(existingItem.id, existingItem);
      return existingItem;
    }

    const cartItem: CartItem = {
      id: this.currentCartItemId++,
      ...insertCartItem,
      createdAt: new Date(),
    };
    this.cartItems.set(cartItem.id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;
    
    item.quantity = quantity;
    this.cartItems.set(id, item);
    return item;
  }

  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<void> {
    const userCartItems = Array.from(this.cartItems.entries()).filter(
      ([_, item]) => item.userId === userId
    );
    userCartItems.forEach(([id]) => this.cartItems.delete(id));
  }

  // Order operations
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const order: Order = {
      id: this.currentOrderId++,
      ...insertOrder,
      createdAt: new Date(),
    };
    this.orders.set(order.id, order);
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    order.status = status;
    this.orders.set(id, order);
    return order;
  }

  async addOrderItem(orderItem: Omit<OrderItem, 'id'>): Promise<OrderItem> {
    const item: OrderItem = {
      id: this.currentOrderItemId++,
      ...orderItem,
    };
    this.orderItems.set(item.id, item);
    return item;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  // Social operations
  async followArtist(followerId: number, artistId: number): Promise<Follow> {
    const follow: Follow = {
      id: this.currentFollowId++,
      followerId,
      artistId,
      createdAt: new Date(),
    };
    this.follows.set(follow.id, follow);

    // Update artist follower count
    const artist = this.artists.get(artistId);
    if (artist) {
      artist.followerCount = (artist.followerCount || 0) + 1;
      this.artists.set(artistId, artist);
    }

    return follow;
  }

  async unfollowArtist(followerId: number, artistId: number): Promise<boolean> {
    const follow = Array.from(this.follows.values()).find(
      f => f.followerId === followerId && f.artistId === artistId
    );
    
    if (follow) {
      this.follows.delete(follow.id);
      
      // Update artist follower count
      const artist = this.artists.get(artistId);
      if (artist && artist.followerCount > 0) {
        artist.followerCount = artist.followerCount - 1;
        this.artists.set(artistId, artist);
      }
      
      return true;
    }
    return false;
  }

  async isFollowing(followerId: number, artistId: number): Promise<boolean> {
    return Array.from(this.follows.values()).some(
      f => f.followerId === followerId && f.artistId === artistId
    );
  }

  async likeArtwork(userId: number, artworkId: number): Promise<Like> {
    const like: Like = {
      id: this.currentLikeId++,
      userId,
      artworkId,
      createdAt: new Date(),
    };
    this.likes.set(like.id, like);

    // Update artwork like count
    const artwork = this.artwork.get(artworkId);
    if (artwork) {
      artwork.likeCount = (artwork.likeCount || 0) + 1;
      this.artwork.set(artworkId, artwork);
    }

    return like;
  }

  async unlikeArtwork(userId: number, artworkId: number): Promise<boolean> {
    const like = Array.from(this.likes.values()).find(
      l => l.userId === userId && l.artworkId === artworkId
    );
    
    if (like) {
      this.likes.delete(like.id);
      
      // Update artwork like count
      const artwork = this.artwork.get(artworkId);
      if (artwork && artwork.likeCount > 0) {
        artwork.likeCount = artwork.likeCount - 1;
        this.artwork.set(artworkId, artwork);
      }
      
      return true;
    }
    return false;
  }

  async isLiked(userId: number, artworkId: number): Promise<boolean> {
    return Array.from(this.likes.values()).some(
      l => l.userId === userId && l.artworkId === artworkId
    );
  }
}

// Database Storage Implementation
import { users, artists, categories, artwork, productTypes, products, cartItems, orders, orderItems, follows, likes, type User, type InsertUser, type Artist, type InsertArtist, type Category, type Artwork, type InsertArtwork, type ProductType, type Product, type InsertProduct, type CartItem, type InsertCartItem, type Order, type InsertOrder, type OrderItem, type Follow, type Like } from "@shared/schema.js";
import { db } from "./db.js";
import { eq, and, desc, asc, sql } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
