import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "./use-auth";
import { CartItemWithDetails } from "@/lib/types";

export function useCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user?.id,
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: number; quantity?: number }) => {
      if (!user) throw new Error("Must be logged in to add to cart");
      
      const response = await apiRequest("POST", "/api/cart", {
        userId: user.id,
        productId,
        quantity,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const updateCartMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const response = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/cart/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const cartCount = cartItems.reduce((total: number, item: any) => total + (item.quantity || 0), 0);
  const cartTotal = cartItems.reduce((total: number, item: any) => {
    return total + (parseFloat(item.product?.price || "0") * (item.quantity || 0));
  }, 0);

  return {
    cartItems,
    cartCount,
    cartTotal,
    isLoading,
    addToCart: addToCartMutation.mutateAsync,
    updateCart: updateCartMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCart: updateCartMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
  };
}
