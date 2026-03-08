import { create } from 'zustand';

interface UIStore {
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  isAISidebarOpen: boolean;
  searchQuery: string;
  isCheckoutOpen: boolean;
  isAccountOpen: boolean;
  
  setSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setAISidebarOpen: (open: boolean) => void;
  toggleAISidebar: () => void;
  setSearchQuery: (query: string) => void;
  setCheckoutOpen: (open: boolean) => void;
  toggleCheckout: () => void;
  setAccountOpen: (open: boolean) => void;
  toggleAccount: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSearchOpen: false,
  isMobileMenuOpen: false,
  isAISidebarOpen: false,
  searchQuery: '',
  isCheckoutOpen: false,
  isAccountOpen: false,

  setSearchOpen: (open) => set({ isSearchOpen: open }),

  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),

  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  setAISidebarOpen: (open) => set({ isAISidebarOpen: open }),

  toggleAISidebar: () =>
    set((state) => ({ isAISidebarOpen: !state.isAISidebarOpen })),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setCheckoutOpen: (open) => set({ isCheckoutOpen: open }),

  toggleCheckout: () =>
    set((state) => ({ isCheckoutOpen: !state.isCheckoutOpen })),

  setAccountOpen: (open) => set({ isAccountOpen: open }),

  toggleAccount: () =>
    set((state) => ({ isAccountOpen: !state.isAccountOpen })),
}));
