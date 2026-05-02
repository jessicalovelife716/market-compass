import { useNavigate } from "react-router-dom";
import type { SectorAnalysis } from "@/engine/types";
import { SectionTitle } from "@/components/SectionTitle";
import { cn } from "@/lib/utils";

export function SectorHeatmapDetail({ a }: { a: SectorAnalysis }) {
  const navigate = useNavigate();
  return (
    <section>
      <SectionTitle title="板块个股热力图" subtitle="色块大小=成交额占比 ｜ 颜色深浅=涨跌幅度" />
      <div className="grid grid-cols-2 gap-2">
        {a.meta.topStocks.map((s) => {
          const isUp = s.changePct >= 0;
          const intensity = Math.min(0.32, Math.max(0.08, Math.abs(s.changePct) / 5 * 0.32));
          return (
            <button
              key={s.code}
              onClick={() => navigate(`/stock/${s.code}`)}
              className={cn(
                "surface-card flex flex-col gap-1 rounded-xl border p-3 text-left",
                isUp ? "border-bull/30" : "border-bear/30",
              )}
              style={{
                background: `linear-gradient(135deg, hsl(var(--surface)) 0%, hsl(var(--${isUp ? "bull" : "bear"}) / ${intensity}) 100%)`,
              }}
            >
              <span className="text-[13px] font-semibold text-foreground">{s.name}</span>
              <span className={cn("num text-sm font-semibold", isUp ? "text-bull" : "text-bear")}>
                {isUp ? "+" : ""}
                {s.changePct.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
