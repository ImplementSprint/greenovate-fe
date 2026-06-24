import type React from 'react';
import type { Branch, BranchInventory, CartItem, Order, Product, User } from '@/types';

export type AccountSubView = 'profile' | 'addresses' | 'orders' | 'settings' | 'returns';

export interface AppContextType {
  view: string;
  setView: (view: string) => void;
  accountSubView: AccountSubView;
  setAccountSubView: React.Dispatch<React.SetStateAction<AccountSubView>>;
  isLoggedIn: boolean;
  setLoggedIn: () => void;
  logout: () => void;
  user: User | null;
  interestMap: Map<string, number>;
  categoryInterestMap: Map<string, number>;
  trendingSearches: string[];
  setUser: (user: User | null) => void;
  fetchUserProfile: () => Promise<void>;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  checkoutItemIds: string[] | null;
  setCheckoutItemIds: (ids: string[] | null) => void;
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch | null) => void;
  branches: Branch[];
  branchInventory: BranchInventory[];
  isBranchModalOpen: boolean;
  setIsBranchModalOpen: (isOpen: boolean) => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  addToCart: (product: Product, options?: { openCart?: boolean }) => void;
  updateQuantity: (id: string, delta: number) => void;
  cartTotal: number;
  isBranchOpen: (branch: Branch) => boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}
