import { useState, useMemo } from 'react';
import type { MenuItem, OrderLineItem, OrderRecord } from '../types';

interface Props {
  order: OrderRecord;
  menuItems: MenuItem[];
  onSave: (id: string, total: number, items: OrderLineItem[], manualNote?: string) => void;
  onClose: () => void;
}

export function EditOrderModal({ order, menuItems, onSave, onClose }: Props) {
  const [items, setItems] = useState<OrderLineItem[]>(order.items.map(i => ({ ...i })));
  const [manualTotal, setManualTotal] = useState(String(order.total));
  const [note, setNote] = useState(order.manualNote ?? '');
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');

  const autoTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = order.isManual ? Number(manualTotal) : autoTotal;
  const valid = order.isManual ? total > 0 : items.length > 0;

  const filteredMenu = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return menuItems;
    return menuItems.filter(m =>
      m.name.toLowerCase().includes(q) ||
      (m.size?.toLowerCase().includes(q) ?? false)
    );
  }, [menuItems, search]);

  const adjustQty = (idx: number, delta: number) => {
    setItems(prev => {
      const next = [...prev];
      const newQty = next[idx].qty + delta;
      if (newQty <= 0) return next.filter((_, i) => i !== idx);
      next[idx] = { ...next[idx], qty: newQty };
      return next;
    });
  };

  const addFromMenu = (m: MenuItem) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.name === m.name && (i.size ?? '') === (m.size ?? ''));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { name: m.name, size: m.size, price: m.price, qty: 1 }];
    });
  };

  const handleSave = () => {
    if (!valid) return;
    onSave(order.id, total, items, note.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="px-5 pt-5 pb-3 shrink-0">
          <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Upravit objednávku</h2>
          <p className="text-[12px] text-[#9B9B9B] font-mono mt-0.5">{order.id}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-2 space-y-4">

          {/* Items editor (non-manual orders) */}
          {!order.isManual && (
            <div>
              <label className="text-[11px] uppercase tracking-wide text-[#9B9B9B] block mb-2">Položky</label>

              {/* Existing items */}
              {items.length === 0 ? (
                <p className="text-[13px] text-[#9B9B9B] italic pb-2">Žádné položky</p>
              ) : (
                <div className="divide-y divide-[#F0F0F0]">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 py-2.5">
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-[#1A1A1A] leading-tight truncate">
                          {item.name}{item.size ? ` — ${item.size}` : ''}
                        </div>
                        <div className="text-[11px] text-[#9B9B9B]">{item.price} Kč/ks</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button type="button" onClick={() => adjustQty(idx, -1)}
                          className="w-8 h-8 border border-[#E8E8E8] rounded-lg text-[18px] text-[#1A1A1A] flex items-center justify-center leading-none">
                          −
                        </button>
                        <span className="text-[15px] font-bold min-w-[24px] text-center">{item.qty}</span>
                        <button type="button" onClick={() => adjustQty(idx, +1)}
                          className="w-8 h-8 border border-[#E8E8E8] rounded-lg text-[18px] text-[#1A1A1A] flex items-center justify-center leading-none">
                          +
                        </button>
                      </div>
                      <span className="text-[13px] font-semibold text-[#1A1A1A] min-w-[48px] text-right shrink-0">
                        {item.price * item.qty} Kč
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add item picker */}
              <div className="mt-2">
                {showPicker ? (
                  <div className="border border-[#E8E8E8] rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-[#F0F0F0] bg-[#FAFAFA]">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="shrink-0 text-[#9B9B9B]">
                        <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
                        <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      </svg>
                      <input
                        type="text"
                        autoFocus
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Hledat položku…"
                        className="flex-1 text-[13px] bg-transparent focus:outline-none text-[#1A1A1A] placeholder-[#C0C0C0]"
                        onKeyDown={e => e.key === 'Escape' && setShowPicker(false)}
                      />
                      <button type="button" onClick={() => { setShowPicker(false); setSearch(''); }}
                        className="text-[#9B9B9B] text-[16px] leading-none px-1">
                        ×
                      </button>
                    </div>
                    <div className="max-h-44 overflow-y-auto">
                      {filteredMenu.length === 0 ? (
                        <p className="text-[12px] text-[#9B9B9B] text-center py-3">Nic nenalezeno</p>
                      ) : filteredMenu.map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => addFromMenu(m)}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#F8F8F8] border-b border-[#F8F8F8] last:border-0 text-left"
                        >
                          <span className="text-[13px] text-[#1A1A1A] truncate flex-1">
                            {m.name}{m.size ? ` — ${m.size}` : ''}
                          </span>
                          <span className="text-[12px] text-[#9B9B9B] shrink-0 ml-2">{m.price} Kč</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPicker(true)}
                    className="w-full border border-dashed border-[#E8E8E8] rounded-xl py-2 text-[13px] text-[#9B9B9B] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
                  >
                    + Přidat položku
                  </button>
                )}
              </div>

              {/* Auto total */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E8E8E8]">
                <span className="text-[12px] uppercase tracking-wide text-[#9B9B9B]">Celkem</span>
                <span className="text-[22px] font-extrabold text-[#1A1A1A]">{autoTotal} Kč</span>
              </div>
            </div>
          )}

          {/* Manual order: amount input */}
          {order.isManual && (
            <div>
              <label className="text-[11px] uppercase tracking-wide text-[#9B9B9B] block mb-1">Částka (Kč)</label>
              <input
                type="number" min="1" autoFocus value={manualTotal}
                onChange={e => setManualTotal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                className="w-full border border-[#E8E8E8] rounded-xl px-4 py-2.5 text-[24px] font-bold text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>
          )}

          {/* Note */}
          <div>
            <label className="text-[11px] uppercase tracking-wide text-[#9B9B9B] block mb-1">Poznámka (volitelné)</label>
            <input
              type="text" value={note} onChange={e => setNote(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="Volitelná poznámka…"
              className="w-full border border-[#E8E8E8] rounded-xl px-4 py-2.5 text-[14px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 shrink-0 flex gap-2 border-t border-[#F0F0F0]">
          <button type="button" onClick={handleSave} disabled={!valid}
            className="flex-1 bg-[#1A1A1A] text-white rounded-xl py-3 text-[14px] font-semibold disabled:opacity-40 active:scale-95 transition-transform">
            Uložit změny
          </button>
          <button type="button" onClick={onClose}
            className="flex-1 border border-[#E8E8E8] text-[#6B6B6B] rounded-xl py-3 text-[14px]">
            Zrušit
          </button>
        </div>
      </div>
    </div>
  );
}
