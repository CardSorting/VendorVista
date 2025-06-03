import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-replit";
import { insertUserSchema, registerSchema, loginSchema, insertArtistSchema, insertArtworkSchema, insertProductSchema, insertCartItemSchema, insertReviewSchema, products, users as usersTable } from "@shared/schema";
import { z } from "zod";
import { registerProductRoutes } from "./routes-product";
import { registerRBACDemoRoutes } from "./routes-rbac-demo";
import { setupAuth, isAuthenticated, requireAdmin, requireSeller } from "./replitAuth";
import { seedRBAC } from "./seed-rbac";
import { db } from "./db";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize RBAC system
  await seedRBAC();
  
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user roles for RBAC
      const roles = await storage.getUserRoles(userId);
      const userWithRoles = {
        ...user,
        roles: roles
      };
      
      res.json(userWithRoles);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      // Get all users with their roles
      const allUsers = await db.select({
        id: usersTable.id,
        email: usersTable.email,
        username: usersTable.username,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        createdAt: usersTable.createdAt
      }).from(usersTable);

      const usersWithRoles = await Promise.all(
        allUsers.map(async (user) => {
          const roles = await storage.getUserRoles(user.id);
          return { ...user, roles };
        })
      );

      res.json(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/users/:userId/roles', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!['admin', 'seller', 'buyer'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      await storage.assignUserRole(userId, role);
      res.json({ message: "Role assigned successfully" });
    } catch (error) {
      console.error("Error assigning role:", error);
      res.status(500).json({ message: "Failed to assign role" });
    }
  });

  app.delete('/api/admin/users/:userId/roles/:role', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { userId, role } = req.params;
      await storage.removeUserRole(userId, role);
      res.json({ message: "Role removed successfully" });
    } catch (error) {
      console.error("Error removing role:", error);
      res.status(500).json({ message: "Failed to remove role" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Artist routes 
  app.post("/api/artists", isAuthenticated, async (req, res) => {
    try {
      const data = insertArtistSchema.parse(req.body);
      const artist = await storage.createArtist(data);
      
      res.json(artist);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create artist profile" });
    }
  });

  app.get("/api/artists", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const artists = await storage.getArtists(limit, offset);
      res.json(artists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch artists" });
    }
  });

  app.get("/api/artists/featured", async (req, res) => {
    try {
      const artists = await storage.getFeaturedArtists();
      res.json(artists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured artists" });
    }
  });

  app.get("/api/artists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artist = await storage.getArtist(id);
      if (!artist) {
        return res.status(404).json({ message: "Artist not found" });
      }
      res.json(artist);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch artist" });
    }
  });

  app.get("/api/artists/user/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const artist = await storage.getArtistByUserId(userId);
      if (!artist) {
        return res.status(404).json({ message: "Artist profile not found" });
      }
      res.json(artist);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch artist profile" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });



  // Product routes
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get("/api/product-types", async (req, res) => {
    try {
      const productTypes = await storage.getProductTypes();
      res.json(productTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product types" });
    }
  });

  // Product-Focused API Routes - Clean Architecture Implementation
  app.get("/api/products", async (req, res) => {
    try {
      const { 
        categoryId, 
        productTypeId, 
        tags, 
        minPrice, 
        maxPrice, 
        sortBy = 'featured', 
        limit = 20, 
        offset = 0,
        q 
      } = req.query;

      console.log('Product API request with filters:', {
        categoryId, productTypeId, tags, minPrice, maxPrice, sortBy, q
      });

      // Get all products - simplified for now
      const allProducts = await storage.getArtworkList({}, 100, 0);
      console.log(`Found ${allProducts.length} total products`);
      
      // Apply domain-driven filtering
      let filteredProducts = allProducts.filter((product: any) => {
        // Category filter
        if (categoryId && categoryId !== 'all') {
          const catId = parseInt(categoryId as string);
          if (product.artwork?.categoryId !== catId) return false;
        }
        
        // Product type filter
        if (productTypeId && productTypeId !== 'all') {
          const typeId = parseInt(productTypeId as string);
          if (product.productTypeId !== typeId) return false;
        }
        
        // Price range filter
        if (minPrice || maxPrice) {
          const price = parseFloat(product.price);
          if (minPrice && price < parseFloat(minPrice as string)) return false;
          if (maxPrice && price > parseFloat(maxPrice as string)) return false;
        }
        
        // Tags filter
        if (tags) {
          const tagList = (tags as string).split(',');
          if (product.artwork?.tags) {
            const hasMatchingTag = tagList.some((tag: string) => 
              product.artwork.tags.includes(tag.trim())
            );
            if (!hasMatchingTag) return false;
          } else {
            return false;
          }
        }
        
        // Search query filter
        if (q) {
          const query = (q as string).toLowerCase();
          const searchableText = [
            product.artwork?.title || '',
            product.artwork?.artist?.displayName || '',
            product.productType?.name || '',
            ...(product.artwork?.tags || [])
          ].join(' ').toLowerCase();
          
          if (!searchableText.includes(query)) return false;
        }
        
        return product.isActive && product.artwork;
      });
      
      console.log(`After filtering: ${filteredProducts.length} products`);
      
      // Apply business logic sorting
      switch (sortBy) {
        case 'price-low':
          filteredProducts.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case 'price-high':
          filteredProducts.sort((a: any, b: any) => parseFloat(b.price) - parseFloat(a.price));
          break;
        case 'newest':
          filteredProducts.sort((a: any, b: any) => b.id - a.id);
          break;
        case 'featured':
        default:
          filteredProducts.sort((a: any, b: any) => {
            const aScore = (a.artwork?.artist?.isVerified ? 2 : 0) + (a.artwork?.isTrending ? 1 : 0);
            const bScore = (b.artwork?.artist?.isVerified ? 2 : 0) + (b.artwork?.isTrending ? 1 : 0);
            return bScore - aScore;
          });
          break;
      }
      
      // Apply pagination
      const startIndex = parseInt(offset as string) || 0;
      const limitNum = parseInt(limit as string) || 20;
      const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limitNum);
      
      res.json(paginatedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create product" });
    }
  });

  app.get("/api/products/artwork/:artworkId", async (req, res) => {
    try {
      const artworkId = parseInt(req.params.artworkId);
      console.log(`Fetching products for artwork ID: ${artworkId}`);
      const products = await storage.getProductsByArtwork(artworkId);
      console.log(`Found ${products.length} products for artwork ${artworkId}`);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products by artwork:", error);
      res.status(500).json({ message: "Failed to fetch products", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  });

  app.get("/api/cart/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const data = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.addCartItem(data);
      res.json(cartItem);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const cartItem = await storage.updateCartItem(id, quantity);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(cartItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.removeCartItem(id);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  // Order routes
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = z.object({
        userId: z.number(),
        totalAmount: z.string(),
        shippingAddress: z.string(),
        cartItems: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          price: z.string(),
        })),
      }).parse(req.body);

      // Create order
      const order = await storage.createOrder({
        userId: orderData.userId,
        totalAmount: orderData.totalAmount,
        shippingAddress: orderData.shippingAddress,
        status: "pending",
      });

      // Add order items
      for (const item of orderData.cartItems) {
        await storage.addOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        });
      }

      // Clear cart
      await storage.clearCart(orderData.userId);

      res.json(order);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create order" });
    }
  });

  app.get("/api/orders/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const orders = await storage.getOrdersByUser(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Social routes
  app.post("/api/follow", async (req, res) => {
    try {
      const { followerId, artistId } = req.body;
      
      if (typeof followerId !== 'number' || typeof artistId !== 'number') {
        return res.status(400).json({ message: "Invalid data" });
      }

      const isAlreadyFollowing = await storage.isFollowing(followerId, artistId);
      if (isAlreadyFollowing) {
        return res.status(400).json({ message: "Already following this artist" });
      }

      const follow = await storage.followArtist(followerId, artistId);
      res.json(follow);
    } catch (error) {
      res.status(500).json({ message: "Failed to follow artist" });
    }
  });

  app.delete("/api/follow", async (req, res) => {
    try {
      const { followerId, artistId } = req.body;
      
      if (typeof followerId !== 'number' || typeof artistId !== 'number') {
        return res.status(400).json({ message: "Invalid data" });
      }

      const success = await storage.unfollowArtist(followerId, artistId);
      if (!success) {
        return res.status(404).json({ message: "Follow relationship not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to unfollow artist" });
    }
  });

  app.post("/api/like", async (req, res) => {
    try {
      const { userId, artworkId } = req.body;
      
      if (typeof userId !== 'number' || typeof artworkId !== 'number') {
        return res.status(400).json({ message: "Invalid data" });
      }

      const isAlreadyLiked = await storage.isLiked(userId, artworkId);
      if (isAlreadyLiked) {
        return res.status(400).json({ message: "Already liked this artwork" });
      }

      const like = await storage.likeArtwork(userId, artworkId);
      res.json(like);
    } catch (error) {
      res.status(500).json({ message: "Failed to like artwork" });
    }
  });

  app.delete("/api/like", async (req, res) => {
    try {
      const { userId, artworkId } = req.body;
      
      if (typeof userId !== 'number' || typeof artworkId !== 'number') {
        return res.status(400).json({ message: "Invalid data" });
      }

      const success = await storage.unlikeArtwork(userId, artworkId);
      if (!success) {
        return res.status(404).json({ message: "Like not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to unlike artwork" });
    }
  });

  // Enhanced Cart API Routes
  app.post("/api/cart/add", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const { productId, quantity = 1 } = req.body;
      
      if (!productId || quantity < 1 || quantity > 10) {
        return res.status(400).json({ error: "Invalid product or quantity" });
      }

      await storage.addCartItem({
        userId: userId,
        productId: parseInt(productId),
        quantity: parseInt(quantity)
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  });

  app.patch("/api/cart/:itemId", isAuthenticated, async (req: any, res) => {
    try {

      const itemId = parseInt(req.params.itemId);
      const { quantity } = req.body;

      if (quantity < 1 || quantity > 10) {
        return res.status(400).json({ error: "Invalid quantity" });
      }

      const updatedItem = await storage.updateCartItem(itemId, quantity);
      if (!updatedItem) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:itemId", isAuthenticated, async (req: any, res) => {
    try {

      const itemId = parseInt(req.params.itemId);
      const success = await storage.removeCartItem(itemId);
      
      if (!success) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });

  app.post("/api/cart/clear", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.clearCart(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  // Order Management API Routes
  app.post("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const { shippingAddress } = req.body;
      
      if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 || 
          !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode) {
        return res.status(400).json({ error: "Complete shipping address is required" });
      }

      // Get user's cart items
      const cartItems = await storage.getCartItems(userId);
      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }

      // Calculate total
      let totalAmount = 0;
      const orderItems = [];

      for (const cartItem of cartItems) {
        const product = await storage.getProduct(cartItem.productId);
        if (!product) {
          return res.status(400).json({ error: `Product ${cartItem.productId} not found` });
        }

        const itemTotal = parseFloat(product.price) * (cartItem.quantity || 1);
        totalAmount += itemTotal;

        orderItems.push({
          productId: cartItem.productId,
          quantity: cartItem.quantity || 1,
          price: product.price
        });
      }

      // Add shipping and tax
      const shipping = totalAmount > 50 ? 0 : 9.99;
      const tax = totalAmount * 0.08;
      totalAmount += shipping + tax;

      // Create order
      const order = await storage.createOrder({
        userId: userId,
        totalAmount: totalAmount.toFixed(2),
        status: "pending",
        shippingAddress: `${shippingAddress.fullName}\n${shippingAddress.addressLine1}\n${shippingAddress.addressLine2 || ''}\n${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}\n${shippingAddress.country}`
      });

      // Add order items
      for (const item of orderItems) {
        await storage.addOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        });
      }

      // Clear cart
      await storage.clearCart(userId);

      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.post("/api/orders/:id/payment", isAuthenticated, async (req: any, res) => {
    try {

      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Simulate payment processing
      // In a real implementation, you would integrate with Stripe or another payment processor
      const paymentIntentId = `pi_simulated_${Date.now()}`;
      
      res.json({
        clientSecret: `${paymentIntentId}_secret`,
        paymentIntentId
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to process payment" });
    }
  });

  app.post("/api/orders/:id/confirm", isAuthenticated, async (req: any, res) => {
    try {

      const orderId = parseInt(req.params.id);
      const { paymentIntentId } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({ error: "Payment intent ID is required" });
      }

      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Update order status to confirmed
      await storage.updateOrderStatus(orderId, "confirmed");

      // Update artist sales totals
      const orderItems = await storage.getOrderItems(orderId);
      for (const item of orderItems) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          const artwork = await storage.getArtwork(product.artworkId);
          if (artwork) {
            const artist = await storage.getArtist(artwork.artistId);
            if (artist) {
              const saleAmount = parseFloat(item.price) * item.quantity;
              const currentSales = artist.totalSales || 0;
              await storage.updateArtist(artist.id, {
                totalSales: currentSales + saleAmount
              });
            }
          }
        }
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to confirm order" });
    }
  });

  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrdersByUser(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req: any, res) => {
    try {

      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Get order items with product details
      const orderItems = await storage.getOrderItems(orderId);
      const itemsWithDetails = [];

      for (const item of orderItems) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          const artwork = await storage.getArtwork(product.artworkId);
          const productTypes = await storage.getProductTypes();
          const productType = productTypes.find(pt => pt.id === product.productTypeId);
          
          if (artwork && productType) {
            const artist = await storage.getArtist(artwork.artistId);
            itemsWithDetails.push({
              ...item,
              product: {
                ...product,
                productType,
                artwork: {
                  ...artwork,
                  artist
                }
              }
            });
          }
        }
      }

      res.json({
        ...order,
        items: itemsWithDetails
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order details" });
    }
  });

  // Review routes
  app.get("/api/products/:productId/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const reviews = await storage.getReviews(productId);
      res.json(reviews);
    } catch (error) {
      console.error("Error getting reviews:", error);
      res.status(500).json({ error: "Failed to get reviews" });
    }
  });

  app.get("/api/products/:productId/rating", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const rating = await storage.getProductRating(productId);
      res.json(rating);
    } catch (error) {
      console.error("Error getting product rating:", error);
      res.status(500).json({ error: "Failed to get product rating" });
    }
  });

  app.post("/api/products/:productId/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const productId = parseInt(req.params.productId);
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: userId,
        productId
      });

      // Check if user already reviewed this product
      const existingReview = await storage.getUserReview(userId, productId);
      if (existingReview) {
        return res.status(400).json({ error: "You have already reviewed this product" });
      }

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid review data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.put("/api/reviews/:reviewId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const reviewId = parseInt(req.params.reviewId);
      const existingReview = await storage.getReview(reviewId);
      
      if (!existingReview) {
        return res.status(404).json({ error: "Review not found" });
      }

      if (existingReview.userId !== userId) {
        return res.status(403).json({ error: "Not authorized to edit this review" });
      }

      const updates = {
        rating: req.body.rating,
        title: req.body.title,
        comment: req.body.comment
      };

      const updatedReview = await storage.updateReview(reviewId, updates);
      res.json(updatedReview);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ error: "Failed to update review" });
    }
  });

  app.delete("/api/reviews/:reviewId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const reviewId = parseInt(req.params.reviewId);
      const existingReview = await storage.getReview(reviewId);
      
      if (!existingReview) {
        return res.status(404).json({ error: "Review not found" });
      }

      if (existingReview.userId !== userId) {
        return res.status(403).json({ error: "Not authorized to delete this review" });
      }

      const deleted = await storage.deleteReview(reviewId);
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: "Failed to delete review" });
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ error: "Failed to delete review" });
    }
  });

  app.post("/api/reviews/:reviewId/helpful", async (req, res) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      await storage.markReviewHelpful(reviewId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking review helpful:", error);
      res.status(500).json({ error: "Failed to mark review helpful" });
    }
  });

  // Register product routes
  await registerProductRoutes(app);

  // Register RBAC demo routes
  registerRBACDemoRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
