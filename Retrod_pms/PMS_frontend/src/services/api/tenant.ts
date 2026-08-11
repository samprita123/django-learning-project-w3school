import { fetchApi } from "./core";

export interface Tenant {
  id: string;
  name: string;
  schema_name: string;
  domain_url: string;
  is_active: boolean;
  status: "active" | "suspended" | "terminated";
  country?: string;
  currency?: string;
  timezone?: string;
  created_at: string;
  created_by_name?: string;
}

export interface TenantCreatePayload {
  name: string;
  subdomain: string;
  country: string;
  currency: string;
  timezone: string;
  custom_domain?: string;
}

export const tenantApi = {
  getTenants: () => {
    return fetchApi<Tenant[]>("/api/tenants/");
  },

  getTenantById: (id: string) => {
    return fetchApi<Tenant>(`/api/tenants/${id}/`);
  },

  createTenant: (payload: TenantCreatePayload) => {
    return fetchApi<Tenant>("/api/tenants/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateTenant: (id: string, payload: Partial<Tenant>) => {
    return fetchApi<Tenant>(`/api/tenants/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteTenant: (id: string) => {
    return fetchApi<void>(`/api/tenants/${id}/`, {
      method: "DELETE",
    });
  },

  // --- Tenant Subscriptions ---
  getTenantSubscriptions: (tenantId: string) => {
    return fetchApi<TenantSubscription[]>(`/api/subscriptions/tenant-subscriptions/?tenant_id=${tenantId}`);
  },

  getAllTenantSubscriptions: () => {
    return fetchApi<TenantSubscription[]>("/api/subscriptions/tenant-subscriptions/");
  },

  createTenantSubscription: (payload: Partial<TenantSubscription>) => {
    return fetchApi<TenantSubscription>("/api/subscriptions/tenant-subscriptions/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateTenantSubscription: (id: string, payload: Partial<TenantSubscription>) => {
    return fetchApi<TenantSubscription>(`/api/subscriptions/tenant-subscriptions/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  getDashboardStats: () => {
    return fetchApi<DashboardStats>("/api/dashboard-stats/");
  },

  requestSubscription: (payload: { product_name: string; contact_name?: string; contact_email?: string; comments?: string }) => {
    return fetchApi<{ message: string }>("/api/tenant/request-subscription/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export interface DashboardStats {
  properties: number;
  active_users: number;
  occupancy_today: string;
  revenue_today: string;
}

export interface TenantSubscription {
  id?: string;
  tenant: string;
  tenant_name?: string;
  plan: string;
  plan_name?: string;
  start_date?: string;
  end_date?: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
}
