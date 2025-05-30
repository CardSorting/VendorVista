// Database seeding script
import { db } from "./db.js";
import { users, artists, categories, artwork, productTypes, products } from "../shared/schema.js";
import bcrypt from "bcryptjs";

async function seedDatabase() {
  console.log("Starting database seeding...");

  try {
    // Clear existing data
    await db.delete(products);
    await db.delete(artwork);
    await db.delete(artists);
    await db.delete(users);
    await db.delete(productTypes);
    await db.delete(categories);

    // Seed categories
    const categoryData = [
      { name: "Digital Art", description: "Digital paintings, illustrations, and computer-generated art" },
      { name: "Photography", description: "Professional photography and artistic captures" },
      { name: "Abstract Art", description: "Abstract and contemporary artistic expressions" },
      { name: "Nature Art", description: "Landscapes, wildlife, and nature-inspired artwork" },
      { name: "Portrait Art", description: "Human portraits and character studies" }
    ];

    await db.insert(categories).values(categoryData);
    console.log("✓ Categories seeded");

    // Seed product types
    const productTypeData = [
      { name: "Print", basePrice: "15.00", description: "High-quality art prints" },
      { name: "Canvas", basePrice: "45.00", description: "Canvas prints ready to hang" },
      { name: "Poster", basePrice: "8.00", description: "Affordable poster prints" },
      { name: "Framed Print", basePrice: "65.00", description: "Professional framed artwork" },
      { name: "Digital Download", basePrice: "5.00", description: "High-resolution digital files" }
    ];

    await db.insert(productTypes).values(productTypeData);
    console.log("✓ Product types seeded");

    // Seed users
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const userData = [
      {
        username: "artistjane",
        email: "jane@example.com",
        password: hashedPassword,
        firstName: "Jane",
        lastName: "Smith",
        isArtist: true,
        avatarUrl: null,
        bio: "Professional digital artist specializing in fantasy illustrations"
      },
      {
        username: "photomaster",
        email: "mike@example.com", 
        password: hashedPassword,
        firstName: "Mike",
        lastName: "Johnson",
        isArtist: true,
        avatarUrl: null,
        bio: "Nature photographer capturing the beauty of landscapes"
      },
      {
        username: "artlover",
        email: "sarah@example.com",
        password: hashedPassword,
        firstName: "Sarah",
        lastName: "Wilson",
        isArtist: false,
        avatarUrl: null,
        bio: "Art enthusiast and collector"
      }
    ];

    const insertedUsers = await db.insert(users).values(userData).returning();
    console.log("✓ Users seeded");

    // Seed artists
    const artistData = [
      {
        userId: insertedUsers[0].id,
        displayName: "Jane Digital Arts",
        bio: "Award-winning digital artist with 10+ years of experience",
        specialties: ["Digital Painting", "Fantasy Art", "Character Design"],
        portfolioUrl: "https://janearts.com",
        isVerified: true,
        rating: "4.8",
        totalSales: 0,
        followerCount: 245
      },
      {
        userId: insertedUsers[1].id,
        displayName: "Mike's Nature Photography",
        bio: "Capturing the essence of nature through the lens",
        specialties: ["Landscape Photography", "Wildlife Photography", "Macro Photography"],
        portfolioUrl: "https://mikenature.com",
        isVerified: true,
        rating: "4.6",
        totalSales: 0,
        followerCount: 189
      }
    ];

    const insertedArtists = await db.insert(artists).values(artistData).returning();
    console.log("✓ Artists seeded");

    // Seed artwork
    const artworkData = [
      {
        artistId: insertedArtists[0].id,
        title: "Mystic Forest",
        description: "A magical forest scene with ethereal lighting",
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
        tags: ["fantasy", "forest", "magic", "digital"],
        categoryId: 1,
        isPublic: true,
        isTrending: true,
        viewCount: 1250,
        likeCount: 89
      },
      {
        artistId: insertedArtists[0].id,
        title: "Dragon Guardian",
        description: "A majestic dragon protecting ancient ruins",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
        tags: ["dragon", "fantasy", "guardian", "ruins"],
        categoryId: 1,
        isPublic: true,
        isTrending: false,
        viewCount: 987,
        likeCount: 67
      },
      {
        artistId: insertedArtists[1].id,
        title: "Mountain Sunrise",
        description: "Golden hour over the mountain peaks",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        tags: ["mountain", "sunrise", "landscape", "nature"],
        categoryId: 4,
        isPublic: true,
        isTrending: true,
        viewCount: 2100,
        likeCount: 156
      },
      {
        artistId: insertedArtists[1].id,
        title: "Forest Stream",
        description: "Peaceful stream flowing through autumn forest",
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
        tags: ["forest", "stream", "autumn", "peaceful"],
        categoryId: 4,
        isPublic: true,
        isTrending: false,
        viewCount: 1456,
        likeCount: 98
      }
    ];

    const insertedArtwork = await db.insert(artwork).values(artworkData).returning();
    console.log("✓ Artwork seeded");

    // Seed products for each artwork
    const productData = [];
    for (const art of insertedArtwork) {
      // Add 3 product types for each artwork
      productData.push(
        {
          artworkId: art.id,
          productTypeId: 1, // Print
          price: "25.00",
          artistMargin: "10.00",
          isActive: true
        },
        {
          artworkId: art.id,
          productTypeId: 2, // Canvas
          price: "65.00",
          artistMargin: "20.00",
          isActive: true
        },
        {
          artworkId: art.id,
          productTypeId: 5, // Digital Download
          price: "8.00",
          artistMargin: "3.00",
          isActive: true
        }
      );
    }

    await db.insert(products).values(productData);
    console.log("✓ Products seeded");

    console.log("Database seeding completed successfully!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedDatabase };