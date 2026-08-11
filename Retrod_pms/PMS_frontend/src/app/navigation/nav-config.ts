import type { Permission } from "@/types/rbac";
import type { FeatureKey } from "@/types/entitlements";

export type NavItem = {
  id: string;
  label: string;
  to?: string;
  perm?: Permission;
  feature?: FeatureKey;
  children?: NavItem[];
};

export type NavGroup = {
  id: string;
  title: string;
  nodes: NavItem[];
};

export const APP_NAV_GROUPS: NavGroup[] = [
  {
    id: "operations",
    title: "Operations",
    nodes: [
      { id: "dashboard", label: "Dashboard", to: "/", perm: "dashboard.view" },
      { id: "leads", label: "Leads", to: "/leads", perm: "dashboard.view" },
      // {
      //   id: "front-office",
      //   label: "Front Office",
      //   children: [
      //     { id: "front-desk", label: "Front Desk", to: "/front-desk", perm: "frontdesk.view" },
      //     {
      //       id: "checkin-out",
      //       label: "Check-In / Out",
      //       to: "/check-in",
      //       perm: "frontdesk.checkin",
      //     },
      //   ],
      // },
      {
        id: "reservations",
        label: "Reservations",
        children: [
          {
            id: "reservations-list",
            label: "Reservations List",
            to: "/reservations",
            perm: "reservations.view",
          },
          {
            id: "new-reservation",
            label: "New Reservation",
            to: "/reservations/new",
            perm: "reservations.create",
          },
          { id: "group-bookings", label: "Group Bookings", to: "/groups", perm: "reservations.view" },
          { id: "event-bookings", label: "Event Bookings", to: "/events", perm: "reservations.view" },
          {
            id: "corporate-accounts",
            label: "Corporate Accounts",
            to: "/corporate",
            perm: "reservations.view",
          },
          {
            id: "b2b-agents",
            label: "B2B Partners",
            to: "/b2b-agents",
            perm: "reservations.view",
          },
        ],
      },
      {
        id: "housekeeping",
        label: "Housekeeping",
        children: [
          {
            id: "housekeeping-main",
            label: "Room Operations",
            to: "/housekeeping",
            perm: "housekeeping.view",
          },
          { id: "lost-found", label: "Lost & Found", to: "/lost-found", perm: "housekeeping.view" },
        ],
      },
      { id: "maintenance", label: "Maintenance", to: "/maintenance", perm: "maintenance.view" },
      {
        id: "laundry",
        label: "Laundry Mgmt",
        to: "/laundry",
        perm: "dashboard.view",
      },
      {
        id: "multi-property",
        label: "Multi-Property",
        to: "/dashboard/multi-property",
        perm: "dashboard.view",
      },
    ],
  },
  {
    id: "guest-experience",
    title: "Guests",
    nodes: [
      {
        id: "notifications",
        label: "Notification Center",
        to: "/notifications",
        perm: "dashboard.view",
      },
      { id: "guest-profiles", label: "Guest Profiles", to: "/guests", perm: "guests.view" },
      { id: "loyalty", label: "Loyalty Program", to: "/loyalty", perm: "guests.view" },
      {
        id: "communications",
        label: "Communications",
        to: "/communications",
        perm: "guests.view",
      },
      {
        id: "guest-requests",
        label: "Guest Requests",
        to: "/guest-requests",
        perm: "guests.view",
      },
      { id: "feedback", label: "Guest Feedback", to: "/feedback", perm: "guests.view" },
      {
        id: "registration-cards",
        label: "Registration Cards",
        to: "/registration-cards",
        perm: "guests.view",
      },
    ],
  },
  {
    id: "commerce-revenue",
    title: "Commercial",
    nodes: [
      {
        id: "billing-payments",
        label: "Billing & Payments",
        children: [
          { id: "billing", label: "Billing & Invoicing", to: "/billing", perm: "billing.view" },
          { id: "payments", label: "Payments", to: "/payments", perm: "billing.view" },
          { id: "taxes-fees", label: "Taxes & Fees", to: "/taxes-fees", perm: "billing.view" },
        ],
      },
      {
        id: "revenue-yield",
        label: "Revenue & Yield",
        children: [
          { id: "revenue", label: "Revenue Mgmt", to: "/revenue", perm: "rates.view" },
          { id: "rate-plans", label: "Rate Plans", to: "/rate-plans", perm: "rates.view" },
          { id: "availability", label: "Availability", to: "/availability", perm: "rates.view" },
          { id: "dynamic-pricing", label: "Dynamic Pricing", to: "/pricing", perm: "rates.view" },
          {
            id: "revenue-drilldown",
            label: "Revenue Drilldown",
            to: "/revenue-drilldown",
            perm: "reports.view",
          },
          {
            id: "ai-revenue-dashboard",
            label: "AI Revenue Dashboard",
            to: "/revenue/ai-dashboard",
            perm: "dashboard.view",
          },
        ],
      },
      {
        id: "channel-manager",
        label: "Channel Manager",
        to: "/channel-manager",
        perm: "rates.view",
        feature: "channelManager",
      },
      {
        id: "website-booking",
        label: "Website & Booking",
        children: [
          {
            id: "website-builder",
            label: "Website Builder",
            to: "/website-builder",
            perm: "settings.view",
            feature: "websiteBuilder",
          },
          {
            id: "booking-engine",
            label: "Booking Engine",
            to: "/booking-engine",
            perm: "settings.view",
            feature: "bookingEngine",
          },
          {
            id: "booking-readiness",
            label: "Booking Readiness",
            to: "/booking-readiness",
            perm: "reports.view",
            feature: "bookingEngine",
          },
        ],
      },
    ],
  },
  {
    id: "analytics",
    title: "Intelligence",
    nodes: [
      { id: "global-search", label: "Global Search", to: "/search", perm: "dashboard.view" },
      {
        id: "activity-timeline",
        label: "Activity Timeline",
        to: "/activity-timeline",
        perm: "dashboard.view",
      },
      { id: "reports", label: "Reports & Analytics", to: "/reports", perm: "reports.view" },
      {
        id: "executive-analytics",
        label: "Executive Analytics",
        to: "/analytics/executive",
        perm: "dashboard.view",
      },
      {
        id: "ai-insights",
        label: "AI Insights",
        to: "/ai-insights",
        perm: "dashboard.view",
        feature: "revenueAi",
      },
      {
        id: "anomaly-monitor",
        label: "AI Anomaly Monitor",
        to: "/anomaly-monitor",
        perm: "dashboard.view",
        feature: "revenueAi",
      },
    ],
  },
  {
    id: "administration",
    title: "Administration",
    nodes: [
      { id: "hotels", label: "Hotels", to: "/hotels", perm: "dashboard.view" },
      { id: "rooms", label: "Rooms & Inventory", to: "/rooms", perm: "rooms.view" },
      { id: "buildings-floors", label: "Building & Floor", to: "/buildings-floors", perm: "rooms.view" },
      { id: "packages", label: "Packages", to: "/packages", perm: "packages.view" },
      { id: "services", label: "Services", to: "/services", perm: "dashboard.view" },
      { id: "staff", label: "Staff Management", to: "/staff", perm: "staff.view" },
      { id: "roles", label: "Roles & Permissions", to: "/roles", perm: "roles.view" },
      { id: "night-audit", label: "Night Audit", to: "/night-audit", perm: "dashboard.view" },
      { id: "audit", label: "Audit Logs", to: "/audit", perm: "audit.view" },
      { id: "settings", label: "System Setup", to: "/settings", perm: "settings.view" },
    ],
  },
];

export function getGroupNodes(groupId: string): NavItem[] {
  return APP_NAV_GROUPS.find((group) => group.id === groupId)?.nodes ?? [];
}

export function findNavNodeById(nodeId: string): NavItem | null {
  const stack: NavItem[] = APP_NAV_GROUPS.flatMap((group) => group.nodes);
  while (stack.length) {
    const node = stack.shift()!;
    if (node.id === nodeId) return node;
    if (node.children?.length) stack.push(...node.children);
  }
  return null;
}

export const CHANNEL_MANAGER_NAV: NavItem[] = [
  {
    id: "cm-dashboard",
    label: "Dashboard",
    to: "/channel-manager",
    perm: "rates.view",
    feature: "channelManager",
  },
  {
    id: "cm-connections",
    label: "OTA Connections",
    to: "/channel-manager/connections",
    perm: "rates.view",
    feature: "channelManager",
  },
  {
    id: "cm-room-mapping",
    label: "Room Mapping",
    to: "/channel-manager/room-mapping",
    perm: "rates.view",
    feature: "channelManager",
  },
  {
    id: "cm-rate-plan-mapping",
    label: "Rate Plan Mapping",
    to: "/channel-manager/rate-plans",
    perm: "rates.view",
    feature: "channelManager",
  },
  {
    id: "cm-inventory",
    label: "Inventory",
    to: "/channel-manager/inventory",
    perm: "rates.view",
    feature: "channelManager",
  },
  {
    id: "cm-availability",
    label: "Availability Calendar",
    to: "/channel-manager/availability",
    perm: "rates.view",
    feature: "channelManager",
  },
  {
    id: "cm-rates",
    label: "Rate Calendar",
    to: "/channel-manager/rates",
    perm: "rates.view",
    feature: "channelManager",
  },
  {
    id: "cm-res-sync",
    label: "Reservation Sync",
    to: "/channel-manager/reservations",
    perm: "rates.view",
    feature: "channelManager",
  },
  {
    id: "cm-sync-logs",
    label: "Sync Logs",
    to: "/channel-manager/sync-logs",
    perm: "rates.view",
    feature: "channelManager",
  },
  {
    id: "cm-incidents",
    label: "Incident Console",
    to: "/channel-manager/incidents",
    perm: "rates.view",
    feature: "channelManager",
  },
  {
    id: "cm-revenue",
    label: "OTA Revenue",
    to: "/channel-manager/revenue",
    perm: "rates.view",
    feature: "channelManager",
  },
  {
    id: "cm-property-content",
    label: "Property Content",
    to: "/channel-manager/property-content",
    perm: "rates.view",
    feature: "channelManager",
  },
  {
    id: "cm-room-content",
    label: "Room Content",
    to: "/channel-manager/room-content",
    perm: "rates.view",
    feature: "channelManager",
  },
  {
    id: "cm-images",
    label: "Image Management",
    to: "/channel-manager/images",
    perm: "rates.view",
    feature: "channelManager",
  },
  {
    id: "cm-restrictions",
    label: "Restrictions",
    to: "/channel-manager/restrictions",
    perm: "rates.view",
    feature: "channelManager",
  },
  {
    id: "cm-multi-property",
    label: "Multi-Property",
    to: "/channel-manager/multi-property",
    perm: "rates.view",
    feature: "channelManager",
  },
  {
    id: "cm-analytics",
    label: "Performance Analytics",
    to: "/channel-manager/analytics",
    perm: "rates.view",
    feature: "channelManager",
  },
];

function routeLabelMap(): Map<string, { group: string; label: string }> {
  const entries = new Map<string, { group: string; label: string }>();
  const traverse = (nodes: NavItem[], groupTitle: string) => {
    for (const node of nodes) {
      if (node.to) entries.set(node.to, { group: groupTitle, label: node.label });
      if (node.children?.length) traverse(node.children, groupTitle);
    }
  };
  for (const group of APP_NAV_GROUPS) {
    traverse(group.nodes, group.title);
  }
  return entries;
}

const ROUTE_META = routeLabelMap();

export function getRouteContext(pathname: string): {
  group: string;
  label: string;
  linkTo: string;
} {
  const direct = ROUTE_META.get(pathname);
  if (direct) return { group: direct.group, label: direct.label, linkTo: pathname };

  for (const [route, meta] of ROUTE_META.entries()) {
    if (route !== "/" && pathname.startsWith(route + "/")) {
      return { group: meta.group, label: meta.label, linkTo: route };
    }
  }

  return { group: "Operations", label: "Dashboard", linkTo: "/" };
}
