// Supabase Database Types
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          password_hash: string | null
          role: string
          avatar: string | null
          email_verified: string | null
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          password_hash?: string | null
          role?: string
          avatar?: string | null
          email_verified?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          password_hash?: string | null
          role?: string
          avatar?: string | null
          email_verified?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          price: number
          compare_price: number | null
          stock: number
          sku: string
          category_id: string | null
          images: string
          tags: string
          rating: number
          review_count: number
          is_featured: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description: string
          price: number
          compare_price?: number | null
          stock?: number
          sku: string
          category_id?: string | null
          images: string
          tags: string
          rating?: number
          review_count?: number
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          price?: number
          compare_price?: number | null
          stock?: number
          sku?: string
          category_id?: string | null
          images?: string
          tags?: string
          rating?: number
          review_count?: number
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image: string | null
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image?: string | null
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image?: string | null
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: string
          total: number
          shipping_address: string
          payment_intent: string | null
          stripe_session_id: string | null
          payment_method: string
          payment_status: string
          tracking_number: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          total: number
          shipping_address: string
          payment_intent?: string | null
          stripe_session_id?: string | null
          payment_method?: string
          payment_status?: string
          tracking_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          total?: number
          shipping_address?: string
          payment_intent?: string | null
          stripe_session_id?: string | null
          payment_method?: string
          payment_status?: string
          tracking_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          snapshot: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          snapshot: string
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          snapshot?: string
          created_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          product_id: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          product_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          product_id: string
          rating: number
          title: string
          body: string
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          rating: number
          title: string
          body: string
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          rating?: number
          title?: string
          body?: string
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      wishlist_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          street: string
          city: string
          state: string
          zip: string
          country: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label: string
          street: string
          city: string
          state: string
          zip: string
          country: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string
          street?: string
          city?: string
          state?: string
          zip?: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          type: string
          value: number
          min_order: number | null
          usage_limit: number | null
          used_count: number
          expires_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          type: string
          value: number
          min_order?: number | null
          usage_limit?: number | null
          used_count?: number
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          type?: string
          value?: number
          min_order?: number | null
          usage_limit?: number | null
          used_count?: number
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ai_chat_history: {
        Row: {
          id: string
          user_id: string | null
          session_id: string
          messages: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id: string
          messages: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string
          messages?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience type exports
export type User = Database['public']['Tables']['users']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type CartItem = Database['public']['Tables']['cart_items']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type WishlistItem = Database['public']['Tables']['wishlist_items']['Row']
export type Address = Database['public']['Tables']['addresses']['Row']
export type Coupon = Database['public']['Tables']['coupons']['Row']
