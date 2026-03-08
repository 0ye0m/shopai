'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useCartStore, useUIStore } from '@/lib/stores';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const { setCheckoutOpen } = useUIStore();

  const handleCheckout = () => {
    closeCart();
    setCheckoutOpen(true);
  };

  const freeShippingThreshold = 50;
  const subtotal = getTotal();
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const hasFreeShipping = subtotal >= freeShippingThreshold;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mt-1">Add items to get started</p>
            </div>
            <Button onClick={closeCart}>Continue Shopping</Button>
          </div>
        ) : (
          <>
            {/* Free Shipping Progress */}
            {hasFreeShipping ? (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg text-center">
                <p className="text-sm font-medium text-primary">You qualify for free shipping!</p>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-center text-muted-foreground">
                  Add <span className="font-medium text-foreground">${remainingForFreeShipping.toFixed(2)}</span> more for free shipping
                </p>
                <div className="mt-2 h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(subtotal / freeShippingThreshold) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <ScrollArea className="flex-1 -mx-6 px-6 mt-4">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium line-clamp-2 text-sm">
                        {item.name}
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        ${item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-4 border-t">
              {/* Coupon Code */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code"
                  className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
                />
                <Button variant="outline" size="sm">Apply</Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{hasFreeShipping ? 'Free' : 'Calculated at checkout'}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
                <Button variant="outline" onClick={closeCart} className="w-full">
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
