import type { SectorAnalysis } from "@/engine/types";

export function SectorVerdict({ a }: { a: SectorAnalysis }) {
  return (
    <section className="surface-card rounded-2xl border border-border p-4">
      <div className="text-[11px] font-medium text-brand">板块策略裁决 · 基于免费公开数据</div>
      <h3 className="mt-1 text-[14px] font-semibold text-foreground">{a.verdict.headline}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{a.verdict.summary}</p>

      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        <Stat label="上涨" value={a.meta.rising} tone="bull" />
        <Stat label="下跌" value={a.meta.falling} tone="bear" />
        <Stat label="涨停" value={a.meta.limitUp} tone="bull" />
        <Stat label="跌停" value={a.meta.limitDown} tone="bear" />
      </div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "bull" | "bear" }) {
  return (
    <div className="rounded-lg bg-surface-2 py-2">
      <div className={`num text-base font-semibold ${tone === "bull" ? "text-bull" : "text-bear"}`}>{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
