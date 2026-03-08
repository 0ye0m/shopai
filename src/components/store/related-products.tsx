'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useProductStore, useCartStore, useWishlistStore } from '@/lib/stores';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
}

interface RelatedProductsProps {
  products: RelatedProduct[];
  currentProductId: string;
}

export function RelatedProducts({ products, currentProductId }: RelatedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { openProduct } = useProductStore();
  const { addItem: addToCart, openCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

  const filteredProducts = products.filter(p => p.id !== currentProductId);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleProductClick = (product: RelatedProduct) => {
    openProduct({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: '',
      price: product.price,
      comparePrice: product.comparePrice,
      stock: product.stock,
      sku: '',
      images: product.images,
      tags: [],
      rating: product.rating,
      reviewCount: product.reviewCount,
      isFeatured: false,
      category: null,
    });
  };

  const handleAddToCart = (e: React.MouseEvent, product: RelatedProduct) => {
    e.stopPropagation();
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '/placeholder.png',
      quantity: 1,
      slug: product.slug,
    });
    
    toast.success('Added to cart');
    openCart();
  };

  const handleToggleWishlist = (e: React.MouseEvent, product: RelatedProduct) => {
    e.stopPropagation();
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '/placeholder.png',
        slug: product.slug,
      });
      toast.success('Added to wishlist');
    }
  };

  if (filteredProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">You May Also Like</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div
          ref={scrollRef}
          className="flex gap-4 pb-4"
        >
          {filteredProducts.map((product) => {
            const mainImage = product.images[0] || '/placeholder.png';
            const discount = product.comparePrice
              ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
              : 0;
            const inWishlist = isInWishlist(product.id);

            return (
              <Card
                key={product.id}
                className="w-64 flex-shrink-0 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleProductClick(product)}
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="256px"
                  />
                  {discount > 0 && (
                    <Badge className="absolute top-2 left-2 bg-red-500">
                      -{discount}%
                    </Badge>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary">Out of Stock</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm line-clamp-2 mb-1">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">
                      {product.rating.toFixed(1)} ({product.reviewCount})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.comparePrice && (
                        <span className="text-xs text-gray-500 line-through">
                          ${product.comparePrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock === 0}
                      className="h-7 text-xs"
                    >
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
