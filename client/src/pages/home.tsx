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
      {/* Hero Section - Mobile-First Design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="px-4 py-8 sm:py-12 lg:py-16">
          <div className="text-center space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight px-2">
                Awesome products.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Designed by artists.
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
                Shop unique designs on t-shirts, mugs, phone cases, and more. Support independent artists.
              </p>
            </div>
            
            {/* Mobile-Optimized Search */}
            <div className="px-4">
              <div className="relative max-w-md mx-auto sm:max-w-2xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type="text"
                  placeholder="Search designs..."
                  className="w-full pl-10 sm:pl-12 pr-20 sm:pr-24 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none shadow-lg"
                />
                <Button className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base">
                  Go
                </Button>
              </div>
            </div>
            
            {/* Mobile-First Product Categories */}
            <div className="px-4">
              <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-sm mx-auto sm:max-w-4xl sm:grid-cols-6">
                {productTypes.map((product) => (
                  <Link key={product.name} href={`/browse?product=${product.name.toLowerCase()}`}>
                    <div className="group cursor-pointer text-center mobile-touch-target">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 ${product.color} rounded-2xl sm:rounded-full flex items-center justify-center mx-auto mb-2 group-active:scale-95 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                        <product.icon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700 leading-tight">{product.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Mobile Stats */}
            <div className="px-4 pt-6 sm:pt-8">
              <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xs mx-auto sm:max-w-lg border-t border-gray-200 pt-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products - Mobile-First */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-2 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Trending Now</h2>
              <p className="text-sm sm:text-base text-gray-600">Popular designs everyone's talking about</p>
            </div>
            <Link href="/browse?trending=true" className="self-center sm:self-auto">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700 text-sm sm:text-base mobile-touch-target">
                View All <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </Link>
          </div>
          
          {/* Mobile-optimized grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 10 }, (_, index) => (
              <div key={index} className="group cursor-pointer mobile-touch-target">
                <div className="bg-white rounded-lg shadow-md group-active:shadow-sm group-hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                  <div className="aspect-square bg-gray-100 relative">
                    <img 
                      src={`https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80&sig=${index}`}
                      alt={`Trending Design ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 group-active:scale-95 transition-transform duration-200"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5">
                        <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                        Hot
                      </Badge>
                    </div>
                  </div>
                  <div className="p-2 sm:p-3">
                    <h3 className="font-medium text-xs sm:text-sm text-gray-900 truncate leading-tight">
                      Cool Design {index + 1}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                      From $15.99
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category - Mobile-First */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Shop by Category</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Find the perfect product for your style. From everyday essentials to unique gifts.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {(categories as any[]).map((category: any) => (
              <Link key={category.id} href={`/browse?category=${category.id}`}>
                <div className="group cursor-pointer mobile-touch-target">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 text-center group-active:scale-95 group-hover:shadow-lg transition-all duration-200">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200">
                      <Palette className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 leading-tight">{category.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 leading-tight">{category.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quality & Trust Section - Mobile-First */}
      <section className="py-8 sm:py-12 lg:py-16 bg-blue-600">
        <div className="px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Quality you can trust
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-8 sm:mb-12 leading-relaxed max-w-3xl mx-auto px-4">
            We're committed to delivering exceptional products that artists and customers love. Every item is printed on-demand with premium materials.
          </p>
          
          {/* Mobile-First Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-white max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Upload className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">Premium Quality</h3>
              <p className="text-sm sm:text-base text-blue-100 leading-relaxed">High-quality printing on durable materials that last</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Truck className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">Fast Shipping</h3>
              <p className="text-sm sm:text-base text-blue-100 leading-relaxed">Quick turnaround times with reliable delivery worldwide</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-2">Fair Pricing</h3>
              <p className="text-sm sm:text-base text-blue-100 leading-relaxed">Competitive prices with transparent artist royalties</p>
            </div>
          </div>
          
          <div className="mt-8 sm:mt-12">
            <Link href="/browse">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold mobile-touch-target">
                Start Shopping Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
