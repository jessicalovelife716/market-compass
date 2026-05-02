import { useSyncExternalStore, useCallback } from "react";

const KEY = "search-history";
const MAX = 8;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

let cache = read();
const getSnapshot = () => cache;
function write(next: string[]) {
  cache = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  emit();
}

export function useSearchHistory() {
  const list = useSyncExternalStore(subscribe, getSnapshot, () => []);
  const push = useCallback((term: string) => {
    const t = term.trim();
    if (!t) return;
    write([t, ...cache.filter((x) => x !== t)].slice(0, MAX));
  }, []);
  const clear = useCallback(() => write([]), []);
  return { list, push, clear };
}
