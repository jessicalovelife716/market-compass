import { useSyncExternalStore, useCallback } from "react";

const KEY = "watchlist";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

let cache = read();
function getSnapshot() {
  return cache;
}

function write(next: string[]) {
  cache = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  emit();
}

export function useWatchlist() {
  const list = useSyncExternalStore(subscribe, getSnapshot, () => []);

  const has = useCallback((code: string) => list.includes(code), [list]);
  const add = useCallback((code: string) => {
    if (!cache.includes(code)) write([...cache, code]);
  }, []);
  const remove = useCallback((code: string) => {
    write(cache.filter((c) => c !== code));
  }, []);
  const toggle = useCallback((code: string) => {
    if (cache.includes(code)) write(cache.filter((c) => c !== code));
    else write([...cache, code]);
  }, []);

  return { list, has, add, remove, toggle };
}
