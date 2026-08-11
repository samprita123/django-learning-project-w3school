import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, LogOut } from "lucide-react";
import { POS_NAV_ITEMS } from "@/app/navigation/pos-nav-config";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cn } from "@/lib/utils";

export function PosSidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();

  const isActive = (to: string) => (to === "/pos" ? pathname === "/pos" : pathname.startsWith(to));

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-[width]",
        collapsed ? "w-[64px]" : "w-[220px]",
      )}
    >
      <div className="flex h-14 items-center border-b border-sidebar-border px-3">
        {!collapsed ? (
          <Link to="/one" className="flex min-w-0 items-center gap-2.5 px-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning text-[var(--color-sidebar)]">
              <UtensilsIcon />
            </div>
            <div className="min-w-0">
              <div className="truncate font-display text-[15px] font-semibold">Retrod POS</div>
              <div className="truncate text-[10px] text-sidebar-muted">Main Restaurant</div>
            </div>
          </Link>
        ) : (
          <Link
            to="/one"
            title="Retrod One"
            className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-warning text-[var(--color-sidebar)]"
          >
            <UtensilsIcon />
          </Link>
        )}
      </div>

      {!collapsed && (
        <Link
          to="/one"
          className="mx-3 mt-3 flex items-center gap-2 rounded-md border border-sidebar-border/80 px-3 py-2 text-[12px] font-medium transition hover:bg-sidebar-hover"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Retrod One
        </Link>
      )}

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3" aria-label="POS navigation">
        {POS_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.id}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition",
                active
                  ? "bg-sidebar-hover text-sidebar-foreground"
                  : "text-sidebar-muted hover:bg-sidebar-hover/60 hover:text-sidebar-foreground",
                collapsed && "justify-center px-2",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        {!collapsed && user && (
          <div className="mb-2 truncate px-1 text-[11px] text-sidebar-muted">{user.name}</div>
        )}
        <button
          type="button"
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[12px] text-sidebar-muted transition hover:bg-sidebar-hover hover:text-sidebar-foreground",
            collapsed && "justify-center",
          )}
        >
          <LogOut className="h-3.5 w-3.5" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}

function UtensilsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}
