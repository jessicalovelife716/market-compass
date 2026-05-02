import type { DimensionResult, SectorAnalysis, SectorSnapshot, TimelineNode } from "../types";
import { fmtPct } from "../templates";

export function analyzeSector(snap: SectorSnapshot): SectorAnalysis {
  const m = snap.meta;
  const turnoverShrink = snap.turnoverAvg5 > 0 ? (snap.turnover5d.at(-1)! - snap.turnoverAvg5) / snap.turnoverAvg5 : 0;
  const leader = m.topStocks[0];
  const counter = m.topStocks.find((s) => s.changePct > 0);

  const verdict = {
    headline: `板块震荡调整，龙头分歧，短线谨慎`,
    summary: `${m.name}板块今日整体${fmtPct(m.changePct)}，板块内龙头${leader.name}跌幅较大，但${counter ? counter.name + "逆势上涨" : "其他个股表现一般"}，内部分歧明显。板块整体未见系统性风险，短线观察龙头能否稳住支撑位。`,
  };

  const trend: DimensionResult = {
    key: "trend",
    title: "板块趋势",
    status: "warn",
    statusLabel: "震荡",
    headline: `${m.name}板块近20日在同一区间内反复震荡，未能形成有效向上突破。`,
    evidence: [
      `板块近20日震荡，未突破前期高点，方向待定`,
      `子概念近5日走出独立行情，是板块内强势主线`,
      `板块今日${m.changePct < m.vsMarket ? "弱于" : "强于"}大盘，短线无明显催化剂`,
    ],
  };

  const flow: DimensionResult = {
    key: "flow",
    title: "资金流向",
    status: turnoverShrink < -0.1 ? "warn" : "neutral",
    statusLabel: turnoverShrink < -0.1 ? "流出" : "中性",
    headline: `今日板块整体量能 ${m.turnover}，较5日均值${turnoverShrink < 0 ? "萎缩" : "放大"}约 ${Math.abs(turnoverShrink * 100).toFixed(0)}%，大单资金小幅净流出。`,
    evidence: [
      `板块今日成交额 ${m.turnover}，较5日均值变化 ${(turnoverShrink * 100).toFixed(1)}%`,
      `大单资金小幅净流出，板块吸引力有所下降`,
      `资金向核心标的集中，内部分化明显`,
    ],
  };

  const leaders: DimensionResult = {
    key: "leaders",
    title: "龙头状态",
    status: "warn",
    statusLabel: "分歧",
    headline: `板块第一龙头${leader.name}今日跌幅(${fmtPct(leader.changePct)})明显大于板块均值(${fmtPct(m.changePct)})，龙头走弱通常预示板块整体承压。`,
    evidence: [
      `${leader.name} ${fmtPct(leader.changePct)}，跌幅远大于板块均值，龙头领跌`,
      counter ? `${counter.name} ${fmtPct(counter.changePct)} 逆势上涨，板块非系统性下跌` : `其他龙头未补位`,
      `龙头走弱但其他龙头补位，板块整体结构尚可`,
    ],
  };

  const macro: DimensionResult = {
    key: "macro",
    title: "宏观映射",
    status: "neutral",
    statusLabel: "中性",
    headline: `${m.name}板块与产业链景气度高度相关，近期暂无明显利空，子概念催化剂较为充分。`,
    evidence: [
      `产业链订单数据暂无明显利空消息`,
      `相关概念受 AI / 算力 / 新能源等需求驱动，短期催化剂充分`,
      `板块整体景气度仍待需求端数据进一步确认`,
    ],
  };

  const timeline: TimelineNode[] = [
    { when: "3天前", feature: "板块放量拉升，主线引领", body: `板块单日成交额放大约20%，主线相关标的集体走强，带动板块上涨。` },
    { when: "2天前", feature: "板块高位震荡，量能开始萎缩", body: `板块冲高回落，龙头小幅调整，前日巨量后缩量调整属正常节奏，但分歧开始出现。` },
    { when: "昨天", feature: "板块继续缩量整理，等待方向", body: `板块整体小幅收涨，多数个股横盘整理，市场等待新催化剂出现。` },
    { when: "今日 · 当前", feature: "板块量能再度萎缩，龙头出现分歧", body: `成交额 ${m.turnover}，整体${fmtPct(m.changePct)}。${leader.name}冲高受阻后领跌${fmtPct(leader.changePct)}，板块内部明显分化，短期方向不明朗。`, current: true },
  ];

  const outlook = `${m.name}板块经历3天前放量拉升后进入消化阶段，量能持续萎缩、龙头出现分歧是短期调整的典型特征。若明日板块量能能重新放大且龙头止跌企稳，则调整结束信号出现，主线有望再度活跃；若量能继续萎缩，则板块短期弱势格局延续，建议观望为主。`;

  return { meta: m, verdict, health: [trend, flow, leaders, macro], timeline, outlook };
}
