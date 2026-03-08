'use client';

import Image from 'next/image';
import { Heart, ShoppingCart, Star, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCartStore, useWishlistStore, useCompareStore } from '@/lib/stores';
import { toast } from 'sonner';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    images: string | string[];
    rating: number;
    reviewCount: number;
    stock: number;
    category?: { name: string; slug: string } | null;
  };
  onProductClick?: () => void;
}

export function ProductCard({ product, onProductClick }: ProductCardProps) {
  const { addItem, openCart } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { addItem: addToCompare, isInCompare, canAddMore } = useCompareStore();

  const images = Array.isArray(product.images) ? product.images : JSON.parse(product.images || '[]');
  const mainImage = images[0] || '/placeholder.png';
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: mainImage,
      quantity: 1,
      slug: product.slug,
    });

    toast.success('Added to cart');
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: mainImage,
        slug: product.slug,
      });
      toast.success('Added to wishlist');
    }
  };

  const handleAddToCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const success = addToCompare({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      comparePrice: product.comparePrice || null,
      images,
      description: '',
      rating: product.rating,
      reviewCount: product.reviewCount,
      stock: product.stock,
      category: product.category?.name || 'Uncategorized',
      tags: [],
    });

    if (success) {
      toast.success('Added to comparison');
    } else if (inCompare) {
      toast.info('Already in comparison');
    } else {
      toast.error('Compare list is full (max 4 items)');
    }
  };

  return (
    <Card className="group relative overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200 bg-card card-hover">
      <div onClick={onProductClick} className="cursor-pointer">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount > 0 && (
              <Badge variant="destructive" className="text-xs">
                -{discount}% OFF
              </Badge>
            )}
            {product.stock === 0 && (
              <Badge variant="secondary" className="text-xs">
                Sold Out
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full shadow-sm"
              onClick={handleToggleWishlist}
            >
              <Heart className={`h-4 w-4 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className={`h-8 w-8 rounded-full shadow-sm ${inCompare ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
              onClick={handleAddToCompare}
              disabled={inCompare || !canAddMore()}
            >
              <Scale className="h-4 w-4" />
            </Button>
          </div>

          {/* Add to Cart Button */}
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="sm"
              className="w-full"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {product.category && (
            <p className="text-xs text-muted-foreground mb-1">{product.category.name}</p>
          )}
          <h3 className="font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors text-sm">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.round(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold">
              ${product.price.toFixed(2)}
            </span>
            {product.comparePrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
