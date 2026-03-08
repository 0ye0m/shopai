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
  Pencil,
  Trash2,
  Plus,
  Search,
  Package,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  sku: string;
  images: string[];
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  category: { name: string; slug: string } | null;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalPages, setTotalPages] = useState(1);

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    stock: '',
    sku: '',
    categoryId: '',
    images: '',
    tags: '',
    isFeatured: false,
    isActive: true,
  });

  const fetchProducts = async (page: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/products?page=${page + 1}&limit=${pagination.pageSize}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts(pagination.pageIndex);
    fetchCategories();
  }, [pagination.pageIndex, pagination.pageSize]);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      comparePrice: product.comparePrice?.toString() || '',
      stock: product.stock.toString(),
      sku: product.sku,
      categoryId: product.category?.slug || '',
      images: product.images.join(', '),
      tags: product.tags.join(', '),
      isFeatured: product.isFeatured,
      isActive: product.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedProduct) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedProduct.id,
          ...formData,
          images: formData.images.split(',').map(s => s.trim()).filter(Boolean),
          tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean),
          categoryId: formData.categoryId || null,
        }),
      });
      if (res.ok) {
        setIsEditDialogOpen(false);
        fetchProducts(pagination.pageIndex);
      }
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/products?id=${selectedProduct.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setIsDeleteDialogOpen(false);
        fetchProducts(pagination.pageIndex);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNew = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: formData.images.split(',').map(s => s.trim()).filter(Boolean),
          tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean),
          categoryId: formData.categoryId || null,
        }),
      });
      if (res.ok) {
        setIsEditDialogOpen(false);
        fetchProducts(pagination.pageIndex);
      }
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const openAddDialog = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      comparePrice: '',
      stock: '0',
      sku: '',
      categoryId: '',
      images: '',
      tags: '',
      isFeatured: false,
      isActive: true,
    });
    setIsEditDialogOpen(true);
  };

  const columns: ColumnDef<Product>[] = useMemo(() => [
    {
      accessorKey: 'images',
      header: 'Image',
      cell: ({ row }) => {
        const images = row.original.images;
        const firstImage = images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100';
        return (
          <div className="relative h-10 w-10 rounded overflow-hidden bg-muted">
            <Image
              src={firstImage}
              alt={row.original.name}
              fill
              className="object-cover"
            />
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const price = row.getValue('price') as number;
        const comparePrice = row.original.comparePrice;
        return (
          <div>
            <span>${price.toFixed(2)}</span>
            {comparePrice && (
              <span className="text-muted-foreground line-through ml-2 text-sm">
                ${comparePrice.toFixed(2)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => {
        const stock = row.getValue('stock') as number;
        return (
          <Badge variant={stock < 10 ? 'destructive' : stock < 50 ? 'secondary' : 'default'}>
            {stock}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => row.original.category?.name || '-',
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('isActive') ? 'default' : 'secondary'}>
          {row.getValue('isActive') ? 'Active' : 'Inactive'}
        </Badge>
      ),
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
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDelete(row.original)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], []);

  const table = useReactTable({
    data: products,
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
          <Skeleton className="h-10 w-32" />
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
            placeholder="Search products..."
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(e) => table.getColumn('name')?.setFilterValue(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
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
                    <Package className="h-8 w-8 mb-2" />
                    No products found.
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

      {/* Edit/Add Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comparePrice">Compare Price ($)</Label>
                <Input
                  id="comparePrice"
                  type="number"
                  step="0.01"
                  value={formData.comparePrice}
                  onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="images">Images (comma-separated URLs)</Label>
                <Input
                  id="images"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="url1, url2, url3"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                />
                <Label htmlFor="isFeatured">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={selectedProduct ? handleSave : handleAddNew} disabled={isSaving}>
              {isSaving ? 'Saving...' : selectedProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedProduct?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isSaving}>
              {isSaving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
