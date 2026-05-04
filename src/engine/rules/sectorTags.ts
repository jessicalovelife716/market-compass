// 板块状态标签引擎（PRD 6.2）
export type TrendTagId =
  | "trend_acc"     // 趋势加速
  | "lead_strong"   // 强势领涨
  | "leader_split"  // 龙头分歧
  | "outflow"       // 资金流出
  | "ranging";      // 震荡整理

export type VolTagId = "burst" | "expand" | "shrink" | "normal";

export interface TrendTag {
  id: TrendTagId;
  text: string;
  color: "red" | "orange" | "green" | "gray";
}

export interface VolTag {
  id: VolTagId;
  text: string;
  color: "red" | "light-red" | "gray" | "orange";
}

export interface SectorState {
  sectorChangePct: number;
  sector5dChangePct: number;
  sectorAmount: number;
  sectorAmount5dAvg: number;
  topStockChangePct: number | null;
  marketMedianChangePct: number | null;
}

export function genTrendTag(s: SectorState): TrendTag {
  if (s.sector5dChangePct >= 5) return { id: "trend_acc", text: "趋势加速", color: "red" };
  if (
    s.marketMedianChangePct !== null &&
    s.sectorChangePct > s.marketMedianChangePct * 1.5 &&
    s.sectorChangePct > 0
  )
    return { id: "lead_strong", text: "强势领涨", color: "red" };
  if (
    s.sectorChangePct > -1 &&
    s.topStockChangePct !== null &&
    s.topStockChangePct < s.sectorChangePct - 2
  )
    return { id: "leader_split", text: "龙头分歧", color: "orange" };
  if (s.sectorChangePct <= -2) return { id: "outflow", text: "资金流出", color: "green" };
  return { id: "ranging", text: "震荡整理", color: "gray" };
}

export function genVolTag(s: SectorState): VolTag | null {
  if (s.sectorAmount5dAvg <= 0) return null;
  const ratio = s.sectorAmount / s.sectorAmount5dAvg;
  if (ratio >= 1.8) return { id: "burst", text: "爆量", color: "red" };
  if (ratio >= 1.3) return { id: "expand", text: "放量", color: "light-red" };
  if (ratio <= 0.6) return { id: "shrink", text: "缩量", color: "gray" };
  return null;
}

// 混合态修正（PRD 6.2 组合 A-F）
export function applyMixedState(
  trend: TrendTag,
  vol: VolTag | null,
  s: SectorState,
): { trend: TrendTag; vol: VolTag | null } {
  // E：任意趋势 + 放量/爆量，但板块涨跌接近 0
  if (
    vol &&
    (vol.id === "burst" || vol.id === "expand") &&
    Math.abs(s.sectorChangePct) < 0.5
  ) {
    return {
      trend: { id: "ranging", text: "量价背离", color: "orange" },
      vol,
    };
  }
  // B：趋势加速 + 缩量
  if (trend.id === "trend_acc" && vol?.id === "shrink") {
    return { trend, vol: { ...vol, color: "orange" } };
  }
  // D：龙头分歧 + 缩量
  if (trend.id === "leader_split" && vol?.id === "shrink") {
    return { trend, vol: { ...vol, color: "orange" } };
  }
  return { trend, vol };
}
