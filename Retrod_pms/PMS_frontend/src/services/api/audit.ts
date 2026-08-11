import { fetchApi } from "./core";

export interface AuditLog {
  id: string;
  timestamp: string;
  actor_name: string;
  actor_role_code: string;
  action_type: string;
  target_entity: string;
  target_id: string;
  ip_address?: string;
  user_agent?: string;
  payload_after?: any;
}

export interface PaginatedAuditLogs {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditLog[];
}

export const auditApi = {
  getAuditLogs: (params?: { page?: number; page_size?: number; last_24_hours?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.page_size) query.append("page_size", params.page_size.toString());
    if (params?.last_24_hours !== undefined) {
      query.append("last_24_hours", params.last_24_hours.toString());
    }
    const queryString = query.toString();
    return fetchApi<any>(`/api/audit-logs/${queryString ? `?${queryString}` : ""}`);
  },
};
