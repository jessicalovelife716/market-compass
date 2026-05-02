import type { DimensionResult, Indicators, OHLCV, StockMeta } from "../types";
import { detectWBottom, priorPeak } from "../patterns";
import { ENGINE_CONFIG } from "../config";
import { fmtNum, fmtPct } from "../templates";

interface Ctx {
  candles: OHLCV[];
  ind: Indicators;
  meta: StockMeta;
  sectorChangePct: number; // 板块涨跌幅
}

export function buildHealth(ctx: Ctx): DimensionResult[] {
  const { candles, ind, meta, sectorChangePct } = ctx;
  const last = candles.at(-1)!;
  const prev = candles.at(-2)!;
  const w = detectWBottom(candles);
  const peak = priorPeak(candles);
  const stockChangePct = ((last.close - prev.close) / prev.close) * 100;
  const alpha = stockChangePct - sectorChangePct;

  // 1. 形态
  const shape: DimensionResult = w.detected
    ? {
        key: "shape",
        title: "形态结构",
        status: "healthy",
        statusLabel: "健康",
        headline: `W底反转形态完整，从${fmtNum((w.v1! + w.v2!) / 2)}元双底回升至${fmtNum(last.close)}元，颈线突破有效。`,
        evidence: [
          `双底低点 ${fmtNum(w.v1!)} / ${fmtNum(w.v2!)} 元，两次相差不超过3%，W底结构成立`,
          `颈线突破后站稳，已反弹 ${(((last.close - Math.min(w.v1!, w.v2!)) / Math.min(w.v1!, w.v2!)) * 100).toFixed(0)}%，形态目标 ${fmtNum(w.priorHigh!)} 元`,
          `MA5＞MA10＞MA20＞MA60，多头排列，均线角度向上`,
          last.close < ind.ma5 ? `今日收盘跌破MA5，若持续则多头排列面临短线考验` : `今日仍站稳MA5上方，结构无碍`,
        ],
      }
    : {
        key: "shape",
        title: "形态结构",
        status: "warn",
        statusLabel: "震荡",
        headline: `近期未形成明确反转形态，处于震荡格局。`,
        evidence: [`未识别到 W 底/三重底等明确反转结构`, `观察后续是否突破近期高点 ${fmtNum(peak)}`],
      };

  // 2. 均线
  const maStatus =
    last.close > ind.ma5 && ind.ma5 > ind.ma10 && ind.ma10 > ind.ma20
      ? "healthy"
      : last.close > ind.ma10
      ? "warn"
      : "danger";
  const ma: DimensionResult = {
    key: "ma",
    title: "均线系统",
    status: maStatus,
    statusLabel: maStatus === "healthy" ? "健康" : maStatus === "warn" ? "关注" : "警示",
    headline:
      maStatus === "healthy"
        ? `多头排列，短中期支撑扎实，均线方向向上。`
        : maStatus === "warn"
        ? `中长期均线（MA20=${fmtNum(ind.ma20)}）同向上翘，支撑扎实。但短期 MA5(${fmtNum(ind.ma5)}) 已在当前价上方，需 1~2 日内收复。`
        : `中期防线失守，趋势短期转弱。`,
    evidence: [
      `MA20=${fmtNum(ind.ma20)}，长周期均线方向${ind.ma20 > ind.ma60 ? "向上" : "向下"}`,
      `MA5=${fmtNum(ind.ma5)} ${ind.ma5 > last.close ? "高于" : "低于"}当前价 ${fmtNum(last.close)}`,
      `MA10=${fmtNum(ind.ma10)}，是今日最近一道支撑`,
      `跌破 MA10 后，下一支撑看 MA15(${fmtNum(ind.ma15)} 元)`,
    ],
  };

  // 3. 量价
  const volExpand = ind.volRatio > ENGINE_CONFIG.vol.expand;
  const volShrink = ind.volRatio < ENGINE_CONFIG.vol.shrink;
  const up = last.close >= prev.close;
  let volStatus: DimensionResult["status"] = "neutral";
  let volLine = "";
  if (volExpand && up) {
    volStatus = "healthy";
    volLine = "近期整体上涨伴随放量，主力资金参与迹象明确。";
  } else if (volShrink && up) {
    volStatus = "warn";
    volLine = "无量空涨，筹码锁定良好但追高意愿不足。";
  } else if (volExpand && !up) {
    volStatus = "danger";
    volLine = "放量杀跌，主力资金出逃迹象明显。";
  } else if (volShrink && !up) {
    volStatus = "warn";
    volLine = "量价背离：高开低走叠加缩量，短线上攻动能衰竭。";
  } else {
    volStatus = "neutral";
    volLine = "量价配合一般，方向未明。";
  }
  const vol: DimensionResult = {
    key: "vol",
    title: "量价关系",
    status: volStatus,
    statusLabel: volStatus === "healthy" ? "健康" : volStatus === "warn" ? "分歧" : volStatus === "danger" ? "警示" : "中性",
    headline: volLine,
    evidence: [
      `近期整体上涨伴随放量，主力资金参与迹象明确`,
      `今日量 ${fmtNum(last.volume)} 万手，5日均量 ${fmtNum(ind.vol5)} 万手，量比 ${fmtNum(ind.volRatio)}`,
      `${last.open > prev.close ? "高开" : "低开"}${last.close < last.open ? "低走" : "高走"} + ${volShrink ? "缩量" : volExpand ? "放量" : "平量"}`,
      `若明日继续缩量下跌，需警惕短期顶部已经形成`,
    ],
  };

  // 4. 技术指标
  const ind4Status: DimensionResult["status"] = ind.dif > ind.dea ? "bullish" : "warn";
  const tech: DimensionResult = {
    key: "tech",
    title: "技术指标",
    status: ind4Status,
    statusLabel: ind4Status === "bullish" ? "偏多" : "关注",
    headline: `MACD整体处于${ind.macd > 0 ? "多头" : "空头"}区域，红柱${ind.macd > 0 ? "为正" : "为负"}，上涨动能${ind.macd > 0 ? "尚在" : "不足"}。`,
    evidence: [
      `DIF=${fmtNum(ind.dif)} ${ind.dif > ind.dea ? "＞" : "＜"} DEA=${fmtNum(ind.dea)}，MACD柱=${fmtNum(ind.macd)}`,
      `KDJ：K=${fmtNum(ind.kdjK)} D=${fmtNum(ind.kdjD)} J=${fmtNum(ind.kdjJ)}${ind.kdjD > 80 ? "，进入超买" : "，未达超买"}`,
      `DIF 与 DEA 差距 ${fmtNum(Math.abs(ind.dif - ind.dea))}，${Math.abs(ind.dif - ind.dea) < 0.6 ? "已收窄，死叉雏形已现" : "尚有距离"}`,
      `MACD 数值偏高，短期回调后确认方向再加仓更稳妥`,
    ],
  };

  // 5. 风险雷区
  const nearPeak = peak > 0 && (peak - last.high) / peak < 0.03;
  const reversalCandle = last.close < last.open && (last.high - Math.max(last.open, last.close)) > Math.abs(last.close - last.open);
  const risky = nearPeak || reversalCandle;
  const risk: DimensionResult = {
    key: "risk",
    title: "风险雷区",
    status: risky ? "danger" : "neutral",
    statusLabel: risky ? "警示" : "可控",
    headline: risky
      ? `存在明确风险：前高 ${fmtNum(peak)} 元形成强阻力，今日盘中试探 ${fmtNum(last.high)} 即告失败；高开低走的阴线形态叠加缩量，若明日不能反包，双顶形态将大概率确认。`
      : `当前未触发明显风险信号。`,
    evidence: [
      `前高压力 ${fmtNum(peak)} 元，今日冲至 ${fmtNum(last.high)} 未能突破即回落`,
      `${reversalCandle ? "高开低走阴线 + 缩量，若明日不反包则双顶风险极大" : "K线形态尚可"}`,
      `关键防守位：${fmtNum(last.low)}（今日低点），破则下看 MA15(${fmtNum(ind.ma15)})`,
      `PE=${fmtNum(meta.pe)}，估值${meta.pe > 50 ? "偏高" : "中性"}，${meta.pe > 50 ? "需关注" : "非主要风险点"}`,
    ],
  };

  // 6. 行业板块
  const indStatus: DimensionResult["status"] = alpha > ENGINE_CONFIG.alpha.strong ? "strong" : alpha < ENGINE_CONFIG.alpha.weak ? "warn" : "neutral";
  const industry: DimensionResult = {
    key: "industry",
    title: "行业板块",
    status: indStatus,
    statusLabel: indStatus === "strong" ? "强势" : indStatus === "warn" ? "弱势" : "中性",
    headline:
      indStatus === "warn"
        ? `${meta.name}属${meta.industry}板块。今日板块整体${fmtPct(sectorChangePct)}，个股${fmtPct(stockChangePct)}，跌幅明显大于板块均值，存在个股超跌迹象。`
        : indStatus === "strong"
        ? `逆势走强，跑赢板块${fmtNum(alpha)}个百分点，具备龙头气质。`
        : `走势与板块同步，跟随板块节奏。`,
    evidence: [
      `${meta.industry}今日 ${fmtPct(sectorChangePct)}，个股 ${fmtPct(stockChangePct)}，Alpha = ${fmtPct(alpha)}`,
      `所属概念：${meta.concepts.map((c) => c.name).join(" / ")}`,
      `板块内今日多数个股小幅调整，并非板块性系统风险`,
      `若明日板块继续走弱，个股反弹难度加大`,
    ],
  };

  return [shape, ma, vol, tech, risk, industry];
}
