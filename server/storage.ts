import {
  users, artists, categories, artwork, productTypes, products, cartItems, orders, orderItems, follows, likes,
  type User, type InsertUser, type Artist, type InsertArtist, type Category, type Artwork, type InsertArtwork,
  type ProductType, type Product, type InsertProduct, type CartItem, type InsertCartItem,
  type Order, type InsertOrder, type OrderItem, type Follow, type Like
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

export const storage = new MemStorage();
