import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  Home,
  CreditCard,
  Settings,
  LayoutGrid,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Bell,
  HelpCircle,
  ShieldCheck,
  Users,
  Layers,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROLE_LABEL } from "@/features/auth/lib/rbac";

export function SuperadminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");
  const { user, logout } = useAuth();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const NAV_ITEMS = [
    { label: "Dashboard", to: "/superadmin/dashboard", icon: LayoutDashboard },
    { label: "Hospitality Partner", to: "/superadmin/tenants", icon: Building2 },
    { label: "Property Onboarding", to: "/superadmin/properties", icon: Home },
    { label: "Subscription Plans", to: "/superadmin/subscriptions", icon: CreditCard },
    { label: "Products & Features", to: "/superadmin/products", icon: Layers },
    {
      label: "User Management",
      icon: Users,
      children: [
        { label: "Existing Platform Users", to: "/superadmin/users" },
        { label: "Role Management", to: "/superadmin/roles" },
      ]
    },
    {
      label: "Security & Auditing",
      icon: ShieldCheck,
      children: [
        { label: "IP Whitelisting", to: "/superadmin/ip-whitelist" },
        { label: "Audit Logs", to: "/superadmin/audit-logs" },
      ]
    },
    { label: "Settings", to: "/superadmin/settings", icon: Settings },
  ];



  return (
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-[64px]" : "w-[240px]",
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        {!collapsed ? (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Link to="/one" className="flex min-w-0 items-center gap-2 rounded-md transition hover:opacity-90">
              <img src={logo} alt="Retrod Logo" className="h-7 w-auto object-contain" />
            </Link>
            <span className="label-uppercase shrink-0 text-[8px] bg-primary/20 text-primary px-1 rounded font-medium">SUPER</span>
          </div>
        ) : (
          <Link
            to="/one"
            className="mx-auto flex items-center justify-center transition hover:opacity-90"
            title="Retrod One"
          >
            <img src={logo} alt="Retrod Logo" className="h-6 w-6 object-contain" />
          </Link>
        )}
      </div>

      {/* Launcher */}
      {!collapsed && (
        <Link
          to="/one"
          className="mx-3 mt-4 flex items-center gap-2 rounded-md border border-sidebar-border/80 bg-sidebar-hover/30 px-3 py-2 text-[12px] font-medium text-sidebar-foreground transition hover:bg-sidebar-hover"
        >
          <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
          Retrod One Launcher
        </Link>
      )}

      <nav className="scrollbar-thin mt-6 flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        <ul className="space-y-0.5 mt-2">
          {NAV_ITEMS.map((item, idx) => {
            const isLast = idx === NAV_ITEMS.length - 1;
            if ("children" in item && item.children) {
              const hasActiveChild = item.children.some(child => isActive(child.to));
              const isOpen = openMenus[item.label] ?? hasActiveChild;
              const Icon = item.icon;

              return (
                <li key={item.label} className="relative space-y-0.5">

                  <button
                    onClick={() => {
                      if (collapsed) {
                        onToggle();
                      }
                      setOpenMenus(prev => ({ ...prev, [item.label]: !isOpen }));
                    }}
                    className={cn(
                      "relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] font-normal transition-colors text-left cursor-pointer",
                      "text-sidebar-foreground/75 hover:bg-sidebar-hover hover:text-sidebar-foreground",
                      hasActiveChild && "text-primary bg-primary/10 hover:bg-primary/15 font-medium",
                      collapsed && "justify-center px-0 pr-0",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0 stroke-[1.5]" />
                    {!collapsed && (
                      <>
                        <span className="truncate flex-1">{item.label}</span>
                        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform duration-200 text-sidebar-muted/70", isOpen ? "rotate-0" : "-rotate-90")} />
                      </>
                    )}
                  </button>
                  {!collapsed && isOpen && (
                    <ul className="mt-0.5 pl-[22px] space-y-0.5 relative">
                      {item.children.map((child, cIdx) => {
                        const childActive = isActive(child.to);
                        const isChildLast = cIdx === item.children.length - 1;
                        return (
                          <li key={child.to} className="relative">
                            {!collapsed && (
                              <div className="absolute left-[-15px] top-0 bottom-0 w-[12px] pointer-events-none">
                                {/* Top half vertical line */}
                                <div
                                  className={cn(
                                    "absolute left-[3px] w-px bg-sidebar-foreground/20",
                                    cIdx === 0 ? "top-[-20px] h-[38px]" : "top-[-4px] h-[22px]"
                                  )}
                                />
                                {/* Bottom half vertical line */}
                                {!isChildLast && (
                                  <div className="absolute left-[3px] top-[18px] bottom-[-4px] w-px bg-sidebar-foreground/20" />
                                )}
                                {/* Horizontal branch with curve */}
                                <div className="absolute left-[3px] top-[18px] w-[8px] h-[8px] -translate-y-1/2 border-l border-b border-sidebar-foreground/20 rounded-bl-[4px]" />
                              </div>
                            )}
                            <Link
                              to={child.to}
                              className={cn(
                                "flex items-center gap-2 rounded-md py-1.5 px-3 text-[12.5px] font-normal transition-colors",
                                "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-hover/40",
                                childActive && "text-primary font-semibold bg-primary/5",
                                !collapsed && "pl-5 text-[12.5px]",
                              )}
                            >
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            const active = isActive(item.to);
            const Icon = item.icon;

            return (
              <li key={item.to} className="relative">

                <Link
                  to={item.to}
                  className={cn(
                    "relative flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-normal transition-colors",
                    "text-sidebar-foreground/75 hover:bg-sidebar-hover",
                    !active && "hover:text-sidebar-foreground",
                    active && "bg-primary text-primary-foreground font-medium hover:bg-primary hover:text-primary-foreground",
                    collapsed && "justify-center px-0 pr-0",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {active && (
                    <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r bg-white" />
                  )}
                  <Icon className="h-[18px] w-[18px] shrink-0 stroke-[1.5]" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border p-2">
        <button
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] text-sidebar-foreground/85 hover:bg-sidebar-hover",
            collapsed && "justify-center px-0",
          )}
        >
          <Bell className="h-[18px] w-[18px] stroke-[1.5]" />
          {!collapsed && (
            <>
              <span>Platform Alerts</span>
              <span className="ml-auto rounded-sm bg-primary px-1.5 py-px text-[10px] font-medium text-primary-foreground">
                0
              </span>
            </>
          )}
        </button>
        <Link
          to="/superadmin/manual"
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] text-sidebar-foreground/85 hover:bg-sidebar-hover",
            collapsed && "justify-center px-0",
            isActive("/superadmin/manual") && "bg-sidebar-hover text-sidebar-foreground font-semibold"
          )}
        >
          <HelpCircle className="h-[18px] w-[18px] stroke-[1.5]" />
          {!collapsed && <span>User Manual</span>}
        </Link>

        {!collapsed ? (
          <div className="mt-2 flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-hover/40 p-2">
            <Link to="/settings" className="flex items-center gap-2 min-w-0 flex-1 hover:opacity-80 transition-opacity">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground shrink-0">
                  {user?.initials ?? "SU"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-medium text-sidebar-foreground">{user?.name ?? "Super Admin"}</div>
                <div className="truncate text-[10px] text-sidebar-muted">
                  {user ? ROLE_LABEL[user.role] : "Platform Owner"}
                </div>
              </div>
            </Link>
            <button
              onClick={logout}
              className="rounded p-1 text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground shrink-0"
              aria-label="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="mt-2 flex justify-center">
            <Link to="/settings" title="Profile Settings" className="hover:opacity-80 transition-opacity">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground">
                  {user?.initials ?? "SU"}
                </div>
              )}
            </Link>
          </div>
        )}

        <button
          onClick={onToggle}
          className={cn(
            "mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2 text-[12px] text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
