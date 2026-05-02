import type { MarketMood } from "@/data/marketMood";
import { PriceChange } from "@/components/PriceChange";
import { Activity } from "lucide-react";

export function MoodThermometer({ mood }: { mood: MarketMood }) {
  return (
    <section className="surface-card rounded-2xl border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity size={14} strokeWidth={1.75} className="text-brand" />
            <span>大盘情绪温度计</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="num text-3xl font-semibold text-foreground">{mood.temperature}</span>
            <span className="text-sm text-muted-foreground">℃</span>
            <span className="ml-1 inline-flex h-5 items-center rounded-full bg-warning/15 px-2 text-[11px] font-medium text-warning">
              {mood.status}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-muted-foreground">{mood.index.name}</div>
          <div className="num mt-0.5 text-base font-semibold text-foreground">{mood.index.value.toFixed(2)}</div>
          <PriceChange pct={mood.index.changePct} size="sm" />
        </div>
      </div>

      <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div className="absolute inset-y-0 left-0 gradient-temp" style={{ width: `${mood.temperature}%` }} />
        <div className="absolute top-1/2 h-3 w-[2px] -translate-y-1/2 bg-foreground/80" style={{ left: `${mood.temperature}%` }} />
      </div>

      <div className="mt-4 space-y-2 text-[13px] leading-relaxed">
        <p className="text-foreground/90">
          <span className="mr-1.5 font-semibold text-brand">引擎裁决</span>
          {mood.verdict}
        </p>
        <p className="rounded-lg bg-brand/8 px-3 py-2 text-foreground/90">
          <span className="mr-1.5 font-semibold text-gold">策略建议</span>
          {mood.advice}
        </p>
      </div>
    </section>
  );
}
