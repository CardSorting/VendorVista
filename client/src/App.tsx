import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { useAuth } from "@/hooks/use-auth";

// Pages
import Home from "@/pages/home";
import Browse from "@/pages/browse";
import ArtworkDetail from "@/pages/artwork-detail";
import ArtistProfile from "@/pages/artist-profile";
import ArtistDashboard from "@/pages/artist-dashboard";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Auth from "@/pages/auth";
import NotFound from "@/pages/not-found";

function Router() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/browse" component={Browse} />
        <Route path="/artwork/:id" component={ArtworkDetail} />
        <Route path="/artist/:id" component={ArtistProfile} />
        <Route path="/artist/dashboard" component={ArtistDashboard} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/auth" component={Auth} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
