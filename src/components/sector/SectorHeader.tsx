import type { SectorAnalysis } from "@/engine/types";
import { PriceChange } from "@/components/PriceChange";

export function SectorHeader({ a }: { a: SectorAnalysis }) {
  const m = a.meta;
  return (
    <header className="surface-card rounded-2xl border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{m.name}</h1>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {m.level} · 共 <span className="num text-foreground">{m.count}</span> 只个股
          </div>
        </div>
        <div className="text-right">
          <PriceChange pct={m.changePct} size="md" />
          <div className="mt-1 text-[11px] text-muted-foreground">
            {m.changePct < m.vsMarket ? "弱于" : "强于"}大盘({m.vsMarket >= 0 ? "+" : ""}{m.vsMarket.toFixed(2)}%)
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[12px] text-muted-foreground">
        <span>板块成交额</span>
        <span className="num font-semibold text-foreground">{m.turnover}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {m.concepts.map((c) => (
          <span key={c} className="inline-flex h-5 items-center rounded-full bg-brand/10 px-2 text-[11px] text-brand">
            {c}
          </span>
        ))}
      </div>
    </header>
  );
}
