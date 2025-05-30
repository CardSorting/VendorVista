import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, registerSchema, loginSchema, insertArtistSchema, insertArtworkSchema, insertProductSchema, insertCartItemSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth0 Authentication routes
  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const auth0User = req.oidc.user;
      
      if (!auth0User || !auth0User.email) {
        return res.status(400).json({ error: "Invalid user data from Auth0" });
      }
      
      // Check if user exists in our database
      let user = await storage.getUserByEmail(auth0User.email);
      
      if (!user) {
        // Create new user from Auth0 profile
        user = await storage.createUser({
          username: auth0User.nickname || auth0User.email.split('@')[0],
          email: auth0User.email,
          password: '', // Not needed for Auth0 users
          firstName: auth0User.given_name || null,
          lastName: auth0User.family_name || null,
          avatarUrl: auth0User.picture || null,
        });
      }

      res.json({ 
        user: { ...user, password: undefined },
        isAuthenticated: true 
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/auth/status", (req, res) => {
    res.json({ 
      isAuthenticated: req.oidc.isAuthenticated(),
      user: req.oidc.isAuthenticated() ? req.oidc.user : null
    });
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Artist routes
  app.post("/api/artists", async (req, res) => {
    try {
      const data = insertArtistSchema.parse(req.body);
      const artist = await storage.createArtist(data);
      
      // Update user to be an artist
      await storage.updateUser(data.userId, { isArtist: true });
      
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
      const userId = parseInt(req.params.userId);
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

  // Artwork routes
  app.post("/api/artwork", async (req, res) => {
    try {
      const data = insertArtworkSchema.parse(req.body);
      const artwork = await storage.createArtwork(data);
      res.json(artwork);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create artwork" });
    }
  });

  app.get("/api/artwork", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;
      const trending = req.query.trending === 'true';
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const filters = { categoryId, tags, trending };
      const artwork = await storage.getArtworkList(filters, limit, offset);
      res.json(artwork);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch artwork" });
    }
  });

  app.get("/api/artwork/trending", async (req, res) => {
    try {
      const artwork = await storage.getTrendingArtwork();
      res.json(artwork);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trending artwork" });
    }
  });

  app.get("/api/artwork/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artwork = await storage.getArtwork(id);
      if (!artwork) {
        return res.status(404).json({ message: "Artwork not found" });
      }
      
      // Increment view count
      await storage.incrementArtworkViews(id);
      
      res.json(artwork);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch artwork" });
    }
  });

  app.get("/api/artwork/artist/:artistId", async (req, res) => {
    try {
      const artistId = parseInt(req.params.artistId);
      const artwork = await storage.getArtworkByArtist(artistId);
      res.json(artwork);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch artist artwork" });
    }
  });

  // Product routes
  app.get("/api/product-types", async (req, res) => {
    try {
      const productTypes = await storage.getProductTypes();
      res.json(productTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product types" });
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
      const products = await storage.getProductsByArtwork(artworkId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Cart routes
  app.get("/api/cart/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
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
  app.post("/api/cart/add", async (req, res) => {
    try {
      if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const auth0User = req.oidc.user;
      const user = await storage.getUserByEmail(auth0User.email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { productId, quantity = 1 } = req.body;
      
      if (!productId || quantity < 1 || quantity > 10) {
        return res.status(400).json({ error: "Invalid product or quantity" });
      }

      await storage.addCartItem({
        userId: user.id,
        productId: parseInt(productId),
        quantity: parseInt(quantity)
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  });

  app.patch("/api/cart/:itemId", async (req, res) => {
    try {
      if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

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

  app.delete("/api/cart/:itemId", async (req, res) => {
    try {
      if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

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

  app.post("/api/cart/clear", async (req, res) => {
    try {
      if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const auth0User = req.oidc.user;
      const user = await storage.getUserByEmail(auth0User.email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await storage.clearCart(user.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  // Order Management API Routes
  app.post("/api/orders", async (req, res) => {
    try {
      if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const auth0User = req.oidc.user;
      const user = await storage.getUserByEmail(auth0User.email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { shippingAddress } = req.body;
      
      if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 || 
          !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode) {
        return res.status(400).json({ error: "Complete shipping address is required" });
      }

      // Get user's cart items
      const cartItems = await storage.getCartItems(user.id);
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
        userId: user.id,
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
      await storage.clearCart(user.id);

      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.post("/api/orders/:id/payment", async (req, res) => {
    try {
      if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

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

  app.post("/api/orders/:id/confirm", async (req, res) => {
    try {
      if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

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

  app.get("/api/orders", async (req, res) => {
    try {
      if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const auth0User = req.oidc.user;
      const user = await storage.getUserByEmail(auth0User.email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const orders = await storage.getOrdersByUser(user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

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

  const httpServer = createServer(app);
  return httpServer;
}
