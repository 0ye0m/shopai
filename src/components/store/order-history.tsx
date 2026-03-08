'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Package, ChevronRight, Loader2, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  snapshot: {
    name: string;
    price: number;
    image: string;
  };
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
}

interface Order {
  id: string;
  status: string;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: OrderItem[];
  createdAt: string;
}

interface OrderHistoryProps {
  onViewOrder?: (orderId: string) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export function OrderHistory({ onViewOrder }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // For demo purposes, we'll use guest user orders
        const response = await fetch('/api/orders?userId=guest');
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">No orders yet</h3>
        <p className="text-sm text-gray-500">Your order history will appear here</p>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
          ← Back to Orders
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
              </CardTitle>
              <Badge className={statusColors[selectedOrder.status]}>
                {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Shipping Address</h4>
              <p className="text-sm text-gray-500">
                {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}<br />
                {selectedOrder.shippingAddress.address}<br />
                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}<br />
                {selectedOrder.shippingAddress.country}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Items</h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.snapshot.image || item.product.images[0] || '/placeholder.png'}
                        alt={item.snapshot.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.snapshot.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${selectedOrder.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-3">
        {orders.map((order) => (
          <Card
            key={order.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedOrder(order)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={statusColors[order.status]}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                  <span className="font-semibold">${order.total.toFixed(2)}</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 relative"
                  >
                    <Image
                      src={item.snapshot.image || item.product.images[0] || '/placeholder.png'}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center text-xs font-medium">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
