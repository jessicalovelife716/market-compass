import { useState } from "react";
import type { MarketMood } from "@/data/marketMood";
import { buildFactors } from "@/data/marketMood";
import { PriceChange } from "@/components/PriceChange";
import { Activity, CircleAlert, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const COLOR_MAP: Record<MarketMood["labelColor"], { bar: string; badge: string }> = {
  "deep-green": { bar: "bg-bear", badge: "bg-bear/15 text-bear" },
  "light-green": { bar: "bg-bear/70", badge: "bg-bear/12 text-bear" },
  gray: { bar: "bg-muted-foreground", badge: "bg-muted text-muted-foreground" },
  "light-red": { bar: "bg-bull/70", badge: "bg-bull/12 text-bull" },
  "deep-red": { bar: "bg-bull", badge: "bg-bull/15 text-bull" },
};

export function MoodThermometer({ mood }: { mood: MarketMood }) {
  const [verdictExpanded, setVerdictExpanded] = useState(false);
  const [adviceExpanded, setAdviceExpanded] = useState(false);
  const tone = COLOR_MAP[mood.labelColor];
  const factors = buildFactors(mood.raw);

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
                    宽度35% + 热度30% + 活跃25% + 基础10%，并按指数方向修正 ±15。
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-2 divide-y divide-border">
                  {factors.map((f) => (
                    <div key={f.key} className="flex items-start justify-between gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-semibold text-foreground">{f.title}</div>
                        <div className="mt-1 text-[12px] text-muted-foreground">{f.detail}</div>
                      </div>
                      <div className="num text-[14px] font-semibold text-brand">{f.score}</div>
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
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground/80">
        <span>冰点</span>
        <span>启动</span>
        <span>平稳</span>
        <span>过热</span>
        <span>极热</span>
      </div>

      <div className="mt-3 space-y-0.5 text-[13px] leading-relaxed">
        <button
          type="button"
          onClick={() => setVerdictExpanded((v) => !v)}
          className="flex w-full items-start gap-1 text-left text-foreground/90 py-[4px]"
        >
          <span className={cn("flex-1 min-w-0", !verdictExpanded && "truncate")}>
            <span className="mr-1.5 font-semibold text-brand">引擎裁决</span>
            {mood.verdict}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={1.75}
            className={cn("mt-1 shrink-0 text-muted-foreground transition-transform", verdictExpanded && "rotate-180")}
          />
        </button>
        <button
          type="button"
          onClick={() => setAdviceExpanded((v) => !v)}
          className="flex w-full items-start gap-1 rounded-lg text-left text-foreground bg-inherit border-inherit px-0 py-[4px]"
        >
          <span className={cn("flex-1 min-w-0", !adviceExpanded && "truncate")}>
            <span className="mr-1.5 font-semibold text-gold">策略建议</span>
            {mood.advice}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={1.75}
            className={cn("mt-1 shrink-0 text-muted-foreground transition-transform", adviceExpanded && "rotate-180")}
          />
        </button>
      </div>

      <div className="mt-3 text-[10px] leading-relaxed text-muted-foreground/70">
        数据来源：东方财富 / 腾讯财经
      </div>
      <div className="mt-2 border-t border-border pt-2 text-[10px] leading-[1.5] text-muted-foreground/70">
        以上分析仅基于东方财富、腾讯财经免费数据的技术参考，不构成投资建议。股市有风险，请在第三方券商自主决策执行。
      </div>
    </section>
  );
}
