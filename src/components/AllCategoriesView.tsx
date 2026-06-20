import { useRef, useState, useEffect } from 'react';
import type { MenuItem, CategoryDef } from '../types';
import { BeerCard } from './BeerCard';
import { ItemCard } from './ItemCard';
import { CardEditOverlay } from './CardEditOverlay';

interface Props {
  categories: CategoryDef[];
  items: MenuItem[];
  getQty: (id: string) => number;
  onAddItem: (item: MenuItem) => void;
  editMode: boolean;
  onDeleteItem: (id: string) => void;
  onResizeItem: (id: string, delta: 1 | -1) => void;
  onEditItem: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onOpenAddForm: (category: string) => void;
  onAddSpacer: (category: string) => void;
  onVisibleSection?: (cat: string) => void;
}

export function AllCategoriesView({ categories, items, getQty, onAddItem, editMode, onDeleteItem, onResizeItem, onEditItem, onReorder, onOpenAddForm, onAddSpacer, onVisibleSection }: Props) {
  const activeDragId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    if (!onVisibleSection) return;
    const ratios = new Map<string, number>();
    const obs = new IntersectionObserver(
      (changes) => {
        changes.forEach(e => {
          const cat = (e.target as HTMLElement).dataset.cat as string;
          ratios.set(cat, e.isIntersecting ? e.intersectionRatio : 0);
        });
        for (const { id } of categories) {
          if ((ratios.get(id) ?? 0) > 0) { onVisibleSection(id); return; }
        }
      },
      { rootMargin: '0px 0px -50% 0px', threshold: 0 },
    );
    categories.forEach(({ id }) => {
      const el = document.getElementById(`section-${id}`);
      if (el) { el.dataset.cat = id; obs.observe(el); }
    });
    return () => obs.disconnect();
  }, [onVisibleSection, categories]);

  const makeReorder = (categoryItems: MenuItem[]) => (targetId: string) => {
    if (!activeDragId.current || activeDragId.current === targetId) { setDragOverId(null); return; }
    const ids = categoryItems.map(i => i.id);
    const from = ids.indexOf(activeDragId.current);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) { setDragOverId(null); return; }
    ids.splice(from, 1);
    ids.splice(to, 0, activeDragId.current);
    const catSet = new Set(categoryItems.map(i => i.id));
    let ci = 0;
    const newOrder = items.map(i => i.id).map(id => catSet.has(id) ? ids[ci++] : id);
    onReorder(newOrder);
    activeDragId.current = null;
    setDragOverId(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!activeDragId.current) return;
    const touch = e.touches[0];
    const els = document.elementsFromPoint(touch.clientX, touch.clientY);
    for (const el of els) {
      const id = (el as HTMLElement).dataset?.dragId;
      if (id && id !== activeDragId.current) { setDragOverId(id); return; }
    }
  };

  const dragProps = (id: string, doReorder: (t: string) => void) => !editMode ? {} : {
    draggable: true as const,
    onDragStart: () => { activeDragId.current = id; },
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragOverId(id); },
    onDrop: () => doReorder(id),
    onDragEnd: () => { activeDragId.current = null; setDragOverId(null); },
    onTouchStart: () => { activeDragId.current = id; },
    onTouchMove: handleTouchMove,
    onTouchEnd: () => {
      if (activeDragId.current && dragOverId) doReorder(dragOverId);
      else { activeDragId.current = null; setDragOverId(null); }
    },
  };

  return (
    <div>
      {categories.map((category, sectionIdx) => {
        const categoryItems = items.filter(i => i.category === category.id);
        const hasBeer = categoryItems.some(i => i.isBeer);
        const bgColor = category.bgColor;
        const minH = hasBeer ? 'min-h-[130px]' : 'min-h-[72px]';
        const doReorder = makeReorder(categoryItems);

        return (
          <div
            key={category.id}
            id={`section-${category.id}`}
            className={`flex ${sectionIdx > 0 ? 'border-t-4 border-[#F0F0F0]' : ''}`}
          >
            {/* Vertical category label */}
            <div
              className="shrink-0 flex items-center justify-center py-4"
              style={{ width: 32, backgroundColor: bgColor }}
            >
              <span
                className="text-[10px] uppercase font-bold tracking-[0.15em] text-[#9B9B9B] select-none"
                style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
              >
                {category.label}
              </span>
            </div>

            {/* Items grid */}
            <div className="flex-1 min-w-0 p-3">
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
                {categoryItems.map(item => {
                  const isOver = dragOverId === item.id;

                  if (item.isSpacer) {
                    return (
                      <div
                        key={item.id}
                        data-drag-id={item.id}
                        {...dragProps(item.id, doReorder)}
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
                      {...dragProps(item.id, doReorder)}
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
                      onClick={() => onOpenAddForm(category.id)}
                      className={`border-2 border-dashed border-[#E8E8E8] rounded-xl text-[#9B9B9B] text-[13px] font-medium flex flex-col items-center justify-center gap-1 active:bg-[#F8F8F8] ${minH}`}
                    >
                      <span className="text-[24px] font-light leading-none">+</span>
                      <span>Přidat</span>
                    </button>
                    <button
                      onClick={() => onAddSpacer(category.id)}
                      className={`border-2 border-dashed border-[#E0E0E0] rounded-xl text-[#B0B0B0] text-[13px] font-medium flex flex-col items-center justify-center gap-1 active:bg-[#F8F8F8] ${minH}`}
                    >
                      <span className="text-[20px] leading-none opacity-60">⬚</span>
                      <span>Mezera</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
