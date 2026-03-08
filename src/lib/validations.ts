import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  comparePrice: z.number().optional(),
  stock: z.number().int().min(0, 'Stock must be non-negative'),
  sku: z.string().min(1, 'SKU is required'),
  categoryId: z.string().optional(),
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
  tags: z.array(z.string()),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const addressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  isDefault: z.boolean().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(10, 'Review must be at least 10 characters'),
});

export const couponSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  type: z.enum(['percent', 'flat']),
  value: z.number().positive('Value must be positive'),
  minOrder: z.number().optional(),
  usageLimit: z.number().int().optional(),
  expiresAt: z.date().optional(),
});

export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  couponCode: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
