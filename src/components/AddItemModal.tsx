import { useState } from 'react';
import type { MenuItem, Category } from '../types';

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'piva',    label: 'Piva' },
  { id: 'napoje',  label: 'Nápoje' },
  { id: 'alkohol', label: 'Alkohol' },
  { id: 'jidlo',   label: 'Jídlo' },
];

interface AddProps {
  mode: 'add';
  activeCategory: Category;
  allItems: MenuItem[];
  onSave: (item: MenuItem, afterId: string) => void;
  onClose: () => void;
}

interface EditProps {
  mode: 'edit';
  editItem: MenuItem;
  allItems: MenuItem[];
  onUpdate: (item: MenuItem) => void;
  onClose: () => void;
}

type Props = AddProps | EditProps;

function genId() {
  return 'custom-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
}

export function AddItemModal(props: Props) {
  const isEdit = props.mode === 'edit';
  const initial = isEdit ? props.editItem : null;

  const [name, setName]       = useState(initial?.name ?? '');
  const [size, setSize]       = useState(initial?.size ?? '');
  const [price, setPrice]     = useState(initial ? String(initial.price) : '');
  const [category, setCategory] = useState<Category>(
    isEdit ? props.editItem.category : (props as AddProps).activeCategory
  );
  const [afterId, setAfterId] = useState('__end__');

  const filteredItems = props.allItems.filter(i => i.category === category && (!isEdit || i.id !== initial?.id));

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    setAfterId('__end__');
  };

  const handleSave = () => {
    const priceNum = parseInt(price, 10);
    if (!name.trim() || isNaN(priceNum) || priceNum <= 0) return;

    if (isEdit) {
      const updated: MenuItem = {
        ...props.editItem,
        name: name.trim(),
        size: size.trim() || undefined,
        price: priceNum,
        category,
        isBeer: category === 'piva',
      };
      props.onUpdate(updated);
    } else {
      const item: MenuItem = {
        id: genId(),
        name: name.trim(),
        size: size.trim() || undefined,
        price: priceNum,
        category,
        isBeer: category === 'piva',
      };
      (props as AddProps).onSave(item, afterId);
    }
    props.onClose();
  };

  const isValid = name.trim().length > 0 && parseInt(price, 10) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={props.onClose} />

      <div className="relative w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl overflow-hidden shadow-xl">
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#E8E8E8] rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E8E8]">
          <span className="text-[15px] font-semibold text-[#1A1A1A]">
            {isEdit ? 'Upravit položku' : 'Nová položka'}
          </span>
          <button onClick={props.onClose} className="text-[#9B9B9B] text-sm">Zrušit</button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Name */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.08em] text-[#9B9B9B] mb-1">Název *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="např. Kofola"
              className="w-full border border-[#E8E8E8] rounded-[10px] px-3 py-2.5 text-[15px] text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
            />
          </div>

          {/* Size */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.08em] text-[#9B9B9B] mb-1">
              Velikost <span className="normal-case">(nepovinné)</span>
            </label>
            <input
              type="text"
              value={size}
              onChange={e => setSize(e.target.value)}
              placeholder="např. 0,5l nebo 150g"
              className="w-full border border-[#E8E8E8] rounded-[10px] px-3 py-2.5 text-[15px] text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.08em] text-[#9B9B9B] mb-1">Cena (Kč) *</label>
            <input
              type="number"
              inputMode="numeric"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="např. 45"
              min={1}
              className="w-full border border-[#E8E8E8] rounded-[10px] px-3 py-2.5 text-[15px] text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.08em] text-[#9B9B9B] mb-1">Kategorie</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`py-2 rounded-[10px] text-[13px] font-medium border transition-colors ${
                    category === cat.id
                      ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                      : 'border-[#E8E8E8] text-[#6B6B6B] bg-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Position — only for new items */}
          {!isEdit && (
            <div>
              <label className="block text-[11px] uppercase tracking-[0.08em] text-[#9B9B9B] mb-1">Umístění v nabídce</label>
              <select
                value={afterId}
                onChange={e => setAfterId(e.target.value)}
                className="w-full border border-[#E8E8E8] rounded-[10px] px-3 py-2.5 text-[15px] text-[#1A1A1A] outline-none focus:border-[#1A1A1A] bg-white appearance-none"
              >
                <option value="__start__">Na začátek</option>
                {filteredItems.map(item => (
                  <option key={item.id} value={item.id}>
                    Za: {item.name}{item.size ? ` (${item.size})` : ''}
                  </option>
                ))}
                <option value="__end__">Na konec</option>
              </select>
            </div>
          )}
        </div>

        <div className="px-5 pb-6 pt-2">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`w-full h-12 rounded-[10px] text-[15px] font-semibold transition-colors ${
              isValid ? 'bg-[#1A1A1A] text-white' : 'bg-[#E8E8E8] text-[#9B9B9B] cursor-not-allowed'
            }`}
          >
            {isEdit ? 'Uložit změny' : 'Přidat položku'}
          </button>
        </div>
      </div>
    </div>
  );
}
