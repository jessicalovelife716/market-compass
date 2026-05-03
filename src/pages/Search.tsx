import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, X, Clock, Flame, Star, ChevronRight } from "lucide-react";
import { ALL_STOCKS, STOCKS } from "@/data/stocks";
import { SECTORS } from "@/data/sectors";
import { RADAR } from "@/data/radar";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { BottomNav } from "@/components/BottomNav";
import { SectionTitle } from "@/components/SectionTitle";
import { BullBearBadge } from "@/components/BullBearBadge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const Search = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [submittedQ, setSubmittedQ] = useState("");
  const { has, toggle } = useWatchlist();
  const { list: history, push, clear } = useSearchHistory();

  const handleSearch = () => {
    const t = q.trim();
    if (!t) return;
    push(t);
    setSubmittedQ(t);
  };

  const candidates = useMemo(() => {
    if (!submittedQ.trim()) return [];
    const t = submittedQ.trim().toLowerCase();
    return ALL_STOCKS.filter(
      (s) =>
        s.meta.code.includes(t) ||
        s.meta.name.includes(submittedQ.trim()) ||
        s.meta.pinyin.toLowerCase().includes(t),
    ).slice(0, 8);
  }, [submittedQ]);

  const goStock = (code: string, name: string) => {
    push(name);
    navigate(`/stock/${code}`);
  };

  const goRadar = (code: string, name: string) => {
    push(name);
    if (SECTORS[code]) navigate(`/sector/${code}`);
    else navigate(`/stock/${code}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-2 px-3 py-2.5">
          <div className="relative flex-1">
            <SearchIcon
              size={16}
              strokeWidth={1.75}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              autoFocus
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                if (!e.target.value.trim()) setSubmittedQ("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="股票代码 / 拼音首字母 / 板块名称…"
              className="h-9 border-0 bg-surface pl-9 pr-9 text-[13px]"
            />
            {q && (
              <button
                onClick={() => {
                  setQ("");
                  setSubmittedQ("");
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} strokeWidth={1.75} />
              </button>
            )}
          </div>
          <button
            onClick={() => (q.trim() ? handleSearch() : navigate("/"))}
            className="text-[13px] text-brand"
          >
            {q.trim() ? "搜索" : "取消"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pt-4">
        {q.trim() ? (
          <div className="space-y-2">
            <div className="text-[11px] font-medium text-muted-foreground">股票/板块候选</div>
            {candidates.length === 0 ? (
              <div className="surface-card rounded-xl border border-border px-4 py-8 text-center text-[13px] text-muted-foreground">
                未找到匹配标的
              </div>
            ) : (
              candidates.map((s) => {
                const watched = has(s.meta.code);
                return (
                  <div
                    key={s.meta.code}
                    className="surface-card flex items-center justify-between rounded-xl border border-border p-3"
                  >
                    <button
                      onClick={() => goStock(s.meta.code, s.meta.name)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-semibold text-foreground">{s.meta.name}</span>
                          <span className="num text-[11px] text-muted-foreground">({s.meta.code})</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-[11px] text-muted-foreground">{s.meta.industry}</span>
                          <BullBearBadge label="中线偏多" />
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => toggle(s.meta.code)}
                      className={cn(
                        "ml-3 inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-[11px] transition-colors",
                        watched
                          ? "border-gold/40 bg-gold/10 text-gold"
                          : "border-border bg-surface-2 text-muted-foreground",
                      )}
                    >
                      <Star size={12} strokeWidth={1.75} fill={watched ? "currentColor" : "none"} />
                      {watched ? "取消自选" : "加自选"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {history.length > 0 && (
              <section>
                <SectionTitle
                  title="历史搜索"
                  right={
                    <button onClick={clear} className="text-[11px] text-muted-foreground hover:text-foreground">
                      清空
                    </button>
                  }
                />
                <div className="flex flex-wrap gap-2">
                  {history.map((h) => (
                    <button
                      key={h}
                      onClick={() => setQ(h)}
                      className="inline-flex h-7 items-center gap-1 rounded-full bg-surface-2 px-3 text-[12px] text-foreground"
                    >
                      <Clock size={12} strokeWidth={1.75} className="text-muted-foreground" />
                      {h}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section>
              <SectionTitle title="引擎异动雷达" subtitle="基于系统高频触发" />
              <div className="space-y-2">
                {RADAR.map((r, i) => (
                  <button
                    key={r.code}
                    onClick={() => goRadar(r.code, r.name)}
                    className="surface-card flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:border-brand/40"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/12 text-[12px] font-semibold text-brand">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold text-foreground">{r.name}</span>
                        {STOCKS[r.code] && (
                          <span className="num text-[11px] text-muted-foreground">({r.code})</span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {r.tags.map((t) => (
                          <span
                            key={t}
                            className="inline-flex h-5 items-center rounded bg-surface-2 px-1.5 text-[11px] text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Flame size={16} className="text-gold" strokeWidth={1.75} />
                    <ChevronRight size={14} className="text-muted-foreground/40" />
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Search;
