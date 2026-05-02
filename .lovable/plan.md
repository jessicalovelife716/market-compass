
# A 股策略分析工具 — 实施计划

构建移动端为主的 A 股策略分析原型，5 个页面 + 规则引擎驱动的文本拼装系统。视觉采用富途牛牛风格：深色专业、蓝/金/白配色、线性扁平 lucide 图标，完全不使用 emoji。

---

## 一、设计系统（富途风格）

在 `src/index.css` 与 `tailwind.config.ts` 中定义 HSL 语义 token：

**配色**
- `--background` 深黑 `#0a0e17`
- `--surface` / `--card` 深蓝灰 `#141a26`
- `--surface-2` 提升层 `#1c2333`
- `--border` 低对比分隔 `#222a3a`
- `--foreground` 纯白主文
- `--muted-foreground` 次级灰
- `--brand` 富途蓝 `#1a8cff`（主交互色）
- `--gold` 富途金 `#d4a84c`（强调/标签）
- `--bull` 涨红 `#e94560`
- `--bear` 跌绿 `#22c55e`
- `--neutral` 平盘灰
- `--warning` 黄、`--danger` 深红
- 渐变 token：`--gradient-temp`（绿→黄→红，温度计专用），`--gradient-brand`（蓝色微渐变）

**字体**
- 标题：Inter / 系统无衬线，字重 600
- 数字：等宽数字 tabular-nums（涨跌幅、价格、评分）
- 正文：Inter 14/13px

**形状与质感**
- 卡片圆角 12px、内边距 16px、底色 `--surface`、1px `--border` 描边、轻阴影
- Chip/Badge 圆角全圆、字号 11–12px
- 分隔线极细 1px `--border`
- 微面性图标背景：`bg-brand/10` 圆角方块衬底 + 蓝色线性 lucide 图标

**图标规范**
- 全部使用 `lucide-react`，`strokeWidth={1.75}`、size 16/18/20
- 维度图标：`Shapes`（形态）、`TrendingUp`（均线）、`BarChart3`（量价）、`Activity`（指标）、`AlertTriangle`（风险）、`Building2`（行业）
- 导航：`Home` / `Search`
- 其它：`Star/StarOff`（自选）、`ChevronRight`、`X`、`Clock`（历史）、`Flame`（热门/异动）、`ArrowUpRight/ArrowDownRight`（涨跌）

**约束**
- 组件内禁止写 `text-red-500`、`bg-[#xxx]` 等原始色，一律用 `text-bull/bear/brand/gold/foreground/muted-foreground` 等语义类
- 禁止使用任何 emoji 字符；所有"图标"位用 lucide 组件

---

## 二、路由（`src/App.tsx`）

- `/` 首页
- `/stock/:code` 个股详情
- `/sector/:id` 板块详情
- `/search` 搜索（基础态 + 输入态同页切换）
- `*` NotFound

底部固定导航 `BottomNav`，深色磨砂背景，仅 [首页 / 搜索] 两个 tab，激活态用 `--brand`。

---

## 三、规则引擎层（核心）

把"文本拼装规则引擎"做成纯函数模块，UI 只消费它的输出。即便首版数据是 mock，引擎仍按真实公式跑，方便后续替换数据源。

### 目录结构 `src/engine/`
```
engine/
  types.ts              # OHLCV、Indicators、StockSnapshot、SectorSnapshot 类型
  indicators.ts         # MA(5/10/20/60)、MACD(DIF/DEA/Hist)、KDJ、量比、乖离率
  patterns.ts           # W底识别、双顶、前高压力、极值点 FindPeaks
  rules/
    period.ts           # 中线/短线/超短 三周期评分 + MECE 状态
    health.ts           # 6大维度判定（形态/均线/量价/指标/风险/行业）
    timeline.ts         # 4 个 Anomaly Detector（巨量建仓/放量突破/缩量洗盘/冲高衰竭）
    verdict.ts          # 顶层裁决：标签 + 逻辑链路 + 操作建议
    sector.ts           # 板块 4 维体检（趋势/资金/龙头/宏观）
  templates.ts          # 占位符文本模板 + 渲染函数 render(template, vars)
  index.ts              # analyzeStock(snapshot)、analyzeSector(snapshot) 总入口
```

### 关键设计点
- 每条规则返回结构化对象 `{ status: 'healthy'|'warn'|'danger'|'bullish'|'bearish'|'neutral', headline: string, evidence: string[], data: {...} }`，UI 直接渲染，不做二次判断
- `templates.ts` 用 `{var}` 占位符 + `render(tpl, vars)` 简单实现（不引外部库）
- 所有阈值（量比 1.2 / 0.8、乖离率 -8%、Alpha ±2% 等）集中放 `engine/config.ts`，方便调参
- `analyzeStock` 输出供个股详情页一次消费的完整 ViewModel；`analyzeSector` 同理

---

## 四、Mock 数据 `src/data/`

- `marketMood.ts` — 大盘温度计（35℃/弱势震荡）+ 上证指数 + 引擎裁决 + 策略建议
- `sectors/` — 4 个板块（消费电子、CPO概念、低空经济、银行股）每个含：基础信息、成分股引用、3日 OHLCV、概念标签、统计
- `stocks/` — 立讯精密、蓝思科技、鹏鼎控股、欣旺达、歌尔股份等含 60+ 日 OHLCV 真实形态（构造一个 W 底 + 冲高衰竭走势，喂给引擎能跑出文档里的全部论据）
- `radar.ts` — 引擎异动雷达 / 主力流入TOP10 / 放量TOP10 / MACD金叉 列表
- `pinyin.ts` — 名称→拼音首字母映射（用于搜索 "lx"→立讯）

数据全部 TS 强类型，`engine.analyzeStock(stocks.lixun)` 即可得到详情页全部内容。

---

## 五、自选股（localStorage）

`src/hooks/useWatchlist.ts`
- key: `watchlist` 存 string[] 股票代码
- API: `list / add(code) / remove(code) / has(code) / toggle(code)`
- 用 `useSyncExternalStore` + `storage` 事件保持跨页一致

`src/hooks/useSearchHistory.ts` 同模式管理搜索历史。

---

## 六、页面与组件

### 1. 首页 `src/pages/Index.tsx`
- `MoodThermometer`：35℃ 数字 + 渐变温度条（基于 `--gradient-temp`）+ 状态徽章 + 上证指数行情 + 引擎裁决文本块 + 策略建议卡
- `SectorHeatmap`：2×2 网格 4 个板块卡，背景按涨跌幅深浅染色（红/绿不同 alpha），含板块名、涨跌、状态短语；点击跳板块详情
- `StrategyFeed`：embla-carousel 横向滑动 4 个 Tab（自选 / 主力流入TOP10 / 放量TOP10 / MACD金叉）
  - 顶部 chip 式 Tab，下方 list
  - 自选空态：`StarOff` 大图标 + "您还未添加任何观测标的" + 跳搜索 CTA
  - 个股行：名称代码、现价 + 涨跌（彩色 tabular-nums）、`BullBearBadge` 多空标签 chip、点评一句话、防守/支撑数字
  - 整行点击跳 `/stock/:code`

### 2. 个股详情页 `src/pages/StockDetail.tsx`
消费 `engine.analyzeStock(stock)`，结构：
- `StockHeader`：名称/代码/交易所/行业、市值/现价/涨跌、今日区间、PE；右上 `Star` 按钮（toggle 自选）
- `StrategyVerdict`：3 个标签 chip（中线偏多/短线谨慎/超短回避）+ 一段总论 + "逻辑链路" 横向流程（4 个节点用 `→` 连接）
- `PeriodTabs`：shadcn Tabs，3 个周期（中线·月 / 短线·周 / 超短·日），各自呈现：评分进度条、大形态、均线排列、MACD、主力阶段、操作建议
- `HealthReport`：6 大维度 = 6 个 `DimensionCard`（shadcn Accordion）
  - 收起态：图标方块 + 维度名 + 状态徽章 + 核心结论一句话
  - 展开态：4 条论据列表（圆点 + 文本）
  - 状态色：健康(brand) / 关注(warning) / 分歧(warning) / 警示(danger) / 强势(bull) / 偏多(bull)
- `Timeline3Day`：纵向时间轴 4 节点（3天前 / 2天前 / 昨天 / 今日·当前），每节点含特征名加粗 + 详细描述 + 关键数据；当前节点高亮 brand 色
- `OperationPlay`：操作推演卡，含核心防守线醒目数字
- 底部行业/概念标签 chips → 点击跳 `/sector/:id`
- `Disclaimer` 免责声明

### 3. 板块详情页 `src/pages/SectorDetail.tsx`
消费 `engine.analyzeSector(sector)`：
- `SectorHeader`：板块名、级别、个股数、成交额、涨跌（与大盘对比）、相关概念 chips
- `SectorHeatmapDetail`：板块成分股色块（按成交额排序，颜色按涨跌深浅 alpha）
- 统计行：上涨/下跌/涨停/跌停
- `SectorVerdict` 板块策略裁决
- `SectorHealth` 4 维 Accordion（趋势/资金/龙头/宏观映射）
- `SectorTimeline` 3日异动时间轴
- `SectorOutlook` 走势推演
- `SectorRanking` 涨幅前 5 榜单 → 点击跳个股详情
- `Disclaimer`

### 4. 搜索页 `src/pages/Search.tsx`
单页两态：
- **基础态**（input 为空）：
  - 顶部 search Input + "取消" 文本按钮
  - 历史搜索 chips（带清空）
  - "引擎异动雷达" 列表，每行带策略 chips（如 [主升突破][量比2.5]），点击跳详情
- **输入态**（input 非空）：
  - 主体替换为候选列表，按代码/名称/拼音首字母模糊匹配 mock
  - 每项：名称(代码) - 板块 + 多空标签 + 右侧 [加自选/取消自选] 按钮（点击只 toggle 不跳转）
  - 整行其它区域点击跳详情，并写入历史搜索

### 5. NotFound — 沿用现有

---

## 七、共用组件 `src/components/`

```
BottomNav.tsx           # 底部导航（Home / Search）
BullBearBadge.tsx       # 多空标签 chip（中线偏多/短线回避 等 9 种状态色映射）
PriceChange.tsx         # 价格 + 涨跌幅，自动 bull/bear 着色，tabular-nums
StatusBadge.tsx         # 维度状态徽章（健康/关注/分歧/警示/强势）
DimensionCard.tsx       # 体检维度可展开卡（Accordion 单实例封装）
Timeline.tsx            # 纵向时间轴通用容器
SectionTitle.tsx        # 区块标题（小标题 + 可选副标）
Disclaimer.tsx          # 免责声明
StockListItem.tsx       # 个股精选流的行
SectorTile.tsx          # 主力资金热力图板块色块
RatingBar.tsx           # 0-100 评分进度条（带阈值色）
LogicChain.tsx          # 逻辑链路横向节点（→ 连接）
IconTile.tsx            # 微面性图标方块（bg-brand/10 + lucide）
```

---

## 八、交互细节

- **滑动切换**：首页 StrategyFeed 用 embla-carousel-react 横向滑动 + Tabs 同步高亮
- **Tab 切换**：个股周期 Tabs 用 shadcn Tabs，切换无加载延迟
- **展开收起**：6 大维度用 shadcn Accordion `type="multiple"`
- **搜索联动**：input `onChange` 实时过滤，>=1 字符切换为候选态
- **标签跳转**：所有 chip 用 `<Link>` 包裹
- **空状态**：自选为空、搜索无结果都给友好引导
- **路由切换**：底部导航高亮 + 顶部页面标题更新

---

## 九、文件清单（新增/修改）

```
src/
  index.css                          # 扩展富途风格深色 token
  tailwind.config.ts                 # brand/gold/bull/bear/surface 颜色
  App.tsx                            # 加 3 个新路由
  engine/
    types.ts indicators.ts patterns.ts templates.ts config.ts index.ts
    rules/{period,health,timeline,verdict,sector}.ts
  data/
    marketMood.ts radar.ts pinyin.ts
    stocks/{index,lixun,languan,pengding,xinwangda,geer}.ts
    sectors/{index,xfdz,cpo,dkjj,yhg}.ts
  hooks/{useWatchlist,useSearchHistory}.ts
  components/
    BottomNav.tsx BullBearBadge.tsx PriceChange.tsx StatusBadge.tsx
    DimensionCard.tsx Timeline.tsx SectionTitle.tsx Disclaimer.tsx
    StockListItem.tsx SectorTile.tsx RatingBar.tsx LogicChain.tsx IconTile.tsx
    home/{MoodThermometer,SectorHeatmap,StrategyFeed}.tsx
    stock/{StockHeader,StrategyVerdict,PeriodTabs,HealthReport,Timeline3Day,OperationPlay}.tsx
    sector/{SectorHeader,SectorHeatmapDetail,SectorVerdict,SectorHealth,SectorTimeline,SectorOutlook,SectorRanking}.tsx
    search/{SearchInput,RadarList,HistoryChips,CandidateList}.tsx
  pages/
    Index.tsx StockDetail.tsx SectorDetail.tsx Search.tsx
```

---

## 十、实施顺序

1. 设计系统 token + tailwind 配置 + 通用组件骨架（BottomNav / 徽章 / IconTile / RatingBar / Timeline）
2. 引擎层：types + indicators + patterns + 4 个 rules + templates + 总入口
3. Mock 数据（构造能跑出文档示例论据的 OHLCV 序列）+ useWatchlist / useSearchHistory
4. 首页（温度计 / 热力图 / 策略精选流）+ 路由
5. 个股详情页（消费引擎 ViewModel，全部 6 维度 + 时间轴 + 推演）
6. 板块详情页
7. 搜索页（双态 + 拼音匹配 + 雷达）
8. 全链路跳转联调，逐页用浏览器预览核对布局/字号/留白/图标，确保富途级精致度
