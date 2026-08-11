import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { HelpCenterPanel } from "./HelpCenterPanel";
import {
  LayoutDashboard,
  CalendarRange,
  ConciergeBell,
  LayoutGrid,
  LogIn,
  Sparkles,
  Wrench,
  Users,
  MessageSquare,
  Receipt,
  CreditCard,
  TrendingUp,
  Globe2,
  BarChart3,
  Brain,
  LineChart,
  Gauge,
  BedDouble,
  UserCog,
  ScrollText,
  Building2,
  Settings,
  UsersRound,
  Building,
  ListTodo,
  Smartphone,
  Search,
  Plug,
  MessageCircle,
  Award,
  FileSignature,
  Gift,
  Puzzle,
  Globe,
  Car,
  MapPin,
  Layers,
  BellRing,
  Bell,
  HelpCircle,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Star,
  LogOut,
  ShieldCheck,
  Rocket,
  Pin,
  PinOff,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  Plus,
  Shirt,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { propertyApi } from "@/services/api/property";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROLE_LABEL } from "@/features/auth/lib/rbac";
import { APP_NAV_GROUPS } from "@/app/navigation/nav-config";
import type { NavItem } from "@/app/navigation/nav-config";
import { getAllNavRouteNodes } from "@/app/navigation/nav-utils";
import {
  movePinnedNavNode,
  readExpandedNavGroupIds,
  readPinnedNavNodeIds,
  toggleExpandedNavGroupId,
  togglePinnedNavNodeId,
} from "@/app/navigation/nav-personalization";

type IconType = React.ComponentType<{ className?: string }>;
const ICONS_BY_ROUTE: Record<string, IconType> = {
  "/": LayoutDashboard,
  "/dashboard/multi-property": Layers,
  "/front-desk": ConciergeBell,
  "/reservations": CalendarRange,
  "/check-in": LogIn,
  "/housekeeping": Sparkles,
  "/housekeeping/mobile": Smartphone,
  "/maintenance": Wrench,
  "/tasks": ListTodo,
  "/lost-found": Search,
  "/guests": Users,
  "/loyalty": Award,
  "/communications": MessageSquare,
  "/guest-requests": Smartphone,
  "/feedback": MessageCircle,
  "/registration-cards": FileSignature,
  "/billing": Receipt,
  "/payments": CreditCard,
  "/revenue": TrendingUp,
  "/rate-plans": TrendingUp,
  "/availability": CalendarRange,
  "/taxes-fees": Receipt,
  "/pricing": TrendingUp,
  "/channel-manager": Globe2,
  "/booking-engine": Globe,
  "/groups": UsersRound,
  "/corporate": Building,
  "/b2b-agents": Briefcase,
  "/packages": Gift,
  "/add-ons": Puzzle,
  "/concierge": BellRing,
  "/transport": Car,
  "/activities": MapPin,
  "/website-builder": Globe,
  "/reports": BarChart3,
  "/analytics/executive": LineChart,
  "/ai-insights": Brain,
  "/revenue/ai-dashboard": TrendingUp,
  "/rooms": BedDouble,
  "/staff": UserCog,
  "/roles": ShieldCheck,
  "/onboarding": Rocket,
  "/audit": ScrollText,
  "/property": Building2,
  "/settings": Settings,
  "/leads": UsersRound,
  "/hotels": Building2,
  "/services": ConciergeBell,
  "/notifications": BellRing,
  "/search": Search,
  "/activity-timeline": ScrollText,
  "/pms-integrations": Plug,
  "/revenue-drilldown": BarChart3,
  "/booking-readiness": Gauge,
  "/anomaly-monitor": ShieldCheck,
  "/laundry": Shirt,
};

const INITIAL_HOTELS = [
  { id: "1", name: "The Grand Palace", location: "New Delhi", rating: 5, properties: 4 },
  { id: "2", name: "Oceanview Resort", location: "Goa", rating: 4.5, properties: 2 },
  { id: "3", name: "Mountain Retreat", location: "Manali", rating: 4, properties: 1 },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const queryClient = useQueryClient();
  const [hotels, setHotels] = useState(INITIAL_HOTELS);
  const [activeHotelId, setActiveHotelId] = useState(hotels[0].id);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    propertyApi.getProperties()
      .then((data) => {
        if (data && data.length > 0) {
          const mapped = data.map((p) => ({
            id: p.id,
            name: p.name,
            location: p.city,
            rating: 5,
            properties: 1,
          }));
          setHotels(mapped);
          
          const savedActiveId = localStorage.getItem("retrod:active-property-id");
          const isValidSaved = mapped.some((h) => h.id === savedActiveId);
          if (isValidSaved && savedActiveId) {
            setActiveHotelId(savedActiveId);
          } else {
            setActiveHotelId(mapped[0].id);
            localStorage.setItem("retrod:active-property-id", mapped[0].id);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch properties from backend:", err);
      });
  }, []);

  const handleSelectHotel = (id: string) => {
    setActiveHotelId(id);
    localStorage.setItem("retrod:active-property-id", id);
    queryClient.invalidateQueries();
  };

  const activeHotel = hotels.find((h) => h.id === activeHotelId) || hotels[0];
  const [isAddHotelOpen, setIsAddHotelOpen] = useState(false);
  const [newHotelName, setNewHotelName] = useState("");
  const [newHotelLocation, setNewHotelLocation] = useState("");

  const handleAddHotel = () => {
    if (!newHotelName || !newHotelLocation) return;
    const newHotel = {
      id: Math.random().toString(36).substring(7),
      name: newHotelName,
      location: newHotelLocation,
      rating: 0,
      properties: 1,
    };
    setHotels([...hotels, newHotel]);
    setActiveHotelId(newHotel.id);
    setIsAddHotelOpen(false);
    setNewHotelName("");
    setNewHotelLocation("");
  };
  const isActive = (to: string) => {
    if (to === "/") return pathname === "/";
    if (pathname === to) return true;
    if (!pathname.startsWith(to + "/")) return false;
    const longerMatchExists = getAllNavRouteNodes().some(
      (node) =>
        node.to &&
        node.to !== to &&
        node.to.length > to.length &&
        (pathname === node.to || pathname.startsWith(node.to + "/"))
    );
    return !longerMatchExists;
  };
  const isNodeActive = (item: NavItem): boolean => {
    if (item.to && isActive(item.to)) return true;
    return item.children?.some(isNodeActive) ?? false;
  };
  const { user, logout, can, featureEnabled } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocusIndex, setSearchFocusIndex] = useState(0);
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => readPinnedNavNodeIds());
  const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>(() =>
    readExpandedNavGroupIds(),
  );
  const [expandedIds, setExpandedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("retrod.sidebar.expanded.v1");
      if (!raw) return [];
      const parsed = JSON.parse(raw) as string[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("retrod.sidebar.expanded.v1", JSON.stringify(expandedIds));
    }
  }, [expandedIds]);

  // Auto-expand groups and submenus that contain the active path on mount
  useEffect(() => {
    const activeGroupIds: string[] = [];
    const activeSubmenuIds: string[] = [];
    
    APP_NAV_GROUPS.forEach((group) => {
      if (group.nodes.some(isNodeActive)) {
        activeGroupIds.push(group.id);
      }
      
      const checkNodes = (nodes: NavItem[]) => {
        nodes.forEach((node) => {
          if (node.children?.length) {
            if (node.children.some(isNodeActive)) {
              activeSubmenuIds.push(node.id);
            }
            checkNodes(node.children);
          }
        });
      };
      checkNodes(group.nodes);
    });

    if (activeGroupIds.length > 0) {
      setExpandedGroupIds((prev) => Array.from(new Set([...prev, ...activeGroupIds])));
    }
    if (activeSubmenuIds.length > 0) {
      setExpandedIds((prev) => Array.from(new Set([...prev, ...activeSubmenuIds])));
    }
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const allRouteNodes = getAllNavRouteNodes().filter((node) => (node.perm ? can(node.perm) : true));

  const pinnedNodes = pinnedIds
    .map((id) => allRouteNodes.find((node) => node.id === id))
    .filter((node): node is NonNullable<typeof node> => !!node);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchedNodes = normalizedQuery
    ? allRouteNodes.filter((node) => {
        const haystack =
          `${node.label} ${node.group} ${node.trail.map((t) => t.label).join(" ")}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : [];

  useEffect(() => {
    setSearchFocusIndex(0);
  }, [normalizedQuery]);

  const togglePinned = (nodeId: string) => {
    setPinnedIds(togglePinnedNavNodeId(nodeId));
  };

  const movePinned = (fromIndex: number, toIndex: number) => {
    setPinnedIds(movePinnedNavNode(fromIndex, toIndex));
  };

  const toggleGroupExpanded = (groupId: string) => {
    setExpandedGroupIds(toggleExpandedNavGroupId(groupId));
  };

  const canAccessNode = (item: NavItem): boolean => {
    if (item.to)
      return (
        (item.perm ? can(item.perm) : true) && (item.feature ? featureEnabled(item.feature) : true)
      );
    if (item.children?.length) return item.children.some(canAccessNode);
    return false;
  };

  const renderNode = (item: NavItem, depth = 0, index = 0, total = 1): ReactNode => {
    if (!canAccessNode(item)) return null;
    const active = isNodeActive(item);
    const hasChildren = !!item.children?.length;
    const expanded = hasChildren && expandedIds.includes(item.id);
    const isLast = index === total - 1;

    if (hasChildren && item.children) {
      return (
        <li key={item.id} className="relative">
          {!collapsed && (
            <div className="absolute left-[-15px] top-0 bottom-0 w-[12px] pointer-events-none">
              {/* Top half vertical line */}
              <div
                className={cn(
                  "absolute left-[3px] w-px bg-sidebar-foreground/20",
                  index === 0 ? "top-[-20px] h-[38px]" : "top-[-4px] h-[22px]"
                )}
              />
              {/* Bottom half vertical line */}
              {!isLast && (
                <div className="absolute left-[3px] top-[18px] bottom-[-4px] w-px bg-sidebar-foreground/20" />
              )}
              {/* Horizontal branch with curve */}
              <div className="absolute left-[3px] top-[18px] w-[8px] h-[8px] -translate-y-1/2 border-l border-b border-sidebar-foreground/20 rounded-bl-[4px]" />
            </div>
          )}
          <button
            type="button"
            onClick={() => toggleExpand(item.id)}
            className={cn(
              "group relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors",
              depth === 0 ? "font-medium text-sidebar-foreground/85" : "text-sidebar-foreground/75",
              "hover:bg-sidebar-hover hover:text-sidebar-foreground",
              active && "bg-sidebar-hover text-sidebar-foreground",
              collapsed && depth === 0 && "justify-center px-0",
            )}
            title={collapsed ? item.label : undefined}
          >
            {depth === 0 && (
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-transform text-sidebar-muted/70",
                  expanded ? "rotate-0" : "-rotate-90",
                )}
              />
            )}
            {!collapsed && <span className="truncate">{item.label}</span>}
          </button>
          {!collapsed && expanded && item.children && (
            <ul className={cn("mt-0.5 space-y-0.5", depth === 0 ? "pl-[22px]" : "pl-[22px]")}>
              {item.children.map((child, idx) => renderNode(child, depth + 1, idx, item.children!.length))}
            </ul>
          )}
        </li>
      );
    }

    if (!item.to) return null;
    const ItemIcon = depth === 0 ? (ICONS_BY_ROUTE[item.to] ?? LayoutDashboard) : null;
    const pinned = pinnedIds.includes(item.id);
    const badgeText =
      item.id === "ai-revenue-dashboard" || item.id === "ai-insights"
        ? "AI"
        : item.id.startsWith("cm-")
          ? "CM"
          : undefined;
    return (
      <li key={item.id} className="relative">
        {!collapsed && (
          <div className="absolute left-[-15px] top-0 bottom-0 w-[12px] pointer-events-none">
            {/* Top half vertical line */}
            <div
              className={cn(
                "absolute left-[3px] w-px bg-sidebar-foreground/20",
                index === 0 ? "top-[-20px] h-[38px]" : "top-[-4px] h-[22px]"
              )}
            />
            {/* Bottom half vertical line */}
            {!isLast && (
              <div className="absolute left-[3px] top-[18px] bottom-[-4px] w-px bg-sidebar-foreground/20" />
            )}
            {/* Horizontal branch with curve */}
            <div className="absolute left-[3px] top-[18px] w-[8px] h-[8px] -translate-y-1/2 border-l border-b border-sidebar-foreground/20 rounded-bl-[4px]" />
          </div>
        )}
        <div className="group relative">
          <Link
            to={item.to}
            className={cn(
              "relative flex items-center gap-3 rounded-md px-3 py-2 pr-8 text-[13px] font-normal transition-colors",
              "text-sidebar-foreground/75 hover:bg-sidebar-hover",
              !active && "hover:text-sidebar-foreground",
              active && "bg-primary text-primary-foreground font-medium hover:bg-primary hover:text-primary-foreground",
              collapsed && depth === 0 && "justify-center px-0 pr-0",
              depth > 0 && !collapsed && "pl-5 text-[12.5px]",
              depth > 0 && !collapsed && !active && "text-sidebar-foreground/70",
            )}
            title={collapsed ? item.label : undefined}
          >
            {active && depth === 0 && (
              <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r bg-white" />
            )}
            {depth === 0 && ItemIcon ? (
              <ItemIcon className="h-[18px] w-[18px] shrink-0 stroke-[1.5]" />
            ) : null}
            {!collapsed && (
              <>
                <span className="truncate">{item.label}</span>
                {badgeText ? (
                  <span className="ml-auto rounded-sm border border-sidebar-border px-1 py-px text-[9px] uppercase tracking-wide text-sidebar-muted">
                    {badgeText}
                  </span>
                ) : null}
              </>
            )}
          </Link>
          {!collapsed && (
            <button
              type="button"
              onClick={() => togglePinned(item.id)}
              className={cn(
                "absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 transition",
                active 
                  ? "text-white hover:text-white/90" 
                  : pinned 
                    ? "text-primary" 
                    : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground",
                (pinned || active) ? "opacity-100" : "opacity-0 group-hover:opacity-100",
              )}
              aria-label={pinned ? `Unpin ${item.label}` : `Pin ${item.label}`}
              title={pinned ? "Unpin" : "Pin"}
            >
              {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </li>
    );
  };

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
            <Link
              to="/one"
              className="flex min-w-0 items-center gap-2 rounded-md transition hover:opacity-90"
            >
              <img src={logo} alt="Retrod Logo" className="h-7 w-auto object-contain" />
            </Link>
            <span className="label-uppercase shrink-0 text-[9px] !text-sidebar-muted">PMS</span>
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

      {/* Property switcher */}
      {!collapsed && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="mx-3 mt-3 flex items-center justify-between rounded-md border border-sidebar-border bg-sidebar-hover/40 px-3 py-2 text-left transition hover:bg-sidebar-hover outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium text-sidebar-foreground">
                  {activeHotel.name}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-sidebar-muted">
                  <span>{activeHotel.location}</span>
                  <span className="opacity-50">·</span>
                  <span className="flex items-center gap-0.5">
                    <Star className="h-2.5 w-2.5 fill-[var(--color-gold)] text-[var(--color-gold)]" />{activeHotel.rating}
                  </span>
                  <span className="opacity-50">·</span>
                  <span>{activeHotel.properties} properties</span>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-sidebar-muted" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[214px] ml-3" align="start">
            <DropdownMenuLabel className="text-xs text-sidebar-muted">Select Property</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {hotels.map((hotel) => (
                <DropdownMenuItem 
                  key={hotel.id} 
                  onClick={() => handleSelectHotel(hotel.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-medium">{hotel.name}</span>
                    <span className="text-[11px] text-muted-foreground">{hotel.location}</span>
                  </div>
                  {activeHotelId === hotel.id && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-sidebar-muted focus:text-sidebar-foreground"
              onSelect={(e) => {
                e.preventDefault();
                setIsAddHotelOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="text-[13px] font-medium">Add Hotel</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Nav */}
      <nav className="scrollbar-thin mt-4 flex-1 overflow-y-auto px-2 pb-4">
        {!collapsed && (
          <div className="mb-3 px-1">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sidebar-muted" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (searchedNodes.length === 0) return;
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSearchFocusIndex((prev) => Math.min(prev + 1, searchedNodes.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSearchFocusIndex((prev) => Math.max(prev - 1, 0));
                  } else if (e.key === "Enter") {
                    const target = searchedNodes[searchFocusIndex];
                    if (target) {
                      window.location.assign(target.to);
                    }
                  }
                }}
                placeholder="Search menu..."
                className="h-8 w-full rounded-md border border-sidebar-border bg-sidebar-hover/40 pl-8 pr-2 text-[12px] text-sidebar-foreground placeholder:text-sidebar-muted focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        {!collapsed && normalizedQuery.length > 0 && (
          <div className="mb-4">
            <div className="px-3 pb-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-sidebar-muted">
              Search Results
            </div>
            <ul className="space-y-0.5">
              {searchedNodes.slice(0, 8).map((node) => (
                <li key={`search-${node.id}`}>
                  <Link
                    to={node.to}
                    className={cn(
                      "block rounded-md px-3 py-2 text-[12px] text-sidebar-foreground/80 hover:bg-sidebar-hover",
                      searchedNodes[searchFocusIndex]?.id === node.id && "bg-sidebar-hover",
                    )}
                  >
                    <div className="truncate">{node.label}</div>
                    <div className="truncate text-[10px] text-sidebar-muted">{node.group}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!collapsed && normalizedQuery.length === 0 && pinnedNodes.length > 0 && (
          <div className="mb-4">
            <div className="px-3 pb-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-sidebar-muted">
              Pinned
            </div>
            <ul className="space-y-0.5">
              {pinnedNodes.map((node) => (
                <li key={`pinned-${node.id}`}>
                  <div className="group flex items-center gap-1">
                    <Link
                      to={node.to}
                      className={cn(
                        "flex-1 rounded-md px-3 py-2 text-[12px] transition",
                        isActive(node.to)
                          ? "bg-primary text-primary-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-hover",
                      )}
                    >
                      {node.label}
                    </Link>
                    <div className="hidden items-center gap-0.5 group-hover:flex">
                      <button
                        type="button"
                        onClick={() =>
                          movePinned(
                            pinnedNodes.findIndex((n) => n.id === node.id),
                            pinnedNodes.findIndex((n) => n.id === node.id) - 1,
                          )
                        }
                        className="rounded p-1 text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
                        aria-label={`Move ${node.label} up`}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          movePinned(
                            pinnedNodes.findIndex((n) => n.id === node.id),
                            pinnedNodes.findIndex((n) => n.id === node.id) + 1,
                          )
                        }
                        className="rounded p-1 text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
                        aria-label={`Move ${node.label} down`}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {normalizedQuery.length === 0 &&
          APP_NAV_GROUPS.map((group, index) => {
            const visibleItems = group.nodes.filter(canAccessNode);
            if (visibleItems.length === 0) return null;
            const groupExpanded = expandedGroupIds.includes(group.id);
            return (
              <div
                key={group.title}
                className={cn(
                  "mb-1.5",
                  index > 0 && !collapsed && "mt-3 pt-2.5 border-t border-sidebar-border/20"
                )}
              >
                {!collapsed && (
                  <button
                    type="button"
                    onClick={() => toggleGroupExpanded(group.id)}
                    className="flex w-full items-center gap-2 px-3 py-1 text-left text-[14px] font-semibold text-sidebar-muted/80 hover:text-sidebar-foreground transition-colors"
                  >
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-transform text-sidebar-muted/70 translate-y-[1px]",
                        groupExpanded ? "rotate-0" : "-rotate-90",
                      )}
                    />
                    <span>{group.title}</span>
                  </button>
                )}
                {(collapsed || groupExpanded) && (
                  <ul className={cn("space-y-0.5", !collapsed && "pl-4")}>
                    {visibleItems.map((item, idx) => renderNode(item, 0, idx, visibleItems.length))}
                  </ul>
                )}
              </div>
            );
          })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border p-2">
        <button
          onClick={() => setIsHelpOpen(true)}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] text-sidebar-foreground/85 hover:bg-sidebar-hover",
            collapsed && "justify-center px-0",
          )}
        >
          <HelpCircle className="h-[18px] w-[18px] stroke-[1.5]" />
          {!collapsed && <span>Help Center</span>}
        </button>
        <HelpCenterPanel open={isHelpOpen} onOpenChange={setIsHelpOpen} />

        {!collapsed ? (
          <div className="mt-2 flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-hover/40 p-2">
            <Link to="/settings" className="flex items-center gap-2 min-w-0 flex-1 hover:opacity-80 transition-opacity">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground shrink-0">
                  {user?.initials ?? "—"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-medium text-sidebar-foreground">{user?.name ?? "Guest"}</div>
                <div className="truncate text-[10px] text-sidebar-muted">
                  {user ? ROLE_LABEL[user.role] : "Not signed in"}
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
                  {user?.initials ?? "—"}
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

      <Dialog open={isAddHotelOpen} onOpenChange={setIsAddHotelOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Hotel</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">Hotel Name</label>
              <Input 
                id="name" 
                value={newHotelName} 
                onChange={(e) => setNewHotelName(e.target.value)} 
                placeholder="e.g. Oceanview Resort" 
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="location" className="text-sm font-medium">Location</label>
              <Input 
                id="location" 
                value={newHotelLocation} 
                onChange={(e) => setNewHotelLocation(e.target.value)} 
                placeholder="e.g. Goa" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddHotelOpen(false)}>Cancel</Button>
            <Button onClick={handleAddHotel}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
