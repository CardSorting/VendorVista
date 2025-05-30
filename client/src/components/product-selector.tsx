import { useState } from "react";
import { Check, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface ProductSelectorProps {
  artworkId: number;
  onProductSelect?: (productId: number) => void;
  showAddToCart?: boolean;
}

export function ProductSelector({ artworkId, onProductSelect, showAddToCart = true }: ProductSelectorProps) {
  const { isAuthenticated } = useAuth();
  const { addToCart, isAddingToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products/artwork", artworkId],
    queryFn: async () => {
      console.log(`Fetching products for artwork ${artworkId}`);
      const response = await fetch(`/api/products/artwork/${artworkId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Received products:`, data);
      return data;
    },
    enabled: !!artworkId,
  });

  const { data: productTypes = [] } = useQuery({
    queryKey: ["/api/product-types"],
  });

  const handleProductSelect = (productId: number) => {
    setSelectedProduct(productId);
    onProductSelect?.(productId);
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const availableProducts = Array.isArray(products) ? products.filter((product: any) => product.isActive) : [];

  if (availableProducts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No products available for this artwork yet.</p>
        <p className="text-sm text-gray-400">Check back later for new product options!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Available Products</h3>
        {showAddToCart && selectedProduct && (
          <Button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="bg-apple-blue text-white hover:bg-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableProducts.map((product: any) => {
          const productType = productTypes.find((pt: any) => pt.id === product.productTypeId);
          const isSelected = selectedProduct === product.id;

          return (
            <Card
              key={product.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected
                  ? "ring-2 ring-apple-blue shadow-lg"
                  : "hover:ring-1 hover:ring-gray-300"
              }`}
              onClick={() => handleProductSelect(product.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base apple-gray">
                      {productType?.name}
                    </h4>
                    {productType?.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {productType.description}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-apple-blue rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold apple-gray">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    {product.artistMargin && (
                      <Badge variant="secondary" className="text-xs">
                        {product.artistMargin}% to artist
                      </Badge>
                    )}
                  </div>
                  
                  {productType?.basePrice && parseFloat(productType.basePrice) !== parseFloat(product.price) && (
                    <span className="text-sm text-gray-400 line-through">
                      ${parseFloat(productType.basePrice).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    High Quality
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Print on Demand
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!showAddToCart && selectedProduct && (
        <div className="bg-apple-light p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            Selected: <strong>{productTypes.find((pt: any) => pt.id === availableProducts.find((p: any) => p.id === selectedProduct)?.productTypeId)?.name}</strong>
          </p>
          <p className="text-lg font-semibold apple-gray mt-1">
            ${parseFloat(availableProducts.find((p: any) => p.id === selectedProduct)?.price || "0").toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
