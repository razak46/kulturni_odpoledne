export type Category = 'piva' | 'napoje' | 'alkohol' | 'jidlo';
export type CardSize = 'sm' | 'md' | 'lg';

export interface MenuItem {
  id: string;
  name: string;
  size?: string;
  price: number;
  category: Category;
  isBeer?: boolean;
  cardSize?: CardSize;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface OrderLineItem {
  name: string;
  size?: string;
  price: number;
  qty: number;
}

export interface OrderRecord {
  id: string;
  timestamp: number;
  items: OrderLineItem[];
  total: number;
  isManual: boolean;
  manualNote?: string;
}
