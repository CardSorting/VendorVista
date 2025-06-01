import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShoppingBag, Package, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

interface RBACTestResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  message: string;
  requiredRole: string;
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState<RBACTestResult[]>([]);
  const [isTestingRBAC, setIsTestingRBAC] = useState(false);

  // Get current user's roles and permissions
  const { data: userInfo, isLoading: userLoading } = useQuery({
    queryKey: ["/api/rbac/demo"],
    enabled: isAuthenticated,
  });

  // Get users overview (admin only)
  const { data: usersData } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && userInfo?.roles?.includes('admin'),
  });

  // Get orders overview (seller/admin)
  const { data: ordersData } = useQuery({
    queryKey: ["/api/admin/orders"],
    enabled: isAuthenticated && (userInfo?.roles?.includes('seller') || userInfo?.roles?.includes('admin')),
  });

  const testRBACEndpoints = async () => {
    setIsTestingRBAC(true);
    const endpoints = [
      { url: '/api/rbac/buyer-area', method: 'GET', requiredRole: 'buyer' },
      { url: '/api/rbac/seller-area', method: 'GET', requiredRole: 'seller' },
      { url: '/api/rbac/admin-area', method: 'GET', requiredRole: 'admin' },
    ];

    const results: RBACTestResult[] = [];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        
        results.push({
          endpoint: endpoint.url,
          method: endpoint.method,
          status: response.status,
          success: response.ok,
          message: data.message || data.error || 'No message',
          requiredRole: endpoint.requiredRole,
        });
      } catch (error) {
        results.push({
          endpoint: endpoint.url,
          method: endpoint.method,
          status: 0,
          success: false,
          message: `Network error: ${error}`,
          requiredRole: endpoint.requiredRole,
        });
      }
    }

    setTestResults(results);
    setIsTestingRBAC(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the admin dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (userLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Role-Based Access Control Demo</p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span className="text-sm font-medium">RBAC Active</span>
        </div>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Current User Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email || 'Not available'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-medium">{userInfo?.userId || 'Not available'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assigned Roles</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {userInfo?.roles?.map((role: string) => (
                  <Badge key={role} variant="secondary">
                    {role}
                  </Badge>
                )) || <Badge variant="outline">No roles assigned</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rbac-test">RBAC Testing</TabsTrigger>
          {(userInfo?.roles?.includes('seller') || userInfo?.roles?.includes('admin')) && (
            <TabsTrigger value="orders">Orders</TabsTrigger>
          )}
          {userInfo?.roles?.includes('admin') && (
            <TabsTrigger value="users">User Management</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Access Level</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userInfo?.roles?.includes('admin') ? 'Full Access' :
                   userInfo?.roles?.includes('seller') ? 'Seller Access' :
                   userInfo?.roles?.includes('buyer') ? 'Buyer Access' : 'Limited Access'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on assigned roles
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Actions</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userInfo?.roles?.includes('admin') ? '15+' :
                   userInfo?.roles?.includes('seller') ? '10' :
                   userInfo?.roles?.includes('buyer') ? '5' : '3'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Permitted operations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Status</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Active</div>
                <p className="text-xs text-muted-foreground">
                  Auth0 RBAC enabled
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rbac-test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>RBAC Endpoint Testing</CardTitle>
              <CardDescription>
                Test different endpoints to see how role-based access control works
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testRBACEndpoints} 
                disabled={isTestingRBAC}
                className="w-full"
              >
                {isTestingRBAC ? 'Testing Endpoints...' : 'Test RBAC Endpoints'}
              </Button>

              {testResults.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Test Results:</h4>
                  {testResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-medium">{result.endpoint}</span>
                          <Badge variant="outline">{result.method}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={result.success ? "default" : "destructive"}>
                            {result.status}
                          </Badge>
                          <Badge variant="secondary">{result.requiredRole}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {(userInfo?.roles?.includes('seller') || userInfo?.roles?.includes('admin')) && (
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5" />
                  <span>Order Management</span>
                </CardTitle>
                <CardDescription>
                  {userInfo?.roles?.includes('admin') ? 'View and manage all orders' : 'View orders for your products'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This section would show orders based on your role permissions.
                    Currently showing placeholder content for demo purposes.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {userInfo?.roles?.includes('admin') && (
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>User Management</span>
                </CardTitle>
                <CardDescription>
                  Manage users and their roles (Admin only)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This admin-only section would allow user role management.
                    Access to this tab confirms your admin role is working correctly.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}