import type { LucideIcon } from "lucide-react";
import type { Permission, Role } from "@/types/rbac";
import type { FeatureKey } from "@/types/entitlements";

export type PlatformAppKey =
  | "pms"
  | "pos"
  | "crm"
  | "analytics"
  | "reports"
  | "channelManager"
  | "bookingEngine"
  | "aiHub"
  | "superadmin";

export type PlatformAppStatus = "active" | "coming_soon";

export type PlatformApps = Record<PlatformAppKey, boolean>;

export interface PlatformAppDefinition {
  key: PlatformAppKey;
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  route: string;
  openLabel: string;
  status: PlatformAppStatus;
  accentClass: string;
  /** User needs at least one of these permissions (when defined). */
  anyPermissions?: Permission[];
  /** User role must be in this list (when defined). */
  roles?: Role[];
  /** Tenant feature flag (maps to existing FeatureKey when applicable). */
  feature?: FeatureKey;
}

export type PlatformQuickAction = {
  id: string;
  label: string;
  route: string;
  icon: LucideIcon;
  anyPermissions?: Permission[];
};

export type PlatformActivity = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  tone: "brand" | "success" | "info" | "warning";
};

export type PlatformFavorite = {
  id: string;
  label: string;
  route: string;
  appKey: PlatformAppKey;
};
