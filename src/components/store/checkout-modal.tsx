'use client';

import { useState } from 'react';
import { CreditCard, Truck, MapPin, Check, Loader2, Banknote, Wallet, Building2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/stores';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = ['Shipping', 'Payment', 'Review'];

const paymentMethods = [
  { id: 'cod', name: 'Cash on Delivery', icon: Banknote, description: 'Pay when you receive your order', available: true },
  { id: 'upi', name: 'UPI Payment', icon: Wallet, description: 'Pay using any UPI app', available: false },
  { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay', available: false },
  { id: 'netbanking', name: 'Net Banking', icon: Building2, description: 'All major banks supported', available: false },
];

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const { items, getTotal, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState('cod');

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    notes: '',
  });

  const subtotal = getTotal();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const codFee = selectedPayment === 'cod' ? 4.99 : 0;
  const total = subtotal + shipping + tax + codFee;

  const handleShippingChange = (field: string, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep === 0) {
      const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip'];
      const missing = required.filter((f) => !shippingInfo[f as keyof typeof shippingInfo]);
      if (missing.length > 0) {
        toast.error('Please fill in all required fields');
        return;
      }
      // Validate phone number
      if (!/^\d{10}$/.test(shippingInfo.phone.replace(/\D/g, ''))) {
        toast.error('Please enter a valid 10-digit phone number');
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress: shippingInfo,
          paymentMethod: selectedPayment,
          total,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrderId(data.order.id);
        setOrderComplete(true);
        clearCart();
        toast.success('Order placed successfully!');
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (orderComplete) {
      setOrderComplete(false);
      setCurrentStep(0);
      setOrderId(null);
      setSelectedPayment('cod');
    }
    onOpenChange(false);
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Checkout</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">Your cart is empty</h3>
            <p className="text-muted-foreground mt-1">Add items to your cart to checkout</p>
            <Button className="mt-4" onClick={handleClose}>
              Continue Shopping
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (orderComplete) {
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="w-full sm:max-w-lg">
          <div className="flex flex-col items-center justify-center h-[80vh] text-center">
            <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="font-semibold text-2xl">Order Confirmed!</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              Thank you for your purchase. {selectedPayment === 'cod' 
                ? 'Please keep the exact amount ready for cash on delivery.' 
                : 'Your order has been placed successfully.'}
            </p>
            {orderId && (
              <div className="mt-4 bg-muted rounded-lg px-4 py-2">
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono font-medium">{orderId}</p>
              </div>
            )}
            <div className="mt-6 bg-card border rounded-lg p-4 max-w-sm w-full">
              <h4 className="font-medium text-sm mb-2">What&apos;s Next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1 text-left">
                <li>• You&apos;ll receive an email confirmation shortly</li>
                <li>• Track your order in the &quot;My Orders&quot; section</li>
                {selectedPayment === 'cod' && (
                  <li>• Keep <span className="font-medium text-foreground">${total.toFixed(2)}</span> ready for payment</li>
                )}
              </ul>
            </div>
            <Button className="mt-6" onClick={handleClose}>
              Continue Shopping
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle>Checkout</SheetTitle>
        </SheetHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 py-4 overflow-x-auto">
          {steps.map((step, idx) => (
            <div key={step} className="flex items-center flex-shrink-0">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  idx <= currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {idx < currentStep ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              <span
                className={cn(
                  "ml-2 text-sm hidden sm:inline",
                  idx <= currentStep ? 'font-medium' : 'text-muted-foreground'
                )}
              >
                {step}
              </span>
              {idx < steps.length - 1 && (
                <div className="w-6 sm:w-12 mx-2 h-px bg-border" />
              )}
            </div>
          ))}
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Form Section */}
            <div className="space-y-4">
              {currentStep === 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Shipping Address
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={shippingInfo.firstName}
                        onChange={(e) => handleShippingChange('firstName', e.target.value)}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={shippingInfo.lastName}
                        onChange={(e) => handleShippingChange('lastName', e.target.value)}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => handleShippingChange('email', e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => handleShippingChange('phone', e.target.value)}
                        placeholder="9876543210"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => handleShippingChange('address', e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div>
                    <Label htmlFor="apartment">Apartment, Suite, etc. (Optional)</Label>
                    <Input
                      id="apartment"
                      value={shippingInfo.apartment}
                      onChange={(e) => handleShippingChange('apartment', e.target.value)}
                      placeholder="Apt 4B"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => handleShippingChange('city', e.target.value)}
                        placeholder="Mumbai"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={shippingInfo.state}
                        onChange={(e) => handleShippingChange('state', e.target.value)}
                        placeholder="Maharashtra"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="zip">PIN Code *</Label>
                      <Input
                        id="zip"
                        value={shippingInfo.zip}
                        onChange={(e) => handleShippingChange('zip', e.target.value)}
                        placeholder="400001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={shippingInfo.country}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Delivery Instructions (Optional)</Label>
                    <Input
                      id="notes"
                      value={shippingInfo.notes}
                      onChange={(e) => handleShippingChange('notes', e.target.value)}
                      placeholder="Any special instructions for delivery"
                    />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Method
                  </h3>
                  
                  <div className="grid gap-3">
                    {paymentMethods.map((method) => (
                      <Card
                        key={method.id}
                        className={cn(
                          "cursor-pointer transition-all",
                          selectedPayment === method.id && "ring-2 ring-primary",
                          !method.available && "opacity-50"
                        )}
                        onClick={() => method.available && setSelectedPayment(method.id)}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center",
                            selectedPayment === method.id 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted"
                          )}>
                            <method.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{method.name}</span>
                              {method.id === 'cod' && (
                                <Badge variant="secondary" className="text-xs">Available</Badge>
                              )}
                              {!method.available && (
                                <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          </div>
                          <div className={cn(
                            "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                            selectedPayment === method.id 
                              ? "border-primary bg-primary" 
                              : "border-muted-foreground"
                          )}>
                            {selectedPayment === method.id && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {selectedPayment === 'cod' && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                      <div className="flex items-start gap-3">
                        <Banknote className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-800 dark:text-amber-200">Cash on Delivery</h4>
                          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                            An additional fee of $4.99 applies for COD orders. Please keep the exact amount ready when your order arrives.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <Truck className="h-4 w-4" />
                      <span className="text-sm font-medium">Free delivery on orders above $50</span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Review Your Order</h3>
                  
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <h4 className="text-sm font-medium">Shipping Address</h4>
                    <p className="text-sm text-muted-foreground">
                      {shippingInfo.firstName} {shippingInfo.lastName}<br />
                      {shippingInfo.apartment && `${shippingInfo.apartment}, `}
                      {shippingInfo.address}<br />
                      {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}<br />
                      Phone: {shippingInfo.phone}
                    </p>
                  </div>

                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <h4 className="text-sm font-medium">Payment Method</h4>
                    <div className="flex items-center gap-2">
                      {paymentMethods.find(m => m.id === selectedPayment)?.icon && (
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        {paymentMethods.find(m => m.id === selectedPayment)?.name}
                        {selectedPayment === 'cod' && (
                          <span className="text-amber-600 ml-2">(Fee: ${codFee.toFixed(2)})</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <h4 className="text-sm font-medium">Delivery Timeline</h4>
                    <p className="text-sm text-muted-foreground">
                      Estimated delivery: 5-7 business days
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <h3 className="font-medium">Order Summary</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-12 w-12 rounded bg-muted relative overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                {codFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">COD Fee</span>
                    <span>${codFee.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                {currentStep < 2 ? (
                  <Button className="w-full" onClick={handleNextStep}>
                    Continue to {steps[currentStep + 1]}
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handlePlaceOrder}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Place Order - $${total.toFixed(2)}`
                    )}
                  </Button>
                )}
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                  >
                    Back
                  </Button>
                )}
              </div>

              <div className="text-xs text-muted-foreground text-center">
                By placing this order, you agree to our Terms of Service and Privacy Policy.
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
