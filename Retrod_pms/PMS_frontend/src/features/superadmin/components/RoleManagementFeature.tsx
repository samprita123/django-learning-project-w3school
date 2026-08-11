import { useState, useEffect, useMemo } from "react";
import { Plus, Search, ShieldCheck, Mail, Phone, Edit2, Trash2, Check, X, Shield, Lock, Info } from "lucide-react";
import { PageHeader, Card, Button } from "@/components/ui/Primitives";
import { rbacApi, type Role, type Permission, type RolePermission } from "@/services/api/rbac";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const inputCls =
  "h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";
const textareaCls =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 min-h-[80px]";

export function RoleManagementFeature() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionsList, setPermissionsList] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal / Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form Fields State
  const [formFields, setFormFields] = useState({
    name: "",
    code: "",
    description: "",
  });

  // Load all RBAC data from backend
  const loadData = async () => {
    setLoading(true);
    try {
      const [rData, pData, rpData] = await Promise.all([
        rbacApi.getRoles(),
        rbacApi.getPermissions(),
        rbacApi.getRolePermissions(),
      ]);
      setRoles(rData);
      setPermissionsList(pData);
      setRolePermissions(rpData);

      // Restore selection if previously selected
      if (selectedRole) {
        const stillExists = rData.find((r) => r.id === selectedRole.id);
        if (stillExists) {
          setSelectedRole(stillExists);
        } else {
          setSelectedRole(rData[0] || null);
        }
      } else {
        setSelectedRole(rData[0] || null);
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

  // Filter roles list
  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const term = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(term) ||
        r.code.toLowerCase().includes(term) ||
        (r.description || "").toLowerCase().includes(term)
      );
    });
  }, [roles, searchQuery]);

  // Group permissions by category
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    permissionsList.forEach((p) => {
      const cat = p.category || "General";
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(p);
    });
    return groups;
  }, [permissionsList]);

  // Map permissions to RolePermission assignments for selected role
  const selectedRolePermissionsMap = useMemo(() => {
    if (!selectedRole) return new Map<string, string>(); // permissionId -> rolePermissionId
    const mapping = new Map<string, string>();
    rolePermissions.forEach((rp) => {
      if (rp.role === selectedRole.id) {
        mapping.set(rp.permission, rp.id);
      }
    });
    return mapping;
  }, [rolePermissions, selectedRole]);

  // Add/Edit Role handlers
  const handleOpenNew = () => {
    setEditingRole(null);
    setFormFields({ name: "", code: "", description: "" });
    setModalOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setFormFields({
      name: role.name,
      code: role.code,
      description: role.description || "",
    });
    setModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFields.name || !formFields.code) {
      toast.error("Please fill in Name and Code.");
      return;
    }

    try {
      if (editingRole) {
        // Update
        const updated = await rbacApi.updateRole(editingRole.id, formFields);
        toast.success(`Role "${updated.name}" updated successfully.`);
      } else {
        // Create
        const created = await rbacApi.createRole(formFields);
        toast.success(`Role "${created.name}" created successfully.`);
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error("Failed to save role: " + err.message);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteTargetId) return;
    try {
      await rbacApi.deleteRole(deleteTargetId);
      toast.success("Role deleted successfully.");
      setDeleteTargetId(null);
      loadData();
    } catch (err: any) {
      toast.error("Failed to delete role: " + err.message);
    }
  };

  // Toggle permission mapping
  const handleTogglePermission = async (permissionId: string) => {
    if (!selectedRole) return;
    const rolePermissionId = selectedRolePermissionsMap.get(permissionId);

    try {
      if (rolePermissionId) {
        // Remove assignment
        await rbacApi.removePermissionFromRole(rolePermissionId);
        toast.success("Permission unassigned.");
      } else {
        // Assign
        await rbacApi.assignPermissionToRole(selectedRole.id, permissionId);
        toast.success("Permission assigned successfully.");
      }
      // Reload mappings
      const rpData = await rbacApi.getRolePermissions();
      setRolePermissions(rpData);
    } catch (err: any) {
      toast.error("Failed to update permission mapping: " + err.message);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Platform Control"
        title="Role Management"
        description="Configure master roles and allocate platform permissions dynamically from the database."
      />

      <div className="responsive-page-x py-4 sm:py-6">
        {loading && roles.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Pane: Role List */}
            <div className="lg:col-span-5 space-y-4">
              <Card>
                <div className="p-4 border-b border-border flex items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-disabled" />
                    <input
                      type="text"
                      placeholder="Search roles..."
                      className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleOpenNew}
                    className="h-9 shrink-0 flex items-center gap-1.5 px-3 bg-primary text-primary-foreground text-[13px] hover:bg-primary-pressed rounded-md transition"
                  >
                    <Plus className="h-4 w-4" />
                    Add Role
                  </Button>
                </div>

                <div className="divide-y divide-border overflow-y-auto max-h-[600px] scrollbar-thin">
                  {filteredRoles.length === 0 ? (
                    <div className="p-6 text-center text-text-disabled text-[13px]">
                      No roles found matching search criteria.
                    </div>
                  ) : (
                    filteredRoles.map((role) => {
                      const isSelected = selectedRole?.id === role.id;
                      return (
                        <div
                          key={role.id}
                          onClick={() => setSelectedRole(role)}
                          className={`p-4 cursor-pointer transition-colors relative flex items-start justify-between gap-3 ${
                            isSelected ? "bg-primary/5 hover:bg-primary/10 border-l-[3px] border-primary pl-[13px]" : "hover:bg-surface-2"
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[13px] text-text-primary">{role.name}</span>
                              <span className="text-[10px] font-mono bg-border/60 text-text-secondary px-1.5 py-0.5 rounded uppercase">
                                {role.code}
                              </span>
                              {role.tenant ? (
                                <span className="text-[9px] bg-info-tint text-info border border-info/20 px-1 rounded">Tenant</span>
                              ) : (
                                <span className="text-[9px] bg-success-tint text-success border border-success/20 px-1 rounded">Global</span>
                              )}
                            </div>
                            <p className="text-[12px] text-text-secondary mt-1 line-clamp-2">
                              {role.description || "No description provided."}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenEdit(role)}
                              className="p-1 rounded text-text-secondary hover:bg-border/40 hover:text-text-primary transition"
                              title="Edit Role"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetId(role.id)}
                              className="p-1 rounded text-danger hover:bg-danger-tint transition"
                              title="Delete Role"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            </div>

            {/* Right Pane: Permission Matrix */}
            <div className="lg:col-span-7">
              {selectedRole ? (
                <Card>
                  <div className="p-4 border-b border-border bg-surface-2/40">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-[14px] text-text-primary">
                        Permissions for {selectedRole.name}
                      </h3>
                    </div>
                    <p className="text-[12px] text-text-secondary mt-1">
                      {selectedRole.description || "Edit permissions associated with this role."}
                    </p>
                  </div>

                  <div className="p-4 overflow-y-auto max-h-[600px] scrollbar-thin space-y-6">
                    {Object.keys(groupedPermissions).length === 0 ? (
                      <div className="p-4 text-center text-text-disabled text-[13px]">
                        No system permissions configured in database.
                      </div>
                    ) : (
                      Object.entries(groupedPermissions).map(([category, perms]) => (
                        <div key={category} className="space-y-2.5">
                          <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border pb-1">
                            {category} Module
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {perms.map((perm) => {
                              const isAssigned = selectedRolePermissionsMap.has(perm.id);
                              return (
                                <div
                                  key={perm.id}
                                  className={`p-3 rounded-lg border flex items-center justify-between gap-3 transition-all ${
                                    isAssigned
                                      ? "border-primary/30 bg-primary/5 shadow-sm"
                                      : "border-border bg-surface hover:border-border-hover"
                                  }`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-[12px] text-text-primary truncate">
                                      {perm.code}
                                    </div>
                                    <div className="text-[10.5px] text-text-secondary mt-0.5 line-clamp-2">
                                      {perm.description || "No description available"}
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => handleTogglePermission(perm.id)}
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                      isAssigned ? "bg-primary" : "bg-border"
                                    }`}
                                  >
                                    <span
                                      className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        isAssigned ? "translate-x-4" : "translate-x-0"
                                      }`}
                                    />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              ) : (
                <Card className="flex flex-col items-center justify-center p-8 text-center text-text-secondary h-64">
                  <Shield className="h-10 w-10 text-text-disabled mb-2 stroke-[1.25]" />
                  <p className="text-[13px]">Select a role from the left pane to manage its permissions.</p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Role Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <Card className="w-full max-w-md shadow-lg overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-border bg-surface-2 flex items-center justify-between">
              <h3 className="font-semibold text-[14px] text-text-primary">
                {editingRole ? "Edit Platform Role" : "Create New Role"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded text-text-disabled hover:bg-border/60 hover:text-text-primary transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-text-secondary">Role Name</label>
                <input
                  type="text"
                  placeholder="e.g. Reservation Agent"
                  className={inputCls}
                  value={formFields.name}
                  onChange={(e) => setFormFields((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-text-secondary">Role Code</label>
                <input
                  type="text"
                  placeholder="e.g. reservation_agent"
                  className={inputCls}
                  value={formFields.code}
                  onChange={(e) => setFormFields((prev) => ({ ...prev, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") }))}
                  disabled={!!editingRole}
                  required
                />
                <p className="text-[10px] text-text-disabled">Unique slug code used internally. Lowercase alphanumeric and underscores.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-text-secondary">Description</label>
                <textarea
                  placeholder="Provide role description..."
                  className={textareaCls}
                  value={formFields.description}
                  onChange={(e) => setFormFields((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="h-9 px-4 text-[13px] rounded-md"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 px-4 bg-primary text-primary-foreground text-[13px] hover:bg-primary-pressed rounded-md"
                >
                  {editingRole ? "Save Changes" : "Create Role"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role from the platform database and remove all its permission mappings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole} className="bg-danger text-white hover:bg-danger-hover">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
