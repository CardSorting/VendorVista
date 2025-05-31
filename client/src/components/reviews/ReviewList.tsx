import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, Verified } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import StarRating from "./StarRating";
import { apiRequest } from "@/lib/queryClient";

interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean | null;
  isHelpful: number;
  createdAt: string;
  user: {
    id: number;
    username: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  } | null;
}

interface ReviewListProps {
  productId: number;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["/api/products", productId, "reviews"],
    queryFn: () => apiRequest(`/api/products/${productId}/reviews`, "GET")
  });

  const { data: rating } = useQuery({
    queryKey: ["/api/products", productId, "rating"],
    queryFn: () => apiRequest(`/api/products/${productId}/rating`, "GET")
  });

  const handleMarkHelpful = async (reviewId: number) => {
    try {
      await apiRequest(`/api/reviews/${reviewId}/helpful`, "POST");
      // You might want to refetch or update the review data here
    } catch (error) {
      console.error("Failed to mark review as helpful:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {rating && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {rating.averageRating.toFixed(1)}
              </div>
              <StarRating rating={rating.averageRating} size="sm" />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Based on {rating.totalReviews} review{rating.totalReviews !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No reviews yet. Be the first to review this product!
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review: Review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {review.user?.firstName?.[0] || review.user?.username?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {review.user?.firstName && review.user?.lastName 
                            ? `${review.user.firstName} ${review.user.lastName}`
                            : review.user?.username || "Anonymous"}
                        </span>
                        {review.isVerified && (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <Verified className="w-4 h-4" />
                            <span className="text-xs">Verified Purchase</span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} size="sm" />
                    </div>

                    {review.title && (
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {review.title}
                      </h4>
                    )}

                    {review.comment && (
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {review.comment}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkHelpful(review.id)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        Helpful ({review.isHelpful})
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}