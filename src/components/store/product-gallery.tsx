'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const displayImages = images.length > 0 ? images : ['/placeholder.png'];
  const selectedImage = displayImages[selectedIndex];

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x, y });
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div 
        className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={selectedImage}
          alt={`${name} - Image ${selectedIndex + 1}`}
          fill
          className={cn(
            "object-cover transition-transform duration-200",
            isZoomed && "scale-150"
          )}
          style={isZoomed ? {
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
          } : undefined}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        
        {/* Zoom Indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="secondary" className="rounded-full shadow-md">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <Button
              size="icon"
              variant="secondary"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full shadow-md opacity-0 hover:opacity-100 transition-opacity"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full shadow-md opacity-0 hover:opacity-100 transition-opacity"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all",
                selectedIndex === index
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-gray-300"
              )}
            >
              <Image
                src={image}
                alt={`${name} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {displayImages.length > 1 && (
        <div className="text-center text-sm text-gray-500">
          {selectedIndex + 1} / {displayImages.length}
        </div>
      )}
    </div>
  );
}
