import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Plus, Search, ShieldCheck, Mail, Phone, Edit2, Trash2, ShieldAlert, Check, X, Shield, Lock, Unlock } from "lucide-react";
import { PageHeader, Card, Button } from "@/components/ui/Primitives";
import { platformUsersApi, type PlatformUser, type PlatformUserPayload } from "@/services/api/users";
import { useAuth } from "@/features/auth/hooks/useAuth";
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

export const Route = createFileRoute("/superadmin/users")({
  head: () => ({ meta: [{ title: "Platform User Management — Superadmin" }] }),
  component: SuperadminUsersComponent,
});

const inputCls =
  "h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";
const selectCls =
  "h-9 w-full rounded-md border border-border bg-surface px-2 text-[13px] text-text-primary focus:border-primary focus:outline-none";

function SuperadminUsersComponent() {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal / Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);



  // Form Fields State
  const [formFields, setFormFields] = useState<PlatformUserPayload>({
    name: "",
    username: "",
    email: "",
    phone: "",
    preferred_language: "en",
    preferred_timezone: "UTC",
    is_active: true,
    is_staff: true,
    is_superuser: true,
    password: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await platformUsersApi.getUsers();
      setUsers(data);
    } catch (err: any) {
      toast.error("Failed to load platform users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const term = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.phone || "").toLowerCase().includes(term)
      );
    });
  }, [users, search]);

  const handleOpenNew = () => {
    setEditingUser(null);
    setFormFields({
      name: "",
      username: "",
      email: "",
      phone: "",
      preferred_language: "en",
      preferred_timezone: "UTC",
      is_active: true,
      is_staff: true,
      is_superuser: true,
      password: "",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (user: PlatformUser) => {
    setEditingUser(user);
    setFormFields({
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone || "",
      preferred_language: user.preferred_language,
      preferred_timezone: user.preferred_timezone,
      is_active: user.is_active,
      is_staff: user.is_staff,
      is_superuser: user.is_superuser,
      password: "", // Leave blank unless updating
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formFields.name || !formFields.username || !formFields.email) {
      toast.error("Please fill in Name, Username, and Email.");
      return;
    }

    if (!editingUser && !formFields.password) {
      toast.error("Password is required for new platform users.");
      return;
    }

    try {
      if (editingUser) {
        // Update user
        const updatePayload: Partial<PlatformUserPayload> = { ...formFields };
        if (!updatePayload.password) {
          delete updatePayload.password;
        }
        await platformUsersApi.updateUser(editingUser.id, updatePayload);
        toast.success("Platform user updated successfully.");
      } else {
        // Create user
        await platformUsersApi.createUser(formFields);
        toast.success("Platform user created successfully.");
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error("Failed to save user: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await platformUsersApi.deleteUser(deleteTargetId);
      toast.success("Platform user deleted successfully.");
      setDeleteTargetId(null);
      loadData();
    } catch (err: any) {
      toast.error("Failed to delete user: " + err.message);
    }
  };

  const toggleUserStatus = async (user: PlatformUser) => {
    try {
      await platformUsersApi.updateUser(user.id, { is_active: !user.is_active });
      toast.success(`${user.name} is now ${!user.is_active ? "Active" : "Inactive"}`);
      loadData();
    } catch (err: any) {
      toast.error("Failed to toggle status: " + err.message);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Platform Controls"
        title="Platform Users"
        description="Configure superadmins and staff members with root system configuration privileges."
        actions={
          <Button size="sm" onClick={handleOpenNew}>
            <Plus className="h-3.5 w-3.5" /> New Platform User
          </Button>
        }
      />

      <div className="responsive-page-x py-6 space-y-6">


        {/* Warning Banner */}
        <Card className="p-4 bg-[oklch(0.96_0.06_70)]/30 border border-warning/30 flex gap-3 rounded-lg">
          <ShieldAlert className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="text-[12.5px] text-text-primary">
            <div className="font-semibold text-warning">Global Permissions Warning</div>
            <p className="mt-1 text-text-secondary leading-relaxed">
              Users managed here represent root platform administrators. They have permissions to bypass standard tenant-level isolations,
              manage billing plans, audit global platform system behavior, and configure system integrations. Configure credentials securely.
            </p>
          </div>
        </Card>

        {/* Filter Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-[13px] text-text-primary focus:border-primary focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Users List / Table */}
        {loading ? (
          <div className="text-center py-12 text-[13px] text-text-secondary">Loading platform users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-[13.5px] text-text-secondary border border-dashed border-border rounded-xl">
            No platform users found matching your search.
          </div>
        ) : (
          <Card className="overflow-hidden border border-border bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-2 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                    <th className="px-5 py-3">User Details</th>
                    <th className="px-5 py-3">Security Role</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Language & Timezone</th>
                    <th className="px-5 py-3">Created Date</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-[13px]">
                  {filteredUsers.map((u) => {
                    const isSelf = authUser?.id === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-sidebar-hover/10 transition-colors">
                        {/* Details */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs shrink-0">
                              {u.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-text-primary flex items-center gap-1.5">
                                {u.name} {isSelf && (
                                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.25 rounded-full font-medium">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-text-secondary font-mono mt-0.5">@{u.username}</div>
                              <div className="flex items-center gap-3 text-[11.5px] text-text-muted mt-1">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" /> {u.email}
                                </span>
                                {u.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> {u.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Security Role */}
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col gap-1">
                            {u.is_superuser && (
                              <span className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded text-[10.5px] font-medium bg-error/15 text-error">
                                <Shield className="h-3.5 w-3.5" /> Superuser
                              </span>
                            )}
                            {u.is_staff && (
                              <span className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded text-[10.5px] font-medium bg-primary/15 text-primary-pressed">
                                <ShieldCheck className="h-3.5 w-3.5" /> Staff Access
                              </span>
                            )}
                            {!u.is_superuser && !u.is_staff && (
                              <span className="text-text-muted italic text-[12px]">Standard User</span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => !isSelf && toggleUserStatus(u)}
                            disabled={isSelf}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium transition ${
                              u.is_active
                                ? "bg-success/15 text-success hover:bg-success/25"
                                : "bg-neutral-light text-text-muted hover:bg-border/60"
                            } ${isSelf ? "cursor-default opacity-85" : "cursor-pointer"}`}
                            title={isSelf ? "Cannot deactivate yourself" : "Click to toggle active status"}
                          >
                            {u.is_active ? (
                              <>
                                <Check className="h-3 w-3" /> Active
                              </>
                            ) : (
                              <>
                                <X className="h-3 w-3" /> Suspended
                              </>
                            )}
                          </button>
                        </td>

                        {/* Language & Timezone */}
                        <td className="px-5 py-3.5 text-text-secondary font-medium">
                          <div>Lang: <span className="font-mono text-[12px] bg-surface-2 border border-border px-1.5 py-0.25 rounded">{u.preferred_language}</span></div>
                          <div className="text-[11.5px] text-text-muted mt-1">Zone: {u.preferred_timezone}</div>
                        </td>

                        {/* Created Date */}
                        <td className="px-5 py-3.5 text-text-secondary">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="p-1.5 rounded-md text-text-secondary hover:bg-surface-2 hover:text-text-primary transition"
                              title="Edit Details"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetId(u.id)}
                              disabled={isSelf}
                              className={`p-1.5 rounded-md text-text-secondary hover:bg-error-tint hover:text-error transition ${
                                isSelf ? "opacity-35 cursor-not-allowed" : ""
                              }`}
                              title={isSelf ? "Cannot delete yourself" : "Delete Platform User"}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Editor Modal */}
      <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
        <AlertDialogContent className="sm:max-w-[480px]">
          <AlertDialogHeader>
            <AlertDialogTitle>{editingUser ? "Edit Platform User" : "Create Platform User"}</AlertDialogTitle>
            <AlertDialogDescription>
              Configure display details, language preferences, and security authorization for this platform account.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-3 flex flex-col">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Display Name</label>
                <input
                  className={inputCls}
                  placeholder="e.g. John Doe"
                  value={formFields.name}
                  onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Username</label>
                <input
                  className={inputCls}
                  placeholder="e.g. jdoe"
                  value={formFields.username}
                  onChange={(e) => setFormFields({ ...formFields, username: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Email Address</label>
                <input
                  type="email"
                  className={inputCls}
                  placeholder="e.g. jdoe@retrod.io"
                  value={formFields.email}
                  onChange={(e) => setFormFields({ ...formFields, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Phone Number (Optional)</label>
                <input
                  className={inputCls}
                  placeholder="e.g. +1 555-0199"
                  value={formFields.phone}
                  onChange={(e) => setFormFields({ ...formFields, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Preferred Language</label>
                <select
                  className={selectCls}
                  value={formFields.preferred_language}
                  onChange={(e) => setFormFields({ ...formFields, preferred_language: e.target.value })}
                >
                  <option value="en">English (US)</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Timezone</label>
                <select
                  className={selectCls}
                  value={formFields.preferred_timezone}
                  onChange={(e) => setFormFields({ ...formFields, preferred_timezone: e.target.value })}
                >
                  <option value="UTC">UTC (Universal)</option>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider block mb-1">
                {editingUser ? "Update Password (Leave blank to keep)" : "Account Password"}
              </label>
              <input
                type="password"
                className={inputCls}
                placeholder={editingUser ? "••••••••" : "Provide a secure password"}
                value={formFields.password}
                onChange={(e) => setFormFields({ ...formFields, password: e.target.value })}
              />
            </div>

            {/* Checkboxes */}
            <div className="border border-border/80 rounded-lg p-3 space-y-2.5 bg-surface-2/30">
              <label className="flex items-center gap-2 text-[12.5px] select-none text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={formFields.is_active}
                  onChange={(e) => setFormFields({ ...formFields, is_active: e.target.checked })}
                />
                Account Active
              </label>
              <label className="flex items-center gap-2 text-[12.5px] select-none text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={formFields.is_staff}
                  onChange={(e) => setFormFields({ ...formFields, is_staff: e.target.checked })}
                />
                Staff Privileges (View administrative sections)
              </label>
              <label className="flex items-center gap-2 text-[12.5px] select-none text-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={formFields.is_superuser}
                  onChange={(e) => setFormFields({ ...formFields, is_superuser: e.target.checked })}
                />
                Superuser Privileges (Unrestricted administrative privileges)
              </label>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave}>Save User</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this administrator account from the system database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default SuperadminUsersComponent;
