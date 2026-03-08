'use client';

import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Users, Mail, Calendar, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';

interface Customer {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  avatar: string | null;
  _count: {
    orders: number;
  };
  _sum: {
    orders: {
      total: number;
    } | null;
  };
}

interface CustomersData {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function CustomersTab() {
  const [data, setData] = useState<CustomersData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        // Since we don't have a dedicated customers API, we'll use the stats API
        // and fetch customer data directly
        const res = await fetch(`/api/admin/customers?page=${page}&limit=10`);
        if (res.ok) {
          setData(await res.json());
        } else {
          // Fallback: create mock data from users table
          const statsRes = await fetch('/api/admin/stats');
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setData({
              customers: [],
              pagination: {
                page: 1,
                limit: 10,
                total: statsData.stats?.totalCustomers || 0,
                totalPages: 1,
              },
            });
          }
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, [page]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats from available data
  const totalCustomers = data?.pagination?.total || 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCustomers}</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">New This Month</p>
                <p className="text-sm text-muted-foreground">Registered customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">Avg. Spend</p>
                <p className="text-sm text-muted-foreground">Per customer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.customers && data.customers.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            {customer.avatar ? (
                              <img
                                src={customer.avatar}
                                alt={customer.name || 'Customer'}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium">
                                {(customer.name || customer.email)?.[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{customer.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.role === 'admin' ? 'default' : 'secondary'}>
                          {customer.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{customer._count?.orders || 0}</TableCell>
                      <TableCell>
                        {formatCurrency(customer._sum?.orders?.total || 0)}
                      </TableCell>
                      <TableCell>{formatDate(customer.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {data.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                      disabled={page === data.pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Users className="h-8 w-8 mb-2" />
              <p>No customers found</p>
              <p className="text-sm">Customer data will appear here once users register</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
