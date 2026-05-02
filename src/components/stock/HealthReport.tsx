import type { StockAnalysis } from "@/engine/types";
import { Accordion } from "@/components/ui/accordion";
import { DimensionCard } from "@/components/DimensionCard";
import { SectionTitle } from "@/components/SectionTitle";
import { Shapes, TrendingUp, BarChart3, Activity, AlertTriangle, Building2, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  shape: Shapes,
  ma: TrendingUp,
  vol: BarChart3,
  tech: Activity,
  risk: AlertTriangle,
  industry: Building2,
};

export function HealthReport({ a }: { a: StockAnalysis }) {
  return (
    <section>
      <SectionTitle title="个股体检报告" subtitle="6 大维度 · 点击展开论据" />
      <Accordion type="multiple" className="space-y-2">
        {a.health.map((d) => (
          <DimensionCard key={d.key} dim={d} icon={ICONS[d.key] ?? Activity} />
        ))}
      </Accordion>
    </section>
  );
}
