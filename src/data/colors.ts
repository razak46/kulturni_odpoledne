import type { CategoryDef } from '../types';

export const DEFAULT_CATEGORIES: CategoryDef[] = [
  { id: 'piva',    label: 'Pivo & Limo', bgColor: '#FFFBEB' },
  { id: 'napoje',  label: 'Nápoje',      bgColor: '#EFF6FF' },
  { id: 'alkohol', label: 'Alkohol',     bgColor: '#F5F3FF' },
  { id: 'jidlo',   label: 'Jídlo',       bgColor: '#F0FDF4' },
];

export const PRESET_CATEGORY_COLORS: string[] = [
  '#FFFBEB', // amber
  '#EFF6FF', // sky
  '#F5F3FF', // lavender
  '#F0FDF4', // mint
  '#FFF1F2', // rose
  '#FFF7ED', // orange
  '#F0FDFA', // teal
  '#F8FAFC', // slate
  '#FDF4FF', // purple
  '#FFFDE7', // yellow
];
