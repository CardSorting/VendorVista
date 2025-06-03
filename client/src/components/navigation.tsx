import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Heart, ShoppingCart, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navigation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout, isAdmin, isSeller } = useAuth();
  const { cartCount } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      {/* Top Banner */}
      <div className="bg-blue-600 text-white py-2 text-center">
        <p className="text-sm">Free shipping on orders over $50</p>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              <span className="text-blue-600">Artist</span>Market
            </h1>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder="Search for designs and products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 rounded-full border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <Button 
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full px-3"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link href="/browse" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                Browse
              </Link>
              <Link href="/browse?trending=true" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                Trending
              </Link>
            </nav>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition-all duration-200">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full animate-pulse">
                  {cartCount}
                </Badge>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="font-medium">Your Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">Your Orders</Link>
                  </DropdownMenuItem>
                  
                  {/* Role-based navigation */}
                  {user?.roles && user.roles.length > 0 && (
                    <div className="px-2 py-1">
                      <div className="text-xs text-gray-500 font-medium">
                        Role: {user.roles.join(', ')}
                      </div>
                    </div>
                  )}
                  
                  {/* All authenticated users can access seller dashboard */}
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/seller/dashboard">Seller Dashboard</Link>
                    </DropdownMenuItem>
                  </>
                  
                  {isAdmin() && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Panel</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button size="sm">Sign In</Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col space-y-6 mt-6">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch}>
                      <Input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </form>

                    {/* Mobile Navigation */}
                    <nav className="flex flex-col space-y-4">
                      <Link href="/browse" className="text-lg font-medium">
                        Browse
                      </Link>
                      <Link href="/browse?trending=true" className="text-lg font-medium">
                        Trending
                      </Link>
                      
                      {isAuthenticated ? (
                        <>
                          <Link href="/profile" className="text-lg font-medium">
                            My Account
                          </Link>
                          <Link href="/orders" className="text-lg font-medium">
                            My Orders
                          </Link>
                          <Link href="/cart" className="text-lg font-medium">
                            Cart {cartCount > 0 && `(${cartCount})`}
                          </Link>
                          <Link href="/seller/dashboard" className="text-lg font-medium">
                            Seller Dashboard
                          </Link>
                          <Button 
                            onClick={logout} 
                            variant="ghost" 
                            className="justify-start px-0 text-red-600"
                          >
                            Sign Out
                          </Button>
                        </>
                      ) : (
                        <Link href="/auth">
                          <Button className="w-full">Sign In</Button>
                        </Link>
                      )}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}