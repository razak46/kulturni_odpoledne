import { useState, useEffect, useCallback, useRef } from 'react';
import type { OrderLineItem, OrderRecord } from '../types';

function todayKey(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
}

function generateId(): string {
  const rand = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  return `${todayKey()}-${rand}`;
}

const POLL_INTERVAL_MS = 30_000;
const QUEUE_KEY = 'pos_offline_queue_v1';
const CACHE_KEY = 'pos_orders_cache_v1';

function loadQueue(): OrderRecord[] {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]'); } catch { return []; }
}
function saveQueue(q: OrderRecord[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

function loadCache(): OrderRecord[] {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '[]'); } catch { return []; }
}
function saveCache(orders: OrderRecord[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(orders)); } catch { /* storage full */ }
}

async function postOrder(record: OrderRecord): Promise<boolean> {
  try {
    const r = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(record),
    });
    return r.ok || r.status === 409;
  } catch {
    return false;
  }
}

// On startup: show cached server orders + any queued offline orders not yet in cache.
function initRecords(): OrderRecord[] {
  const cached = loadCache();
  const queue = loadQueue();
  const cachedIds = new Set(cached.map(o => o.id));
  const queueOnly = queue.filter(o => !cachedIds.has(o.id));
  return [...queueOnly, ...cached];
}

export function useOrderHistory() {
  const [records, setRecords] = useState<OrderRecord[]>(initRecords);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [offlineQueueSize, setOfflineQueueSize] = useState(() => loadQueue().length);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const isFlushing = useRef(false);

  // Tracks every optimistically-added record until the server confirms it.
  // Pre-seeded from the queue so records remain visible after a reload while offline.
  const unconfirmed = useRef<Map<string, OrderRecord>>(
    new Map(loadQueue().map(o => [o.id, o]))
  );

  // Track online/offline state
  useEffect(() => {
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Merge server data with any records added optimistically but not yet confirmed.
  // Also caches the server response so the list survives a reload while offline.
  const mergeAndSet = useCallback((serverData: OrderRecord[]) => {
    const serverIds = new Set(serverData.map(o => o.id));
    for (const id of [...unconfirmed.current.keys()]) {
      if (serverIds.has(id)) unconfirmed.current.delete(id);
    }
    const localOnly = Array.from(unconfirmed.current.values()).filter(o => !serverIds.has(o.id));
    saveCache(serverData);
    setRecords([...localOnly, ...serverData]);
  }, []);

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
      // Push queued orders first so the GET response is already up to date
      await flushQueue();
      const r = await fetch('/api/orders', { credentials: 'include' });
      if (r.ok) {
        const data: OrderRecord[] = await r.json();
        mergeAndSet(data);
        setLastRefreshed(new Date());
      }
    } catch { /* server unreachable — keep showing cached data */ }
    finally { setRefreshing(false); }
  }, [flushQueue, mergeAndSet]);

  // Initial load + auto-refresh every 30 s
  useEffect(() => {
    fetchRecords();
    const id = setInterval(fetchRecords, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchRecords]);

  // On reconnect: flush queue then fetch (picks up orders from other devices too)
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

    unconfirmed.current.set(record.id, record);
    setRecords(prev => [record, ...prev]);

    const ok = await postOrder(record);
    if (!ok) {
      const offlineRecord: OrderRecord = { ...record, createdOffline: true };
      unconfirmed.current.set(record.id, offlineRecord);
      setRecords(prev => prev.map(r => r.id === record.id ? offlineRecord : r));
      const queue = loadQueue();
      queue.push(offlineRecord);
      saveQueue(queue);
      setOfflineQueueSize(queue.length);
    }
  };

  const deleteRecord = async (id: string) => {
    unconfirmed.current.delete(id);
    setRecords(prev => prev.filter(r => r.id !== id));
    saveCache(loadCache().filter(o => o.id !== id));
    try {
      const r = await fetch(`/api/orders/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
      if (!r.ok) { console.error('Delete failed:', await r.text()); fetchRecords(); }
    } catch { fetchRecords(); }
  };

  const updateRecord = async (id: string, total: number, items: OrderLineItem[], manualNote?: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, total, items, manualNote } : r));
    saveCache(loadCache().map(o => o.id === id ? { ...o, total, items, manualNote } : o));
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

  return { records, addRecord, deleteRecord, updateRecord, refresh: fetchRecords, refreshing, lastRefreshed, offlineQueueSize, isOnline };
}
