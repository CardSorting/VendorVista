import { useState, useEffect, useRef } from "react";
import { User } from "@shared/schema";

// Global cache to prevent multiple simultaneous auth checks
let authCache: { user: User | null; timestamp: number } | null = null;
let activeAuthRequest: Promise<User | null> | null = null;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      checkAuthStatus();
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check cache first
      if (authCache && (Date.now() - authCache.timestamp) < CACHE_DURATION) {
        setUser(authCache.user);
        setIsLoading(false);
        return;
      }

      // If there's already an active request, wait for it
      if (activeAuthRequest) {
        const cachedUser = await activeAuthRequest;
        setUser(cachedUser);
        setIsLoading(false);
        return;
      }

      // Make new request
      activeAuthRequest = fetch("/api/auth/user", {
        credentials: 'include',
        cache: 'no-cache'
      })
        .then(async (response) => {
          if (response.ok) {
            const userData = await response.json();
            return userData;
          }
          return null;
        })
        .catch(() => null);

      const authUser = await activeAuthRequest;
      
      // Update cache
      authCache = {
        user: authUser,
        timestamp: Date.now()
      };

      setUser(authUser);
    } catch (error) {
      console.log("Authentication check failed");
      setUser(null);
      authCache = { user: null, timestamp: Date.now() };
    } finally {
      setIsLoading(false);
      activeAuthRequest = null;
    }
  };

  const login = () => {
    window.location.href = "/api/login";
  };

  const logout = () => {
    // Clear cache on logout
    authCache = null;
    setUser(null);
    window.location.href = "/api/logout";
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      // Update cache
      authCache = {
        user: updatedUser,
        timestamp: Date.now()
      };
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };
}
