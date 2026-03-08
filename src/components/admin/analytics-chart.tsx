'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Package, Tag } from 'lucide-react';

interface AnalyticsData {
  dailyRevenue: Array<{ date: string; revenue: number }>;
  topProducts: Array<{
    name: string;
    price: number;
    quantity: number | null;
    images: string | null;
  }>;
  categoryBreakdown: Array<{ name: string; count: number }>;
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    pendingOrders: number;
    completedOrders: number;
    activeProducts: number;
    lowStockProducts: number;
  };
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const revenueChartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const productsChartConfig = {
  quantity: {
    label: 'Units Sold',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function AnalyticsChart() {
  const [data, setData] = useState<AnalyticsData | null>(null);
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
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
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
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Extend daily revenue data for monthly view
  const monthlyData = data.dailyRevenue.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  // Prepare top products data
  const topProductsData = data.topProducts.map(product => ({
    name: product.name?.slice(0, 15) + (product.name && product.name.length > 15 ? '...' : ''),
    quantity: product.quantity || 0,
    revenue: (product.quantity || 0) * product.price,
  }));

  // Prepare category data for pie chart
  const categoryData = data.categoryBreakdown.map(cat => ({
    name: cat.name,
    value: cat.count,
  }));

  // Category chart config
  const categoryChartConfig = categoryData.reduce((acc, cat, index) => {
    acc[cat.name] = {
      label: cat.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <div className="space-y-6">
      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Trend (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueChartConfig} className="h-80 w-full">
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
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
          <div className="mt-4 text-center">
            <p className="text-2xl font-bold">{formatCurrency(data.stats.totalRevenue)}</p>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProductsData.length > 0 ? (
              <>
                <ChartContainer config={productsChartConfig} className="h-64 w-full">
                  <BarChart data={topProductsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      className="text-xs"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="quantity"
                      fill="hsl(var(--chart-1))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartContainer>
                <div className="mt-4 space-y-2">
                  {data.topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="truncate">{product.name}</span>
                      <span className="text-muted-foreground">
                        {product.quantity} sold
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Package className="h-8 w-8 mb-2" />
                <p>No sales data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Products by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <>
                <ChartContainer config={categoryChartConfig} className="h-64 w-full">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                  </PieChart>
                </ChartContainer>
                <div className="mt-4 space-y-2">
                  {data.categoryBreakdown.map((cat, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{cat.name}</span>
                      </div>
                      <span className="text-muted-foreground">{cat.count} products</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Tag className="h-8 w-8 mb-2" />
                <p>No category data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{data.stats.totalOrders}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <div className="mt-2 text-xs">
                <span className="text-yellow-500">{data.stats.pendingOrders} pending</span>
                <span className="mx-1">•</span>
                <span className="text-green-500">{data.stats.completedOrders} completed</span>
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{data.stats.totalProducts}</p>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <div className="mt-2 text-xs">
                <span className="text-green-500">{data.stats.activeProducts} active</span>
                <span className="mx-1">•</span>
                <span className="text-red-500">{data.stats.lowStockProducts} low stock</span>
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{data.stats.totalCustomers}</p>
              <p className="text-sm text-muted-foreground">Total Customers</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">
                {data.stats.totalOrders > 0
                  ? formatCurrency(data.stats.totalRevenue / data.stats.totalOrders)
                  : '$0.00'}
              </p>
              <p className="text-sm text-muted-foreground">Avg. Order Value</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
