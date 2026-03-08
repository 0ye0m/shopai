-- ShopAI Supabase Tables
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'customer',
  avatar VARCHAR(500),
  image VARCHAR(500),
  email_verified TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image VARCHAR(500),
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  compare_price DECIMAL(10, 2),
  stock INTEGER DEFAULT 0,
  sku VARCHAR(100) UNIQUE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  images TEXT NOT NULL,
  tags TEXT NOT NULL,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total DECIMAL(10, 2) NOT NULL,
  shipping_address TEXT NOT NULL,
  payment_intent VARCHAR(255),
  stripe_session_id VARCHAR(255),
  payment_method VARCHAR(50) DEFAULT 'cod',
  payment_status VARCHAR(50) DEFAULT 'pending',
  tracking_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  snapshot TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart Items table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Addresses table
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  label VARCHAR(100) NOT NULL,
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  min_order DECIMAL(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Chat History table
CREATE TABLE IF NOT EXISTS public.ai_chat_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  messages TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_cart_user ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_session ON public.cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlist_items(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (TRUE);

-- RLS Policies for authenticated users
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users read own cart" ON public.cart_items FOR SELECT USING (auth.uid()::text = user_id::text OR session_id IS NOT NULL);
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL USING (auth.uid()::text = user_id::text OR session_id IS NOT NULL);
CREATE POLICY "Users read own wishlist" ON public.wishlist_items FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users manage own wishlist" ON public.wishlist_items FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users read own addresses" ON public.addresses FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL USING (auth.uid()::text = user_id::text);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER handle_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_ai_chat_history_updated_at BEFORE UPDATE ON public.ai_chat_history FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable real-time for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
