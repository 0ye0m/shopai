'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  ShoppingCart,
  Heart,
  User,
  Sun,
  Moon,
  ChevronDown,
  X,
  LogOut,
  Package,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { useCartStore, useWishlistStore } from '@/lib/stores';
import { SmartSearchBar } from '@/components/store/smart-search-bar';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';

interface HeaderProps {
  categories: { id: string; name: string; slug: string }[];
  onAccountClick?: () => void;
  onAuthClick?: () => void;
}

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  image: string | null;
}

export function Header({ categories, onAccountClick, onAuthClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { getItemCount, openCart } = useCartStore();
  const { getItemCount: getWishlistCount } = useWishlistStore();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 0);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        setUser(data.user);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleSearch = (query: string) => {
    window.location.href = `/?search=${encodeURIComponent(query)}`;
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      window.location.reload();
    } catch {
      console.error('Failed to logout');
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/#products-section' },
    {
      label: 'Categories',
      hasDropdown: true,
      items: categories.map((c) => ({ label: c.name, slug: c.slug })),
    },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200',
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-sm'
          : 'bg-background'
      )}
    >
      {/* Promotional Banner */}
      {showBanner && (
        <div className="bg-card border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center py-2 relative">
              <p className="text-sm text-center text-muted-foreground pr-6">
                <span className="font-medium text-foreground">Free shipping</span> on orders over $50 | Use code{' '}
                <span className="font-medium text-primary">WELCOME10</span> for 10% off
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 h-6 w-6"
                onClick={() => setShowBanner(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile Menu Toggle */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <div key={link.label}>
                    {link.hasDropdown ? (
                      <div className="space-y-2">
                        <span className="font-medium">{link.label}</span>
                        <div className="pl-4 space-y-2">
                          {link.items?.map((item) => (
                            <Link
                              key={item.label}
                              href={`/?category=${item.slug}`}
                              className="block text-muted-foreground hover:text-primary transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={link.href || '#'}
                        className="block font-medium hover:text-primary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    )}
                  </div>
                ))}
                <div className="border-t pt-4 mt-4 space-y-3">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback>
                            {user.name?.[0] || user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name || 'User'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <button
                        className="w-full text-left font-medium hover:text-primary transition-colors"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onAccountClick?.();
                        }}
                      >
                        My Account
                      </button>
                      <button
                        className="w-full text-left font-medium text-destructive hover:text-destructive/80 transition-colors"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      className="w-full text-left font-medium hover:text-primary transition-colors"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onAuthClick?.();
                      }}
                    >
                      Sign In / Create Account
                    </button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Logo textSize="md" />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div key={link.label}>
                {link.hasDropdown ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-1 h-10 px-4">
                        {link.label}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {link.items?.map((item) => (
                        <DropdownMenuItem key={item.label} asChild>
                          <Link href={`/?category=${item.slug}`}>{item.label}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    href={link.href || '#'}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-lg mx-4">
            <SmartSearchBar onSearch={handleSearch} />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-0.5">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            )}

            {/* Wishlist */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10"
              onClick={() => onAccountClick?.()}
            >
              <div className="relative">
                <Heart className="h-5 w-5" />
                {mounted && getWishlistCount() > 0 && (
                  <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 rounded-full p-0 flex items-center justify-center text-[10px]">
                    {getWishlistCount()}
                  </Badge>
                )}
              </div>
            </Button>

            {/* Cart */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10"
              onClick={openCart}
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {mounted && getItemCount() > 0 && (
                  <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-4 rounded-full p-0 flex items-center justify-center text-[10px]">
                    {getItemCount()}
                  </Badge>
                )}
              </div>
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback className="text-xs">
                        {user.name?.[0] || user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="font-medium">{user.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onAccountClick?.()}>
                    <User className="h-4 w-4 mr-2" />
                    My Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAccountClick?.()}>
                    <Package className="h-4 w-4 mr-2" />
                    Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAccountClick?.()}>
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onAccountClick?.()}>
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="sm"
                className="hidden sm:flex ml-2"
                onClick={() => onAuthClick?.()}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <SmartSearchBar onSearch={handleSearch} />
        </div>
      </div>
    </header>
  );
}
