import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { StockAnalysis } from "@/engine/types";
import { PriceChange } from "@/components/PriceChange";
import { useWatchlist } from "@/hooks/useWatchlist";
import { cn } from "@/lib/utils";

export function StockHeader({ a }: { a: StockAnalysis }) {
  const { has, toggle } = useWatchlist();
  const watched = has(a.meta.code);
  const pct = ((a.last.close - a.prev.close) / a.prev.close) * 100;
  return (
    <header className="surface-card rounded-2xl border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-foreground">{a.meta.name}</h1>
            <span className="num text-xs text-muted-foreground">{a.meta.code}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>{a.meta.exchange}</span>
            <span className="text-border">·</span>
            <Link to={`/sector/${a.meta.industryId}`} className="text-brand hover:underline">
              {a.meta.industry}
            </Link>
          </div>
        </div>
        <button
          onClick={() => toggle(a.meta.code)}
          className={cn(
            "flex h-8 items-center gap-1 rounded-full border px-3 text-[12px] transition-colors",
            watched
              ? "border-gold/40 bg-gold/15 text-gold"
              : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
          )}
        >
          <Star size={14} strokeWidth={1.75} fill={watched ? "currentColor" : "none"} />
          {watched ? "已自选" : "加自选"}
        </button>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <PriceChange value={a.last.close} pct={pct} size="lg" />
          <div className="num mt-1 text-[11px] text-muted-foreground">
            今日区间：{a.last.low.toFixed(2)} ~ {a.last.high.toFixed(2)}
          </div>
        </div>
        <div className="text-right text-[11px] text-muted-foreground">
          <div>
            总市值：<span className="text-foreground">{a.meta.marketCap}</span>
          </div>
          <div className="mt-0.5">
            PE：<span className="num text-foreground">{a.meta.pe.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
