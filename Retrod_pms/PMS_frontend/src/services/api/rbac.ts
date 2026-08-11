import { fetchApi } from "./core";

export interface Permission {
  id: string;
  code: string;
  category: string;
  description: string | null;
}

export interface Role {
  id: string;
  tenant: string | null;
  code: string;
  name: string;
  description: string;
}

export interface RolePermission {
  id: string;
  role: string;
  permission: string;
  permission_code?: string;
}

export interface UserPropertyRole {
  id: string;
  tenant: string;
  user: string;
  property: string;
  role: string;
  user_email?: string;
  property_name?: string;
  role_name?: string;
}

export const rbacApi = {
  getPermissions: () => fetchApi<Permission[]>("/api/permissions/"),
  
  getRoles: () => fetchApi<Role[]>("/api/roles/"),
  createRole: (data: Omit<Role, "id" | "tenant">) => fetchApi<Role>("/api/roles/", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  updateRole: (id: string, data: Partial<Omit<Role, "id" | "tenant">>) => fetchApi<Role>(`/api/roles/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }),
  deleteRole: (id: string) => fetchApi<void>(`/api/roles/${id}/`, {
    method: "DELETE",
  }),

  getRolePermissions: () => fetchApi<RolePermission[]>("/api/role-permissions/"),
  assignPermissionToRole: (roleId: string, permissionId: string) => fetchApi<RolePermission>("/api/role-permissions/", {
    method: "POST",
    body: JSON.stringify({ role: roleId, permission: permissionId }),
  }),
  removePermissionFromRole: (rolePermissionId: string) => fetchApi<void>(`/api/role-permissions/${rolePermissionId}/`, {
    method: "DELETE",
  }),

  getUserPropertyRoles: () => fetchApi<UserPropertyRole[]>("/api/user-property-roles/"),
  assignUserPropertyRole: (data: Omit<UserPropertyRole, "id" | "tenant" | "user_email" | "property_name" | "role_name">) => 
    fetchApi<UserPropertyRole>("/api/user-property-roles/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  removeUserPropertyRole: (id: string) => fetchApi<void>(`/api/user-property-roles/${id}/`, {
    method: "DELETE",
  }),
};
