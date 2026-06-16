import type { Category } from '../types';

export const CATEGORY_BG: Record<Category, string> = {
  piva:    '#FFFBEB', // warm amber
  napoje:  '#EFF6FF', // sky blue
  alkohol: '#F5F3FF', // soft lavender
  jidlo:   '#F0FDF4', // mint green
};

export const CATEGORY_LABEL: Record<Category, string> = {
  piva:    'Piva',
  napoje:  'Nápoje',
  alkohol: 'Alkohol',
  jidlo:   'Jídlo',
};

export const CATEGORY_ORDER: Category[] = ['piva', 'napoje', 'alkohol', 'jidlo'];
