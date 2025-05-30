import { Link } from "wouter";
import { ShoppingBag, Shirt, Coffee, Laptop, Phone, Gift, Star, TrendingUp, Search, Filter, Palette, ArrowRight, Upload, DollarSign, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { ArtworkCard } from "@/components/artwork-card";

export default function Home() {
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: trendingArtwork = [] } = useQuery({
    queryKey: ["/api/artwork/trending"],
  });

  const productTypes = [
    { name: "T-Shirts", icon: Shirt, color: "bg-blue-500" },
    { name: "Mugs", icon: Coffee, color: "bg-amber-500" },
    { name: "Laptop Cases", icon: Laptop, color: "bg-purple-500" },
    { name: "Phone Cases", icon: Phone, color: "bg-green-500" },
    { name: "Stickers", icon: Star, color: "bg-pink-500" },
    { name: "Gifts", icon: Gift, color: "bg-red-500" },
  ];

  const stats = [
    { value: "2M+", label: "Products" },
    { value: "50K+", label: "Designs" },
    { value: "500K+", label: "Happy Customers" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Redbubble Style Product Focus */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 mobile-safe-area">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Awesome products.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Designed by artists.
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Shop unique designs on t-shirts, mugs, phone cases, and more. Support independent artists while getting high-quality products delivered to your door.
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search for art, designs, or products..."
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none shadow-lg"
                />
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full px-6">
                  Search
                </Button>
              </div>
            </div>
            
            {/* Product Categories */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 max-w-4xl mx-auto">
              {productTypes.map((product) => (
                <Link key={product.name} href={`/browse?product=${product.name.toLowerCase()}`}>
                  <div className="group cursor-pointer text-center">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 ${product.color} rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                      <product.icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">{product.name}</p>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto pt-8 border-t border-gray-200">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products - Redbubble Style */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Trending Now</h2>
              <p className="text-gray-600">Popular designs that everyone's talking about</p>
            </div>
            <Link href="/browse?trending=true">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {(trendingArtwork as any[]).slice(0, 10).map((artwork: any, index) => (
              <div key={artwork.id || index} className="group cursor-pointer">
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                  <div className="aspect-square bg-gray-100 relative">
                    <img 
                      src={artwork.imageUrl || `https://images.unsplash.com/photo-154196101777${index}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400`}
                      alt={artwork.title || `Trending Design ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-red-500 text-white">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Hot
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-900 truncate">
                      {artwork.title || `Cool Design ${index + 1}`}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      From $15.99
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category - Product Focus */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find the perfect product for your style. From everyday essentials to unique gifts.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {(categories as any[]).map((category: any) => (
              <Link key={category.id} href={`/browse?category=${category.id}`}>
                <div className="group cursor-pointer">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 text-center hover:shadow-lg transition-all duration-200">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                      <Palette className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quality & Trust Section - Redbubble Style */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Quality you can trust
          </h2>
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            We're committed to delivering exceptional products that artists and customers love. Every item is printed on-demand with premium materials.
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Premium Quality</h3>
              <p className="text-blue-100">High-quality printing on durable materials that last</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fast Shipping</h3>
              <p className="text-blue-100">Quick turnaround times with reliable delivery worldwide</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fair Pricing</h3>
              <p className="text-blue-100">Competitive prices with transparent artist royalties</p>
            </div>
          </div>
          
          <div className="mt-12">
            <Link href="/auth">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                Start Shopping Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
