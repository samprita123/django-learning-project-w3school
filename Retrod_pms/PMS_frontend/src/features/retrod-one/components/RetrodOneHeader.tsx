import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  ChevronDown,
  HelpCircle,
  LayoutGrid,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROLE_LABEL } from "@/features/auth/lib/rbac";
import { hotelRegistry } from "@/features/core/data/catalog";
import {
  APP_THEMES,
  applyTheme,
  persistTheme,
  readSavedTheme,
  type AppTheme,
} from "@/app/theme/theme";
import { cn } from "@/lib/utils";

export function RetrodOneHeader() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState<AppTheme>(() => readSavedTheme());

  const properties = useMemo(() => {
    if (user && user.properties && user.properties.length > 0) {
      return user.properties.map((p) => p.name);
    }
    return hotelRegistry.map((h) => h.name);
  }, [user]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const next: AppTheme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    persistTheme(next);
  };

  const firstName = user?.name?.split(" ")[0] ?? "Guest";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6">
        <Link to="/one" className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar text-sidebar-foreground shadow-e1">
            <LayoutGrid className="h-4 w-4" aria-hidden />
          </div>
          <div className="hidden sm:block">
            <div className="font-display text-[15px] font-semibold leading-none text-text-primary">
              Retrod One
            </div>
            <div className="text-[10px] text-text-secondary">Hospitality Operating System</div>
          </div>
        </Link>

        <div className="relative mx-2 hidden min-w-0 flex-1 md:block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-disabled"
            aria-hidden
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applications, actions, and modules…"
            aria-label="Search platform"
            className="h-9 w-full max-w-xl rounded-lg border border-border bg-background pl-9 pr-3 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-2 text-text-secondary transition hover:bg-surface-2 hover:text-text-primary"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            className="relative rounded-lg p-2 text-text-secondary transition hover:bg-surface-2 hover:text-text-primary"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error ring-2 ring-surface" />
          </button>

          <button
            type="button"
            className="hidden rounded-lg p-2 text-text-secondary transition hover:bg-surface-2 hover:text-text-primary sm:inline-flex"
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface px-2 py-1.5 text-left transition hover:bg-surface-2 sm:px-2.5"
                aria-label="User menu"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar text-[11px] font-semibold text-sidebar-foreground shrink-0">
                    {user?.initials ?? "—"}
                  </div>
                )}
                <div className="hidden lg:block">
                  <div className="text-[12px] font-medium leading-tight text-text-primary">
                    {user?.name ?? "Guest"}
                  </div>
                  <div className="text-[10px] text-text-secondary">
                    {user ? ROLE_LABEL[user.role] : "Not signed in"}
                  </div>
                </div>
                <ChevronDown className="hidden h-3.5 w-3.5 text-text-secondary lg:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-border bg-surface">
              <DropdownMenuLabel>Signed in as {firstName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => navigate({ to: "/settings" })}>
                <User className="h-4 w-4" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => navigate({ to: user?.role === "super_admin" ? "/superadmin/settings" : "/settings" })}>
                <Settings className="h-4 w-4" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-error focus:text-error"
                onClick={() => {
                  logout();
                  navigate({ to: "/login" });
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function DropdownMenuSubMenu({
  properties,
  current,
  onSelect,
}: {
  properties: string[];
  current?: string;
  onSelect: (property: string) => void;
}) {
  return (
    <>
      <DropdownMenuLabel className="flex items-center gap-2 text-[11px] font-normal text-text-secondary">
        <Building2 className="h-3.5 w-3.5" />
        Switch Property
      </DropdownMenuLabel>
      {properties.map((property) => (
        <DropdownMenuItem
          key={property}
          className={cn(
            "cursor-pointer pl-6",
            property === current && "bg-primary-tint/40 text-primary-pressed",
          )}
          onClick={() => onSelect(property)}
        >
          {property}
        </DropdownMenuItem>
      ))}
    </>
  );
}

export function RetrodOneThemeHint() {
  const coreThemes = APP_THEMES.filter((t) => t.group === "core");
  return (
    <p className="sr-only">
      Available themes: {coreThemes.map((t) => t.label).join(", ")}
    </p>
  );
}
