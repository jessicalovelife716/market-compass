import type { SectorAnalysis } from "@/engine/types";
import { Timeline } from "@/components/Timeline";
import { SectionTitle } from "@/components/SectionTitle";

export function SectorTimeline({ a }: { a: SectorAnalysis }) {
  return (
    <section className="surface-card rounded-2xl border border-border p-4">
      <SectionTitle title="板块3日异动时间轴" />
      <Timeline nodes={a.timeline} />
    </section>
  );
}

export function SectorOutlook({ a }: { a: SectorAnalysis }) {
  return (
    <section className="surface-card rounded-2xl border border-border p-4">
      <h2 className="mb-2 text-[15px] font-semibold tracking-tight text-foreground">板块走势推演</h2>
      <p className="text-[13px] leading-relaxed text-foreground/90">{a.outlook}</p>
    </section>
  );
}
