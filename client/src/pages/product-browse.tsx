import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Search, Filter, Grid, List, Star, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: number;
  artworkId: number;
  productTypeId: number;
  price: string;
  isActive: boolean;
  artwork: {
    id: number;
    title: string;
    imageUrl: string;
    description?: string;
    tags?: string[];
    artist: {
      id: number;
      displayName: string;
      isVerified: boolean;
    };
    category?: {
      id: number;
      name: string;
    };
  };
  productType: {
    id: number;
    name: string;
    description?: string;
  };
}

export default function ProductBrowse() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProductType, setSelectedProductType] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "newest">("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Parse URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    const productType = searchParams.get('type');
    const tags = searchParams.get('tags');
    const sort = searchParams.get('sort');

    if (q) setSearchQuery(q);
    if (category) setSelectedCategory(category);
    if (productType) setSelectedProductType(productType);
    if (tags) setSelectedTags(tags.split(','));
    if (sort) setSortBy(sort as any);
  }, [location]);

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: productTypes = [] } = useQuery({
    queryKey: ["/api/product-types"],
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: [
      "/api/products",
      {
        categoryId: selectedCategory && selectedCategory !== "all" ? parseInt(selectedCategory) : undefined,
        productTypeId: selectedProductType && selectedProductType !== "all" ? parseInt(selectedProductType) : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        sortBy,
        q: searchQuery,
      },
    ],
    queryFn: ({ queryKey }) => {
      const [url, filters] = queryKey as [string, any];
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      return fetch(`${url}?${params}`).then(res => res.json());
    },
  });

  const filteredProducts = products.filter((product: Product) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.artwork.title.toLowerCase().includes(query) ||
      product.artwork.artist.displayName.toLowerCase().includes(query) ||
      product.productType.name.toLowerCase().includes(query) ||
      (product.artwork.tags && product.artwork.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  });

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const clearAllFilters = () => {
    setSelectedCategory("");
    setSelectedProductType("");
    setSelectedTags([]);
    setSearchQuery("");
    setPriceRange({ min: 0, max: 1000 });
    setSortBy("featured");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Products</h1>
          <p className="text-gray-600">Discover unique art on quality products from talented artists</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products, artists, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Array.isArray(categories) && categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Product Type Filter */}
            <Select value={selectedProductType} onValueChange={setSelectedProductType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {Array.isArray(productTypes) && productTypes.map((type: any) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedTags.length > 0 || selectedCategory || selectedProductType) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  {tag} ×
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {isLoading ? "Loading..." : `${filteredProducts.length} products found`}
          </p>
        </div>

        {/* Product Grid/List */}
        {isLoading ? (
          <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
            {filteredProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} viewMode={viewMode} />
            ))}
          </div>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
            <Button onClick={clearAllFilters}>Clear all filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, viewMode }: { product: Product; viewMode: "grid" | "list" }) {
  const { addToCart, isAddingToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
      await addToCart({ productId: product.id, quantity: 1 });
      toast({
        title: "Added to cart!",
        description: `${product.productType.name} added to your cart successfully.`,
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  return (
    <Link href={`/product/${product.id}`}>
      <Card className={`group cursor-pointer hover:shadow-lg transition-all duration-300 ${viewMode === "list" ? "flex" : ""}`}>
        <div className={`${viewMode === "list" ? "w-48 flex-shrink-0" : ""}`}>
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src={product.artwork.imageUrl}
              alt={product.artwork.title}
              className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                viewMode === "list" ? "h-32 w-full" : "h-64 w-full"
              }`}
            />
            <div className="absolute top-3 right-3">
              <Button size="sm" variant="secondary" className="w-8 h-8 rounded-full bg-white/90 hover:bg-white">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            {product.artwork.artist.isVerified && (
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-blue-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            )}
          </div>
        </div>
        
        <CardContent className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {product.artwork.title}
            </h3>
            <p className="text-sm text-gray-600">by {product.artwork.artist.displayName}</p>
            <div className="flex items-center gap-2">
              {product.productType && (
                <Badge variant="outline" className="text-xs">
                  {product.productType.name}
                </Badge>
              )}
              {product.artwork.category && (
                <Badge variant="outline" className="text-xs">
                  {product.artwork.category.name}
                </Badge>
              )}
            </div>
            {product.artwork.tags && (
              <div className="flex flex-wrap gap-1">
                {product.artwork.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className={`p-4 pt-0 ${viewMode === "list" ? "flex-col justify-end" : ""}`}>
          <div className="flex items-center justify-between w-full">
            <span className="text-lg font-bold text-gray-900">${product.price}</span>
            <Button 
              size="sm" 
              className="ml-2"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              <ShoppingBag className="h-4 w-4 mr-1" />
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}