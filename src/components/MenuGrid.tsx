import { useRef, useState } from 'react';
import type { Category, MenuItem } from '../types';
import { CATEGORY_BG } from '../data/colors';
import { BeerCard } from './BeerCard';
import { ItemCard } from './ItemCard';
import { CardEditOverlay } from './CardEditOverlay';

interface Props {
  activeTab: Category;
  items: MenuItem[];
  getQty: (id: string) => number;
  onAddItem: (item: MenuItem) => void;
  editMode: boolean;
  onDeleteItem: (id: string) => void;
  onResizeItem: (id: string, delta: 1 | -1) => void;
  onEditItem: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onOpenAddForm: () => void;
}

export function MenuGrid({ activeTab, items, getQty, onAddItem, editMode, onDeleteItem, onResizeItem, onEditItem, onReorder, onOpenAddForm }: Props) {
  const categoryItems = items.filter(item => item.category === activeTab);
  const isBeerTab = activeTab === 'piva';
  const bgColor = CATEGORY_BG[activeTab];

  const dragId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (id: string) => { dragId.current = id; };
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };
  const handleDrop = (targetId: string) => {
    if (!dragId.current || dragId.current === targetId) { setDragOverId(null); return; }
    const ids = categoryItems.map(i => i.id);
    const from = ids.indexOf(dragId.current);
    const to = ids.indexOf(targetId);
    ids.splice(from, 1);
    ids.splice(to, 0, dragId.current);
    // Rebuild full items order: replace category items in their new order
    const allIds = items.map(i => i.id);
    const catSet = new Set(categoryItems.map(i => i.id));
    let ci = 0;
    const newOrder = allIds.map(id => catSet.has(id) ? ids[ci++] : id);
    onReorder(newOrder);
    dragId.current = null;
    setDragOverId(null);
  };
  const handleDragEnd = () => { dragId.current = null; setDragOverId(null); };

  return (
    <div className="p-3">
      <div className={`grid gap-3 ${isBeerTab ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
        {categoryItems.map(item => (
          <div
            key={item.id}
            className="relative"
            draggable={editMode}
            onDragStart={() => handleDragStart(item.id)}
            onDragOver={e => editMode && handleDragOver(e, item.id)}
            onDrop={() => editMode && handleDrop(item.id)}
            onDragEnd={handleDragEnd}
            style={dragOverId === item.id ? { outline: '2px dashed #1A1A1A', borderRadius: 12, opacity: 0.8 } : undefined}
          >
            {isBeerTab || item.isBeer
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
            onClick={onOpenAddForm}
            className={`border-2 border-dashed border-[#E8E8E8] rounded-xl text-[#9B9B9B] text-[13px] font-medium flex flex-col items-center justify-center gap-1 active:bg-[#F8F8F8] ${
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
