import { useState } from 'react';
import type { OrderLineItem, OrderRecord } from '../types';

const HISTORY_KEY = 'pos_order_history';

function todayKey(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
}

function nextCounter(dayKey: string): number {
  const key = `pos_order_counter_${dayKey}`;
  const n = Number(localStorage.getItem(key) ?? 0) + 1;
  localStorage.setItem(key, String(n));
  return n;
}

function generateId(): string {
  const day = todayKey();
  return `${day}-${String(nextCounter(day)).padStart(4, '0')}`;
}

function load(): OrderRecord[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]'); }
  catch { return []; }
}

export function useOrderHistory() {
  const [records, setRecords] = useState<OrderRecord[]>(load);

  const addRecord = (items: OrderLineItem[], total: number, isManual: boolean, manualNote?: string) => {
    const record: OrderRecord = { id: generateId(), timestamp: Date.now(), items, total, isManual, manualNote };
    setRecords(prev => {
      const updated = [record, ...prev];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { records, addRecord };
}
