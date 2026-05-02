import { useNavigate } from "react-router-dom";
import { ALL_SECTORS } from "@/data/sectors";
import { SectionTitle } from "@/components/SectionTitle";
import { PriceChange } from "@/components/PriceChange";
import { cn } from "@/lib/utils";

const STATE_LABEL: Record<string, string> = {
  xfdz: "龙头分歧 ｜ 缩量",
  cpo: "趋势加速 ｜ 爆量",
  dkjj: "资金流出 ｜ 破位",
  yhg: "护盘主力 ｜ 温和",
};

export function SectorHeatmap() {
  const navigate = useNavigate();
  return (
    <section>
      <SectionTitle title="主力资金热力图" subtitle="按成交量排序" />
      <div className="grid grid-cols-2 gap-3">
        {ALL_SECTORS.slice(0, 4).map((s) => {
          const m = s.meta;
          const isUp = m.changePct >= 0;
          const intensity = Math.min(0.28, Math.max(0.08, Math.abs(m.changePct) / 5 * 0.28));
          return (
            <button
              key={m.id}
              onClick={() => navigate(`/sector/${m.id}`)}
              className={cn(
                "surface-card relative flex flex-col gap-2 rounded-xl border p-3 text-left transition-all hover:scale-[1.02]",
                isUp ? "border-bull/30" : "border-bear/30",
              )}
              style={{
                background: `linear-gradient(135deg, hsl(var(--surface)) 0%, hsl(var(--${isUp ? "bull" : "bear"}) / ${intensity}) 100%)`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-foreground">{m.name}</span>
              </div>
              <PriceChange pct={m.changePct} size="md" />
              <span className="text-[11px] text-muted-foreground">{STATE_LABEL[m.id] ?? "—"}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
