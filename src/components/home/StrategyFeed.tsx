import { useState, useRef, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useNavigate, Link } from "react-router-dom";
import { STRATEGY_TABS, FEED_BY_TAB, type StrategyTab } from "@/data/radar";
import { STOCKS } from "@/data/stocks";
import { useWatchlist } from "@/hooks/useWatchlist";
import { SectionTitle } from "@/components/SectionTitle";
import { BullBearBadge } from "@/components/BullBearBadge";
import { PriceChange } from "@/components/PriceChange";
import { cn } from "@/lib/utils";
import { Search, StarOff, ChevronRight } from "lucide-react";

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
      <SectionTitle title="策略精选流" subtitle="左右滑动切换不同策略" />
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
    const items = watchlist.map((code) => ({
      code,
      midLabel: "中线观察",
      shortLabel: "短线观望",
      comment: "已加入自选，进入详情页查看完整策略推演。",
      defenseLabel: "现价",
      defenseValue: STOCKS[code]?.candles.at(-1)?.close ?? 0,
    }));
    return <List items={items} onClickStock={onClickStock} />;
  }
  const items = FEED_BY_TAB[tabKey];
  return <List items={items} onClickStock={onClickStock} />;
}

function List({
  items,
  onClickStock,
}: {
  items: { code: string; midLabel: string; shortLabel: string; comment: string; defenseLabel: string; defenseValue: number }[];
  onClickStock: (code: string) => void;
}) {
  return (
    <div className="space-y-2">
      {items.map((it) => {
        const stock = STOCKS[it.code];
        if (!stock) return null;
        const last = stock.candles.at(-1)!;
        const prev = stock.candles.at(-2)!;
        const pct = ((last.close - prev.close) / prev.close) * 100;
        return (
          <button
            key={it.code}
            onClick={() => onClickStock(it.code)}
            className="surface-card flex w-full flex-col gap-2 rounded-xl border border-border p-3 text-left transition-colors hover:border-brand/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-foreground">{stock.meta.name}</span>
                  <span className="num text-[11px] text-muted-foreground">{stock.meta.code}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <BullBearBadge label={it.midLabel} />
                  <BullBearBadge label={it.shortLabel} />
                </div>
              </div>
              <div className="text-right">
                <PriceChange value={last.close} pct={pct} />
                <div className="num mt-1 text-[11px] text-muted-foreground">
                  {it.defenseLabel}: {it.defenseValue.toFixed(2)}
                </div>
              </div>
            </div>
            <p className="line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">{it.comment}</p>
            <ChevronRight size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          </button>
        );
      })}
    </div>
  );
}
