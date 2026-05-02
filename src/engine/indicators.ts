import type { OHLCV, Indicators } from "./types";

const sma = (xs: number[], n: number): number => {
  if (xs.length < n) return xs.reduce((a, b) => a + b, 0) / Math.max(xs.length, 1);
  const slice = xs.slice(-n);
  return slice.reduce((a, b) => a + b, 0) / n;
};

const ema = (xs: number[], n: number): number[] => {
  const k = 2 / (n + 1);
  const out: number[] = [];
  xs.forEach((x, i) => {
    if (i === 0) out.push(x);
    else out.push(x * k + out[i - 1] * (1 - k));
  });
  return out;
};

export function computeIndicators(candles: OHLCV[]): Indicators {
  const closes = candles.map((c) => c.close);
  const vols = candles.map((c) => c.volume);

  const ma5 = sma(closes, 5);
  const ma10 = sma(closes, 10);
  const ma15 = sma(closes, 15);
  const ma20 = sma(closes, 20);
  const ma60 = sma(closes, 60);

  const ema12 = ema(closes, 12);
  const ema26 = ema(closes, 26);
  const difSeries = closes.map((_, i) => ema12[i] - ema26[i]);
  const deaSeries = ema(difSeries, 9);
  const dif = difSeries.at(-1) ?? 0;
  const dea = deaSeries.at(-1) ?? 0;
  const macd = (dif - dea) * 2;

  // KDJ (9-period)
  const period = 9;
  let k = 50;
  let d = 50;
  for (let i = 0; i < candles.length; i++) {
    const slice = candles.slice(Math.max(0, i - period + 1), i + 1);
    const low = Math.min(...slice.map((c) => c.low));
    const high = Math.max(...slice.map((c) => c.high));
    const rsv = high === low ? 50 : ((candles[i].close - low) / (high - low)) * 100;
    k = (2 / 3) * k + (1 / 3) * rsv;
    d = (2 / 3) * d + (1 / 3) * k;
  }
  const j = 3 * k - 2 * d;

  const vol5 = sma(vols, 5);
  const last = candles.at(-1)!;
  const volRatio = vol5 > 0 ? last.volume / vol5 : 1;
  const bias5 = ma5 > 0 ? ((last.close - ma5) / ma5) * 100 : 0;

  return {
    ma5,
    ma10,
    ma15,
    ma20,
    ma60,
    dif,
    dea,
    macd,
    kdjK: k,
    kdjD: d,
    kdjJ: j,
    vol5,
    volRatio,
    bias5,
  };
}
