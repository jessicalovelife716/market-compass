import { useNavigate } from "react-router-dom";
import { ALL_SECTORS } from "@/data/sectors";
import { SectionTitle } from "@/components/SectionTitle";
import { PriceChange } from "@/components/PriceChange";
import { genTrendTag, genVolTag, applyMixedState, type TrendTag, type VolTag } from "@/engine/rules/sectorTags";
import { cn } from "@/lib/utils";

const TREND_COLOR: Record<TrendTag["color"], string> = {
  red: "bg-bull/15 text-bull border border-bull/30",
  orange: "bg-warning/15 text-warning border border-warning/30",
  green: "bg-bear/15 text-bear border border-bear/30",
  gray: "bg-muted text-muted-foreground border border-border",
};
const VOL_COLOR: Record<VolTag["color"], string> = {
  red: "bg-bull/15 text-bull border border-bull/30",
  "light-red": "bg-bull/10 text-bull border border-bull/20",
  gray: "bg-muted text-muted-foreground border border-border",
  orange: "bg-warning/15 text-warning border border-warning/30",
};

function colorByChange(pct: number): { intensity: number; tone: "bull" | "bear" | "neutral" } {
  if (pct >= 3) return { intensity: 0.32, tone: "bull" };
  if (pct >= 1) return { intensity: 0.18, tone: "bull" };
  if (pct > -1) return { intensity: 0.05, tone: "neutral" };
  if (pct > -3) return { intensity: 0.18, tone: "bear" };
  return { intensity: 0.32, tone: "bear" };
}

export function SectorHeatmap() {
  const navigate = useNavigate();
  const top = ALL_SECTORS.slice(0, 4);
  if (top.length === 0) return null;

  // 板块涨跌中位数（用于 P2 强势领涨判断）
  const sortedPct = [...top.map((s) => s.meta.changePct)].sort((a, b) => a - b);
  const median = sortedPct[Math.floor(sortedPct.length / 2)];

  const gridCols = top.length === 1 ? "grid-cols-1" : "grid-cols-2";

  return (
    <section>
      <SectionTitle title="主力资金热力图" subtitle="按成交量排序" />
      <div className={`grid ${gridCols} gap-3`}>
        {top.map((s) => {
          const m = s.meta;
          // 5日累计涨幅近似（mock：用 vsMarket 占位时回退）
          const sector5dChangePct = ((s.turnover5d.at(-1) ?? 0) / (s.turnover5d[0] || 1) - 1) * 100;
          const topStockChangePct = m.topStocks[0]?.changePct ?? null;
          const state = {
            sectorChangePct: m.changePct,
            sector5dChangePct,
            sectorAmount: s.turnover5d.at(-1) ?? 0,
            sectorAmount5dAvg: s.turnoverAvg5,
            topStockChangePct,
            marketMedianChangePct: median,
          };
          const { trend, vol } = applyMixedState(genTrendTag(state), genVolTag(state), state);
          const { intensity, tone } = colorByChange(m.changePct);
          return (
            <button
              key={m.id}
              onClick={() => navigate(`/sector/${m.id}`)}
              className={cn(
                "surface-card relative flex flex-col gap-2 rounded-xl border p-3 text-left transition-all hover:scale-[1.02]",
                tone === "bull" ? "border-bull/30" : tone === "bear" ? "border-bear/30" : "border-border",
              )}
              style={{
                background:
                  tone === "neutral"
                    ? `hsl(var(--surface))`
                    : `linear-gradient(135deg, hsl(var(--surface)) 0%, hsl(var(--${tone}) / ${intensity}) 100%)`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-foreground truncate max-w-[80%]">{m.name}</span>
              </div>
              <PriceChange pct={m.changePct} size="md" />
              <div className="flex flex-wrap items-center gap-1">
                <span className={cn("inline-flex h-[18px] items-center rounded px-1.5 text-[10px] font-medium leading-none", TREND_COLOR[trend.color])}>
                  {trend.text}
                </span>
                {vol && (
                  <span className={cn("inline-flex h-[18px] items-center rounded px-1.5 text-[10px] font-medium leading-none", VOL_COLOR[vol.color])}>
                    {vol.text}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
