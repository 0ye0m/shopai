'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Package,
  Heart,
  Settings,
  ShoppingBag,
  TrendingUp,
  Clock,
  Loader2,
} from 'lucide-react';
import { OrderHistory } from './order-history';
import { WishlistContent } from './wishlist-content';
import { useWishlistStore } from '@/lib/stores';
import { toast } from 'sonner';

interface AccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountModal({ open, onOpenChange }: AccountModalProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSaving, setIsSaving] = useState(false);
  const { getItemCount: getWishlistCount } = useWishlistStore();
  const [recentOrdersCount, setRecentOrdersCount] = useState(0);

  // User settings state
  const [settings, setSettings] = useState({
    name: 'Guest User',
    email: 'guest@example.com',
    phone: '+1 (555) 000-0000',
    notifications: {
      email: true,
      sms: false,
      marketing: true,
    },
  });

  useEffect(() => {
    // Fetch orders count for dashboard
    const fetchOrdersCount = async () => {
      try {
        const response = await fetch('/api/orders?userId=guest');
        const data = await response.json();
        setRecentOrdersCount(data.orders?.length || 0);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    if (open) {
      fetchOrdersCount();
    }
  }, [open]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Settings saved successfully');
    setIsSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>My Account</DialogTitle>
          <DialogDescription>Manage your account settings and view your orders</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          {/* Tabs Header */}
          <div className="border-b px-6 pt-6">
            <TabsList className="grid grid-cols-4 w-full max-w-lg">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Wishlist</span>
                {getWishlistCount() > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {getWishlistCount()}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tabs Content */}
          <div className="flex-1 overflow-auto p-6">
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="mt-0 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{settings.name}</h2>
                  <p className="text-gray-500">{settings.email}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{recentOrdersCount}</p>
                        <p className="text-sm text-gray-500">Total Orders</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
                        <Heart className="h-5 w-5 text-pink-600 dark:text-pink-300" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{getWishlistCount()}</p>
                        <p className="text-sm text-gray-500">Wishlist Items</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-300" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">$0</p>
                        <p className="text-sm text-gray-500">Total Saved</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => setActiveTab('orders')}>
                      View Order History
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('wishlist')}>
                      View Wishlist
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('settings')}>
                      Account Settings
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      Continue Shopping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-0">
              <h3 className="text-lg font-semibold mb-4">Order History</h3>
              <OrderHistory />
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist" className="mt-0">
              <h3 className="text-lg font-semibold mb-4">My Wishlist</h3>
              <WishlistContent />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-0 space-y-6">
              <h3 className="text-lg font-semibold">Account Settings</h3>

              <div className="grid gap-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Notifications</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Email Notifications</p>
                      <p className="text-xs text-gray-500">Receive order updates via email</p>
                    </div>
                    <Button
                      variant={settings.notifications.email ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, email: !settings.notifications.email },
                        })
                      }
                    >
                      {settings.notifications.email ? 'On' : 'Off'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">SMS Notifications</p>
                      <p className="text-xs text-gray-500">Receive order updates via SMS</p>
                    </div>
                    <Button
                      variant={settings.notifications.sms ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, sms: !settings.notifications.sms },
                        })
                      }
                    >
                      {settings.notifications.sms ? 'On' : 'Off'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Marketing Emails</p>
                      <p className="text-xs text-gray-500">Receive deals and promotions</p>
                    </div>
                    <Button
                      variant={settings.notifications.marketing ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, marketing: !settings.notifications.marketing },
                        })
                      }
                    >
                      {settings.notifications.marketing ? 'On' : 'Off'}
                    </Button>
                  </div>
                </div>

                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
