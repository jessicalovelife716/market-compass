// Engine thresholds — centralize for easy tuning.

export const ENGINE_CONFIG = {
  vol: {
    expand: 1.2, // 量比 > 此值视为放量
    shrink: 0.8, // 量比 < 此值视为缩量
    bigBreakout: 1.5,
    massBuyIn: 2.0,
  },
  bias: {
    oversold: -8, // 5日乖离率 < -8%
  },
  alpha: {
    weak: -2, // Alpha < -2% 个股弱于板块
    strong: 2,
  },
  pattern: {
    wBottomTolerance: 0.03, // 双底两点差距 <3%
  },
  scoreBands: {
    bullishConfirmed: 80,
    bullishLeaning: 60,
    bearishLeaning: 40,
  },
};
