import type { OHLCV, StockSnapshot } from "@/engine/types";

// 构造一段 70 日 K 线：高位 → 下跌 → W 底 → 突破 → 主升 → 今日冲高回落
function genCandles(opts: {
  start: number;
  bottom: number;
  rebound: number;
  todayHigh: number;
  todayClose: number;
  todayVol: number;
  prevVol: number;
}): OHLCV[] {
  const { start, bottom, rebound, todayHigh, todayClose, todayVol, prevVol } = opts;
  const n = 70;
  const candles: OHLCV[] = [];
  // 阶段 1: 高位回落 (0-15) start -> bottom*1.05
  // 阶段 2: 第一底 (16-22) bottom
  // 阶段 3: 中间反弹 (23-32) -> bottom*1.15
  // 阶段 4: 第二底 (33-39) bottom*1.005
  // 阶段 5: 突破上行 (40-65) -> rebound
  // 阶段 6: 最近 4 天 (66-69) 含今日异动

  const seed = (i: number) => Math.sin(i * 1.7) * 0.5 + Math.cos(i * 0.9) * 0.3;
  const dateStr = (i: number) => {
    const d = new Date(2025, 1, 1);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  };

  for (let i = 0; i < n; i++) {
    let close: number;
    let vol: number;
    if (i <= 15) {
      const t = i / 15;
      close = start + (bottom * 1.05 - start) * t + seed(i) * 0.3;
      vol = 150 + Math.abs(seed(i)) * 80;
    } else if (i <= 22) {
      close = bottom + Math.abs(seed(i)) * 0.4;
      vol = 130 + Math.abs(seed(i)) * 60;
    } else if (i <= 32) {
      const t = (i - 22) / 10;
      close = bottom * 1.05 + (bottom * 1.15 - bottom * 1.05) * t + seed(i) * 0.4;
      vol = 160 + Math.abs(seed(i)) * 80;
    } else if (i <= 39) {
      close = bottom * 1.005 + Math.abs(seed(i)) * 0.4;
      vol = 140 + Math.abs(seed(i)) * 60;
    } else if (i === 40) {
      // 巨量建仓 (这是 3 天前在更早时点, but 我们也确保 idx=66 处有触发)
      close = bottom * 1.07;
      vol = 480;
    } else if (i <= 65) {
      const t = (i - 40) / 25;
      close = bottom * 1.07 + (rebound - bottom * 1.07) * t + seed(i) * 0.5;
      vol = 180 + Math.abs(seed(i)) * 90;
    } else if (i === 66) {
      // 3 天前：底部放巨量
      close = rebound * 0.97;
      vol = 520;
    } else if (i === 67) {
      // 2 天前：放量突破 MA20
      close = rebound * 1.005;
      vol = 280;
    } else if (i === 68) {
      // 昨天：缩量回踩
      close = rebound * 1.0;
      vol = prevVol;
    } else {
      // 今日 i=69
      close = todayClose;
      vol = todayVol;
    }

    const open = i === n - 1 ? todayHigh - 0.3 : close - seed(i) * 0.2;
    const high = i === n - 1 ? todayHigh : Math.max(open, close) + Math.abs(seed(i)) * 0.4 + 0.2;
    const low = i === n - 1 ? Math.min(open, close) - 0.2 : Math.min(open, close) - Math.abs(seed(i)) * 0.3 - 0.2;

    candles.push({
      date: dateStr(i),
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume: +vol.toFixed(1),
    });
  }
  return candles;
}

const lixunCandles = genCandles({
  start: 73,
  bottom: 44,
  rebound: 67,
  todayHigh: 69.48,
  todayClose: 67.0,
  todayVol: 116.9,
  prevVol: 226.6,
});

const lansiCandles = genCandles({
  start: 22,
  bottom: 14,
  rebound: 18.3,
  todayHigh: 18.7,
  todayClose: 18.52,
  todayVol: 280,
  prevVol: 220,
});

const pengdingCandles = genCandles({
  start: 32,
  bottom: 22,
  rebound: 28.4,
  todayHigh: 28.9,
  todayClose: 28.65,
  todayVol: 180,
  prevVol: 195,
});

const xinwangdaCandles = genCandles({
  start: 23,
  bottom: 15,
  rebound: 19.2,
  todayHigh: 19.5,
  todayClose: 19.36,
  todayVol: 200,
  prevVol: 210,
});

const geerCandles = genCandles({
  start: 28,
  bottom: 18,
  rebound: 24.0,
  todayHigh: 24.5,
  todayClose: 24.18,
  todayVol: 160,
  prevVol: 170,
});

export const STOCKS: Record<string, StockSnapshot> = {
  "002475": {
    meta: {
      code: "002475",
      name: "立讯精密",
      exchange: "深交所",
      industry: "消费电子",
      industryId: "xfdz",
      concepts: [
        { id: "xfdz", name: "消费电子" },
        { id: "apple", name: "苹果产业链" },
        { id: "cpo", name: "CPO概念" },
        { id: "lj", name: "连接器" },
      ],
      marketCap: "4883亿",
      pe: 28.36,
      pinyin: "ljjm",
    },
    candles: lixunCandles,
  },
  "300433": {
    meta: {
      code: "300433",
      name: "蓝思科技",
      exchange: "深交所",
      industry: "消费电子",
      industryId: "xfdz",
      concepts: [
        { id: "xfdz", name: "消费电子" },
        { id: "apple", name: "苹果产业链" },
        { id: "fold", name: "折叠屏" },
      ],
      marketCap: "920亿",
      pe: 22.1,
      pinyin: "lskj",
    },
    candles: lansiCandles,
  },
  "002938": {
    meta: {
      code: "002938",
      name: "鹏鼎控股",
      exchange: "深交所",
      industry: "消费电子",
      industryId: "xfdz",
      concepts: [
        { id: "xfdz", name: "消费电子" },
        { id: "apple", name: "苹果产业链" },
      ],
      marketCap: "664亿",
      pe: 24.5,
      pinyin: "pdkg",
    },
    candles: pengdingCandles,
  },
  "300207": {
    meta: {
      code: "300207",
      name: "欣旺达",
      exchange: "深交所",
      industry: "消费电子",
      industryId: "xfdz",
      concepts: [
        { id: "xfdz", name: "消费电子" },
        { id: "battery", name: "锂电池" },
      ],
      marketCap: "362亿",
      pe: 31.2,
      pinyin: "xwd",
    },
    candles: xinwangdaCandles,
  },
  "002241": {
    meta: {
      code: "002241",
      name: "歌尔股份",
      exchange: "深交所",
      industry: "消费电子",
      industryId: "xfdz",
      concepts: [
        { id: "xfdz", name: "消费电子" },
        { id: "vr", name: "VR/AR" },
      ],
      marketCap: "830亿",
      pe: 35.8,
      pinyin: "ggf",
    },
    candles: geerCandles,
  },
  "300394": {
    meta: {
      code: "300394",
      name: "天孚通信",
      exchange: "深交所",
      industry: "CPO概念",
      industryId: "cpo",
      concepts: [
        { id: "cpo", name: "CPO概念" },
        { id: "optical", name: "光模块" },
      ],
      marketCap: "510亿",
      pe: 42.6,
      pinyin: "tftx",
    },
    candles: genCandles({
      start: 95,
      bottom: 70,
      rebound: 118,
      todayHigh: 122,
      todayClose: 121,
      todayVol: 320,
      prevVol: 200,
    }),
  },
  "300750": {
    meta: {
      code: "300750",
      name: "宁德时代",
      exchange: "深交所",
      industry: "电池",
      industryId: "battery",
      concepts: [
        { id: "battery", name: "锂电池" },
        { id: "newenergy", name: "新能源" },
      ],
      marketCap: "1.1万亿",
      pe: 26.3,
      pinyin: "ndsd",
    },
    candles: genCandles({
      start: 280,
      bottom: 180,
      rebound: 235,
      todayHigh: 240,
      todayClose: 238,
      todayVol: 260,
      prevVol: 220,
    }),
  },
  "00992": {
    meta: {
      code: "00992",
      name: "联想集团",
      exchange: "港交所",
      industry: "计算机设备",
      industryId: "computer",
      concepts: [{ id: "computer", name: "计算机设备" }],
      marketCap: "1280亿港元",
      pe: 14.2,
      pinyin: "lxjt",
    },
    candles: genCandles({
      start: 12,
      bottom: 8,
      rebound: 11,
      todayHigh: 11.3,
      todayClose: 11.1,
      todayVol: 180,
      prevVol: 170,
    }),
  },
  "300682": {
    meta: {
      code: "300682",
      name: "朗新集团",
      exchange: "深交所",
      industry: "软件开发",
      industryId: "software",
      concepts: [{ id: "software", name: "软件开发" }],
      marketCap: "168亿",
      pe: 28.9,
      pinyin: "lxjt",
    },
    candles: genCandles({
      start: 18,
      bottom: 12,
      rebound: 16,
      todayHigh: 16.4,
      todayClose: 16.2,
      todayVol: 140,
      prevVol: 150,
    }),
  },
  "600299": {
    meta: {
      code: "600299",
      name: "蓝星安迪苏",
      exchange: "上交所",
      industry: "农化制品",
      industryId: "chem",
      concepts: [{ id: "chem", name: "农化制品" }],
      marketCap: "210亿",
      pe: 19.5,
      pinyin: "lxads",
    },
    candles: genCandles({
      start: 9,
      bottom: 6,
      rebound: 8.2,
      todayHigh: 8.4,
      todayClose: 8.3,
      todayVol: 120,
      prevVol: 130,
    }),
  },
};

export const ALL_STOCKS = Object.values(STOCKS);
