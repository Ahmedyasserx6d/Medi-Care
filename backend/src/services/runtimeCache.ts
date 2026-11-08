interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const entries = new Map<string, CacheEntry<unknown>>();

export const getCachedValue = <T>(key: string): T | undefined => {
  const entry = entries.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    entries.delete(key);
    return undefined;
  }
  return entry.value as T;
};

export const setCachedValue = <T>(key: string, value: T, ttlMs: number): void => {
  entries.set(key, { value, expiresAt: Date.now() + ttlMs });
};

export const clearRuntimeCache = (): number => {
  const count = entries.size;
  entries.clear();
  return count;
};