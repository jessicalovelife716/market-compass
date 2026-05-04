import { useEffect, useRef, useState } from "react";
import { RefreshCw, Check, X, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type RefreshStatus = "idle" | "loading" | "success" | "error" | "offline";

const REFRESH_TIMEOUT = 8000;
const MIN_INTERVAL = 3000;
const SUCCESS_HOLD = 2000;
const ERROR_HOLD = 3000;

interface Props {
  /** 触发实际数据刷新；返回 Promise<boolean> 表示是否成功 */
  onRefresh?: () => Promise<boolean>;
}

function fmt(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())} 更新`;
}

export function HomeHeader({ onRefresh }: Props) {
  const [status, setStatus] = useState<RefreshStatus>("idle");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(new Date());
  const [, force] = useState(0);
  const lastSuccessAt = useRef<number>(Date.now());
  const timer = useRef<number | null>(null);

  // 每 60s 重渲染一次以驱动时间戳颜色
  useEffect(() => {
    const id = window.setInterval(() => force((x) => x + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  // 在线/离线
  useEffect(() => {
    const on = () => status === "offline" && setStatus("idle");
    const off = () => setStatus("offline");
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    if (typeof navigator !== "undefined" && !navigator.onLine) setStatus("offline");
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [status]);

  const clearTimer = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const handleRefresh = async () => {
    if (status === "loading") return;
    if (status === "offline" || (typeof navigator !== "undefined" && !navigator.onLine)) {
      toast.error("请检查网络连接");
      setStatus("offline");
      return;
    }
    if (Date.now() - lastSuccessAt.current < MIN_INTERVAL) {
      toast("数据已是最新");
      return;
    }
    clearTimer();
    setStatus("loading");
    const timeout = new Promise<boolean>((resolve) =>
      window.setTimeout(() => resolve(false), REFRESH_TIMEOUT),
    );
    try {
      const ok = await Promise.race([onRefresh ? onRefresh() : Promise.resolve(true), timeout]);
      if (ok) {
        lastSuccessAt.current = Date.now();
        setLastUpdate(new Date());
        setStatus("success");
        timer.current = window.setTimeout(() => setStatus("idle"), SUCCESS_HOLD);
      } else {
        setStatus("error");
        toast.error("刷新失败，显示缓存数据");
        timer.current = window.setTimeout(() => setStatus("idle"), ERROR_HOLD);
      }
    } catch {
      setStatus("error");
      toast.error("刷新失败，显示缓存数据");
      timer.current = window.setTimeout(() => setStatus("idle"), ERROR_HOLD);
    }
  };

  const ageMin = lastUpdate ? (Date.now() - lastUpdate.getTime()) / 60_000 : Infinity;
  const tsColor =
    !lastUpdate
      ? "text-muted-foreground"
      : ageMin > 30
        ? "text-bear"
        : ageMin > 10
          ? "text-warning"
          : "text-muted-foreground";
  const ageHint = ageMin > 30 ? "数据较旧，建议刷新" : ageMin > 10 ? "数据可能不是最新" : null;
  const btnHighlight = ageMin > 30;

  let btnIcon = <RefreshCw size={14} strokeWidth={1.75} className={cn(status === "loading" && "animate-spin")} />;
  let btnText = "刷新";
  let btnTone = "text-muted-foreground";
  if (status === "loading") {
    btnText = "刷新中...";
    btnTone = "text-brand";
  } else if (status === "success") {
    btnIcon = <Check size={14} strokeWidth={2} />;
    btnText = "已更新";
    btnTone = "text-bull";
  } else if (status === "error") {
    btnIcon = <X size={14} strokeWidth={2} />;
    btnText = "刷新失败";
    btnTone = "text-bear";
  } else if (status === "offline") {
    btnIcon = <WifiOff size={14} strokeWidth={1.75} />;
    btnText = "无网络";
  } else if (btnHighlight) {
    btnTone = "text-warning";
  }

  return (
    <header className="flex items-center justify-between gap-3 pt-1">
      <div className="min-w-0">
        <h1 className="text-[15px] font-semibold tracking-wide text-foreground">Stocklens</h1>
        <div className={cn("mt-0.5 text-[11px] leading-tight", tsColor)}>
          {lastUpdate ? fmt(lastUpdate) : "数据更新中"}
          {ageHint && <span className="ml-1.5">· {ageHint}</span>}
        </div>
      </div>
      <button
        type="button"
        onClick={handleRefresh}
        disabled={status === "loading"}
        aria-label="刷新"
        className={cn(
          "inline-flex min-h-[36px] min-w-[44px] items-center gap-1 rounded-full px-3 text-[12px] font-medium transition-colors",
          "bg-surface-2 hover:bg-surface-2/80",
          btnTone,
          status === "loading" && "cursor-not-allowed opacity-80",
        )}
      >
        {btnIcon}
        <span className="hidden xs:inline sm:inline">{btnText}</span>
      </button>
    </header>
  );
}
