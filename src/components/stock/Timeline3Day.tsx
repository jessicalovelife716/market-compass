import type { StockAnalysis } from "@/engine/types";
import { Timeline } from "@/components/Timeline";
import { SectionTitle } from "@/components/SectionTitle";

export function Timeline3Day({ a }: { a: StockAnalysis }) {
  return (
    <section className="surface-card rounded-2xl border border-border p-4">
      <SectionTitle title="3日异动时间轴" subtitle="资金节奏复盘 · 基于免费数据推演" />
      <Timeline nodes={a.timeline} />
    </section>
  );
}
