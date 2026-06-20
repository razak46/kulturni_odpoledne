export type Category = string;
export type CardSize = 'sm' | 'md' | 'lg';

export interface CategoryDef {
  id: string;
  label: string;
  bgColor: string;
}

export interface MenuItem {
  id: string;
  name: string;
  size?: string;
  price: number;
  category: Category;
  isBeer?: boolean;
  cardSize?: CardSize;
  isSpacer?: boolean;
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
