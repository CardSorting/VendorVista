import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Stay in the loop</h3>
              <p className="text-gray-300">Get the latest designs and exclusive offers delivered to your inbox.</p>
            </div>
            <div className="flex w-full sm:w-auto max-w-md">
              <Input 
                type="email" 
                placeholder="Enter your email"
                className="rounded-r-none bg-white text-black border-gray-300"
              />
              <Button className="rounded-l-none bg-blue-600 hover:bg-blue-700 px-6">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div>
              <Link href="/" className="inline-block mb-4">
                <h2 className="text-2xl font-bold">
                  <span className="text-blue-400">Artist</span>Market
                </h2>
              </Link>
              <p className="text-gray-300 mb-4 leading-relaxed">
                The marketplace for unique designs from independent artists around the world. 
                Find one-of-a-kind items you won't see anywhere else.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Shop */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Shop</h3>
              <ul className="space-y-3">
                <li><Link href="/browse" className="text-gray-300 hover:text-white transition-colors">All Products</Link></li>
                <li><Link href="/browse?category=t-shirts" className="text-gray-300 hover:text-white transition-colors">T-Shirts</Link></li>
                <li><Link href="/browse?category=mugs" className="text-gray-300 hover:text-white transition-colors">Mugs</Link></li>
                <li><Link href="/browse?category=phone-cases" className="text-gray-300 hover:text-white transition-colors">Phone Cases</Link></li>
                <li><Link href="/browse?category=stickers" className="text-gray-300 hover:text-white transition-colors">Stickers</Link></li>
                <li><Link href="/browse?category=bags" className="text-gray-300 hover:text-white transition-colors">Bags</Link></li>
                <li><Link href="/browse?trending=true" className="text-gray-300 hover:text-white transition-colors">Trending</Link></li>
                <li><Link href="/browse?new=true" className="text-gray-300 hover:text-white transition-colors">New Arrivals</Link></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-gray-300 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/shipping" className="text-gray-300 hover:text-white transition-colors">Shipping Info</Link></li>
                <li><Link href="/returns" className="text-gray-300 hover:text-white transition-colors">Returns & Exchanges</Link></li>
                <li><Link href="/size-guide" className="text-gray-300 hover:text-white transition-colors">Size Guide</Link></li>
                <li><Link href="/track-order" className="text-gray-300 hover:text-white transition-colors">Track Your Order</Link></li>
                <li><Link href="/faq" className="text-gray-300 hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            {/* For Artists */}
            <div>
              <h3 className="text-lg font-semibold mb-4">For Artists</h3>
              <ul className="space-y-3">
                <li><Link href="/auth" className="text-gray-300 hover:text-white transition-colors">Start Selling</Link></li>
                <li><Link href="/artist-guide" className="text-gray-300 hover:text-white transition-colors">Artist Guide</Link></li>
                <li><Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">Pricing & Fees</Link></li>
                <li><Link href="/quality-guidelines" className="text-gray-300 hover:text-white transition-colors">Quality Guidelines</Link></li>
                <li><Link href="/artist-resources" className="text-gray-300 hover:text-white transition-colors">Resources</Link></li>
                <li><Link href="/artist-community" className="text-gray-300 hover:text-white transition-colors">Community</Link></li>
              </ul>
              
              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h4 className="text-sm font-semibold mb-3 text-gray-200">Get in Touch</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    support@artistmarket.com
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    1-800-ARTIST (278-4781)
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                    <span>123 Creative Street<br />Art District, CA 90210</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center sm:justify-start gap-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
              <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
              <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 ArtistMarket. All rights reserved.
            </div>
          </div>
          
          {/* Payment Methods */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-400">
                We accept all major payment methods
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <span className="text-xs">Secure payments by</span>
                <div className="flex space-x-2">
                  <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center text-xs font-bold text-white">V</div>
                  <div className="w-8 h-5 bg-red-600 rounded flex items-center justify-center text-xs font-bold text-white">M</div>
                  <div className="w-8 h-5 bg-blue-500 rounded flex items-center justify-center text-xs font-bold text-white">A</div>
                  <div className="w-8 h-5 bg-yellow-500 rounded flex items-center justify-center text-xs font-bold text-white">P</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}