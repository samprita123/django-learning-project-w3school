import { APP_NAV_GROUPS, type NavItem } from "@/app/navigation/nav-config";
import type { FeatureKey } from "@/types/entitlements";
import type { Permission } from "@/types/rbac";

export type NavTrailEntry = {
  id: string;
  label: string;
  to?: string;
};

export type FlatNavRouteNode = {
  id: string;
  label: string;
  to: string;
  group: string;
  perm?: Permission;
  feature?: FeatureKey;
  trail: NavTrailEntry[];
};

export type ResolvedRouteNavigation = {
  group: string;
  label: string;
  linkTo: string;
  trail: NavTrailEntry[];
};

function isRouteMatch(pathname: string, route: string): boolean {
  if (route === "/") return pathname === "/";
  return pathname === route || pathname.startsWith(route + "/");
}

function flattenNavRoutes(): FlatNavRouteNode[] {
  const rows: FlatNavRouteNode[] = [];

  const walk = (nodes: NavItem[], groupTitle: string, ancestors: NavTrailEntry[]) => {
    for (const node of nodes) {
      const nextTrail: NavTrailEntry[] = [
        ...ancestors,
        { id: node.id, label: node.label, to: node.to },
      ];
      if (node.to) {
        rows.push({
          id: node.id,
          label: node.label,
          to: node.to,
          group: groupTitle,
          perm: node.perm,
          feature: node.feature,
          trail: nextTrail,
        });
      }
      if (node.children?.length) {
        walk(node.children, groupTitle, nextTrail);
      }
    }
  };

  for (const group of APP_NAV_GROUPS) {
    walk(group.nodes, group.title, []);
  }

  return rows;
}

const FLAT_NAV_ROUTES: FlatNavRouteNode[] = flattenNavRoutes();

export function getAllNavRouteNodes(): FlatNavRouteNode[] {
  return FLAT_NAV_ROUTES;
}

export function getBestMatchingRouteNode(pathname: string): FlatNavRouteNode | null {
  let best: FlatNavRouteNode | null = null;
  for (const node of FLAT_NAV_ROUTES) {
    if (!isRouteMatch(pathname, node.to)) continue;
    if (!best || node.to.length > best.to.length) best = node;
  }
  return best;
}

export function resolveRouteNavigation(pathname: string): ResolvedRouteNavigation {
  const match = getBestMatchingRouteNode(pathname);
  if (!match) {
    return {
      group: "Operations",
      label: "Dashboard",
      linkTo: "/",
      trail: [{ id: "dashboard", label: "Dashboard", to: "/" }],
    };
  }
  return {
    group: match.group,
    label: match.label,
    linkTo: match.to,
    trail: match.trail,
  };
}
