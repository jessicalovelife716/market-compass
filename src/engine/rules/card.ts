// 个股卡片规则引擎（PRD 6.3）
import type { OHLCV, Indicators } from "../types";
import { computeIndicators } from "../indicators";

// ==== 方向判定 ====
export type Direction =
  | "strong_bull"
  | "mid_short_bull"
  | "mid_bull_short_caution"
  | "oversold_bounce"
  | "short_avoid"
  | "sideways"
  | "bearish";

export function getDirection(
  close: number,
  ind: Indicators,
  changePct: number,
  bias5: number,
  kdjDPrev: number,
): Direction {
  const { ma5, ma10, ma20, ma60, volRatio, kdjD } = ind;
  if (close > ma5 && ma5 > ma10 && ma10 > ma20 && close > ma20 && volRatio >= 1.2 && changePct > 0)
    return "strong_bull";
  if (close > ma5 && ma5 > ma10 && close > ma20) return "mid_short_bull";
  if (close > ma20 && close < ma5 && close > ma10) return "mid_bull_short_caution";
  if (bias5 < -8 && kdjD < 20 && kdjD > kdjDPrev) return "oversold_bounce";
  if (close < ma5 && close >= ma10 * 0.98) return "short_avoid";
  if (close < ma10 && close >= ma20 * 0.98) return "sideways";
  if (close < ma20) return "bearish";
  return "sideways";
}

export interface ConclusionTag {
  text: string;
  style: "bull" | "bear" | "warn" | "neutral";
}

const DIR_TAG: Record<Direction, ConclusionTag> = {
  strong_bull: { text: "强多", style: "bull" },
  mid_short_bull: { text: "中短双多", style: "bull" },
  mid_bull_short_caution: { text: "中线偏多", style: "bull" },
  oversold_bounce: { text: "超跌反弹", style: "warn" },
  short_avoid: { text: "短线回避", style: "warn" },
  sideways: { text: "震荡观望", style: "neutral" },
  bearish: { text: "偏空", style: "bear" },
};

export function getActionTag(
  dir: Direction,
  volRatio: number,
  changePct: number,
): ConclusionTag | null {
  if (dir === "strong_bull" && volRatio >= 1.5) return { text: "强势进攻", style: "bull" };
  if (dir === "mid_short_bull" && volRatio >= 1.2 && changePct > 0)
    return { text: "轻仓参与", style: "bull" };
  if (dir === "mid_bull_short_caution" || dir === "short_avoid")
    return { text: "持仓观察", style: "warn" };
  if (dir === "oversold_bounce") return { text: "谨慎参与", style: "warn" };
  if (dir === "sideways" || dir === "bearish") return { text: "空仓等待", style: "neutral" };
  return null;
}

// ==== 关键价位（PRD 6.3 Step6） ====
export function calcKeyPrice(
  close: number,
  ind: Indicators,
  todayLow: number,
): { label: string; value: number } | null {
  const support = Math.max(ind.ma10 || 0, ind.ma15 || 0);
  const candidates = [support, ind.ma20, ind.ma60, todayLow]
    .filter((v) => v > 0 && v < close)
    .sort((a, b) => b - a);
  const base = candidates[0];
  if (!base) return null;
  const isWeak = close < ind.ma20;
  const value = +(base * (isWeak ? 0.99 : 0.97)).toFixed(2);
  return { label: isWeak ? "支撑" : "防守", value };
}

// ==== 信号库（PRD 6.3 Step4，18 条 + Family 去重） ====
export interface SignalCtx {
  close: number;
  closePrev: number;
  open: number;
  high: number;
  high20dPrev: number;
  high20d: number;
  ma5: number;
  ma5Prev: number;
  ma10: number;
  ma10Prev: number;
  ma20: number;
  ma60: number;
  volRatio: number;
  changePct: number;
  pricePos60d: number;
  bias5: number;
  kdjD: number;
  macdHist: number;
  macdHist20Max: number;
  trendDir: "up" | "down" | "sideways";
  resistance: number;
  sectorChangePct: number;
  hotConcept: string | null;
  wBottomConfirmed: boolean;
  doubleTopConfirmed: boolean;
}

interface SignalRule {
  family: string;
  priority: number;
  tag: string;
  check: (d: SignalCtx) => boolean;
  dynamic?: (d: SignalCtx) => string;
}

const SIGNAL_RULES: SignalRule[] = [
  { family: "shape", priority: 10, tag: "W底突破", check: (d) => d.wBottomConfirmed },
  { family: "shape", priority: 9, tag: "双顶风险", check: (d) => d.doubleTopConfirmed },
  { family: "shape", priority: 7, tag: "上升趋势", check: (d) => d.trendDir === "up" && d.close > d.ma20 },
  { family: "shape", priority: 6, tag: "下降趋势", check: (d) => d.trendDir === "down" && d.close < d.ma20 },
  { family: "ma", priority: 9, tag: "均线金叉", check: (d) => d.ma5 > d.ma10 && d.ma5Prev < d.ma10Prev },
  { family: "ma", priority: 9, tag: "均线死叉", check: (d) => d.ma5 < d.ma10 && d.ma5Prev > d.ma10Prev },
  { family: "ma", priority: 7, tag: "均线多头", check: (d) => d.ma5 > d.ma10 && d.ma10 > d.ma20 && d.ma20 > d.ma60 },
  { family: "ma", priority: 6, tag: "均线空头", check: (d) => d.ma5 < d.ma10 && d.ma10 < d.ma20 && d.ma20 < d.ma60 },
  { family: "vol_price", priority: 10, tag: "放量突破", check: (d) => d.volRatio >= 1.5 && d.close > d.high20dPrev },
  { family: "vol_price", priority: 9, tag: "高位量价背离", check: (d) => d.pricePos60d > 0.7 && d.volRatio < 0.8 && d.changePct < 0 },
  { family: "vol_price", priority: 8, tag: "缩量阴线", check: (d) => d.volRatio < 0.8 && d.close < d.open },
  { family: "vol_price", priority: 7, tag: "逆势抗跌", check: (d) => d.changePct > 0 && d.sectorChangePct < -1 },
  { family: "vol_price", priority: 7, tag: "放量上涨", check: (d) => d.volRatio >= 1.2 && d.changePct > 0 },
  { family: "risk", priority: 10, tag: "冲高失败", check: (d) => d.high >= d.resistance * 0.99 && d.close < d.resistance * 0.98 },
  { family: "risk", priority: 9, tag: "指标顶背离", check: (d) => d.close >= d.high20d && d.macdHist < d.macdHist20Max },
  { family: "risk", priority: 8, tag: "跌破支撑", check: (d) => d.close < d.ma20 && d.closePrev >= d.ma20 },
  { family: "concept", priority: 6, tag: "{concept}", check: (d) => d.hotConcept !== null, dynamic: (d) => d.hotConcept ?? "" },
  { family: "oversold", priority: 8, tag: "超跌反弹", check: (d) => d.bias5 < -8 && d.kdjD < 20 },
];

export function getSignalTags(d: SignalCtx): string[] {
  const matched = SIGNAL_RULES.filter((r) => r.check(d));
  const byFamily = new Map<string, SignalRule>();
  for (const r of matched) {
    const ex = byFamily.get(r.family);
    if (!ex || r.priority > ex.priority) byFamily.set(r.family, r);
  }
  return [...byFamily.values()]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4)
    .map((r) => (r.dynamic ? r.dynamic(d) : r.tag));
}

// ==== K 线类型（PRD 6.3 Step5） ====
export type KlineType =
  | "big_yang"
  | "yang"
  | "shadow_yang"
  | "doji"
  | "shadow_yin"
  | "yin"
  | "big_yin";

export function classifyKline(c: OHLCV, changePct: number): KlineType {
  const body = Math.abs(c.close - c.open);
  const range = c.high - c.low || 0.0001;
  const upperShadow = c.high - Math.max(c.open, c.close);
  const isYang = c.close >= c.open;
  if (Math.abs(changePct) < 0.3 && body / range < 0.2) return "doji";
  if (isYang) {
    if (changePct >= 5 && body / range > 0.7) return "big_yang";
    if (upperShadow > body) return "shadow_yang";
    return "yang";
  } else {
    if (changePct <= -5 && body / range > 0.7) return "big_yin";
    if (upperShadow > body) return "shadow_yin";
    return "yin";
  }
}

export type VolStatus = "high" | "normal" | "low" | "any";
export function classifyVol(volRatio: number): VolStatus {
  if (volRatio >= 1.2) return "high";
  if (volRatio <= 0.8) return "low";
  return "normal";
}

// ==== 文案模板（PRD 6.3 Step5） ====
interface VerdictTemplate {
  dir: Direction | "any";
  kline: KlineType | "any";
  vol: VolStatus;
  text: string;
}

const VERDICT_TEMPLATES: VerdictTemplate[] = [
  { dir: "strong_bull", kline: "big_yang", vol: "high", text: "放量大阳线，主力资金主动推涨，强势信号明确，可逢回踩低吸。" },
  { dir: "strong_bull", kline: "yang", vol: "high", text: "放量上涨（量比{volRatio}），量价配合良好，趋势向上延续，关注回踩低吸机会。" },
  { dir: "strong_bull", kline: "yang", vol: "normal", text: "正常量能收阳，趋势向上，持仓持有，等量能再度放大后可加仓。" },
  { dir: "mid_short_bull", kline: "yang", vol: "any", text: "板块调整中逆势收阳，主力资金承接意愿强，可逢低关注。" },
  { dir: "mid_short_bull", kline: "shadow_yin", vol: "low", text: "缩量（量比{volRatio}）小阴线，短线正常整理，中线结构完好，持仓不动。" },
  { dir: "mid_bull_short_caution", kline: "shadow_yin", vol: "low", text: "冲前高失败收阴，量能萎缩（量比{volRatio}），短线上攻动能衰竭，警惕双顶。" },
  { dir: "mid_bull_short_caution", kline: "yin", vol: "low", text: "缩量下跌，跌破MA5（{ma5}元），短线偏弱，中线结构尚好，控仓观察。" },
  { dir: "mid_bull_short_caution", kline: "yin", vol: "high", text: "放量下跌（量比{volRatio}），MA5失守，短线压力加大，注意防守{support}元。" },
  { dir: "oversold_bounce", kline: "any", vol: "any", text: "乖离率{bias5}%，KDJ超卖金叉，超跌反弹信号出现，注意这是技术反弹而非趋势反转，仓位要轻。" },
  { dir: "short_avoid", kline: "yin", vol: "low", text: "缩量下跌，跌破MA5（{ma5}元），需观察能否快速修复，暂不追涨。" },
  { dir: "short_avoid", kline: "yang", vol: "low", text: "无量反弹，跌破MA5后的弱反弹可信度低，仍需观察量能配合。" },
  { dir: "sideways", kline: "any", vol: "low", text: "量能萎缩（量比{volRatio}），方向不明，等候放量突破后再确认方向。" },
  { dir: "sideways", kline: "doji", vol: "any", text: "十字星，多空均衡，方向待定，明日量能放大方向为操作依据。" },
  { dir: "bearish", kline: "yin", vol: "high", text: "放量跌破MA20（量比{volRatio}），空方占优，不建议介入，控制风险。" },
  { dir: "bearish", kline: "any", vol: "low", text: "弱势格局延续（MA20={ma20}元压制），反弹力度有限，观望为主。" },
  { dir: "any", kline: "any", vol: "any", text: "今日{changeDesc}，量比{volRatio}，无明显特殊信号，关注后续量能变化。" },
];

function interpolate(t: string, vars: Record<string, string | number>): string {
  return t.replace(/\{(\w+)\}/g, (_, k) => {
    const v = vars[k];
    return v === undefined ? "" : typeof v === "number" ? v.toFixed(2) : String(v);
  });
}

export function getVerdict(
  dir: Direction,
  kline: KlineType,
  vol: VolStatus,
  vars: Record<string, string | number>,
): string {
  const exact = VERDICT_TEMPLATES.find(
    (t) => t.dir === dir && t.kline === kline && (t.vol === vol || t.vol === "any"),
  );
  const dirOnly = VERDICT_TEMPLATES.find((t) => t.dir === dir && t.kline === "any");
  const fallback = VERDICT_TEMPLATES.find((t) => t.dir === "any")!;
  return interpolate((exact || dirOnly || fallback).text, vars);
}

// ==== 一站式分析 ====
export interface CardAnalysis {
  direction: Direction;
  conclusionTags: ConclusionTag[];
  signalTags: string[];
  keyPrice: { label: string; value: number } | null;
  verdictOneLine: string;
  changePct: number;
  close: number;
}

export function analyzeCard(opts: {
  candles: OHLCV[];
  sectorChangePct?: number;
  hotConcept?: string | null;
}): CardAnalysis | null {
  const { candles, sectorChangePct = 0, hotConcept = null } = opts;
  if (candles.length < 26) return null;
  const last = candles.at(-1)!;
  const prev = candles.at(-2)!;
  const ind = computeIndicators(candles);
  const indPrev = computeIndicators(candles.slice(0, -1));
  const changePct = ((last.close - prev.close) / prev.close) * 100;
  const direction = getDirection(last.close, ind, changePct, ind.bias5, indPrev.kdjD);

  const dirTag = DIR_TAG[direction];
  const actTag = getActionTag(direction, ind.volRatio, changePct);
  const conclusionTags = [dirTag, actTag].filter(Boolean) as ConclusionTag[];

  const keyPrice = calcKeyPrice(last.close, ind, last.low);

  const last20 = candles.slice(-20);
  const high20d = Math.max(...last20.map((c) => c.high));
  const high20dPrev = Math.max(...candles.slice(-21, -1).map((c) => c.high));
  const low60d = Math.min(...candles.slice(-60).map((c) => c.low));
  const high60d = Math.max(...candles.slice(-60).map((c) => c.high));
  const pricePos60d = high60d > low60d ? (last.close - low60d) / (high60d - low60d) : 0.5;
  const trendDir: "up" | "down" | "sideways" =
    ind.ma5 > ind.ma20 ? "up" : ind.ma5 < ind.ma20 ? "down" : "sideways";

  const signalTags = getSignalTags({
    close: last.close,
    closePrev: prev.close,
    open: last.open,
    high: last.high,
    high20d,
    high20dPrev,
    ma5: ind.ma5,
    ma5Prev: indPrev.ma5,
    ma10: ind.ma10,
    ma10Prev: indPrev.ma10,
    ma20: ind.ma20,
    ma60: ind.ma60,
    volRatio: ind.volRatio,
    changePct,
    pricePos60d,
    bias5: ind.bias5,
    kdjD: ind.kdjD,
    macdHist: ind.macd,
    macdHist20Max: Math.max(...candles.slice(-20).map(() => ind.macd)),
    trendDir,
    resistance: high20d,
    sectorChangePct,
    hotConcept,
    wBottomConfirmed: false,
    doubleTopConfirmed: direction === "mid_bull_short_caution" && last.close < last.open,
  });

  const kline = classifyKline(last, changePct);
  const vol = classifyVol(ind.volRatio);
  const verdictOneLine = getVerdict(direction, kline, vol, {
    volRatio: ind.volRatio.toFixed(2),
    ma5: ind.ma5.toFixed(2),
    ma20: ind.ma20.toFixed(2),
    bias5: ind.bias5.toFixed(1),
    support: keyPrice?.value ?? "--",
    changeDesc: changePct >= 0 ? `上涨${changePct.toFixed(2)}%` : `下跌${Math.abs(changePct).toFixed(2)}%`,
  });

  return {
    direction,
    conclusionTags,
    signalTags,
    keyPrice,
    verdictOneLine,
    changePct,
    close: last.close,
  };
}
