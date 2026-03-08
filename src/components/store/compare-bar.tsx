'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Scale, X, ChevronUp, ChevronDown, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCompareStore } from '@/lib/stores';
import { cn } from '@/lib/utils';

export function CompareBar() {
  const { items, removeItem, clearCompare } = useCompareStore();
  const [isExpanded, setIsExpanded] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 z-40 bg-background border-t shadow-lg transition-all duration-300',
      isExpanded ? 'h-[80vh]' : 'h-auto'
    )}>
      {/* Collapsed Bar */}
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Scale className="h-5 w-5 text-primary" />
          <span className="font-medium">Compare Products ({items.length}/4)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              clearCompare();
            }}
          >
            Clear All
          </Button>
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <CompareContent items={items} removeItem={removeItem} />
      )}

      {/* Mini Preview when collapsed */}
      {!isExpanded && (
        <div className="flex items-center gap-3 px-4 pb-3 overflow-x-auto">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-2 bg-muted rounded-lg px-2 py-1">
              <div className="relative h-8 w-8 rounded overflow-hidden">
                <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
              </div>
              <span className="text-sm font-medium truncate max-w-[120px]">{item.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(item.productId);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompareContent({ items, removeItem }: { items: any[], removeItem: (id: string) => void }) {
  const [aiVerdict, setAiVerdict] = useState<string | null>(null);
  const [isLoadingVerdict, setIsLoadingVerdict] = useState(false);

  useEffect(() => {
    if (items.length >= 2) {
      generateAiVerdict();
    }
  }, [items]);

  const generateAiVerdict = async () => {
    setIsLoadingVerdict(true);
    try {
      const response = await fetch('/api/ai/compare-verdict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: items }),
      });
      const data = await response.json();
      setAiVerdict(data.verdict);
    } catch (error) {
      console.error('Error generating verdict:', error);
      setAiVerdict('Unable to generate comparison at this time.');
    } finally {
      setIsLoadingVerdict(false);
    }
  };

  const specs = [
    { label: 'Price', key: 'price', format: (v: number) => `$${v.toFixed(2)}` },
    { label: 'Original Price', key: 'comparePrice', format: (v: number | null) => v ? `$${v.toFixed(2)}` : '-' },
    { label: 'Rating', key: 'rating', format: (v: number) => `${v.toFixed(1)} ⭐` },
    { label: 'Reviews', key: 'reviewCount', format: (v: number) => `${v} reviews` },
    { label: 'Stock', key: 'stock', format: (v: number) => v > 0 ? `${v} in stock` : 'Out of stock' },
    { label: 'Category', key: 'category', format: (v: string) => v },
  ];

  return (
    <ScrollArea className="h-[calc(80vh-60px)]">
      <div className="p-4 space-y-6">
        {/* AI Verdict */}
        {items.length >= 2 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Verdict
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingVerdict ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing products...
                </div>
              ) : (
                <p className="text-sm leading-relaxed">{aiVerdict}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-left font-medium text-muted-foreground text-sm w-32">Specification</th>
                {items.map((item) => (
                  <th key={item.productId} className="p-3 text-center min-w-[200px]">
                    <div className="relative mx-auto w-24 h-24 mb-2 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs text-muted-foreground h-7"
                      onClick={() => removeItem(item.productId)}
                    >
                      Remove
                    </Button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specs.map((spec) => (
                <tr key={spec.key} className="border-t">
                  <td className="p-3 font-medium text-sm">{spec.label}</td>
                  {items.map((item) => (
                    <td key={item.productId} className="p-3 text-center text-sm">
                      {spec.format((item as any)[spec.key])}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Tags Row */}
              <tr className="border-t">
                <td className="p-3 font-medium text-sm">Tags</td>
                {items.map((item) => (
                  <td key={item.productId} className="p-3 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {item.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              {/* Description Row */}
              <tr className="border-t">
                <td className="p-3 font-medium text-sm">Description</td>
                {items.map((item) => (
                  <td key={item.productId} className="p-3 text-center">
                    <p className="text-xs text-muted-foreground line-clamp-3">{item.description}</p>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ScrollArea>
  );
}
