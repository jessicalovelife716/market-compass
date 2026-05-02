import type { SectorAnalysis } from "@/engine/types";
import { Accordion } from "@/components/ui/accordion";
import { DimensionCard } from "@/components/DimensionCard";
import { SectionTitle } from "@/components/SectionTitle";
import { TrendingUp, Wallet, Crown, Globe2, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  trend: TrendingUp,
  flow: Wallet,
  leaders: Crown,
  macro: Globe2,
};

export function SectorHealth({ a }: { a: SectorAnalysis }) {
  return (
    <section>
      <SectionTitle title="板块体检" subtitle="4 大维度" />
      <Accordion type="multiple" className="space-y-2">
        {a.health.map((d) => (
          <DimensionCard key={d.key} dim={d} icon={ICONS[d.key] ?? TrendingUp} />
        ))}
      </Accordion>
    </section>
  );
}
