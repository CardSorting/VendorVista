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

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const productArray = Array.isArray(products) ? products : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 to-orange-400 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Express Yourself with Art
          </h1>
          <p className="text-lg sm:text-xl mb-6 opacity-90 max-w-2xl mx-auto">
            Discover unique artwork and products from independent artists
          </p>
          <Link href="/browse">
            <Button size="lg" className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-3 font-semibold">
              Browse Products
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
            <Link href="/browse">
              <Button variant="outline">See All Products</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {productArray.slice(0, 5).map((product: any) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group">
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    <img 
                      src={product.artwork?.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop'} 
                      alt={product.artwork?.title || 'Product'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                      {product.artwork?.title || 'Product'}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      by {product.artwork?.artist?.displayName || 'Artist'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">
                        ${parseFloat(product.price || '0').toFixed(2)}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Heart className="h-3 w-3 mr-1" />
                        {product.artwork?.likeCount || 0}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Popular Products
            </h2>
            <Link href="/browse?trending=true">
              <Button variant="outline">View All Popular</Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {productArray.slice(5, 10).map((product: any) => (
              <Link key={product.id} href={`/product/${product.id}`} className="group">
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    <img 
                      src={product.artwork?.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop'} 
                      alt={product.artwork?.title || 'Product'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                      {product.artwork?.title || 'Product'}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      by {product.artwork?.artist?.displayName || 'Artist'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">
                        ${parseFloat(product.price || '0').toFixed(2)}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Heart className="h-3 w-3 mr-1" />
                        {product.artwork?.likeCount || 0}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Selling Products */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Best Selling Products
            </h2>
            <Link href="/browse?bestsellers=true">
              <Button variant="outline">See More</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
            {productArray.slice(10, 16).map((product: any) => (
              <Link key={`popular-${product.id}`} href={`/product/${product.id}`} className="group">
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    <img 
                      src={product.artwork?.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop'} 
                      alt={product.artwork?.title || 'Product'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <CardContent className="p-2 sm:p-3">
                    <h3 className="font-medium text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2">
                      {product.artwork?.title || 'Product'}
                    </h3>
                    <p className="text-xs text-gray-600 mb-1">
                      {product.artwork?.artist?.displayName || 'Artist'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 text-sm">
                        ${parseFloat(product.price || '0').toFixed(2)}
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

      {/* New Arrivals */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              New Arrivals
            </h2>
            <Link href="/browse?new=true">
              <Button variant="outline">View All New</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productArray.slice(16, 20).map((product: any) => (
              <Link key={`recent-${product.id}`} href={`/product/${product.id}`} className="group">
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                    <img 
                      src={product.artwork?.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop'} 
                      alt={product.artwork?.title || 'Product'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2">
                      {product.artwork?.title || 'Product'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      by {product.artwork?.artist?.displayName || 'Artist'}
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg text-gray-900">
                        ${parseFloat(product.price || '0').toFixed(2)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {product.artwork?.likeCount || 0}
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
      <section className="py-12 sm:py-16 bg-gradient-to-r from-pink-600 to-orange-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Turn your art into products
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Upload your designs and start earning money from every product sold. No upfront costs.
          </p>
          <Link href="/auth">
            <Button size="lg" className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-3 font-semibold">
              Start Selling
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}