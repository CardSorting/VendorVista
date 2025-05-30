import { useParams, Link, useLocation } from "wouter";
import { ArrowLeft, Heart, Eye, Share2, ShoppingCart, User, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { ProductSelector } from "@/components/product-selector";
import { ArtworkCard } from "@/components/artwork-card";
import { useState } from "react";

export default function ArtworkDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  const { data: artwork, isLoading } = useQuery({
    queryKey: ["/api/artwork", id],
    enabled: !!id,
  });

  const { data: artist } = useQuery({
    queryKey: ["/api/artists", artwork?.artistId],
    enabled: !!artwork?.artistId,
  });

  const { data: artistUser } = useQuery({
    queryKey: ["/api/users", artist?.userId],
    enabled: !!artist?.userId,
  });

  const { data: relatedArtwork = [] } = useQuery({
    queryKey: ["/api/artwork/artist", artwork?.artistId],
    enabled: !!artwork?.artistId,
  });

  const { data: category } = useQuery({
    queryKey: ["/api/categories", artwork?.categoryId],
    enabled: !!artwork?.categoryId,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error("Must be logged in to like artwork");
      }

      if (isLiked) {
        const response = await apiRequest("DELETE", "/api/like", {
          userId: user.id,
          artworkId: parseInt(id!),
        });
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/like", {
          userId: user.id,
          artworkId: parseInt(id!),
        });
        return response.json();
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ["/api/artwork", id] });
      toast({
        title: isLiked ? "Removed from favorites" : "Added to favorites",
        description: isLiked ? "Artwork removed from your favorites" : "Artwork added to your favorites",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update favorites",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like artwork",
        variant: "destructive",
      });
      return;
    }

    likeMutation.mutate();
  };

  const handleAddToCart = () => {
    if (!selectedProduct) {
      toast({
        title: "Select a product",
        description: "Please select a product type first",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    addToCart({ productId: selectedProduct });
    toast({
      title: "Added to cart",
      description: "Item has been added to your cart",
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: artwork?.title,
        text: `Check out this amazing artwork: ${artwork?.title}`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Artwork link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="animate-pulse bg-gray-200 aspect-square rounded-lg"></div>
          </div>
          <div className="space-y-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6 text-center py-16">
            <h2 className="text-2xl font-bold apple-gray mb-4">Artwork not found</h2>
            <p className="text-gray-600 mb-6">The artwork you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => setLocation("/browse")} className="bg-apple-blue text-white hover:bg-blue-600">
              Browse Artwork
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const otherArtwork = relatedArtwork.filter((art: any) => art.id !== artwork.id && art.isPublic).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link href="/browse" className="hover:text-blue-600">Browse</Link>
        {category && (
          <>
            <span>/</span>
            <span className="text-gray-500">{category.name}</span>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900">{artwork.title}</span>
      </div>

      {/* Back Button */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="flex items-center text-gray-600 hover:text-apple-blue"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Artwork Image */}
        <div className="space-y-6">
          <div className="relative group">
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="w-full aspect-square object-cover rounded-2xl shadow-2xl"
            />
            
            {/* Floating Action Buttons */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white"
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-artist-coral' : ''}`} />
              </Button>
              
              <Button
                size="sm"
                variant="secondary"
                onClick={handleShare}
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Stats Overlay */}
            <div className="absolute bottom-4 left-4 flex items-center space-x-4 text-white">
              <div className="flex items-center space-x-1 bg-black/50 rounded-full px-3 py-1">
                <Eye className="h-4 w-4" />
                <span>{artwork.viewCount || 0}</span>
              </div>
              <div className="flex items-center space-x-1 bg-black/50 rounded-full px-3 py-1">
                <Heart className="h-4 w-4" />
                <span>{artwork.likeCount || 0}</span>
              </div>
            </div>

            {/* Trending Badge */}
            {artwork.isTrending && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-artist-coral text-white">
                  Trending
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Artwork Details */}
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {category && (
                <Badge variant="outline" className="text-artist-purple border-artist-purple">
                  {category.name}
                </Badge>
              )}
              {artwork.tags?.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl font-bold apple-gray">{artwork.title}</h1>

            {/* Artist Info */}
            {artist && artistUser && (
              <Link href={`/artist/${artist.id}`}>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={artistUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.displayName}`}
                      alt={artist.displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold apple-gray">{artist.displayName}</h3>
                      {artist.isVerified && (
                        <CheckCircle className="h-4 w-4 text-artist-green" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {artist.followerCount || 0} followers • {artist.totalSales || 0} sales
                    </p>
                  </div>
                  <User className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
            )}

            {/* Description */}
            {artwork.description && (
              <div className="space-y-2">
                <h3 className="font-semibold apple-gray">About this artwork</h3>
                <p className="text-gray-600 leading-relaxed">{artwork.description}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Product Selection */}
          <div className="space-y-6">
            <ProductSelector
              artworkId={artwork.id}
              onProductSelect={setSelectedProduct}
              showAddToCart={false}
            />

            {/* Add to Cart Button */}
            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedProduct}
                className="flex-1 bg-apple-blue text-white hover:bg-blue-600"
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              
              <Button
                onClick={handleLike}
                variant="outline"
                disabled={likeMutation.isPending}
                className="border-artist-coral text-artist-coral hover:bg-artist-coral hover:text-white"
                size="lg"
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* More from this Artist */}
      {otherArtwork.length > 0 && (
        <div className="mt-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold apple-gray">More from {artist?.displayName}</h2>
            <Link href={`/artist/${artist?.id}`}>
              <Button variant="ghost" className="apple-blue hover:text-blue-600">
                View Artist Profile
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherArtwork.map((art: any) => (
              <ArtworkCard
                key={art.id}
                artwork={art}
                showArtist={false}
                showAddToCart={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
