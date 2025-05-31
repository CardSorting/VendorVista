import { useParams, Link, useLocation } from "wouter";
import { ArrowLeft, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import type { Product, ProductType, Artwork, Artist } from "@shared/schema";

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { addToCart, cartCount, cartItems, isAddingToCart } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: [`/api/product/${productId}`],
    enabled: !!productId,
  });

  // Extract nested data from the product response
  const artwork = (product as any)?.artwork;
  const productType = (product as any)?.productType;
  const artist = artwork?.artist;

  const handleAddToCart = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your cart.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    addToCart({ productId: parseInt(productId!), quantity }, {
      onSuccess: () => {
        setJustAdded(true);
        toast({
          title: "Added to cart!",
          description: `${quantity} ${productType?.name || 'item'}(s) added to your cart successfully.`,
          duration: 3000,
        });
        // Reset quantity to 1 after successful add
        setQuantity(1);
        // Clear the "just added" state after 2 seconds
        setTimeout(() => setJustAdded(false), 2000);
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Failed to add item to cart",
          variant: "destructive",
          duration: 5000,
        });
      },
    });
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">Product not found</h3>
            <p className="text-gray-600 mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => setLocation('/browse')}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const finalPrice = (product as any)?.price ? parseFloat((product as any).price) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/browse" className="hover:text-blue-600">Browse</Link>
          <span>/</span>
          <span className="text-gray-900">{artwork?.title} - {productType?.name}</span>
        </div>

        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/browse')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-white shadow-sm">
              <img
                src={artwork?.imageUrl || "/placeholder-image.jpg"}
                alt={artwork?.title}
                className="w-full h-full object-cover"
              />
            </div>
            {artwork?.tags && (
              <div className="flex flex-wrap gap-2">
                {artwork.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Title and Artist */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {artwork?.title} - {productType?.name}
              </h1>
              {artist && (
                <p className="text-lg text-gray-600">
                  by <span className="text-blue-600 font-medium">
                    {artist.displayName}
                  </span>
                </p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="text-3xl font-bold text-gray-900">
                ${finalPrice.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600">
                {productType?.description}
              </p>
            </div>

            {/* Product Options */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={!(product as any)?.isActive || isAddingToCart}
                className={`w-full py-3 text-white transition-all duration-300 ${
                  justAdded 
                    ? "bg-green-500 hover:bg-green-600" 
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
                size="lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isAddingToCart 
                  ? "Adding..." 
                  : justAdded 
                    ? "Added to Cart!" 
                    : "Add to Cart"
                }
              </Button>
              
              {!(product as any)?.isActive && (
                <p className="text-sm text-red-600 text-center">
                  This product is currently unavailable
                </p>
              )}
            </div>

            {/* Additional Actions */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                <Heart className="h-4 w-4 mr-2" />
                Save for Later
              </Button>
              <Button variant="outline" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            <Separator />

            {/* Product Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck className="h-5 w-5" />
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="h-5 w-5" />
                <span>Satisfaction guarantee</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <RotateCcw className="h-5 w-5" />
                <span>30-day return policy</span>
              </div>
            </div>

            {/* Product Description */}
            {artwork?.description && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3">About this artwork</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {artwork.description}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}