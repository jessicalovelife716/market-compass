import { cn } from "@/lib/utils";
import type { StatusKey } from "@/engine/types";

const TONE: Record<StatusKey, string> = {
  healthy: "bg-bull/15 text-bull",
  bullish: "bg-bull/15 text-bull",
  strong: "bg-bull/20 text-bull",
  warn: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  bearish: "bg-bear/15 text-bear",
  neutral: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status, label, className }: { status: StatusKey; label: string; className?: string }) {
  return (
    <span className={cn("inline-flex h-5 items-center rounded px-1.5 text-[11px] font-medium", TONE[status], className)}>
      {label}
    </span>
  );
}
