import { useSyncExternalStore, useCallback } from "react";

const KEY = "watchlist";
const SORT_KEY = "watchlist:sort";
export const WATCHLIST_MAX = 50;

export type WatchSort = "added_desc" | "change_desc" | "change_asc";

interface AddResult {
  ok: boolean;
  reason?: "exists" | "limit";
}

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function readSort(): WatchSort {
  if (typeof window === "undefined") return "added_desc";
  return (localStorage.getItem(SORT_KEY) as WatchSort) || "added_desc";
}

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((fn) => fn());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === SORT_KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

let cache = read();
let sortCache = readSort();

interface Snapshot {
  list: string[];
  sort: WatchSort;
}
let snapshot: Snapshot = { list: cache, sort: sortCache };
function refresh() {
  snapshot = { list: cache, sort: sortCache };
}

function getSnapshot() {
  return snapshot;
}

function write(next: string[]) {
  cache = next;
  refresh();
  localStorage.setItem(KEY, JSON.stringify(next));
  emit();
}
function writeSort(s: WatchSort) {
  sortCache = s;
  refresh();
  localStorage.setItem(SORT_KEY, s);
  emit();
}

export function useWatchlist() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, () => snapshot);

  const has = useCallback((code: string) => snap.list.includes(code), [snap.list]);
  const add = useCallback((code: string): AddResult => {
    if (cache.includes(code)) return { ok: false, reason: "exists" };
    if (cache.length >= WATCHLIST_MAX) return { ok: false, reason: "limit" };
    write([...cache, code]);
    return { ok: true };
  }, []);
  const remove = useCallback((code: string) => {
    write(cache.filter((c) => c !== code));
  }, []);
  const toggle = useCallback((code: string): AddResult => {
    if (cache.includes(code)) {
      write(cache.filter((c) => c !== code));
      return { ok: true };
    }
    if (cache.length >= WATCHLIST_MAX) return { ok: false, reason: "limit" };
    write([...cache, code]);
    return { ok: true };
  }, []);
  const setSort = useCallback((s: WatchSort) => writeSort(s), []);

  return { list: snap.list, sort: snap.sort, has, add, remove, toggle, setSort };
}
