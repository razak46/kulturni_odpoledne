import { useRef, useState } from 'react';
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
  onEditItem: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onOpenAddForm: (category: string) => void;
  topOffset?: number;
}

export function AllCategoriesView({ items, getQty, onAddItem, editMode, onDeleteItem, onResizeItem, onEditItem, onReorder, onOpenAddForm }: Props) {
  const dragId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (id: string) => { dragId.current = id; };
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverId(id); };
  const handleDrop = (targetId: string, categoryItems: MenuItem[]) => {
    if (!dragId.current || dragId.current === targetId) { setDragOverId(null); return; }
    const ids = categoryItems.map(i => i.id);
    const from = ids.indexOf(dragId.current);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) { setDragOverId(null); return; }
    ids.splice(from, 1);
    ids.splice(to, 0, dragId.current);
    const catSet = new Set(categoryItems.map(i => i.id));
    let ci = 0;
    const newOrder = items.map(i => i.id).map(id => catSet.has(id) ? ids[ci++] : id);
    onReorder(newOrder);
    dragId.current = null;
    setDragOverId(null);
  };
  const handleDragEnd = () => { dragId.current = null; setDragOverId(null); };

  return (
    <div>
      {CATEGORY_ORDER.map((category, sectionIdx) => {
        const categoryItems = items.filter(i => i.category === category);
        const isBeer = category === 'piva';
        const bgColor = CATEGORY_BG[category];

        return (
          <div
            key={category}
            id={`section-${category}`}
            className={`flex ${sectionIdx > 0 ? 'border-t-4 border-[#F0F0F0]' : ''}`}
          >
            {/* Vertical category label — left sidebar */}
            <div
              className="shrink-0 flex items-center justify-center py-4"
              style={{ width: 32, backgroundColor: bgColor }}
            >
              <span
                className="text-[10px] uppercase font-bold tracking-[0.15em] text-[#9B9B9B] select-none"
                style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
              >
                {CATEGORY_LABEL[category]}
              </span>
            </div>

            {/* Items grid */}
            <div className="flex-1 min-w-0 p-3">
              <div className={`grid gap-3 ${'grid-cols-2 md:grid-cols-3'}`}>
                {categoryItems.map(item => (
                  <div
                    key={item.id}
                    className="relative"
                    draggable={editMode}
                    onDragStart={() => handleDragStart(item.id)}
                    onDragOver={e => editMode && handleDragOver(e, item.id)}
                    onDrop={() => editMode && handleDrop(item.id, categoryItems)}
                    onDragEnd={handleDragEnd}
                    style={dragOverId === item.id ? { outline: '2px dashed #1A1A1A', borderRadius: 12, opacity: 0.8 } : undefined}
                  >
                    {isBeer || item.isBeer
                      ? <BeerCard item={item} qty={getQty(item.id)} onTap={() => !editMode && onAddItem(item)} dimmed={editMode} bgColor={bgColor} />
                      : <ItemCard item={item} qty={getQty(item.id)} onTap={() => !editMode && onAddItem(item)} dimmed={editMode} bgColor={bgColor} />
                    }
                    {editMode && (
                      <CardEditOverlay
                        itemId={item.id}
                        cardSize={item.cardSize ?? 'md'}
                        onDelete={onDeleteItem}
                        onResize={onResizeItem}
                        onEdit={onEditItem}
                      />
                    )}
                  </div>
                ))}

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
