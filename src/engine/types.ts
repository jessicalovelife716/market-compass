// Core domain types for the strategy engine.

export type StatusKey =
  | "healthy"
  | "warn"
  | "danger"
  | "bullish"
  | "bearish"
  | "neutral"
  | "strong";

export interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number; // 万手
}

export interface Indicators {
  ma5: number;
  ma10: number;
  ma15: number;
  ma20: number;
  ma60: number;
  dif: number;
  dea: number;
  macd: number;
  kdjK: number;
  kdjD: number;
  kdjJ: number;
  vol5: number;
  volRatio: number; // 当日量 / 5日均量
  bias5: number;
}

export interface DimensionResult {
  key: string;
  title: string;
  status: StatusKey;
  statusLabel: string;
  headline: string;
  evidence: string[];
}

export interface PeriodResult {
  key: "mid" | "short" | "ultra";
  label: string;
  score: number;
  verdict: string;
  sections: { title: string; ok: boolean; body: string }[];
  advice: string;
}

export interface TimelineNode {
  when: string;
  feature: string;
  body: string;
  current?: boolean;
}

export interface VerdictLabel {
  text: string;
  tone: "bull" | "bear" | "warn" | "neutral";
}

export interface StockMeta {
  code: string;
  name: string;
  exchange: string; // 深交所 / 上交所
  industry: string;
  industryId: string;
  concepts: { id: string; name: string }[];
  marketCap: string;
  pe: number;
  pinyin: string;
}

export interface StockSnapshot {
  meta: StockMeta;
  candles: OHLCV[]; // 至少 60 日，按时间升序
}

export interface SectorMeta {
  id: string;
  name: string;
  level: string;
  count: number;
  turnover: string; // 板块成交额展示文本
  changePct: number;
  vsMarket: number; // 相对大盘
  concepts: string[];
  rising: number;
  falling: number;
  limitUp: number;
  limitDown: number;
  topStocks: { code: string; name: string; changePct: number; turnoverShare: number }[];
  rankTop5: { code: string; name: string; changePct: number }[];
}

export interface SectorSnapshot {
  meta: SectorMeta;
  // 简化：板块 5 日成交额、近 20 日均量等可由数据准备
  turnover5d: number[];
  turnoverAvg5: number;
}

export interface StockAnalysis {
  meta: StockMeta;
  last: OHLCV;
  prev: OHLCV;
  indicators: Indicators;
  verdict: {
    labels: VerdictLabel[];
    summary: string;
    logicChain: string[];
    operation: string;
    defenseLine: number;
  };
  periods: PeriodResult[];
  health: DimensionResult[];
  timeline: TimelineNode[];
}

export interface SectorAnalysis {
  meta: SectorMeta;
  verdict: { headline: string; summary: string };
  health: DimensionResult[];
  timeline: TimelineNode[];
  outlook: string;
}
