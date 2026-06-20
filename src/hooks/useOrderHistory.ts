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
  // Use crypto.randomUUID for uniqueness across multiple devices.
  // Keep the date prefix so IDs remain human-readable and sortable.
  const rand = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  return `${todayKey()}-${rand}`;
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
    // 2xx = created, 409 = duplicate — either way it's safely in the DB
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

  // Tracks every optimistically-added record until the server confirms it.
  // Initialized from the persisted queue so records stay visible after a reload
  // while the queue hasn't been flushed yet.
  const unconfirmed = useRef<Map<string, OrderRecord>>(
    new Map(loadQueue().map(o => [o.id, o]))
  );

  // Merge server data with any records we've added optimistically but the
  // server hasn't returned yet (in-flight or queued while offline).
  const mergeAndSet = useCallback((serverData: OrderRecord[]) => {
    const serverIds = new Set(serverData.map(o => o.id));
    // Drop from unconfirmed anything the server now knows about
    for (const id of [...unconfirmed.current.keys()]) {
      if (serverIds.has(id)) unconfirmed.current.delete(id);
    }
    const localOnly = Array.from(unconfirmed.current.values()).filter(o => !serverIds.has(o.id));
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
      // Push any queued orders to DB before fetching so the list is current
      await flushQueue();
      const r = await fetch('/api/orders', { credentials: 'include' });
      if (r.ok) {
        const data: OrderRecord[] = await r.json();
        mergeAndSet(data);
        setLastRefreshed(new Date());
      }
    } catch { /* server unreachable */ }
    finally { setRefreshing(false); }
  }, [flushQueue, mergeAndSet]);

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

    // Track optimistically so fetchRecords never wipes it before server confirms
    unconfirmed.current.set(record.id, record);
    setRecords(prev => [record, ...prev]);

    const ok = await postOrder(record);
    if (!ok) {
      // Network down — mark as offline and persist to queue for retry on reconnect
      const offlineRecord: OrderRecord = { ...record, createdOffline: true };
      unconfirmed.current.set(record.id, offlineRecord);
      setRecords(prev => prev.map(r => r.id === record.id ? offlineRecord : r));
      const queue = loadQueue();
      queue.push(offlineRecord);
      saveQueue(queue);
      setOfflineQueueSize(queue.length);
    }
    // If ok: server has it — unconfirmed entry cleaned up on next fetchRecords
  };

  const deleteRecord = async (id: string) => {
    unconfirmed.current.delete(id);
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
