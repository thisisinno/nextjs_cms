'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { CartItem, Service } from '@/lib/types';

type CartContext = { items: CartItem[]; totalItems: number; hasService: (service: number) => boolean; countForService: (service: number) => number; add: (service: Service) => void; remove: (service: number) => void; updateNote: (service: number, note: string) => void; clear: () => void; ready: boolean };
const Cart = createContext<CartContext | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem('enquiry-cart') || '[]')); } catch { localStorage.removeItem('enquiry-cart'); }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem('enquiry-cart', JSON.stringify(items)); }, [items, ready]);
  const value = useMemo(() => ({
    items, ready,
    totalItems: items.length,
    hasService: (service: number) => items.some(item => item.service === service),
    countForService: (service: number) => items.find(item => item.service === service)?.quantity || 0,
    add: (service: Service) => setItems(current => current.some(item => item.service === service.id) ? current : [...current, { service: service.id, service_title_snapshot: service.title, note: '', quantity: 1 }]),
    remove: (service: number) => setItems(current => current.filter(item => item.service !== service)),
    updateNote: (service: number, note: string) => setItems(current => current.map(item => item.service === service ? { ...item, note } : item)),
    clear: () => setItems([]),
  }), [items, ready]);
  return <Cart.Provider value={value}>{children}</Cart.Provider>;
}

export function useCart() {
  const cart = useContext(Cart);
  if (!cart) throw new Error('useCart must be used within CartProvider');
  return cart;
}
