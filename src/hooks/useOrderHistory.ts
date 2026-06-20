import { useState, useEffect, useCallback, useRef } from 'react';
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
const QUEUE_KEY = 'pos_offline_queue_v1';

function loadQueue(): OrderRecord[] {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]'); } catch { return []; }
}

function saveQueue(q: OrderRecord[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

async function postOrder(record: OrderRecord): Promise<boolean> {
  try {
    const r = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(record),
    });
    // 201 = created, 409 = already exists — both mean it's safely in the DB
    return r.ok || r.status === 409;
  } catch {
    return false;
  }
}

export function useOrderHistory() {
  const [records, setRecords] = useState<OrderRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [offlineQueueSize, setOfflineQueueSize] = useState(() => loadQueue().length);
  const isFlushing = useRef(false);

  const flushQueue = useCallback(async () => {
    if (isFlushing.current) return;
    const queue = loadQueue();
    if (queue.length === 0) return;
    isFlushing.current = true;
    const remaining: OrderRecord[] = [];
    for (const record of queue) {
      const ok = await postOrder(record);
      if (!ok) remaining.push(record);
    }
    saveQueue(remaining);
    setOfflineQueueSize(remaining.length);
    isFlushing.current = false;
  }, []);

  const fetchRecords = useCallback(async () => {
    setRefreshing(true);
    try {
      // Flush offline queue before fetching so the returned list is up to date
      await flushQueue();
      const r = await fetch('/api/orders', { credentials: 'include' });
      if (r.ok) {
        const data: OrderRecord[] = await r.json();
        setRecords(data);
        setLastRefreshed(new Date());
      }
    } catch { /* server unreachable */ }
    finally { setRefreshing(false); }
  }, [flushQueue]);

  // Initial load + auto-refresh every 30 s
  useEffect(() => {
    fetchRecords();
    const id = setInterval(fetchRecords, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchRecords]);

  // Flush queue when device comes back online
  useEffect(() => {
    const handleOnline = () => flushQueue().then(() => fetchRecords());
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [flushQueue, fetchRecords]);

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

    const ok = await postOrder(record);
    if (!ok) {
      // Network down — queue for later sync
      const queue = loadQueue();
      queue.push(record);
      saveQueue(queue);
      setOfflineQueueSize(queue.length);
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

  return { records, addRecord, deleteRecord, updateRecord, refresh: fetchRecords, refreshing, lastRefreshed, offlineQueueSize };
}
