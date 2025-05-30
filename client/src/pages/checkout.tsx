import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { CartItemWithDetails } from '@/lib/types';

const shippingAddressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required')
});

type ShippingAddressForm = z.infer<typeof shippingAddressSchema>;

export default function Checkout() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { items: cartItems, clearCart } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<ShippingAddressForm>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States'
    }
  });

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.product.price);
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);

  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const createOrderMutation = useMutation({
    mutationFn: async (data: ShippingAddressForm) => {
      return apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress: data
        })
      });
    },
    onSuccess: async (order) => {
      // Process payment
      try {
        const paymentResponse = await apiRequest(`/api/orders/${order.id}/payment`, {
          method: 'POST',
          body: JSON.stringify({})
        });

        // In a real implementation, you would integrate with Stripe or another payment processor here
        // For now, we'll simulate a successful payment
        
        await apiRequest(`/api/orders/${order.id}/confirm`, {
          method: 'POST',
          body: JSON.stringify({
            paymentIntentId: 'pi_simulated_success'
          })
        });

        // Clear cart and redirect to success page
        clearCart();
        queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
        
        toast({
          title: "Order placed successfully!",
          description: `Your order #${order.id} has been confirmed.`
        });

        navigate(`/orders/${order.id}`);
      } catch (error) {
        toast({
          title: "Payment failed",
          description: "There was an issue processing your payment. Please try again.",
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Order creation failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (data: ShippingAddressForm) => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to place an order.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before checking out.",
        variant: "destructive"
      });
      navigate('/cart');
      return;
    }

    setIsProcessing(true);
    try {
      await createOrderMutation.mutateAsync(data);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please sign in to continue with checkout.
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Cart is Empty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Add some artwork to your cart before checking out.
            </p>
            <Button onClick={() => navigate('/browse')} className="w-full">
              Browse Artwork
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      {...form.register('fullName')}
                      placeholder="Enter your full name"
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="addressLine1">Address Line 1</Label>
                    <Input
                      id="addressLine1"
                      {...form.register('addressLine1')}
                      placeholder="Street address"
                    />
                    {form.formState.errors.addressLine1 && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.addressLine1.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                    <Input
                      id="addressLine2"
                      {...form.register('addressLine2')}
                      placeholder="Apartment, suite, etc."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...form.register('city')}
                        placeholder="City"
                      />
                      {form.formState.errors.city && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.city.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        {...form.register('state')}
                        placeholder="State"
                      />
                      {form.formState.errors.state && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.state.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        {...form.register('postalCode')}
                        placeholder="ZIP Code"
                      />
                      {form.formState.errors.postalCode && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.postalCode.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        {...form.register('country')}
                        placeholder="Country"
                      />
                      {form.formState.errors.country && (
                        <p className="text-sm text-red-500 mt-1">
                          {form.formState.errors.country.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <img
                        src={item.product.artwork.imageUrl}
                        alt={item.product.artwork.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.artwork.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.product.productType.name} by {item.product.artwork.artist.displayName}
                        </p>
                        <p className="text-sm">
                          Qty: {item.quantity} × ${item.product.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${(parseFloat(item.product.price) * (item.quantity || 1)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {shipping === 0 && (
                    <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        🎉 You qualify for free shipping!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}