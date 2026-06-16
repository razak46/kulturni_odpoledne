import { useState } from 'react';
import type { MenuItem, Category } from '../types';

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'piva',    label: 'Piva' },
  { id: 'napoje',  label: 'Nápoje' },
  { id: 'alkohol', label: 'Alkohol' },
  { id: 'jidlo',   label: 'Jídlo' },
];

interface Props {
  activeCategory: Category;
  allItems: MenuItem[];
  onSave: (item: MenuItem, afterId: string) => void;
  onClose: () => void;
}

function genId() {
  return 'custom-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
}

export function AddItemModal({ activeCategory, allItems, onSave, onClose }: Props) {
  const [name, setName] = useState('');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Category>(activeCategory);
  const [afterId, setAfterId] = useState('__end__');

  const filteredItems = allItems.filter(i => i.category === category);

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    setAfterId('__end__');
  };

  const handleSave = () => {
    const priceNum = parseInt(price, 10);
    if (!name.trim() || isNaN(priceNum) || priceNum <= 0) return;

    const item: MenuItem = {
      id: genId(),
      name: name.trim(),
      size: size.trim() || undefined,
      price: priceNum,
      category,
      isBeer: category === 'piva',
    };
    onSave(item, afterId);
    onClose();
  };

  const isValid = name.trim().length > 0 && parseInt(price, 10) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl overflow-hidden shadow-xl">
        {/* Drag handle (mobile) */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#E8E8E8] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E8E8]">
          <span className="text-[15px] font-semibold text-[#1A1A1A]">Nová položka</span>
          <button onClick={onClose} className="text-[#9B9B9B] text-sm">Zrušit</button>
        </div>

        {/* Form */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Name */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.08em] text-[#9B9B9B] mb-1">
              Název *
            </label>
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
            <label className="block text-[11px] uppercase tracking-[0.08em] text-[#9B9B9B] mb-1">
              Cena (Kč) *
            </label>
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
            <label className="block text-[11px] uppercase tracking-[0.08em] text-[#9B9B9B] mb-1">
              Kategorie
            </label>
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

          {/* Position */}
          <div>
            <label className="block text-[11px] uppercase tracking-[0.08em] text-[#9B9B9B] mb-1">
              Umístění v nabídce
            </label>
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
        </div>

        {/* Save button */}
        <div className="px-5 pb-6 pt-2">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`w-full h-12 rounded-[10px] text-[15px] font-semibold transition-colors ${
              isValid
                ? 'bg-[#1A1A1A] text-white'
                : 'bg-[#E8E8E8] text-[#9B9B9B] cursor-not-allowed'
            }`}
          >
            Přidat položku
          </button>
        </div>
      </div>
    </div>
  );
}
