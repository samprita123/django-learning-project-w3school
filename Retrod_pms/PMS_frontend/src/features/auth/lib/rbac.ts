import { Role, Permission } from "@/types/rbac";
export type { Role, Permission };

export const ALL_PERMISSIONS: Permission[] = [
  "dashboard.view",
  "reservations.view",
  "reservations.create",
  "reservations.edit",
  "reservations.delete",
  "rooms.view",
  "rooms.create",
  "rooms.edit",
  "rooms.delete",
  "staff.view",
  "staff.create",
  "staff.edit",
  "staff.delete",
  "roles.view",
  "roles.create",
  "roles.edit",
  "roles.delete",
  "guests.view",
  "guests.create",
  "guests.edit",
  "guests.delete",
  "billing.view",
  "billing.create",
  "billing.edit",
  "billing.delete",
  "rates.view",
  "rates.create",
  "rates.edit",
  "rates.delete",
  "packages.view",
  "packages.create",
  "packages.edit",
  "packages.delete",
  "services.view",
  "services.create",
  "services.edit",
  "services.delete",
  "housekeeping.view",
  "housekeeping.edit",
  "maintenance.view",
  "maintenance.create",
  "maintenance.edit",
  "maintenance.delete",
  "audit.view",
  "settings.view",
  "settings.edit"
];

export const ROLE_LABEL: Record<string, string> = {
  super_admin: "Retrod Super Admin",
  owner: "Owner",
  general_manager: "General Manager",
  front_office_manager: "Front Office Manager",
  front_desk_agent: "Front Desk Agent",
  housekeeping_supervisor: "Housekeeping Supervisor",
  accounts: "Accounts & Finance",
  revenue_manager: "Revenue Manager",
};

export const ROLE_DESCRIPTION: Record<string, string> = {
  super_admin: "Retrod system-level super administration & configuration controls.",
  owner: "Full multi-property access. Onboarding, billing, all data.",
  general_manager: "Full property access. All operations & reports.",
  front_office_manager: "Reservations, check-in/out, folios, room moves.",
  front_desk_agent: "Day-to-day front desk operations.",
  housekeeping_supervisor: "Room status, HK assignments, lost & found.",
  accounts: "Folios, payments, refunds, AR, financial reports.",
  revenue_manager: "Rates, restrictions, OTA, forecasts.",
};

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: [...ALL_PERMISSIONS],
  owner: [...ALL_PERMISSIONS],
  general_manager: [...ALL_PERMISSIONS],
  front_office_manager: [
    "dashboard.view", "reservations.view", "reservations.create", "reservations.edit", "reservations.delete",
    "guests.view", "guests.create", "guests.edit", "billing.view", "billing.create", "billing.edit",
    "housekeeping.view", "audit.view"
  ],
  front_desk_agent: [
    "dashboard.view", "reservations.view", "reservations.create", "reservations.edit",
    "guests.view", "guests.create", "guests.edit", "billing.view", "billing.create",
    "housekeeping.view"
  ],
  housekeeping_supervisor: [
    "dashboard.view", "housekeeping.view", "housekeeping.edit", "rooms.view"
  ],
  accounts: [
    "dashboard.view", "billing.view", "billing.create", "billing.edit", "billing.delete",
    "audit.view"
  ],
  revenue_manager: [
    "dashboard.view", "rates.view", "rates.create", "rates.edit", "rates.delete",
    "packages.view", "packages.create", "packages.edit", "packages.delete"
  ],
};

export function hasPermission(role: string | undefined, perm: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(perm) ?? false;
}
