import { useState, useCallback } from 'react';
import type { MenuItem, Category, CardSize } from '../types';

const SIZES: CardSize[] = ['sm', 'md', 'lg'];
import { menuItems as defaultItems } from '../data/menu';

const STORAGE_KEY = 'pos_menu_items_v1';

function loadMenu(): MenuItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return defaultItems;
}

function persist(items: MenuItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useMenu() {
  const [items, setItems] = useState<MenuItem[]>(loadMenu);

  const getCategoryItems = useCallback(
    (category: Category) => items.filter(i => i.category === category),
    [items]
  );

  // afterId: '__start__' = prepend to category, '__end__' or undefined = append, itemId = insert after that item
  const addMenuItem = useCallback((item: MenuItem, afterId?: string) => {
    setItems(prev => {
      let next: MenuItem[];
      if (!afterId || afterId === '__start__') {
        // Find first item of this category and insert before it
        const firstIdx = prev.findIndex(i => i.category === item.category);
        if (firstIdx === -1) {
          next = [...prev, item];
        } else {
          next = [...prev.slice(0, firstIdx), item, ...prev.slice(firstIdx)];
        }
      } else if (afterId === '__end__') {
        // Find last item of this category and insert after it
        let lastIdx = -1;
        prev.forEach((i, idx) => { if (i.category === item.category) lastIdx = idx; });
        next = lastIdx === -1
          ? [...prev, item]
          : [...prev.slice(0, lastIdx + 1), item, ...prev.slice(lastIdx + 1)];
      } else {
        const idx = prev.findIndex(i => i.id === afterId);
        next = idx === -1
          ? [...prev, item]
          : [...prev.slice(0, idx + 1), item, ...prev.slice(idx + 1)];
      }
      persist(next);
      return next;
    });
  }, []);

  const removeMenuItem = useCallback((id: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id);
      persist(next);
      return next;
    });
  }, []);

  const updateMenuItem = useCallback((updated: MenuItem) => {
    setItems(prev => {
      const next = prev.map(i => i.id === updated.id ? updated : i);
      persist(next);
      return next;
    });
  }, []);

  const resizeMenuItem = useCallback((id: string, delta: 1 | -1) => {
    setItems(prev => {
      const next = prev.map(item => {
        if (item.id !== id) return item;
        const current: CardSize = item.cardSize ?? 'md';
        const idx = SIZES.indexOf(current);
        const newIdx = Math.max(0, Math.min(SIZES.length - 1, idx + delta));
        return { ...item, cardSize: SIZES[newIdx] };
      });
      persist(next);
      return next;
    });
  }, []);

  const resetMenu = useCallback(() => {
    setItems(defaultItems);
    persist(defaultItems);
  }, []);

  const reorderMenuItems = useCallback((orderedIds: string[]) => {
    setItems(prev => {
      const map = new Map(prev.map(i => [i.id, i]));
      const reordered = orderedIds.map(id => map.get(id)!).filter(Boolean);
      const rest = prev.filter(i => !orderedIds.includes(i.id));
      const next = [...reordered, ...rest];
      persist(next);
      return next;
    });
  }, []);

  return { items, getCategoryItems, addMenuItem, removeMenuItem, updateMenuItem, resizeMenuItem, reorderMenuItems, resetMenu };
}
