import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Heart, ShoppingCart, Menu, User, Plus } from "lucide-react";
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
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { href: "/browse", label: "Browse" },
    { href: "/artists", label: "Artists" },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold apple-gray">
              <span className="artist-coral">Artist</span>Market
            </h1>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search artwork, artists, or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-apple-light/50 border-gray-200 rounded-full focus:ring-2 focus:ring-apple-blue focus:border-transparent"
              />
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-apple-blue transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && (
              <>
                <Link
                  href="/wishlist"
                  className="text-sm font-medium text-gray-700 hover:text-apple-blue transition-colors flex items-center"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Wishlist
                </Link>

                <Link
                  href="/cart"
                  className="text-sm font-medium text-gray-700 hover:text-apple-blue transition-colors flex items-center relative"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Cart
                  {cartCount > 0 && (
                    <Badge className="ml-1 bg-artist-coral text-white">
                      {cartCount}
                    </Badge>
                  )}
                </Link>
              </>
            )}

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
              <div className="flex items-center space-x-3">
                <Link href="/auth">
                  <Button variant="outline" size="sm" className="bg-apple-blue text-white hover:bg-blue-600">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button size="sm" className="bg-artist-coral text-white hover:bg-red-500">
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

                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm font-medium text-gray-700 hover:text-apple-blue transition-colors py-2"
                    >
                      {link.label}
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
                      <Link href="/auth">
                        <Button variant="outline" className="w-full">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/auth">
                        <Button className="w-full bg-artist-coral text-white hover:bg-red-500">
                          Start Selling
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
