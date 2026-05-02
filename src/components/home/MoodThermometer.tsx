import { useState } from "react";
import type { MarketMood } from "@/data/marketMood";
import { PriceChange } from "@/components/PriceChange";
import { Activity, CircleAlert, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface Factor {
  key: string;
  title: string;
  detail: string;
  score: number;
}

const FACTORS: Factor[] = [
  { key: "ad", title: "涨跌家数", detail: "涨家 2900 / 跌家 1900（占比 60%）", score: 0.6 },
  { key: "vol", title: "量能", detail: "量比 1.00（7729亿 vs MA20 7729亿）", score: 0.5 },
  { key: "limit", title: "涨跌停净值", detail: "涨停 62 / 跌停 12", score: 0.9 },
  { key: "index", title: "大盘指数", detail: "上证 +0.58%", score: 0.6 },
  { key: "mom", title: "5 日动量", detail: "近 5 日均温 64", score: 0.64 },
];

export function MoodThermometer({ mood }: { mood: MarketMood }) {
  const [expanded, setExpanded] = useState(false);
  const tone =
    mood.temperature >= 70
      ? { bar: "bg-bull", badge: "bg-bull/15 text-bull" }
      : mood.temperature >= 50
      ? { bar: "bg-brand", badge: "bg-brand/15 text-brand" }
      : mood.temperature >= 30
      ? { bar: "bg-warning", badge: "bg-warning/15 text-warning" }
      : { bar: "bg-bear", badge: "bg-bear/15 text-bear" };
  return (
    <section className="surface-card rounded-2xl border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity size={14} strokeWidth={1.75} className="text-brand" />
            <span>大盘情绪温度计</span>
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="温度构成说明"
                  className="-ml-1 inline-flex h-4 w-4 items-center justify-center text-muted-foreground/70 hover:text-foreground"
                >
                  <CircleAlert size={14} strokeWidth={1.5} />
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl border-border">
                <SheetHeader className="text-left">
                  <SheetTitle>大盘温度构成</SheetTitle>
                  <SheetDescription>
                    主要由「涨跌家数」拉动：涨家 2900 / 跌家 1900（占比 60%）。
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-2 divide-y divide-border">
                  {FACTORS.map((f) => (
                    <div key={f.key} className="flex items-start justify-between gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-semibold text-foreground">{f.title}</div>
                        <div className="mt-1 text-[12px] text-muted-foreground">{f.detail}</div>
                      </div>
                      <div className="num text-[14px] font-semibold text-brand">{f.score.toFixed(f.score >= 1 ? 1 : 2)}</div>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="num font-semibold text-foreground text-4xl">{mood.temperature}</span>
            <span className="text-sm text-muted-foreground">℃</span>
            <span className={`ml-1 inline-flex h-5 items-center rounded-full px-2 text-[11px] font-medium ${tone.badge}`}>
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
        <div className={`absolute inset-y-0 left-0 ${tone.bar}`} style={{ width: `${mood.temperature}%` }} />
        <div className="absolute top-1/2 h-3 w-[2px] -translate-y-1/2 bg-foreground/80" style={{ left: `${mood.temperature}%` }} />
      </div>

      <div className="mt-4 space-y-0.5 text-[13px] leading-relaxed">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-start gap-1 text-left text-foreground/90"
        >
          <span className={cn("flex-1 min-w-0", !expanded && "truncate")}>
            <span className="mr-1.5 font-semibold text-brand">引擎裁决</span>
            {mood.verdict}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={1.75}
            className={cn("mt-1 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")}
          />
        </button>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-start gap-1 rounded-lg text-left text-foreground bg-inherit border-inherit px-0 py-[4px]"
        >
          <span className={cn("flex-1 min-w-0", !expanded && "truncate")}>
            <span className="mr-1.5 font-semibold text-gold">策略建议</span>
            {mood.advice}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={1.75}
            className={cn("mt-1 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")}
          />
        </button>
      </div>
    </section>
  );
}
