import { useRef, useState } from 'react';
import type { MenuItem } from '../types';
import { BeerCard } from './BeerCard';
import { ItemCard } from './ItemCard';
import { CardEditOverlay } from './CardEditOverlay';

interface Props {
  activeTab: string;
  bgColor: string;
  items: MenuItem[];
  getQty: (id: string) => number;
  onAddItem: (item: MenuItem) => void;
  editMode: boolean;
  onDeleteItem: (id: string) => void;
  onResizeItem: (id: string, delta: 1 | -1) => void;
  onEditItem: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onOpenAddForm: () => void;
  onAddSpacer: () => void;
}

export function MenuGrid({ activeTab, bgColor, items, getQty, onAddItem, editMode, onDeleteItem, onResizeItem, onEditItem, onReorder, onOpenAddForm, onAddSpacer }: Props) {
  const categoryItems = items.filter(item => item.category === activeTab);
  const hasBeer = categoryItems.some(i => i.isBeer);
  const minH = hasBeer ? 'min-h-[130px]' : 'min-h-[72px]';

  const activeDragId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const doReorder = (targetId: string) => {
    if (!activeDragId.current || activeDragId.current === targetId) { setDragOverId(null); return; }
    const ids = categoryItems.map(i => i.id);
    const from = ids.indexOf(activeDragId.current);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) { setDragOverId(null); return; }
    ids.splice(from, 1);
    ids.splice(to, 0, activeDragId.current);
    const allIds = items.map(i => i.id);
    const catSet = new Set(categoryItems.map(i => i.id));
    let ci = 0;
    const newOrder = allIds.map(id => catSet.has(id) ? ids[ci++] : id);
    onReorder(newOrder);
    activeDragId.current = null;
    setDragOverId(null);
  };

  const handleDragStart = (id: string) => { activeDragId.current = id; };
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverId(id); };
  const handleDrop = (targetId: string) => doReorder(targetId);
  const handleDragEnd = () => { activeDragId.current = null; setDragOverId(null); };

  const handleTouchStart = (id: string) => { activeDragId.current = id; };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!activeDragId.current) return;
    const touch = e.touches[0];
    const els = document.elementsFromPoint(touch.clientX, touch.clientY);
    for (const el of els) {
      const id = (el as HTMLElement).dataset?.dragId;
      if (id && id !== activeDragId.current) { setDragOverId(id); return; }
    }
  };
  const handleTouchEnd = () => {
    if (activeDragId.current && dragOverId) doReorder(dragOverId);
    else { activeDragId.current = null; setDragOverId(null); }
  };

  const dragProps = (id: string) => !editMode ? {} : {
    draggable: true as const,
    onDragStart: () => handleDragStart(id),
    onDragOver: (e: React.DragEvent) => handleDragOver(e, id),
    onDrop: () => handleDrop(id),
    onDragEnd: handleDragEnd,
    onTouchStart: () => handleTouchStart(id),
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  return (
    <div className="p-3">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
        {categoryItems.map(item => {
          const isOver = dragOverId === item.id;

          if (item.isSpacer) {
            return (
              <div
                key={item.id}
                data-drag-id={item.id}
                {...dragProps(item.id)}
                style={editMode ? { touchAction: 'none' } : undefined}
                className={`${minH} rounded-xl relative ${
                  editMode
                    ? `border-2 border-dashed flex items-center justify-center cursor-grab ${isOver ? 'border-[#888] bg-[#F0F0F0]' : 'border-[#E0E0E0]'}`
                    : ''
                }`}
              >
                {editMode && (
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="w-7 h-7 rounded-full bg-[#E8E8E8] text-[#9B9B9B] text-[15px] flex items-center justify-center font-bold hover:bg-[#C8102E] hover:text-white transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          }

          return (
            <div
              key={item.id}
              data-drag-id={item.id}
              className="relative"
              {...dragProps(item.id)}
              style={editMode ? { touchAction: 'none', ...(isOver ? { outline: '2px dashed #1A1A1A', borderRadius: 12, opacity: 0.8 } : {}) } : undefined}
            >
              {hasBeer || item.isBeer
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
          );
        })}

        {editMode && (
          <>
            <button
              onClick={onOpenAddForm}
              className={`border-2 border-dashed border-[#E8E8E8] rounded-xl text-[#9B9B9B] text-[13px] font-medium flex flex-col items-center justify-center gap-1 active:bg-[#F8F8F8] ${minH}`}
            >
              <span className="text-[24px] font-light leading-none">+</span>
              <span>Přidat</span>
            </button>
            <button
              onClick={onAddSpacer}
              className={`border-2 border-dashed border-[#E0E0E0] rounded-xl text-[#B0B0B0] text-[13px] font-medium flex flex-col items-center justify-center gap-1 active:bg-[#F8F8F8] ${minH}`}
            >
              <span className="text-[20px] leading-none opacity-60">⬚</span>
              <span>Mezera</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
