import type { StockAnalysis } from "@/engine/types";
import { ShieldAlert } from "lucide-react";

export function OperationPlay({ a }: { a: StockAnalysis }) {
  return (
    <section className="surface-card rounded-2xl border border-border p-4">
      <h2 className="mb-3 text-[15px] font-semibold tracking-tight text-foreground">操作推演</h2>
      <p className="text-[13px] leading-relaxed text-foreground/90">{a.verdict.operation}</p>
      <div className="mt-3 flex items-center gap-3 rounded-lg border border-danger/30 bg-danger/8 px-3 py-2.5">
        <ShieldAlert size={18} className="text-danger" strokeWidth={1.75} />
        <div>
          <div className="text-[11px] text-muted-foreground">核心防守线</div>
          <div className="num text-base font-semibold text-danger">{a.verdict.defenseLine.toFixed(2)} 元</div>
        </div>
      </div>
    </section>
  );
}
