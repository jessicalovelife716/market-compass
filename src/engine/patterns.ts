import type { OHLCV } from "./types";
import { ENGINE_CONFIG } from "./config";

// Find local minima/maxima in a window.
function findExtremes(candles: OHLCV[], window = 5) {
  const lows: { idx: number; v: number }[] = [];
  const highs: { idx: number; v: number }[] = [];
  for (let i = window; i < candles.length - window; i++) {
    const sliceLow = candles.slice(i - window, i + window + 1).map((c) => c.low);
    const sliceHigh = candles.slice(i - window, i + window + 1).map((c) => c.high);
    if (candles[i].low === Math.min(...sliceLow)) lows.push({ idx: i, v: candles[i].low });
    if (candles[i].high === Math.max(...sliceHigh)) highs.push({ idx: i, v: candles[i].high });
  }
  return { lows, highs };
}

export interface WBottom {
  detected: boolean;
  v1?: number;
  v2?: number;
  neckline?: number;
  priorHigh?: number;
}

export function detectWBottom(candles: OHLCV[]): WBottom {
  if (candles.length < 30) return { detected: false };
  const { lows, highs } = findExtremes(candles.slice(-90));
  if (lows.length < 2) return { detected: false };
  // Take two lowest valleys.
  const sortedLows = [...lows].sort((a, b) => a.v - b.v).slice(0, 2).sort((a, b) => a.idx - b.idx);
  const [v1, v2] = sortedLows;
  if (!v1 || !v2 || v2.idx - v1.idx < 5) return { detected: false };
  const diff = Math.abs(v1.v - v2.v) / v1.v;
  if (diff > ENGINE_CONFIG.pattern.wBottomTolerance) return { detected: false };
  // Neckline = 两底之间最高点
  const between = candles.slice(-90).slice(v1.idx, v2.idx + 1);
  const neckline = Math.max(...between.map((c) => c.high));
  const priorHigh = highs.length ? Math.max(...highs.map((h) => h.v)) : neckline * 1.1;
  return { detected: true, v1: v1.v, v2: v2.v, neckline, priorHigh };
}

export function priorPeak(candles: OHLCV[], lookback = 90): number {
  const slice = candles.slice(-lookback, -5);
  return slice.length ? Math.max(...slice.map((c) => c.high)) : 0;
}
