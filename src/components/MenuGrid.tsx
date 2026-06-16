import type { Category, MenuItem } from '../types';
import { BeerCard } from './BeerCard';
import { ItemCard } from './ItemCard';

interface Props {
  activeTab: Category;
  items: MenuItem[];
  getQty: (id: string) => number;
  onAddItem: (item: MenuItem) => void;
  editMode: boolean;
  onDeleteItem: (id: string) => void;
  onOpenAddForm: () => void;
}

export function MenuGrid({ activeTab, items, getQty, onAddItem, editMode, onDeleteItem, onOpenAddForm }: Props) {
  const categoryItems = items.filter(item => item.category === activeTab);
  const isBeerTab = activeTab === 'piva';

  return (
    <div className="p-3">
      <div
        className={`grid gap-3 ${
          isBeerTab ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'
        }`}
      >
        {categoryItems.map(item =>
          isBeerTab || item.isBeer ? (
            <div key={item.id} className="relative">
              <BeerCard
                item={item}
                qty={getQty(item.id)}
                onTap={() => !editMode && onAddItem(item)}
                dimmed={editMode}
              />
              {editMode && (
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="absolute top-2 left-2 w-7 h-7 rounded-full bg-[#C8102E] text-white text-[16px] flex items-center justify-center font-bold leading-none shadow-sm z-10"
                  aria-label="Smazat položku"
                >
                  −
                </button>
              )}
            </div>
          ) : (
            <div key={item.id} className="relative">
              <ItemCard
                item={item}
                qty={getQty(item.id)}
                onTap={() => !editMode && onAddItem(item)}
                dimmed={editMode}
              />
              {editMode && (
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="absolute top-2 left-2 w-7 h-7 rounded-full bg-[#C8102E] text-white text-[16px] flex items-center justify-center font-bold leading-none shadow-sm z-10"
                  aria-label="Smazat položku"
                >
                  −
                </button>
              )}
            </div>
          )
        )}

        {/* Add new item button (only in edit mode) */}
        {editMode && (
          <button
            onClick={onOpenAddForm}
            className={`border-2 border-dashed border-[#E8E8E8] rounded-xl text-[#9B9B9B] text-[13px] font-medium flex flex-col items-center justify-center gap-1 transition-colors active:bg-[#F8F8F8] ${
              isBeerTab ? 'min-h-[130px]' : 'min-h-[72px]'
            }`}
          >
            <span className="text-[24px] font-light leading-none">+</span>
            <span>Přidat</span>
          </button>
        )}
      </div>
    </div>
  );
}
