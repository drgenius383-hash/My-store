'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from './supabase/client';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
  stock: number;
};

type NewItem = Omit<CartItem, 'quantity'>;

type CartContextValue = {
  items: CartItem[];
  hydrated: boolean;
  count: number;
  total: number;
  add: (item: NewItem, qty?: number) => void;
  setQuantity: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  syncWithCatalog: () => Promise<void>;
};

const STORAGE_KEY = 'mbs_cart_v1';
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const itemsRef = useRef<CartItem[]>(items);
  itemsRef.current = items;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage may be full or blocked
    }
  }, [items, hydrated]);

  const add = useCallback((item: NewItem, qty = 1) => {
    if (item.stock <= 0) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, ...item, quantity: Math.min(i.quantity + qty, item.stock) }
            : i
        );
      }
      return [...prev, { ...item, quantity: Math.min(Math.max(1, qty), item.stock) }];
    });
  }, []);

  const setQuantity = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.min(Math.max(1, qty), i.stock) } : i
      )
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  // Refresh prices/stock from the database so the cart never shows stale data.
  const syncWithCatalog = useCallback(async () => {
    const ids = itemsRef.current.map((i) => i.id);
    if (ids.length === 0) return;
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, quantity, image_url')
      .in('id', ids);
    if (error || !data) return;

    const latest = new Map<string, { name: string; price: number; quantity: number; image_url: string | null }>();
    for (const row of data as { id: string; name: string; price: number; quantity: number; image_url: string | null }[]) {
      latest.set(row.id, row);
    }

    setItems((prev) =>
      prev.flatMap((i) => {
        const p = latest.get(i.id);
        if (!p || p.quantity <= 0) return [];
        return [
          {
            ...i,
            name: p.name,
            price: p.price,
            image_url: p.image_url,
            stock: p.quantity,
            quantity: Math.min(i.quantity, p.quantity),
          },
        ];
      })
    );
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      hydrated,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
      syncWithCatalog,
    }),
    [items, hydrated, add, setQuantity, remove, clear, syncWithCatalog]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
