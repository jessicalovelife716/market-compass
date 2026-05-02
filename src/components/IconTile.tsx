import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

export function IconTile({
  icon: Icon,
  tone = "brand",
  size = 36,
  className,
}: {
  icon: LucideIcon;
  tone?: "brand" | "gold" | "bull" | "bear" | "warning" | "danger" | "muted";
  size?: number;
  className?: string;
}) {
  const TONE_MAP: Record<string, string> = {
    brand: "bg-brand/12 text-brand",
    gold: "bg-gold/15 text-gold",
    bull: "bg-bull/12 text-bull",
    bear: "bg-bear/12 text-bear",
    warning: "bg-warning/12 text-warning",
    danger: "bg-danger/12 text-danger",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-lg", TONE_MAP[tone], className)}
      style={{ width: size, height: size }}
    >
      <Icon size={Math.round(size * 0.55)} strokeWidth={1.75} />
    </span>
  );
}
