import { cn } from "@/lib/utils";

export function RatingBar({ score, className }: { score: number; className?: string }) {
  const tone = score >= 80 ? "bg-bull" : score >= 60 ? "bg-brand" : score >= 40 ? "bg-warning" : "bg-bear";
  return (
    <div className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${Math.max(2, score)}%` }} />
    </div>
  );
}
