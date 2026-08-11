import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type Permission, type Role } from "@/types/rbac";
import { type AppUser, type TenantEntitlements } from "@/types/auth";
import type { FeatureFlags, FeatureKey } from "@/types/entitlements";
import { DEFAULT_PLATFORM_APPS } from "@/types/entitlements";
import { hasPermission, ROLE_LABEL } from "../lib/rbac";
import { authApi } from "@/services/auth-api";

export interface AuthCtx {
  user: AppUser | null;
  users: AppUser[];
  auditEvents: AuthAuditEvent[];
  entitlements: TenantEntitlements;
  featureEnabled: (feature: FeatureKey) => boolean;
  effectiveFeatures: FeatureFlags;
  setTenantFeature: (feature: FeatureKey, enabled: boolean) => void;
  setPropertyFeatures: (property: string, features: Partial<FeatureFlags>) => void;
  setEntitlementPlan: (plan: TenantEntitlements["plan"]) => void;
  isAuthenticated: boolean;
  login: (userId: string) => void;
  logout: () => void;
  can: (perm: Permission) => boolean;
  switchRole: (role: Role) => void;
  inviteUser: (u: Omit<AppUser, "id" | "initials" | "active" | "lastActive">) => void;
  updateUser: (id: string, patch: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  roleLabel: (r: Role) => string;
  logAuditEvent: (action: string, target?: string, detail?: string) => void;
  loginWithPassword: (emailOrUsername: string, password: string) => Promise<AppUser>;
  requestOtp: (contact: string) => Promise<any>;
  verifyOtp: (contact: string, otpCode: string) => Promise<any>;
  loginWithTokens: (tokens: any, user: any, properties: any, permissions: any) => AppUser;
}

export const Ctx = createContext<AuthCtx | null>(null);

export interface AuthAuditEvent {
  id: string;
  ts: string;
  actor: string;
  actorRole: string;
  action: string;
  target?: string;
  detail?: string;
}

const SEED_USERS: AppUser[] = [
  {
    id: "u0",
    name: "Retrod Admin",
    email: "admin@retrod.in",
    role: "super_admin",
    initials: "RA",
    active: true,
    property: "Retrod Global HQ",
    lastActive: "Just now",
  },
  {
    id: "u_prabhat",
    name: "Prabhat",
    email: "prabhat@retrod.in",
    role: "super_admin",
    initials: "P",
    active: true,
    property: "Retrod Global HQ",
    lastActive: "Just now",
  },
  {
    id: "u1",
    name: "Aarav Malhotra",
    email: "aarav@grandpalace.in",
    role: "owner",
    initials: "AM",
    active: true,
    property: "The Grand Palace",
    lastActive: "Just now",
  },
  {
    id: "u2",
    name: "Vikram Shah",
    email: "vikram@grandpalace.in",
    role: "general_manager",
    initials: "VS",
    active: true,
    property: "The Grand Palace",
    lastActive: "5 min ago",
  },
  {
    id: "u3",
    name: "Neha Kapoor",
    email: "neha@grandpalace.in",
    role: "front_office_manager",
    initials: "NK",
    active: true,
    property: "The Grand Palace",
    lastActive: "12 min ago",
  },
  {
    id: "u4",
    name: "Rohan Verma",
    email: "rohan@grandpalace.in",
    role: "front_desk_agent",
    initials: "RV",
    active: true,
    property: "The Grand Palace",
    lastActive: "2 min ago",
  },
  {
    id: "u5",
    name: "Priya Reddy",
    email: "priya@grandpalace.in",
    role: "housekeeping_supervisor",
    initials: "PR",
    active: true,
    property: "The Grand Palace",
    lastActive: "1 hr ago",
  },
  {
    id: "u6",
    name: "Ananya Bose",
    email: "ananya@grandpalace.in",
    role: "accounts",
    initials: "AB",
    active: true,
    property: "The Grand Palace",
    lastActive: "Yesterday",
  },
  {
    id: "u7",
    name: "Kabir Singh",
    email: "kabir@grandpalace.in",
    role: "revenue_manager",
    initials: "KS",
    active: true,
    property: "The Grand Palace",
    lastActive: "30 min ago",
  },
];

const LS_USER = "retrod.auth.user";
const LS_USERS = "retrod.auth.users";
const LS_ENTITLEMENTS = "retrod.auth.entitlements";
const LS_AUDIT_EVENTS = "retrod.auth.audit-events";

const DEFAULT_ENTITLEMENTS: TenantEntitlements = {
  tenantId: "retrod-demo-tenant",
  plan: "growth",
  features: {
    channelManager: true,
    websiteBuilder: true,
    bookingEngine: true,
    revenueAi: true,
    masterData: true,
  },
  platformApps: { ...DEFAULT_PLATFORM_APPS },
  propertyOverrides: [
    {
      property: "The Grand Palace",
      features: {
        channelManager: true,
        websiteBuilder: true,
        bookingEngine: true,
        revenueAi: true,
        masterData: true,
      },
    },
  ],
};

function loadUsers(): AppUser[] {
  if (typeof window === "undefined") return SEED_USERS;
  try {
    const raw = localStorage.getItem(LS_USERS);
    if (!raw) return SEED_USERS;
    const parsed = JSON.parse(raw) as AppUser[];
    // Auto-correct any misassigned properties for tenant users in cache
    const migrated = parsed.map((u) => {
      if (u.email.toLowerCase().endsWith("@biraj.com") && u.property === "The Grand Palace") {
        return { ...u, property: "Biraj Hospitality" };
      }
      return u;
    });
    const merged = [...migrated];
    for (const su of SEED_USERS) {
      if (!merged.some((u) => u.id === su.id || u.email.toLowerCase() === su.email.toLowerCase())) {
        merged.push(su);
      }
    }
    return merged;
  } catch {
    return SEED_USERS;
  }
}

function persistUsers(users: AppUser[]) {
  if (typeof window !== "undefined") localStorage.setItem(LS_USERS, JSON.stringify(users));
}

function mapBackendUserToAppUser(backendUser: any, backendProperties: any[], backendPermissions: string[]): AppUser {
  let role: Role = "front_desk_agent";
  let propertyName = "The Grand Palace";
  
  if (backendUser && backendUser.role) {
    role = backendUser.role as Role;
  } else if (backendProperties && backendProperties.length > 0) {
    role = backendProperties[0].role as Role;
    propertyName = backendProperties[0].name;
  }
  
  if (backendPermissions.includes("*:*")) {
    role = "super_admin";
  }
  
  const initials = backendUser.name
    .split(" ")
    .map((s: string) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "US";

  const mappedProperties = (backendProperties || []).map((p: any) => ({
    id: String(p.id),
    name: String(p.name),
    role: String(p.role),
  }));

  if (mappedProperties.length > 0) {
    propertyName = mappedProperties[0].name;
  }

  return {
    id: backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    role: role,
    initials: initials,
    active: true,
    property: propertyName,
    lastActive: "Just now",
    properties: mappedProperties,
    avatarUrl: backendUser.avatar_url,
    tenant_subdomain: backendUser.tenant_subdomain,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AppUser[]>(SEED_USERS);
  const [user, setUser] = useState<AppUser | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuthAuditEvent[]>([]);
  const [entitlements, setEntitlements] = useState<TenantEntitlements>(DEFAULT_ENTITLEMENTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const u = loadUsers();
    const e = loadEntitlements();
    const a = loadAuditEvents();
    setUsers(u);
    setEntitlements(e);
    setAuditEvents(a);

    async function hydrateAuth() {
      const access = localStorage.getItem("retrod.auth.access_token");
      if (access) {
        try {
          const data = await authApi.getCurrentUser();
          if (data && data.user) {
            const mappedUser = mapBackendUserToAppUser(data.user, data.properties, data.permissions);
            setUser(mappedUser);
          } else {
            setUser(null);
            authApi.clearTokens();
          }
        } catch (err) {
          console.error("Hydration getCurrentUser failed:", err);
          setUser(null);
          authApi.clearTokens();
        }
      }
      setHydrated(true);
    }
    hydrateAuth();

    const handleUnauthorized = () => {
      console.warn("Unauthorized/Session expired. Logging out...");
      authApi.clearTokens();
      setUser(null);
    };

    window.addEventListener("auth-unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth-unauthorized", handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    if (hydrated) persistUsers(users);
  }, [users, hydrated]);
  useEffect(() => {
    if (hydrated) persistEntitlements(entitlements);
  }, [entitlements, hydrated]);
  useEffect(() => {
    if (hydrated) persistAuditEvents(auditEvents);
  }, [auditEvents, hydrated]);
  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      localStorage.setItem(LS_USER, JSON.stringify(user));
      if (user.tenant_subdomain) {
        localStorage.setItem("retrod:active-subdomain", user.tenant_subdomain);
      }
    } else {
      localStorage.removeItem(LS_USER);
      localStorage.removeItem("retrod:active-subdomain");
      localStorage.removeItem("retrod:active-property-id");
    }
  }, [user, hydrated]);

  const addAuditEvent = (
    action: string,
    target?: string,
    detail?: string,
    actorOverride?: { name: string; role: Role | "system" },
  ) => {
    const actor = actorOverride?.name ?? user?.name ?? "System";
    const actorRole =
      actorOverride?.role === "system"
        ? "System"
        : actorOverride?.role
          ? ROLE_LABEL[actorOverride.role]
          : user
            ? ROLE_LABEL[user.role]
            : "System";
    setAuditEvents((prev) => [
      {
        id: `ae-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ts: formatAuditTimestamp(new Date()),
        actor,
        actorRole,
        action,
        target,
        detail,
      },
      ...prev,
    ]);
  };

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      users,
      auditEvents,
      entitlements,
      effectiveFeatures: resolveEffectiveFeatures(entitlements, user?.property),
      featureEnabled: (feature) => resolveEffectiveFeatures(entitlements, user?.property)[feature],
      setTenantFeature: (feature, enabled) => {
        setEntitlements((prev) => {
          if (prev.features[feature] === enabled) return prev;
          addAuditEvent(
            "Tenant feature updated",
            feature,
            `${feature} set to ${enabled ? "enabled" : "disabled"} at tenant level.`,
          );
          return { ...prev, features: { ...prev.features, [feature]: enabled } };
        });
      },
      setPropertyFeatures: (property, features) => {
        setEntitlements((prev) => {
          const overrides = prev.propertyOverrides ?? [];
          const idx = overrides.findIndex((entry) => entry.property === property);
          if (idx === -1) {
            addAuditEvent(
              "Property feature override added",
              property,
              `Applied override: ${Object.keys(features).join(", ") || "none"}.`,
            );
            return { ...prev, propertyOverrides: [...overrides, { property, features }] };
          }
          const existing = overrides[idx];
          const nextFeatures = { ...existing.features, ...features };
          const unchanged = Object.entries(features).every(
            ([key, value]) => existing.features[key as FeatureKey] === value,
          );
          if (unchanged) return prev;
          addAuditEvent(
            "Property feature override updated",
            property,
            `Updated override: ${Object.keys(features).join(", ")}.`,
          );
          const nextOverrides = [...overrides];
          nextOverrides[idx] = { ...existing, features: nextFeatures };
          return { ...prev, propertyOverrides: nextOverrides };
        });
      },
      setEntitlementPlan: (plan) => {
        if (entitlements.plan !== plan) {
          addAuditEvent(
            "Tenant plan changed",
            "Tenant",
            `Plan switched from ${entitlements.plan} to ${plan}.`,
          );
        }
        setEntitlements((prev) => (prev.plan === plan ? prev : { ...prev, plan }));
      },
      isAuthenticated: !!user,
      login: (id: string) => {
        const found = users.find((u) => u.id === id);
        if (found) {
          setUser(found);
          addAuditEvent("User logged in", found.email, `Session started for ${found.name}.`, {
            name: found.name,
            role: found.role,
          });
        }
      },
      logout: () => {
        if (user) {
          addAuditEvent("User logged out", user.email, `Session ended for ${user.name}.`);
        }
        authApi.logout();
        setUser(null);
      },
      loginWithPassword: async (emailOrUsername, password) => {
        try {
          const data = await authApi.login(emailOrUsername, password);
          authApi.saveTokens(data.tokens.access, data.tokens.refresh);
          const mappedUser = mapBackendUserToAppUser(data.user, data.properties, data.permissions);
          setUser(mappedUser);
          addAuditEvent("User logged in (Password)", mappedUser.email, `Session started for ${mappedUser.name}.`, {
            name: mappedUser.name,
            role: mappedUser.role,
          });
          return mappedUser;
        } catch (err) {
          const found = users.find(
            (u) =>
              (u.email.toLowerCase() === emailOrUsername.toLowerCase() ||
               u.name.toLowerCase() === emailOrUsername.toLowerCase()) &&
              u.password === password
          );
          if (found) {
            setUser(found);
            addAuditEvent("User logged in (Local Password)", found.email, `Session started for ${found.name}.`, {
              name: found.name,
              role: found.role,
            });
            return found;
          }
          throw err;
        }
      },
      requestOtp: async (contact) => {
        return await authApi.requestOtp(contact);
      },
      verifyOtp: async (contact, otpCode) => {
        try {
          const data = await authApi.verifyOtp(contact, otpCode);
          if (data.status === 'pending_confirmation') {
            return data;
          }
          authApi.saveTokens(data.tokens.access, data.tokens.refresh);
          const mappedUser = mapBackendUserToAppUser(data.user, data.properties, data.permissions);
          setUser(mappedUser);
          addAuditEvent("User logged in (OTP)", mappedUser.email, `Session started for ${mappedUser.name}.`, {
            name: mappedUser.name,
            role: mappedUser.role,
          });
          return mappedUser;
        } catch (err) {
          const found = users.find(
            (u) =>
              u.email.toLowerCase() === contact.toLowerCase() ||
              u.phone === contact
          );
          if (found && otpCode.length === 6) {
            setUser(found);
            addAuditEvent("User logged in (Local OTP)", found.email, `Session started for ${found.name}.`, {
              name: found.name,
              role: found.role,
            });
            return found;
          }
          throw err;
        }
      },
      loginWithTokens: (tokens, userVal, propsVal, permsVal) => {
        authApi.saveTokens(tokens.access, tokens.refresh);
        const mappedUser = mapBackendUserToAppUser(userVal, propsVal, permsVal);
        setUser(mappedUser);
        addAuditEvent("User logged in (MFA Double Confirmed)", mappedUser.email, `Session started for ${mappedUser.name}.`, {
          name: mappedUser.name,
          role: mappedUser.role,
        });
        return mappedUser;
      },
      can: (perm) => hasPermission(user?.role, perm),
      switchRole: (role) => {
        if (!user) return;
        const previousRole = user.role;
        const next = { ...user, role };
        setUser(next);
        setUsers((prev) => prev.map((u) => (u.id === user.id ? next : u)));
        addAuditEvent(
          "Role switched",
          user.email,
          `Role changed from ${ROLE_LABEL[previousRole]} to ${ROLE_LABEL[role]}.`,
        );
      },
      inviteUser: (u) => {
        const id = `u${Date.now()}`;
        const initials = u.name
          .split(" ")
          .map((s) => s[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();
        const invited = { ...u, id, initials, active: true, lastActive: "Invited" };
        setUsers((prev) => [...prev, invited]);
        addAuditEvent(
          "User invited",
          invited.email,
          `${invited.name} invited as ${ROLE_LABEL[invited.role]} for ${invited.property}.`,
        );
      },
      updateUser: (id, patch) => {
        const target = users.find((u) => u.id === id);
        const previousRole = target?.role;
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
        if (user?.id === id) setUser((u) => (u ? { ...u, ...patch } : u));
        if (target && Object.keys(patch).length > 0) {
          const fields = Object.entries(patch)
            .map(([k, v]) => `${k}: ${String(v)}`)
            .join(", ");
          const roleDetail =
            previousRole && patch.role && patch.role !== previousRole
              ? ` | role ${ROLE_LABEL[previousRole]} -> ${ROLE_LABEL[patch.role]}`
              : "";
          addAuditEvent("User updated", target.email, `${fields}${roleDetail}`);
        }
      },
      deleteUser: (id) => {
        const target = users.find((u) => u.id === id);
        setUsers((prev) => prev.filter((u) => u.id !== id));
        if (user?.id === id) setUser(null);
        if (target) {
          addAuditEvent(
            "User removed",
            target.email,
            `${target.name} (${ROLE_LABEL[target.role]}) removed from access list.`,
          );
        }
      },
      roleLabel: (r) => ROLE_LABEL[r],
      logAuditEvent: (action, target, detail) => addAuditEvent(action, target, detail),
    }),
    [auditEvents, entitlements, user, users],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function loadEntitlements(): TenantEntitlements {
  if (typeof window === "undefined") return DEFAULT_ENTITLEMENTS;
  try {
    const raw = localStorage.getItem(LS_ENTITLEMENTS);
    if (!raw) return DEFAULT_ENTITLEMENTS;
    const parsed = JSON.parse(raw) as Partial<TenantEntitlements>;
    return {
      ...DEFAULT_ENTITLEMENTS,
      ...parsed,
      features: { ...DEFAULT_ENTITLEMENTS.features, ...(parsed.features ?? {}) },
      platformApps: { ...DEFAULT_PLATFORM_APPS, ...(parsed.platformApps ?? {}) },
      propertyOverrides: parsed.propertyOverrides ?? DEFAULT_ENTITLEMENTS.propertyOverrides,
    };
  } catch {
    return DEFAULT_ENTITLEMENTS;
  }
}

function persistEntitlements(entitlements: TenantEntitlements) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LS_ENTITLEMENTS, JSON.stringify(entitlements));
  }
}

function loadAuditEvents(): AuthAuditEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_AUDIT_EVENTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AuthAuditEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistAuditEvents(events: AuthAuditEvent[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LS_AUDIT_EVENTS, JSON.stringify(events.slice(0, 300)));
  }
}

function resolveEffectiveFeatures(
  entitlements: TenantEntitlements,
  property?: string,
): FeatureFlags {
  const base = { ...entitlements.features };
  if (!property) return base;
  const override = entitlements.propertyOverrides?.find((p) => p.property === property);
  if (!override) return base;
  return { ...base, ...override.features };
}

function formatAuditTimestamp(date: Date) {
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
