'use client';

import Image from 'next/image';
import { Heart, ShoppingCart, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWishlistStore, useCartStore } from '@/lib/stores';
import { toast } from 'sonner';

export function WishlistContent() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = (item: { productId: string; name: string; price: number; image: string; slug: string }) => {
    addItem({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      slug: item.slug,
      quantity: 1,
    });
    toast.success('Added to cart');
  };

  const handleAddAllToCart = () => {
    items.forEach((item) => {
      addItem({
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        slug: item.slug,
        quantity: 1,
      });
    });
    toast.success('All items added to cart');
    openCart();
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Heart className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Your wishlist is empty</h3>
        <p className="text-sm text-gray-500">Save items you love to your wishlist</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{items.length} items in wishlist</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleAddAllToCart}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add All to Cart
          </Button>
          <Button variant="ghost" size="sm" onClick={clearWishlist}>
            Clear All
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <Card key={item.productId} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex gap-4 p-4">
                  <div className="relative h-24 w-24 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 mb-1">{item.name}</h4>
                    <p className="text-lg font-semibold text-primary mb-2">
                      ${item.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
