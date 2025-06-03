/**
 * Seller Dashboard Page - Clean Architecture implementation
 * Apple-inspired design with comprehensive business logic separation
 */

import { useState } from 'react';
import { Link } from 'wouter';
import { 
  Home, ShoppingBag, Package, Users, BarChart3, Settings, Plus,
  DollarSign, Eye, TrendingUp, Menu, X, Search, Bell, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { MetricsCard } from '../components/MetricsCard';
import { useSellerDashboard, TimeframeOption } from '../hooks/useSellerDashboard';

interface NavigationItem {
  id: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}

export default function SellerDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('home');

  const {
    data: dashboardData,
    isLoading,
    isError,
    timeframe,
    setTimeframe
  } = useSellerDashboard({
    sellerId: user?.id || '',
    enabled: isAuthenticated && Boolean(user?.id)
  });

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-200/60">
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your seller dashboard</p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2"
          >
            Sign In with Replit
          </Button>
        </div>
      </div>
    );
  }

  const navigationItems: NavigationItem[] = [
    { id: 'home', label: 'Overview', icon: Home, active: activeView === 'home' },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, active: activeView === 'orders' },
    { id: 'products', label: 'Products', icon: Package, active: activeView === 'products' },
    { id: 'customers', label: 'Customers', icon: Users, active: activeView === 'customers' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, active: activeView === 'analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, active: activeView === 'settings' }
  ];

  const renderOverviewContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      );
    }

    // Show basic metrics even when dashboard data isn't available
    const metrics = dashboardData?.metrics || {
      totalRevenue: { toDisplayString: () => '$0.00' },
      totalOrders: 0,
      totalProducts: 0,
      viewCount: 0,
      conversionRate: 0,
      averageOrderValue: { toDisplayString: () => '$0.00' },
      growthMetrics: {
        revenueGrowth: 0,
        orderGrowth: 0
      }
    };

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.firstName || user?.username}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={timeframe} onValueChange={(value) => setTimeframe(value as TimeframeOption)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Last 24 hours</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="year">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricsCard
            title="Total Revenue"
            value={metrics.totalRevenue.toDisplayString()}
            icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
            trend={{
              value: metrics.growthMetrics.revenueGrowth,
              label: `vs last ${timeframe}`
            }}
          />
          
          <MetricsCard
            title="Orders"
            value={metrics.totalOrders}
            icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
            trend={{
              value: metrics.growthMetrics.orderGrowth,
              label: `vs last ${timeframe}`
            }}
          />
          
          <MetricsCard
            title="Products"
            value={metrics.totalProducts}
            icon={<Package className="h-5 w-5 text-purple-600" />}
          />
          
          <MetricsCard
            title="Store Views"
            value={metrics.viewCount}
            icon={<Eye className="h-5 w-5 text-orange-600" />}
          />
          
          <MetricsCard
            title="Conversion Rate"
            value={`${metrics.conversionRate.toFixed(1)}%`}
            icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          />
          
          <MetricsCard
            title="Avg Order Value"
            value={metrics.averageOrderValue.toDisplayString()}
            icon={<Users className="h-5 w-5 text-indigo-600" />}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200/60 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-8 text-gray-500">
            <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Recent orders and activity will appear here</p>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (activeView) {
      case 'home':
        return renderOverviewContent();
      case 'orders':
        return (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Orders</h3>
            <p className="text-gray-600">Order management interface coming soon</p>
          </div>
        );
      case 'products':
        return (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Products</h3>
            <p className="text-gray-600">Product management interface coming soon</p>
          </div>
        );
      default:
        return renderOverviewContent();
    }
  };

  return (
    <div className="h-screen bg-gray-50/50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200/60 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200/60">
          <div className="text-gray-900 font-semibold text-lg">ArtistMarket</div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-6 px-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    item.active
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10 w-64 bg-gray-50/80 border-gray-200/60"
                />
              </div>
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5 text-gray-500" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
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
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}