import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  addedAt: string;
}

interface WishlistStore {
  items: WishlistItem[];
  
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  setItems: (items: WishlistItem[]) => void;
  getItemCount: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items;
        const exists = items.find((i) => i.productId === item.productId);

        if (!exists) {
          set({
            items: [...items, { ...item, addedAt: new Date().toISOString() }],
          });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((i) => i.productId !== productId),
        });
      },

      clearWishlist: () => set({ items: [] }),

      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      setItems: (items) => set({ items }),

      getItemCount: () => get().items.length,
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Alias for backward compatibility
export const addItem = (item: Omit<WishlistItem, 'addedAt'>) => useWishlistStore.getState().addItem(item);
export const removeItem = (productId: string) => useWishlistStore.getState().removeItem(productId);
export const isInWishlist = (productId: string) => useWishlistStore.getState().isInWishlist(productId);
