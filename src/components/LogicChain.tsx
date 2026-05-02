import { ChevronRight } from "lucide-react";

export function LogicChain({ nodes }: { nodes: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
      {nodes.map((n, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          <span className="rounded-md bg-surface-2 px-2 py-1 text-[11px] font-medium text-foreground">{n}</span>
          {i < nodes.length - 1 && <ChevronRight size={12} className="text-muted-foreground" strokeWidth={2} />}
        </span>
      ))}
    </div>
  );
}
