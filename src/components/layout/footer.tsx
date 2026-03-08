import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

const footerLinks = {
  shop: [
    { label: 'All Products', href: '/?view=all' },
    { label: 'New Arrivals', href: '/?sort=newest' },
    { label: 'Best Sellers', href: '/?sort=popular' },
    { label: 'Sale', href: '/?sale=true' },
  ],
  support: [
    { label: 'Contact Us', href: '#contact' },
    { label: 'FAQs', href: '#faq' },
    { label: 'Shipping Info', href: '#shipping' },
    { label: 'Returns', href: '#returns' },
  ],
  company: [
    { label: 'About Us', href: '#about' },
    { label: 'Careers', href: '#careers' },
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'Youtube' },
];

export function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Logo textSize="md" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your AI-powered shopping destination. Discover products with intelligent
              recommendations and seamless checkout experience.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@shopai.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>1-800-SHOPAI</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ShopAI. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <Button
                key={social.label}
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                asChild
              >
                <Link href={social.href} aria-label={social.label}>
                  <social.icon className="h-4 w-4" />
                </Link>
              </Button>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">We accept:</span>
            <div className="flex gap-2">
              <div className="h-6 w-10 bg-muted rounded flex items-center justify-center text-[10px] font-medium">
                VISA
              </div>
              <div className="h-6 w-10 bg-muted rounded flex items-center justify-center text-[10px] font-medium">
                MC
              </div>
              <div className="h-6 w-10 bg-muted rounded flex items-center justify-center text-[10px] font-medium">
                AMEX
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
