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
    { name: "T-Shirts", icon: Shirt, color: "bg-gradient-to-br from-blue-500 to-blue-600", description: "Premium cotton tees" },
    { name: "Art Prints", icon: Palette, color: "bg-gradient-to-br from-purple-500 to-purple-600", description: "Museum-quality prints" },
    { name: "Stickers", icon: Star, color: "bg-gradient-to-br from-pink-500 to-pink-600", description: "Durable vinyl stickers" },
  ];

  const stats = [
    { value: "2M+", label: "Products" },
    { value: "50K+", label: "Designs" },
    { value: "500K+", label: "Happy Customers" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Apple Design Philosophy */}
      <section className="relative bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            {/* Apple-style Typography Hierarchy */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight text-gray-900 mb-6">
              Think different.
              <span className="block font-medium">
                Wear different.
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
              Discover extraordinary designs on premium t-shirts, museum-quality prints, and durable stickers.
            </p>
            
            {/* Apple-style Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 mb-16">
              {productTypes.map((product) => (
                <Link key={product.name} href={`/browse?product=${product.name.toLowerCase()}`}>
                  <div className="group text-center">
                    <div className="relative mb-6">
                      <div className={`w-20 h-20 sm:w-24 sm:h-24 ${product.color} rounded-3xl flex items-center justify-center mx-auto group-hover:scale-105 transition-all duration-500 ease-out shadow-2xl group-hover:shadow-3xl`}>
                        <product.icon className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-medium text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-base text-gray-500 font-light">{product.description}</p>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Apple-style CTA */}
            <div className="space-y-4">
              <Link href="/browse">
                <Button 
                  size="lg" 
                  className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg font-medium rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Browse Collection
                </Button>
              </Link>
              <p className="text-sm text-gray-500">Free shipping on orders over $50</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Designs - Apple Aesthetic */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-gray-900 mb-4">
              Designs that inspire.
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 font-light max-w-2xl mx-auto">
              Curated collections from independent artists around the world.
            </p>
          </div>
          
          {/* Apple-style Product Showcase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="group">
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg group-hover:shadow-2xl transition-all duration-500">
                  <div className="aspect-square relative">
                    <img 
                      src={`https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=90&sig=${index}`}
                      alt={`Featured Design ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-500"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Minimalist Collection
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Starting at $24.99
                    </p>
                    <div className="flex space-x-2">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">T-Shirt</span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Print</span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Sticker</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/browse">
              <Button variant="outline" size="lg" className="border-2 border-gray-300 hover:border-gray-900 text-gray-900 px-8 py-3 rounded-full font-medium">
                View All Designs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quality Focus - Apple Minimalism */}
      <section className="py-20 sm:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-gray-900 mb-6">
            Crafted for perfection.
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 font-light mb-16 max-w-2xl mx-auto">
            Every product is thoughtfully designed and sustainably made with premium materials.
          </p>
          
          {/* Apple-style Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shirt className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Premium Cotton</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                100% organic cotton, pre-shrunk and ethically sourced for comfort and durability.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Palette className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Archival Prints</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Museum-quality giclée printing on acid-free paper that lasts generations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Weatherproof Vinyl</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                UV-resistant stickers that withstand years of outdoor exposure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Artist Community - Apple Elegance */}
      <section className="py-20 sm:py-32 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white mb-6">
            Support independent artists.
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
            Every purchase directly supports creative minds worldwide. Join a community that values artistry and originality.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 mb-12">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-light text-white mb-2">85%</div>
              <p className="text-gray-400 font-light">Artist royalty on every sale</p>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-light text-white mb-2">50K+</div>
              <p className="text-gray-400 font-light">Artists worldwide</p>
            </div>
          </div>
          
          <Link href="/auth">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-medium rounded-full transition-all duration-300">
              Become an Artist
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
