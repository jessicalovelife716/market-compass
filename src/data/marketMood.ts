export interface MarketMood {
  temperature: number;
  status: string;
  index: { name: string; value: number; changePct: number };
  verdict: string;
  advice: string;
}

export const MARKET_MOOD: MarketMood = {
  temperature: 35,
  status: "弱势震荡",
  index: { name: "上证指数", value: 3052.12, changePct: -0.05 },
  verdict: "缩量震荡，短线情绪退潮。主线CPO内部分歧，高标股存在补跌风险。",
  advice: "控仓防守（建议仓位<30%），等待核心右侧放量信号。",
};
