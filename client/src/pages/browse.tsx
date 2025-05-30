import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { ArtworkCard } from "@/components/artwork-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Browse() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTrending, setShowTrending] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Parse URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const q = searchParams.get('q');
    const category = searchParams.get('category');
    const trending = searchParams.get('trending');
    const tags = searchParams.get('tags');

    if (q) setSearchQuery(q);
    if (category) setSelectedCategory(category);
    if (trending === 'true') setShowTrending(true);
    if (tags) setSelectedTags(tags.split(','));
  }, [location]);

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: artwork = [], isLoading } = useQuery({
    queryKey: [
      "/api/artwork",
      {
        categoryId: selectedCategory && selectedCategory !== "all" ? parseInt(selectedCategory) : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        trending: showTrending,
        q: searchQuery,
      },
    ],
    queryFn: ({ queryKey }) => {
      const [url, filters] = queryKey as [string, any];
      const params = new URLSearchParams();
      
      if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
      if (filters.tags) params.append('tags', filters.tags.join(','));
      if (filters.trending) params.append('trending', 'true');
      if (filters.q) params.append('q', filters.q);
      
      return fetch(`${url}?${params}`).then(res => res.json());
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will trigger automatically due to the dependency
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedTags([]);
    setShowTrending(false);
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedTags.length > 0 || showTrending;

  // Popular tags (mock data)
  const popularTags = [
    "digital", "watercolor", "abstract", "nature", "geometric", 
    "vintage", "modern", "colorful", "minimalist", "illustration"
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold apple-gray mb-4">Browse Artwork</h1>
        <p className="text-gray-600">Discover unique designs from talented artists worldwide</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search for artwork, artists, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-apple-light/50"
            />
          </div>
        </form>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category: any) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={showTrending ? "default" : "outline"}
            onClick={() => setShowTrending(!showTrending)}
            className={showTrending ? "bg-artist-coral text-white" : ""}
          >
            Trending
          </Button>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">View:</span>
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")}>
              <TabsList className="grid w-20 grid-cols-2">
                <TabsTrigger value="grid" className="p-1">
                  <Grid className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="list" className="p-1">
                  <List className="h-3 w-3" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="text-red-500 hover:text-red-600">
              Clear Filters
            </Button>
          )}
        </div>

        {/* Popular Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Popular tags:</span>
          {popularTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                selectedTags.includes(tag)
                  ? "bg-artist-purple text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => {
                if (selectedTags.includes(tag)) {
                  setSelectedTags(selectedTags.filter(t => t !== tag));
                } else {
                  setSelectedTags([...selectedTags, tag]);
                }
              }}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary">
                Search: "{searchQuery}"
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary">
                Category: {categories.find((c: any) => c.id.toString() === selectedCategory)?.name}
              </Badge>
            )}
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary">
                Tag: {tag}
              </Badge>
            ))}
            {showTrending && (
              <Badge variant="secondary">
                Trending
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          {isLoading ? "Loading..." : `${artwork.length} artwork${artwork.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Artwork Grid */}
      {isLoading ? (
        <div className={`grid gap-8 ${
          viewMode === "grid" 
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1"
        }`}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : artwork.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold apple-gray mb-2">No artwork found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search criteria or browse our featured collections.
          </p>
          <Button onClick={clearFilters} className="bg-apple-blue text-white hover:bg-blue-600">
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className={`grid gap-8 ${
          viewMode === "grid" 
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1 lg:grid-cols-2"
        }`}>
          {artwork.map((art: any) => (
            <ArtworkCard
              key={art.id}
              artwork={art}
              showArtist={true}
              showAddToCart={true}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {artwork.length > 0 && artwork.length % 20 === 0 && (
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Artwork
          </Button>
        </div>
      )}
    </div>
  );
}
