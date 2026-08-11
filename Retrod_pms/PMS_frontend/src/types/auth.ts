import { Role, Permission } from "./rbac";
import type { FeatureFlags, PropertyEntitlements } from "./entitlements";
import type { PlatformApps } from "./platform";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
  active: boolean;
  property: string;
  properties?: { id: string; name: string }[];
  avatarUrl?: string;
  password?: string;
  phone?: string;
  lastActive?: string;
  customPermissions?: Permission[];
  tenant_subdomain?: string;
  subscription_plan?: string;
  subscription_expiry?: string;
  license_key?: string;
}

export interface TenantEntitlements {
  tenantId: string;
  plan: "starter" | "growth" | "enterprise";
  features: FeatureFlags;
  platformApps?: Partial<PlatformApps>;
  propertyOverrides?: PropertyEntitlements[];
}

export interface AuthSession {
  user: AppUser;
  token: string;
}
