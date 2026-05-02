import type { StockAnalysis } from "@/engine/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RatingBar } from "@/components/RatingBar";
import { Check, Minus } from "lucide-react";

export function PeriodTabs({ a }: { a: StockAnalysis }) {
  return (
    <section className="surface-card rounded-2xl border border-border p-4">
      <h2 className="mb-3 text-[15px] font-semibold tracking-tight text-foreground">时间周期分层</h2>
      <Tabs defaultValue="mid">
        <TabsList className="grid w-full grid-cols-3 bg-surface-2">
          {a.periods.map((p) => (
            <TabsTrigger key={p.key} value={p.key} className="text-[12px] data-[state=active]:bg-brand data-[state=active]:text-brand-foreground">
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {a.periods.map((p) => (
          <TabsContent key={p.key} value={p.key} className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">评分</span>
                  <span>
                    <span className="num text-base font-semibold text-foreground">{p.score}</span>
                    <span className="ml-2 text-muted-foreground">{p.verdict}</span>
                  </span>
                </div>
                <RatingBar score={p.score} className="mt-2" />
              </div>
            </div>

            <div className="space-y-3">
              {p.sections.map((s, i) => (
                <div key={i} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
                    {s.ok ? (
                      <Check size={14} className="text-bull" strokeWidth={2.25} />
                    ) : (
                      <Minus size={14} className="text-warning" strokeWidth={2.25} />
                    )}
                    {s.title}
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-brand/8 px-3 py-2.5 text-[12.5px] leading-relaxed text-foreground/90">
              <span className="mr-1.5 font-semibold text-brand">操作建议</span>
              {p.advice}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
