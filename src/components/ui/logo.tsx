'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  textSize?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  asLink?: boolean;
}

export function Logo({ className, textSize = 'md', showDot = true, asLink = true }: LogoProps) {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <span className={cn('font-bold tracking-tight flex items-center', textSizes[textSize], className)}>
      <span className="text-foreground">Shop</span>
      <span className="text-primary">AI</span>
      {showDot && <span className="text-primary">.</span>}
    </span>
  );

  if (asLink) {
    return (
      <Link href="/" className="flex items-center group">
        {content}
      </Link>
    );
  }

  return content;
}
