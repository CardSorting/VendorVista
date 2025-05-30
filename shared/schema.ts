import { pgTable, text, serial, integer, boolean, decimal, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("firstName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }),
  isArtist: boolean("isArtist").default(false),
  avatarUrl: text("avatarUrl"),
  bio: text("bio"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
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
  userId: integer("userId").notNull(),
  productId: integer("productId").notNull(),
  quantity: integer("quantity").default(1),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
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
  followerId: integer("followerId").notNull(),
  artistId: integer("artistId").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  artworkId: integer("artworkId").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

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
  isArtist: z.boolean().default(false),
});

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
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
