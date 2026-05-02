import type { Indicators, OHLCV, TimelineNode } from "../types";
import { ENGINE_CONFIG } from "../config";
import { fmtNum } from "../templates";

// 4 个 Anomaly Detector，对最近 4 天 K 线打标。
export function buildTimeline(candles: OHLCV[], ind: Indicators): TimelineNode[] {
  const labels = ["3天前", "2天前", "昨天", "今日 · 当前"];
  const last4 = candles.slice(-4);
  const result: TimelineNode[] = [];

  last4.forEach((c, i) => {
    const idx = candles.length - 4 + i;
    const prev = candles[idx - 1];
    const slice5 = candles.slice(Math.max(0, idx - 5), idx);
    const avgVol5 = slice5.reduce((s, x) => s + x.volume, 0) / Math.max(slice5.length, 1);
    const ratio = avgVol5 > 0 ? c.volume / avgVol5 : 1;
    const changePct = prev ? ((c.close - prev.close) / prev.close) * 100 : 0;
    const isLast = i === last4.length - 1;
    const window10 = candles.slice(Math.max(0, idx - 10), idx + 1);
    const high10 = Math.max(...window10.map((x) => x.high));

    let feature = "";
    let body = "";

    // 捕捉器 4：冲高回落衰竭
    if (c.high === high10 && changePct < -1 && ratio < ENGINE_CONFIG.vol.shrink) {
      feature = "放量滞涨！冲击前高失败，高开低走收阴线";
      body = `高开冲击 ${fmtNum(c.high)} 元后快速回落，收盘 ${fmtNum(c.close)} 元跌幅 ${changePct.toFixed(2)}%。关键异常：量能只有昨日的 ${prev ? Math.round((c.volume / prev.volume) * 100) : 100}%，高开无量+冲高回落，上攻动能明显衰竭。`;
    }
    // 捕捉器 1：放量突破 MA20
    else if (prev && prev.close < ind.ma20 && c.close > ind.ma20 && ratio > ENGINE_CONFIG.vol.bigBreakout) {
      feature = "放量突破MA20，多头排列正式确立";
      body = `股价站上 MA20(${fmtNum(ind.ma20)} 元)，成交量温和放大，MA5上穿MA10形成金叉，均线开始向上发散。中线多头趋势正式确立，是本轮行情的关键突破节点。`;
    }
    // 捕捉器 2：巨量建仓
    else if (ratio > ENGINE_CONFIG.vol.massBuyIn && changePct > 3) {
      feature = "底部放巨量，资金大规模确认介入";
      body = `量比达 ${ratio.toFixed(1)}，成交量是近 5 日均量的 ${ratio.toFixed(1)} 倍，大阳线收盘。确立 W 底右底有效，主力资金初步建仓信号明确，是近期最关键的量能节点。`;
    }
    // 捕捉器 3：缩量洗盘
    else if (ratio < 0.7 && Math.abs(c.close - ind.ma10) / ind.ma10 < 0.02) {
      feature = "缩量回踩MA10，支撑测试通过";
      body = `股价回踩至 MA10(${fmtNum(ind.ma10)} 元) 附近，量能较前日萎缩，小阳线守住支撑。缩量回踩是正常的主力洗盘行为，理论上为后续上攻积蓄了力量。`;
    } else {
      feature = changePct >= 0 ? "正常上涨" : "小幅调整";
      body = `收盘 ${fmtNum(c.close)} 元，${changePct >= 0 ? "涨" : "跌"}幅 ${Math.abs(changePct).toFixed(2)}%，量比 ${ratio.toFixed(2)}。${changePct >= 0 ? "节奏正常。" : "属正常震荡。"}`;
    }

    result.push({ when: labels[i], feature, body, current: isLast });
  });

  return result;
}

export function timelineToChain(timeline: TimelineNode[]): string[] {
  return timeline.map((t) => t.feature.split("！")[0].split("，")[0]);
}
