import type { StockAnalysis, StockSnapshot } from "./types";
import { computeIndicators } from "./indicators";
import { buildPeriods } from "./rules/period";
import { buildHealth } from "./rules/health";
import { buildTimeline, timelineToChain } from "./rules/timeline";
import { buildVerdict } from "./rules/verdict";

export { analyzeSector } from "./rules/sector";
export * from "./types";

export function analyzeStock(snap: StockSnapshot, sectorChangePct = 0): StockAnalysis {
  const ind = computeIndicators(snap.candles);
  const periods = buildPeriods(snap.candles, ind);
  const health = buildHealth({ candles: snap.candles, ind, meta: snap.meta, sectorChangePct });
  const timeline = buildTimeline(snap.candles, ind);
  const chain = timelineToChain(timeline);
  const verdict = buildVerdict(snap.candles, ind, periods, chain);

  return {
    meta: snap.meta,
    last: snap.candles.at(-1)!,
    prev: snap.candles.at(-2)!,
    indicators: ind,
    verdict,
    periods,
    health,
    timeline,
  };
}
