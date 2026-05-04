import { useState, useEffect, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useNavigate, Link } from "react-router-dom";
import { STRATEGY_TABS, FEED_BY_TAB, type StrategyTab } from "@/data/radar";
import { STOCKS } from "@/data/stocks";
import { useWatchlist, type WatchSortState, type SortField } from "@/hooks/useWatchlist";
import { SectionTitle } from "@/components/SectionTitle";
import { BullBearBadge } from "@/components/BullBearBadge";
import { PriceChange } from "@/components/PriceChange";
import { analyzeCard, type CardAnalysis } from "@/engine/rules/card";
import { cn } from "@/lib/utils";
import { Search, StarOff } from "lucide-react";

export function StrategyFeed() {
  const navigate = useNavigate();
  const { list: watchlist } = useWatchlist();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start" });
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSel = () => setActive(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSel);
    return () => {
      emblaApi.off("select", onSel);
    };
  }, [emblaApi]);

  const goTo = (i: number) => {
    setActive(i);
    emblaApi?.scrollTo(i);
  };

  return (
    <section>
      <SectionTitle title="策略精选" subtitle="左右滑动切换不同策略" />
      <div className="-mx-4 mb-3 flex items-center gap-2 overflow-x-auto px-4 scrollbar-none">
        {STRATEGY_TABS.map((t, i) => (
          <button
            key={t.key}
            onClick={() => goTo(i)}
            className={cn(
              "h-7 shrink-0 rounded-full px-3 text-[12px] font-medium transition-colors",
              active === i
                ? "bg-brand text-brand-foreground"
                : "bg-surface-2 text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {STRATEGY_TABS.map((tab) => (
            <div key={tab.key} className="min-w-0 flex-[0_0_100%]">
              <FeedList tabKey={tab.key} watchlist={watchlist} onClickStock={(c) => navigate(`/stock/${c}`)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeedList({
  tabKey,
  watchlist,
  onClickStock,
}: {
  tabKey: StrategyTab;
  watchlist: string[];
  onClickStock: (code: string) => void;
}) {
  const { sort, cycleSort } = useWatchlist();

  if (tabKey === "watchlist") {
    return (
      <WatchlistView
        watchlist={watchlist}
        sort={sort}
        cycleSort={cycleSort}
        onClickStock={onClickStock}
      />
    );
  }

  // 引擎策略池
  const items = FEED_BY_TAB[tabKey];
  return <List codes={items.map((it) => it.code)} onClickStock={onClickStock} />;
}

interface EnrichedRow {
  code: string;
  pct: number;
  price: number;
  hasData: boolean;
}

function WatchlistView({
  watchlist,
  sort,
  cycleSort,
  onClickStock,
}: {
  watchlist: string[];
  sort: WatchSortState;
  cycleSort: (f: Exclude<SortField, "default">) => void;
  onClickStock: (code: string) => void;
}) {
  const sorted = useMemo<EnrichedRow[]>(() => {
    const enriched: EnrichedRow[] = watchlist.map((code) => {
      const stock = STOCKS[code];
      const last = stock?.candles.at(-1);
      const prev = stock?.candles.at(-2);
      const has = !!last && !!prev;
      const price = last?.close ?? 0;
      const pct = has ? ((last!.close - prev!.close) / prev!.close) * 100 : 0;
      return { code, pct, price, hasData: has };
    });
    if (sort.field === "default" || sort.order === "default") {
      // 最近添加在前
      return enriched.slice().reverse();
    }
    const dir = sort.order === "desc" ? -1 : 1;
    const key = sort.field === "changePct" ? ("pct" as const) : ("price" as const);
    return [...enriched].sort((a, b) => {
      // 缺数据的固定排在最后
      if (!a.hasData && b.hasData) return 1;
      if (a.hasData && !b.hasData) return -1;
      if (!a.hasData && !b.hasData) return 0;
      return (a[key] - b[key]) * dir;
    });
  }, [watchlist, sort]);

  const isEmpty = watchlist.length === 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-muted-foreground">自选（{watchlist.length}只）</span>
        <div className="flex items-center gap-3">
          <SortButton
            label="涨跌幅"
            active={sort.field === "changePct"}
            order={sort.field === "changePct" ? sort.order : "default"}
            onClick={() => cycleSort("changePct")}
          />
          <SortButton
            label="现价"
            active={sort.field === "price"}
            order={sort.field === "price" ? sort.order : "default"}
            onClick={() => cycleSort("price")}
          />
        </div>
      </div>
      {isEmpty ? (
        <div className="surface-card flex flex-col items-center gap-3 rounded-xl border border-border px-6 py-10 text-center">
          <StarOff size={28} strokeWidth={1.75} className="text-muted-foreground" />
          <p className="text-[13px] text-muted-foreground">您还未添加任何观测标的</p>
          <Link
            to="/search"
            className="inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1.5 text-[12px] font-medium text-brand-foreground"
          >
            <Search size={14} strokeWidth={1.75} /> 搜索并添加
          </Link>
          <p className="text-[11px] text-muted-foreground/80">或向右滑动查看引擎精选池</p>
        </div>
      ) : (
        <List codes={sorted.map((s) => s.code)} onClickStock={onClickStock} />
      )}
    </div>
  );
}

function SortButton({
  label,
  active,
  order,
  onClick,
}: {
  label: string;
  active: boolean;
  order: "default" | "desc" | "asc";
  onClick: () => void;
}) {
  const upActive = active && order === "asc";
  const downActive = active && order === "desc";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 text-[12px] transition-colors",
        active ? "text-brand" : "text-muted-foreground",
      )}
    >
      <span>{label}</span>
      <span className="flex flex-col leading-none">
        <span className={cn("text-[8px]", upActive ? "text-brand" : "text-muted-foreground/50")}>▲</span>
        <span className={cn("-mt-[1px] text-[8px]", downActive ? "text-brand" : "text-muted-foreground/50")}>▼</span>
      </span>
    </button>
  );
}

function List({
  codes,
  onClickStock,
}: {
  codes: string[];
  onClickStock: (code: string) => void;
}) {
  return (
    <div className="space-y-2">
      {codes.map((code) => {
        const stock = STOCKS[code];
        if (!stock) return null;
        const analysis = analyzeCard({ candles: stock.candles });
        if (!analysis) return null;
        return (
          <CardRow
            key={code}
            code={code}
            name={stock.meta.name}
            sectorName={stock.meta.industry}
            analysis={analysis}
            onClick={() => onClickStock(code)}
          />
        );
      })}
    </div>
  );
}

const STYLE_TO_BADGE: Record<string, string> = {
  bull: "bg-bull/15 text-bull border border-bull/30",
  bear: "bg-bear/15 text-bear border border-bear/30",
  warn: "bg-warning/15 text-warning border border-warning/30",
  neutral: "bg-muted text-muted-foreground border border-border",
};

function CardRow({
  code,
  name,
  sectorName,
  analysis,
  onClick,
}: {
  code: string;
  name: string;
  sectorName: string;
  analysis: CardAnalysis;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="surface-card flex w-full flex-col gap-1.5 rounded-xl border border-border p-3 text-left transition-colors hover:border-brand/40 active:bg-muted/40"
    >
      {/* Row1: 股票基础信息 */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="truncate max-w-[8em] text-[15px] font-semibold text-foreground">{name}</span>
            <span className="num text-[12px] text-muted-foreground">{code}</span>
          </div>
        </div>
        <PriceChange value={analysis.close} pct={analysis.changePct} />
      </div>

      {/* Row2: 结论标签 + keyPrice */}
      <div className="flex flex-wrap items-center gap-1.5">
        {analysis.conclusionTags.map((t, i) => (
          <span
            key={i}
            className={cn(
              "inline-flex h-5 items-center rounded-full px-2 text-[11px] font-medium leading-none",
              STYLE_TO_BADGE[t.style],
            )}
          >
            {t.text}
          </span>
        ))}
        {analysis.keyPrice && (
          <span
            className="num inline-flex h-5 items-center rounded-full px-2 text-[11px] font-medium leading-none"
            style={{ backgroundColor: "#f5f5f5", color: "#888888" }}
          >
            {analysis.keyPrice.label}: {analysis.keyPrice.value}
          </span>
        )}
      </div>

      {/* Row3: 信号标签（无信号则不渲染，不占位） */}
      {analysis.signalTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {analysis.signalTags.slice(0, 4).map((s, i) => (
            <span
              key={i}
              className="inline-flex h-[18px] items-center rounded bg-surface-2 px-1.5 text-[10px] leading-none text-muted-foreground"
            >
              # {s}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

// 保留导出兼容
export { BullBearBadge };
