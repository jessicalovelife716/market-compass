import { cn } from "@/lib/utils";

const TONE_MAP: Record<string, string> = {
  // 中线
  中线偏多: "bg-bull/12 text-bull border-bull/30",
  中线偏空: "bg-bear/12 text-bear border-bear/30",
  中线震荡: "bg-warning/12 text-warning border-warning/30",
  中线强势: "bg-bull/15 text-bull border-bull/40",
  中线谨慎: "bg-warning/12 text-warning border-warning/30",
  // 短线
  短线回避: "bg-bear/12 text-bear border-bear/30",
  短线谨慎: "bg-warning/12 text-warning border-warning/30",
  短线偏强: "bg-bull/12 text-bull border-bull/30",
  短线观望: "bg-muted text-muted-foreground border-border",
  短线稳健: "bg-brand/12 text-brand border-brand/30",
  强势进攻: "bg-bull/15 text-bull border-bull/40",
  短线进攻: "bg-bull/15 text-bull border-bull/40",
  // 超短
  超短回避: "bg-bear/12 text-bear border-bear/30",
  超短观望: "bg-muted text-muted-foreground border-border",
  超短可关注: "bg-brand/12 text-brand border-brand/30",
  // 复合
  中短双多: "bg-bull/15 text-bull border-bull/40",
};

export function BullBearBadge({ label, className }: { label: string; className?: string }) {
  const tone = TONE_MAP[label] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-medium leading-none",
        tone,
        className,
      )}
    >
      {label}
    </span>
  );
}
