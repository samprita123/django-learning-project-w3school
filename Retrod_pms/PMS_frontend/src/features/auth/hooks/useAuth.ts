import { useContext, type ReactNode } from "react";
import { type Permission } from "@/types/rbac";
import { Ctx, type AuthCtx } from "../providers/AuthProvider";

export function useAuth(): AuthCtx {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return v;
}

interface CanProps {
  perm: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ perm, children, fallback = null }: CanProps) {
  const { can } = useAuth();
  return can(perm) ? children : fallback;
}
