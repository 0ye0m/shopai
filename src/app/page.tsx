'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowRight, 
  Star, 
  Truck, 
  Shield, 
  RefreshCw, 
  HeadphonesIcon,
  Sparkles,
  TrendingUp,
  Zap,
  User,
  Languages,
  Download,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ProductCard } from '@/components/store/product-card';
import { CartDrawer } from '@/components/store/cart-drawer';
import { AIChatWidget } from '@/components/ai/ai-chat-widget';
import { ProductDetailModal } from '@/components/store/product-detail-modal';
import { CheckoutModal } from '@/components/store/checkout-modal';
import { AccountModal } from '@/components/store/account-modal';
import { CompareBar } from '@/components/store/compare-bar';
import { FilterSidebar } from '@/components/store/filter-sidebar';
import { VoiceSearch } from '@/components/store/voice-search';
import { AdminPanel } from '@/components/admin/admin-panel';
import { AuthModal } from '@/components/auth/auth-modal';
import { toast } from 'sonner';

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

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

function HomePageContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const categoryFilter = searchParams.get('category');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFilter);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [minRating, setMinRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  
  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // PWA Install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast.success('App installed successfully!');
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(minRating > 0 && { minRating: minRating.toString() }),
      });
      
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`/api/products?${params}`),
        fetch('/api/categories'),
      ]);
      
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      
      setProducts(productsData.products || []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, priceRange, minRating]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);

  const clearFilters = () => {
    setSelectedCategory(null);
    setPriceRange([0, 5000]);
    setMinRating(0);
    setSelectedTags([]);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleVoiceSearch = (transcript: string) => {
    window.location.href = `/?search=${encodeURIComponent(transcript)}`;
  };

  const relatedProducts = selectedProduct
    ? products.filter(p => 
        p.category?.slug === selectedProduct.category?.slug && 
        p.id !== selectedProduct.id
      ).slice(0, 4)
    : [];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        categories={categories} 
        onAccountClick={() => setIsAccountOpen(true)}
        onAuthClick={() => setIsAuthOpen(true)}
      />
      
      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div className="bg-card border-b px-4 py-2 flex items-center justify-center gap-4">
          <span className="text-sm">Install ShopAI for the best experience!</span>
          <Button size="sm" onClick={handleInstall}>
            <Download className="h-4 w-4 mr-1" />
            Install
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowInstallBanner(false)}>
            Dismiss
          </Button>
        </div>
      )}
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-card border-b overflow-hidden">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-2xl">
              <Badge className="mb-4" variant="secondary">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered Shopping
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                Shop Smarter with{' '}
                <span className="text-primary">AI</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Discover products tailored to your needs. Our AI assistant helps you find exactly what you&apos;re looking for.
              </p>
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="lg" onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <VoiceSearch onResult={handleVoiceSearch} />
              </div>
            </div>
          </div>
        </section>

        {/* Features Bar */}
        <section className="border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Free Shipping</h3>
                  <p className="text-xs text-muted-foreground">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Secure Payment</h3>
                  <p className="text-xs text-muted-foreground">100% secure checkout</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Easy Returns</h3>
                  <p className="text-xs text-muted-foreground">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <HeadphonesIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">24/7 AI Support</h3>
                  <p className="text-xs text-muted-foreground">Always available</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions & Language Selector */}
        <section className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsAccountOpen(true)}>
                <User className="h-4 w-4 mr-2" />
                My Account
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsCheckoutOpen(true)}>
                Checkout
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  toast.success(`Language changed to ${languages.find(l => l.code === e.target.value)?.name}`);
                }}
                className="bg-background border rounded-md px-2 py-1.5 text-sm"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section id="products-section" className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar - Desktop */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <FilterSidebar
                categories={categories}
                selectedCategory={selectedCategory}
                priceRange={priceRange}
                minRating={minRating}
                selectedTags={selectedTags}
                onCategoryChange={setSelectedCategory}
                onPriceChange={setPriceRange}
                onRatingChange={setMinRating}
                onTagsChange={setSelectedTags}
                onClearFilters={clearFilters}
              />
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {searchQuery ? `Search: "${searchQuery}"` : 'All Products'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {products.length} products found
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <VoiceSearch onResult={handleVoiceSearch} />
                </div>
              </div>

              {/* Products */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="aspect-square" />
                      <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-6 w-1/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No products found</p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onProductClick={() => handleProductClick(product)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        {!searchQuery && featuredProducts.length > 0 && (
          <section className="bg-card border-y py-12">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Featured Products
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Handpicked favorites from our collection</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    onProductClick={() => handleProductClick(product)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Categories Section */}
        {!searchQuery && categories.length > 0 && (
          <section className="container mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Shop by Category</h2>
              <p className="text-sm text-muted-foreground mt-1">Browse our wide selection of categories</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className="group text-left"
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square relative bg-muted">
                      <Image
                        src={category.image || `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400`}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40" />
                      <h3 className="absolute bottom-3 left-3 text-white font-medium text-sm">
                        {category.name}
                      </h3>
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* AI Features Banner */}
        <section className="bg-card border-y py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4" variant="secondary">
                <Zap className="h-3 w-3 mr-1" />
                Powered by AI
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Shopping Reimagined
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Our AI assistant helps you find the perfect products, answers your questions, 
                and provides personalized recommendations. Just ask!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-background rounded-lg p-6 border">
                  <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Smart Search</h3>
                  <p className="text-sm text-muted-foreground">
                    Search naturally and find exactly what you need
                  </p>
                </div>
                <div className="bg-background rounded-lg p-6 border">
                  <HeadphonesIcon className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">AI Assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    Get instant help with product questions
                  </p>
                </div>
                <div className="bg-background rounded-lg p-6 border">
                  <TrendingUp className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Product Compare</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered comparison and recommendations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="container mx-auto px-4 py-16">
          <Card className="bg-card">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-2xl font-bold mb-2">Stay Updated</h2>
              <p className="text-muted-foreground mb-6">
                Subscribe for exclusive deals, new arrivals, and AI-powered recommendations
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1"
                />
                <Button type="submit">Subscribe</Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
      
      {/* Modals & Overlays */}
      <CartDrawer />
      <AIChatWidget />
      <ProductDetailModal
        product={selectedProduct}
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        relatedProducts={relatedProducts}
      />
      <CheckoutModal
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
      />
      <AccountModal
        open={isAccountOpen}
        onOpenChange={setIsAccountOpen}
        onCheckoutOpen={() => {
          setIsAccountOpen(false);
          setIsCheckoutOpen(true);
        }}
      />
      <AuthModal
        open={isAuthOpen}
        onOpenChange={setIsAuthOpen}
        onAuthSuccess={() => {
          setIsAuthOpen(false);
          setIsAccountOpen(true);
        }}
      />
      <CompareBar />
      <AdminPanel />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
