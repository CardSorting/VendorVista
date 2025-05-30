import { Link } from "wouter";
import { Palette, Brush, Shapes, Feather, ArrowRight, Upload, DollarSign, Truck, Heart, Eye, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { ArtworkCard } from "@/components/artwork-card";
import { ArtistCard } from "@/components/artist-card";

export default function Home() {
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: trendingArtwork = [] } = useQuery({
    queryKey: ["/api/artwork/trending"],
  });

  const { data: featuredArtists = [] } = useQuery({
    queryKey: ["/api/artists/featured"],
  });

  const categoryIcons = {
    "Digital Art": Palette,
    "Watercolor": Brush,
    "Geometric": Shapes,
    "Illustration": Feather,
  };

  const stats = [
    { value: "12K+", label: "Artists" },
    { value: "150K+", label: "Designs" },
    { value: "1M+", label: "Happy Customers" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Mobile-first responsive design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/10 to-background mobile-safe-area">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-6 sm:space-y-8 lg:space-y-10 animate-fade-in text-center lg:text-left">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="apple-title text-3xl sm:text-4xl lg:text-6xl xl:text-7xl leading-tight tracking-tight">
                  Where Art Meets
                  <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--artist-coral))] via-[hsl(var(--artist-purple))] to-[hsl(var(--primary))]">
                    {" "}Commerce
                  </span>
                </h1>
                <p className="apple-subtitle leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Discover extraordinary artwork from independent creators worldwide. Transform creative visions into premium products.
                </p>
              </div>
              
              {/* Mobile-optimized buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Link href="/browse" className="w-full sm:w-auto">
                  <Button size="lg" className="apple-button mobile-touch-target w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
                    Explore Artwork
                  </Button>
                </Link>
                <Link href="/auth?mode=register" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="apple-button-secondary mobile-touch-target w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 border-2">
                    Become an Artist
                  </Button>
                </Link>
              </div>
              
              {/* Stats - Mobile responsive */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-6 sm:pt-8 border-t border-border/50">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Featured Artwork Grid - Mobile responsive */}
            <div className="relative animate-slide-up mt-8 lg:mt-0">
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="space-y-2 sm:space-y-4">
                  <div className="mobile-card overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-300 shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                      alt="Abstract colorful artwork" 
                      className="w-full h-32 sm:h-40 lg:h-48 object-cover rounded-t-xl"
                    />
                    <div className="p-2 sm:p-3 lg:p-4">
                      <h3 className="font-semibold text-xs sm:text-sm apple-body">Abstract Dreams</h3>
                      <p className="text-xs text-muted-foreground">by @creativemind</p>
                    </div>
                  </div>
                  <div className="mobile-card overflow-hidden transform -rotate-1 hover:rotate-0 transition-transform duration-300 shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
                      alt="Digital cyberpunk cityscape" 
                      className="w-full h-24 sm:h-28 lg:h-32 object-cover rounded-t-xl"
                    />
                    <div className="p-2 sm:p-3">
                      <h3 className="font-semibold text-xs apple-body">Neon Future</h3>
                      <p className="text-xs text-muted-foreground">by @digitaldreamer</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 sm:space-y-4 mt-4 sm:mt-6 lg:mt-8">
                  <div className="mobile-card overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-300 shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
                      alt="Watercolor botanical illustration" 
                      className="w-full h-24 sm:h-28 lg:h-32 object-cover rounded-t-xl"
                    />
                    <div className="p-2 sm:p-3">
                      <h3 className="font-semibold text-xs apple-body">Botanical Beauty</h3>
                      <p className="text-xs text-muted-foreground">by @naturelover</p>
                    </div>
                  </div>
                  <div className="mobile-card overflow-hidden transform -rotate-2 hover:rotate-0 transition-transform duration-300 shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                      alt="Geometric pattern design" 
                      className="w-full h-32 sm:h-40 lg:h-48 object-cover rounded-t-xl"
                    />
                    <div className="p-2 sm:p-3 lg:p-4">
                      <h3 className="font-semibold text-xs sm:text-sm apple-body">Sacred Geometry</h3>
                      <p className="text-xs text-muted-foreground">by @patternmaster</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories - Mobile-first responsive */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background mobile-safe-area">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="apple-title text-2xl sm:text-3xl lg:text-4xl mb-3 sm:mb-4">Explore Art Categories</h2>
            <p className="apple-subtitle max-w-2xl mx-auto">
              Discover artwork across diverse styles and mediums, each crafted by talented independent artists.
            </p>
          </div>
          
          <div className="responsive-grid">
            {(categories as any[]).map((category: any) => {
              const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons] || Palette;
              
              return (
                <Link key={category.id} href={`/browse?category=${category.id}`}>
                  <div className="group cursor-pointer mobile-touch-target">
                    <div className="mobile-card aspect-square bg-gradient-to-br from-artist-coral/20 to-artist-purple/20 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95">
                      <div className="absolute inset-0 bg-gradient-to-br from-artist-coral/10 to-artist-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                      <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-background rounded-xl flex items-center justify-center text-artist-coral shadow-sm">
                          <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <div>
                          <h3 className="apple-body font-bold text-sm sm:text-base lg:text-lg mb-1">{category.name}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">View collection</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trending Artwork - Mobile responsive */}
      <section className="py-12 sm:py-16 lg:py-20 bg-secondary/30 mobile-safe-area">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 sm:mb-12 space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h2 className="apple-title text-2xl sm:text-3xl lg:text-4xl mb-2">Trending Artwork</h2>
              <p className="apple-body text-muted-foreground">Discover what's popular with our community</p>
            </div>
            <Link href="/browse?trending=true" className="self-center sm:self-auto">
              <Button variant="ghost" className="apple-button-secondary font-semibold mobile-touch-target">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="responsive-grid">
            {(trendingArtwork as any[]).slice(0, 4).map((artwork: any) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                showArtist={true}
                showAddToCart={false}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artists - Mobile responsive */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background mobile-safe-area">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="apple-title text-2xl sm:text-3xl lg:text-4xl mb-3 sm:mb-4">Featured Artists</h2>
            <p className="apple-subtitle max-w-2xl mx-auto">
              Meet the creative minds behind our most popular artwork. Follow your favorites and discover new talent.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {(featuredArtists as any[]).slice(0, 3).map((artist: any) => (
              <ArtistCard
                key={artist.id}
                artist={artist}
                showFollowButton={true}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 gradient-coral-purple">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Share Your Art with the World?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Join thousands of artists earning money from their creativity. Set up your shop in minutes and start selling your designs on quality products.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?mode=register&artist=true">
              <Button size="lg" className="bg-white text-artist-coral hover:bg-gray-100 transform hover:scale-105 transition-all duration-200">
                Start Selling Today
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-artist-coral transition-all duration-200">
                Learn More
              </Button>
            </Link>
          </div>
          
          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-white/90">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Easy Upload</h3>
              <p className="text-sm">Upload your designs and we'll handle the rest</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Great Margins</h3>
              <p className="text-sm">Keep up to 70% of profits on every sale</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">No Hassle</h3>
              <p className="text-sm">We handle printing, shipping, and customer service</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
