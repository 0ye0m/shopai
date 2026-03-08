'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  MoreHorizontal,
  ArrowUpDown,
  Eye,
  Search,
  ShoppingCart,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  snapshot: {
    name: string;
    images?: string[];
  };
  product: {
    id: string;
    name: string;
    images: string[];
    price: number;
  } | null;
}

interface Order {
  id: string;
  status: string;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  items: OrderItem[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Detail dialog
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async (page: number, status?: string) => {
    setIsLoading(true);
    try {
      const statusParam = status ? `&status=${status}` : '';
      const res = await fetch(`/api/admin/orders?page=${page + 1}&limit=${pagination.pageSize}${statusParam}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(pagination.pageIndex, statusFilter);
  }, [pagination.pageIndex, pagination.pageSize, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (res.ok) {
        fetchOrders(pagination.pageIndex, statusFilter);
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns: ColumnDef<Order>[] = useMemo(() => [
    {
      accessorKey: 'id',
      header: 'Order ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.id.slice(0, 8)}...</span>
      ),
    },
    {
      accessorKey: 'user',
      header: 'Customer',
      cell: ({ row }) => {
        const user = row.original.user;
        return (
          <div>
            <div className="font-medium">{user.name || 'Guest'}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }) => {
        const items = row.original.items;
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        return <span>{totalItems} items</span>;
      },
    },
    {
      accessorKey: 'total',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatCurrency(row.getValue('total')),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Select
          value={row.getValue('status')}
          onValueChange={(value) => handleStatusChange(row.original.id, value)}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${statusColors[option.value]}`} />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatDate(row.getValue('createdAt')),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => viewOrderDetails(row.original)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], []);

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    manualPagination: true,
    pageCount: totalPages,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={(table.getColumn('id')?.getFilterValue() as string) ?? ''}
            onChange={(e) => table.getColumn('id')?.setFilterValue(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPagination(p => ({ ...p, pageIndex: 0 })); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mb-2" />
                    No orders found.
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {pagination.pageIndex + 1} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Order Details
              <Badge className={`${statusColors[selectedOrder?.status || 'pending']} text-white`}>
                {selectedOrder?.status}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              <Separator />

              {/* Customer Info */}
              <div>
                <h4 className="font-medium mb-2">Customer</h4>
                <div className="space-y-1">
                  <p>{selectedOrder.user.name || 'Guest'}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {selectedOrder.user.email}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Shipping Address */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.shippingAddress.street}<br />
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}<br />
                  {selectedOrder.shippingAddress.country}
                </p>
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-3">Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded overflow-hidden bg-muted">
                        <Image
                          src={item.product?.images?.[0] || item.snapshot?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                          alt={item.snapshot.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.snapshot.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.quantity * item.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium">Total</span>
                <span className="font-bold">{formatCurrency(selectedOrder.total)}</span>
              </div>

              {/* Update Status */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Update Status:</span>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${statusColors[option.value]}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
