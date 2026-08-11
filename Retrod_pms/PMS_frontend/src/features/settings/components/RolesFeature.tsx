import { useState, useEffect, useMemo } from "react";
import { Plus, Edit2, Trash2, Check, X, Shield, Lock } from "lucide-react";
import { PageHeader, Card, CardHeader, Button } from "@/components/ui/Primitives";
import { rbacApi, type Role, type Permission, type RolePermission } from "@/services/api/rbac";
import { toast } from "sonner";

export function RolesFeature() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  // Modal states for creating/editing a role
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleCode, setNewRoleCode] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [rData, pData, rpData] = await Promise.all([
        rbacApi.getRoles(),
        rbacApi.getPermissions(),
        rbacApi.getRolePermissions(),
      ]);
      setRoles(rData);
      setPermissions(pData);
      setRolePermissions(rpData);
      
      // Default to selecting the first role
      if (rData.length > 0) {
        setSelectedRoleId(rData[0].id);
      }
    } catch (err: any) {
      toast.error("Failed to load roles and permissions: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedRole = useMemo(() => {
    return roles.find(r => r.id === selectedRoleId) || null;
  }, [roles, selectedRoleId]);

  // Group permissions by category
  const groups = useMemo(() => {
    const categories: Record<string, Permission[]> = {};
    permissions.forEach((p) => {
      const cat = p.category || "General";
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(p);
    });
    return categories;
  }, [permissions]);

  // Handle creating or editing a role
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim() || !newRoleCode.trim()) {
      toast.error("Please fill in all role fields.");
      return;
    }
    const payload = {
      name: newRoleName,
      code: newRoleCode.toUpperCase().replace(/\s+/g, "_"),
      description: newRoleDesc,
    };
    try {
      if (editingRole) {
        const updated = await rbacApi.updateRole(editingRole.id, payload);
        setRoles(roles.map((r) => (r.id === editingRole.id ? updated : r)));
        toast.success("Role updated successfully.");
      } else {
        const created = await rbacApi.createRole(payload);
        setRoles([...roles, created]);
        setSelectedRoleId(created.id);
        toast.success("Custom role created successfully.");
      }
      setRoleModalOpen(false);
      setEditingRole(null);
      setNewRoleName("");
      setNewRoleCode("");
      setNewRoleDesc("");
    } catch (err: any) {
      toast.error("Failed to save role: " + err.message);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom role? This will revoke access for all assigned users.")) return;
    try {
      await rbacApi.deleteRole(id);
      const remaining = roles.filter((r) => r.id !== id);
      setRoles(remaining);
      if (selectedRoleId === id && remaining.length > 0) {
        setSelectedRoleId(remaining[0].id);
      }
      toast.success("Role deleted successfully.");
    } catch (err: any) {
      toast.error("Failed to delete role: " + err.message);
    }
  };

  // Select All permissions for the active custom role
  const handleSelectAll = async () => {
    if (!selectedRole || !selectedRole.tenant) return;
    const unassigned = permissions.filter(
      (p) => !rolePermissions.some((rp) => rp.role === selectedRole.id && (rp.permission === p.id || rp.permission_code === p.code))
    );
    if (unassigned.length === 0) {
      toast.info("All permissions are already assigned.");
      return;
    }
    toast.loading("Assigning all privileges...", { id: "select-all" });
    try {
      const promises = unassigned.map((p) => rbacApi.assignPermissionToRole(selectedRole.id, p.id));
      const results = await Promise.all(promises);
      setRolePermissions([...rolePermissions, ...results]);
      toast.success("All permissions granted successfully.", { id: "select-all" });
    } catch (err: any) {
      toast.error("Error granting some permissions: " + err.message, { id: "select-all" });
    }
  };

  // Clear All permissions for the active custom role
  const handleClearAll = async () => {
    if (!selectedRole || !selectedRole.tenant) return;
    const assigned = rolePermissions.filter((rp) => rp.role === selectedRole.id);
    if (assigned.length === 0) {
      toast.info("No permissions are currently assigned.");
      return;
    }
    if (!confirm("Are you sure you want to clear all permissions from this role?")) return;
    toast.loading("Revoking all privileges...", { id: "clear-all" });
    try {
      const promises = assigned.map((rp) => rbacApi.removePermissionFromRole(rp.id));
      await Promise.all(promises);
      setRolePermissions(rolePermissions.filter((rp) => rp.role !== selectedRole.id));
      toast.success("All permissions revoked successfully.", { id: "clear-all" });
    } catch (err: any) {
      toast.error("Error revoking some permissions: " + err.message, { id: "clear-all" });
    }
  };

  // Toggle all permissions within a specific category card
  const handleCategoryToggle = async (perms: Permission[], allSelected: boolean, categoryName: string) => {
    if (!selectedRole || !selectedRole.tenant) return;

    if (allSelected) {
      // Revoke all assigned permissions in this category
      const assignedInCat = rolePermissions.filter(
        (rp) => rp.role === selectedRole.id && perms.some((p) => rp.permission === p.id || rp.permission_code === p.code)
      );
      if (assignedInCat.length === 0) return;
      toast.loading(`Revoking all ${categoryName} permissions...`, { id: "toggle-cat" });
      try {
        await Promise.all(assignedInCat.map((rp) => rbacApi.removePermissionFromRole(rp.id)));
        setRolePermissions(rolePermissions.filter((rp) => !assignedInCat.some((a) => a.id === rp.id)));
        toast.success(`Revoked all ${categoryName} permissions.`, { id: "toggle-cat" });
      } catch (err: any) {
        toast.error("Error revoking permissions: " + err.message, { id: "toggle-cat" });
      }
    } else {
      // Grant all unassigned permissions in this category
      const unassignedInCat = perms.filter(
        (p) => !rolePermissions.some((rp) => rp.role === selectedRole.id && (rp.permission === p.id || rp.permission_code === p.code))
      );
      if (unassignedInCat.length === 0) return;
      toast.loading(`Granting all ${categoryName} permissions...`, { id: "toggle-cat" });
      try {
        const results = await Promise.all(unassignedInCat.map((p) => rbacApi.assignPermissionToRole(selectedRole.id, p.id)));
        setRolePermissions([...rolePermissions, ...results]);
        toast.success(`Granted all ${categoryName} permissions.`, { id: "toggle-cat" });
      } catch (err: any) {
        toast.error("Error granting permissions: " + err.message, { id: "toggle-cat" });
      }
    }
  };

  // Toggle permission checks in the details list
  const handlePermissionToggle = async (perm: Permission) => {
    if (!selectedRole) return;
    
    if (!selectedRole.tenant) {
      toast.info("System roles are read-only.");
      return;
    }

    const existingLink = rolePermissions.find(
      (rp) => rp.role === selectedRole.id && (rp.permission === perm.id || rp.permission_code === perm.code)
    );

    try {
      if (existingLink) {
        await rbacApi.removePermissionFromRole(existingLink.id);
        setRolePermissions(rolePermissions.filter((rp) => rp.id !== existingLink.id));
        toast.success(`Revoked permission: ${perm.code}`);
      } else {
        const created = await rbacApi.assignPermissionToRole(selectedRole.id, perm.id);
        setRolePermissions([...rolePermissions, created]);
        toast.success(`Granted permission: ${perm.code}`);
      }
    } catch (err: any) {
      toast.error("Failed to toggle permission: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Roles & Privileges"
        description="Define access control policies and configure granular module permissions."
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditingRole(null);
              setNewRoleName("");
              setNewRoleCode("");
              setNewRoleDesc("");
              setRoleModalOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Custom Role
          </Button>
        }
      />

      <div className="responsive-page-x space-y-6 py-6">
        {/* Role Cards list */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {roles.map((r) => {
            const rolePermsCount = rolePermissions.filter(
              (rp) => rp.role === r.id
            ).length;
            const isSystemRole = !r.tenant;
            const isSelected = selectedRoleId === r.id;

            return (
              <div
                key={r.id}
                onClick={() => setSelectedRoleId(r.id)}
                className={`rounded-xl border p-5 shadow-sm transition-all duration-300 flex flex-col justify-between hover:shadow-md cursor-pointer relative ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 bg-primary-tint/5"
                    : isSystemRole
                    ? "border-border bg-surface"
                    : "border-border-subtle bg-surface"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-text-primary uppercase tracking-wide">
                      {r.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isSystemRole ? "bg-surface-2 text-text-secondary" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}>
                      {isSystemRole ? "System" : "Custom"}
                    </span>
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-text-secondary min-h-[40px]">
                    {r.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-[11px] text-text-secondary">
                  <span>
                    <strong className="text-text-primary">{rolePermsCount}</strong> / {permissions.length} perms
                  </span>
                  {!isSystemRole && (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setEditingRole(r);
                          setNewRoleName(r.name);
                          setNewRoleCode(r.code);
                          setNewRoleDesc(r.description || "");
                          setRoleModalOpen(true);
                        }}
                        className="text-text-secondary hover:text-primary transition"
                        title="Edit Role Details"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(r.id)}
                        className="text-text-secondary hover:text-destructive transition"
                        title="Delete Custom Role"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Role Permissions Panel */}
        {selectedRole && (
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[16px] font-bold text-text-primary">
                    Permissions for: <span className="text-primary font-extrabold">{selectedRole.name}</span>
                  </h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                    !selectedRole.tenant ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"
                  }`}>
                    {!selectedRole.tenant ? "System Default" : "Custom Configuration"}
                  </span>
                </div>
                <p className="text-[12px] text-text-secondary mt-1">
                  {!selectedRole.tenant 
                    ? "This is a pre-defined system role. Permissions are fixed and read-only."
                    : "Configure what access this custom role has. Click checkboxes to update immediately."}
                </p>
              </div>
              {!selectedRole.tenant ? (
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-100">
                  <Lock className="h-3.5 w-3.5" />
                  Read-Only Role
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearAll} className="text-destructive hover:bg-destructive/5 hover:text-destructive">
                    Clear All
                  </Button>
                </div>
              )}
            </div>

            {/* Grid of permission categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(groups).map(([category, perms]) => (
                <div key={category} className="border border-border rounded-xl p-4 bg-surface-2/10 space-y-3">
                  <h4 className="text-[13px] font-bold text-text-primary border-b border-border pb-2 flex items-center justify-between">
                    <span>{category}</span>
                    <span className="text-[10.5px] px-2 py-0.5 bg-surface-2 text-text-secondary rounded-full font-medium">
                      {perms.filter(p => rolePermissions.some(rp => rp.role === selectedRole.id && (rp.permission === p.id || rp.permission_code === p.code))).length} / {perms.length}
                    </span>
                  </h4>
                  <div className="space-y-2.5">
                    {perms.map((p) => {
                      const hasPerm = rolePermissions.some(
                        (rp) => rp.role === selectedRole.id && (rp.permission === p.id || rp.permission_code === p.code)
                      );
                      const isReadOnly = !selectedRole.tenant;

                      return (
                        <label
                          key={p.id}
                          className={`flex items-start gap-3 rounded-lg border p-2.5 transition select-none ${
                            hasPerm
                              ? "border-primary/20 bg-primary-tint/5"
                              : "border-transparent bg-transparent"
                          } ${isReadOnly ? "" : "cursor-pointer hover:bg-surface-2/40"}`}
                        >
                          <input
                            type="checkbox"
                            checked={hasPerm}
                            disabled={isReadOnly}
                            onChange={() => handlePermissionToggle(p)}
                            className="rounded border-border text-primary focus:ring-primary h-4.5 w-4.5 mt-0.5 disabled:opacity-75 disabled:cursor-not-allowed"
                          />
                          <div className="space-y-0.5">
                            <span className="text-[12.5px] font-medium text-text-primary block leading-tight">
                              {p.code}
                            </span>
                            <span className="text-[10.5px] text-text-secondary block leading-snug">
                              {p.description || "No description available"}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Add/Edit Custom Role drawer/modal */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[16px] font-bold text-text-primary">
                {editingRole ? "Edit Custom Role" : "Create Custom Role"}
              </h2>
              <button
                onClick={() => setRoleModalOpen(false)}
                className="p-1 rounded-md text-text-secondary hover:bg-surface-2 hover:text-text-primary transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="text-[12px] font-medium text-text-secondary block mb-1">Role Name</label>
                <input
                  type="text"
                  required
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. Guest Relations Officer"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-text-secondary block mb-1">Role Code</label>
                <input
                  type="text"
                  required
                  disabled={!!editingRole}
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-surface-2"
                  placeholder="e.g. GUEST_RELATIONS"
                  value={newRoleCode}
                  onChange={(e) => setNewRoleCode(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-text-secondary block mb-1">Description</label>
                <textarea
                  className="w-full rounded-md border border-border bg-surface p-2 text-[13px] text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 h-20 resize-none"
                  placeholder="Describe the responsibilities of this role..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setRoleModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RolesFeature;
