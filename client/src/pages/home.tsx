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

      {/* Categories Grid */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
            Shop by Category
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            <Link href="/browse?category=t-shirts" className="group">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                    <span className="text-2xl">👕</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">T-Shirts</h3>
                </CardContent>
              </Card>
            </Link>

            <Link href="/browse?category=mugs" className="group">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-200 transition-colors">
                    <span className="text-2xl">☕</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Mugs</h3>
                </CardContent>
              </Card>
            </Link>

            <Link href="/browse?category=bags" className="group">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
                    <span className="text-2xl">👜</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Bags</h3>
                </CardContent>
              </Card>
            </Link>

            <Link href="/browse?category=stickers" className="group">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-pink-200 transition-colors">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Stickers</h3>
                </CardContent>
              </Card>
            </Link>

            <Link href="/browse?category=phone-cases" className="group">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Phone Cases</h3>
                </CardContent>
              </Card>
            </Link>

            <Link href="/browse?category=prints" className="group">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-red-200 transition-colors">
                    <span className="text-2xl">🖼️</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Prints</h3>
                </CardContent>
              </Card>
            </Link>
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

          {trendingArtwork.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {trendingArtwork.slice(0, 10).map((artwork: any) => (
                <Link key={artwork.id} href={`/artwork/${artwork.id}`} className="group">
                  <Card className="hover:shadow-lg transition-shadow">
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <img 
                        src={artwork.imageUrl} 
                        alt={artwork.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                        {artwork.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">
                        by {artwork.artist?.displayName}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">
                          From $19.99
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Heart className="h-3 w-3 mr-1" />
                          {artwork.likeCount || 0}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {/* Show message when no trending artwork */}
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No trending artwork available yet.</p>
                <Link href="/browse">
                  <Button className="mt-4">Browse All Products</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">
            Featured Collections
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/browse?collection=new" className="group">
              <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-xl font-bold mb-2">New Arrivals</h3>
                    <p className="text-sm opacity-90">Fresh designs just added</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/browse?collection=bestsellers" className="group">
              <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="aspect-[4/3] bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-xl font-bold mb-2">Best Sellers</h3>
                    <p className="text-sm opacity-90">Customer favorites</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/browse?collection=sale" className="group">
              <Card className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="aspect-[4/3] bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-xl font-bold mb-2">On Sale</h3>
                    <p className="text-sm opacity-90">Save up to 30%</p>
                  </div>
                </div>
              </Card>
            </Link>
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