import { useState, useCallback } from 'react';
import type { MenuItem, OrderItem } from '../types';

export function useOrder() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const addItem = useCallback((item: MenuItem) => {
    setOrderItems(prev => {
      const existing = prev.find(o => o.menuItem.id === item.id);
      if (existing) {
        return prev.map(o =>
          o.menuItem.id === item.id ? { ...o, quantity: o.quantity + 1 } : o
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setOrderItems(prev => prev.filter(o => o.menuItem.id !== itemId));
  }, []);

  const adjustQty = useCallback((itemId: string, delta: number) => {
    setOrderItems(prev => {
      const existing = prev.find(o => o.menuItem.id === itemId);
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) return prev.filter(o => o.menuItem.id !== itemId);
      return prev.map(o =>
        o.menuItem.id === itemId ? { ...o, quantity: newQty } : o
      );
    });
  }, []);

  const resetOrder = useCallback(() => {
    setOrderItems([]);
  }, []);

  const getQty = useCallback(
    (itemId: string) => orderItems.find(o => o.menuItem.id === itemId)?.quantity ?? 0,
    [orderItems]
  );

  const total = orderItems.reduce((sum, o) => sum + o.menuItem.price * o.quantity, 0);
  const itemCount = orderItems.reduce((sum, o) => sum + o.quantity, 0);

  return { orderItems, addItem, removeItem, adjustQty, resetOrder, getQty, total, itemCount };
}
