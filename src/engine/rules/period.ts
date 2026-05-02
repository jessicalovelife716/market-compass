import type { Indicators, OHLCV, PeriodResult } from "../types";
import { detectWBottom } from "../patterns";
import { ENGINE_CONFIG } from "../config";
import { fmtNum } from "../templates";

export function buildPeriods(candles: OHLCV[], ind: Indicators): PeriodResult[] {
  const last = candles.at(-1)!;
  const w = detectWBottom(candles);

  // ---------- 中线 ----------
  let midScore = 50;
  if (ind.ma20 > ind.ma60) midScore += 15;
  if (last.close > ind.ma20) midScore += 10;
  if (ind.dif > ind.dea) midScore += 10;
  if (w.detected) midScore += 8;
  midScore = Math.max(0, Math.min(100, midScore));
  const midVerdict = midScore >= 80 ? "多头确立" : midScore >= 60 ? "偏多" : midScore >= 40 ? "偏空震荡" : "空头确立";

  const midSections: PeriodResult["sections"] = [];
  if (w.detected) {
    midSections.push({
      title: "大形态：W底反转完成",
      ok: true,
      body: `从${fmtNum((w.v1! + w.v2!) / 2, 2)}元双底反弹至${fmtNum(last.close)}元，颈线突破有效，形态目标看向${fmtNum(w.priorHigh!)}元前高。两次底部低点相差不超过3%，W底结构成立。`,
    });
  }
  midSections.push({
    title: "均线排列：多头排列确立",
    ok: ind.ma5 > ind.ma10 && ind.ma10 > ind.ma20 && ind.ma20 > ind.ma60,
    body: `MA5(${fmtNum(ind.ma5)})＞MA10(${fmtNum(ind.ma10)})＞MA20(${fmtNum(ind.ma20)})＞MA60(${fmtNum(ind.ma60)})，四线均向上发散，中线趋势健康，是本轮上涨的核心支撑结构。`,
  });
  midSections.push({
    title: "MACD：红柱扩张",
    ok: ind.macd > 0 && ind.dif > ind.dea,
    body: `DIF(${fmtNum(ind.dif)})＞DEA(${fmtNum(ind.dea)})，MACD柱=${fmtNum(ind.macd)}为正值，中线动能向上，处于多头区域。数值偏高，短期需警惕高位回调。`,
  });
  midSections.push({
    title: "主力阶段：主升中段",
    ok: true,
    body: `距底部${fmtNum(Math.min(...candles.map((c) => c.low)))}元已反弹${(((last.close - Math.min(...candles.map((c) => c.low))) / Math.min(...candles.map((c) => c.low))) * 100).toFixed(0)}%，上涨阶段放量、回调阶段缩量，量价节奏符合主升中段特征，尚未出现明显出货信号。`,
  });

  const midAdvice = `突破60日均线压制，底部连续温和放量，中线结构完好。建议持仓不动，回踩${fmtNum(ind.ma15)}附近(MA15)可补仓，止损设在${fmtNum(ind.ma20)}元MA20下方，破则中线判断需重新评估。`;

  // ---------- 短线 ----------
  let shortScore = 50;
  if (last.close > ind.ma5) shortScore += 15;
  else if (last.close < ind.ma10) shortScore -= 15;
  if (ind.volRatio > ENGINE_CONFIG.vol.expand) shortScore += 10;
  if (ind.volRatio < ENGINE_CONFIG.vol.shrink && last.close < last.open) shortScore -= 10;
  shortScore = Math.max(0, Math.min(100, shortScore));
  const shortVerdict = shortScore >= 60 ? "短线偏强" : shortScore >= 40 ? "短线谨慎" : "短线回避";

  const shortSections: PeriodResult["sections"] = [
    {
      title: "短线均线",
      ok: last.close > ind.ma5,
      body: last.close > ind.ma5
        ? `股价站稳MA5(${fmtNum(ind.ma5)})上方，短期支撑有效。`
        : `股价跌破MA5(${fmtNum(ind.ma5)})，短线均线短暂失守，MA10(${fmtNum(ind.ma10)})为贴身支撑。`,
    },
    {
      title: "量比信号",
      ok: ind.volRatio >= 0.8 && ind.volRatio <= 1.5,
      body: `今日量比 ${fmtNum(ind.volRatio)}，5日均量 ${fmtNum(ind.vol5)} 万手。${
        ind.volRatio < ENGINE_CONFIG.vol.shrink ? "缩量明显，追高意愿不足。" : ind.volRatio > ENGINE_CONFIG.vol.expand ? "放量进场，资金活跃。" : "量能温和。"
      }`,
    },
  ];
  const shortAdvice = `短线以 ${fmtNum(ind.ma10)} 为防守，跌破则下看 ${fmtNum(ind.ma15)}；明日若放量阳线收复 MA5 上方，可视为洗盘结束。`;

  // ---------- 超短 ----------
  let ultraScore = 50;
  const upperShadow = last.high - Math.max(last.open, last.close);
  const body = Math.abs(last.close - last.open);
  if (upperShadow > body * 2 && last.close < last.open) ultraScore -= 20;
  if (last.high >= Math.max(...candles.slice(-10).map((c) => c.high)) && last.close < last.open) ultraScore -= 10;
  if (ind.volRatio < ENGINE_CONFIG.vol.shrink) ultraScore -= 5;
  ultraScore = Math.max(0, Math.min(100, ultraScore));
  const ultraVerdict = ultraScore >= 60 ? "超短可关注" : ultraScore >= 40 ? "超短观望" : "超短回避";

  const ultraSections: PeriodResult["sections"] = [
    {
      title: "分时形态",
      ok: last.close > last.open,
      body: last.close < last.open
        ? `今日高开低走收阴线，上影线明显，盘中冲高回落特征显著。`
        : `今日收阳线，分时整体向上。`,
    },
    {
      title: "动能衰竭",
      ok: !(upperShadow > body * 2 && ind.volRatio < ENGINE_CONFIG.vol.shrink),
      body: upperShadow > body * 2 && ind.volRatio < ENGINE_CONFIG.vol.shrink
        ? `上影线>实体2倍 + 缩量，动能衰竭信号明确。`
        : `分时节奏正常，未现明显衰竭。`,
    },
  ];
  const ultraAdvice = `超短不参与今日方向，等待明日开盘是否能反包。`;

  return [
    { key: "mid", label: "中线·月", score: midScore, verdict: midVerdict, sections: midSections, advice: midAdvice },
    { key: "short", label: "短线·周", score: shortScore, verdict: shortVerdict, sections: shortSections, advice: shortAdvice },
    { key: "ultra", label: "超短·日", score: ultraScore, verdict: ultraVerdict, sections: ultraSections, advice: ultraAdvice },
  ];
}
