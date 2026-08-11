import { fetchServices, fetchServiceCategories, createServiceCategory, updateServiceCategory, deleteServiceCategory, ServiceCategory } from '@/services/api/services';
import { usersApi } from "@/services/api/users";
import { PageHeader, Card, CardHeader, Button } from "@/components/ui/Primitives";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Palette } from "lucide-react";
import {
  APP_THEME_GROUP_LABELS,
  APP_THEMES,
  applyTheme,
  persistTheme,
  readSavedTheme,
  type AppTheme,
} from "@/app/theme/theme";
import type { FeatureKey } from "@/types/entitlements";
import { useState, useEffect } from "react";
import { authApi } from "@/services/auth-api";
import { settingsApi, type DepartmentData, type ShiftData, type CouponData, type OccupancyTypeData, type BookingSourceData } from "@/services/api/settings";
import { Plus, Edit2, Trash2, X, Lock, Copy, Check, Camera, Users } from "lucide-react";
import { toast } from "sonner";
import { PaymentGatewayModal } from "./PaymentGatewayModal";
import { ChannelManagerModal } from "./ChannelManagerModal";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const integrations = [
  { name: "Payment Gateways", desc: "Stripe, Razorpay, PhonePe, HDFC...", status: "Not Configured" },
  { name: "Channel Managers", desc: "SiteMinder, STAAH, Hotel-Spider...", status: "Not Configured" },
  { name: "Mailgun", desc: "Transactional emails", status: "Disconnected" },
  { name: "Twilio", desc: "SMS & WhatsApp comms", status: "Connected" },
  { name: "Tally ERP", desc: "Accounting export", status: "Disconnected" },
];

export function SettingsFeature() {
  const { user, logout, entitlements, effectiveFeatures, setTenantFeature, setPropertyFeatures, setEntitlementPlan, updateUser } =
    useAuth();
  
  const [profileName, setFormProfileName] = useState(user?.name || "");
  const [profilePhone, setFormProfilePhone] = useState(user?.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || user?.avatar_url || "");
  const [copiedLicense, setCopiedLicense] = useState(false);

  const [categoriesList, setCategoriesList] = useState<ServiceCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryCreateModalOpen, setCategoryCreateModalOpen] = useState(false);
  const [newCreatedCategory, setNewCreatedCategory] = useState("");
  const [tenantConfig, setTenantConfig] = useState<any>(null);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const cats = await fetchServiceCategories();
      setCategoriesList(cats);
    } catch (err: any) {
      toast.error("Failed to load categories: " + err.message);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Sync profile details and fetch latest subscription / license data from backend on mount
  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (!user?.id) return;
      try {
        const uList = await usersApi.getUsers();
        const current = uList.find((u) => u.id === user.id);
        if (current) {
          setFormProfileName(current.name);
          setFormProfilePhone(current.phone || "");
          setAvatarUrl(current.avatar_url || "");
          if (updateUser) {
            updateUser(user.id, {
              name: current.name,
              phone: current.phone,
              avatarUrl: current.avatar_url,
              subscription_plan: current.subscription_plan,
              subscription_expiry: current.subscription_expiry,
              license_key: current.license_key,
            });
          }
        }
      } catch (err: any) {
        console.error("Failed to sync profile from DB:", err);
      }
    };
    fetchLatestProfile();
  }, [user?.id]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Profile picture must be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        toast.success("Profile picture updated. Click 'Save Profile' to commit changes.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error("Name is required.");
      return;
    }
    setLoading(true);
    try {
      const updated = await usersApi.updateUser(user!.id, {
        name: profileName,
        phone: profilePhone,
        avatar_url: avatarUrl,
      });
      if (updateUser) {
        updateUser(user!.id, {
          name: updated.name,
          phone: updated.phone,
          avatarUrl: updated.avatar_url,
        });
      }
      toast.success("Profile updated successfully.");
    } catch (err: any) {
      toast.error("Failed to update profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLicense = () => {
    if (user?.license_key) {
      navigator.clipboard.writeText(user.license_key);
      setCopiedLicense(true);
      toast.success("License key copied to clipboard!");
      setTimeout(() => setCopiedLicense(false), 2000);
    }
  };
  const activeProperty = user?.property || "The Grand Palace";

  const [activeTab, setActiveTab] = useState<string>("Account");
  const [theme, setTheme] = useState<AppTheme>(() => readSavedTheme());
  const selectedTheme =
    APP_THEMES.find((themeOption) => themeOption.value === theme) ?? APP_THEMES[0];

  const selectTheme = (next: AppTheme) => {
    setTheme(next);
    applyTheme(next);
    persistTheme(next);
  };

  const groupedThemes = APP_THEMES.reduce<Record<string, typeof APP_THEMES>>((acc, item) => {
    acc[item.group] = [...(acc[item.group] ?? []), item];
    return acc;
  }, {});
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmNewPwd, setConfirmNewPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isChannelManagerModalOpen, setIsChannelManagerModalOpen] = useState(false);

  // Department states
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentData | null>(null);
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptCode, setNewDeptCode] = useState("");
  const [newDeptDesc, setNewDeptDesc] = useState("");

  // Shift states
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftData | null>(null);
  const [newShiftName, setNewShiftName] = useState("");
  const [newShiftCode, setNewShiftCode] = useState("");
  const [newShiftStartTime, setNewShiftStartTime] = useState("09:00");
  const [newShiftEndTime, setNewShiftEndTime] = useState("17:00");
  const [newShiftDesc, setNewShiftDesc] = useState("");

  // Coupon states
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponData | null>(null);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponType, setNewCouponType] = useState<"FLAT" | "PERCENTAGE">("PERCENTAGE");
  const [newCouponValue, setNewCouponValue] = useState("");
  const [newCouponValidFrom, setNewCouponValidFrom] = useState("");
  const [newCouponValidUntil, setNewCouponValidUntil] = useState("");
  const [newCouponMaxUses, setNewCouponMaxUses] = useState("");

  // Occupancy Type states
  const [occupancyTypes, setOccupancyTypes] = useState<OccupancyTypeData[]>([]);
  const [occupancyModalOpen, setOccupancyModalOpen] = useState(false);
  const [editingOccupancy, setEditingOccupancy] = useState<OccupancyTypeData | null>(null);
  const [newOccupancyName, setNewOccupancyName] = useState("");
  const [newOccupancyCode, setNewOccupancyCode] = useState("");
  const [newOccupancyMaxGuests, setNewOccupancyMaxGuests] = useState("2");
  const [newOccupancyMultiplier, setNewOccupancyMultiplier] = useState("1.0");

  // Booking Source states
  const [bookingSources, setBookingSources] = useState<BookingSourceData[]>([]);
  const [bookingSourceModalOpen, setBookingSourceModalOpen] = useState(false);
  const [editingBookingSource, setEditingBookingSource] = useState<BookingSourceData | null>(null);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceIcon, setNewSourceIcon] = useState("");
  const [newSourceDetails, setNewSourceDetails] = useState("");

  // Payment Gateways tenant state
  const [tenantPaymentGateways, setTenantPaymentGateways] = useState<any[]>([]);
  const [globalPaymentGateways, setGlobalPaymentGateways] = useState<any[]>([]);
  const [loadingGateways, setLoadingGateways] = useState(false);

  const loadTenantGateways = async () => {
    setLoadingGateways(true);
    try {
      const [gList, tList] = await Promise.all([
        settingsApi.getPaymentGateways(),
        settingsApi.getTenantPaymentGateways()
      ]);
      setGlobalPaymentGateways(gList);
      setTenantPaymentGateways(tList);
    } catch (err: any) {
      console.warn("Failed to load tenant gateways:", err);
    } finally {
      setLoadingGateways(false);
    }
  };

  const handleToggleTenantGateway = async (gw: any, currentConfig: any) => {
    try {
      const newStatus = !currentConfig?.is_enabled;
      const payload = {
        id: currentConfig?.id,
        gateway: gw.id,
        is_enabled: newStatus,
        api_key: currentConfig?.api_key || "",
        api_secret: currentConfig?.api_secret || "",
      };
      await settingsApi.createOrUpdateTenantPaymentGateway(payload);
      toast.success(`${gw.name} is now ${newStatus ? "Enabled" : "Disabled"}.`);
      loadTenantGateways();
    } catch (err: any) {
      toast.error("Failed to toggle gateway: " + err.message);
    }
  };

  const loadBookingSources = async () => {
    try {
      const data = await settingsApi.getBookingSources();
      setBookingSources(data);
    } catch (err: any) {
      toast.error("Failed to load booking sources: " + err.message);
    }
  };

  const handleSaveBookingSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) {
      toast.error("Please fill in booking source name.");
      return;
    }
    const payload: BookingSourceData = {
      name: newSourceName,
      icon: newSourceIcon,
      details: newSourceDetails,
      is_active: true,
    };
    try {
      if (editingBookingSource) {
        const updated = await settingsApi.updateBookingSource(editingBookingSource.id!, payload);
        setBookingSources(bookingSources.map(b => b.id === editingBookingSource.id ? updated : b));
        toast.success("Booking source updated.");
      } else {
        const created = await settingsApi.createBookingSource(payload);
        setBookingSources([...bookingSources, created]);
        toast.success("Booking source created.");
      }
      setBookingSourceModalOpen(false);
      setEditingBookingSource(null);
      setNewSourceName("");
      setNewSourceIcon("");
      setNewSourceDetails("");
    } catch (err: any) {
      toast.error("Failed to save booking source: " + err.message);
    }
  };

  const handleDeleteBookingSource = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking source?")) return;
    try {
      await settingsApi.deleteBookingSource(id);
      setBookingSources(bookingSources.filter(b => b.id !== id));
      toast.success("Booking source deleted.");
    } catch (err: any) {
      toast.error("Failed to delete booking source: " + err.message);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await settingsApi.getDepartments();
      setDepartments(data);
    } catch (err: any) {
      toast.error("Failed to load departments: " + err.message);
    }
  };

  const loadShifts = async () => {
    try {
      const data = await settingsApi.getShifts();
      setShifts(data);
    } catch (err: any) {
      toast.error("Failed to load shifts: " + err.message);
    }
  };

  const loadCoupons = async () => {
    try {
      const data = await settingsApi.getCoupons();
      setCoupons(data);
    } catch (err: any) {
      toast.error("Failed to load coupons: " + err.message);
    }
  };

  const loadOccupancyTypes = async () => {
    try {
      const data = await settingsApi.getOccupancyTypes();
      setOccupancyTypes(data);
    } catch (err: any) {
      toast.error("Failed to load occupancy types: " + err.message);
    }
  };

  const generateSlugCode = (name: string) => {
    return name.toUpperCase().trim().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_');
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeVal = (newDeptCode || generateSlugCode(newDeptName)).trim();
    if (!newDeptName.trim() || !codeVal) {
      toast.error("Please fill in department details.");
      return;
    }
    const payload = { name: newDeptName, code: codeVal, description: newDeptDesc };
    try {
      if (editingDept) {
        const updated = await settingsApi.updateDepartment(editingDept.id!, payload);
        setDepartments(departments.map(d => d.id === editingDept.id ? updated : d));
        toast.success("Department updated.");
      } else {
        const created = await settingsApi.createDepartment(payload);
        setDepartments([...departments, created]);
        toast.success("Department created.");
      }
      setDeptModalOpen(false);
      setEditingDept(null);
      setNewDeptName("");
      setNewDeptCode("");
      setNewDeptDesc("");
    } catch (err: any) {
      toast.error("Failed to save department: " + err.message);
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      await settingsApi.deleteDepartment(id);
      setDepartments(departments.filter(d => d.id !== id));
      toast.success("Department deleted.");
    } catch (err: any) {
      toast.error("Failed to delete department: " + err.message);
    }
  };

  const handleSaveShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeVal = (newShiftCode || generateSlugCode(newShiftName)).trim();
    if (!newShiftName.trim() || !codeVal) {
      toast.error("Please fill in shift details.");
      return;
    }
    const payload = {
      name: newShiftName,
      code: codeVal,
      start_time: newShiftStartTime + (newShiftStartTime.length === 5 ? ":00" : ""),
      end_time: newShiftEndTime + (newShiftEndTime.length === 5 ? ":00" : ""),
      description: newShiftDesc
    };
    try {
      if (editingShift) {
        const updated = await settingsApi.updateShift(editingShift.id!, payload);
        setShifts(shifts.map(s => s.id === editingShift.id ? updated : s));
        toast.success("Shift updated.");
      } else {
        const created = await settingsApi.createShift(payload);
        setShifts([...shifts, created]);
        toast.success("Shift created.");
      }
      setShiftModalOpen(false);
      setEditingShift(null);
      setNewShiftName("");
      setNewShiftCode("");
      setNewShiftStartTime("09:00");
      setNewShiftEndTime("17:00");
      setNewShiftDesc("");
    } catch (err: any) {
      toast.error("Failed to save shift: " + err.message);
    }
  };

  const handleDeleteShift = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shift?")) return;
    try {
      await settingsApi.deleteShift(id);
      setShifts(shifts.filter(s => s.id !== id));
      toast.success("Shift deleted.");
    } catch (err: any) {
      toast.error("Failed to delete shift: " + err.message);
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponValue.trim()) {
      toast.error("Please fill in coupon details.");
      return;
    }
    const payload = {
      code: newCouponCode,
      discount_type: newCouponType,
      discount_value: newCouponValue,
      valid_from: newCouponValidFrom || null,
      valid_until: newCouponValidUntil || null,
      max_uses: newCouponMaxUses ? parseInt(newCouponMaxUses) : null,
    };
    try {
      if (editingCoupon) {
        const updated = await settingsApi.updateCoupon(editingCoupon.id!, payload);
        setCoupons(coupons.map(c => c.id === editingCoupon.id ? updated : c));
        toast.success("Coupon updated.");
      } else {
        const created = await settingsApi.createCoupon(payload);
        setCoupons([...coupons, created]);
        toast.success("Coupon created.");
      }
      setCouponModalOpen(false);
      setEditingCoupon(null);
      setNewCouponCode("");
      setNewCouponValue("");
      setNewCouponValidFrom("");
      setNewCouponValidUntil("");
      setNewCouponMaxUses("");
    } catch (err: any) {
      toast.error("Failed to save coupon: " + err.message);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await settingsApi.deleteCoupon(id);
      setCoupons(coupons.filter(c => c.id !== id));
      toast.success("Coupon deleted.");
    } catch (err: any) {
      toast.error("Failed to delete coupon: " + err.message);
    }
  };

  const handleSaveOccupancy = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeVal = (newOccupancyCode || generateSlugCode(newOccupancyName)).trim();
    if (!newOccupancyName.trim() || !codeVal) {
      toast.error("Please fill in occupancy details.");
      return;
    }
    const payload: OccupancyTypeData = {
      name: newOccupancyName,
      code: codeVal,
      max_guests: parseInt(newOccupancyMaxGuests) || 1,
      multiplier: parseFloat(newOccupancyMultiplier) || 1.0,
      is_active: true,
    };
    try {
      if (editingOccupancy) {
        const updated = await settingsApi.updateOccupancyType(editingOccupancy.id!, payload);
        setOccupancyTypes(occupancyTypes.map(o => o.id === editingOccupancy.id ? updated : o));
        toast.success("Occupancy type updated.");
      } else {
        const created = await settingsApi.createOccupancyType(payload);
        setOccupancyTypes([...occupancyTypes, created]);
        toast.success("Occupancy type created.");
      }
      setOccupancyModalOpen(false);
      setEditingOccupancy(null);
      setNewOccupancyName("");
      setNewOccupancyCode("");
      setNewOccupancyMaxGuests("2");
      setNewOccupancyMultiplier("1.0");
    } catch (err: any) {
      toast.error("Failed to save occupancy type: " + err.message);
    }
  };

  const handleDeleteOccupancy = async (id: string) => {
    if (!confirm("Are you sure you want to delete this occupancy type?")) return;
    try {
      await settingsApi.deleteOccupancyType(id);
      setOccupancyTypes(occupancyTypes.filter(o => o.id !== id));
      toast.success("Occupancy type deleted.");
    } catch (err: any) {
      toast.error("Failed to delete occupancy type: " + err.message);
    }
  };



  // Session state
  const [sessionList, setSessionList] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [logoutAllModalOpen, setLogoutAllModalOpen] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  // MFA settings state
  const [configId, setConfigId] = useState<string | null>(null);
  const [mfaDoubleConfirmation, setMfaDoubleConfirmation] = useState(true);
  const [togglingMfa, setTogglingMfa] = useState(false);

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const data = await authApi.getSessions();
      const list = Array.isArray(data) ? data : (data?.results || []);
      setSessionList(list);
    } catch (err: any) {
      toast.error("Failed to load active sessions: " + err.message);
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadMfaConfig = async () => {
    try {
      const configs = await settingsApi.getTenantConfigurations();
      if (configs && configs.length > 0) {
        setConfigId(configs[0].id);
        setMfaDoubleConfirmation(configs[0].mfa_double_confirmation !== false);
      }
    } catch (err: any) {
      console.error("Failed to load MFA config:", err);
    }
  };

  const handleToggleMFA = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!configId) return;
    const val = e.target.checked;
    setTogglingMfa(true);
    try {
      await settingsApi.updateTenantConfiguration(configId, { mfa_double_confirmation: val });
      setMfaDoubleConfirmation(val);
      toast.success(`MFA Double Confirmation ${val ? "enabled" : "disabled"}.`);
    } catch (err: any) {
      toast.error("Failed to update MFA settings: " + err.message);
    } finally {
      setTogglingMfa(false);
    }
  };

  useEffect(() => {
    if (activeTab === "Security") {
      loadSessions();
      loadMfaConfig();
    } else if (activeTab === "Department Setup") {
      loadDepartments();
    } else if (activeTab === "Shift Setup") {
      loadShifts();
    } else if (activeTab === "Service Categories") {
      loadCategories();
    } else if (activeTab === "Coupons") {
      loadCoupons();
    } else if (activeTab === "Occupancy Types") {
      loadOccupancyTypes();
    } else if (activeTab === "Booking Sources") {
      loadBookingSources();
    } else if (activeTab === "Payment Gateways") {
      loadTenantGateways();
    }
  }, [activeTab]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPwd || !confirmNewPwd) {
      toast.error("Please fill in both password fields.");
      return;
    }
    if (newPwd !== confirmNewPwd) {
      toast.error("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword({
        old_password: currentPassword || "",
        new_password: newPwd,
      });
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPwd("");
      setConfirmNewPwd("");
    } catch (err: any) {
      toast.error("Failed to change password: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessId: string) => {
    try {
      await authApi.revokeSession(sessId);
      toast.success("Session revoked successfully.");
      loadSessions();
    } catch (err: any) {
      toast.error("Failed to revoke session: " + err.message);
    }
  };

  const confirmLogoutAllSessions = async () => {
    setLoggingOutAll(true);
    try {
      await authApi.logoutAllSessions();
      toast.success("Logged out of all sessions successfully.");
      setLogoutAllModalOpen(false);
      logout();
    } catch (err: any) {
      toast.error("Failed to logout all sessions: " + err.message);
    } finally {
      setLoggingOutAll(false);
    }
  };

  const featureRows: Array<{ key: FeatureKey; label: string; hint: string }> = [
    {
      key: "channelManager",
      label: "Channel Manager",
      hint: "OTA connectivity, mapping, sync, and distribution control.",
    },
    {
      key: "websiteBuilder",
      label: "Website Builder",
      hint: "Website pages, content authoring, and brand publishing.",
    },
    {
      key: "bookingEngine",
      label: "Booking Engine",
      hint: "Direct booking journey and offer management.",
    },
    {
      key: "revenueAi",
      label: "AI Revenue Features",
      hint: "AI demand forecasting and pricing decision support.",
    },
    {
      key: "masterData",
      label: "Master Data",
      hint: "Centralized master catalog and reference-data controls.",
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="System Setup"
        description="Account, security, and integrations."
      />
      <div className="responsive-page-x grid grid-cols-1 gap-5 py-4 sm:py-6 lg:grid-cols-[220px_1fr]">
        <Card>
          <ul className="p-2">
            {[
              "Account",
              "Security",
              "Department Setup",
              "Shift Setup",
              "Occupancy Types",
              "Booking Sources",
              "Coupons",
            ].map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => setActiveTab(s)}
                  className={`w-full rounded-md px-3 py-2 text-left text-[13px] transition ${
                    activeTab === s
                      ? "bg-primary-tint text-primary-pressed font-medium"
                      : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                  }`}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {activeTab === "Account" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Card */}
              <Card className="p-6">
                <div className="border-b border-border pb-4 mb-6">
                  <h3 className="text-[16px] font-bold text-text-primary">Profile Details</h3>
                  <p className="text-[12px] text-text-secondary">Update your personal profile information and profile photo.</p>
                </div>
                
                {/* Profile Photo Uploader */}
                <div className="flex items-center gap-5 mb-6 p-4 bg-surface-2/30 rounded-xl border border-border-subtle">
                  <div className="relative group">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile avatar"
                        className="h-16 w-16 rounded-full object-cover border-2 border-primary"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-primary/10 text-primary border-2 border-primary/20 flex items-center justify-center text-lg font-extrabold">
                        {profileName.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase()}
                      </div>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer">
                      <Camera className="h-5 w-5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-text-primary">Profile Picture</h4>
                    <p className="text-[11px] text-text-secondary mt-0.5">JPG, PNG, or WEBP. Max size of 2MB.</p>
                    <label className="mt-2 inline-block text-[12px] font-bold text-primary hover:underline cursor-pointer">
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setFormProfileName(e.target.value)}
                      className="w-full rounded-md border border-border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-text-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block flex items-center gap-1">
                      Email Address <Lock className="h-3 w-3 text-text-disabled" />
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        readOnly
                        value={user?.email || ""}
                        className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-[13px] text-text-secondary cursor-not-allowed outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-text-disabled mt-1 block">Email address can only be changed by the Superadmin.</span>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Phone Number</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setFormProfilePhone(e.target.value)}
                      className="w-full rounded-md border border-border px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-primary/20 bg-surface text-text-primary"
                      placeholder="+1 555-0192"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block flex items-center gap-1">
                      Designated Role <Lock className="h-3 w-3 text-text-disabled" />
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={user?.role?.toUpperCase().replace("_", " ") || "OWNER"}
                      className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-[13px] text-text-secondary font-medium cursor-not-allowed outline-none"
                    />
                  </div>
                  <div className="pt-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save Profile"}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Licensing & Subscription Card */}
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="border-b border-border pb-4 mb-4">
                    <h3 className="text-[16px] font-bold text-text-primary">Subscription & Licensing</h3>
                    <p className="text-[12px] text-text-secondary">Details of your active software lease contract.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-primary-tint/10 rounded-lg border border-primary/10">
                      <div>
                        <span className="text-[11px] uppercase text-text-secondary font-medium block">Subscription Plan</span>
                        <span className="text-[14px] font-extrabold text-primary block mt-0.5">
                          {user?.subscription_plan || "Standard Enterprise Plan"}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-surface-2/40 rounded-lg border border-border-subtle">
                        <span className="text-[11px] text-text-secondary block">Expiration Date</span>
                        <span className="text-[13px] font-semibold text-text-primary mt-1 block">
                          {user?.subscription_expiry || "2027-01-31"}
                        </span>
                      </div>
                      <div className="p-3 bg-surface-2/40 rounded-lg border border-border-subtle">
                        <span className="text-[11px] text-text-secondary block">Tenant Subdomain</span>
                        <span className="text-[13px] font-mono font-semibold text-text-primary mt-1 block">
                          {user?.tenant_subdomain || "localhost"}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-surface-2/40 rounded-lg border border-border-subtle">
                      <span className="text-[11px] text-text-secondary block">License Key</span>
                      <div className="flex items-center justify-between gap-2 mt-1.5">
                        <span className="font-mono text-[12px] text-text-primary bg-surface border border-border px-2.5 py-1 rounded select-all font-semibold">
                          {user?.license_key || "RETROD-LNX-8394-2026"}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyLicense}
                          className="p-1.5 rounded-md hover:bg-surface border border-border text-text-secondary hover:text-text-primary transition"
                          title="Copy License Key"
                        >
                          {copiedLicense ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Theme Card */}
                <Card className="p-6">
                  <div className="border-b border-border pb-4 mb-4">
                    <h3 className="text-[16px] font-bold text-text-primary">Theme Color & Layout</h3>
                    <p className="text-[12px] text-text-secondary">Customize the look and color accents of your workspace.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] uppercase text-text-secondary font-medium block">Active Theme</label>
                      <div className="relative">
                        <select
                          value={theme}
                          onChange={(e) => selectTheme(e.target.value as AppTheme)}
                          className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                        >
                          {(Object.keys(groupedThemes) as Array<keyof typeof APP_THEME_GROUP_LABELS>).map(
                            (groupKey) => (
                              <optgroup key={groupKey} label={APP_THEME_GROUP_LABELS[groupKey]}>
                                {groupedThemes[groupKey].map((themeOption) => (
                                  <option key={themeOption.value} value={themeOption.value}>
                                    {themeOption.label}
                                  </option>
                                ))}
                              </optgroup>
                            )
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2.5">
                      <span className="text-[12px] text-text-secondary mr-2">Color Accents:</span>
                      {selectedTheme.swatches.map((swatch, idx) => (
                        <span
                          key={`${selectedTheme.value}-${idx}`}
                          className="h-3.5 w-3.5 rounded-full border border-border-subtle"
                          style={{ backgroundColor: swatch }}
                          title={selectedTheme.label}
                        />
                      ))}
                    </div>
                  </div>
                </Card>

              </div>
            </div>
          </div>
        )}

        {activeTab === "Service Categories" && (
          <div className="space-y-5">
            <Card className="p-5">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                <div>
                  <h3 className="text-[16px] font-bold text-text-primary">Service Categories</h3>
                  <p className="text-[12px] text-text-secondary">
                    Manage categories in the service catalog. Modifying a category name updates it across all active catalog services.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setNewCreatedCategory("");
                    setCategoryCreateModalOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Category
                </Button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-[12.5px]">
                  <thead>
                    <tr className="border-b border-border bg-surface-2 text-text-secondary font-medium">
                      <th className="px-4 py-3">Category Name</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {loadingCategories ? (
                      <tr>
                        <td colSpan={2} className="px-4 py-8 text-center text-text-secondary">
                          Loading categories...
                        </td>
                      </tr>
                    ) : categoriesList.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-4 py-8 text-center text-text-secondary">
                          No categories defined yet.
                        </td>
                      </tr>
                    ) : (
                      categoriesList.map((cat) => (
                        <tr key={cat.id} className="hover:bg-surface-2/30">
                          <td className="px-4 py-3 font-semibold text-text-primary">{cat.name}</td>
                          <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingCategory(cat);
                                setNewCategoryName(cat.name);
                                setCategoryModalOpen(true);
                              }}
                              className="text-text-secondary hover:text-primary transition-colors cursor-pointer flex items-center gap-1 text-[12px] font-medium"
                            >
                              <Edit2 className="h-3.5 w-3.5" /> Rename
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "Department Setup" && (
          <div className="space-y-5">
            <Card className="p-5">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                <div>
                  <h3 className="text-[16px] font-bold text-text-primary">Department Setup</h3>
                  <p className="text-[12px] text-text-secondary">Configure departments for employee mapping.</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingDept(null);
                    setNewDeptName("");
                    setNewDeptCode("");
                    setNewDeptDesc("");
                    setDeptModalOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Department
                </Button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-[12.5px]">
                  <thead>
                    <tr className="border-b border-border bg-surface-2 text-text-secondary font-medium">
                      <th className="px-4 py-3">Department Name</th>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {departments.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-text-secondary">
                          No departments defined yet. Click "Add Department" to create one.
                        </td>
                      </tr>
                    ) : (
                      departments.map((dept) => (
                        <tr key={dept.id} className="hover:bg-surface-2/30">
                          <td className="px-4 py-3 font-medium text-text-primary">{dept.name}</td>
                          <td className="px-4 py-3 font-mono text-[12px] text-text-secondary uppercase">{dept.code}</td>
                          <td className="px-4 py-3 text-text-secondary">{dept.description || "—"}</td>
                          <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingDept(dept);
                                setNewDeptName(dept.name);
                                setNewDeptCode(dept.code);
                                setNewDeptDesc(dept.description || "");
                                setDeptModalOpen(true);
                              }}
                              className="text-text-secondary hover:text-primary transition-colors cursor-pointer"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDept(dept.id!)}
                              className="text-text-secondary hover:text-destructive transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "Shift Setup" && (
          <div className="space-y-5">
            <Card className="p-5">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                <div>
                  <h3 className="text-[16px] font-bold text-text-primary">Shift Setup</h3>
                  <p className="text-[12px] text-text-secondary">Manage operational shifts and timings.</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingShift(null);
                    setNewShiftName("");
                    setNewShiftCode("");
                    setNewShiftStartTime("09:00");
                    setNewShiftEndTime("17:00");
                    setNewShiftDesc("");
                    setShiftModalOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Shift
                </Button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-[12.5px]">
                  <thead>
                    <tr className="border-b border-border bg-surface-2 text-text-secondary font-medium">
                      <th className="px-4 py-3">Shift Name</th>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Timings</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {shifts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                          No shifts defined yet. Click "Add Shift" to create one.
                        </td>
                      </tr>
                    ) : (
                      shifts.map((shift) => (
                        <tr key={shift.id} className="hover:bg-surface-2/30">
                          <td className="px-4 py-3 font-medium text-text-primary">{shift.name}</td>
                          <td className="px-4 py-3 font-mono text-[12px] text-text-secondary uppercase">{shift.code}</td>
                          <td className="px-4 py-3 text-text-primary">{shift.start_time.substring(0, 5)} - {shift.end_time.substring(0, 5)}</td>
                          <td className="px-4 py-3 text-text-secondary">{shift.description || "—"}</td>
                          <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingShift(shift);
                                setNewShiftName(shift.name);
                                setNewShiftCode(shift.code);
                                setNewShiftStartTime(shift.start_time.substring(0, 5));
                                setNewShiftEndTime(shift.end_time.substring(0, 5));
                                setNewShiftDesc(shift.description || "");
                                setShiftModalOpen(true);
                              }}
                              className="text-text-secondary hover:text-primary transition-colors cursor-pointer"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteShift(shift.id!)}
                              className="text-text-secondary hover:text-destructive transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "Occupancy Types" && (
          <div className="space-y-5">
            <Card className="p-5">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                <div>
                  <h3 className="text-[16px] font-bold text-text-primary">Occupancy Types</h3>
                  <p className="text-[12px] text-text-secondary">Manage room occupancy configurations and pricing multipliers.</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingOccupancy(null);
                    setNewOccupancyName("");
                    setNewOccupancyCode("");
                    setNewOccupancyMaxGuests("2");
                    setNewOccupancyMultiplier("1.0");
                    setOccupancyModalOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Occupancy Type
                </Button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-[12.5px]">
                  <thead>
                    <tr className="border-b border-border bg-surface-2 text-text-secondary font-medium">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Max Guests</th>
                      <th className="px-4 py-3">Rate Multiplier</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {occupancyTypes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                          No occupancy types defined yet. Click "Add Occupancy Type" to create one.
                        </td>
                      </tr>
                    ) : (
                      occupancyTypes.map((occ) => (
                        <tr key={occ.id} className="hover:bg-surface-2/30">
                          <td className="px-4 py-3 font-medium text-text-primary">{occ.name}</td>
                          <td className="px-4 py-3 font-mono text-[12px] text-text-secondary uppercase">{occ.code}</td>
                          <td className="px-4 py-3 text-text-primary">{occ.max_guests}</td>
                          <td className="px-4 py-3 text-text-primary">x{occ.multiplier}</td>
                          <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingOccupancy(occ);
                                setNewOccupancyName(occ.name);
                                setNewOccupancyCode(occ.code);
                                setNewOccupancyMaxGuests(String(occ.max_guests));
                                setNewOccupancyMultiplier(String(occ.multiplier));
                                setOccupancyModalOpen(true);
                              }}
                              className="text-text-secondary hover:text-primary transition-colors cursor-pointer"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOccupancy(occ.id!)}
                              className="text-text-secondary hover:text-destructive transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "Booking Sources" && (
          <div className="space-y-5">
            <Card className="p-5">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                <div>
                  <h3 className="text-[16px] font-bold text-text-primary">Booking Sources</h3>
                  <p className="text-[12px] text-text-secondary">Manage reservation channels and sources (Direct, OTA, Agents, etc.).</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingBookingSource(null);
                    setNewSourceName("");
                    setNewSourceIcon("Globe");
                    setNewSourceDetails("");
                    setBookingSourceModalOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Booking Source
                </Button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-[12.5px]">
                  <thead>
                    <tr className="border-b border-border bg-surface-2 text-text-secondary font-medium">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Icon</th>
                      <th className="px-4 py-3">Details</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-surface">
                    {bookingSources.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-text-secondary">
                          No booking sources defined yet. Click "Add Booking Source" to create one.
                        </td>
                      </tr>
                    ) : (
                      bookingSources.map((src) => (
                        <tr key={src.id} className="hover:bg-surface-2/30">
                          <td className="px-4 py-3 font-medium text-text-primary">{src.name}</td>
                          <td className="px-4 py-3 text-text-secondary">
                            {src.icon && (src.icon.startsWith("data:") || src.icon.startsWith("http")) ? (
                              <img
                                src={src.icon}
                                alt={src.name}
                                className="h-8 w-8 rounded object-cover border border-border bg-surface-2"
                              />
                            ) : (
                              <span className="font-mono text-[12px]">{src.icon || "Globe"}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-text-primary">{src.details || "-"}</td>
                          <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingBookingSource(src);
                                setNewSourceName(src.name);
                                setNewSourceIcon(src.icon || "");
                                setNewSourceDetails(src.details || "");
                                setBookingSourceModalOpen(true);
                              }}
                              className="text-text-secondary hover:text-primary transition-colors cursor-pointer"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBookingSource(src.id!)}
                              className="text-text-secondary hover:text-destructive transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "Integrations" && (
          <div className="space-y-5">
            <Card>
              <CardHeader title="Integrations" hint="Connect Retrod to your operational stack" />
              <ul className="divide-y divide-border-subtle">
                {integrations.map((it) => (
                  <li key={it.name} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5 sm:py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-2 font-display text-[14px] font-semibold text-text-primary">
                        {it.name[0]}
                      </div>
                      <div>
                        <div className="text-[14px] font-medium text-text-primary">{it.name}</div>
                        <div className="text-[12px] text-text-secondary">{it.desc}</div>
                      </div>
                    </div>
                    <Button 
                      variant={it.status === "Connected" ? "outline" : "primary"} 
                      size="sm"
                      onClick={() => {
                        if (it.name === "Payment Gateways") setIsPaymentModalOpen(true);
                        if (it.name === "Channel Managers") setIsChannelManagerModalOpen(true);
                      }}
                    >
                      {it.status === "Connected" ? "Manage" : (
                        it.name === "Payment Gateways" ? "Set Payment Gateway" : 
                        it.name === "Channel Managers" ? "Set Channel Manager" : 
                        "Connect"
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeader
                title="Tenant Feature Entitlements"
                hint="Control module visibility by tenant plan and property override."
              />
              <div className="space-y-4 p-4 sm:p-5">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[220px_1fr]">
                  <label className="text-[12px] font-medium text-text-secondary">Tenant Plan</label>
                  <select
                    className="h-9 rounded-md border border-border bg-surface px-3 text-[13px]"
                    value={entitlements.plan}
                    onChange={(event) =>
                      setEntitlementPlan(event.target.value as "starter" | "growth" | "enterprise")
                    }
                  >
                    <option value="starter">Starter</option>
                    <option value="growth">Growth</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div className="rounded-md border border-border-subtle bg-surface-2/20 p-3">
                  <div className="mb-2 text-[12px] font-semibold text-text-primary">Tenant-level features</div>
                  <div className="space-y-2">
                    {featureRows.map((row) => (
                      <label
                        key={`tenant-${row.key}`}
                        className="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface px-3 py-2"
                      >
                        <span>
                          <span className="block text-[13px] font-medium text-text-primary">{row.label}</span>
                          <span className="block text-[11px] text-text-secondary">{row.hint}</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={entitlements.features[row.key]}
                          onChange={(event) => setTenantFeature(row.key, event.target.checked)}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border border-border-subtle bg-surface-2/20 p-3">
                  <div className="mb-2 text-[12px] font-semibold text-text-primary">
                    Property override: {activeProperty}
                  </div>
                  <div className="space-y-2">
                    {featureRows.map((row) => (
                      <label
                        key={`property-${row.key}`}
                        className="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface px-3 py-2"
                      >
                        <span className="text-[13px] text-text-primary">{row.label}</span>
                        <input
                          type="checkbox"
                          checked={effectiveFeatures[row.key]}
                          onChange={(event) =>
                            setPropertyFeatures(activeProperty, { [row.key]: event.target.checked })
                          }
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "Security" && (
          <div className="space-y-5">
            <Card>
              <CardHeader title="Change Password" hint="Ensure a strong password to protect your administrator privileges." />
              <form onSubmit={handleChangePassword} className="space-y-4 p-4 sm:p-5 max-w-md">
                <div className="flex flex-col gap-3">
                  <input
                    type="password"
                    required
                    placeholder="New Password"
                    className="h-9 rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                  />
                  <input
                    type="password"
                    required
                    placeholder="Confirm New Password"
                    className="h-9 rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                    value={confirmNewPwd}
                    onChange={(e) => setConfirmNewPwd(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </Card>

            <Card>
              <CardHeader title="Multi-Factor Authentication (MFA)" hint="Configure additional validation rules for logins." />
              <div className="p-4 sm:p-5">
                <label className="flex items-center justify-between gap-3 max-w-md rounded-lg border border-border bg-surface px-4 py-3 hover:border-primary/30 transition cursor-pointer">
                  <div>
                    <span className="text-[13px] font-semibold text-text-primary block">MFA Double-Confirmation Email</span>
                    <span className="text-[11px] text-text-secondary block mt-0.5">Require identity confirmation link check via inbox email after successful OTP code verification.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={mfaDoubleConfirmation}
                    onChange={handleToggleMFA}
                    disabled={togglingMfa || !configId}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </label>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between border-b border-border p-4 sm:px-5">
                <div>
                  <h3 className="text-[14px] font-bold text-text-primary">Active Sessions</h3>
                  <p className="text-[12px] text-text-secondary">Track or terminate logins on other browsers and devices.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLogoutAllModalOpen(true)}
                  className="border-error hover:bg-error-tint hover:text-error text-error text-[12.5px]"
                >
                  Logout All Sessions
                </Button>
              </div>
              {sessionsLoading ? (
                <div className="p-6 text-center text-[12.5px] text-text-secondary">Loading active sessions...</div>
              ) : sessionList.length === 0 ? (
                <div className="p-6 text-center text-[12.5px] text-text-secondary">No active sessions tracked.</div>
              ) : (
                <ul className="divide-y divide-border-subtle">
                  {sessionList.map((sess: any) => (
                    <li key={sess.id} className="flex items-center justify-between p-4 sm:px-5 hover:bg-sidebar-hover/10 transition-colors">
                      <div>
                        <div className="text-[13.5px] font-semibold text-text-primary">
                          {sess.device.split(" ").slice(0, 3).join(" ") || "Unknown Browser"}
                        </div>
                        <div className="text-[11.5px] text-text-secondary mt-0.5">
                          IP Address: <span className="font-mono">{sess.ip}</span> · Started: {new Date(sess.started_at).toLocaleString()}
                        </div>
                      </div>
                      {sess.is_active ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-error text-error hover:bg-error-tint"
                          onClick={() => handleRevokeSession(sess.id)}
                        >
                          Revoke
                        </Button>
                      ) : (
                        <span className="text-[11px] bg-neutral-light px-2.5 py-0.5 rounded text-text-muted">Revoked</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        )}

        {activeTab === "Coupons" && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between border-b border-border p-4 sm:px-5">
                <div>
                  <h3 className="text-[14px] font-bold text-text-primary">Coupons</h3>
                  <p className="text-[12px] text-text-secondary">Manage flat & percentage coupons for reservations.</p>
                </div>
                <Button size="sm" onClick={() => {
                  setEditingCoupon(null);
                  setNewCouponCode("");
                  setNewCouponType("PERCENTAGE");
                  setNewCouponValue("");
                  setNewCouponValidFrom("");
                  setNewCouponValidUntil("");
                  setNewCouponMaxUses("");
                  setCouponModalOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" /> Add Coupon
                </Button>
              </div>
              <ul className="divide-y divide-border-subtle">
                {coupons.map((c) => (
                  <li key={c.id} className="flex items-center justify-between p-4 sm:px-5 hover:bg-surface-2 transition">
                    <div>
                      <div className="font-semibold text-text-primary text-[13.5px]">{c.code}</div>
                      <div className="text-[12px] text-text-secondary">
                        {c.discount_value} {c.discount_type === "PERCENTAGE" ? "% off" : "flat off"}
                        {c.max_uses ? ` • Max ${c.max_uses} uses` : ""} 
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setEditingCoupon(c);
                        setNewCouponCode(c.code);
                        setNewCouponType(c.discount_type);
                        setNewCouponValue(c.discount_value);
                        setNewCouponValidFrom(c.valid_from || "");
                        setNewCouponValidUntil(c.valid_until || "");
                        setNewCouponMaxUses(c.max_uses ? c.max_uses.toString() : "");
                        setCouponModalOpen(true);
                      }}>
                        <Edit2 className="h-4 w-4 text-text-secondary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCoupon(c.id!)}>
                        <Trash2 className="h-4 w-4 text-error" />
                      </Button>
                    </div>
                  </li>
                ))}
                {coupons.length === 0 && (
                  <li className="p-6 text-center text-[13px] text-text-secondary">No coupons defined.</li>
                )}
              </ul>
            </Card>
          </div>
        )}

        {activeTab === "Payment Gateways" && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between border-b border-border p-4 sm:px-5">
                <div>
                  <h3 className="text-[14px] font-bold text-text-primary">Payment Gateways</h3>
                  <p className="text-[12px] text-text-secondary">Enable or disable payment processors and configure API credentials for your property.</p>
                </div>
              </div>

              {loadingGateways ? (
                <div className="p-8 text-center text-xs text-text-secondary">Loading payment gateways...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-5">
                  {globalPaymentGateways.map((gw) => {
                    const currentConfig = tenantPaymentGateways.find((t) => t.gateway === gw.id || t.gateway_details?.id === gw.id);
                    const isEnabled = currentConfig ? currentConfig.is_enabled : gw.is_active;

                    return (
                      <div
                        key={gw.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isEnabled
                            ? "border-primary/40 bg-surface shadow-sm"
                            : "border-border bg-surface-2/40 opacity-75"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-surface border border-border">
                              {gw.logo_url ? (
                                <img src={gw.logo_url} alt={gw.name} className="h-5 w-auto object-contain" />
                              ) : (
                                <span className="font-bold text-xs text-primary">{gw.name}</span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-text-primary">{gw.name}</div>
                              <div className="text-[11px] text-text-secondary">{gw.subtitle || "Online PG"}</div>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            isEnabled ? "bg-success/15 text-success border-success/30" : "bg-neutral-light text-text-secondary border-border"
                          }`}>
                            {isEnabled ? "ACTIVE" : "DISABLED"}
                          </span>
                        </div>

                        <div className="pt-3 border-t border-border flex items-center justify-between">
                          <span className="text-xs text-text-secondary font-medium">Accept Payments</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={() => handleToggleTenantGateway(gw, currentConfig)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-border-subtle peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

        {(activeTab !== "Integrations" && activeTab !== "Security" && activeTab !== "Account" && activeTab !== "Department Setup" && activeTab !== "Shift Setup" && activeTab !== "Occupancy Types" && activeTab !== "Booking Sources" && activeTab !== "Service Categories" && activeTab !== "Coupons" && activeTab !== "Payment Gateways") && (
          <Card className="p-6 text-center text-text-secondary text-[13.5px]">
            The {activeTab} panel configuration is managed globally by the system host.
          </Card>
        )}
      </div>
      <PaymentGatewayModal open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen} />
      <ChannelManagerModal open={isChannelManagerModalOpen} onOpenChange={setIsChannelManagerModalOpen} />

      {/* Create Category Modal */}
      <Sheet open={categoryCreateModalOpen} onOpenChange={setCategoryCreateModalOpen}>
        <SheetContent side="right" className="w-[400px] sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle>Add New Category</SheetTitle>
          </SheetHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const catName = newCreatedCategory.trim();
              if (!catName) return;
              if (categoriesList.some(c => c.name.toLowerCase() === catName.toLowerCase())) {
                toast.error("This category already exists.");
                return;
              }
              setSavingCategory(true);
              try {
                await createServiceCategory({ name: catName });
                toast.success(`Successfully added category '${catName}'`);
                setCategoryCreateModalOpen(false);
                loadCategories();
              } catch (err: any) {
                toast.error("Failed to create category: " + (err.message || err));
              } finally {
                setSavingCategory(false);
              }
            }}
            className="grid gap-5 py-6"
          >
            <div className="grid gap-2">
              <Label htmlFor="newCategoryNameInput">Category Name</Label>
              <Input
                id="newCategoryNameInput"
                value={newCreatedCategory}
                onChange={(e) => setNewCreatedCategory(e.target.value)}
                required
                placeholder="e.g. Wellness, Meals, Tours"
              />
            </div>
            <SheetFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setCategoryCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingCategory}>
                {savingCategory ? "Creating..." : "Create Category"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Rename Category Modal */}
      <Sheet open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <SheetContent side="right" className="w-[400px] sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle>Rename Service Category</SheetTitle>
          </SheetHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editingCategory || !newCategoryName.trim()) return;
              setSavingCategory(true);
              try {
                await updateServiceCategory({ ...editingCategory, name: newCategoryName.trim() });
                toast.success(`Successfully renamed category to '${newCategoryName}'`);
                setCategoryModalOpen(false);
                loadCategories();
              } catch (err: any) {
                toast.error("Failed to rename category: " + (err.message || err));
              } finally {
                setSavingCategory(false);
              }
            }}
            className="grid gap-5 py-6"
          >
            <div className="grid gap-2">
              <Label htmlFor="categoryOld">Current Name</Label>
              <Input id="categoryOld" value={editingCategory?.name || ""} disabled className="bg-surface-2" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="categoryNew">New Name</Label>
              <Input
                id="categoryNew"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
                placeholder="e.g. Wellness, Spa, Meals"
              />
            </div>
            <SheetFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setCategoryModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingCategory}>
                {savingCategory ? "Saving..." : "Save Changes"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Department Modal */}
      {deptModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface rounded-xl border border-border shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[16px] font-bold text-text-primary">{editingDept ? "Edit Department" : "Add Department"}</h2>
              <button onClick={() => setDeptModalOpen(false)} className="p-1 rounded-md text-text-secondary hover:bg-surface-2 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveDept} className="space-y-4">
              <div>
                <label className="text-[12px] font-medium text-text-secondary block mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:outline-none"
                  placeholder="e.g. Front Office"
                  value={newDeptName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewDeptName(val);
                    setNewDeptCode(generateSlugCode(val));
                  }}
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-text-secondary block mb-1">Description</label>
                <textarea
                  className="w-full rounded-md border border-border bg-surface p-2 text-[13px] text-text-primary focus:outline-none h-20 resize-none"
                  placeholder="Responsibilities..."
                  value={newDeptDesc}
                  onChange={(e) => setNewDeptDesc(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDeptModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shift Modal */}
      {shiftModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface rounded-xl border border-border shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[16px] font-bold text-text-primary">{editingShift ? "Edit Shift" : "Add Shift"}</h2>
              <button onClick={() => setShiftModalOpen(false)} className="p-1 rounded-md text-text-secondary hover:bg-surface-2 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveShift} className="space-y-4">
              <div>
                <label className="text-[12px] font-medium text-text-secondary block mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:outline-none"
                  placeholder="e.g. Morning Shift"
                  value={newShiftName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewShiftName(val);
                    setNewShiftCode(generateSlugCode(val));
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-medium text-text-secondary block mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:outline-none"
                    value={newShiftStartTime}
                    onChange={(e) => setNewShiftStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-text-secondary block mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:outline-none"
                    value={newShiftEndTime}
                    onChange={(e) => setNewShiftEndTime(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-[12px] font-medium text-text-secondary block mb-1">Description</label>
                <textarea
                  className="w-full rounded-md border border-border bg-surface p-2 text-[13px] text-text-primary focus:outline-none h-20 resize-none"
                  placeholder="Shift notes..."
                  value={newShiftDesc}
                  onChange={(e) => setNewShiftDesc(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShiftModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      <Sheet open={couponModalOpen} onOpenChange={setCouponModalOpen}>
        <SheetContent side="right" className="w-[400px] sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle>{editingCoupon ? "Edit Coupon" : "Add Coupon"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSaveCoupon} className="mt-6 flex flex-col h-[calc(100vh-120px)]">
            <div className="flex-1 space-y-4">
              <div>
                <Label>Coupon Code</Label>
                <Input
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER50"
                  required
                />
              </div>
              <div>
                <Label>Discount Type</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={newCouponType}
                  onChange={(e) => setNewCouponType(e.target.value as "FLAT" | "PERCENTAGE")}
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FLAT">Flat Amount</option>
                </select>
              </div>
              <div>
                <Label>Discount Value</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newCouponValue}
                  onChange={(e) => setNewCouponValue(e.target.value)}
                  placeholder={newCouponType === "PERCENTAGE" ? "e.g. 15" : "e.g. 500"}
                  required
                />
              </div>
              <div>
                <Label>Valid From (Optional)</Label>
                <Input
                  type="date"
                  value={newCouponValidFrom}
                  onChange={(e) => setNewCouponValidFrom(e.target.value)}
                />
              </div>
              <div>
                <Label>Valid Until (Optional)</Label>
                <Input
                  type="date"
                  value={newCouponValidUntil}
                  onChange={(e) => setNewCouponValidUntil(e.target.value)}
                />
              </div>
              <div>
                <Label>Max Uses (Optional)</Label>
                <Input
                  type="number"
                  value={newCouponMaxUses}
                  onChange={(e) => setNewCouponMaxUses(e.target.value)}
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>
            <SheetFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setCouponModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Coupon</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Occupancy Type Modal */}
      <Sheet open={occupancyModalOpen} onOpenChange={setOccupancyModalOpen}>
        <SheetContent side="right" className="w-[400px] sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle>{editingOccupancy ? "Edit Occupancy Type" : "Add Occupancy Type"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSaveOccupancy} className="mt-6 flex flex-col h-[calc(100vh-120px)]">
            <div className="flex-1 space-y-4">
              <div>
                <Label>Occupancy Name</Label>
                <Input
                  value={newOccupancyName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewOccupancyName(val);
                    setNewOccupancyCode(generateSlugCode(val));
                  }}
                  placeholder="e.g. Double Occupancy"
                  required
                />
              </div>
              <div>
                <Label>Max Guests</Label>
                <Input
                  type="number"
                  value={newOccupancyMaxGuests}
                  onChange={(e) => setNewOccupancyMaxGuests(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Rate Multiplier</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newOccupancyMultiplier}
                  onChange={(e) => setNewOccupancyMultiplier(e.target.value)}
                  placeholder="e.g. 1.00 for no change"
                  required
                />
              </div>
            </div>
            <SheetFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setOccupancyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Occupancy</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Booking Source Modal */}
      <Sheet open={bookingSourceModalOpen} onOpenChange={setBookingSourceModalOpen}>
        <SheetContent side="right" className="w-[400px] sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle>{editingBookingSource ? "Edit Booking Source" : "Add Booking Source"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSaveBookingSource} className="mt-6 flex flex-col h-[calc(100vh-120px)]">
            <div className="flex-1 space-y-4">
              <div>
                <Label>Source Name</Label>
                <Input
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder="e.g. Booking.com"
                  required
                />
              </div>
              <div>
                <Label>Upload Icon / Image</Label>
                <div className="mt-1.5 flex items-center gap-4">
                  {newSourceIcon ? (
                    <img
                      src={newSourceIcon}
                      alt="Source icon preview"
                      className="h-12 w-12 rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-surface-2 flex items-center justify-center text-text-secondary border border-border text-[11px] font-medium">
                      No Icon
                    </div>
                  )}
                  <label className="cursor-pointer bg-surface-2 hover:bg-surface-3 border border-border rounded-md px-3 py-1.5 text-[12px] font-semibold text-text-primary transition">
                    Upload File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 1 * 1024 * 1024) {
                            toast.error("Icon image must be less than 1MB.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewSourceIcon(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {newSourceIcon && (
                    <button
                      type="button"
                      onClick={() => setNewSourceIcon("")}
                      className="text-[12px] text-destructive hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <div>
                <Label>Details</Label>
                <Input
                  value={newSourceDetails}
                  onChange={(e) => setNewSourceDetails(e.target.value)}
                  placeholder="e.g. OTA Channel connection"
                />
              </div>
            </div>
            <SheetFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setBookingSourceModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Booking Source</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      {/* Logout All Sessions Confirmation Modal */}
      {logoutAllModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-surface rounded-xl border border-border shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                <Lock className="h-5 w-5 text-error" /> Logout All Sessions
              </h2>
              <button onClick={() => setLogoutAllModalOpen(false)} className="p-1 rounded-md text-text-secondary hover:bg-surface-2 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-[13px] text-text-secondary mb-6">
              Are you sure you want to log out of all active sessions across all devices? This will terminate your current session as well and log you out.
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setLogoutAllModalOpen(false)} disabled={loggingOutAll}>
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-error hover:bg-error/90 text-white"
                onClick={confirmLogoutAllSessions}
                disabled={loggingOutAll}
              >
                {loggingOutAll ? "Logging out..." : "Logout All Sessions"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default SettingsFeature;
