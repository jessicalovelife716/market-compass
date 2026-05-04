// 大盘情绪温度计原始字段（按 PRD 6.1）
export interface MarketRaw {
  riseCount: number;        // 今日上涨家数
  fallCount: number;        // 今日下跌家数
  flatCount: number;        // 今日平盘家数
  limitUpCount: number;     // 今日涨停家数
  limitUpAvg60d: number;    // 60日均涨停家数
  todayAmount: number;      // 全市场今日成交额（亿）
  avgAmount60d: number;     // 60日均成交额（亿）
  indexChangePct: number;   // 上证今日涨跌幅%
  indexName: string;
  indexValue: number;
}

export interface MarketMood {
  raw: MarketRaw;
  temperature: number;
  status: string;            // 5档枚举
  labelColor: "deep-green" | "light-green" | "gray" | "light-red" | "deep-red";
  index: { name: string; value: number; changePct: number };
  verdict: string;
  advice: string;
  degraded?: string;         // 降级说明（可选）
}

// === 计算引擎 ===

export interface TempResult {
  temperature: number;
  label: string;
  labelColor: MarketMood["labelColor"];
  verdict: string;
  advice: string;
  degraded?: string;
}

export function calcTemperature(d: MarketRaw): number {
  const total = d.riseCount + d.fallCount + d.flatCount;
  const breadthScore = total > 0 ? (d.riseCount / total) * 100 : 50;
  const limitScore =
    d.limitUpAvg60d > 0
      ? Math.min((d.limitUpCount / d.limitUpAvg60d) * 50, 100)
      : Math.min(d.limitUpCount * 5, 100);
  const volScore =
    d.avgAmount60d > 0 ? Math.min((d.todayAmount / d.avgAmount60d) * 50, 100) : 50;
  const indexAdj = Math.max(-15, Math.min(15, d.indexChangePct * 4));
  const raw =
    breadthScore * 0.35 + limitScore * 0.3 + volScore * 0.25 + 50 * 0.1;
  return Math.round(Math.max(0, Math.min(100, raw + indexAdj)));
}

export function genTempText(temp: number, d: MarketRaw): TempResult {
  const limitRatio =
    d.limitUpAvg60d > 0 ? (d.limitUpCount / d.limitUpAvg60d).toFixed(1) : "--";
  const amountRatio =
    d.avgAmount60d > 0 ? (d.todayAmount / d.avgAmount60d).toFixed(1) : "--";
  const total = d.riseCount + d.fallCount + d.flatCount;
  const riseRatio = total > 0 ? Math.round((d.riseCount / total) * 100).toString() : "--";

  if (temp < 20)
    return {
      temperature: temp,
      label: "冰点",
      labelColor: "deep-green",
      verdict: `全市场上涨家数仅${riseRatio}%，涨停${d.limitUpCount}家（均值${limitRatio}倍），成交${d.todayAmount}亿（均值${amountRatio}倍）。市场极度低迷，做多需极度谨慎。`,
      advice: `建议空仓观望，等待涨停家数连续2日回升至均值以上再考虑介入。`,
    };
  if (temp < 40)
    return {
      temperature: temp,
      label: "弱势震荡",
      labelColor: "light-green",
      verdict: `上涨家数${riseRatio}%，成交${d.todayAmount}亿（均值${amountRatio}倍），涨停${d.limitUpCount}家，短线情绪退潮，高标股存补跌风险。`,
      advice: `控仓防守（建议仓位<30%），等待核心右侧放量信号出现。`,
    };
  if (temp < 60)
    return {
      temperature: temp,
      label: "平稳运行",
      labelColor: "gray",
      verdict: `上涨家数${riseRatio}%，成交${d.todayAmount}亿（均值${amountRatio}倍），市场量能平稳，无明显方向，结构性机会为主。`,
      advice: `聚焦强势板块龙头，轻仓参与（建议仓位30~50%），避免重仓押注。`,
    };
  if (temp < 80)
    return {
      temperature: temp,
      label: "情绪启动",
      labelColor: "light-red",
      verdict: `上涨家数${riseRatio}%，涨停${d.limitUpCount}家（均值${limitRatio}倍），成交${d.todayAmount}亿（均值${amountRatio}倍），量能放大，赚钱效应扩散，市场风险偏好提升。`,
      advice: `可适当提高仓位（建议50~70%），优先关注热点板块核心标的，顺势而为。`,
    };
  return {
    temperature: temp,
    label: "过热预警",
    labelColor: "deep-red",
    verdict: `全市场上涨家数${riseRatio}%，涨停${d.limitUpCount}家（均值${limitRatio}倍），成交${d.todayAmount}亿（均值${amountRatio}倍）。市场过热，高位追涨风险极大，涨停炸板率上升。`,
    advice: `严格控仓（建议仓位<20%），以止盈减仓为主，不追高，等待情绪降温后再布局。`,
  };
}

export function buildMood(raw: MarketRaw): MarketMood {
  const temp = calcTemperature(raw);
  const t = genTempText(temp, raw);
  return {
    raw,
    temperature: t.temperature,
    status: t.label,
    labelColor: t.labelColor,
    verdict: t.verdict,
    advice: t.advice,
    index: { name: raw.indexName, value: raw.indexValue, changePct: raw.indexChangePct },
  };
}

// === Mock 数据（按 PRD 字段补全） ===
export const MARKET_RAW: MarketRaw = {
  riseCount: 1820,
  fallCount: 2980,
  flatCount: 200,
  limitUpCount: 18,
  limitUpAvg60d: 32,
  todayAmount: 7240,
  avgAmount60d: 8650,
  indexChangePct: -0.05,
  indexName: "上证指数",
  indexValue: 3052.12,
};

// 温度因子明细（用于浮层展示）
export interface TempFactor {
  key: string;
  title: string;
  detail: string;
  score: number;
}

export function buildFactors(d: MarketRaw): TempFactor[] {
  const total = d.riseCount + d.fallCount + d.flatCount;
  const breadthScore = total > 0 ? (d.riseCount / total) * 100 : 50;
  const limitScore =
    d.limitUpAvg60d > 0
      ? Math.min((d.limitUpCount / d.limitUpAvg60d) * 50, 100)
      : Math.min(d.limitUpCount * 5, 100);
  const volScore =
    d.avgAmount60d > 0 ? Math.min((d.todayAmount / d.avgAmount60d) * 50, 100) : 50;
  const indexAdj = Math.max(-15, Math.min(15, d.indexChangePct * 4));
  return [
    {
      key: "breadth",
      title: "涨跌家数（宽度）",
      detail: `涨${d.riseCount} / 跌${d.fallCount} / 平${d.flatCount}`,
      score: Math.round(breadthScore),
    },
    {
      key: "limit",
      title: "涨停强度（热度）",
      detail: `涨停 ${d.limitUpCount} 家（60日均 ${d.limitUpAvg60d}）`,
      score: Math.round(limitScore),
    },
    {
      key: "vol",
      title: "成交额（活跃度）",
      detail: `${d.todayAmount}亿 / 60日均 ${d.avgAmount60d}亿`,
      score: Math.round(volScore),
    },
    {
      key: "index",
      title: "指数方向修正",
      detail: `${d.indexName} ${d.indexChangePct >= 0 ? "+" : ""}${d.indexChangePct.toFixed(2)}%`,
      score: Math.round(indexAdj),
    },
  ];
}

export const MARKET_MOOD: MarketMood = buildMood(MARKET_RAW);
