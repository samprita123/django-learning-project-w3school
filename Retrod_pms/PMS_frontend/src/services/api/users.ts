import { fetchApi } from "./core";

export interface PlatformUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  preferred_language: string;
  preferred_timezone: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PlatformUserPayload {
  name: string;
  username: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  preferred_language?: string;
  preferred_timezone?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  password?: string;
}

export const platformUsersApi = {
  getUsers: () => {
    return fetchApi<PlatformUser[]>("/api/superadmin-users/");
  },
  createUser: (payload: PlatformUserPayload) => {
    return fetchApi<PlatformUser>("/api/superadmin-users/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateUser: (id: string, payload: Partial<PlatformUserPayload>) => {
    return fetchApi<PlatformUser>(`/api/superadmin-users/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  deleteUser: (id: string) => {
    return fetchApi<void>(`/api/superadmin-users/${id}/`, {
      method: "DELETE",
    });
  },
};

export interface AppUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  preferred_language: string;
  preferred_timezone: string;
  is_active: boolean;
  is_staff: boolean;
  role?: string;
  role_name?: string;
  department?: string;
  department_name?: string;
  shift?: string;
  shift_name?: string;
  assigned_properties?: Array<{ id: string; name: string; city?: string }>;
  created_at?: string;
  updated_at?: string;
}

export interface AppUserPayload {
  name: string;
  username: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  preferred_language?: string;
  preferred_timezone?: string;
  is_active?: boolean;
  role?: string | null;
  department?: string | null;
  shift?: string | null;
  assigned_property_ids?: string[];
  password?: string;
}

export const usersApi = {
  getUsers: () => {
    return fetchApi<AppUser[]>("/api/users/");
  },
  createUser: (payload: AppUserPayload) => {
    return fetchApi<AppUser>("/api/users/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateUser: (id: string, payload: Partial<AppUserPayload>) => {
    return fetchApi<AppUser>(`/api/users/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  deleteUser: (id: string) => {
    return fetchApi<void>(`/api/users/${id}/`, {
      method: "DELETE",
    });
  },
};
