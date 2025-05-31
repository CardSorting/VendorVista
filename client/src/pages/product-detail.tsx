import { useParams, Link, useLocation } from "wouter";
import { ArrowLeft, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Copy, MessageCircle } from "lucide-react";
import { FaFacebook, FaTwitter, FaLinkedin, FaReddit, FaPinterest, FaTelegram } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewList from "@/components/reviews/ReviewList";
import ReviewForm from "@/components/reviews/ReviewForm";
import StarRating from "@/components/reviews/StarRating";
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
  const [showShareButtons, setShowShareButtons] = useState(false);

  // Social sharing functions
  const getProductUrl = () => {
    return `${window.location.origin}/product/${productId}`;
  };

  const shareToFacebook = () => {
    console.log('Sharing to Facebook');
    const url = encodeURIComponent(getProductUrl());
    const title = encodeURIComponent(`Check out this amazing ${productType?.name}: ${artwork?.title}`);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`;
    console.log('Facebook share URL:', shareUrl);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    console.log('Sharing to Twitter');
    const url = encodeURIComponent(getProductUrl());
    const text = encodeURIComponent(`Check out this amazing ${productType?.name}: "${artwork?.title}" by ${artist?.displayName}`);
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    console.log('Twitter share URL:', shareUrl);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    console.log('Sharing to WhatsApp');
    const url = encodeURIComponent(getProductUrl());
    const text = encodeURIComponent(`Check out this amazing ${productType?.name}: "${artwork?.title}" by ${artist?.displayName} - ${url}`);
    const shareUrl = `https://wa.me/?text=${text}`;
    console.log('WhatsApp share URL:', shareUrl);
    window.open(shareUrl, '_blank');
  };

  const shareToLinkedIn = () => {
    console.log('Sharing to LinkedIn');
    const url = encodeURIComponent(getProductUrl());
    const title = encodeURIComponent(`${artwork?.title} - ${productType?.name}`);
    const summary = encodeURIComponent(`Amazing ${productType?.name} featuring "${artwork?.title}" by ${artist?.displayName}`);
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`;
    console.log('LinkedIn share URL:', shareUrl);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareToReddit = () => {
    console.log('Sharing to Reddit');
    const url = encodeURIComponent(getProductUrl());
    const title = encodeURIComponent(`Check out this amazing ${productType?.name}: "${artwork?.title}" by ${artist?.displayName}`);
    const shareUrl = `https://reddit.com/submit?url=${url}&title=${title}`;
    console.log('Reddit share URL:', shareUrl);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareToPinterest = () => {
    console.log('Sharing to Pinterest');
    const url = encodeURIComponent(getProductUrl());
    const description = encodeURIComponent(`${artwork?.title} - ${productType?.name} by ${artist?.displayName}`);
    const media = encodeURIComponent(artwork?.imageUrl || '');
    const shareUrl = `https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`;
    console.log('Pinterest share URL:', shareUrl);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareToTelegram = () => {
    console.log('Sharing to Telegram');
    const url = encodeURIComponent(getProductUrl());
    const text = encodeURIComponent(`Check out this amazing ${productType?.name}: "${artwork?.title}" by ${artist?.displayName}`);
    const shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
    console.log('Telegram share URL:', shareUrl);
    window.open(shareUrl, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getProductUrl());
      toast({
        title: "Link copied!",
        description: "Product link has been copied to your clipboard.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link to clipboard.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: [`/api/product/${productId}`],
    enabled: !!productId,
  });

  // Extract nested data from the product response
  const artwork = (product as any)?.artwork;
  const productType = (product as any)?.productType;
  const artist = artwork?.artist;

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your cart.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    try {
      await addToCart({ productId: parseInt(productId!), quantity });
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
        duration: 5000,
      });
    }
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
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  Save for Later
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowShareButtons(!showShareButtons)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Share Buttons - Revealed on click */}
              {showShareButtons && (
                <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50 rounded-lg border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareToFacebook}
                    className="flex items-center justify-center gap-2 hover:bg-blue-50"
                  >
                    <FaFacebook className="h-4 w-4 text-blue-600" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareToTwitter}
                    className="flex items-center justify-center gap-2 hover:bg-blue-50"
                  >
                    <FaTwitter className="h-4 w-4 text-blue-400" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareToLinkedIn}
                    className="flex items-center justify-center gap-2 hover:bg-blue-50"
                  >
                    <FaLinkedin className="h-4 w-4 text-blue-700" />
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareToWhatsApp}
                    className="flex items-center justify-center gap-2 hover:bg-green-50"
                  >
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareToReddit}
                    className="flex items-center justify-center gap-2 hover:bg-orange-50"
                  >
                    <FaReddit className="h-4 w-4 text-orange-600" />
                    Reddit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareToPinterest}
                    className="flex items-center justify-center gap-2 hover:bg-red-50"
                  >
                    <FaPinterest className="h-4 w-4 text-red-600" />
                    Pinterest
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareToTelegram}
                    className="flex items-center justify-center gap-2 hover:bg-blue-50"
                  >
                    <FaTelegram className="h-4 w-4 text-blue-500" />
                    Telegram
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center justify-center gap-2 hover:bg-gray-100"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </Button>
                </div>
              )}
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