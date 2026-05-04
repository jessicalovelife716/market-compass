import { useSyncExternalStore, useCallback } from "react";

const KEY = "watchlist";
const SORT_KEY = "watchlist:sort";
export const WATCHLIST_MAX = 50;

// V2.1 排序：两个字段（涨跌幅 / 现价）+ 三态（默认/降序/升序），互斥
export type SortField = "default" | "changePct" | "price";
export type SortOrder = "default" | "desc" | "asc";
export interface WatchSortState {
  field: SortField;
  order: SortOrder;
}
const DEFAULT_SORT: WatchSortState = { field: "default", order: "default" };

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
function readSort(): WatchSortState {
  if (typeof window === "undefined") return DEFAULT_SORT;
  try {
    const raw = localStorage.getItem(SORT_KEY);
    if (!raw) return DEFAULT_SORT;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "field" in parsed && "order" in parsed) {
      return parsed as WatchSortState;
    }
    return DEFAULT_SORT;
  } catch {
    return DEFAULT_SORT;
  }
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
  sort: WatchSortState;
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
function writeSort(s: WatchSortState) {
  sortCache = s;
  refresh();
  if (s.field === "default") localStorage.removeItem(SORT_KEY);
  else localStorage.setItem(SORT_KEY, JSON.stringify(s));
  emit();
}

// 三态循环：默认 → 降序 → 升序 → 默认
function nextOrder(current: SortOrder): SortOrder {
  if (current === "default") return "desc";
  if (current === "desc") return "asc";
  return "default";
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

  // 点击某个排序按钮：互斥 + 三态循环
  const cycleSort = useCallback((field: Exclude<SortField, "default">) => {
    const cur = sortCache;
    if (cur.field !== field) {
      writeSort({ field, order: "desc" });
      return;
    }
    const next = nextOrder(cur.order);
    if (next === "default") writeSort(DEFAULT_SORT);
    else writeSort({ field, order: next });
  }, []);

  return { list: snap.list, sort: snap.sort, has, add, remove, toggle, cycleSort };
}
