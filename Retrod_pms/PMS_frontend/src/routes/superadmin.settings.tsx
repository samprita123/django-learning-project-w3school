import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { fetchApi } from "@/services/api/core";
import {
  Globe,
  DollarSign,
  Trash2,
  Plus,
  Check,
  X,
  FileText,
  Building,
  RefreshCw,
  Percent,
  Edit2,
  MapPin,
  Users,
  Clock,
  Briefcase,
  CreditCard,
  Layers
} from "lucide-react";
import { PageHeader, Card, Button } from "@/components/ui/Primitives";
import {
  settingsApi,
  type SystemLanguageData,
  type SystemCurrencyData,
  type SystemDateFormatData,
  type SystemTimeFormatData,
  type CountryData,
  type StateData,
  type DepartmentData,
  type ShiftData
} from "@/services/api/settings";
import { amenitiesApi, type Amenity } from "@/services/api/amenities";
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

export const Route = createFileRoute("/superadmin/settings")({
  validateSearch: (search: Record<string, unknown>) => {
    return {};
  },
  head: () => ({ meta: [{ title: "System Setup — Superadmin" }] }),
  component: SuperadminSettingsComponent,
});

const inputCls =
  "h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";
const selectCls =
  "h-9 w-full rounded-md border border-border bg-surface px-2 text-[13px] text-text-primary focus:border-primary focus:outline-none";
const labelCls = "mb-1 block text-[12px] font-medium text-text-secondary";

interface SearchableSelectProps {
  options: { id: string; name: string; code?: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function SearchableSelect({ options, value, onChange, placeholder = "Select...", className = "" }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedOption = options.find(opt => opt.id === value);

  const filteredOptions = useMemo(() => {
    return options.filter(opt =>
      opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opt.code && opt.code.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [options, searchQuery]);

  useEffect(() => {
    if (!isOpen) setSearchQuery("");
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 w-full flex items-center justify-between rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 text-left font-medium"
      >
        <span className={selectedOption ? "text-text-primary" : "text-text-muted"}>
          {selectedOption ? `${selectedOption.name}${selectedOption.code ? ` (${selectedOption.code})` : ""}` : placeholder}
        </span>
        <span className="text-[10px] text-text-secondary">▼</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 mt-1.5 z-50 rounded-md border border-border bg-surface shadow-lg max-h-60 flex flex-col overflow-hidden">
            <div className="p-2 border-b border-border bg-surface-2">
              <input
                type="text"
                className="h-8 w-full rounded border border-border bg-surface px-2.5 text-[12px] text-text-primary focus:border-primary focus:outline-none"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-border/30">
              {filteredOptions.length === 0 ? (
                <div className="p-3 text-[12px] text-center text-text-muted">No results found</div>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChange(opt.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-[12.5px] hover:bg-surface-2 transition ${
                      opt.id === value ? "bg-primary/5 text-primary font-semibold" : "text-text-primary"
                    }`}
                  >
                    {opt.name} {opt.code && <span className="text-[11px] text-text-secondary font-mono">({opt.code})</span>}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useAuth } from "@/features/auth/hooks/useAuth";
import AccessDenied from "@/components/AccessDenied";

function SuperadminSettingsComponent() {
  const { user } = useAuth();

  if (user?.role !== "super_admin") {
    return (
      <AccessDenied
        title="Platform Settings Restricted"
        description="You do not have administrative privileges to access the Retrod superadmin controller."
      />
    );
  }

  const [activeTab, setActiveTab] = useState<"taxes" | "documents" | "payment_gateways" | "amenities" | "room_categories" | "languages" | "currency" | "regions" | "meal_plans" | "booking_sources">("taxes");

  // Settings states
  const [currencies, setCurrencies] = useState<SystemCurrencyData[]>([]);
  const [dateFormats, setDateFormats] = useState<SystemDateFormatData[]>([]);
  const [timeFormats, setTimeFormats] = useState<SystemTimeFormatData[]>([]);
  const [activeCurrency, setActiveCurrency] = useState<SystemCurrencyData | null>(null);
  const [activeDateFormat, setActiveDateFormat] = useState<SystemDateFormatData | null>(null);
  const [activeTimeFormat, setActiveTimeFormat] = useState<SystemTimeFormatData | null>(null);
  const [languages, setLanguages] = useState<SystemLanguageData[]>([]);
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [states, setStates] = useState<StateData[]>([]);
  const [selectedFilterCountry, setSelectedFilterCountry] = useState<string>("");
  const [loadingStates, setLoadingStates] = useState(false);
  const [statePage, setStatePage] = useState(1);
  const [countrySearch, setCountrySearch] = useState("");
  const [countryPage, setCountryPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedFilterCountry) {
      setLoadingStates(true);
      settingsApi.getStates(selectedFilterCountry)
        .then(data => {
          setStates(data);
          setStatePage(1);
        })
        .catch(err => toast.error("Failed to load states: " + err.message))
        .finally(() => setLoadingStates(false));
    }
  }, [selectedFilterCountry]);

  // Languages modal
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [newLangName, setNewLangName] = useState("");
  const [newLangCode, setNewLangCode] = useState("");
  const [newLangActive, setNewLangActive] = useState(true);
  const [newLangDefault, setNewLangDefault] = useState(false);

  // Country modals & form state
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<CountryData | null>(null);
  const [newCountryName, setNewCountryName] = useState("");
  const [newCountryCode, setNewCountryCode] = useState("");
  const [newCountryPhoneCode, setNewCountryPhoneCode] = useState("");
  const [newCountryActive, setNewCountryActive] = useState(true);

  // State modals & form state
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [editingState, setEditingState] = useState<StateData | null>(null);
  const [newStateName, setNewStateName] = useState("");
  const [newStateCode, setNewStateCode] = useState("");
  const [newStateCountry, setNewStateCountry] = useState("");
  const [newStateActive, setNewStateActive] = useState(true);

  // Setups interfaces & states
  interface TaxSetup {
    id: string;
    name: string;
    rate: number;
    type: "percentage" | "fixed";
    status: "active" | "inactive";
  }

  interface DocumentSetup {
    id: string;
    name: string;
    required_checkin: boolean;
    expiry_required: boolean;
  }


  interface MealPlanSetup {
    id?: string;
    code: string;
    name: string;
    price_adjustment: number;
    tax_percent: number;
    is_active: boolean;
  }

  interface RoomCategorySetup {
    id: string;
    code: string;
    name: string;
    is_system?: boolean;
    is_active?: boolean;
  }

  const [taxes, setTaxes] = useState<TaxSetup[]>([]);
  const [documents, setDocuments] = useState<DocumentSetup[]>([]);
  const [mealPlansList, setMealPlansList] = useState<MealPlanSetup[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [roomCategories, setRoomCategories] = useState<RoomCategorySetup[]>([]);
  const [catModalOpen, setCatModalOpen] = useState(false);

  // Editing state variables
  const [editingTax, setEditingTax] = useState<TaxSetup | null>(null);
  const [editingDoc, setEditingDoc] = useState<DocumentSetup | null>(null);
  const [editingLanguage, setEditingLanguage] = useState<SystemLanguageData | null>(null);
  const [editingMealPlan, setEditingMealPlan] = useState<MealPlanSetup | null>(null);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [editingCat, setEditingCat] = useState<RoomCategorySetup | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatCode, setNewCatCode] = useState("");

  // Delete target confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "tax" | "document" | "language" | "country" | "state" | "mealplan" | "amenity" | "bookingsource";
    id: string;
    name: string;
    langObj?: SystemLanguageData;
  } | null>(null);

  // Modals visibility state
  const [taxModalOpen, setTaxModalOpen] = useState(false);
  const [newTaxName, setNewTaxName] = useState("");
  const [newTaxRate, setNewTaxRate] = useState<number>(0);
  const [newTaxType, setNewTaxType] = useState<"percentage" | "fixed">("percentage");
  const [newTaxStatus, setNewTaxStatus] = useState<"active" | "inactive">("active");

  const [docModalOpen, setDocModalOpen] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocRequired, setNewDocRequired] = useState(false);
  const [newDocExpiry, setNewDocExpiry] = useState(false);

  const [amenityModalOpen, setAmenityModalOpen] = useState(false);
  const [newAmenityName, setNewAmenityName] = useState("");
  const [newAmenityCode, setNewAmenityCode] = useState("");
  const [newAmenityCategory, setNewAmenityCategory] = useState("General");
  const [newAmenityChargeable, setNewAmenityChargeable] = useState(false);
  const [newAmenityPrice, setNewAmenityPrice] = useState("0");
  const [newAmenityDescription, setNewAmenityDescription] = useState("");
  const [newAmenityIcon, setNewAmenityIcon] = useState("wifi");

  const [mealPlanModalOpen, setMealPlanModalOpen] = useState(false);
  const [newMealPlanName, setNewMealPlanName] = useState("");
  const [newMealPlanCode, setNewMealPlanCode] = useState("");
  const [newMealPlanAdjustment, setNewMealPlanAdjustment] = useState<number>(0);
  const [newMealPlanTax, setNewMealPlanTax] = useState<number>(0);
const [newMealPlanActive, setNewMealPlanActive] = useState(true);

  // Booking Source states
  const [bookingSourcesList, setBookingSourcesList] = useState<any[]>([]);
  const [bookingSourceModalOpen, setBookingSourceModalOpen] = useState(false);
  const [editingBookingSource, setEditingBookingSource] = useState<any | null>(null);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceIcon, setNewSourceIcon] = useState("");
  const [newSourceDetails, setNewSourceDetails] = useState("");
  const [newSourceActive, setNewSourceActive] = useState(true);

  // Payment Gateways states (Superadmin)
  const [paymentGatewaysList, setPaymentGatewaysList] = useState<any[]>([]);
  const [paymentGatewayModalOpen, setPaymentGatewayModalOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<any | null>(null);
  const [gwName, setGwName] = useState("");
  const [gwCode, setGwCode] = useState("");
  const [gwSubtitle, setGwSubtitle] = useState("");
  const [gwBadge, setGwBadge] = useState("SECURE");
  const [gwLogoUrl, setGwLogoUrl] = useState("");
  const [gwActive, setGwActive] = useState(true);

  const loadPaymentGateways = async () => {
    try {
      const data = await settingsApi.getPaymentGateways();
      setPaymentGatewaysList(data);
    } catch (err: any) {
      console.warn("Failed to load payment gateways:", err);
    }
  };

  // Create Currency Modal States & Country Mapping
  const [isAddCurrencyModalOpen, setIsAddCurrencyModalOpen] = useState(false);
  const [newCurrencyCountry, setNewCurrencyCountry] = useState("");
  const [newCurrencyCode, setNewCurrencyCode] = useState("");
  const [newCurrencyName, setNewCurrencyName] = useState("");
  const [newCurrencySymbol, setNewCurrencySymbol] = useState("");
  const [newCurrencyIsActive, setNewCurrencyIsActive] = useState(true);
  const [creatingCurrency, setCreatingCurrency] = useState(false);



  const handleCreateCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCurrencyCode.trim() || !newCurrencyName.trim()) {
      toast.error("Please provide currency code and name.");
      return;
    }
    setCreatingCurrency(true);
    try {
      const created = await settingsApi.createCurrency({
        code: newCurrencyCode.trim().toUpperCase(),
        name: newCurrencyName.trim(),
        symbol: newCurrencySymbol.trim() || "$",
        country: newCurrencyCountry || undefined,
        is_active: newCurrencyIsActive,
        is_default: false,
        symbol_position: "after",
        decimal_places: 2,
        decimal_separator: "dot",
        thousands_separator: "comma",
        add_space: true,
        show_decimals: true
      });
      setCurrencies((prev) => [...prev, created]);
      setActiveCurrency(created);
      toast.success(`Currency '${created.code} - ${created.name}' created successfully!`);
      setIsAddCurrencyModalOpen(false);
      setNewCurrencyCountry("");
      setNewCurrencyCode("");
      setNewCurrencyName("");
      setNewCurrencySymbol("");
    } catch (err: any) {
      toast.error("Failed to create currency: " + (err.message || "Error occurred"));
    } finally {
      setCreatingCurrency(false);
    }
  };

  // Load backend configurations
  const loadData = async () => {
    setLoading(true);
    try {
      const [langData, taxData, docData, curData, dfData, tfData, countryData, amenityData] = await Promise.all([
        settingsApi.getLanguages(),
        settingsApi.getTaxes(),
        settingsApi.getDocuments(),
        settingsApi.getCurrencies(),
        settingsApi.getDateFormats(),
        settingsApi.getTimeFormats(),
        settingsApi.getCountries(),
        amenitiesApi.getAmenities()
      ]);

      setCurrencies(curData);
      setDateFormats(dfData);
      setTimeFormats(tfData);
      setCountries(countryData);
      setAmenities(amenityData);

      // Fetch meal plans
      const mealPlansData = await fetchApi<any[]>("/api/rates/meal-plans/");
      setMealPlansList(mealPlansData || []);

      // Fetch booking sources
      const sourcesData = await fetchApi<any[]>("/api/superadmin-booking-sources/");
      setBookingSourcesList(sourcesData || []);

      // Fetch Room Categories
      const roomCats = await fetchApi<any[]>("/api/inventory/categories/").catch(() => []);
      setRoomCategories(roomCats || []);

      // Fetch payment gateways
      await loadPaymentGateways();

      const india = countryData.find(c => c.code === "IN") || countryData[0];
      if (india && india.id) {
        setSelectedFilterCountry(india.id);
      }

      const defaultCur = curData.find(c => c.is_default) || curData[0] || {
        code: "USD",
        symbol: "$",
        name: "US Dollar",
        is_default: true,
        symbol_position: "after",
        decimal_places: 2,
        decimal_separator: "dot",
        thousands_separator: "comma",
        add_space: true,
        show_decimals: true
      };
      const defaultDF = dfData.find(d => d.is_default) || dfData[0] || { format: "YYYY-MM-DD", label: "YYYY-MM-DD", is_default: true };
      const defaultTF = tfData.find(t => t.is_default) || tfData[0] || { format: "HH:mm", label: "HH:mm", is_default: true };

      setActiveCurrency(defaultCur);
      setActiveDateFormat(defaultDF);
      setActiveTimeFormat(defaultTF);
      setLanguages(langData);

      // Populate taxes (Deduplicated by name)
      if (taxData && taxData.length > 0) {
        const uniqueTaxes = taxData.filter((t, idx, self) =>
          idx === self.findIndex(o => o.name.trim().toLowerCase() === t.name.trim().toLowerCase())
        );
        setTaxes(uniqueTaxes.map(t => ({
          id: t.id || "",
          name: t.name,
          rate: t.rate,
          type: t.type,
          status: t.status
        })));
      } else {
        const defaultTaxes = [
          { name: "VAT (Value Added Tax)", rate: 15, type: "percentage" as const, status: "active" as const },
          { name: "Service Tax", rate: 5, type: "percentage" as const, status: "active" as const },
          { name: "Tourism Levy", rate: 10, type: "fixed" as const, status: "inactive" as const }
        ];
        const seeded = await Promise.all(defaultTaxes.map(t => settingsApi.createTax(t)));
        setTaxes(seeded.map(t => ({
          id: t.id || "",
          name: t.name,
          rate: t.rate,
          type: t.type,
          status: t.status
        })));
      }

      // Populate documents (Deduplicated by name)
      if (docData && docData.length > 0) {
        const uniqueDocs = docData.filter((d, idx, self) =>
          idx === self.findIndex(o => o.name.trim().toLowerCase() === d.name.trim().toLowerCase())
        );
        setDocuments(uniqueDocs.map(d => ({
          id: d.id || "",
          name: d.name,
          required_checkin: d.required_checkin,
          expiry_required: d.expiry_required
        })));
      } else {
        const defaultDocs = [
          { name: "Passport", required_checkin: true, expiry_required: true },
          { name: "National ID Card", required_checkin: true, expiry_required: false },
          { name: "Driver's License", required_checkin: false, expiry_required: true }
        ];
        const seeded = await Promise.all(defaultDocs.map(d => settingsApi.createDocument(d)));
        setDocuments(seeded.map(d => ({
          id: d.id || "",
          name: d.name,
          required_checkin: d.required_checkin,
          expiry_required: d.expiry_required
        })));
      }

    } catch (err: any) {
      toast.error("Failed to load settings: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Scrollspy & smooth scroll logic
  const scrollToSection = (id: string) => {
    const tabId = id.replace("-section", "");
    setActiveTab(tabId as any);
    const el = document.getElementById(id);
    if (el) {
      const container = document.getElementById("settings-scroll-container");
      if (container) {
        const topPos = el.offsetTop;
        container.scrollTo({ top: Math.max(0, topPos - 10), behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    const container = document.getElementById("settings-scroll-container");
    if (!container) return;

    const sections = [
      "taxes-section",
      "documents-section",
      "payment_gateways-section",
      "amenities-section",
      "room_categories-section",
      "languages-section",
      "currency-section",
      "regions-section",
      "meal_plans-section",
      "booking_sources-section"
    ];
    
    const handleScroll = () => {
      const containerTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      // Force last tab active if we scrolled to the absolute bottom
      if (containerTop + clientHeight >= scrollHeight - 20) {
        setActiveTab("booking_sources");
        return;
      }
      
      for (const sec of sections) {
        const el = document.getElementById(sec);
        if (el) {
          const offsetTop = el.offsetTop;
          const offsetHeight = el.offsetHeight;
          if (containerTop >= offsetTop - 80 && containerTop < offsetTop + offsetHeight - 80) {
            const tabId = sec.replace("-section", "");
            setActiveTab(tabId as any);
            break;
          }
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loading]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // 1. Save Currency Settings
      if (activeCurrency) {
        const target = currencies.find(c => c.code === activeCurrency.code);
        if (target) {
          await Promise.all(
            currencies
              .filter(c => c.is_default && c.id !== target.id)
              .map(c => settingsApi.updateCurrency(c.id!, { is_default: false }))
          );
          await settingsApi.updateCurrency(target.id!, {
            is_default: true,
            symbol_position: activeCurrency.symbol_position,
            decimal_places: activeCurrency.decimal_places,
            decimal_separator: activeCurrency.decimal_separator,
            thousands_separator: activeCurrency.thousands_separator,
            add_space: activeCurrency.add_space,
            show_decimals: activeCurrency.show_decimals
          });
        }
      }

      // 2. Save Date Format
      if (activeDateFormat) {
        const targetDF = dateFormats.find(d => d.format === activeDateFormat.format);
        if (targetDF) {
          await Promise.all(
            dateFormats
              .filter(d => d.is_default && d.id !== targetDF.id)
              .map(d => settingsApi.updateDateFormat(d.id!, { is_default: false }))
          );
          await settingsApi.updateDateFormat(targetDF.id!, { is_default: true });
        } else {
          await Promise.all(
            dateFormats.filter(d => d.is_default).map(d => settingsApi.updateDateFormat(d.id!, { is_default: false }))
          );
          await settingsApi.createDateFormat({
            format: activeDateFormat.format,
            label: activeDateFormat.format,
            is_default: true
          });
        }
      }

      // 3. Save Time Format
      if (activeTimeFormat) {
        const targetTF = timeFormats.find(t => t.format === activeTimeFormat.format);
        if (targetTF) {
          await Promise.all(
            timeFormats
              .filter(t => t.is_default && t.id !== targetTF.id)
              .map(t => settingsApi.updateTimeFormat(t.id!, { is_default: false }))
          );
          await settingsApi.updateTimeFormat(targetTF.id!, { is_default: true });
        } else {
          await Promise.all(
            timeFormats.filter(t => t.is_default).map(t => settingsApi.updateTimeFormat(t.id!, { is_default: false }))
          );
          await settingsApi.createTimeFormat({
            format: activeTimeFormat.format,
            label: activeTimeFormat.format,
            is_default: true
          });
        }
      }

      await loadData();
      toast.success("Settings saved successfully.");
    } catch (err: any) {
      toast.error("Failed to save settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaxName.trim()) {
      toast.error("Tax name is required.");
      return;
    }

    try {
      if (editingTax) {
        const updated = await settingsApi.updateTax(editingTax.id, {
          name: newTaxName.trim(),
          rate: Number(newTaxRate),
          type: newTaxType,
          status: newTaxStatus
        });
        setTaxes(taxes.map(t => t.id === editingTax.id ? (updated as any) : t));
        toast.success("Tax updated successfully.");
      } else {
        const created = await settingsApi.createTax({
          name: newTaxName.trim(),
          rate: Number(newTaxRate),
          type: newTaxType,
          status: newTaxStatus
        });
        setTaxes([...taxes, created as any]);
        toast.success("Tax configured successfully.");
      }
      setTaxModalOpen(false);
      setEditingTax(null);
      setNewTaxName("");
      setNewTaxRate(0);
      setNewTaxType("percentage");
      setNewTaxStatus("active");
    } catch (err: any) {
      toast.error("Failed to save tax: " + err.message);
    }
  };

  const handleToggleTaxStatus = async (id: string) => {
    const tax = taxes.find(t => t.id === id);
    if (!tax) return;
    const nextStatus = tax.status === "active" ? "inactive" : "active";
    try {
      const updated = await settingsApi.updateTax(id, { status: nextStatus });
      setTaxes(taxes.map(t => t.id === id ? (updated as any) : t));
      toast.success("Tax status updated.");
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) {
      toast.error("Document type name is required.");
      return;
    }

    try {
      if (editingDoc) {
        const updated = await settingsApi.updateDocument(editingDoc.id, {
          name: newDocName.trim(),
          required_checkin: newDocRequired,
          expiry_required: newDocExpiry
        });
        setDocuments(documents.map(d => d.id === editingDoc.id ? (updated as any) : d));
        toast.success("Document type updated successfully.");
      } else {
        const created = await settingsApi.createDocument({
          name: newDocName.trim(),
          required_checkin: newDocRequired,
          expiry_required: newDocExpiry
        });
        setDocuments([...documents, created as any]);
        toast.success("Document type registered successfully.");
      }
      setDocModalOpen(false);
      setEditingDoc(null);
      setNewDocName("");
      setNewDocRequired(false);
      setNewDocExpiry(false);
    } catch (err: any) {
      toast.error("Failed to save document type: " + err.message);
    }
  };

  const handleToggleDocRequired = async (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    try {
      const updated = await settingsApi.updateDocument(id, { required_checkin: !doc.required_checkin });
      setDocuments(documents.map(d => d.id === id ? (updated as any) : d));
      toast.success("Check-in requirement updated.");
    } catch (err: any) {
      toast.error("Failed to update check-in requirement: " + err.message);
    }
  };

  const handleToggleDocExpiry = async (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    try {
      const updated = await settingsApi.updateDocument(id, { expiry_required: !doc.expiry_required });
      setDocuments(documents.map(d => d.id === id ? (updated as any) : d));
      toast.success("Expiry verification requirement updated.");
    } catch (err: any) {
      toast.error("Failed to update expiry verification requirement: " + err.message);
    }
  };



  const handleCreateLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLangName.trim() || !newLangCode.trim()) {
      toast.error("Please provide both name and code.");
      return;
    }
    try {
      if (editingLanguage) {
        const updated = await settingsApi.updateLanguage(editingLanguage.id!, {
          name: newLangName.trim(),
          code: newLangCode.trim().toLowerCase(),
          is_active: newLangActive,
          is_default: newLangDefault
        });
        setLanguages((prev) => prev.map((l) => (l.id === editingLanguage.id ? updated : l)));
        toast.success("Language updated successfully.");
      } else {
        const created = await settingsApi.createLanguage({
          name: newLangName.trim(),
          code: newLangCode.trim().toLowerCase(),
          is_active: newLangActive,
          is_default: newLangDefault
        });
        setLanguages((prev) => [...prev, created]);
        toast.success("Language added successfully.");
      }

      if (newLangDefault || (editingLanguage && editingLanguage.is_default !== newLangDefault)) {
        const langData = await settingsApi.getLanguages();
        setLanguages(langData);
      }
      setLangModalOpen(false);
      setEditingLanguage(null);
      setNewLangName("");
      setNewLangCode("");
    } catch (err: any) {
      toast.error("Failed to save language: " + err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { type, id, name, langObj } = deleteTarget;
    try {
      if (type === "tax") {
        await settingsApi.deleteTax(id);
        setTaxes(taxes.filter(t => t.id !== id));
        toast.success(`Tax "${name}" deleted successfully.`);
      } else if (type === "document") {
        await settingsApi.deleteDocument(id);
        setDocuments(documents.filter(d => d.id !== id));
        toast.success(`Document type "${name}" unregistered.`);
      } else if (type === "language" && langObj) {
        if (langObj.is_default) {
          toast.error("Default language cannot be deleted.");
          return;
        }
        await settingsApi.deleteLanguage(langObj.id!);
        setLanguages((prev) => prev.filter((l) => l.id !== langObj.id));
        toast.success(`Language "${name}" deleted successfully.`);
      } else if (type === "country") {
        await settingsApi.deleteCountry(id);
        setCountries(countries.filter(c => c.id !== id));
        setStates(states.filter(s => s.country !== id));
        toast.success(`Country "${name}" deleted successfully.`);
      } else if (type === "state") {
        await settingsApi.deleteState(id);
        setStates(states.filter(s => s.id !== id));
        toast.success(`State "${name}" deleted successfully.`);
      } else if (type === "mealplan") {
        await fetchApi(`/api/rates/meal-plans/${id}/`, { method: "DELETE" });
        setMealPlansList(mealPlansList.filter(mp => mp.id !== id));
        toast.success(`Meal Plan "${name}" deleted successfully.`);
      } else if (type === "bookingsource") {
        await fetchApi(`/api/superadmin-booking-sources/${id}/`, { method: "DELETE" });
        setBookingSourcesList(bookingSourcesList.filter(src => src.id !== id));
        toast.success(`Booking Source "${name}" deleted successfully.`);
      } else if (type === "amenity") {
        await amenitiesApi.deleteAmenity(id);
        setAmenities(amenities.filter(a => a.id !== id));
        toast.success(`Amenity "${name}" deleted successfully.`);
      }
    } catch (err: any) {
      toast.error(`Failed to delete: ${err.message}`);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSaveMealPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealPlanName.trim() || !newMealPlanCode.trim()) {
      toast.error("Name and Code are required.");
      return;
    }

    try {
      const payload = {
        code: newMealPlanCode.toUpperCase().replace(/\s+/g, "_"),
        name: newMealPlanName.trim(),
        price_adjustment: newMealPlanAdjustment,
        tax_percent: newMealPlanTax,
        is_active: newMealPlanActive,
      };

      if (editingMealPlan && editingMealPlan.id) {
        const updated = await fetchApi<any>(`/api/rates/meal-plans/${editingMealPlan.id}/`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMealPlansList(mealPlansList.map(mp => mp.id === editingMealPlan.id ? updated : mp));
        toast.success("Meal Plan updated successfully.");
      } else {
        const created = await fetchApi<any>("/api/rates/meal-plans/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMealPlansList([...mealPlansList, created]);
        toast.success("Meal Plan created successfully.");
      }
      setMealPlanModalOpen(false);
      setEditingMealPlan(null);
      setNewMealPlanName("");
      setNewMealPlanCode("");
      setNewMealPlanAdjustment(0);
      setNewMealPlanTax(0);
      setNewMealPlanActive(true);
    } catch (err: any) {
      toast.error("Failed to save meal plan: " + err.message);
    }
  };

  const handleSaveBookingSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) {
      toast.error("Booking source name is required.");
      return;
    }
    const payload = {
      name: newSourceName.trim(),
      icon: newSourceIcon.trim(),
      details: newSourceDetails.trim(),
      is_active: newSourceActive,
    };
    try {
      if (editingBookingSource && editingBookingSource.id) {
        const updated = await fetchApi<any>(`/api/superadmin-booking-sources/${editingBookingSource.id}/`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setBookingSourcesList(bookingSourcesList.map(src => src.id === editingBookingSource.id ? updated : src));
        toast.success("Booking Source updated successfully.");
      } else {
        const created = await fetchApi<any>("/api/superadmin-booking-sources/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setBookingSourcesList([...bookingSourcesList, created]);
        toast.success("Booking Source created successfully.");
      }
      setBookingSourceModalOpen(false);
      setEditingBookingSource(null);
      setNewSourceName("");
      setNewSourceIcon("");
      setNewSourceDetails("");
      setNewSourceActive(true);
    } catch (err: any) {
      toast.error("Failed to save booking source: " + err.message);
    }
  };

  const handleToggleBookingSourceActive = async (src: any) => {
    try {
      const updated = await fetchApi<any>(`/api/superadmin-booking-sources/${src.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !src.is_active }),
      });
      setBookingSourcesList(bookingSourcesList.map(s => s.id === src.id ? updated : s));
      toast.success(`Booking Source "${src.name}" status updated.`);
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const handleSavePaymentGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gwName.trim() || !gwCode.trim()) {
      toast.error("Gateway name and code are required.");
      return;
    }

    const payload = {
      name: gwName.trim(),
      code: gwCode.trim().toLowerCase(),
      subtitle: gwSubtitle.trim(),
      badge: gwBadge.trim() || "SECURE",
      logo_url: gwLogoUrl,
      is_active: gwActive,
    };

    try {
      if (editingGateway) {
        const updated = await settingsApi.updatePaymentGateway(editingGateway.id, payload);
        setPaymentGatewaysList(paymentGatewaysList.map(g => g.id === editingGateway.id ? updated : g));
        toast.success("Payment Gateway updated successfully.");
      } else {
        const created = await settingsApi.createPaymentGateway(payload);
        setPaymentGatewaysList([...paymentGatewaysList, created]);
        toast.success("Payment Gateway created successfully.");
      }
      setPaymentGatewayModalOpen(false);
      setEditingGateway(null);
      setGwName("");
      setGwCode("");
      setGwSubtitle("");
      setGwBadge("SECURE");
      setGwLogoUrl("");
      setGwActive(true);
    } catch (err: any) {
      toast.error("Failed to save payment gateway: " + err.message);
    }
  };

  const handleToggleGatewayActive = async (gw: any) => {
    try {
      const updated = await settingsApi.updatePaymentGateway(gw.id, { is_active: !gw.is_active });
      setPaymentGatewaysList(paymentGatewaysList.map(g => g.id === gw.id ? updated : g));
      toast.success(`Payment Gateway "${gw.name}" status updated.`);
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const handleDeletePaymentGateway = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment gateway?")) return;
    try {
      await settingsApi.deletePaymentGateway(id);
      setPaymentGatewaysList(paymentGatewaysList.filter(g => g.id !== id));
      toast.success("Payment Gateway deleted successfully.");
    } catch (err: any) {
      toast.error("Failed to delete payment gateway: " + err.message);
    }
  };

  const handleCreateAmenity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmenityName || !newAmenityCode || !newAmenityCategory) {
      toast.error("Please fill in all amenity details.");
      return;
    }
    const payload = {
      name: newAmenityName,
      code: newAmenityCode,
      category: newAmenityCategory,
      chargeable: newAmenityChargeable,
      price: parseFloat(newAmenityPrice) || 0,
      description: newAmenityDescription,
      icon_name: newAmenityIcon,
    };
    try {
      if (editingAmenity) {
        const updated = await amenitiesApi.updateAmenity(editingAmenity.id, payload);
        setAmenities(amenities.map(a => a.id === editingAmenity.id ? updated : a));
        toast.success("Amenity updated successfully.");
      } else {
        const created = await amenitiesApi.createAmenity(payload);
        setAmenities([...amenities, created]);
        toast.success("Amenity created successfully.");
      }
      setAmenityModalOpen(false);
      setEditingAmenity(null);
      setNewAmenityName("");
      setNewAmenityCode("");
      setNewAmenityCategory("General");
      setNewAmenityChargeable(false);
      setNewAmenityPrice("0");
      setNewAmenityDescription("");
      setNewAmenityIcon("wifi");
    } catch (err: any) {
      toast.error("Failed to save amenity: " + err.message);
    }
  };

  const handleSaveRoomCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatCode) {
      toast.error("Please fill in Category Name and Code.");
      return;
    }
    const payload = {
      name: newCatName,
      code: newCatCode.toLowerCase().replace(/\s+/g, "_"),
      is_system: true,
      is_active: true
    };
    try {
      if (editingCat && editingCat.id) {
        const updated = await fetchApi<any>(`/api/inventory/categories/${editingCat.id}/`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setRoomCategories(roomCategories.map(c => c.id === editingCat.id ? updated : c));
        toast.success("Room category updated successfully.");
      } else {
        const created = await fetchApi<any>("/api/inventory/categories/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setRoomCategories([...roomCategories, created]);
        toast.success("Room category created successfully.");
      }
      setCatModalOpen(false);
      setEditingCat(null);
      setNewCatName("");
      setNewCatCode("");
    } catch (err: any) {
      toast.error("Failed to save room category: " + (err.message || err));
    }
  };

  const handleDeleteRoomCategory = async (cat: RoomCategorySetup) => {
    if (!confirm(`Are you sure you want to delete room category "${cat.name}"?`)) return;
    try {
      await fetchApi(`/api/inventory/categories/${cat.id}/`, { method: "DELETE" });
      setRoomCategories(roomCategories.filter(c => c.id !== cat.id));
      toast.success(`Room category "${cat.name}" deleted.`);
    } catch (err: any) {
      toast.error("Failed to delete category: " + (err.message || err));
    }
  };

  const handleToggleMealPlanActive = async (mp: MealPlanSetup) => {
    try {
      const updated = await fetchApi<any>(`/api/rates/meal-plans/${mp.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !mp.is_active }),
      });
      setMealPlansList(mealPlansList.map(m => m.id === mp.id ? updated : m));
      toast.success(`Meal Plan "${mp.name}" status updated.`);
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const handleSaveCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountryName || !newCountryCode) {
      toast.error("Please fill in country name and ISO code.");
      return;
    }
    setSaving(true);
    try {
      const data: CountryData = {
        name: newCountryName,
        code: newCountryCode.toUpperCase(),
        phone_code: newCountryPhoneCode || undefined,
        is_active: newCountryActive
      };

      if (editingCountry && editingCountry.id) {
        const updated = await settingsApi.updateCountry(editingCountry.id, data);
        setCountries(countries.map(c => c.id === editingCountry.id ? updated : c));
        toast.success("Country updated successfully.");
      } else {
        const created = await settingsApi.createCountry(data);
        setCountries([...countries, created]);
        toast.success("Country created successfully.");
      }
      setCountryModalOpen(false);
      setEditingCountry(null);
      setNewCountryName("");
      setNewCountryCode("");
      setNewCountryPhoneCode("");
      setNewCountryActive(true);
    } catch (err: any) {
      toast.error("Operation failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStateName || !newStateCode || !newStateCountry) {
      toast.error("Please fill in state name, code, and select a country.");
      return;
    }
    setSaving(true);
    try {
      const data: StateData = {
        name: newStateName,
        code: newStateCode.toUpperCase(),
        country: newStateCountry,
        is_active: newStateActive
      };

      if (editingState && editingState.id) {
        const updated = await settingsApi.updateState(editingState.id, data);
        setStates(states.map(s => s.id === editingState.id ? updated : s));
        toast.success("State updated successfully.");
      } else {
        const created = await settingsApi.createState(data);
        setStates([...states, created]);
        toast.success("State created successfully.");
      }
      setStateModalOpen(false);
      setEditingState(null);
      setNewStateName("");
      setNewStateCode("");
      setNewStateCountry("");
      setNewStateActive(true);
    } catch (err: any) {
      toast.error("Operation failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCountryActive = async (country: CountryData) => {
    try {
      const updated = await settingsApi.updateCountry(country.id!, {
        is_active: !country.is_active
      });
      setCountries((prev) => prev.map((c) => (c.id === country.id ? updated : c)));
      toast.success(`Country "${country.name}" status updated.`);
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const handleToggleStateActive = async (stateObj: StateData) => {
    try {
      const updated = await settingsApi.updateState(stateObj.id!, {
        is_active: !stateObj.is_active
      });
      setStates((prev) => prev.map((s) => (s.id === stateObj.id ? updated : s)));
      toast.success(`State "${stateObj.name}" status updated.`);
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const handleToggleLangActive = async (lang: SystemLanguageData) => {
    try {
      const updated = await settingsApi.updateLanguage(lang.id!, {
        is_active: !lang.is_active
      });
      setLanguages((prev) => prev.map((l) => (l.id === lang.id ? updated : l)));
      toast.success(`${lang.name} status updated.`);
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const handleSetLangDefault = async (lang: SystemLanguageData) => {
    try {
      await settingsApi.updateLanguage(lang.id!, {
        is_default: true,
        is_active: true
      });
      const data = await settingsApi.getLanguages();
      setLanguages(data);
      toast.success(`${lang.name} is now set as the default system language.`);
    } catch (err: any) {
      toast.error("Failed to set default language: " + err.message);
    }
  };

  const handleDeleteLang = async (lang: SystemLanguageData) => {
    if (lang.is_default) {
      toast.error("Default language cannot be deleted.");
      return;
    }
    try {
      await settingsApi.deleteLanguage(lang.id!);
      setLanguages((prev) => prev.filter((l) => l.id !== lang.id));
      toast.success("Language deleted successfully.");
    } catch (err: any) {
      toast.error("Failed to delete language: " + err.message);
    }
  };

  // Currency Formatter Preview calculation
  const formattedCurrencyPreview = useMemo(() => {
    if (!activeCurrency) return "1,234.56 $";
    const amt = 1234.56;
    const decimals = activeCurrency.decimal_places ?? 2;
    const separator = activeCurrency.decimal_separator === "dot" ? "." : ",";
    const thousands = activeCurrency.thousands_separator === "comma" ? "," : activeCurrency.thousands_separator === "dot" ? "." : " ";
    const showDec = activeCurrency.show_decimals ?? true;
    const addSpace = activeCurrency.add_space ? " " : "";

    let formattedAmt = "";
    if (showDec) {
      const fixed = amt.toFixed(decimals);
      const parts = fixed.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
      formattedAmt = parts.join(separator);
    } else {
      formattedAmt = Math.round(amt).toString().replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
    }

    const symbol = activeCurrency.symbol || "$";

    if (activeCurrency.symbol_position === "before") {
      return `${symbol}${addSpace}${formattedAmt}`;
    } else {
      return `${formattedAmt}${addSpace}${symbol}`;
    }
  }, [activeCurrency]);

  // Country search filtering and pagination
  const filteredCountries = useMemo(() => {
    return countries.filter(c =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countries, countrySearch]);

  const countriesPerPage = 10;
  const totalCountryPages = Math.ceil(filteredCountries.length / countriesPerPage) || 1;
  const paginatedCountries = useMemo(() => {
    const start = (countryPage - 1) * countriesPerPage;
    return filteredCountries.slice(start, start + countriesPerPage);
  }, [filteredCountries, countryPage]);

  const statesPerPage = 10;
  const totalPages = Math.ceil(states.length / statesPerPage) || 1;
  const paginatedStates = useMemo(() => {
    const start = (statePage - 1) * statesPerPage;
    return states.slice(start, start + statesPerPage);
  }, [states, statePage]);

  if (loading || !activeCurrency || !activeDateFormat || !activeTimeFormat) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-56px)] flex flex-col overflow-hidden bg-background">
      <PageHeader
        eyebrow="Platform Controller"
        title="Settings"
        description="Configure tax rates, accepted check-in documents, facilities, and regional settings."
      />
      <div className="responsive-page-x py-4 flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr] items-stretch w-full flex-1 overflow-hidden min-h-0">
          {/* Sub tabs sidebar */}
          <Card className="h-fit p-2 sticky top-24 shadow-md border-border bg-surface hover:shadow-lg transition-all duration-300">
            <ul className="space-y-1.5">
              {[
                { id: "taxes", label: "Tax Setup", icon: Percent },
                { id: "documents", label: "Document Setup", icon: FileText },
                { id: "payment_gateways", label: "Payment Gateways", icon: CreditCard },
                { id: "amenities", label: "Amenities & Facilities Setup", icon: Building },
                { id: "room_categories", label: "Room Categories Setup", icon: Layers },
                { id: "languages", label: "Language & Format", icon: Globe },
                { id: "currency", label: "Currency Settings", icon: DollarSign },
                { id: "regions", label: "Country & State", icon: MapPin },
                { id: "meal_plans", label: "Meal Plans Setup", icon: FileText },
                { id: "booking_sources", label: "Booking Sources", icon: Briefcase }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => scrollToSection(`${tab.id}-section`)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-[13.5px] font-semibold transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-primary text-white shadow-sm shadow-primary/20 scale-[1.02]"
                          : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 transition-transform duration-200 ${activeTab === tab.id ? "scale-110" : ""}`} />
                      {tab.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* Stacked and scrollspy scrollable container */}
          <div
            id="settings-scroll-container"
            className="relative h-full overflow-y-auto pr-2 space-y-6 scroll-smooth scrollbar-thin w-full pb-8"
          >
            {/* TAX SETUP PANEL */}
            <div id="taxes-section">
              <Card className="p-5 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                  <div>
                    <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                      <Percent className="h-4 w-4 text-primary" /> Tax Setup
                    </h3>
                    <p className="text-[12px] text-text-secondary mt-0.5">Manage tax rates, service fees, and VAT rule assignments.</p>
                  </div>
                  <button
                    onClick={() => setTaxModalOpen(true)}
                    className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-[11.5px] font-semibold text-white hover:bg-primary-pressed shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5" /> Configure Tax
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-[12.5px]">
                    <thead>
                      <tr className="border-b border-border bg-surface-2 text-text-secondary font-medium">
                        <th className="px-4 py-3">Tax Name</th>
                        <th className="px-4 py-3">Rate</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      {taxes.map((tax) => (
                        <tr key={tax.id} className="hover:bg-surface-2/30">
                          <td className="px-4 py-3 font-medium text-text-primary">{tax.name}</td>
                          <td className="px-4 py-3 font-mono text-[12px] text-text-secondary">
                            {tax.rate}{tax.type === "percentage" ? "%" : " (Fixed)"}
                          </td>
                          <td className="px-4 py-3 text-text-secondary capitalize">{tax.type}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleToggleTaxStatus(tax.id)}
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase transition ${
                                tax.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {tax.status === "active" ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingTax(tax);
                                setNewTaxName(tax.name);
                                setNewTaxRate(tax.rate);
                                setNewTaxType(tax.type);
                                setNewTaxStatus(tax.status);
                                setTaxModalOpen(true);
                              }}
                              className="text-text-secondary hover:text-primary transition-colors cursor-pointer"
                              title="Edit Tax"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: "tax", id: tax.id, name: tax.name })}
                              className="text-text-secondary hover:text-destructive transition-colors cursor-pointer"
                              title="Delete Tax"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* DOCUMENT SETUP PANEL */}
            <div id="documents-section">
              <Card className="p-5 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                  <div>
                    <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" /> Document Setup
                    </h3>
                    <p className="text-[12px] text-text-secondary mt-0.5">Define guest identification documents accepted during check-in.</p>
                  </div>
                  <button
                    onClick={() => setDocModalOpen(true)}
                    className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-[11.5px] font-semibold text-white hover:bg-primary-pressed shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Document Type
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-[12.5px]">
                    <thead>
                      <tr className="border-b border-border bg-surface-2 text-text-secondary font-medium">
                        <th className="px-4 py-3">Document Type</th>
                        <th className="px-4 py-3 text-center">Required for Check-in</th>
                        <th className="px-4 py-3 text-center">Expiry Date Verification</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-surface-2/30">
                          <td className="px-4 py-3 font-medium text-text-primary">{doc.name}</td>
                          <td className="px-4 py-3 text-center">
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={doc.required_checkin}
                                onChange={() => handleToggleDocRequired(doc.id)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                            </label>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={doc.expiry_required}
                                onChange={() => handleToggleDocExpiry(doc.id)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                            </label>
                          </td>
                          <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingDoc(doc);
                                setNewDocName(doc.name);
                                setNewDocRequired(doc.required_checkin);
                                setNewDocExpiry(doc.expiry_required);
                                setDocModalOpen(true);
                              }}
                              className="text-text-secondary hover:text-primary transition-colors cursor-pointer"
                              title="Edit Document Type"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: "document", id: doc.id, name: doc.name })}
                              className="text-text-secondary hover:text-destructive transition-colors cursor-pointer"
                              title="Delete Document Type"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* PAYMENT GATEWAYS PANEL */}
            <div id="payment_gateways-section">
              <Card className="p-5 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                  <div>
                    <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" /> Payment Gateways
                    </h3>
                    <p className="text-[12px] text-text-secondary mt-0.5">Manage global payment providers, logos, and default availability.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingGateway(null);
                      setGwName("");
                      setGwCode("");
                      setGwSubtitle("");
                      setGwBadge("SECURE");
                      setGwLogoUrl("");
                      setGwActive(true);
                      setPaymentGatewayModalOpen(true);
                    }}
                    className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-[11.5px] font-semibold text-white hover:bg-primary-pressed shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Payment Gateway
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-[12.5px]">
                    <thead>
                      <tr className="border-b border-border bg-surface-2 text-text-secondary font-medium">
                        <th className="px-4 py-3">Gateway</th>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Subtitle & Badge</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      {paymentGatewaysList.map((gw) => (
                        <tr key={gw.id} className="hover:bg-surface-2/30">
                          <td className="px-4 py-3 font-medium text-text-primary flex items-center gap-2.5">
                            {gw.logo_url ? (
                              <img src={gw.logo_url} alt={gw.name} className="h-5 w-auto object-contain" />
                            ) : (
                              <CreditCard className="h-4 w-4 text-primary" />
                            )}
                            <span>{gw.name}</span>
                          </td>
                          <td className="px-4 py-3 font-mono text-[12px] text-text-secondary uppercase">{gw.code}</td>
                          <td className="px-4 py-3 text-text-secondary">
                            <span className="text-[11px] block">{gw.subtitle || "Online PG"}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-2 border border-border text-text-primary inline-block mt-0.5">
                              {gw.badge || "SECURE"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleGatewayActive(gw)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                                gw.is_active
                                  ? "bg-success/15 text-success border border-success/30 hover:bg-success/20"
                                  : "bg-surface-2 text-text-secondary border border-border hover:bg-surface-3"
                              }`}
                            >
                              {gw.is_active ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingGateway(gw);
                                setGwName(gw.name);
                                setGwCode(gw.code);
                                setGwSubtitle(gw.subtitle || "");
                                setGwBadge(gw.badge || "SECURE");
                                setGwLogoUrl(gw.logo_url || "");
                                setGwActive(gw.is_active);
                                setPaymentGatewayModalOpen(true);
                              }}
                              className="text-text-secondary hover:text-primary transition-colors cursor-pointer"
                              title="Edit Gateway"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePaymentGateway(gw.id)}
                              className="text-text-secondary hover:text-destructive transition-colors cursor-pointer"
                              title="Delete Gateway"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {paymentGatewaysList.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-text-secondary">
                            No payment gateways defined. Click "Add Payment Gateway" above.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* AMENITIES SETUP PANEL */}
            <div id="amenities-section">
              <Card className="p-5 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                  <div>
                    <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                      <Building className="h-4 w-4 text-primary" /> Amenities & Facilities Setup
                    </h3>
                    <p className="text-[12px] text-text-secondary mt-0.5">Manage global amenities available for properties to select.</p>
                  </div>
                  <button
                    onClick={() => setAmenityModalOpen(true)}
                    className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-[11.5px] font-semibold text-white hover:bg-primary-pressed shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Amenity
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-[12.5px]">
                    <thead>
                      <tr className="border-b border-border bg-surface-2 text-text-secondary font-medium">
                        <th className="px-4 py-3">Amenity Name</th>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      {amenities.map((amenity) => (
                        <tr key={amenity.id} className="hover:bg-surface-2/30">
                          <td className="px-4 py-3 font-medium text-text-primary">{amenity.name}</td>
                          <td className="px-4 py-3 font-mono text-[12px] text-text-secondary uppercase">{amenity.code}</td>
                          <td className="px-4 py-3 text-text-secondary">{amenity.category}</td>
                          <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingAmenity(amenity);
                                setNewAmenityName(amenity.name);
                                setNewAmenityCode(amenity.code);
                                setNewAmenityCategory(amenity.category);
                                setNewAmenityChargeable(amenity.chargeable || false);
                                setNewAmenityPrice((amenity.price || 0).toString());
                                setNewAmenityDescription(amenity.description || "");
                                setNewAmenityIcon(amenity.icon_name || "wifi");
                                setAmenityModalOpen(true);
                              }}
                              className="text-text-secondary hover:text-primary transition-colors cursor-pointer"
                              title="Edit Amenity"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: "amenity", id: amenity.id, name: amenity.name })}
                              className="text-text-secondary hover:text-destructive transition-colors cursor-pointer"
                              title="Delete Amenity"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* ROOM CATEGORIES SETUP PANEL */}
            <div id="room_categories-section">
              <Card className="p-5 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                  <div>
                    <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" /> Room Categories Setup
                    </h3>
                    <p className="text-[12px] text-text-secondary mt-0.5">Define global system room categories for room types and inventory unit classification.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCat(null);
                      setNewCatName("");
                      setNewCatCode("");
                      setCatModalOpen(true);
                    }}
                    className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-[11.5px] font-semibold text-white hover:bg-primary-pressed shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Room Category
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-[12.5px]">
                    <thead>
                      <tr className="border-b border-border bg-surface-2 text-text-secondary font-medium">
                        <th className="px-4 py-3">Category Name</th>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      {roomCategories.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-text-muted text-[13px]">
                            No room categories configured. Click "Add Room Category" to create one.
                          </td>
                        </tr>
                      ) : (
                        roomCategories.map((cat) => (
                          <tr key={cat.id} className="hover:bg-surface-2/30">
                            <td className="px-4 py-3 font-medium text-text-primary">{cat.name}</td>
                            <td className="px-4 py-3 font-mono text-[12px] text-text-secondary">{cat.code}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${cat.is_system ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                                {cat.is_system ? "System Default" : "Custom"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingCat(cat);
                                    setNewCatName(cat.name);
                                    setNewCatCode(cat.code);
                                    setCatModalOpen(true);
                                  }}
                                  className="rounded p-1 text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                                  title="Edit Category"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRoomCategory(cat)}
                                  className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-700"
                                  title="Delete Category"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* LANGUAGES & FORMATS PANEL */}

            <div id="languages-section">
              <Card className="p-5 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                  <div>
                    <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" /> Language & Date/Time Formats
                    </h3>
                    <p className="text-[12px] text-text-secondary mt-0.5">Configure system formats and add support for multiple languages.</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={saving}
                    onClick={handleSaveSettings}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelCls}>Date Format</label>
                      <select
                        className={selectCls}
                        value={activeDateFormat?.format}
                        onChange={(e) => setActiveDateFormat({ ...activeDateFormat, format: e.target.value } as any)}
                      >
                        <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-06-24)</option>
                        <option value="DD-MM-YYYY">DD-MM-YYYY (e.g. 24-06-2026)</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 06/24/2026)</option>
                        <option value="DD MMM YYYY">DD MMM YYYY (e.g. 24 Jun 2026)</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Time Format</label>
                      <select
                        className={selectCls}
                        value={activeTimeFormat?.format}
                        onChange={(e) => setActiveTimeFormat({ ...activeTimeFormat, format: e.target.value } as any)}
                      >
                        <option value="HH:mm">24 Hour format (e.g. 14:30)</option>
                        <option value="hh:mm A">12 Hour format (e.g. 02:30 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-border pt-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-[13.5px] font-bold text-text-primary">System Languages</h4>
                        <p className="text-[11.5px] text-text-secondary">Enable and assign active languages for localized screens.</p>
                      </div>
                      <button
                        onClick={() => setLangModalOpen(true)}
                        className="flex h-8 items-center gap-1 rounded-md bg-primary-tint px-3 text-[11.5px] font-semibold text-primary hover:bg-primary-tint/80"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Language
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full text-left text-[12.5px]">
                        <thead>
                          <tr className="border-b border-border bg-surface-2 text-text-secondary font-medium">
                            <th className="px-4 py-3">Language</th>
                            <th className="px-4 py-3">Code</th>
                            <th className="px-4 py-3">Active</th>
                            <th className="px-4 py-3">Default</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-surface">
                          {languages.map((lang) => (
                            <tr key={lang.id} className="hover:bg-surface-2/30">
                              <td className="px-4 py-3 font-medium text-text-primary">{lang.name}</td>
                              <td className="px-4 py-3 font-mono text-[11.5px] text-text-secondary uppercase">{lang.code}</td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => handleToggleLangActive(lang)}
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase transition ${
                                    lang.is_active
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {lang.is_active ? "Active" : "Disabled"}
                                </button>
                              </td>
                              <td className="px-4 py-3">
                                {lang.is_default ? (
                                  <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                                    <Check className="h-3.5 w-3.5" /> Default
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleSetLangDefault(lang)}
                                    className="text-[11px] font-medium text-text-disabled hover:text-primary hover:underline"
                                  >
                                    Set Default
                                  </button>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingLanguage(lang);
                                    setNewLangName(lang.name);
                                    setNewLangCode(lang.code);
                                    setNewLangActive(lang.is_active);
                                    setNewLangDefault(lang.is_default);
                                    setLangModalOpen(true);
                                  }}
                                  className="text-text-secondary hover:text-primary transition-colors cursor-pointer"
                                  title="Edit Language"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  disabled={lang.is_default}
                                  onClick={() => setDeleteTarget({ type: "language", id: lang.id!, name: lang.name, langObj: lang })}
                                  className="text-text-secondary hover:text-destructive disabled:opacity-30 transition-colors cursor-pointer"
                                  title="Delete Language"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* CURRENCY SETTINGS PANEL */}
            <div id="currency-section">
              <Card className="p-5 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" /> Currency Settings
                    </h3>
                    <p className="text-[12px] text-text-secondary mt-0.5">Configure how currency values are displayed throughout the application.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddCurrencyModalOpen(true)}
                      className="flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" /> Add Currency
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={saving}
                      onClick={handleSaveSettings}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-xl border border-border bg-surface p-5 flex items-center justify-between shadow-sm">
                    <div>
                      <div className="text-[28px] font-bold text-text-primary transition-all">
                        {formattedCurrencyPreview}
                      </div>
                      <div className="text-[11.5px] text-text-secondary mt-0.5">
                        {activeCurrency?.name} ({activeCurrency?.code})
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeCurrency) {
                          setActiveCurrency({
                            ...activeCurrency,
                            symbol_position: "after",
                            decimal_places: 2,
                            decimal_separator: "dot",
                            thousands_separator: "comma",
                            add_space: true,
                            show_decimals: true
                          });
                        }
                      }}
                      className="h-8 rounded-lg border border-border bg-surface px-3 text-[12px] hover:bg-surface-2 transition"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className={labelCls}>Default Currency</label>
                        <button
                          type="button"
                          onClick={() => setIsAddCurrencyModalOpen(true)}
                          className="text-[11.5px] font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add New Currency
                        </button>
                      </div>
                      <select
                        className={selectCls}
                        value={activeCurrency?.code}
                        onChange={(e) => {
                          const match = currencies.find(c => c.code === e.target.value);
                          if (match) {
                            setActiveCurrency(match);
                          }
                        }}
                      >
                        {currencies.map(c => (
                          <option key={c.id || c.code} value={c.code}>
                            {c.symbol} {c.code} - {c.name} {c.country_name ? `(${c.country_name})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Symbol Position</label>
                      <select
                        className={selectCls}
                        value={activeCurrency?.symbol_position || "after"}
                        onChange={(e) => {
                          if (activeCurrency) {
                            setActiveCurrency({ ...activeCurrency, symbol_position: e.target.value });
                          }
                        }}
                      >
                        <option value="before">Before Amount (e.g. $ 100)</option>
                        <option value="after">After Amount (e.g. 100 $)</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Decimal Places</label>
                      <input
                        type="number"
                        className={inputCls}
                        min={0}
                        max={4}
                        value={activeCurrency?.decimal_places ?? 2}
                        onChange={(e) => {
                          if (activeCurrency) {
                            setActiveCurrency({ ...activeCurrency, decimal_places: parseInt(e.target.value) || 0 });
                          }
                        }}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Decimal Separator</label>
                      <select
                        className={selectCls}
                        value={activeCurrency?.decimal_separator || "dot"}
                        onChange={(e) => {
                          if (activeCurrency) {
                            setActiveCurrency({ ...activeCurrency, decimal_separator: e.target.value });
                          }
                        }}
                      >
                        <option value="dot">Dot (.)</option>
                        <option value="comma">Comma (,)</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Thousands Separator</label>
                      <select
                        className={selectCls}
                        value={activeCurrency?.thousands_separator || "comma"}
                        onChange={(e) => {
                          if (activeCurrency) {
                            setActiveCurrency({ ...activeCurrency, thousands_separator: e.target.value });
                          }
                        }}
                      >
                        <option value="comma">Comma (,)</option>
                        <option value="dot">Dot (.)</option>
                        <option value="space">Space ( )</option>
                      </select>
                    </div>

                    <div className="flex flex-col justify-end gap-3 pb-1.5">
                      <label className="flex items-center gap-2 text-[12.5px] text-text-secondary cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeCurrency?.add_space ?? true}
                          onChange={(e) => {
                            if (activeCurrency) {
                              setActiveCurrency({ ...activeCurrency, add_space: e.target.checked });
                            }
                          }}
                          className="h-3.5 w-3.5 rounded"
                        />
                        Add space between symbol and amount
                      </label>
                      <label className="flex items-center gap-2 text-[12.5px] text-text-secondary cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeCurrency?.show_decimals ?? true}
                          onChange={(e) => {
                            if (activeCurrency) {
                              setActiveCurrency({ ...activeCurrency, show_decimals: e.target.checked });
                            }
                          }}
                          className="h-3.5 w-3.5 rounded"
                        />
                        Show decimals
                      </label>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div id="regions-section" className="space-y-6">
              <Card className="p-5 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 mb-5">
                  <div>
                    <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> Country Setup
                    </h3>
                    <p className="text-[12px] text-text-secondary mt-0.5">Manage geographical countries, phone prefix codes, and active statuses.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold text-text-secondary whitespace-nowrap">Search:</span>
                      <input
                        type="text"
                        className={`${inputCls} w-44 h-8`}
                        placeholder="Search Country/Code..."
                        value={countrySearch}
                        onChange={(e) => {
                          setCountrySearch(e.target.value);
                          setCountryPage(1);
                        }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        setEditingCountry(null);
                        setNewCountryName("");
                        setNewCountryCode("");
                        setNewCountryPhoneCode("");
                        setNewCountryActive(true);
                        setCountryModalOpen(true);
                      }}
                      className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-[11.5px] font-semibold text-white hover:bg-primary-pressed shadow-md"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Country
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-[12.5px]">
                    <thead>
                      <tr className="border-b border-border bg-surface-2 text-text-secondary font-medium">
                        <th className="px-4 py-3">Country Name</th>
                        <th className="px-4 py-3">ISO Code</th>
                        <th className="px-4 py-3">Phone Prefix</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      {paginatedCountries.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                            No countries match your search query. Click "Add Country" to configure new.
                          </td>
                        </tr>
                      ) : (
                        paginatedCountries.map((country) => (
                          <tr key={country.id} className="hover:bg-surface-2 transition">
                            <td className="px-4 py-3.5 font-semibold text-text-primary">{country.name}</td>
                            <td className="px-4 py-3.5 text-text-secondary font-mono">{country.code}</td>
                            <td className="px-4 py-3.5 text-text-secondary">{country.phone_code || "—"}</td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium transition cursor-pointer ${
                                  country.is_active
                                    ? "bg-success/10 text-success hover:bg-success/20"
                                    : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                }`}
                                onClick={() => handleToggleCountryActive(country)}
                              >
                                {country.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-2.5">
                                <button
                                  onClick={() => {
                                    setEditingCountry(country);
                                    setNewCountryName(country.name);
                                    setNewCountryCode(country.code);
                                    setNewCountryPhoneCode(country.phone_code || "");
                                    setNewCountryActive(country.is_active);
                                    setCountryModalOpen(true);
                                  }}
                                  className="text-text-secondary hover:text-primary transition"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget({ type: "country", id: country.id!, name: country.name })}
                                  className="text-text-muted hover:text-destructive transition"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Country Pagination Controls */}
                {totalCountryPages > 1 && (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-4 mt-4">
                    <div className="text-[12px] text-text-secondary text-center sm:text-left">
                      Showing <span className="font-semibold">{Math.min(filteredCountries.length, (countryPage - 1) * countriesPerPage + 1)}</span> to{" "}
                      <span className="font-semibold">{Math.min(filteredCountries.length, countryPage * countriesPerPage)}</span> of{" "}
                      <span className="font-semibold">{filteredCountries.length}</span> entries
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={countryPage === 1}
                        onClick={() => setCountryPage(prev => Math.max(prev - 1, 1))}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalCountryPages }).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCountryPage(idx + 1)}
                            className={`h-7 w-7 rounded-md text-[12.5px] font-semibold transition ${
                              countryPage === idx + 1
                                ? "bg-primary text-white"
                                : "border border-border bg-surface text-text-secondary hover:bg-surface-2"
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={countryPage === totalCountryPages}
                        onClick={() => setCountryPage(prev => Math.min(prev + 1, totalCountryPages))}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-5 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 mb-5">
                  <div>
                    <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> State Setup
                    </h3>
                    <p className="text-[12px] text-text-secondary mt-0.5">Configure states, provinces, and regions mapping to their respective countries.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold text-text-secondary whitespace-nowrap">Country:</span>
                      <SearchableSelect
                        options={countries}
                        value={selectedFilterCountry}
                        onChange={setSelectedFilterCountry}
                        placeholder="Select Country"
                        className="w-44"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setEditingState(null);
                        setNewStateName("");
                        setNewStateCode("");
                        setNewStateCountry(selectedFilterCountry || countries[0]?.id || "");
                        setNewStateActive(true);
                        setStateModalOpen(true);
                      }}
                      className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-[11.5px] font-semibold text-white hover:bg-primary-pressed shadow-md"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add State
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-[12.5px]">
                    <thead>
                      <tr className="border-b border-border bg-surface-2 text-text-secondary font-medium">
                        <th className="px-4 py-3">State Name</th>
                        <th className="px-4 py-3">State Code</th>
                        <th className="px-4 py-3">Country</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      {loadingStates ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-text-muted">
                            <RefreshCw className="h-5 w-5 animate-spin mx-auto text-primary mb-2" />
                            Loading states...
                          </td>
                        </tr>
                      ) : paginatedStates.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                            No states configured for this country. Click "Add State" to begin.
                          </td>
                        </tr>
                      ) : (
                        paginatedStates.map((stateObj) => (
                          <tr key={stateObj.id} className="hover:bg-surface-2 transition">
                            <td className="px-4 py-3.5 font-semibold text-text-primary">{stateObj.name}</td>
                            <td className="px-4 py-3.5 text-text-secondary font-mono">{stateObj.code}</td>
                            <td className="px-4 py-3.5 text-text-secondary">{stateObj.country_name || "—"}</td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium transition cursor-pointer ${
                                  stateObj.is_active
                                    ? "bg-success/10 text-success hover:bg-success/20"
                                    : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                }`}
                                onClick={() => handleToggleStateActive(stateObj)}
                              >
                                {stateObj.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-2.5">
                                <button
                                  onClick={() => {
                                    setEditingState(stateObj);
                                    setNewStateName(stateObj.name);
                                    setNewStateCode(stateObj.code);
                                    setNewStateCountry(stateObj.country);
                                    setNewStateActive(stateObj.is_active);
                                    setStateModalOpen(true);
                                  }}
                                  className="text-text-secondary hover:text-primary transition"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget({ type: "state", id: stateObj.id!, name: stateObj.name })}
                                  className="text-text-muted hover:text-destructive transition"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* State Table Pagination Controls */}
                {!loadingStates && totalPages > 1 && (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-4 mt-4">
                    <div className="text-[12px] text-text-secondary text-center sm:text-left">
                      Showing <span className="font-semibold">{Math.min(states.length, (statePage - 1) * statesPerPage + 1)}</span> to{" "}
                      <span className="font-semibold">{Math.min(states.length, statePage * statesPerPage)}</span> of{" "}
                      <span className="font-semibold">{states.length}</span> entries
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={statePage === 1}
                        onClick={() => setStatePage(prev => Math.max(prev - 1, 1))}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setStatePage(idx + 1)}
                            className={`h-7 w-7 rounded-md text-[12.5px] font-semibold transition ${
                              statePage === idx + 1
                                ? "bg-primary text-white"
                                : "border border-border bg-surface text-text-secondary hover:bg-surface-2"
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={statePage === totalPages}
                        onClick={() => setStatePage(prev => Math.min(prev + 1, totalPages))}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* MEAL PLANS SETUP PANEL */}
            <div id="meal_plans-section">
              <Card className="p-5 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                  <div>
                    <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" /> Global Meal Plans Setup
                    </h3>
                    <p className="text-[12px] text-text-secondary mt-0.5">Manage system meal plans (EP, CP, MAP, AP) available to all tenants.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingMealPlan(null);
                      setNewMealPlanName("");
                      setNewMealPlanCode("");
                      setNewMealPlanAdjustment(0);
                      setNewMealPlanTax(0);
                      setNewMealPlanActive(true);
                      setMealPlanModalOpen(true);
                    }}
                    className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-[11.5px] font-semibold text-white hover:bg-primary-pressed shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Meal Plan
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-[12.5px]">
                    <thead>
                      <tr className="border-b border-border bg-surface-2 text-text-secondary font-medium">
                        <th className="px-4 py-3">Meal Plan Name</th>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Base Adjustment</th>
                        <th className="px-4 py-3">Tax %</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      {mealPlansList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                            No meal plans configured. Click "Add Meal Plan" to configure new.
                          </td>
                        </tr>
                      ) : (
                        mealPlansList.map((mp) => (
                          <tr key={mp.id} className="hover:bg-surface-2/30">
                            <td className="px-4 py-3 font-semibold text-text-primary">{mp.name}</td>
                            <td className="px-4 py-3 text-text-secondary font-mono uppercase">{mp.code}</td>
                            <td className="px-4 py-3 text-text-secondary font-mono">₹{parseFloat(String(mp.price_adjustment)).toFixed(2)}</td>
                            <td className="px-4 py-3 text-text-secondary font-mono">{mp.tax_percent}%</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium transition cursor-pointer ${
                                  mp.is_active
                                    ? "bg-success/10 text-success hover:bg-success/20"
                                    : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                  }`}
                                onClick={() => handleToggleMealPlanActive(mp)}
                              >
                                {mp.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2.5">
                                <button
                                  onClick={() => {
                                    setEditingMealPlan(mp);
                                    setNewMealPlanName(mp.name);
                                    setNewMealPlanCode(mp.code);
                                    setNewMealPlanAdjustment(Number(mp.price_adjustment));
                                    setNewMealPlanTax(Number(mp.tax_percent));
                                    setNewMealPlanActive(mp.is_active);
                                    setMealPlanModalOpen(true);
                                  }}
                                  className="text-text-secondary hover:text-primary transition"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget({ type: "mealplan", id: mp.id!, name: mp.name })}
                                  className="text-text-muted hover:text-destructive transition"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* BOOKING SOURCES SETUP PANEL */}
            <div id="booking_sources-section">
              <Card className="p-5 border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                  <div>
                    <h3 className="text-[16px] font-bold text-text-primary flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" /> Global Booking Sources Setup
                    </h3>
                    <p className="text-[12px] text-text-secondary mt-0.5">Manage system booking channels (Direct, OTA, Agents, etc.) visible to all tenants.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingBookingSource(null);
                      setNewSourceName("");
                      setNewSourceIcon("Globe");
                      setNewSourceDetails("");
                      setNewSourceActive(true);
                      setBookingSourceModalOpen(true);
                    }}
                    className="flex h-8 items-center gap-1 rounded-md bg-primary px-3 text-[11.5px] font-semibold text-white hover:bg-primary-pressed shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Booking Source
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-[12.5px]">
                    <thead>
                      <tr className="border-b border-border bg-surface-2 text-text-secondary font-medium">
                        <th className="px-4 py-3">Source Name</th>
                        <th className="px-4 py-3">Icon</th>
                        <th className="px-4 py-3">Details</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      {bookingSourcesList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-text-muted">
                            No booking sources configured. Click "Add Booking Source" to configure new.
                          </td>
                        </tr>
                      ) : (
                        bookingSourcesList.map((src) => (
                          <tr key={src.id} className="hover:bg-surface-2/30">
                            <td className="px-4 py-3 font-semibold text-text-primary">{src.name}</td>
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
                            <td className="px-4 py-3 text-text-secondary">{src.details || "-"}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium transition cursor-pointer ${
                                  src.is_active
                                    ? "bg-success/10 text-success hover:bg-success/20"
                                    : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                  }`}
                                onClick={() => handleToggleBookingSourceActive(src)}
                              >
                                {src.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2.5">
                                <button
                                  onClick={() => {
                                    setEditingBookingSource(src);
                                    setNewSourceName(src.name);
                                    setNewSourceIcon(src.icon || "");
                                    setNewSourceDetails(src.details || "");
                                    setNewSourceActive(src.is_active);
                                    setBookingSourceModalOpen(true);
                                  }}
                                  className="text-text-secondary hover:text-primary transition"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget({ type: "bookingsource", id: src.id!, name: src.name })}
                                  className="text-text-muted hover:text-destructive transition"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              <strong>{deleteTarget?.type}</strong>: <strong>{deleteTarget?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add/Edit Country modal/drawer */}
      {countryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => {
              setCountryModalOpen(false);
              setEditingCountry(null);
              setNewCountryName("");
              setNewCountryCode("");
              setNewCountryPhoneCode("");
              setNewCountryActive(true);
            }}
          />

          {/* Drawer content */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-surface border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
              <div className="flex-1 py-6 overflow-y-auto px-6">
                <div className="flex items-start justify-between pb-4 border-b border-border">
                  <h2 className="text-[15px] font-bold text-text-primary">
                    {editingCountry ? "Edit Country Configuration" : "Add New Geographical Country"}
                  </h2>
                  <button
                    onClick={() => {
                      setCountryModalOpen(false);
                      setEditingCountry(null);
                      setNewCountryName("");
                      setNewCountryCode("");
                      setNewCountryPhoneCode("");
                      setNewCountryActive(true);
                    }}
                    className="rounded-md text-text-muted hover:text-text-secondary focus:outline-none"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveCountry} className="mt-6 space-y-4">
                  <div>
                    <label className={labelCls}>Country Name</label>
                    <input
                      type="text"
                      className={inputCls}
                      required
                      placeholder="e.g. India"
                      value={newCountryName}
                      onChange={(e) => setNewCountryName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>ISO Alpha-2 Code</label>
                    <input
                      type="text"
                      className={inputCls}
                      required
                      maxLength={2}
                      placeholder="e.g. IN"
                      value={newCountryCode}
                      onChange={(e) => setNewCountryCode(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>International Phone Code</label>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="e.g. +91"
                      value={newCountryPhoneCode}
                      onChange={(e) => setNewCountryPhoneCode(e.target.value)}
                    />
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-[13px] text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newCountryActive}
                        onChange={(e) => setNewCountryActive(e.target.checked)}
                        className="h-4 w-4 rounded"
                      />
                      Active for use
                    </label>
                  </div>

                  <div className="pt-6 flex items-center justify-end gap-3 border-t border-border mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCountryModalOpen(false);
                        setEditingCountry(null);
                        setNewCountryName("");
                        setNewCountryCode("");
                        setNewCountryPhoneCode("");
                        setNewCountryActive(true);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm" disabled={saving}>
                      {saving ? "Saving..." : editingCountry ? "Update Country" : "Create Country"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit State modal/drawer */}
      {stateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => {
              setStateModalOpen(false);
              setEditingState(null);
              setNewStateName("");
              setNewStateCode("");
              setNewStateCountry("");
              setNewStateActive(true);
            }}
          />

          {/* Drawer content */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-surface border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
              <div className="flex-1 py-6 overflow-y-auto px-6">
                <div className="flex items-start justify-between pb-4 border-b border-border">
                  <h2 className="text-[15px] font-bold text-text-primary">
                    {editingState ? "Edit State Config" : "Add New State/Province"}
                  </h2>
                  <button
                    onClick={() => {
                      setStateModalOpen(false);
                      setEditingState(null);
                      setNewStateName("");
                      setNewStateCode("");
                      setNewStateCountry("");
                      setNewStateActive(true);
                    }}
                    className="rounded-md text-text-muted hover:text-text-secondary focus:outline-none"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveState} className="mt-6 space-y-4">
                  <div>
                    <label className={labelCls}>Select Country</label>
                    <SearchableSelect
                      options={countries}
                      value={newStateCountry}
                      onChange={setNewStateCountry}
                      placeholder="Select Country"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>State Name</label>
                    <input
                      type="text"
                      className={inputCls}
                      required
                      placeholder="e.g. Maharashtra"
                      value={newStateName}
                      onChange={(e) => setNewStateName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={labelCls}>State Code / abbreviation</label>
                    <input
                      type="text"
                      className={inputCls}
                      required
                      placeholder="e.g. MH"
                      value={newStateCode}
                      onChange={(e) => setNewStateCode(e.target.value)}
                    />
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-[13px] text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newStateActive}
                        onChange={(e) => setNewStateActive(e.target.checked)}
                        className="h-4 w-4 rounded"
                      />
                      Active for use
                    </label>
                  </div>

                  <div className="pt-6 flex items-center justify-end gap-3 border-t border-border mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setStateModalOpen(false);
                        setEditingState(null);
                        setNewStateName("");
                        setNewStateCode("");
                        setNewStateCountry("");
                        setNewStateActive(true);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm" disabled={saving}>
                      {saving ? "Saving..." : editingState ? "Update State" : "Create State"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Add/Edit language modal/drawer */}
      {langModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => {
              setLangModalOpen(false);
              setEditingLanguage(null);
              setNewLangName("");
              setNewLangCode("");
              setNewLangActive(true);
              setNewLangDefault(false);
            }}
          />

          {/* Drawer content */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-surface border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
              {/* Drawer Header */}
              <div className="p-6 border-b border-border bg-surface-2/30 flex items-start justify-between">
                <div>
                  <h2 className="text-[16px] font-bold text-text-primary">
                    {editingLanguage ? "Edit Language" : "Add Language"}
                  </h2>
                  <p className="text-[12.5px] text-text-secondary mt-1">
                    {editingLanguage ? "Modify the system language settings." : "Configure a new language for the platform."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setLangModalOpen(false);
                    setEditingLanguage(null);
                    setNewLangName("");
                    setNewLangCode("");
                    setNewLangActive(true);
                    setNewLangDefault(false);
                  }}
                  className="p-1 rounded-md text-text-secondary hover:bg-surface-2 hover:text-text-primary transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Form / Body */}
              <form onSubmit={handleCreateLanguage} className="flex-grow flex flex-col min-h-0">
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                  <div>
                    <label className={labelCls}>Language Name</label>
                    <input
                      type="text"
                      required
                      className={inputCls}
                      placeholder="e.g. Spanish"
                      value={newLangName}
                      onChange={(e) => setNewLangName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Language Code</label>
                    <input
                      type="text"
                      required
                      maxLength={8}
                      className={inputCls}
                      placeholder="e.g. es"
                      value={newLangCode}
                      onChange={(e) => setNewLangCode(e.target.value)}
                      disabled={!!editingLanguage}
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 text-[12.5px] text-text-secondary cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newLangActive}
                        onChange={(e) => setNewLangActive(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary/15 h-4 w-4"
                      />
                      Active
                    </label>
                    <label className="flex items-center gap-2 text-[12.5px] text-text-secondary cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newLangDefault}
                        onChange={(e) => setNewLangDefault(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary/15 h-4 w-4"
                        disabled={editingLanguage?.is_default}
                      />
                      Set Default
                    </label>
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="flex justify-end gap-2 p-6 border-t border-border bg-surface-2/10 mt-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setLangModalOpen(false);
                      setEditingLanguage(null);
                      setNewLangName("");
                      setNewLangCode("");
                      setNewLangActive(true);
                      setNewLangDefault(false);
                    }}
                    className="h-9 rounded-md border border-border px-4 text-[13px] hover:bg-surface-2 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-9 rounded-md bg-primary px-5 text-[13px] font-medium text-primary-foreground hover:bg-primary-pressed transition"
                  >
                    {editingLanguage ? "Save Changes" : "Add Language"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Configure Tax Modal/drawer */}
      {taxModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => {
              setTaxModalOpen(false);
              setEditingTax(null);
              setNewTaxName("");
              setNewTaxRate(0);
              setNewTaxType("percentage");
              setNewTaxStatus("active");
            }}
          />

          {/* Drawer content */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-surface border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
              {/* Drawer Header */}
              <div className="p-6 border-b border-border bg-surface-2/30 flex items-start justify-between">
                <div>
                  <h2 className="text-[16px] font-bold text-text-primary">
                    {editingTax ? "Edit Tax Configuration" : "Configure Tax"}
                  </h2>
                  <p className="text-[12.5px] text-text-secondary mt-1">
                    {editingTax ? "Update settings for the selected tax rate." : "Set up a new tax rate and rule for calculations."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setTaxModalOpen(false);
                    setEditingTax(null);
                    setNewTaxName("");
                    setNewTaxRate(0);
                    setNewTaxType("percentage");
                    setNewTaxStatus("active");
                  }}
                  className="p-1 rounded-md text-text-secondary hover:bg-surface-2 hover:text-text-primary transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Form / Body */}
              <form onSubmit={handleCreateTax} className="flex-grow flex flex-col min-h-0">
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                  <div>
                    <label className={labelCls}>Tax Name</label>
                    <input
                      type="text"
                      required
                      className={inputCls}
                      placeholder="e.g. VAT, GST, Service Tax"
                      value={newTaxName}
                      onChange={(e) => setNewTaxName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Tax Rate</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        className={inputCls}
                        value={newTaxRate}
                        onChange={(e) => setNewTaxRate(parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Tax Type</label>
                      <select
                        className={selectCls}
                        value={newTaxType}
                        onChange={(e) => setNewTaxType(e.target.value as any)}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Rate ({activeCurrency?.symbol || "$"})</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select
                      className={selectCls}
                      value={newTaxStatus}
                      onChange={(e) => setNewTaxStatus(e.target.value as any)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="flex justify-end gap-2 p-6 border-t border-border bg-surface-2/10 mt-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setTaxModalOpen(false);
                      setEditingTax(null);
                      setNewTaxName("");
                      setNewTaxRate(0);
                      setNewTaxType("percentage");
                      setNewTaxStatus("active");
                    }}
                    className="h-9 rounded-md border border-border px-4 text-[13px] hover:bg-surface-2 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-9 rounded-md bg-primary px-5 text-[13px] font-medium text-primary-foreground hover:bg-primary-pressed transition"
                  >
                    {editingTax ? "Save Changes" : "Configure"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal/drawer */}
      {docModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => {
              setDocModalOpen(false);
              setEditingDoc(null);
              setNewDocName("");
              setNewDocRequired(false);
              setNewDocExpiry(false);
            }}
          />

          {/* Drawer content */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-surface border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
              {/* Drawer Header */}
              <div className="p-6 border-b border-border bg-surface-2/30 flex items-start justify-between">
                <div>
                  <h2 className="text-[16px] font-bold text-text-primary">
                    {editingDoc ? "Edit Document Type" : "Add Document Type"}
                  </h2>
                  <p className="text-[12.5px] text-text-secondary mt-1">
                    {editingDoc ? "Modify requirement settings for this document." : "Register a new document requirement for guest check-in."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDocModalOpen(false);
                    setEditingDoc(null);
                    setNewDocName("");
                    setNewDocRequired(false);
                    setNewDocExpiry(false);
                  }}
                  className="p-1 rounded-md text-text-secondary hover:bg-surface-2 hover:text-text-primary transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Form / Body */}
              <form onSubmit={handleCreateDoc} className="flex-grow flex flex-col min-h-0">
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                  <div>
                    <label className={labelCls}>Document Type Name</label>
                    <input
                      type="text"
                      required
                      className={inputCls}
                      placeholder="e.g. Passport, National ID"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 text-[12.5px] text-text-secondary cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newDocRequired}
                        onChange={(e) => setNewDocRequired(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary/15 h-4 w-4"
                      />
                      Required
                    </label>
                    <label className="flex items-center gap-2 text-[12.5px] text-text-secondary cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newDocExpiry}
                        onChange={(e) => setNewDocExpiry(e.target.checked)}
                        className="rounded border-border text-primary focus:ring-primary/15 h-4 w-4"
                      />
                      Verify Expiry Date
                    </label>
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="flex justify-end gap-2 p-6 border-t border-border bg-surface-2/10 mt-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setDocModalOpen(false);
                      setEditingDoc(null);
                      setNewDocName("");
                      setNewDocRequired(false);
                      setNewDocExpiry(false);
                    }}
                    className="h-9 rounded-md border border-border px-4 text-[13px] hover:bg-surface-2 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-9 rounded-md bg-primary px-5 text-[13px] font-medium text-primary-foreground hover:bg-primary-pressed transition"
                  >
                    {editingDoc ? "Save Changes" : "Add Type"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Add/Edit Meal Plan modal/drawer */}

      {mealPlanModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => {
              setMealPlanModalOpen(false);
              setEditingMealPlan(null);
              setNewMealPlanName("");
              setNewMealPlanCode("");
              setNewMealPlanAdjustment(0);
              setNewMealPlanTax(0);
              setNewMealPlanActive(true);
            }}
          />

          {/* Drawer content */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-surface border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
              {/* Drawer Header */}
              <div className="p-6 border-b border-border bg-surface-2/30 flex items-start justify-between">
                <div>
                  <h2 className="text-[16px] font-bold text-text-primary">
                    {editingMealPlan ? "Edit Meal Plan" : "Add Meal Plan"}
                  </h2>
                  <p className="text-[12.5px] text-text-secondary mt-1">
                    {editingMealPlan ? "Modify system-wide meal plan parameters." : "Configure a new global meal plan configuration."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMealPlanModalOpen(false);
                    setEditingMealPlan(null);
                    setNewMealPlanName("");
                    setNewMealPlanCode("");
                    setNewMealPlanAdjustment(0);
                    setNewMealPlanTax(0);
                    setNewMealPlanActive(true);
                  }}
                  className="p-1 rounded-md text-text-secondary hover:bg-surface-2 hover:text-text-primary transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Form / Body */}
              <form onSubmit={handleSaveMealPlan} className="flex-grow flex flex-col min-h-0">
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                  <div>
                    <label className={labelCls}>Meal Plan Name</label>
                    <input
                      type="text"
                      required
                      className={inputCls}
                      placeholder="e.g. American Plan (Breakfast + Lunch + Dinner)"
                      value={newMealPlanName}
                      onChange={(e) => setNewMealPlanName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Meal Plan Code (Unique)</label>
                    <input
                      type="text"
                      required
                      className={inputCls}
                      placeholder="e.g. AP"
                      value={newMealPlanCode}
                      onChange={(e) => setNewMealPlanCode(e.target.value)}
                      disabled={!!editingMealPlan}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Base Price Adjustment (₹)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      className={inputCls}
                      value={newMealPlanAdjustment}
                      onChange={(e) => setNewMealPlanAdjustment(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Tax Percentage (%)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      className={inputCls}
                      value={newMealPlanTax}
                      onChange={(e) => setNewMealPlanTax(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-[13px] text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newMealPlanActive}
                        onChange={(e) => setNewMealPlanActive(e.target.checked)}
                        className="h-4 w-4 rounded"
                      />
                      Active for use
                    </label>
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="flex justify-end gap-2 p-6 border-t border-border bg-surface-2/10 mt-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setMealPlanModalOpen(false);
                      setEditingMealPlan(null);
                      setNewMealPlanName("");
                      setNewMealPlanCode("");
                      setNewMealPlanAdjustment(0);
                      setNewMealPlanTax(0);
                      setNewMealPlanActive(true);
                    }}
                    className="h-9 rounded-md border border-border px-4 text-[13px] hover:bg-surface-2 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-9 rounded-md bg-primary px-5 text-[13px] font-medium text-primary-foreground hover:bg-primary-pressed transition"
                  >
                    {editingMealPlan ? "Save Changes" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {amenityModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => {
              setAmenityModalOpen(false);
              setEditingAmenity(null);
              setNewAmenityName("");
              setNewAmenityCode("");
              setNewAmenityCategory("General");
            }}
          />

          {/* Drawer content */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-surface border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
              {/* Drawer Header */}
              <div className="p-6 border-b border-border bg-surface-2/30 flex items-start justify-between">
                <div>
                  <h2 className="text-[16px] font-bold text-text-primary">
                    {editingAmenity ? "Edit Amenity" : "Add Amenity"}
                  </h2>
                  <p className="text-[12.5px] text-text-secondary mt-1">
                    {editingAmenity ? "Update global amenity configuration." : "Register a new amenity that can be assigned to properties."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAmenityModalOpen(false);
                    setEditingAmenity(null);
                    setNewAmenityName("");
                    setNewAmenityCode("");
                    setNewAmenityCategory("General");
                  }}
                  className="p-1 rounded-md text-text-secondary hover:bg-surface-2 hover:text-text-primary transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Form / Body */}
              <form onSubmit={handleCreateAmenity} className="flex-grow flex flex-col min-h-0">
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                  <div>
                    <label className={labelCls}>Amenity Name</label>
                    <input
                      type="text"
                      required
                      className={inputCls}
                      placeholder="e.g. Free Wi-Fi, Sea View"
                      value={newAmenityName}
                      onChange={(e) => setNewAmenityName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Code (Unique)</label>
                    <input
                      type="text"
                      required
                      className={inputCls}
                      placeholder="e.g. WIFI, SEA_VIEW"
                      value={newAmenityCode}
                      onChange={(e) => setNewAmenityCode(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <select
                      className={selectCls}
                      value={newAmenityCategory}
                      onChange={(e) => setNewAmenityCategory(e.target.value)}
                    >
                      <option value="General">General</option>
                      <option value="Bathroom">Bathroom</option>
                      <option value="Bedroom">Bedroom</option>
                      <option value="Kitchen">Kitchen</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Services">Services</option>
                      <option value="View">View</option>
                    </select>
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="flex justify-end gap-2 p-6 border-t border-border bg-surface-2/10 mt-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setAmenityModalOpen(false);
                      setEditingAmenity(null);
                      setNewAmenityName("");
                      setNewAmenityCode("");
                      setNewAmenityCategory("General");
                    }}
                    className="h-9 rounded-md border border-border px-4 text-[13px] hover:bg-surface-2 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-9 rounded-md bg-primary px-5 text-[13px] font-medium text-primary-foreground hover:bg-primary-pressed transition"
                  >
                    {editingAmenity ? "Save Changes" : "Register"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Booking Source modal/drawer */}
      {bookingSourceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => {
              setBookingSourceModalOpen(false);
              setEditingBookingSource(null);
              setNewSourceName("");
              setNewSourceIcon("");
              setNewSourceDetails("");
              setNewSourceActive(true);
            }}
          />

          {/* Drawer content */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-surface border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
              {/* Drawer Header */}
              <div className="p-6 border-b border-border bg-surface-2/30 flex items-start justify-between">
                <div>
                  <h2 className="text-[16px] font-bold text-text-primary">
                    {editingBookingSource ? "Edit Booking Source" : "Add Booking Source"}
                  </h2>
                  <p className="text-[12.5px] text-text-secondary mt-1">
                    {editingBookingSource ? "Modify global booking channel configurations." : "Configure a new global booking source."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setBookingSourceModalOpen(false);
                    setEditingBookingSource(null);
                    setNewSourceName("");
                    setNewSourceIcon("");
                    setNewSourceDetails("");
                    setNewSourceActive(true);
                  }}
                  className="p-1 rounded-md text-text-secondary hover:bg-surface-2 hover:text-text-primary transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Form / Body */}
              <form onSubmit={handleSaveBookingSource} className="flex-grow flex flex-col min-h-0">
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                  <div>
                    <label className={labelCls}>Source Name</label>
                    <input
                      type="text"
                      required
                      className={inputCls}
                      placeholder="e.g. Booking.com"
                      value={newSourceName}
                      onChange={(e) => setNewSourceName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Upload Icon / Image</label>
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
                      <label className="cursor-pointer bg-surface-2 hover:bg-surface-3 border border-border rounded-md px-3 py-1.5 text-[12.5px] font-semibold text-text-primary transition">
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
                          className="text-[12.5px] text-destructive hover:underline font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Details / Description</label>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="e.g. Online Travel Agency channel integration"
                      value={newSourceDetails}
                      onChange={(e) => setNewSourceDetails(e.target.value)}
                    />
                  </div>
                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-[13px] text-text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSourceActive}
                        onChange={(e) => setNewSourceActive(e.target.checked)}
                        className="h-4 w-4 rounded"
                      />
                      Active for use
                    </label>
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="flex justify-end gap-2 p-6 border-t border-border bg-surface-2/10 mt-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setBookingSourceModalOpen(false);
                      setEditingBookingSource(null);
                      setNewSourceName("");
                      setNewSourceIcon("");
                      setNewSourceDetails("");
                      setNewSourceActive(true);
                    }}
                    className="h-9 rounded-md border border-border px-4 text-[13px] hover:bg-surface-2 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-9 rounded-md bg-primary px-5 text-[13px] font-medium text-primary-foreground hover:bg-primary-pressed transition"
                  >
                    {editingBookingSource ? "Save Changes" : "Register"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal (Superadmin) */}
      {paymentGatewayModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm">
          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md bg-surface shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-border bg-surface">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">
                    {editingGateway ? "Edit Payment Gateway" : "Add Payment Gateway"}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Configure global payment gateway settings & upload logo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPaymentGatewayModalOpen(false)}
                  className="rounded-md p-1 text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSavePaymentGateway} className="flex-1 flex flex-col overflow-y-auto p-6 space-y-4">
                <div>
                  <label className={labelCls}>Gateway Name</label>
                  <input
                    type="text"
                    required
                    value={gwName}
                    onChange={(e) => setGwName(e.target.value)}
                    placeholder="e.g. Razorpay Checkout"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>System Code</label>
                  <input
                    type="text"
                    required
                    value={gwCode}
                    onChange={(e) => setGwCode(e.target.value.toLowerCase())}
                    placeholder="e.g. razorpay"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Subtitle / Description</label>
                  <input
                    type="text"
                    value={gwSubtitle}
                    onChange={(e) => setGwSubtitle(e.target.value)}
                    placeholder="e.g. UPI, Cards, NetBanking, Wallets"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Badge Label</label>
                  <input
                    type="text"
                    value={gwBadge}
                    onChange={(e) => setGwBadge(e.target.value)}
                    placeholder="e.g. RECOMMENDED, SECURE, DIRECT"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Logo Image / SVG Upload</label>
                  <div className="mt-1 flex items-center gap-3">
                    {gwLogoUrl ? (
                      <img src={gwLogoUrl} alt="Logo preview" className="h-10 w-auto object-contain p-1 border border-border rounded bg-surface-2" />
                    ) : (
                      <div className="h-10 w-10 border border-dashed border-border rounded flex items-center justify-center text-[10px] text-text-muted">
                        No Logo
                      </div>
                    )}
                    <label className="cursor-pointer bg-surface-2 hover:bg-surface-3 border border-border rounded-md px-3 py-1.5 text-[12px] font-semibold text-text-primary transition">
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*,.svg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              toast.error("Logo file must be under 2MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setGwLogoUrl(reader.result as string);
                              toast.success("Logo uploaded!");
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={gwLogoUrl}
                    onChange={(e) => setGwLogoUrl(e.target.value)}
                    placeholder="Or paste Logo Image URL / SVG string"
                    className={`${inputCls} mt-2`}
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-[13px] text-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gwActive}
                      onChange={(e) => setGwActive(e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                    Active for Tenant Enablement
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-6 border-t border-border mt-auto">
                  <Button type="button" variant="outline" onClick={() => setPaymentGatewayModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingGateway ? "Save Changes" : "Create Gateway"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Currency Modal (Right-Side Slide-Over Sheet) */}
      {isAddCurrencyModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsAddCurrencyModalOpen(false)}
          />
          {/* Right-Side Drawer Panel */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md transform bg-surface p-6 shadow-2xl transition-transform animate-in slide-in-from-right flex flex-col justify-between border-l border-border">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" /> Create New Currency
                    </h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Select country of origin and configure currency details.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddCurrencyModalOpen(false)}
                    className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-2 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form id="create-currency-form" onSubmit={handleCreateCurrency} className="space-y-4 mt-5">
                  <div>
                    <label className={labelCls}>
                      Country of Origin <span className="text-error">*</span>
                    </label>
                    <select
                      className={selectCls}
                      value={newCurrencyCountry}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        setNewCurrencyCountry(selectedId);
                      }}
                      required
                    >
                      <option value="">-- Select Country --</option>
                      {countries.map((c) => (
                        <option key={c.id || c.code} value={c.id || c.code}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>
                      Currency Code (ISO) <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      className={inputCls}
                      placeholder="e.g. USD, INR, EUR, AED"
                      value={newCurrencyCode}
                      onChange={(e) => setNewCurrencyCode(e.target.value.toUpperCase())}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelCls}>
                      Currency Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="e.g. US Dollar, Indian Rupee, UAE Dirham"
                      value={newCurrencyName}
                      onChange={(e) => setNewCurrencyName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Currency Symbol</label>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="e.g. $, ₹, €, £, د.إ"
                      value={newCurrencySymbol}
                      onChange={(e) => setNewCurrencySymbol(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="curr-active"
                      checked={newCurrencyIsActive}
                      onChange={(e) => setNewCurrencyIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="curr-active" className="text-xs font-medium text-text-primary cursor-pointer">
                      Mark as Active Currency
                    </label>
                  </div>
                </form>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddCurrencyModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="create-currency-form"
                  variant="primary"
                  disabled={creatingCurrency}
                >
                  {creatingCurrency ? "Creating..." : "Create Currency"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROOM CATEGORY MODAL */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-base font-bold text-text-primary">
                {editingCat ? "Edit Room Category" : "Add Room Category"}
              </h3>
              <button
                onClick={() => setCatModalOpen(false)}
                className="rounded p-1 text-text-secondary hover:bg-surface-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveRoomCategory} className="space-y-4">
              <div>
                <label className={labelCls}>Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hotel Room, Luxury Suite, Villa"
                  className={inputCls}
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    if (!editingCat) {
                      setNewCatCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "_"));
                    }
                  }}
                />
              </div>

              <div>
                <label className={labelCls}>Category Code (Unique) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. hotel_room, villa, suite"
                  className={`${inputCls} font-mono uppercase`}
                  value={newCatCode}
                  onChange={(e) => setNewCatCode(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="h-9 rounded-md border border-border bg-surface px-4 text-[13px] font-medium text-text-secondary hover:bg-surface-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 rounded-md bg-primary px-4 text-[13px] font-semibold text-white hover:bg-primary-pressed shadow-md"
                >
                  {editingCat ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperadminSettingsComponent;
