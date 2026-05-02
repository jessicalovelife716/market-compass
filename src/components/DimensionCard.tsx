import { Link } from "react-router-dom";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StatusBadge } from "./StatusBadge";
import type { DimensionResult } from "@/engine/types";
import { type LucideIcon } from "lucide-react";

export function DimensionCard({
  dim,
  icon: Icon,
  titleHref,
  titleLabel,
}: {
  dim: DimensionResult;
  icon: LucideIcon;
  titleHref?: string;
  titleLabel?: string;
}) {
  return (
    <AccordionItem value={dim.key} className="surface-card overflow-hidden rounded-xl border border-border">
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex w-full items-center gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground">
            <Icon size={20} strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex-1 text-left">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[14px] font-semibold text-foreground">{dim.title}</span>
              {titleHref && titleLabel && (
                <Link
                  to={titleHref}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[12px] text-brand hover:underline"
                >
                  {titleLabel}
                </Link>
              )}
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
