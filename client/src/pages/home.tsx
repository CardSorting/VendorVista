import { Link } from "wouter";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: trendingArtwork = [] } = useQuery({
    queryKey: ["/api/artwork/trending"],
  });

  // Sample product data for demonstration
  const sampleProducts = [
    { id: 1, title: "Vintage Floral T-Shirt", artist: "Sarah Chen", price: 24.99, likes: 142, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop" },
    { id: 2, title: "Coffee Lover Mug", artist: "Mike Studio", price: 18.50, likes: 89, image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop" },
    { id: 3, title: "Geometric Phone Case", artist: "Design Co", price: 22.00, likes: 201, image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300&h=300&fit=crop" },
    { id: 4, title: "Nature Sticker Pack", artist: "Green Arts", price: 12.99, likes: 76, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop" },
    { id: 5, title: "Typography Poster", artist: "Word Smith", price: 19.99, likes: 156, image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop" },
    { id: 6, title: "Watercolor Tote Bag", artist: "Paint Studio", price: 28.00, likes: 98, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop" },
    { id: 7, title: "Minimalist Notebook", artist: "Simple Co", price: 15.99, likes: 67, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=300&fit=crop" },
    { id: 8, title: "Cat Illustration Print", artist: "Pet Arts", price: 21.50, likes: 234, image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop" },
    { id: 9, title: "Abstract Art Canvas", artist: "Modern Arts", price: 45.00, likes: 178, image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop" },
    { id: 10, title: "Sunset Landscape Mug", artist: "Nature Photo", price: 16.99, likes: 123, image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop" },
    { id: 11, title: "Galaxy Pattern Hoodie", artist: "Space Design", price: 39.99, likes: 267, image: "https://images.unsplash.com/photo-1462804993656-fac4ff489837?w=300&h=300&fit=crop" },
    { id: 12, title: "Hand Lettered Quote", artist: "Letter Love", price: 18.00, likes: 145, image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&h=300&fit=crop" },
    { id: 13, title: "Botanical Illustration", artist: "Leaf Studio", price: 23.50, likes: 189, image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop" },
    { id: 14, title: "Urban Street Art", artist: "City Canvas", price: 32.00, likes: 201, image: "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=300&h=300&fit=crop" },
    { id: 15, title: "Ocean Wave Print", artist: "Sea Studio", price: 26.99, likes: 156, image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=300&h=300&fit=crop" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Hero Banner */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Discover unique designs from independent artists
          </h1>
          <p className="text-lg sm:text-xl mb-6 opacity-90">
            Find one-of-a-kind items on shirts, mugs, bags and more
          </p>
          <Link href="/browse">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 font-semibold">
              Start Shopping
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Featured Items
            </h2>
            <Link href="/browse">
              <Button variant="outline">See All</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {sampleProducts.slice(0, 10).map((product) => (
              <Link key={product.id} href={`/artwork/${product.id}`} className="group">
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      by {product.artist}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">
                        ${product.price.toFixed(2)}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Heart className="h-3 w-3 mr-1" />
                        {product.likes}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products Grid */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Trending Now
            </h2>
            <Link href="/browse?trending=true">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {sampleProducts.slice(5, 15).map((product) => (
              <Link key={product.id} href={`/artwork/${product.id}`} className="group">
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      by {product.artist}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">
                        ${product.price.toFixed(2)}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Heart className="h-3 w-3 mr-1" />
                        {product.likes}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular This Week */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Popular This Week
            </h2>
            <Link href="/browse?popular=true">
              <Button variant="outline">See More</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
            {sampleProducts.slice(0, 12).map((product) => (
              <Link key={`popular-${product.id}`} href={`/artwork/${product.id}`} className="group">
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <CardContent className="p-2 sm:p-3">
                    <h3 className="font-medium text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-1">
                      {product.artist}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 text-sm">
                        ${product.price.toFixed(2)}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
                        4.{Math.floor(Math.random() * 9) + 1}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Added */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Recently Added
            </h2>
            <Link href="/browse?new=true">
              <Button variant="outline">View All New</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sampleProducts.slice(8, 12).map((product) => (
              <Link key={`recent-${product.id}`} href={`/artwork/${product.id}`} className="group">
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      by {product.artist}
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg text-gray-900">
                        ${product.price.toFixed(2)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {product.likes}
                      </div>
                      <span>Free shipping</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 sm:py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Start selling your designs today
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Join thousands of artists earning money from their creativity
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 font-semibold">
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}