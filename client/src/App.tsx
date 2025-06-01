import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { LoadingScreen } from "@/components/loading-screen";
import { PageTransition } from "@/components/page-transition";
import { useAuth } from "@/hooks/use-auth";

// Pages
import Home from "@/pages/home";
import ProductBrowse from "@/pages/product-browse";
import ArtistProfile from "@/pages/artist-profile";
import ArtistDashboard from "@/pages/artist-dashboard";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Orders from "@/pages/orders";
import OrderDetail from "@/pages/order-detail";
import Profile from "@/pages/profile";
import ProductDetail from "@/pages/product-detail";
import Auth from "@/pages/auth";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Preparing your experience..." />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1">
        <PageTransition>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/browse" component={ProductBrowse} />
            <Route path="/product/:productId" component={ProductDetail} />
            <Route path="/artist/:id" component={ArtistProfile} />
            <Route path="/artist/dashboard" component={ArtistDashboard} />
            <Route path="/cart" component={Cart} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/orders" component={Orders} />
            <Route path="/orders/:id" component={OrderDetail} />
            <Route path="/profile" component={Profile} />
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/auth" component={Auth} />
            <Route component={NotFound} />
          </Switch>
        </PageTransition>
      </main>
      <Footer />
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
