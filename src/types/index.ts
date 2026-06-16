export type Category = 'piva' | 'napoje' | 'alkohol' | 'jidlo';

export interface MenuItem {
  id: string;
  name: string;
  size?: string;
  price: number;
  category: Category;
  isBeer?: boolean;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}
