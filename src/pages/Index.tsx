import { BottomNav } from "@/components/BottomNav";
import { HomeHeader } from "@/components/home/HomeHeader";
import { MoodThermometer } from "@/components/home/MoodThermometer";
import { SectorHeatmap } from "@/components/home/SectorHeatmap";
import { StrategyFeed } from "@/components/home/StrategyFeed";
import { Disclaimer } from "@/components/Disclaimer";
import { MARKET_MOOD } from "@/data/marketMood";

const Index = () => {
  // mock 刷新：800ms 后成功
  const handleRefresh = () =>
    new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(true), 800);
    });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-md space-y-5 px-4 pt-3">
        <HomeHeader onRefresh={handleRefresh} />
        <MoodThermometer mood={MARKET_MOOD} />
        <SectorHeatmap />
        <StrategyFeed />
        <Disclaimer />
      </div>
      <BottomNav />
    </div>
  );
};

export default Index;
