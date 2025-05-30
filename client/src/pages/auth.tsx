import { useEffect } from "react";
import { useLocation } from "wouter";
import { LogIn, UserPlus, Palette, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const handleLogin = () => {
    window.location.href = "/auth/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-apple-light via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-light via-white to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold apple-gray">
            <span className="text-artist-coral">Artist</span>Market
          </h1>
          <p className="mt-2 text-gray-600">
            Join our community of artists and art lovers
          </p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold">Welcome</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {/* Features */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Palette className="h-5 w-5 text-artist-coral" />
                  <span>Showcase and sell your artwork</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <ShoppingBag className="h-5 w-5 text-apple-blue" />
                  <span>Discover unique art from talented artists</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <UserPlus className="h-5 w-5 text-purple-500" />
                  <span>Join a community of art enthusiasts</span>
                </div>
              </div>

              {/* Login Button */}
              <Button
                onClick={handleLogin}
                className="w-full bg-apple-blue text-white hover:bg-blue-600 transition-all duration-200"
                size="lg"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Continue with Auth0
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>
            By continuing, you agree to our{" "}
            <a href="#" className="text-apple-blue hover:text-blue-600">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-apple-blue hover:text-blue-600">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
