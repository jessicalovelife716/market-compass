export interface RadarItem {
  code: string;
  name: string;
  tags: string[];
}

export const RADAR: RadarItem[] = [
  { code: "300394", name: "天孚通信", tags: ["主升突破", "量比2.5"] },
  { code: "300750", name: "宁德时代", tags: ["W底雏形", "外资流入"] },
  { code: "dkjj", name: "固态电池板块", tags: ["板块超跌", "MACD底背离"] },
  { code: "300433", name: "蓝思科技", tags: ["弱势抗跌", "均线金叉"] },
];

export type StrategyTab = "watchlist" | "inflow" | "volume" | "macd";

export const STRATEGY_TABS: { key: StrategyTab; label: string }[] = [
  { key: "watchlist", label: "自选" },
  { key: "inflow", label: "主力流入TOP10" },
  { key: "volume", label: "放量TOP10" },
  { key: "macd", label: "MACD金叉" },
];

// 引擎精选池（按 tab → 股票代码 + 一句点评 + 多空标签）
export interface FeedItem {
  code: string;
  midLabel: string;
  shortLabel: string;
  comment: string;
  defenseLabel: string;
  defenseValue: number;
}

export const FEED_BY_TAB: Record<StrategyTab, FeedItem[]> = {
  watchlist: [],
  inflow: [
    { code: "002475", midLabel: "中线偏多", shortLabel: "短线回避", comment: "冲前高失败收阴，短线上攻动能衰竭，警惕双顶。", defenseLabel: "支撑", defenseValue: 65.0 },
    { code: "300433", midLabel: "中短双多", shortLabel: "强势进攻", comment: "板块调整中逆势收阳，主力资金承接意愿极强，可逢低关注。", defenseLabel: "防守", defenseValue: 17.8 },
    { code: "002938", midLabel: "中线偏多", shortLabel: "短线稳健", comment: "苹果产业链核心标的，缩量企稳，资金暗中小幅布局。", defenseLabel: "防守", defenseValue: 27.9 },
    { code: "300207", midLabel: "中线震荡", shortLabel: "短线偏强", comment: "消费电子锂电分支回暖，低位企稳具备反弹潜力。", defenseLabel: "防守", defenseValue: 18.6 },
    { code: "002241", midLabel: "中线偏多", shortLabel: "短线观望", comment: "板块内高位震荡整理，筹码锁定良好，等待放量突破。", defenseLabel: "支撑", defenseValue: 23.5 },
  ],
  volume: [
    { code: "300394", midLabel: "中线强势", shortLabel: "短线进攻", comment: "放量突破前高，主升加速，量价齐升。", defenseLabel: "防守", defenseValue: 115 },
    { code: "300433", midLabel: "中短双多", shortLabel: "强势进攻", comment: "板块调整中逆势收阳，主力资金承接意愿极强。", defenseLabel: "防守", defenseValue: 17.8 },
    { code: "300750", midLabel: "中线偏多", shortLabel: "短线稳健", comment: "底部放量企稳，外资连续流入。", defenseLabel: "防守", defenseValue: 230 },
  ],
  macd: [
    { code: "300207", midLabel: "中线震荡", shortLabel: "短线偏强", comment: "MACD周线金叉，趋势拐点初现。", defenseLabel: "防守", defenseValue: 18.6 },
    { code: "00992", midLabel: "中线偏多", shortLabel: "短线观望", comment: "周线 MACD 接近金叉，观察确认。", defenseLabel: "防守", defenseValue: 10.5 },
  ],
};
