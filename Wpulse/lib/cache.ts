import type { ScanResult } from "./scanner";

interface CacheEntry {
  data: ScanResult;
  expiresAt: number;
}

const TTL_MS = 30 * 60 * 1000; // 30 minutes
const store = new Map<string, CacheEntry>();

export function setCache(id: string, data: ScanResult): void {
  store.set(id, {
    data,
    expiresAt: Date.now() + TTL_MS,
  });
}

export function getCache(id: string): ScanResult | null {
  const entry = store.get(id);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(id);
    return null;
  }
  return entry.data;
}

export function deleteCache(id: string): void {
  store.delete(id);
}
