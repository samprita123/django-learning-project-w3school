import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Bell, Plus, Calendar, Palette } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROLE_LABEL } from "@/features/auth/lib/rbac";
import { resolveRouteNavigation } from "@/app/navigation/nav-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  APP_THEME_GROUP_LABELS,
  APP_THEMES,
  applyTheme,
  persistTheme,
  readSavedTheme,
  type AppTheme,
} from "@/app/theme/theme";

function formatToday() {
  const now = new Date();
  return now.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function TopBar({
  mobileNavButton,
}: {
  mobileNavButton?: React.ReactNode;
  onOpenMobileNav?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { group, label: page, linkTo, trail } = resolveRouteNavigation(pathname);
  const { user } = useAuth();
  const [theme, setTheme] = useState<AppTheme>(() => readSavedTheme());
  const [searchQuery, setSearchQuery] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const selectedTheme =
    APP_THEMES.find((themeOption) => themeOption.value === theme) ?? APP_THEMES[0];

  const selectTheme = (next: AppTheme) => {
    setTheme(next);
    applyTheme(next);
    persistTheme(next);
  };

  const groupedThemes = APP_THEMES.reduce<Record<string, typeof APP_THEMES>>((acc, item) => {
    acc[item.group] = [...(acc[item.group] ?? []), item];
    return acc;
  }, {});

  const commandActions = [
    { label: "Open Global Search", to: "/search" },
    { label: "Open Notification Center", to: "/notifications" },
    { label: "Open Activity Timeline", to: "/activity-timeline" },
    { label: "Open PMS Integrations", to: "/pms-integrations" },
    { label: "Open Rate Plans", to: "/rate-plans" },
    { label: "Open Availability", to: "/availability" },
    { label: "Open Taxes & Fees", to: "/taxes-fees" },
    { label: "Open Revenue Drilldown", to: "/revenue-drilldown" },
    { label: "Open Booking Readiness", to: "/booking-readiness" },
    { label: "Open AI Anomaly Monitor", to: "/anomaly-monitor" },
    { label: "Create Reservation", to: "/reservations/new" },
  ];

  const filteredActions = commandActions.filter((a) =>
    `${a.label} ${a.to}`.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-surface px-3 sm:gap-3 sm:px-4 lg:gap-4 lg:px-6">
        {mobileNavButton}
        <nav className="flex min-w-0 items-center gap-1.5 text-[12px] sm:text-[13px]">
          <span className="text-text-secondary">{group}</span>
          <span className="text-text-disabled">/</span>
          {trail.length <= 1 ? (
            <Link to={linkTo} className="truncate font-medium text-text-primary">
              {page}
            </Link>
          ) : (
            <>
              {trail.slice(0, 3).map((entry, idx) => (
                <span key={entry.id} className="flex min-w-0 items-center gap-1.5">
                  {idx > 0 ? <span className="text-text-disabled">/</span> : null}
                  {entry.to ? (
                    <Link
                      to={entry.to}
                      className={
                        idx === trail.length - 1
                          ? "truncate font-medium text-text-primary"
                          : "truncate text-text-secondary hover:text-text-primary"
                      }
                    >
                      {entry.label}
                    </Link>
                  ) : (
                    <span className="truncate text-text-secondary">{entry.label}</span>
                  )}
                </span>
              ))}
            </>
          )}
        </nav>

        <div className="ml-2 hidden max-w-xl flex-1 md:ml-4 md:block">
          <div className="group relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled" />
            <input
              type="text"
              placeholder="Search guests, rooms, reservations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                  e.preventDefault();
                  setPaletteOpen(true);
                  return;
                }
                if (e.key !== "Enter") return;
                const q = searchQuery.trim();
                navigate({ to: "/search" });
                if (q) window.location.assign(`/search?q=${encodeURIComponent(q)}`);
              }}
              className="h-9 w-full rounded-md border border-border bg-surface-2/50 pl-9 pr-16 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
              ⌘K
            </kbd>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 lg:gap-3">
          <Link
            to="/reservations/new"
            className="hidden items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-[12px] font-medium text-primary-foreground shadow-e1 transition hover:bg-primary-pressed lg:flex lg:px-3 lg:text-[13px]"
          >
            <Plus className="h-3.5 w-3.5" />
            New Reservation
          </Link>

          <div className="hidden xl:flex items-center gap-1.5 rounded-md border border-border bg-surface-2/60 px-2.5 py-1.5 text-[12px] text-text-secondary">
            <Calendar className="h-3.5 w-3.5" />
            Today · {formatToday()}
          </div>

          <button
            type="button"
            onClick={() => navigate({ to: "/notifications" })}
            className="relative rounded-md p-1.5 text-text-secondary hover:bg-surface-2 hover:text-text-primary sm:p-2"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
          </button>



          <div className="flex items-center gap-2 border-l border-border pl-2 sm:pl-3">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background shrink-0">
                {user?.initials ?? "—"}
              </div>
            )}
            <div className="hidden text-left lg:block">
              <div className="text-[12px] font-medium leading-tight text-text-primary">
                {user?.name ?? "Guest"}
              </div>
              <div className="text-[10px] text-text-secondary">
                {user ? ROLE_LABEL[user.role] : "Not signed in"}
              </div>
            </div>
          </div>
        </div>
      </header>
      <Dialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <DialogContent className="max-w-xl border-border bg-surface">
          <DialogHeader>
            <DialogTitle>Command Palette</DialogTitle>
            <DialogDescription>Jump to high-value workflows quickly.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type command..."
              className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
            <div className="max-h-[280px] space-y-1 overflow-y-auto">
              {filteredActions.map((action) => (
                <button
                  key={action.to}
                  onClick={() => {
                    setPaletteOpen(false);
                    setSearchQuery("");
                    navigate({ to: action.to });
                  }}
                  className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-left transition hover:bg-surface-2"
                >
                  <div className="text-[13px] text-text-primary">{action.label}</div>
                  <div className="text-[11px] text-text-secondary">{action.to}</div>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
