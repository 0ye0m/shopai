'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  RefreshCw,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { DashboardTab } from './dashboard-tab';
import { ProductsTable } from './products-table';
import { OrdersTable } from './orders-table';
import { AnalyticsChart } from './analytics-chart';
import { CustomersTab } from './customers-tab';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  image: string | null;
}

export function AdminPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Only show for admin users
  if (!user || user.role !== 'admin') {
    return null;
  }

  const tabs = [
    { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { value: 'products', label: 'Products', icon: Package },
    { value: 'orders', label: 'Orders', icon: ShoppingCart },
    { value: 'customers', label: 'Customers', icon: Users },
    { value: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 left-4 h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 z-50"
          title="Admin Panel"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[95vw] max-w-[1400px] p-0 flex flex-col">
        <SheetHeader className="px-4 sm:px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5" />
              Admin Panel
              <Badge variant="secondary" className="ml-2">
                {user.email}
              </Badge>
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Refresh data"
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>
        
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col flex-1 min-h-0"
        >
          {/* Mobile tab selector */}
          <div className="px-4 py-2 border-b sm:hidden flex-shrink-0">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="flex items-center gap-2">
                {tabs.find(t => t.value === activeTab)?.icon && (
                  <>
                    {(() => {
                      const Icon = tabs.find(t => t.value === activeTab)!.icon;
                      return <Icon className="h-4 w-4" />;
                    })()}
                  </>
                )}
                {tabs.find(t => t.value === activeTab)?.label}
              </span>
              <Menu className="h-4 w-4" />
            </Button>
            {isMobileMenuOpen && (
              <div className="absolute left-4 right-4 top-full mt-1 bg-background border rounded-lg shadow-lg z-50">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setActiveTab(tab.value);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted transition-colors",
                      activeTab === tab.value && "bg-muted"
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop tabs */}
          <div className="px-4 sm:px-6 py-2 border-b hidden sm:block flex-shrink-0">
            <TabsList className="bg-transparent p-0 h-auto gap-1 flex-wrap">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-2 text-sm"
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <ScrollArea className="flex-1">
            <TabsContent value="dashboard" className="p-4 sm:p-6 mt-0" key={`dashboard-${refreshKey}`}>
              <DashboardTab />
            </TabsContent>
            <TabsContent value="products" className="p-4 sm:p-6 mt-0" key={`products-${refreshKey}`}>
              <ProductsTable />
            </TabsContent>
            <TabsContent value="orders" className="p-4 sm:p-6 mt-0" key={`orders-${refreshKey}`}>
              <OrdersTable />
            </TabsContent>
            <TabsContent value="customers" className="p-4 sm:p-6 mt-0" key={`customers-${refreshKey}`}>
              <CustomersTab />
            </TabsContent>
            <TabsContent value="analytics" className="p-4 sm:p-6 mt-0" key={`analytics-${refreshKey}`}>
              <AnalyticsChart />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
