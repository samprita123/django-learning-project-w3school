import { useState, useEffect } from "react";
import { Plus, MoreHorizontal, Edit, Key, ShieldOff, ShieldCheck, Trash2 } from "lucide-react";
import { PageHeader, Card, CardHeader, StatusBadge, Button } from "@/components/ui/Primitives";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { usersApi, type AppUser } from "@/services/api/users";
import { rbacApi, type Role as DbRole } from "@/services/api/rbac";
import { settingsApi, type DepartmentData, type ShiftData } from "@/services/api/settings";
import { propertyApi, type Property } from "@/services/api/property";

export function StaffFeature() {
  const [staffList, setStaffList] = useState<AppUser[]>([]);
  const [dbRoles, setDbRoles] = useState<DbRole[]>([]);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Editor drawer states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<AppUser | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formDept, setFormDept] = useState("");
  const [formShift, setFormShift] = useState("");
  const [formAssignedProps, setFormAssignedProps] = useState<string[]>([]);
  const [formIsActive, setFormIsActive] = useState(true);

  // Dialog states
  const [statusConfirmStaff, setStatusConfirmStaff] = useState<AppUser | null>(null);
  const [deleteConfirmStaff, setDeleteConfirmStaff] = useState<AppUser | null>(null);
  const [pwdResetStaff, setPwdResetStaff] = useState<AppUser | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [uData, rData, dData, sData, pData] = await Promise.all([
        usersApi.getUsers(),
        rbacApi.getRoles(),
        settingsApi.getDepartments(),
        settingsApi.getShifts(),
        propertyApi.getProperties(),
      ]);
      setStaffList(uData);
      setDbRoles(rData);
      setDepartments(dData);
      setShifts(sData);
      setProperties(pData);
    } catch (err: any) {
      toast.error("Failed to load staff roster: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setEditingStaff(null);
    setFormName("");
    setFormUsername("");
    setFormEmail("");
    setFormPhone("");
    setFormPassword("");
    setFormRole("");
    setFormDept("");
    setFormShift("");
    setFormAssignedProps(properties.map((p) => p.id));
    setFormIsActive(true);
    setIsEditorOpen(true);
  };

  const handleEdit = (s: AppUser) => {
    setEditingStaff(s);
    setFormName(s.name);
    setFormUsername(s.username || "");
    setFormEmail(s.email);
    setFormPhone(s.phone || "");
    setFormPassword(""); // Always blank initially for security
    setFormRole(s.role || "");
    setFormDept(s.department || "");
    setFormShift(s.shift || "");
    setFormAssignedProps(
      s.assigned_properties && s.assigned_properties.length > 0
        ? s.assigned_properties.map((p) => p.id)
        : properties.map((p) => p.id)
    );
    setFormIsActive(s.is_active);
    setIsEditorOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      toast.error("Name and Email are required fields.");
      return;
    }

    const payload: any = {
      name: formName,
      username: formUsername.trim() || formEmail.split("@")[0],
      email: formEmail,
      phone: formPhone,
      is_active: formIsActive,
      role: formRole || null,
      department: formDept || null,
      shift: formShift || null,
      assigned_property_ids: formAssignedProps,
    };

    if (formPassword.trim()) {
      payload.password = formPassword;
    }

    try {
      if (editingStaff) {
        const updated = await usersApi.updateUser(editingStaff.id, payload);
        setStaffList(staffList.map((u) => (u.id === editingStaff.id ? updated : u)));
        toast.success("Staff profile updated successfully.");
      } else {
        if (!formPassword.trim()) {
          toast.error("Password is required for new staff accounts.");
          return;
        }
        const created = await usersApi.createUser(payload);
        setStaffList([...staffList, created]);
        toast.success("New staff member created successfully.");
      }
      setIsEditorOpen(false);
    } catch (err: any) {
      toast.error("Failed to save staff member: " + err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmStaff) return;
    try {
      await usersApi.deleteUser(deleteConfirmStaff.id);
      setStaffList(staffList.filter((u) => u.id !== deleteConfirmStaff.id));
      toast.success(`Removed ${deleteConfirmStaff.name} from staff list.`);
      setDeleteConfirmStaff(null);
    } catch (err: any) {
      toast.error("Failed to delete user: " + err.message);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusConfirmStaff) return;
    const targetStatus = !statusConfirmStaff.is_active;
    try {
      const updated = await usersApi.updateUser(statusConfirmStaff.id, {
        is_active: targetStatus,
      });
      setStaffList(staffList.map((u) => (u.id === statusConfirmStaff.id ? updated : u)));
      toast.success(targetStatus ? "User access enabled" : "User access disabled");
      setStatusConfirmStaff(null);
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const handleResetPassword = async () => {
    if (!pwdResetStaff || !resetPasswordVal.trim()) return;
    try {
      await usersApi.updateUser(pwdResetStaff.id, {
        password: resetPasswordVal,
      });
      toast.success(`Password updated for ${pwdResetStaff.name}`);
      setPwdResetStaff(null);
      setResetPasswordVal("");
    } catch (err: any) {
      toast.error("Failed to reset password: " + err.message);
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
        title="Staff Roster"
        description="Invite operational personnel, define organizational departments, and allocate shifts."
        actions={
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Staff Member
          </Button>
        }
      />
      <div className="responsive-page-x py-6">
        <Card>
          <CardHeader title="System Personnel" hint={`${staffList.length} members`} />
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-surface-2/40 text-left">
                  {["Name", "Role", "Department", "Assigned Property", "Shift", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-text-disabled">
                      No staff members registered. Click "Add Staff Member" to onboard.
                    </td>
                  </tr>
                ) : (
                  staffList.map((s) => (
                    <tr key={s.id} className="border-b border-border-subtle hover:bg-surface-2/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">
                            {s.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                          <div>
                            <span className="font-semibold text-text-primary block leading-tight">{s.name}</span>
                            <span className="text-[11px] text-text-secondary">{s.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-primary">
                        <span className="font-medium text-[13px]">{s.role_name || "—"}</span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {s.department_name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {s.assigned_properties && s.assigned_properties.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {s.assigned_properties.map((p) => (
                              <span
                                key={p.id}
                                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20"
                              >
                                {p.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-text-secondary italic">All Tenant Properties</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {s.shift_name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={s.is_active ? "success" : "neutral"}>
                          {s.is_active ? "Active" : "Inactive"}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded p-1.5 text-text-secondary hover:bg-surface-2 hover:text-text-primary transition cursor-pointer">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleEdit(s)} className="cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit details</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { setPwdResetStaff(s); setResetPasswordVal(""); }} className="cursor-pointer">
                              <Key className="mr-2 h-4 w-4" />
                              <span>Change password</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusConfirmStaff(s)} className="cursor-pointer">
                              {s.is_active ? <ShieldOff className="mr-2 h-4 w-4" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                              <span>{s.is_active ? "Disable account" : "Enable account"}</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setDeleteConfirmStaff(s)} className="text-error focus:bg-error-tint focus:text-error cursor-pointer">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Remove member</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingStaff ? "Edit Staff Profile" : "Add Staff Member"}</SheetTitle>
          </SheetHeader>
          
          <form onSubmit={handleSave} className="py-6 space-y-6">
            {/* Profile Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary border-b border-border-subtle pb-1">Profile Details</h3>
              <div>
                <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-md border border-border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-text-primary"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Username</label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className="w-full rounded-md border border-border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-text-primary"
                  placeholder="e.g. johndoe"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full rounded-md border border-border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-text-primary"
                    placeholder="john@hotel.com"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full rounded-md border border-border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-text-primary"
                    placeholder="+1 555-0192"
                  />
                </div>
              </div>
              
              {/* Set Password Field */}
              <div>
                <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">
                  {editingStaff ? "Change Password (Leave blank to keep current)" : "Set Password"}
                </label>
                <input
                  type="password"
                  required={!editingStaff}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full rounded-md border border-border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-text-primary"
                  placeholder="Min. 8 characters"
                />
              </div>
            </div>

            {/* Employment Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary border-b border-border-subtle pb-1">Employment Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Department</label>
                  <select
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full rounded-md border border-border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-text-primary"
                  >
                    <option value="">Select Department...</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Role / Title</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full rounded-md border border-border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-text-primary"
                  >
                    <option value="">Select Role...</option>
                    {dbRoles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Status</label>
                  <select
                    value={formIsActive ? "Active" : "Inactive"}
                    onChange={(e) => setFormIsActive(e.target.value === "Active")}
                    className="w-full rounded-md border border-border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-text-primary"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Shift Preference</label>
                  <select
                    value={formShift}
                    onChange={(e) => setFormShift(e.target.value)}
                    className="w-full rounded-md border border-border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-text-primary"
                  >
                    <option value="">Select Shift...</option>
                    {shifts.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Property Assignment Section */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] uppercase text-text-secondary font-semibold block">
                  Property Assignment *
                </label>
                <div className="border border-border rounded-lg p-3 bg-surface space-y-2">
                  {properties.length === 0 ? (
                    <div className="text-xs text-text-secondary italic">No tenant properties found.</div>
                  ) : (
                    properties.map((p) => {
                      const isChecked = formAssignedProps.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className="flex items-center gap-2.5 text-xs font-medium text-text-primary cursor-pointer select-none p-1 rounded hover:bg-surface-2/60 transition"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormAssignedProps([...formAssignedProps, p.id]);
                              } else {
                                setFormAssignedProps(formAssignedProps.filter((id) => id !== p.id));
                              }
                            }}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                          />
                          <span>{p.name}</span>
                          <span className="text-[11px] text-text-secondary font-normal">
                            ({p.city || p.property_type || "Property"})
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
                <span className="text-[11px] text-text-secondary block">
                  Assign which properties this staff member (e.g. Front Office Manager) is authorized to access and view.
                </span>
              </div>
            </div>

            <SheetFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
              <Button type="submit">Save Profile</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Change Password Dialog */}
      {pwdResetStaff && (
        <AlertDialog open={!!pwdResetStaff} onOpenChange={(open) => !open && setPwdResetStaff(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Change Password: {pwdResetStaff.name}</AlertDialogTitle>
              <div className="py-2">
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={resetPasswordVal}
                  onChange={(e) => setResetPasswordVal(e.target.value)}
                  className="w-full rounded-md border border-border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-text-primary"
                />
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPwdResetStaff(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetPassword} disabled={!resetPasswordVal.trim()}>
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Status Confirm Alert */}
      <AlertDialog open={!!statusConfirmStaff} onOpenChange={(open) => !open && setStatusConfirmStaff(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Account Access?</AlertDialogTitle>
            <AlertDialogDescription>
              This will {statusConfirmStaff?.is_active ? "disable" : "enable"} system access for {statusConfirmStaff?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirm Alert */}
      <AlertDialog open={!!deleteConfirmStaff} onOpenChange={(open) => !open && setDeleteConfirmStaff(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove staff member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteConfirmStaff?.name}? This action will permanently revoke their access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-error hover:bg-error/90 text-white" onClick={handleDeleteConfirm}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default StaffFeature;
