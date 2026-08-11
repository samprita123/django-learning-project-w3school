import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  LayoutGrid,
  Package,
  Receipt,
  ShoppingBag,
  UtensilsCrossed,
  Settings,
} from "lucide-react";

export type PosNavItem = {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
};

export const POS_NAV_ITEMS: PosNavItem[] = [
  { id: "orders", label: "Orders", to: "/pos", icon: ShoppingBag },
  { id: "kot", label: "Kitchen (KOT)", to: "/pos/kot", icon: ClipboardList },
  { id: "billing", label: "Billing", to: "/pos/billing", icon: Receipt },
  { id: "inventory", label: "Inventory", to: "/pos/inventory", icon: Package },
  { id: "menu", label: "Menu", to: "/pos/menu", icon: UtensilsCrossed },
  { id: "settings", label: "Settings", to: "/pos/settings", icon: Settings },
];

export function getPosRouteMeta(pathname: string): { label: string; linkTo: string } {
  const item = POS_NAV_ITEMS.find((nav) =>
    nav.to === "/pos" ? pathname === "/pos" : pathname.startsWith(nav.to),
  );
  return { label: item?.label ?? "Point of Sale", linkTo: item?.to ?? "/pos" };
}
