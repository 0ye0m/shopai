'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FilterSidebarProps {
  categories: { id: string; name: string; slug: string }[];
  selectedCategory: string | null;
  priceRange: [number, number];
  minRating: number;
  selectedTags: string[];
  onCategoryChange: (category: string | null) => void;
  onPriceChange: (range: [number, number]) => void;
  onRatingChange: (rating: number) => void;
  onTagsChange: (tags: string[]) => void;
  onClearFilters: () => void;
}

const availableTags = [
  'smartphone', 'apple', 'samsung', 'wireless', 'noise-canceling',
  'laptop', 'gaming', 'professional', 'premium', 'casual',
  'running', 'fitness', 'outdoor', 'waterproof', 'sustainable'
];

export function FilterSidebar({
  categories,
  selectedCategory,
  priceRange,
  minRating,
  selectedTags,
  onCategoryChange,
  onPriceChange,
  onRatingChange,
  onTagsChange,
  onClearFilters,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    rating: true,
    tags: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const hasActiveFilters = selectedCategory || minRating > 0 || selectedTags.length > 0;

  return (
    <Card className="bg-card border sticky top-24">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onClearFilters}>
              Clear all
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Category Filter */}
        <div className="space-y-3">
          <button
            className="flex items-center justify-between w-full font-medium text-sm"
            onClick={() => toggleSection('category')}
          >
            Category
            {expandedSections.category ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {expandedSections.category && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-categories"
                  checked={!selectedCategory}
                  onCheckedChange={() => onCategoryChange(null)}
                />
                <Label htmlFor="all-categories" className="cursor-pointer text-sm font-normal">
                  All Categories
                </Label>
              </div>
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.slug}
                    checked={selectedCategory === category.slug}
                    onCheckedChange={() => onCategoryChange(category.slug)}
                  />
                  <Label htmlFor={category.slug} className="cursor-pointer text-sm font-normal">
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="space-y-3">
          <button
            className="flex items-center justify-between w-full font-medium text-sm"
            onClick={() => toggleSection('price')}
          >
            Price Range
            {expandedSections.price ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {expandedSections.price && (
            <div className="space-y-4">
              <Slider
                value={priceRange}
                min={0}
                max={5000}
                step={50}
                onValueChange={(value) => onPriceChange(value as [number, number])}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">${priceRange[0]}</span>
                <span className="text-muted-foreground">${priceRange[1]}</span>
              </div>
            </div>
          )}
        </div>

        {/* Rating Filter */}
        <div className="space-y-3">
          <button
            className="flex items-center justify-between w-full font-medium text-sm"
            onClick={() => toggleSection('rating')}
          >
            Rating
            {expandedSections.rating ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {expandedSections.rating && (
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md transition-colors ${
                    minRating === rating ? 'bg-primary/10' : 'hover:bg-muted'
                  }`}
                  onClick={() => onRatingChange(minRating === rating ? 0 : rating)}
                >
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">& up</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tags Filter */}
        <div className="space-y-3">
          <button
            className="flex items-center justify-between w-full font-medium text-sm"
            onClick={() => toggleSection('tags')}
          >
            Tags
            {expandedSections.tags ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {expandedSections.tags && (
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'secondary'}
                  className="cursor-pointer text-xs px-2 py-0.5"
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      onTagsChange(selectedTags.filter((t) => t !== tag));
                    } else {
                      onTagsChange([...selectedTags, tag]);
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
