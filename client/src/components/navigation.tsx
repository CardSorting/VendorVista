import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Heart, ShoppingCart, Menu, User, Plus, Filter, Shirt, Coffee, Phone, Gift, Star, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useQuery } from "@tanstack/react-query";
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
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const productCategories = [
    { name: "T-Shirts", icon: Shirt, href: "/browse?product=t-shirts" },
    { name: "Mugs", icon: Coffee, href: "/browse?product=mugs" },
    { name: "Phone Cases", icon: Phone, href: "/browse?product=phone-cases" },
    { name: "Stickers", icon: Star, href: "/browse?product=stickers" },
    { name: "Gifts", icon: Gift, href: "/browse?product=gifts" },
  ];

  const quickLinks = [
    { href: "/browse?trending=true", label: "Trending", badge: "Hot" },
    { href: "/browse?new=true", label: "New Arrivals" },
    { href: "/browse?sale=true", label: "On Sale", badge: "Save" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      {/* Top Bar - Ecommerce Style */}
      <div className="bg-blue-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="hidden sm:flex items-center space-x-6">
              <span className="flex items-center">
                <Star className="h-3 w-3 mr-1" />
                Free shipping on orders over $50
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/help" className="hover:text-blue-200 transition-colors">Help</Link>
              <Link href="/track-order" className="hover:text-blue-200 transition-colors">Track Order</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              <span className="text-blue-600">Artist</span>Market
            </h1>
          </Link>

          {/* Enhanced Search Bar */}
          <div className="flex-1 max-w-2xl mx-4 lg:mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-l-full border-r-0 px-3 sm:px-4 bg-gray-50 hover:bg-gray-100">
                      <Grid3X3 className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">All</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/browse" className="flex items-center">
                        <Grid3X3 className="h-4 w-4 mr-2" />
                        All Products
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {productCategories.map((category) => (
                      <DropdownMenuItem key={category.name} asChild>
                        <Link href={category.href} className="flex items-center">
                          <category.icon className="h-4 w-4 mr-2" />
                          {category.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Search for designs, products, or artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-none border-l-0 border-r-0 focus:ring-0 focus:border-blue-500 pl-4 pr-12"
                  />
                  <Button 
                    type="submit"
                    className="absolute right-0 top-0 bottom-0 rounded-r-full px-4 sm:px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Search</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Desktop Navigation - Right Side */}
          <div className="flex items-center space-x-4">
            {/* Quick Links */}
            <div className="hidden lg:flex items-center space-x-6">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors flex items-center"
                >
                  {link.label}
                  {link.badge && (
                    <Badge className="ml-1 bg-red-500 text-white text-xs px-1">
                      {link.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>

            {/* Wishlist & Cart Icons */}
            <div className="flex items-center space-x-2">
              {isAuthenticated && (
                <Link
                  href="/wishlist"
                  className="text-gray-600 hover:text-blue-600 transition-colors relative p-2 hover:bg-gray-100 rounded-full"
                  title="Wishlist"
                >
                  <Heart className="h-5 w-5" />
                </Link>
              )}
              
              <Link
                href="/cart"
                className="text-gray-600 hover:text-blue-600 transition-colors relative p-2 hover:bg-gray-100 rounded-full"
                title="Shopping Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white rounded-full">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {user?.isArtist && (
                  <Link href="/artist/dashboard">
                    <Button variant="outline" size="sm" className="border-artist-coral text-artist-coral hover:bg-artist-coral hover:text-white">
                      <Plus className="h-4 w-4 mr-1" />
                      Create
                    </Button>
                  </Link>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{user?.username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    {user?.isArtist && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/artist/dashboard">Artist Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/artist/analytics">Analytics</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/orders">Order History</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {!user?.isArtist && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/become-artist">Become an Artist</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={logout}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth">
                  <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                    Start Selling
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-6">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </form>

                  {/* Mobile Product Categories */}
                  {productCategories.slice(0, 4).map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2 flex items-center"
                    >
                      <category.icon className="h-4 w-4 mr-2" />
                      {category.name}
                    </Link>
                  ))}
                  
                  {/* Mobile Quick Links */}
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2 flex items-center"
                    >
                      {link.label}
                      {link.badge && (
                        <Badge className="ml-2 bg-red-500 text-white text-xs px-1">
                          {link.badge}
                        </Badge>
                      )}
                    </Link>
                  ))}

                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/wishlist"
                        className="text-sm font-medium text-gray-700 hover:text-apple-blue transition-colors py-2 flex items-center"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Wishlist
                      </Link>
                      <Link
                        href="/cart"
                        className="text-sm font-medium text-gray-700 hover:text-apple-blue transition-colors py-2 flex items-center"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Cart
                        {cartCount > 0 && (
                          <Badge className="ml-2 bg-artist-coral text-white">
                            {cartCount}
                          </Badge>
                        )}
                      </Link>
                      {user?.isArtist && (
                        <Link
                          href="/artist/dashboard"
                          className="text-sm font-medium text-gray-700 hover:text-apple-blue transition-colors py-2"
                        >
                          Artist Dashboard
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        className="text-sm font-medium text-gray-700 hover:text-apple-blue transition-colors py-2"
                      >
                        Profile
                      </Link>
                      <Button
                        variant="outline"
                        onClick={logout}
                        className="justify-start"
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <a href="/auth/login">
                        <Button variant="outline" className="w-full">
                          Sign In
                        </Button>
                      </a>
                      <a href="/auth/login">
                        <Button className="w-full bg-artist-coral text-white hover:bg-red-500">
                          Start Selling
                        </Button>
                      </a>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation Bar - Product Categories */}
      <div className="bg-gray-50 border-t hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Shop by Category
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {productCategories.map((category) => (
                    <DropdownMenuItem key={category.name} asChild>
                      <Link href={category.href} className="flex items-center">
                        <category.icon className="h-4 w-4 mr-3" />
                        {category.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors flex items-center"
                >
                  {link.label}
                  {link.badge && (
                    <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5">
                      {link.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <Link href="/help" className="hover:text-blue-600 transition-colors">Customer Service</Link>
              <Link href="/gift-cards" className="hover:text-blue-600 transition-colors">Gift Cards</Link>
              <Link href="/bulk-orders" className="hover:text-blue-600 transition-colors">Bulk Orders</Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
