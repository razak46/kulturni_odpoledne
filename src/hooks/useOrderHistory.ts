import { useState, useEffect } from 'react';
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

export function useOrderHistory() {
  const [records, setRecords] = useState<OrderRecord[]>([]);

  useEffect(() => {
    fetch('/api/orders', { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then((data: OrderRecord[]) => setRecords(data))
      .catch(() => { /* server unreachable — start with empty list */ });
  }, []);

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

  return { records, addRecord };
}
