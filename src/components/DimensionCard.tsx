import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { IconTile } from "./IconTile";
import { StatusBadge } from "./StatusBadge";
import type { DimensionResult, StatusKey } from "@/engine/types";
import { type LucideIcon } from "lucide-react";

const STATUS_TONE: Record<StatusKey, "brand" | "bull" | "warning" | "danger" | "muted" | "gold"> = {
  healthy: "bull",
  bullish: "bull",
  strong: "bull",
  warn: "warning",
  danger: "danger",
  bearish: "bear" as never,
  neutral: "muted",
};

export function DimensionCard({
  dim,
  icon,
}: {
  dim: DimensionResult;
  icon: LucideIcon;
}) {
  const tone = STATUS_TONE[dim.status];
  return (
    <AccordionItem value={dim.key} className="surface-card overflow-hidden rounded-xl border border-border">
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex w-full items-center gap-3">
          <IconTile icon={icon} tone={tone === "bear" ? "bear" : (tone as never)} size={36} />
          <div className="min-w-0 flex-1 text-left">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-foreground">{dim.title}</span>
              <StatusBadge status={dim.status} label={dim.statusLabel} />
            </div>
            <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-muted-foreground">{dim.headline}</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4">
        <div className="border-t border-border pt-3">
          <p className="mb-3 text-[13px] leading-relaxed text-foreground/90">{dim.headline}</p>
          <ul className="space-y-2">
            {dim.evidence.map((e, i) => (
              <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-muted-foreground">
                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-brand/70" />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
