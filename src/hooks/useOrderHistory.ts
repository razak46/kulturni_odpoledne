import { useState, useEffect, useCallback } from 'react';
import type { OrderLineItem, OrderRecord } from '../types';

function todayKey(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
}

function nextDailyCounter(): number {
  const key = `pos_order_counter_${todayKey()}`;
  const n = Number(localStorage.getItem(key) ?? 0) + 1;
  localStorage.setItem(key, String(n));
  return n;
}

function generateId(): string {
  return `${todayKey()}-${String(nextDailyCounter()).padStart(4, '0')}`;
}

const POLL_INTERVAL_MS = 30_000;

export function useOrderHistory() {
  const [records, setRecords] = useState<OrderRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchRecords = useCallback(async () => {
    setRefreshing(true);
    try {
      const r = await fetch('/api/orders', { credentials: 'include' });
      if (r.ok) {
        const data: OrderRecord[] = await r.json();
        setRecords(data);
        setLastRefreshed(new Date());
      }
    } catch { /* server unreachable */ }
    finally { setRefreshing(false); }
  }, []);

  // Initial load + auto-refresh every 30 s
  useEffect(() => {
    fetchRecords();
    const id = setInterval(fetchRecords, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchRecords]);

  const addRecord = async (items: OrderLineItem[], total: number, isManual: boolean, manualNote?: string) => {
    const record: OrderRecord = {
      id: generateId(),
      timestamp: Date.now(),
      items,
      total,
      isManual,
      manualNote,
    };

    // Optimistic update — show immediately in UI
    setRecords(prev => [record, ...prev]);

    // Persist to backend
    try {
      const r = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(record),
      });
      if (!r.ok) console.error('Order save failed:', await r.text());
    } catch (e) {
      console.error('Order save error:', e);
    }
  };

  const deleteRecord = async (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    try {
      const r = await fetch(`/api/orders/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
      if (!r.ok) { console.error('Delete failed:', await r.text()); fetchRecords(); }
    } catch { fetchRecords(); }
  };

  const updateRecord = async (id: string, total: number, items: OrderLineItem[], manualNote?: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, total, items, manualNote } : r));
    try {
      const r = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ total, items, manualNote }),
      });
      if (!r.ok) { console.error('Update failed:', await r.text()); fetchRecords(); }
    } catch { fetchRecords(); }
  };

  return { records, addRecord, deleteRecord, updateRecord, refresh: fetchRecords, refreshing, lastRefreshed };
}
