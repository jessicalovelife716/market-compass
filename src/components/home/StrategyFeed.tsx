import { useState, useEffect, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { STRATEGY_TABS, FEED_BY_TAB, type StrategyTab } from "@/data/radar";
import { STOCKS } from "@/data/stocks";
import { useWatchlist, type WatchSort } from "@/hooks/useWatchlist";
import { SectionTitle } from "@/components/SectionTitle";
import { BullBearBadge } from "@/components/BullBearBadge";
import { PriceChange } from "@/components/PriceChange";
import { analyzeCard, type CardAnalysis } from "@/engine/rules/card";
import { cn } from "@/lib/utils";
import { Search, StarOff, Trash2, ArrowUpDown, Clock } from "lucide-react";

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
  const { sort, setSort, remove } = useWatchlist();

  if (tabKey === "watchlist") {
    if (watchlist.length === 0) {
      return (
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
      );
    }
    return (
      <WatchlistView
        watchlist={watchlist}
        sort={sort}
        setSort={setSort}
        remove={(c) => {
          remove(c);
          toast.success("已移出自选");
        }}
        onClickStock={onClickStock}
      />
    );
  }

  // 引擎策略池：根据 mock pool 计算
  const items = FEED_BY_TAB[tabKey];
  return <List codes={items.map((it) => it.code)} onClickStock={onClickStock} />;
}

function WatchlistView({
  watchlist,
  sort,
  setSort,
  remove,
  onClickStock,
}: {
  watchlist: string[];
  sort: WatchSort;
  setSort: (s: WatchSort) => void;
  remove: (code: string) => void;
  onClickStock: (code: string) => void;
}) {
  const sorted = useMemo(() => {
    const enriched = watchlist.map((code) => {
      const stock = STOCKS[code];
      const last = stock?.candles.at(-1);
      const prev = stock?.candles.at(-2);
      const pct = last && prev ? ((last.close - prev.close) / prev.close) * 100 : 0;
      return { code, pct };
    });
    if (sort === "change_desc") return [...enriched].sort((a, b) => b.pct - a.pct);
    if (sort === "change_asc") return [...enriched].sort((a, b) => a.pct - b.pct);
    return enriched.slice().reverse(); // added_desc：最近添加的在前
  }, [watchlist, sort]);

  const SORT_OPTS: { key: WatchSort; label: string; icon: React.ReactNode }[] = [
    { key: "added_desc", label: "最近添加", icon: <Clock size={11} /> },
    { key: "change_desc", label: "涨幅↓", icon: <ArrowUpDown size={11} /> },
    { key: "change_asc", label: "跌幅↓", icon: <ArrowUpDown size={11} /> },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end gap-1">
        {SORT_OPTS.map((o) => (
          <button
            key={o.key}
            onClick={() => setSort(o.key)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] transition-colors",
              sort === o.key ? "bg-brand/15 text-brand" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>
      <List codes={sorted.map((s) => s.code)} onClickStock={onClickStock} onRemove={remove} />
    </div>
  );
}

function List({
  codes,
  onClickStock,
  onRemove,
}: {
  codes: string[];
  onClickStock: (code: string) => void;
  onRemove?: (code: string) => void;
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
            onRemove={onRemove ? () => onRemove(code) : undefined}
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
  onRemove,
}: {
  code: string;
  name: string;
  sectorName: string;
  analysis: CardAnalysis;
  onClick: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="surface-card flex w-full flex-col gap-2 rounded-xl border border-border p-3 text-left transition-colors hover:border-brand/40"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-foreground truncate max-w-[8em]">{name}</span>
              <span className="num text-[11px] text-muted-foreground">{code}</span>
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground truncate">{sectorName}</div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {analysis.conclusionTags.map((t, i) => (
                <span
                  key={i}
                  className={cn("inline-flex h-5 items-center rounded-full px-2 text-[11px] font-medium leading-none", STYLE_TO_BADGE[t.style])}
                >
                  {t.text}
                </span>
              ))}
              {analysis.keyPrice && (
                <span className="num inline-flex h-5 items-center rounded-full border border-border bg-muted px-2 text-[11px] font-medium leading-none text-muted-foreground">
                  {analysis.keyPrice.label}: {analysis.keyPrice.value}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <PriceChange value={analysis.close} pct={analysis.changePct} />
          </div>
        </div>
        {analysis.signalTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {analysis.signalTags.map((s, i) => (
              <span
                key={i}
                className="inline-flex h-[18px] items-center rounded bg-surface-2 px-1.5 text-[10px] leading-none text-muted-foreground"
              >
                # {s}
              </span>
            ))}
          </div>
        )}
        <p className="line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">{analysis.verdictOneLine}</p>
      </button>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="移出自选"
          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground/70 hover:bg-bear/10 hover:text-bear"
        >
          <Trash2 size={14} strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}

// 保留导出兼容
export { BullBearBadge };
