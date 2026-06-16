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

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}
