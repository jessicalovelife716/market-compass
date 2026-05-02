import { cn } from "@/lib/utils";

export function PriceChange({
  value,
  pct,
  size = "md",
  className,
}: {
  value?: number;
  pct: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const tone = pct > 0 ? "text-bull" : pct < 0 ? "text-bear" : "text-neutral";
  const sign = pct > 0 ? "+" : "";
  const sizeCls = size === "lg" ? "text-2xl" : size === "sm" ? "text-xs" : "text-sm";
  return (
    <span className={cn("num font-semibold tabular-nums", tone, sizeCls, className)}>
      {value !== undefined && <span className="mr-2">{value.toFixed(2)}</span>}
      <span>
        {sign}
        {pct.toFixed(2)}%
      </span>
    </span>
  );
}
