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

  // Sticker-focused product data
  const stickerProducts = [
    { id: 1, title: "Rainbow Pride Sticker", artist: "Pride Arts", price: 3.99, likes: 342, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop" },
    { id: 2, title: "Laptop Coding Stickers Pack", artist: "Tech Design", price: 8.99, likes: 189, image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=300&h=300&fit=crop" },
    { id: 3, title: "Cute Animal Faces Set", artist: "Kawaii Co", price: 5.99, likes: 567, image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=300&h=300&fit=crop" },
    { id: 4, title: "Nature Leaf Collection", artist: "Green Arts", price: 4.50, likes: 234, image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop" },
    { id: 5, title: "Motivational Quote Stickers", artist: "Word Power", price: 6.99, likes: 456, image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&h=300&fit=crop" },
    { id: 6, title: "Space Galaxy Pack", artist: "Cosmic Studio", price: 7.50, likes: 789, image: "https://images.unsplash.com/photo-1462804993656-fac4ff489837?w=300&h=300&fit=crop" },
    { id: 7, title: "Retro Gaming Icons", artist: "Pixel Art", price: 9.99, likes: 423, image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=300&h=300&fit=crop" },
    { id: 8, title: "Coffee Lover Decals", artist: "Caffeine Club", price: 3.50, likes: 298, image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop" },
    { id: 9, title: "Geometric Patterns Set", artist: "Modern Arts", price: 5.99, likes: 356, image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop" },
    { id: 10, title: "Cute Cat Expressions", artist: "Pet Arts", price: 4.99, likes: 634, image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=300&fit=crop" },
    { id: 11, title: "Ocean Wave Designs", artist: "Sea Studio", price: 6.50, likes: 445, image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=300&h=300&fit=crop" },
    { id: 12, title: "Music Note Collection", artist: "Sound Wave", price: 7.99, likes: 367, image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop" },
    { id: 13, title: "Travel Adventure Pack", artist: "Wanderlust", price: 8.50, likes: 523, image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&h=300&fit=crop" },
    { id: 14, title: "Floral Botanical Set", artist: "Bloom Studio", price: 5.50, likes: 412, image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&h=300&fit=crop" },
    { id: 15, title: "Emoji Expressions Pack", artist: "Happy Face", price: 4.99, likes: 598, image: "https://images.unsplash.com/photo-1551024739-4bd4f6c45a85?w=300&h=300&fit=crop" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Sticker-Focused Hero */}
      <section className="bg-gradient-to-r from-pink-500 to-orange-400 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Express Yourself with Stickers
          </h1>
          <p className="text-lg sm:text-xl mb-6 opacity-90 max-w-2xl mx-auto">
            From laptop decals to water bottle designs - discover thousands of unique stickers by independent artists
          </p>
          <Link href="/browse?category=stickers">
            <Button size="lg" className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-3 font-semibold">
              Shop Stickers
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Stickers */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Featured Stickers
            </h2>
            <Link href="/browse?category=stickers">
              <Button variant="outline">See All Stickers</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {stickerProducts.slice(0, 10).map((product) => (
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

      {/* Popular Sticker Collections */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Popular Sticker Packs
            </h2>
            <Link href="/browse?category=stickers&trending=true">
              <Button variant="outline">View All Popular</Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {stickerProducts.slice(5, 15).map((product) => (
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

      {/* Best Selling Stickers */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Best Selling Stickers
            </h2>
            <Link href="/browse?category=stickers&bestsellers=true">
              <Button variant="outline">See More</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
            {stickerProducts.slice(0, 12).map((product) => (
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

      {/* New Sticker Arrivals */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              New Sticker Arrivals
            </h2>
            <Link href="/browse?category=stickers&new=true">
              <Button variant="outline">View All New</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stickerProducts.slice(8, 12).map((product) => (
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

      {/* Call to Action for Artists */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-pink-600 to-orange-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Turn your art into stickers
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Upload your designs and start earning money from every sticker sold. No upfront costs.
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-3 font-semibold">
              Start Selling Stickers
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}