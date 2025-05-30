import { useState } from "react";
import { Link } from "wouter";
import { CheckCircle, Users, Star, Palette } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface ArtistCardProps {
  artist: {
    id: number;
    displayName: string;
    bio?: string | null;
    isVerified?: boolean | null;
    rating?: string | null;
    followerCount?: number | null;
    totalSales?: number | null;
    specialties?: string[] | null;
    user?: {
      avatarUrl?: string | null;
    };
  };
  showFollowButton?: boolean;
}

export function ArtistCard({ artist, showFollowButton = true }: ArtistCardProps) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error("Must be logged in to follow artists");
      }

      if (isFollowing) {
        const response = await apiRequest("DELETE", "/api/follow", {
          followerId: user.id,
          artistId: artist.id,
        });
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/follow", {
          followerId: user.id,
          artistId: artist.id,
        });
        return response.json();
      }
    },
    onSuccess: () => {
      setIsFollowing(!isFollowing);
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] });
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing 
          ? `You are no longer following ${artist.displayName}`
          : `You are now following ${artist.displayName}`,
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

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const avatarUrl = artist.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.displayName}`;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <CardContent className="pt-6">
        <Link href={`/artist/${artist.id}`}>
          <div className="text-center">
            {/* Avatar */}
            <div className="relative mb-6">
              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden ring-4 ring-artist-coral/20 group-hover:ring-artist-coral/40 transition-all duration-300">
                <img
                  src={avatarUrl}
                  alt={artist.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              {artist.isVerified && (
                <div className="absolute bottom-0 right-6">
                  <div className="w-6 h-6 bg-artist-green rounded-full flex items-center justify-center text-white">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </div>
              )}
            </div>

            {/* Artist Info */}
            <h3 className="text-xl font-bold apple-gray mb-2 group-hover:text-apple-blue transition-colors">
              {artist.displayName}
            </h3>

            {artist.specialties && artist.specialties.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 mb-4">
                {artist.specialties.slice(0, 2).map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
                {artist.specialties.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{artist.specialties.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {artist.bio && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {artist.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex justify-center space-x-6 mb-6 text-sm text-gray-500">
              <div className="text-center">
                <div className="font-semibold apple-gray flex items-center justify-center">
                  <Palette className="h-4 w-4 mr-1" />
                  {artist.totalSales || 0}
                </div>
                <div className="text-xs">Sales</div>
              </div>
              <div className="text-center">
                <div className="font-semibold apple-gray flex items-center justify-center">
                  <Users className="h-4 w-4 mr-1" />
                  {artist.followerCount || 0}
                </div>
                <div className="text-xs">Followers</div>
              </div>
              {artist.rating && parseFloat(artist.rating) > 0 && (
                <div className="text-center">
                  <div className="font-semibold apple-gray flex items-center justify-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    {parseFloat(artist.rating).toFixed(1)}
                  </div>
                  <div className="text-xs">Rating</div>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Follow Button */}
        {showFollowButton && user?.id !== artist.id && (
          <Button
            onClick={handleFollow}
            disabled={followMutation.isPending}
            className={`w-full font-medium transition-all duration-200 ${
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
        )}
      </CardContent>
    </Card>
  );
}
