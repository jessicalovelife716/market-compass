import type { StockAnalysis } from "@/engine/types";
import { BullBearBadge } from "@/components/BullBearBadge";
import { LogicChain } from "@/components/LogicChain";
import { SectionTitle } from "@/components/SectionTitle";

export function StrategyVerdict({ a }: { a: StockAnalysis }) {
  return (
    <section className="surface-card rounded-2xl border border-border p-4">
      <SectionTitle title="策略引擎" subtitle="基于免费公开数据" />
      <div className="mb-3 flex flex-wrap gap-1.5">
        {a.verdict.labels.map((l, i) => (
          <BullBearBadge key={i} label={l.text} />
        ))}
      </div>
      <p className="text-[13px] leading-relaxed text-foreground/90">{a.verdict.summary}</p>
      <div className="mt-4">
        <div className="mb-2 text-[11px] font-medium text-muted-foreground">逻辑链路</div>
        <LogicChain nodes={a.verdict.logicChain} />
      </div>
    </section>
  );
}
