'use client';

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useSyncExternalStore,
} from 'react';
import type { CartItem, CartState } from '../types';

interface CartContextValue extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = 'ecommerce_cart_v1';
const EMPTY_ITEMS: CartItem[] = [];

// Lightweight external reactive store for client-side localStorage synchronization
let cachedItems: CartItem[] | null = null;
let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function getStoredItems(): CartItem[] {
  if (typeof window === 'undefined') {
    return EMPTY_ITEMS;
  }
  if (cachedItems !== null) {
    return cachedItems;
  }
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        cachedItems = parsed;
        return cachedItems;
      }
    }
  } catch {
    // Ignore read errors
  }
  cachedItems = [];
  return cachedItems;
}

function setStoredItems(nextItems: CartItem[]) {
  cachedItems = nextItems;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextItems));
    } catch {
      // Ignore write quota errors
    }
  }
  emitChange();
}

function subscribe(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

function getSnapshot(): CartItem[] {
  return getStoredItems();
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_ITEMS;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    const currentItems = getStoredItems();
    const existingIndex = currentItems.findIndex(
      (i) => i.variantId === item.variantId
    );
    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...currentItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + quantity,
      };
    } else {
      updated = [...currentItems, { ...item, quantity }];
    }
    setStoredItems(updated);
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((variantId: string) => {
    const updated = getStoredItems().filter((i) => i.variantId !== variantId);
    setStoredItems(updated);
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    const updated = getStoredItems().map((item) =>
      item.variantId === variantId ? { ...item, quantity } : item
    );
    setStoredItems(updated);
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setStoredItems([]);
  }, []);

  const totalItemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
