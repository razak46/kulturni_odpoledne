import { useState } from 'react';
import type { CategoryDef, MenuItem } from '../types';
import { PRESET_CATEGORY_COLORS } from '../data/colors';

function genId() {
  return 'cat-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
}

interface Props {
  categories: CategoryDef[];
  menuItems: MenuItem[];
  onAdd: (cat: CategoryDef) => void;
  onUpdate: (cat: CategoryDef) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

type View = 'list' | 'form';

const EMPTY_FORM: CategoryDef = { id: '', label: '', bgColor: PRESET_CATEGORY_COLORS[0] };

export function CategoryManagerModal({ categories, menuItems, onAdd, onUpdate, onDelete, onClose }: Props) {
  const [view, setView] = useState<View>('list');
  const [editing, setEditing] = useState<CategoryDef>(EMPTY_FORM);
  const isNew = !categories.some(c => c.id === editing.id);

  const itemCount = (catId: string) =>
    menuItems.filter(i => i.category === catId && !i.isSpacer).length;

  const openAdd = () => {
    const usedColors = new Set(categories.map(c => c.bgColor));
    const defaultColor = PRESET_CATEGORY_COLORS.find(c => !usedColors.has(c)) ?? PRESET_CATEGORY_COLORS[0];
    setEditing({ id: genId(), label: '', bgColor: defaultColor });
    setView('form');
  };

  const openEdit = (cat: CategoryDef) => {
    setEditing({ ...cat });
    setView('form');
  };

  const handleSave = () => {
    if (!editing.label.trim()) return;
    if (isNew) onAdd({ ...editing, label: editing.label.trim() });
    else onUpdate({ ...editing, label: editing.label.trim() });
    setView('list');
  };

  const handleBack = () => {
    setView('list');
    setEditing(EMPTY_FORM);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl overflow-hidden shadow-xl">
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#E8E8E8] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E8E8]">
          {view === 'form' ? (
            <button onClick={handleBack} className="text-[#1A1A1A] flex items-center gap-1.5 text-[14px] font-medium">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Zpět
            </button>
          ) : (
            <span className="text-[15px] font-semibold text-[#1A1A1A]">Kategorie</span>
          )}
          <button onClick={onClose} className="text-[#9B9B9B] text-sm">Zavřít</button>
        </div>

        {view === 'list' ? (
          /* ── List view ── */
          <div className="max-h-[60vh] overflow-y-auto">
            {categories.length === 0 ? (
              <p className="px-5 py-8 text-center text-[14px] text-[#9B9B9B]">Žádné kategorie</p>
            ) : (
              <ul className="divide-y divide-[#F0F0F0]">
                {categories.map(cat => {
                  const count = itemCount(cat.id);
                  const canDelete = count === 0;
                  return (
                    <li key={cat.id} className="flex items-center gap-3 px-5 py-3.5">
                      {/* Color swatch */}
                      <span
                        className="w-5 h-5 rounded-full shrink-0 border border-black/10"
                        style={{ backgroundColor: cat.bgColor }}
                      />
                      {/* Label */}
                      <span className="flex-1 text-[14px] font-medium text-[#1A1A1A]">{cat.label}</span>
                      {/* Item count badge when non-empty */}
                      {count > 0 && (
                        <span className="text-[11px] text-[#9B9B9B] shrink-0">{count} pol.</span>
                      )}
                      {/* Edit */}
                      <button
                        onClick={() => openEdit(cat)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#666] hover:bg-[#F0F0F0] transition-colors shrink-0"
                        title="Upravit"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => canDelete && onDelete(cat.id)}
                        disabled={!canDelete}
                        title={canDelete ? 'Smazat kategorii' : `Nejprve odstraňte všechny položky (${count})`}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors shrink-0 ${
                          canDelete
                            ? 'text-[#C8102E] hover:bg-[#FFF1F2]'
                            : 'text-[#D0D0D0] cursor-not-allowed'
                        }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2 3.5h10M5 3.5V2.5h4v1M5.5 6v4M8.5 6v4M3 3.5l.7 8h6.6l.7-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="px-5 py-4 border-t border-[#F0F0F0]">
              <button
                onClick={openAdd}
                className="w-full h-11 rounded-[10px] border-2 border-dashed border-[#E8E8E8] text-[#9B9B9B] text-[14px] font-medium hover:border-[#C8C8C8] hover:text-[#666] transition-colors"
              >
                + Přidat kategorii
              </button>
            </div>
          </div>
        ) : (
          /* ── Form view ── */
          <div className="px-5 py-4 space-y-5 max-h-[60vh] overflow-y-auto">
            <div>
              <span className="text-[13px] font-semibold text-[#1A1A1A]">
                {isNew ? 'Nová kategorie' : `Upravit: ${categories.find(c => c.id === editing.id)?.label}`}
              </span>
            </div>

            {/* Name */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.08em] text-[#9B9B9B] mb-1.5">Název *</label>
              <input
                type="text"
                value={editing.label}
                onChange={e => setEditing(v => ({ ...v, label: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="např. Dezerty"
                autoFocus
                className="w-full border border-[#E8E8E8] rounded-[10px] px-3 py-2.5 text-[15px] text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
              />
            </div>

            {/* Color picker */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.08em] text-[#9B9B9B] mb-2">Barva pozadí</label>
              <div className="flex flex-wrap gap-2.5">
                {PRESET_CATEGORY_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setEditing(v => ({ ...v, bgColor: color }))}
                    style={{ backgroundColor: color }}
                    className={`w-8 h-8 rounded-full border transition-all ${
                      editing.bgColor === color
                        ? 'border-[#1A1A1A] scale-110 shadow-sm'
                        : 'border-black/10 hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.08em] text-[#9B9B9B] mb-1.5">Náhled</label>
              <div
                className="rounded-xl px-4 py-3 text-[14px] font-semibold text-[#1A1A1A] border border-black/5"
                style={{ backgroundColor: editing.bgColor }}
              >
                {editing.label || <span className="text-[#9B9B9B] font-normal">Název kategorie</span>}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!editing.label.trim()}
              className={`w-full h-12 rounded-[10px] text-[15px] font-semibold transition-colors ${
                editing.label.trim()
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-[#E8E8E8] text-[#9B9B9B] cursor-not-allowed'
              }`}
            >
              {isNew ? 'Přidat kategorii' : 'Uložit změny'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
