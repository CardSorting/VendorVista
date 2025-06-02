import { users, artists, categories, artwork, productTypes, products, cartItems, orders, orderItems, follows, likes, reviews, roles, permissions, rolePermissions, userRoles, type User, type InsertUser, type UpsertUser, type Artist, type InsertArtist, type Category, type Artwork, type InsertArtwork, type ProductType, type Product, type InsertProduct, type CartItem, type InsertCartItem, type Order, type InsertOrder, type OrderItem, type Follow, type Like, type Review, type InsertReview, type Role, type InsertRole, type Permission, type InsertPermission, type RoleType } from "@shared/schema.js";
import { db } from "./db.js";
import { eq, and, desc, asc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // RBAC operations
  getUserRoles(userId: string): Promise<RoleType[]>;
  assignUserRole(userId: string, roleName: string): Promise<void>;
  removeUserRole(userId: string, roleName: string): Promise<void>;
  hasRole(userId: string, roleName: string): Promise<boolean>;
  createRole(role: InsertRole): Promise<Role>;
  getRoles(): Promise<Role[]>;
  createPermission(permission: InsertPermission): Promise<Permission>;
  getPermissions(): Promise<Permission[]>;
  getRolePermissions(roleId: number): Promise<Permission[]>;

  // Artist operations
  getArtist(id: number): Promise<Artist | undefined>;
  getArtistByUserId(userId: string): Promise<Artist | undefined>;
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
  getCartItems(userId: string): Promise<CartItem[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(userId: string): Promise<void>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  addOrderItem(orderItem: Omit<OrderItem, 'id'>): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;

  // Social operations
  followArtist(followerId: string, artistId: number): Promise<Follow>;
  unfollowArtist(followerId: string, artistId: number): Promise<boolean>;
  isFollowing(followerId: string, artistId: number): Promise<boolean>;
  likeArtwork(userId: string, artworkId: number): Promise<Like>;
  unlikeArtwork(userId: string, artworkId: number): Promise<boolean>;
  isLiked(userId: string, artworkId: number): Promise<boolean>;

  // Review operations
  getReviews(productId: number): Promise<Review[]>;
  getReview(id: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, updates: Partial<Review>): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;
  getUserReview(userId: string, productId: number): Promise<Review | undefined>;
  getProductRating(productId: number): Promise<{ averageRating: number; totalReviews: number }>;
  markReviewHelpful(reviewId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Username field doesn't exist in current schema
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Artist operations
  async getArtist(id: number): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.id, id));
    return artist;
  }

  async getArtistByUserId(userId: string): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.userId, userId));
    return artist;
  }

  async createArtist(insertArtist: InsertArtist): Promise<Artist> {
    const [artist] = await db
      .insert(artists)
      .values(insertArtist)
      .returning();
    return artist;
  }

  async updateArtist(id: number, updates: Partial<Artist>): Promise<Artist | undefined> {
    const [artist] = await db
      .update(artists)
      .set({ ...updates })
      .where(eq(artists.id, id))
      .returning();
    return artist;
  }

  async getArtists(limit = 20, offset = 0): Promise<Artist[]> {
    return await db.select().from(artists).limit(limit).offset(offset);
  }

  async getFeaturedArtists(): Promise<Artist[]> {
    return await db.select().from(artists).where(eq(artists.isVerified, true)).limit(6);
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  // Artwork operations
  async getArtwork(id: number): Promise<Artwork | undefined> {
    const [artworkItem] = await db.select().from(artwork).where(eq(artwork.id, id));
    return artworkItem;
  }

  async getArtworkByArtist(artistId: number): Promise<Artwork[]> {
    return await db.select().from(artwork).where(eq(artwork.artistId, artistId));
  }

  async createArtwork(insertArtwork: InsertArtwork): Promise<Artwork> {
    const [artworkItem] = await db
      .insert(artwork)
      .values(insertArtwork)
      .returning();
    return artworkItem;
  }

  async updateArtwork(id: number, updates: Partial<Artwork>): Promise<Artwork | undefined> {
    const [artworkItem] = await db
      .update(artwork)
      .set(updates)
      .where(eq(artwork.id, id))
      .returning();
    return artworkItem;
  }

  async getArtworkList(filters?: { categoryId?: number; tags?: string[]; trending?: boolean }, limit = 20, offset = 0): Promise<Artwork[]> {
    let query = db.select().from(artwork);
    
    if (filters?.categoryId) {
      query = query.where(eq(artwork.categoryId, filters.categoryId));
    }
    
    if (filters?.trending) {
      query = query.where(eq(artwork.isTrending, true));
    }
    
    return await query.limit(limit).offset(offset);
  }

  async getTrendingArtwork(): Promise<Artwork[]> {
    return await db.select().from(artwork).where(eq(artwork.isTrending, true)).limit(10);
  }

  async incrementArtworkViews(id: number): Promise<void> {
    // Views increment logic would go here if viewCount field exists
  }

  // Product operations
  async getProductTypes(): Promise<ProductType[]> {
    return await db.select().from(productTypes);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsByArtwork(artworkId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.artworkId, artworkId));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  // Cart operations
  async getCartItems(userId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async addCartItem(insertCartItem: InsertCartItem): Promise<CartItem> {
    const [cartItem] = await db
      .insert(cartItems)
      .values(insertCartItem)
      .returning();
    return cartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [cartItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return cartItem;
  }

  async removeCartItem(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async addOrderItem(orderItem: Omit<OrderItem, 'id'>): Promise<OrderItem> {
    const [item] = await db
      .insert(orderItems)
      .values(orderItem)
      .returning();
    return item;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  // Social operations
  async followArtist(followerId: string, artistId: number): Promise<Follow> {
    const [follow] = await db
      .insert(follows)
      .values({ followerId, artistId })
      .returning();
    return follow;
  }

  async unfollowArtist(followerId: string, artistId: number): Promise<boolean> {
    const result = await db
      .delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.artistId, artistId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async isFollowing(followerId: string, artistId: number): Promise<boolean> {
    const [follow] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.artistId, artistId)));
    return !!follow;
  }

  async likeArtwork(userId: string, artworkId: number): Promise<Like> {
    const [like] = await db
      .insert(likes)
      .values({ userId, artworkId })
      .returning();
    return like;
  }

  async unlikeArtwork(userId: string, artworkId: number): Promise<boolean> {
    const result = await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.artworkId, artworkId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async isLiked(userId: string, artworkId: number): Promise<boolean> {
    const [like] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.artworkId, artworkId)));
    return !!like;
  }

  // Review operations
  async getReviews(productId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.productId, productId));
  }

  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    return review;
  }

  async updateReview(id: number, updates: Partial<Review>): Promise<Review | undefined> {
    const [review] = await db
      .update(reviews)
      .set(updates)
      .where(eq(reviews.id, id))
      .returning();
    return review;
  }

  async deleteReview(id: number): Promise<boolean> {
    const result = await db.delete(reviews).where(eq(reviews.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getUserReview(userId: string, productId: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.productId, productId)));
    return review;
  }

  async getProductRating(productId: number): Promise<{ averageRating: number; totalReviews: number }> {
    const result = await db
      .select({
        averageRating: sql<number>`AVG(${reviews.rating})`,
        totalReviews: sql<number>`COUNT(${reviews.id})`
      })
      .from(reviews)
      .where(eq(reviews.productId, productId));
    
    const data = result[0];
    return {
      averageRating: data?.averageRating || 0,
      totalReviews: data?.totalReviews || 0
    };
  }

  async markReviewHelpful(reviewId: number): Promise<void> {
    await db
      .update(reviews)
      .set({ helpfulCount: sql`${reviews.helpfulCount} + 1` })
      .where(eq(reviews.id, reviewId));
  }

  // RBAC operations
  async getUserRoles(userId: string): Promise<RoleType[]> {
    const userRoleRecords = await db
      .select({ name: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));
    
    return userRoleRecords.map(record => record.name as RoleType);
  }

  async assignUserRole(userId: string, roleName: string): Promise<void> {
    const [role] = await db.select().from(roles).where(eq(roles.name, roleName));
    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }

    await db
      .insert(userRoles)
      .values({
        userId,
        roleId: role.id,
      })
      .onConflictDoNothing();
  }

  async removeUserRole(userId: string, roleName: string): Promise<void> {
    const [role] = await db.select().from(roles).where(eq(roles.name, roleName));
    if (!role) return;

    await db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, role.id)));
  }

  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const userRoleRecords = await db
      .select()
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(eq(userRoles.userId, userId), eq(roles.name, roleName)));
    
    return userRoleRecords.length > 0;
  }

  async createRole(role: InsertRole): Promise<Role> {
    const [newRole] = await db
      .insert(roles)
      .values(role)
      .returning();
    return newRole;
  }

  async getRoles(): Promise<Role[]> {
    return await db.select().from(roles);
  }

  async createPermission(permission: InsertPermission): Promise<Permission> {
    const [newPermission] = await db
      .insert(permissions)
      .values(permission)
      .returning();
    return newPermission;
  }

  async getPermissions(): Promise<Permission[]> {
    return await db.select().from(permissions);
  }

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const rolePermissionRecords = await db
      .select({ 
        id: permissions.id,
        resource: permissions.resource,
        action: permissions.action,
        description: permissions.description,
        createdAt: permissions.createdAt
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));
    
    return rolePermissionRecords;
  }
}

export const storage = new DatabaseStorage();