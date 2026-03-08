'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Sparkles, Loader2, X, Mic, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SmartSearchBarProps {
  onSearch: (query: string) => void;
  className?: string;
}

interface SearchSuggestion {
  type: 'category' | 'product' | 'tag' | 'suggestion';
  value: string;
  label: string;
  icon?: React.ReactNode;
}

const popularSearches = [
  { value: 'electronics', label: 'Electronics', type: 'category' as const },
  { value: 'fashion', label: 'Fashion', type: 'category' as const },
  { value: 'wireless headphones', label: 'Wireless Headphones', type: 'suggestion' as const },
  { value: 'running shoes', label: 'Running Shoes', type: 'suggestion' as const },
  { value: 'smart home', label: 'Smart Home', type: 'tag' as const },
  { value: 'gift ideas', label: 'Gift Ideas', type: 'suggestion' as const },
  { value: 'sports outdoors', label: 'Sports & Outdoors', type: 'category' as const },
  { value: 'beauty health', label: 'Beauty & Health', type: 'category' as const },
];

export function SmartSearchBar({ onSearch, className }: SmartSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      onSearch(searchQuery.trim());
      setTimeout(() => setIsLoading(false), 300);
      setIsOpen(false);
    }
  }, [onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.value);
    handleSearch(suggestion.value);
    setIsOpen(false);
  };

  // Filter suggestions based on input
  const filteredSuggestions = query.trim() 
    ? popularSearches.filter(s => 
        s.value.toLowerCase().includes(query.toLowerCase()) ||
        s.label.toLowerCase().includes(query.toLowerCase())
      )
    : popularSearches;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Voice search
  const [isListening, setIsListening] = useState(false);
  
  const startVoiceSearch = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error('Voice search not supported in your browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('Listening... Speak now');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSearch(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error('Voice recognition failed');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [handleSearch]);

  return (
    <div ref={wrapperRef} className={cn('relative w-full max-w-2xl', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search products, categories, or try 'electronics'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="pl-12 pr-28 h-11 text-base rounded-lg border-2 focus:border-primary transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn('h-8 w-8', isListening && 'text-red-500')}
              onClick={startVoiceSearch}
            >
              <Mic className={cn('h-4 w-4', isListening && 'animate-pulse')} />
            </Button>
            <Button
              type="submit"
              size="sm"
              className="rounded-lg h-8"
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Search</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg border">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Popular searches:</p>
            <div className="flex flex-wrap gap-1.5">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion.value}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md bg-muted hover:bg-muted/80 transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.type === 'category' && <Package className="h-3 w-3 text-primary" />}
                  {suggestion.type === 'tag' && <Sparkles className="h-3 w-3 text-amber-500" />}
                  {suggestion.label}
                </button>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
              <p className="font-medium mb-1">Search tips:</p>
              <ul className="space-y-0.5 text-[11px]">
                <li>• Type category names like "electronics" or "fashion"</li>
                <li>• Search by product features like "wireless" or "waterproof"</li>
                <li>• Use voice search by clicking the microphone icon</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
