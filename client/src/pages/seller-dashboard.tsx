import { useState } from "react";
import { Link } from "wouter";
import { 
  Home, ShoppingBag, Package, Users, BarChart3, Settings, Plus, 
  TrendingUp, DollarSign, Eye, Star, Search, Bell, ChevronDown,
  Menu, X, ArrowUpRight, Calendar, Filter, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalViews: number;
  conversionRate: number;
  avgOrderValue: number;
}

interface RecentOrder {
  id: number;
  customerName: string;
  total: number;
  status: string;
  date: string;
  items: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  status: string;
  inventory: number;
  sales: number;
}

export default function SellerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [timeframe, setTimeframe] = useState("7d");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("home");

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border">
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">Sign in required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access your seller dashboard</p>
          <Link href="/auth">
            <Button className="bg-green-600 hover:bg-green-700">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { id: "home", label: "Home", icon: Home, active: activeView === "home" },
    { id: "orders", label: "Orders", icon: ShoppingBag, active: activeView === "orders" },
    { id: "products", label: "Products", icon: Package, active: activeView === "products" },
    { id: "customers", label: "Customers", icon: Users, active: activeView === "customers" },
    { id: "analytics", label: "Analytics", icon: BarChart3, active: activeView === "analytics" },
    { id: "settings", label: "Settings", icon: Settings, active: activeView === "settings" }
  ];

  // Mock data - in real app, these would come from API
  const stats: DashboardStats = {
    totalSales: 12847.50,
    totalOrders: 89,
    totalProducts: 24,
    totalViews: 2456,
    conversionRate: 3.6,
    avgOrderValue: 144.35
  };

  const recentOrders: RecentOrder[] = [
    { id: 1001, customerName: "Alex Johnson", total: 89.99, status: "fulfilled", date: "2 hours ago", items: 2 },
    { id: 1002, customerName: "Sarah Wilson", total: 156.50, status: "pending", date: "5 hours ago", items: 1 },
    { id: 1003, customerName: "Mike Chen", total: 234.75, status: "shipped", date: "1 day ago", items: 3 },
    { id: 1004, customerName: "Emma Davis", total: 67.25, status: "fulfilled", date: "2 days ago", items: 1 }
  ];

  const products: Product[] = [
    { id: 1, name: "Digital Art Print", price: 29.99, status: "active", inventory: 25, sales: 45 },
    { id: 2, name: "Custom Portrait", price: 89.99, status: "active", inventory: 10, sales: 23 },
    { id: 3, name: "Abstract Canvas", price: 159.99, status: "draft", inventory: 5, sales: 12 },
    { id: 4, name: "Photo Collection", price: 49.99, status: "active", inventory: 0, sales: 67 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderHomeView = () => (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Home</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName || user?.username}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-3xl font-bold text-gray-900">${stats.totalSales.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12.5% from last period
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +8.2% from last period
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                <p className="text-sm text-gray-600 mt-1">{products.filter(p => p.status === 'active').length} active</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Store Views</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +15.3% from last period
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
                <p className="text-sm text-red-600 flex items-center mt-1">
                  -2.1% from last period
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-3xl font-bold text-gray-900">${stats.avgOrderValue}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +5.7% from last period
                </p>
              </div>
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="outline" size="sm">View All</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">#{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${order.total}</p>
                  <p className="text-sm text-gray-600">{order.items} item(s)</p>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">{order.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProductsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search products..." className="pl-10 w-64" />
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">${product.price}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">{product.inventory}</p>
                  <p className="text-sm text-gray-600">in stock</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">{product.sales}</p>
                  <p className="text-sm text-gray-600">sold</p>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(product.status)}>
                    {product.status}
                  </Badge>
                  {product.inventory === 0 && (
                    <p className="text-sm text-red-600 mt-1">Out of stock</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCurrentView = () => {
    switch (activeView) {
      case "home":
        return renderHomeView();
      case "products":
        return renderProductsView();
      case "orders":
        return (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Orders</h3>
            <p className="text-gray-600">Orders management coming soon</p>
          </div>
        );
      case "customers":
        return (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Customers</h3>
            <p className="text-gray-600">Customer management coming soon</p>
          </div>
        );
      case "analytics":
        return (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">Analytics dashboard coming soon</p>
          </div>
        );
      case "settings":
        return (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-600">Settings panel coming soon</p>
          </div>
        );
      default:
        return renderHomeView();
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
          <div className="flex items-center">
            <div className="text-white font-bold text-lg">ArtistMarket</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-8 px-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.active
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="lg:hidden ml-4">
                <div className="text-xl font-semibold text-gray-900">ArtistMarket</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 w-64 bg-gray-50 border-gray-200"
                />
              </div>
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5 text-gray-500" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName || user?.username}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderCurrentView()}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}