import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { STOCKS } from "@/data/stocks";
import { SECTORS } from "@/data/sectors";
import { analyzeStock } from "@/engine";
import { BottomNav } from "@/components/BottomNav";
import { StockHeader } from "@/components/stock/StockHeader";
import { StrategyVerdict } from "@/components/stock/StrategyVerdict";
import { PeriodTabs } from "@/components/stock/PeriodTabs";
import { HealthReport } from "@/components/stock/HealthReport";
import { Timeline3Day } from "@/components/stock/Timeline3Day";
import { OperationPlay } from "@/components/stock/OperationPlay";
import { Disclaimer } from "@/components/Disclaimer";

const StockDetail = () => {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const snap = STOCKS[code];
  if (!snap) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        未找到该股票
      </div>
    );
  }
  const sector = SECTORS[snap.meta.industryId];
  const a = analyzeStock(snap, sector?.meta.changePct ?? 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-2 px-2 py-2">
          <button
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={20} strokeWidth={1.75} />
          </button>
          <span className="text-[13px] text-muted-foreground">个股详情</span>
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-4 px-4 pt-4">
        <StockHeader a={a} />
        <StrategyVerdict a={a} />
        <PeriodTabs a={a} />
        <HealthReport a={a} />
        <Timeline3Day a={a} />
        <OperationPlay a={a} />

        <div className="surface-card rounded-2xl border border-border p-4">
          <div className="mb-2 text-[11px] font-medium text-muted-foreground">所属板块与概念</div>
          <div className="flex flex-wrap gap-1.5">
            {a.meta.concepts.map((c) => (
              <Link
                key={c.id}
                to={`/sector/${c.id}`}
                className="inline-flex h-7 items-center rounded-full bg-brand/10 px-3 text-[12px] text-brand transition-colors hover:bg-brand/20"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        <Disclaimer />
      </div>
      <BottomNav />
    </div>
  );
};

export default StockDetail;
