import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { 
  User, 
  Edit, 
  Save, 
  X, 
  ChevronRight, 
  Package, 
  CreditCard, 
  MapPin, 
  Settings,
  Shield,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal(''))
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const [, navigate] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      avatarUrl: user?.avatarUrl || ''
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      return apiRequest(`/api/users/${user?.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      avatarUrl: user?.avatarUrl || ''
    });
    setIsEditing(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Sign In Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please sign in to view your profile.
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userInitials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Amazon-style Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Your Account</h1>
          <p className="text-gray-600">Welcome, {user?.firstName || user?.username}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Account Dashboard - Amazon-style grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Orders */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/orders')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Package className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Your Orders</h3>
                        <p className="text-sm text-gray-600">Track, return, or buy things again</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              {/* Login & Security */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Shield className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Login & security</h3>
                        <p className="text-sm text-gray-600">Edit login, name, and mobile number</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Settings className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Account settings</h3>
                        <p className="text-sm text-gray-600">Manage preferences and settings</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              {/* Artist Dashboard (if applicable) */}
              {user?.isArtist && (
                <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/artist/dashboard')}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <User className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Artist Dashboard</h3>
                          <p className="text-sm text-gray-600">Manage your artwork and sales</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Profile Information Section */}
            <div className="mt-8">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Login & security</CardTitle>
                    {!isEditing && (
                      <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Name</p>
                          <p className="text-gray-900">
                            {user?.firstName && user?.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user?.username || 'Not set'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Email</p>
                          <p className="text-gray-900">{user?.email}</p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">About</p>
                        <p className="text-gray-900">{user?.bio || 'No bio added yet'}</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                          <Input
                            id="firstName"
                            {...form.register('firstName')}
                            placeholder="Enter your first name"
                            className="mt-1"
                          />
                          {form.formState.errors.firstName && (
                            <p className="text-sm text-red-500 mt-1">
                              {form.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                          <Input
                            id="lastName"
                            {...form.register('lastName')}
                            placeholder="Enter your last name"
                            className="mt-1"
                          />
                          {form.formState.errors.lastName && (
                            <p className="text-sm text-red-500 mt-1">
                              {form.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bio" className="text-sm font-medium text-gray-700">About</Label>
                        <Textarea
                          id="bio"
                          {...form.register('bio')}
                          placeholder="Tell us about yourself..."
                          rows={3}
                          className="mt-1"
                        />
                        {form.formState.errors.bio && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.bio.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="avatarUrl" className="text-sm font-medium text-gray-700">Profile Picture URL</Label>
                        <Input
                          id="avatarUrl"
                          {...form.register('avatarUrl')}
                          placeholder="https://example.com/avatar.jpg"
                          className="mt-1"
                        />
                        {form.formState.errors.avatarUrl && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.avatarUrl.message}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button 
                          type="submit" 
                          disabled={updateProfileMutation.isPending}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          {updateProfileMutation.isPending ? 'Saving...' : 'Save changes'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={handleCancel}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar - Amazon-style account info */}
          <div className="space-y-6">
            {/* Account Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.avatarUrl || ''} alt={user?.username} />
                    <AvatarFallback className="text-lg font-semibold bg-orange-100 text-orange-600">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user?.username}
                    </h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                    {user?.isArtist && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mt-1">
                        Artist
                      </span>
                    )}
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account type</span>
                    <span className="font-medium">{user?.isArtist ? 'Artist' : 'Customer'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member since</span>
                    <span className="font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/orders')}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <span className="text-blue-600 hover:text-blue-700">Your Orders</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                  <button 
                    onClick={() => navigate('/cart')}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <span className="text-blue-600 hover:text-blue-700">Your Cart</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                  <button 
                    onClick={() => navigate('/browse')}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <span className="text-blue-600 hover:text-blue-700">Browse Artwork</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}