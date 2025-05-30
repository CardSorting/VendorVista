import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";

const checkoutSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  paymentMethod: z.enum(["card", "paypal"], {
    required_error: "Please select a payment method",
  }),
});

type CheckoutData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { cartItems, cartTotal, cartCount } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      paymentMethod: "card",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (order) => {
      toast({
        title: "Order placed successfully!",
        description: `Your order #${order.id} has been confirmed`,
      });
      setLocation(`/orders/${order.id}`);
    },
    onError: (error) => {
      toast({
        title: "Order failed",
        description: error instanceof Error ? error.message : "Failed to place order",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6 text-center py-16">
            <h2 className="text-2xl font-bold apple-gray mb-4">Sign in to checkout</h2>
            <p className="text-gray-600 mb-6">You need to be signed in to complete your purchase.</p>
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

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6 text-center py-16">
            <h2 className="text-2xl font-bold apple-gray mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
            <Link href="/browse">
              <Button className="bg-apple-blue text-white hover:bg-blue-600">
                Browse Artwork
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const shippingCost = cartTotal >= 50 ? 0 : 5.99;
  const totalAmount = cartTotal + shippingCost;

  const onSubmit = async (data: CheckoutData) => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const shippingAddress = `${data.firstName} ${data.lastName}\n${data.address}\n${data.city}, ${data.state} ${data.zipCode}\n${data.country}`;

    const orderData = {
      userId: user!.id,
      totalAmount: totalAmount.toFixed(2),
      shippingAddress,
      cartItems: cartItems.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      })),
    };

    createOrderMutation.mutate(orderData);
    setIsProcessing(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/cart">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
        </Link>
        <h1 className="text-4xl font-bold apple-gray">Checkout</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-8 h-8 bg-apple-blue text-white rounded-full flex items-center justify-center mr-3 text-sm font-semibold">
                      1
                    </div>
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-8 h-8 bg-apple-blue text-white rounded-full flex items-center justify-center mr-3 text-sm font-semibold">
                      2
                    </div>
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="NY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="10001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="United States" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <div className="w-8 h-8 bg-apple-blue text-white rounded-full flex items-center justify-center mr-3 text-sm font-semibold">
                      3
                    </div>
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-3"
                          >
                            <div className="flex items-center space-x-3 p-4 border rounded-lg">
                              <RadioGroupItem value="card" id="card" />
                              <Label htmlFor="card" className="flex items-center space-x-3 flex-1 cursor-pointer">
                                <CreditCard className="h-5 w-5 text-gray-500" />
                                <div>
                                  <div className="font-medium">Credit/Debit Card</div>
                                  <div className="text-sm text-gray-500">Visa, Mastercard, American Express</div>
                                </div>
                              </Label>
                            </div>
                            
                            <div className="flex items-center space-x-3 p-4 border rounded-lg">
                              <RadioGroupItem value="paypal" id="paypal" />
                              <Label htmlFor="paypal" className="flex items-center space-x-3 flex-1 cursor-pointer">
                                <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                                  P
                                </div>
                                <div>
                                  <div className="font-medium">PayPal</div>
                                  <div className="text-sm text-gray-500">Pay with your PayPal account</div>
                                </div>
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Items */}
                  <div className="space-y-4">
                    {cartItems.map((item: any) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.product.artwork.imageUrl}
                            alt={item.product.artwork.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium apple-gray truncate">
                            {item.product.artwork.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.product.productType.name} × {item.quantity}
                          </p>
                        </div>
                        <div className="font-medium">
                          ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>
                        {shippingCost === 0 ? (
                          <span className="text-artist-green">Free</span>
                        ) : (
                          `$${shippingCost.toFixed(2)}`
                        )}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="apple-gray">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <Button
                    type="submit"
                    disabled={isProcessing || createOrderMutation.isPending}
                    className="w-full bg-artist-coral text-white hover:bg-red-500"
                    size="lg"
                  >
                    {isProcessing || createOrderMutation.isPending ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Complete Order
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-artist-green" />
                      <span>SSL encrypted checkout</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-artist-green" />
                      <span>Free returns within 30 days</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-artist-green" />
                      <span>100% satisfaction guarantee</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
