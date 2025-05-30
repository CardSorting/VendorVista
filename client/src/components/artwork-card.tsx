import { useState } from "react";
import { Link } from "wouter";
import { Heart, Eye, ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface ArtworkCardProps {
  artwork: {
    id: number;
    title: string;
    imageUrl: string;
    viewCount?: number;
    likeCount?: number;
    isTrending?: boolean;
    artist?: {
      id: number;
      displayName: string;
      isVerified?: boolean;
    };
    products?: Array<{
      id: number;
      price: string;
      productType: {
        name: string;
      };
    }>;
  };
  showArtist?: boolean;
  showAddToCart?: boolean;
}

export function ArtworkCard({ artwork, showArtist = true, showAddToCart = false }: ArtworkCardProps) {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error("Must be logged in to like artwork");
      }

      if (isLiked) {
        const response = await apiRequest("DELETE", "/api/like", {
          userId: user.id,
          artworkId: artwork.id,
        });
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/like", {
          userId: user.id,
          artworkId: artwork.id,
        });
        return response.json();
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ["/api/artwork"] });
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

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleAddToCart = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    addToCart({ productId });
    toast({
      title: "Added to cart",
      description: "Item has been added to your cart",
    });
  };

  const startingPrice = artwork.products && artwork.products.length > 0
    ? Math.min(...artwork.products.map(p => parseFloat(p.price)))
    : null;

  return (
    <Card className="group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      <Link href={`/artwork/${artwork.id}`}>
        <div className="relative overflow-hidden">
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Overlay badges */}
          <div className="absolute top-4 left-4">
            {artwork.isTrending && (
              <Badge className="bg-artist-coral text-white">
                Trending
              </Badge>
            )}
          </div>

          {/* Like button */}
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={likeMutation.isPending}
              className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-600 hover:text-artist-coral transition-colors p-0"
            >
              <Heart 
                className={`h-4 w-4 ${isLiked ? 'fill-current text-artist-coral' : ''}`}
              />
            </Button>
          </div>

          {/* Stats overlay */}
          <div className="absolute bottom-4 left-4 flex items-center space-x-4 text-white text-sm">
            {artwork.viewCount !== undefined && (
              <div className="flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
                <Eye className="h-3 w-3" />
                <span>{artwork.viewCount}</span>
              </div>
            )}
            {artwork.likeCount !== undefined && (
              <div className="flex items-center space-x-1 bg-black/50 rounded-full px-2 py-1">
                <Heart className="h-3 w-3" />
                <span>{artwork.likeCount}</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="p-6">
        <Link href={`/artwork/${artwork.id}`}>
          <h3 className="font-bold text-lg apple-gray mb-2 group-hover:text-apple-blue transition-colors">
            {artwork.title}
          </h3>
        </Link>

        {showArtist && artwork.artist && (
          <Link href={`/artist/${artwork.artist.id}`}>
            <p className="text-sm text-gray-500 mb-4 hover:text-apple-blue transition-colors flex items-center">
              by @{artwork.artist.displayName}
              {artwork.artist.isVerified && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Verified
                </Badge>
              )}
            </p>
          </Link>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {artwork.products && artwork.products.length > 0 && (
              <>
                <span className="text-xs text-gray-400">Available on:</span>
                <div className="flex space-x-1">
                  {artwork.products.slice(0, 2).map((product, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {product.productType.name}
                    </Badge>
                  ))}
                  {artwork.products.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{artwork.products.length - 2}
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {startingPrice && (
              <span className="font-bold apple-gray">
                from ${startingPrice.toFixed(0)}
              </span>
            )}

            {showAddToCart && artwork.products && artwork.products.length > 0 && (
              <Button
                size="sm"
                onClick={(e) => handleAddToCart(e, artwork.products![0].id)}
                className="bg-apple-blue text-white hover:bg-blue-600"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
