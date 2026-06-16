import type { MenuItem } from '../types';
import { CATEGORY_ORDER, CATEGORY_LABEL, CATEGORY_BG } from '../data/colors';
import { BeerCard } from './BeerCard';
import { ItemCard } from './ItemCard';
import { CardEditOverlay } from './CardEditOverlay';

interface Props {
  items: MenuItem[];
  getQty: (id: string) => number;
  onAddItem: (item: MenuItem) => void;
  editMode: boolean;
  onDeleteItem: (id: string) => void;
  onResizeItem: (id: string, delta: 1 | -1) => void;
  onOpenAddForm: (category: string) => void;
  topOffset?: number;
}

export function AllCategoriesView({
  items, getQty, onAddItem, editMode, onDeleteItem, onResizeItem, onOpenAddForm, topOffset = 0,
}: Props) {
  return (
    <div>
      {CATEGORY_ORDER.map(category => {
        const categoryItems = items.filter(i => i.category === category);
        const isBeer = category === 'piva';
        const bgColor = CATEGORY_BG[category];

        return (
          <div key={category} id={`section-${category}`}>
            <div
              className="sticky z-10 px-4 py-2 border-b border-[#E8E8E8]"
              style={{ top: topOffset, backgroundColor: bgColor }}
            >
              <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#6B6B6B]">
                {CATEGORY_LABEL[category]}
              </span>
            </div>

            <div className="p-3">
              <div className={`grid gap-3 ${isBeer ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
                {categoryItems.map(item =>
                  isBeer || item.isBeer ? (
                    <div key={item.id} className="relative">
                      <BeerCard item={item} qty={getQty(item.id)} onTap={() => !editMode && onAddItem(item)} dimmed={editMode} bgColor={bgColor} />
                      {editMode && (
                        <CardEditOverlay
                          itemId={item.id}
                          cardSize={item.cardSize ?? 'md'}
                          onDelete={onDeleteItem}
                          onResize={onResizeItem}
                        />
                      )}
                    </div>
                  ) : (
                    <div key={item.id} className="relative">
                      <ItemCard item={item} qty={getQty(item.id)} onTap={() => !editMode && onAddItem(item)} dimmed={editMode} bgColor={bgColor} />
                      {editMode && (
                        <CardEditOverlay
                          itemId={item.id}
                          cardSize={item.cardSize ?? 'md'}
                          onDelete={onDeleteItem}
                          onResize={onResizeItem}
                        />
                      )}
                    </div>
                  )
                )}

                {editMode && (
                  <button
                    onClick={() => onOpenAddForm(category)}
                    className={`border-2 border-dashed border-[#E8E8E8] rounded-xl text-[#9B9B9B] text-[13px] font-medium flex flex-col items-center justify-center gap-1 active:bg-[#F8F8F8] ${
                      isBeer ? 'min-h-[130px]' : 'min-h-[72px]'
                    }`}
                  >
                    <span className="text-[24px] font-light leading-none">+</span>
                    <span>Přidat</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
