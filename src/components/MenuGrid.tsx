import type { Category, MenuItem } from '../types';
import { menuItems } from '../data/menu';
import { BeerCard } from './BeerCard';
import { ItemCard } from './ItemCard';

interface Props {
  activeTab: Category;
  getQty: (id: string) => number;
  onAddItem: (item: MenuItem) => void;
}

export function MenuGrid({ activeTab, getQty, onAddItem }: Props) {
  const items = menuItems.filter(item => item.category === activeTab);
  const isBeerTab = activeTab === 'piva';

  return (
    <div className="p-3">
      <div
        className={`grid gap-3 ${
          isBeerTab
            ? 'grid-cols-2'
            : 'grid-cols-2 md:grid-cols-3'
        }`}
      >
        {items.map(item =>
          item.isBeer ? (
            <BeerCard
              key={item.id}
              item={item}
              qty={getQty(item.id)}
              onTap={() => onAddItem(item)}
            />
          ) : (
            <ItemCard
              key={item.id}
              item={item}
              qty={getQty(item.id)}
              onTap={() => onAddItem(item)}
            />
          )
        )}
      </div>
    </div>
  );
}
