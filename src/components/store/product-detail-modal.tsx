'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Heart, ShoppingCart, Star, ChevronLeft, ChevronRight, X, Share2, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCartStore, useWishlistStore, useCompareStore } from '@/lib/stores';
import { toast } from 'sonner';
import { ProductQA } from './product-qa';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  category: { name: string; slug: string } | null;
  isFeatured: boolean;
}

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relatedProducts: Product[];
}

export function ProductDetailModal({
  product,
  open,
  onOpenChange,
  relatedProducts,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem, openCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addItem: addToCompare, isInCompare, canAddMore } = useCompareStore();

  if (!product) return null;

  const images = product.images.length > 0 ? product.images : ['/placeholder.png'];
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: images[0],
      quantity,
      slug: product.slug,
    });
    toast.success(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to cart`);
    openCart();
  };

  const handleToggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: images[0],
        slug: product.slug,
      });
      toast.success('Added to wishlist');
    }
  };

  const handleAddToCompare = () => {
    const success = addToCompare({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      comparePrice: product.comparePrice,
      images,
      description: product.description,
      rating: product.rating,
      reviewCount: product.reviewCount,
      stock: product.stock,
      category: product.category?.name || 'Uncategorized',
      tags: product.tags,
    });

    if (success) {
      toast.success('Added to comparison');
    } else {
      toast.error('Compare list is full (max 4 items)');
    }
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image Gallery */}
            <div className="relative bg-muted">
              <div className="aspect-square relative">
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      className={`relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                        selectedImage === idx ? 'border-primary' : 'border-transparent'
                      }`}
                      onClick={() => setSelectedImage(idx)}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6 space-y-6">
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    {product.category && (
                      <Badge variant="secondary" className="mb-2">
                        {product.category.name}
                      </Badge>
                    )}
                    <DialogTitle className="text-2xl">{product.name}</DialogTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
                {product.comparePrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      ${product.comparePrice.toFixed(2)}
                    </span>
                    <Badge className="bg-red-500 hover:bg-red-600">{discount}% OFF</Badge>
                  </>
                )}
              </div>

              {/* Availability */}
              <div>
                {product.stock > 0 ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    In Stock ({product.stock} available)
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    Out of Stock
                  </Badge>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleToggleWishlist}
                >
                  <Heart className={`h-5 w-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleAddToCompare}
                  disabled={inCompare || !canAddMore()}
                  title={inCompare ? 'Already in compare' : !canAddMore() ? 'Compare list full' : 'Add to compare'}
                >
                  <Scale className={`h-5 w-5 ${inCompare ? 'text-primary' : ''}`} />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Description Tabs */}
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="specs">Specs</TabsTrigger>
                  <TabsTrigger value="qa">Q&A</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="mt-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {product.description}
                  </p>
                  {product.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="specs" className="mt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">SKU</span>
                      <span className="font-medium">{product.id}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium">{product.category?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Rating</span>
                      <span className="font-medium">{product.rating.toFixed(1)} / 5</span>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="qa" className="mt-4">
                  <ProductQA product={{
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    category: product.category?.name || 'General',
                    tags: product.tags,
                  }} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
