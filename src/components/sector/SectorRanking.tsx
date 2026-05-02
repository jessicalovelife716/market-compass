import { useNavigate } from "react-router-dom";
import type { SectorAnalysis } from "@/engine/types";
import { SectionTitle } from "@/components/SectionTitle";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectorRanking({ a }: { a: SectorAnalysis }) {
  const navigate = useNavigate();
  return (
    <section className="surface-card rounded-2xl border border-border p-4">
      <SectionTitle title="板块个股排行" subtitle="今日涨跌 · 涨幅前 5" />
      <div className="space-y-1">
        {a.meta.rankTop5.map((s) => {
          const isUp = s.changePct >= 0;
          return (
            <button
              key={s.code}
              onClick={() => navigate(`/stock/${s.code}`)}
              className="flex w-full items-center justify-between rounded-lg px-2 py-2.5 transition-colors hover:bg-surface-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-foreground">{s.name}</span>
                <span className="num text-[11px] text-muted-foreground">{s.code}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("num text-sm font-semibold", isUp ? "text-bull" : "text-bear")}>
                  {isUp ? "+" : ""}
                  {s.changePct.toFixed(2)}%
                </span>
                <ChevronRight size={14} className="text-muted-foreground/40" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
