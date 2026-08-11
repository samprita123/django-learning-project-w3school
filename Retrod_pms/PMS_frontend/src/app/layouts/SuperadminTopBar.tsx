import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Palette } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROLE_LABEL } from "@/features/auth/lib/rbac";
import {
  APP_THEME_GROUP_LABELS,
  APP_THEMES,
  applyTheme,
  persistTheme,
  readSavedTheme,
  type AppTheme,
} from "@/app/theme/theme";

export function SuperadminTopBar({
  mobileNavButton,
}: {
  mobileNavButton?: React.ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const [theme, setTheme] = useState<AppTheme>(() => readSavedTheme());
  const selectedTheme = APP_THEMES.find((themeOption) => themeOption.value === theme) ?? APP_THEMES[0];

  const selectTheme = (next: AppTheme) => {
    setTheme(next);
    applyTheme(next);
    persistTheme(next);
  };

  const groupedThemes = APP_THEMES.reduce<Record<string, typeof APP_THEMES>>((acc, item) => {
    acc[item.group] = [...(acc[item.group] ?? []), item];
    return acc;
  }, {});

  // Simple superadmin breadcrumbs resolution
  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    return {
      group: "Superadmin",
      page: parts[1]
        ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1).replace("-", " ")
        : "Dashboard",
    };
  };

  const { group, page } = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-surface px-3 sm:gap-3 sm:px-4 lg:gap-4 lg:px-6">
      {mobileNavButton}
      <nav className="flex min-w-0 items-center gap-1.5 text-[12px] sm:text-[13px]">
        <span className="text-text-secondary font-medium text-primary uppercase tracking-wider text-[11px]">{group}</span>
        <span className="text-text-disabled">/</span>
        <span className="truncate font-semibold text-text-primary">
          {page}
        </span>
      </nav>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2 lg:gap-3">
        <div className="relative">
          <Palette className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
          <select
            value={theme}
            onChange={(e) => selectTheme(e.target.value as AppTheme)}
            className="h-8 max-w-[140px] rounded-md border border-border bg-surface pl-7 pr-7 text-[12px] text-text-primary sm:max-w-none"
            aria-label="Select theme"
          >
            {(Object.keys(groupedThemes) as Array<keyof typeof APP_THEME_GROUP_LABELS>).map((groupKey) => (
              <optgroup key={groupKey} label={APP_THEME_GROUP_LABELS[groupKey]}>
                {groupedThemes[groupKey].map((themeOption) => (
                  <option key={themeOption.value} value={themeOption.value}>
                    {themeOption.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="hidden items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 xl:flex">
          {selectedTheme.swatches.map((swatch, idx) => (
            <span
              key={`${selectedTheme.value}-${idx}`}
              className="h-2.5 w-2.5 rounded-full border border-border-subtle"
              style={{ backgroundColor: swatch }}
              title={selectedTheme.label}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 border-l border-border pl-2 sm:pl-3">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground shrink-0">
              {user?.initials ?? "SU"}
            </div>
          )}
          <div className="hidden text-left lg:block">
            <div className="text-[12px] font-semibold leading-tight text-text-primary">
              {user?.name ?? "Super Admin"}
            </div>
            <div className="text-[10px] text-text-secondary font-medium">
              Platform Admin
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
