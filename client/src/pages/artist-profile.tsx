import { useParams, Link } from "wouter";
import { MapPin, Calendar, Star, Users, Palette, CheckCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { ArtworkCard } from "@/components/artwork-card";
import { useState } from "react";

export default function ArtistProfile() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);

  const { data: artist, isLoading: artistLoading } = useQuery({
    queryKey: ["/api/artists", id],
    enabled: !!id,
  });

  const { data: artistUser } = useQuery({
    queryKey: ["/api/users", artist?.userId],
    enabled: !!artist?.userId,
  });

  const { data: artwork = [] } = useQuery({
    queryKey: ["/api/artwork/artist", id],
    enabled: !!id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error("Must be logged in to follow artists");
      }

      if (isFollowing) {
        const response = await apiRequest("DELETE", "/api/follow", {
          followerId: user.id,
          artistId: parseInt(id!),
        });
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/follow", {
          followerId: user.id,
          artistId: parseInt(id!),
        });
        return response.json();
      }
    },
    onSuccess: () => {
      setIsFollowing(!isFollowing);
      queryClient.invalidateQueries({ queryKey: ["/api/artists", id] });
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing 
          ? `You are no longer following ${artist?.displayName}`
          : `You are now following ${artist?.displayName}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update follow status",
        variant: "destructive",
      });
    },
  });

  const handleFollow = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow artists",
        variant: "destructive",
      });
      return;
    }

    followMutation.mutate();
  };

  if (artistLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="text-center space-y-4">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto"></div>
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6 text-center py-16">
            <h2 className="text-2xl font-bold apple-gray mb-4">Artist not found</h2>
            <p className="text-gray-600 mb-6">The artist profile you're looking for doesn't exist.</p>
            <Link href="/browse">
              <Button className="bg-apple-blue text-white hover:bg-blue-600">
                Browse Artists
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const publicArtwork = artwork.filter((art: any) => art.isPublic);
  const avatarUrl = artistUser?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.displayName}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Artist Header */}
      <div className="text-center mb-12">
        {/* Cover Image (Optional) */}
        <div className="h-48 bg-gradient-to-r from-artist-coral/20 to-artist-purple/20 rounded-2xl mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-artist-coral/10 to-artist-purple/10"></div>
        </div>

        {/* Avatar */}
        <div className="relative -mt-20 mb-6">
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-white shadow-xl">
            <img
              src={avatarUrl}
              alt={artist.displayName}
              className="w-full h-full object-cover"
            />
          </div>
          {artist.isVerified && (
            <div className="absolute bottom-2 right-1/2 transform translate-x-6">
              <div className="w-8 h-8 bg-artist-green rounded-full flex items-center justify-center text-white shadow-lg">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          )}
        </div>

        {/* Artist Info */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold apple-gray">{artist.displayName}</h1>
          
          {artist.specialties && artist.specialties.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {artist.specialties.map((specialty, index) => (
                <Badge key={index} variant="outline" className="text-artist-purple border-artist-purple">
                  {specialty}
                </Badge>
              ))}
            </div>
          )}

          {artist.bio && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {artist.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex justify-center space-x-8 pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <Palette className="h-5 w-5 text-artist-coral" />
                <span className="text-2xl font-bold apple-gray">{publicArtwork.length}</span>
              </div>
              <p className="text-sm text-gray-500">Artworks</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <Users className="h-5 w-5 text-apple-blue" />
                <span className="text-2xl font-bold apple-gray">{artist.followerCount || 0}</span>
              </div>
              <p className="text-sm text-gray-500">Followers</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold apple-gray">
                  {artist.rating ? parseFloat(artist.rating).toFixed(1) : "5.0"}
                </span>
              </div>
              <p className="text-sm text-gray-500">Rating</p>
            </div>
          </div>

          {/* Action Buttons */}
          {user?.id !== artist.userId && (
            <div className="flex justify-center space-x-4 pt-6">
              <Button
                onClick={handleFollow}
                disabled={followMutation.isPending}
                className={`px-8 py-3 font-semibold transition-all duration-200 ${
                  isFollowing
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-artist-coral text-white hover:bg-red-500"
                }`}
              >
                {followMutation.isPending
                  ? "Loading..."
                  : isFollowing
                  ? "Following"
                  : "Follow Artist"
                }
              </Button>
              
              <Button variant="outline" className="px-8 py-3">
                <Heart className="h-4 w-4 mr-2" />
                Support
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Artist Content */}
      <Tabs defaultValue="artwork" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="artwork">Artwork</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>

        {/* Artwork Tab */}
        <TabsContent value="artwork" className="space-y-8">
          {publicArtwork.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-16">
                <Palette className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold apple-gray mb-2">No public artwork yet</h3>
                <p className="text-gray-600">This artist hasn't published any artwork yet. Check back later!</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Filter/Sort Options */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold apple-gray">
                  Artwork ({publicArtwork.length})
                </h2>
                {/* Add sort/filter options here */}
              </div>

              {/* Artwork Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {publicArtwork.map((art: any) => (
                  <ArtworkCard
                    key={art.id}
                    artwork={art}
                    showArtist={false}
                    showAddToCart={true}
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bio & Details */}
            <Card>
              <CardContent className="pt-6 space-y-6">
                <h3 className="text-xl font-semibold apple-gray">About the Artist</h3>
                
                {artist.bio ? (
                  <p className="text-gray-600 leading-relaxed">{artist.bio}</p>
                ) : (
                  <p className="text-gray-400 italic">No bio available</p>
                )}

                {artistUser?.createdAt && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(artistUser.createdAt).toLocaleDateString()}</span>
                  </div>
                )}

                {artist.portfolioUrl && (
                  <div className="pt-4">
                    <a
                      href={artist.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-apple-blue hover:text-blue-600 font-medium"
                    >
                      View External Portfolio →
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats & Achievements */}
            <Card>
              <CardContent className="pt-6 space-y-6">
                <h3 className="text-xl font-semibold apple-gray">Artist Stats</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Artwork</span>
                    <span className="font-semibold apple-gray">{publicArtwork.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Sales</span>
                    <span className="font-semibold apple-gray">{artist.totalSales || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Followers</span>
                    <span className="font-semibold apple-gray">{artist.followerCount || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold apple-gray">
                        {artist.rating ? parseFloat(artist.rating).toFixed(1) : "5.0"}
                      </span>
                    </div>
                  </div>
                </div>

                {artist.isVerified && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center space-x-2 text-artist-green">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Verified Artist</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      This artist has been verified by our team
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Collections Tab */}
        <TabsContent value="collections" className="space-y-8">
          <Card>
            <CardContent className="pt-6 text-center py-16">
              <Palette className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold apple-gray mb-2">Collections Coming Soon</h3>
              <p className="text-gray-600">
                Artists will soon be able to organize their artwork into themed collections.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
