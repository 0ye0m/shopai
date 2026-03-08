'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
}

interface RecentOrder {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
  items: Array<{ quantity: number; price: number }>;
}

interface DashboardData {
  stats: Stats;
  recentOrders: RecentOrder[];
  dailyRevenue: Array<{ date: string; revenue: number }>;
}

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
};

export function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statsCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(data.stats.totalRevenue),
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Total Orders',
      value: data.stats.totalOrders.toString(),
      icon: ShoppingCart,
      subValue: `${data.stats.pendingOrders} pending`,
    },
    {
      title: 'Products',
      value: data.stats.totalProducts.toString(),
      icon: Package,
      subValue: `${data.stats.lowStockProducts} low stock`,
      showWarning: data.stats.lowStockProducts > 0,
    },
    {
      title: 'Customers',
      value: data.stats.totalCustomers.toString(),
      icon: Users,
      trend: '+8.2%',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.subValue && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {stat.showWarning && (
                    <AlertCircle className="h-3 w-3 text-yellow-500" />
                  )}
                  {stat.subValue}
                </p>
              )}
              {stat.trend && (
                <p className="text-xs flex items-center gap-1 mt-1">
                  {stat.trendUp ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.trendUp ? 'text-green-500' : 'text-red-500'}>
                    {stat.trend}
                  </span>
                  <span className="text-muted-foreground">from last month</span>
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <AreaChart data={data.dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                className="text-xs"
              />
              <YAxis
                tickFormatter={(value) => `$${value}`}
                className="text-xs"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.user.name || 'Guest'}</div>
                      <div className="text-xs text-muted-foreground">{order.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                  </TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[order.status]} text-white`}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
