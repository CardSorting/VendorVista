import { Link, useLocation } from "wouter";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { toast } from "@/hooks/use-toast";

export default function Cart() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const {
    cartItems,
    cartCount,
    cartTotal,
    isLoading,
    updateCart,
    removeFromCart,
    isUpdatingCart,
    isRemovingFromCart,
  } = useCart();

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6 text-center py-16">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold apple-gray mb-4">Sign in to view your cart</h2>
            <p className="text-gray-600 mb-6">You need to be signed in to manage your shopping cart.</p>
            <Link href="/auth?mode=login">
              <Button className="bg-apple-blue text-white hover:bg-blue-600">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleUpdateQuantity = (itemId: number, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    updateCart({ id: itemId, quantity: newQuantity });
  };

  const handleRemoveItem = (itemId: number) => {
    removeFromCart(itemId);
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before checking out",
        variant: "destructive",
      });
      return;
    }
    setLocation("/checkout");
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold apple-gray mb-4">Shopping Cart</h1>
        <p className="text-gray-600">
          {cartCount === 0 
            ? "Your cart is empty" 
            : `${cartCount} item${cartCount !== 1 ? 's' : ''} in your cart`
          }
        </p>
      </div>

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-16">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold apple-gray mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Discover amazing artwork and add items to get started</p>
            <Link href="/browse">
              <Button className="bg-apple-blue text-white hover:bg-blue-600">
                Browse Artwork
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    {/* Product Image */}
                    <Link href={`/product/${item.product.id}`}>
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                        <img
                          src={item.product.artwork.imageUrl}
                          alt={item.product.artwork.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.product.id}`}>
                        <h3 className="font-semibold apple-gray hover:text-apple-blue transition-colors cursor-pointer">
                          {item.product.artwork.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500">
                        by {item.product.artwork.artist.displayName}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">{item.product.productType.name}</Badge>
                        <span className="text-sm text-gray-500">
                          ${parseFloat(item.product.price).toFixed(2)} each
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                        disabled={isUpdatingCart}
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                        disabled={isUpdatingCart}
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <div className="font-semibold apple-gray">
                        ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isRemovingFromCart}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {cartTotal >= 50 ? (
                        <span className="text-artist-green">Free</span>
                      ) : (
                        "$5.99"
                      )}
                    </span>
                  </div>

                  {cartTotal < 50 && (
                    <div className="text-sm text-gray-500">
                      <p>Free shipping on orders over $50</p>
                      <p>Add ${(50 - cartTotal).toFixed(2)} more to qualify</p>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="apple-gray">
                      ${(cartTotal + (cartTotal >= 50 ? 0 : 5.99)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full bg-artist-coral text-white hover:bg-red-500"
                  size="lg"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <Link href="/browse">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-artist-green rounded-full mt-2 flex-shrink-0"></div>
                    <p>Free returns within 30 days</p>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-artist-green rounded-full mt-2 flex-shrink-0"></div>
                    <p>Secure checkout with SSL encryption</p>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-artist-green rounded-full mt-2 flex-shrink-0"></div>
                    <p>Support independent artists with every purchase</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
