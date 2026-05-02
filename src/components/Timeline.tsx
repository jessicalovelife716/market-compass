import type { TimelineNode } from "@/engine/types";
import { cn } from "@/lib/utils";

export function Timeline({ nodes }: { nodes: TimelineNode[] }) {
  return (
    <ol className="relative space-y-4 pl-5">
      <span className="absolute left-[4px] top-2 bottom-2 w-px bg-border" aria-hidden />
      {nodes.map((n, i) => (
        <li key={i} className="relative">
          <span
            className={cn(
              "absolute -left-[16px] top-1.5 inline-block h-1.5 w-1.5 rounded-full ring-2",
              n.current ? "bg-brand ring-brand/30" : "bg-muted-foreground/40 ring-transparent",
            )}
          />
          <div className="flex flex-col gap-0.5">
            <span className={cn("text-[11px] font-medium", n.current ? "text-brand" : "text-muted-foreground")}>{n.when}</span>
            <span className="text-sm font-semibold text-foreground">{n.feature}</span>
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{n.body}</p>
        </li>
      ))}
    </ol>
  );
}
