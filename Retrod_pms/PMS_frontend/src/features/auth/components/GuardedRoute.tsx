import type { ReactNode } from "react";
import AccessDenied from "@/components/AccessDenied";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Permission } from "@/types/rbac";

interface GuardedRouteProps {
  permission: Permission;
  title?: string;
  description?: string;
  children: ReactNode;
}

export function GuardedRoute({ permission, title, description, children }: GuardedRouteProps) {
  const { can } = useAuth();
  if (!can(permission)) {
    return <AccessDenied title={title} description={description} />;
  }
  return <>{children}</>;
}
