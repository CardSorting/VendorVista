import { pgTable, text, serial, integer, boolean, decimal, timestamp, varchar, primaryKey, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// RBAC Tables
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  resource: varchar("resource", { length: 50 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const rolePermissions = pgTable("rolePermissions", {
  roleId: integer("roleId").notNull(),
  permissionId: integer("permissionId").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.roleId, table.permissionId] })
}));

export const userRoles = pgTable("userRoles", {
  userId: varchar("userId").notNull(),
  roleId: integer("roleId").notNull(),
  assignedBy: varchar("assignedBy"),
  assignedAt: timestamp("assignedAt").defaultNow(),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.roleId] })
}));

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  isActive: boolean("isActive").default(true),
  lastLoginAt: timestamp("lastLoginAt"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  userId: varchar("userId").notNull(),
  displayName: varchar("displayName", { length: 100 }).notNull(),
  bio: text("bio"),
  specialties: text("specialties").array(),
  portfolioUrl: text("portfolioUrl"),
  isVerified: boolean("isVerified").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalSales: integer("totalSales").default(0),
  followerCount: integer("followerCount").default(0),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  iconName: varchar("iconName", { length: 50 }),
  colorHex: varchar("colorHex", { length: 7 }),
});

export const artwork = pgTable("artwork", {
  id: serial("id").primaryKey(),
  artistId: integer("artistId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl").notNull(),
  tags: text("tags").array(),
  categoryId: integer("categoryId"),
  isPublic: boolean("isPublic").default(false),
  isTrending: boolean("isTrending").default(false),
  viewCount: integer("viewCount").default(0),
  likeCount: integer("likeCount").default(0),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const productTypes = pgTable("productTypes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  basePrice: decimal("basePrice", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  artworkId: integer("artworkId").notNull(),
  productTypeId: integer("productTypeId").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  artistMargin: decimal("artistMargin", { precision: 5, scale: 2 }).default("70"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const cartItems = pgTable("cartItems", {
  id: serial("id").primaryKey(),
  userId: varchar("userId").notNull(),
  productId: integer("productId").notNull(),
  quantity: integer("quantity").default(1),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("userId").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  shippingAddress: text("shippingAddress"),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const orderItems = pgTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  productId: integer("productId").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: varchar("followerId").notNull(),
  artistId: integer("artistId").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: varchar("userId").notNull(),
  artworkId: integer("artworkId").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: varchar("userId").notNull(),
  productId: integer("productId").notNull(),
  orderId: integer("orderId").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 200 }),
  comment: text("comment"),
  isVerified: boolean("isVerified").default(false), // verified purchase
  isHelpful: integer("isHelpful").default(0), // helpful votes count
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export type UpsertUser = typeof users.$inferInsert;

export const insertArtistSchema = createInsertSchema(artists).omit({
  id: true,
  createdAt: true,
  rating: true,
  totalSales: true,
  followerCount: true,
});

export const insertArtworkSchema = createInsertSchema(artwork).omit({
  id: true,
  createdAt: true,
  viewCount: true,
  likeCount: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isHelpful: true,
});

// RBAC Insert Schemas
export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  createdAt: true,
});

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  assignedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['buyer', 'seller', 'admin']).default('buyer'),
});

// Role and Permission Enums
export const RoleEnum = {
  BUYER: 'buyer',
  SELLER: 'seller', 
  ADMIN: 'admin'
} as const;

export const ResourceEnum = {
  USER: 'user',
  ARTIST: 'artist',
  ARTWORK: 'artwork',
  PRODUCT: 'product',
  ORDER: 'order',
  CART: 'cart',
  REVIEW: 'review',
  ADMIN: 'admin'
} as const;

export const ActionEnum = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage'
} as const;

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Artist = typeof artists.$inferSelect;
export type InsertArtist = z.infer<typeof insertArtistSchema>;
export type Category = typeof categories.$inferSelect;
export type Artwork = typeof artwork.$inferSelect;
export type InsertArtwork = z.infer<typeof insertArtworkSchema>;
export type ProductType = typeof productTypes.$inferSelect;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// RBAC Types
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;

// Auth Types
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

// Domain Types
export type RoleType = typeof RoleEnum[keyof typeof RoleEnum];
export type ResourceType = typeof ResourceEnum[keyof typeof ResourceEnum];
export type ActionType = typeof ActionEnum[keyof typeof ActionEnum];
