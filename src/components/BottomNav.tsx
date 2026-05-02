import { NavLink } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "首页", icon: Home },
  { to: "/search", label: "搜索", icon: Search },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex w-20 flex-col items-center gap-0.5 py-1 text-[11px] transition-colors",
                isActive ? "text-brand" : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            <Icon size={22} strokeWidth={1.75} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
