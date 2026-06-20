import { useState, useCallback } from 'react';
import type { CategoryDef } from '../types';
import { DEFAULT_CATEGORIES } from '../data/colors';

const STORAGE_KEY = 'pos_categories_v1';

function load(): CategoryDef[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return DEFAULT_CATEGORIES;
}

function persist(cats: CategoryDef[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryDef[]>(load);

  const addCategory = useCallback((cat: CategoryDef) => {
    setCategories(prev => {
      const next = [...prev, cat];
      persist(next);
      return next;
    });
  }, []);

  const updateCategory = useCallback((updated: CategoryDef) => {
    setCategories(prev => {
      const next = prev.map(c => c.id === updated.id ? updated : c);
      persist(next);
      return next;
    });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => {
      const next = prev.filter(c => c.id !== id);
      persist(next);
      return next;
    });
  }, []);

  return { categories, addCategory, updateCategory, deleteCategory };
}
