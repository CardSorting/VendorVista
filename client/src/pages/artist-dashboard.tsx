import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Plus, Upload, BarChart3, Settings, Eye, Heart, ShoppingCart, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { ArtworkCard } from "@/components/artwork-card";
import { insertArtworkSchema, insertProductSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function ArtistDashboard() {
  const { user, isAuthenticated, isSeller } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedArtwork, setSelectedArtwork] = useState<number | null>(null);

  // Allow all users to access seller dashboard for simplified onboarding
  if (!isAuthenticated) {
    setLocation("/auth?mode=login");
    return null;
  }

  const { data: artist } = useQuery({
    queryKey: ["/api/artists/user", user.id],
  });

  const { data: artwork = [] } = useQuery({
    queryKey: ["/api/artwork/artist", artist?.id],
    enabled: !!artist?.id,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: productTypes = [] } = useQuery({
    queryKey: ["/api/product-types"],
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products/artwork", selectedArtwork],
    enabled: !!selectedArtwork,
  });

  // Artwork upload form
  const artworkForm = useForm({
    resolver: zodResolver(insertArtworkSchema.extend({
      tags: insertArtworkSchema.shape.tags.optional(),
    })),
    defaultValues: {
      artistId: artist?.id || 0,
      title: "",
      description: "",
      imageUrl: "",
      tags: [],
      categoryId: undefined,
      isPublic: false,
      isTrending: false,
    },
  });

  // Product creation form
  const productForm = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      artworkId: 0,
      productTypeId: 0,
      price: "",
      artistMargin: "70",
      isActive: true,
    },
  });

  const uploadArtworkMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/artwork", data);
      return response.json();
    },
    onSuccess: (newArtwork) => {
      queryClient.invalidateQueries({ queryKey: ["/api/artwork/artist"] });
      artworkForm.reset();
      toast({
        title: "Artwork uploaded successfully",
        description: "Your artwork has been added to your portfolio",
      });
      setSelectedArtwork(newArtwork.id);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload artwork",
        variant: "destructive",
      });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/artwork"] });
      productForm.reset();
      toast({
        title: "Product created successfully",
        description: "Your product is now available for purchase",
      });
    },
    onError: (error) => {
      toast({
        title: "Product creation failed",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const onArtworkSubmit = (data: any) => {
    if (!artist?.id) return;
    
    const tags = data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [];
    uploadArtworkMutation.mutate({
      ...data,
      artistId: artist.id,
      tags,
      categoryId: data.categoryId ? parseInt(data.categoryId) : null,
    });
  };

  const onProductSubmit = (data: any) => {
    if (!selectedArtwork) {
      toast({
        title: "Select artwork",
        description: "Please select an artwork to create a product for",
        variant: "destructive",
      });
      return;
    }

    createProductMutation.mutate({
      ...data,
      artworkId: selectedArtwork,
      productTypeId: parseInt(data.productTypeId),
      price: data.price,
    });
  };

  // Calculate stats
  const totalViews = artwork.reduce((sum: number, art: any) => sum + (art.viewCount || 0), 0);
  const totalLikes = artwork.reduce((sum: number, art: any) => sum + (art.likeCount || 0), 0);
  const publishedArtwork = artwork.filter((art: any) => art.isPublic).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold apple-gray mb-4">Artist Dashboard</h1>
        <p className="text-gray-600">Manage your artwork, products, and sales</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-apple-blue" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold apple-gray">{totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-artist-coral" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Likes</p>
                <p className="text-2xl font-bold apple-gray">{totalLikes.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-artist-green" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold apple-gray">{publishedArtwork}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-artist-purple" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold apple-gray">{artist?.totalSales || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="artwork" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="artwork">My Artwork</TabsTrigger>
          <TabsTrigger value="upload">Upload New</TabsTrigger>
          <TabsTrigger value="products">Manage Products</TabsTrigger>
        </TabsList>

        {/* My Artwork Tab */}
        <TabsContent value="artwork" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold apple-gray">My Artwork</h2>
            <Link href="/artist/dashboard?tab=upload">
              <Button className="bg-artist-coral text-white hover:bg-red-500">
                <Plus className="h-4 w-4 mr-2" />
                Upload New
              </Button>
            </Link>
          </div>

          {artwork.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-16">
                <Upload className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold apple-gray mb-2">No artwork yet</h3>
                <p className="text-gray-600 mb-6">Start building your portfolio by uploading your first piece</p>
                <Link href="/artist/dashboard?tab=upload">
                  <Button className="bg-apple-blue text-white hover:bg-blue-600">
                    Upload Your First Artwork
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {artwork.map((art: any) => (
                <div key={art.id} className="relative">
                  <ArtworkCard artwork={art} showArtist={false} />
                  <div className="absolute top-2 right-2">
                    <Badge variant={art.isPublic ? "default" : "secondary"}>
                      {art.isPublic ? "Public" : "Draft"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Upload New Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload New Artwork
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...artworkForm}>
                <form onSubmit={artworkForm.handleSubmit(onArtworkSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={artworkForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter artwork title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={artworkForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category: any) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={artworkForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your artwork..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={artworkForm.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={artworkForm.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (comma-separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="digital, abstract, colorful" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center space-x-4">
                    <FormField
                      control={artworkForm.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="rounded"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Make this artwork public
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={uploadArtworkMutation.isPending}
                    className="bg-artist-coral text-white hover:bg-red-500"
                  >
                    {uploadArtworkMutation.isPending ? "Uploading..." : "Upload Artwork"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Artwork Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Artwork</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {artwork.filter((art: any) => art.isPublic).map((art: any) => (
                    <div
                      key={art.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedArtwork === art.id
                          ? "border-apple-blue bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedArtwork(art.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={art.imageUrl}
                          alt={art.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{art.title}</h4>
                          <p className="text-sm text-gray-500">
                            {art.viewCount || 0} views • {art.likeCount || 0} likes
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Product Creation */}
            <Card>
              <CardHeader>
                <CardTitle>Create Product</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedArtwork ? (
                  <div className="space-y-6">
                    {/* Existing Products */}
                    {products.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Existing Products</h4>
                        <div className="space-y-2">
                          {products.map((product: any) => {
                            const productType = productTypes.find((pt: any) => pt.id === product.productTypeId);
                            return (
                              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <span>{productType?.name}</span>
                                <span className="font-semibold">${parseFloat(product.price).toFixed(2)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Create New Product */}
                    <Form {...productForm}>
                      <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4">
                        <FormField
                          control={productForm.control}
                          name="productTypeId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select product type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {productTypes.map((type: any) => (
                                    <SelectItem key={type.id} value={type.id.toString()}>
                                      {type.name} - ${parseFloat(type.basePrice).toFixed(2)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={productForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price ($)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" placeholder="25.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={productForm.control}
                          name="artistMargin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Artist Margin (%)</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" max="100" placeholder="70" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          disabled={createProductMutation.isPending}
                          className="w-full bg-apple-blue text-white hover:bg-blue-600"
                        >
                          {createProductMutation.isPending ? "Creating..." : "Create Product"}
                        </Button>
                      </form>
                    </Form>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select an artwork to create products</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
