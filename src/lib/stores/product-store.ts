import { create } from 'zustand';

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  sku: string;
  images: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface ProductStore {
  selectedProduct: ProductDetail | null;
  isOpen: boolean;
  isLoading: boolean;
  
  openProduct: (product: ProductDetail) => void;
  closeProduct: () => void;
  setSelectedProduct: (product: ProductDetail | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  selectedProduct: null,
  isOpen: false,
  isLoading: false,

  openProduct: (product) => set({ 
    selectedProduct: product, 
    isOpen: true,
    isLoading: false 
  }),

  closeProduct: () => set({ 
    isOpen: false 
  }),

  setSelectedProduct: (product) => set({ 
    selectedProduct: product 
  }),

  setLoading: (loading) => set({ 
    isLoading: loading 
  }),
}));
