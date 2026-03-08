import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CompareItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  description: string;
  rating: number;
  reviewCount: number;
  stock: number;
  category: string;
  tags: string[];
}

interface CompareStore {
  items: CompareItem[];
  isCompareBarOpen: boolean;
  
  addItem: (item: CompareItem) => boolean;
  removeItem: (productId: string) => void;
  clearCompare: () => void;
  toggleCompareBar: () => void;
  openCompareBar: () => void;
  closeCompareBar: () => void;
  isInCompare: (productId: string) => boolean;
  canAddMore: () => boolean;
}

const MAX_COMPARE_ITEMS = 4;

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],
      isCompareBarOpen: false,

      addItem: (item) => {
        const items = get().items;
        if (items.length >= MAX_COMPARE_ITEMS) {
          return false;
        }
        if (items.find((i) => i.productId === item.productId)) {
          return true; // Already in compare
        }
        set({ items: [...items, item], isCompareBarOpen: true });
        return true;
      },

      removeItem: (productId) => {
        const newItems = get().items.filter((i) => i.productId !== productId);
        set({ 
          items: newItems,
          isCompareBarOpen: newItems.length > 0 ? get().isCompareBarOpen : false 
        });
      },

      clearCompare: () => set({ items: [], isCompareBarOpen: false }),

      toggleCompareBar: () => set((state) => ({ isCompareBarOpen: !state.isCompareBarOpen })),

      openCompareBar: () => set({ isCompareBarOpen: true }),

      closeCompareBar: () => set({ isCompareBarOpen: false }),

      isInCompare: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      canAddMore: () => {
        return get().items.length < MAX_COMPARE_ITEMS;
      },
    }),
    {
      name: 'compare-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
