import express, { Express, Request, Response, NextFunction } from "express";
import { Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertArtworkSchema, insertArtistSchema } from "@shared/schema";

export async function registerProductRoutes(app: Express): Promise<void> {
  // ====================================
  // PRODUCT-FOCUSED API ROUTES
  // Following Clean Architecture & CQRS
  // ====================================

  // Core Product Query Routes (CQRS Read Side)
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

      // Get all products with relationships (Domain Aggregates)
      const allProducts = await storage.getAllProductsWithDetails();
      console.log(`Found ${allProducts.length} total products`);
      
      // Apply filters using Domain Logic
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
        
        return product.isActive !== false;
      });
      
      console.log(`After filtering: ${filteredProducts.length} products`);
      
      // Apply sorting using Business Logic
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
          // Featured products based on business rules
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

  // Single Product Query by ID (CQRS Read Side)
  app.get("/api/product/:productId", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      console.log(`Fetching product details for ID: ${productId}`);
      
      // Get all products and find the specific one
      const allProducts = await storage.getAllProductsWithDetails();
      const product = allProducts.find((p: any) => p.id === productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Products by Category (Domain Query)
  app.get("/api/products/category/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const allProducts = await storage.getAllProductsWithDetails();
      
      const categoryProducts = allProducts.filter((product: any) => 
        product.artwork?.categoryId === categoryId && product.isActive
      );
      
      res.json(categoryProducts);
    } catch (error) {
      console.error('Error fetching category products:', error);
      res.status(500).json({ message: "Failed to fetch category products" });
    }
  });

  // Products by Type (Domain Query)
  app.get("/api/products/type/:typeId", async (req, res) => {
    try {
      const typeId = parseInt(req.params.typeId);
      const allProducts = await storage.getAllProductsWithDetails();
      
      const typeProducts = allProducts.filter((product: any) => 
        product.productTypeId === typeId && product.isActive
      );
      
      res.json(typeProducts);
    } catch (error) {
      console.error('Error fetching type products:', error);
      res.status(500).json({ message: "Failed to fetch type products" });
    }
  });

  // Featured Products Query (Business Logic)
  app.get("/api/products/featured", async (req, res) => {
    try {
      const allProducts = await storage.getAllProductsWithDetails();
      
      const featuredProducts = allProducts
        .filter((product: any) => product.isActive && product.artwork)
        .sort((a: any, b: any) => {
          const aScore = (a.artwork?.artist?.isVerified ? 2 : 0) + (a.artwork?.isTrending ? 1 : 0);
          const bScore = (b.artwork?.artist?.isVerified ? 2 : 0) + (b.artwork?.isTrending ? 1 : 0);
          return bScore - aScore;
        })
        .slice(0, 12); // Top 12 featured products
      
      res.json(featuredProducts);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  

  // Product Command Routes (CQRS Write Side)
  app.post("/api/products", async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.put("/api/product/:productId", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const updates = req.body;
      
      const updatedProduct = await storage.updateProduct(productId, updates);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });
}