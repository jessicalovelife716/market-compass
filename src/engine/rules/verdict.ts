import type { Indicators, OHLCV, PeriodResult, VerdictLabel } from "../types";
import { ENGINE_CONFIG } from "../config";
import { fmtNum } from "../templates";

export function buildVerdict(
  candles: OHLCV[],
  ind: Indicators,
  periods: PeriodResult[],
  logicChain: string[],
) {
  const last = candles.at(-1)!;
  const labels: VerdictLabel[] = periods.map((p) => {
    if (p.score >= ENGINE_CONFIG.scoreBands.bullishLeaning)
      return { text: `${p.label.split("·")[0]}偏多`, tone: "bull" };
    if (p.score >= ENGINE_CONFIG.scoreBands.bearishLeaning)
      return { text: `${p.label.split("·")[0]}谨慎`, tone: "warn" };
    return { text: `${p.label.split("·")[0]}回避`, tone: "bear" };
  });

  const defenseLine = Math.max(ind.ma10, ind.ma15);
  const summary = `中线结构完好，但短线冲前高失败收阴，超短动能衰竭特征已现。明日为关键验证日——若放量阳线收复关键位，则今日视为洗盘；若继续缩量阴跌，双顶形态大概率确认。`;
  const operation = `以 ${fmtNum(defenseLine)} 元为防守线，暂不盲目加仓，观察明日能否放量反包今日阴线。跌破 ${fmtNum(ind.ma20)} 元 MA20 则中线判断需重新评估。`;

  return { labels, summary, logicChain, operation, defenseLine };
}
