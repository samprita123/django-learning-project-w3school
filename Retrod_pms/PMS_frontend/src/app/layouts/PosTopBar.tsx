import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Menu, Plus, Search, Wallet } from "lucide-react";
import { getPosRouteMeta } from "@/app/navigation/pos-nav-config";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROLE_LABEL } from "@/features/auth/lib/rbac";
import { Button } from "@/components/ui/Primitives";
import { ShiftManagementModal } from "@/features/pos/components/ShiftManagementModal";

function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden text-[13px] font-mono font-medium text-text-secondary sm:block px-2">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
}

export function PosTopBar({ onOpenMobileNav }: { onOpenMobileNav?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { label, linkTo } = getPosRouteMeta(pathname);
  const { user } = useAuth();
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-surface px-3 sm:gap-3 sm:px-4">
      {onOpenMobileNav && (
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onOpenMobileNav}
          className="rounded-md p-2 text-text-secondary hover:bg-surface-2 lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}

      <nav className="flex min-w-0 items-center gap-1.5 text-[12px] sm:text-[13px]">
        <span className="text-text-secondary">POS</span>
        <span className="text-text-disabled">/</span>
        <Link to={linkTo} className="truncate font-medium text-text-primary">
          {label}
        </Link>
      </nav>

      <div className="relative ml-auto hidden max-w-sm flex-1 md:block">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-disabled" />
        <input
          placeholder="Search orders, tables, menu…"
          aria-label="Search POS"
          className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-[12px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <LiveClock />
        <Link to="/pos/new" className="hidden sm:inline-flex">
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            New order
          </Button>
        </Link>
        <button
          type="button"
          title="Shift Management"
          onClick={() => setIsShiftModalOpen(true)}
          className="relative rounded-md p-2 text-text-secondary hover:bg-surface-2"
        >
          <Wallet className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-md p-2 text-text-secondary hover:bg-surface-2"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-warning" />
        </button>
        <div className="hidden items-center gap-2 border-l border-border pl-2 sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/20 text-[11px] font-semibold text-warning">
            {user?.initials ?? "—"}
          </div>
          <div className="hidden text-left lg:block">
            <div className="text-[12px] font-medium leading-tight">{user?.name ?? "Staff"}</div>
            <div className="text-[10px] text-text-secondary">
              {user ? ROLE_LABEL[user.role] : "—"}
            </div>
          </div>
        </div>
      </div>

      {isShiftModalOpen && <ShiftManagementModal onClose={() => setIsShiftModalOpen(false)} />}
    </header>
  );
}
