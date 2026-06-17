import { useState, useMemo } from 'react';
import type { OrderLineItem, OrderRecord } from '../types';
import { EditOrderModal } from './EditOrderModal';

interface Props {
  records: OrderRecord[];
  onClose: () => void;
  onAddManual: () => void;
  onRefresh: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, total: number, items: OrderLineItem[], manualNote?: string) => void;
  refreshing: boolean;
  lastRefreshed: Date | null;
}

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleString('cs-CZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function OrderHistoryView({ records, onClose, onAddManual, onRefresh, onDelete, onUpdate, refreshing, lastRefreshed }: Props) {
  const [sortAsc, setSortAsc] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [itemSearch, setItemSearch] = useState('');

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderRecord | null>(null);

  const filtered = useMemo(() => {
    const fromTs = dateFrom ? new Date(dateFrom).getTime() : null;
    const toTs   = dateTo   ? new Date(dateTo).getTime()   : null;
    const q = itemSearch.trim().toLowerCase();

    return records
      .filter(r => {
        if (fromTs && r.timestamp < fromTs) return false;
        if (toTs   && r.timestamp > toTs)   return false;
        if (q) {
          if (r.isManual) return r.manualNote?.toLowerCase().includes(q) ?? false;
          return r.items.some(i =>
            i.name.toLowerCase().includes(q) ||
            (i.size?.toLowerCase().includes(q) ?? false)
          );
        }
        return true;
      })
      .sort((a, b) => sortAsc ? a.timestamp - b.timestamp : b.timestamp - a.timestamp);
  }, [records, dateFrom, dateTo, itemSearch, sortAsc]);

  const filteredTotal = filtered.reduce((s, r) => s + r.total, 0);
  const hasFilters = dateFrom || dateTo || itemSearch;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">

      {/* Header */}
      <div className="border-b border-[#E8E8E8] px-4 py-3 flex items-center gap-2 shrink-0">
        <button type="button" onClick={onClose} className="text-[#9B9B9B] text-[13px] pr-2">
          ← Zpět
        </button>
        <span className="flex-1 text-[15px] font-semibold text-[#1A1A1A]">Evidence objednávek</span>
        <button
          type="button"
          onClick={onAddManual}
          className="text-[12px] bg-[#F0F0F0] border border-[#E8E8E8] rounded-lg px-3 py-1.5 font-medium text-[#1A1A1A] whitespace-nowrap"
        >
          + Manuální
        </button>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          title="Obnovit seznam"
          className="w-8 h-8 flex items-center justify-center border border-[#E8E8E8] rounded-lg bg-[#F0F0F0] text-[#1A1A1A] disabled:opacity-40"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={refreshing ? 'animate-spin' : ''}>
            <path d="M12.5 7A5.5 5.5 0 1 1 7 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M7 1.5L9.5 4M7 1.5L9.5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setSortAsc(a => !a)}
          title={sortAsc ? 'Nejstarší první' : 'Nejnovější první'}
          className="w-8 h-8 flex items-center justify-center border border-[#E8E8E8] rounded-lg bg-[#F0F0F0] text-[#1A1A1A] text-[16px]"
        >
          {sortAsc ? '↑' : '↓'}
        </button>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 border-b border-[#E8E8E8] shrink-0 bg-[#FAFAFA] space-y-2">
        <div className="flex gap-2">
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <label className="text-[10px] uppercase tracking-wide text-[#9B9B9B]">Od</label>
            <input type="datetime-local" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="border border-[#E8E8E8] rounded-lg px-2 py-1.5 text-[13px] bg-white w-full" />
          </div>
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <label className="text-[10px] uppercase tracking-wide text-[#9B9B9B]">Do</label>
            <input type="datetime-local" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="border border-[#E8E8E8] rounded-lg px-2 py-1.5 text-[13px] bg-white w-full" />
          </div>
        </div>
        <input
          type="text" value={itemSearch} onChange={e => setItemSearch(e.target.value)}
          placeholder="Hledat položku (např. Plzeň - 0,5l)…"
          className="w-full border border-[#E8E8E8] rounded-lg px-3 py-1.5 text-[13px] bg-white"
        />
        {hasFilters && (
          <button type="button" onClick={() => { setDateFrom(''); setDateTo(''); setItemSearch(''); }}
            className="text-[12px] text-[#C8102E] underline">
            Smazat filtry
          </button>
        )}
      </div>

      {/* Order list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-[14px] text-[#9B9B9B]">
            Žádné objednávky
          </div>
        ) : filtered.map(r => (
          <div key={r.id} className="border-b border-[#F0F0F0] px-4 py-3">

            {confirmDeleteId === r.id ? (
              /* ── Confirm delete ── */
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] text-[#C8102E] font-medium">Smazat objednávku {r.id}?</span>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => { onDelete(r.id); setConfirmDeleteId(null); }}
                    className="bg-[#C8102E] text-white rounded-lg px-3 py-1.5 text-[12px] font-semibold">
                    Smazat
                  </button>
                  <button onClick={() => setConfirmDeleteId(null)}
                    className="border border-[#E8E8E8] text-[#6B6B6B] rounded-lg px-3 py-1.5 text-[12px]">
                    Zpět
                  </button>
                </div>
              </div>
            ) : (
              /* ── Normal row ── */
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 min-w-0">
                    <span className="font-mono text-[12px] font-semibold text-[#1A1A1A]">{r.id}</span>
                    {r.isManual && (
                      <span className="text-[10px] bg-[#FFF8E1] border border-[#F5E596] text-[#7A6000] px-1.5 py-0.5 rounded font-semibold tracking-wide">
                        ✎ manuální
                      </span>
                    )}
                    <span className="text-[12px] text-[#9B9B9B]">{fmtDate(r.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[15px] font-bold text-[#1A1A1A] mr-1">{r.total} Kč</span>
                    <button
                      type="button" onClick={() => { setConfirmDeleteId(null); setEditingOrder(r); }}
                      title="Upravit"
                      className="w-7 h-7 flex items-center justify-center rounded-md text-[#9B9B9B] hover:text-[#1A1A1A] hover:bg-[#F0F0F0] transition-colors"
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M9 2L11 4L4.5 10.5H2.5V8.5L9 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button
                      type="button" onClick={() => { setEditingOrder(null); setConfirmDeleteId(r.id); }}
                      title="Smazat"
                      className="w-7 h-7 flex items-center justify-center rounded-md text-[#9B9B9B] hover:text-[#C8102E] hover:bg-[#FFF0F0] transition-colors"
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2 3.5h9M5 3.5V2.5h3v1M5.5 6v4M7.5 6v4M3 3.5l.5 7h6l.5-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-0.5 text-[12px] text-[#6B6B6B] leading-relaxed">
                  {r.isManual
                    ? (r.manualNote || '—')
                    : r.items.map(i => `${i.name}${i.size ? ` — ${i.size}` : ''} ×${i.qty}`).join(', ')
                  }
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onSave={onUpdate}
          onClose={() => setEditingOrder(null)}
        />
      )}

      {/* Footer */}
      <div className="border-t border-[#E8E8E8] px-4 py-3 shrink-0 bg-[#FAFAFA]">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-[#9B9B9B]">{filtered.length} objednávek</span>
          <span className="text-[14px] font-bold text-[#1A1A1A]">Celkem: {filteredTotal} Kč</span>
        </div>
        {lastRefreshed && (
          <p className="text-[11px] text-[#C0C0C0] mt-0.5">
            {refreshing ? 'Aktualizuji…' : `Aktualizováno: ${lastRefreshed.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
          </p>
        )}
      </div>

    </div>
  );
}
