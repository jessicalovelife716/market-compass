import { BottomNav } from "@/components/BottomNav";
import { MoodThermometer } from "@/components/home/MoodThermometer";
import { SectorHeatmap } from "@/components/home/SectorHeatmap";
import { StrategyFeed } from "@/components/home/StrategyFeed";
import { MARKET_MOOD } from "@/data/marketMood";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-md space-y-5 px-4 pt-5">
        <MoodThermometer mood={MARKET_MOOD} />
        <SectorHeatmap />
        <StrategyFeed />
      </div>
      <BottomNav />
    </div>
  );
};

export default Index;
