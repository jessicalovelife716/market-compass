import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { SECTORS } from "@/data/sectors";
import { analyzeSector } from "@/engine";
import { BottomNav } from "@/components/BottomNav";
import { SectorHeader } from "@/components/sector/SectorHeader";
import { SectorHeatmapDetail } from "@/components/sector/SectorHeatmapDetail";
import { SectorVerdict } from "@/components/sector/SectorVerdict";
import { SectorHealth } from "@/components/sector/SectorHealth";
import { SectorTimeline, SectorOutlook } from "@/components/sector/SectorTimeline";
import { SectorRanking } from "@/components/sector/SectorRanking";
import { Disclaimer } from "@/components/Disclaimer";

const SectorDetail = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const snap = SECTORS[id];
  if (!snap) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        未找到该板块
      </div>
    );
  }
  const a = analyzeSector(snap);

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
          <span className="text-[13px] text-muted-foreground">板块详情</span>
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-4 px-4 pt-4">
        <SectorHeader a={a} />
        <SectorHeatmapDetail a={a} />
        <SectorVerdict a={a} />
        <SectorHealth a={a} />
        <SectorTimeline a={a} />
        <SectorOutlook a={a} />
        <SectorRanking a={a} />
        <Disclaimer />
      </div>
      <BottomNav />
    </div>
  );
};

export default SectorDetail;
