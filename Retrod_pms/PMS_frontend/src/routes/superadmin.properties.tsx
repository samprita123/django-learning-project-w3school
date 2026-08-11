import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Home, MapPin, Mail, Phone, Edit, Trash2, ShieldAlert, ArrowLeft, Building2 } from "lucide-react";
import { PageHeader, Card, Button } from "@/components/ui/Primitives";
import { propertyApi, type SuperadminProperty } from "@/services/api/property";
import { tenantApi, type Tenant, type TenantSubscription } from "@/services/api/tenant";
import { subscriptionApi, type SubscriptionPlan } from "@/services/api/subscription";
import { referenceApi, type Country, type State, type Currency, type Timezone } from "@/services/api/reference";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { PLATFORM_APPLICATIONS } from "@/features/retrod-one/lib/access";
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

export const Route = createFileRoute("/superadmin/properties")({
  head: () => ({ meta: [{ title: "Property Onboarding — Superadmin" }] }),
  component: SuperadminPropertiesComponent,
});

function SuperadminPropertiesComponent() {
  const { user: authUser, updateUser } = useAuth();
  const [properties, setProperties] = useState<SuperadminProperty[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [timezones, setTimezones] = useState<Timezone[]>([]);
  const [tenantSubscriptions, setTenantSubscriptions] = useState<TenantSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  // Modal / Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<SuperadminProperty | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [accessProperty, setAccessProperty] = useState<SuperadminProperty | null>(null);
  const [isLookingUpPin, setIsLookingUpPin] = useState(false);

  // Form Fields State
  const [formFields, setFormFields] = useState<Partial<SuperadminProperty>>({
    tenant: "",
    name: "",
    property_type: "HOTEL",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    contact_email: "",
    contact_phone: "",
    currency: "USD",
    timezone: "UTC",
    image_url: "",
    is_active: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [propsData, tenantsData, countriesData, statesData, currenciesData, timezonesData, subscriptionsData, plansData, productsData] = await Promise.all([
        propertyApi.getSuperadminProperties(),
        tenantApi.getTenants(),
        referenceApi.getCountries(true).catch(() => []),
        referenceApi.getStates(undefined, true).catch(() => []),
        referenceApi.getCurrencies(true).catch(() => []),
        referenceApi.getTimezones(true).catch(() => []),
        tenantApi.getAllTenantSubscriptions().catch(() => []),
        subscriptionApi.getPlans().catch(() => []),
        subscriptionApi.getProducts().catch(() => []),
      ]);
      setProperties(propsData);
      setTenants(tenantsData);
      setCountries(countriesData);
      setStates(statesData);
      setCurrencies(currenciesData);
      setTimezones(timezonesData);
      setTenantSubscriptions(subscriptionsData);
      setPlans(plansData);
      setProducts(productsData);
    } catch (err: any) {
      toast.error("Failed to load property/tenant data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Count properties per tenant helper
  const tenantPropertyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    properties.forEach((p) => {
      if (p.tenant) {
        counts[p.tenant] = (counts[p.tenant] || 0) + 1;
      }
    });
    return counts;
  }, [properties]);

  // Top level tenant filtering based on search
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const term = search.toLowerCase();
      const hasMatchingProps = properties.some(
        (p) => p.tenant === t.id && p.name.toLowerCase().includes(term)
      );
      return (
        (t.name || "").toLowerCase().includes(term) ||
        (t.schema_name || "").toLowerCase().includes(term) ||
        (t.domain_url || "").toLowerCase().includes(term) ||
        hasMatchingProps
      );
    });
  }, [tenants, properties, search]);

  // Selected tenant properties filtering
  const tenantProperties = useMemo(() => {
    if (!selectedTenantId) return [];
    return properties.filter((p) => p.tenant === selectedTenantId && (
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.city || "").toLowerCase().includes(search.toLowerCase())
    ));
  }, [properties, selectedTenantId, search]);

  const selectedTenant = useMemo(() => {
    return tenants.find((t) => t.id === selectedTenantId);
  }, [tenants, selectedTenantId]);

  const handleOpenNew = () => {
    setEditingProperty(null);
    const defaultCountryObj = countries.find(c => c.code === "IN" || c.name.toLowerCase() === "india") || countries[0];
    const defaultCountryName = defaultCountryObj ? defaultCountryObj.name : "";
    const defaultCountryCode = defaultCountryObj ? defaultCountryObj.code : "";

    const defaultCurr = currencies.find(c => c.code === "INR")?.code || currencies[0]?.code || "USD";
    const defaultTz = timezones.find(t => t.code === "Asia/Kolkata")?.code || timezones[0]?.code || "UTC";

    setFormFields({
      tenant: selectedTenantId || tenants[0]?.id || "",
      name: "",
      property_type: "HOTEL",
      address_line_1: "",
      address_line_2: "",
      city: "",
      state: "",
      country: defaultCountryName || defaultCountryCode,
      postal_code: "",
      contact_email: "",
      contact_phone: "",
      currency: defaultCurr,
      timezone: defaultTz,
      image_url: "",
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (prop: SuperadminProperty) => {
    setEditingProperty(prop);
    setFormFields({
      tenant: prop.tenant,
      name: prop.name,
      property_type: prop.property_type,
      address_line_1: prop.address_line_1,
      address_line_2: prop.address_line_2 || "",
      city: prop.city,
      state: prop.state,
      country: prop.country,
      postal_code: prop.postal_code,
      contact_email: prop.contact_email,
      contact_phone: prop.contact_phone,
      currency: prop.currency,
      timezone: prop.timezone,
      image_url: prop.image_url || "",
      is_active: prop.is_active,
    });
    setModalOpen(true);
  };

  const handleOpenAccess = (prop: SuperadminProperty) => {
    setAccessProperty(prop);
    setAccessModalOpen(true);
  };

  const accessApps = useMemo(() => {
    if (!accessProperty) return { subscribed: [], other: [] };

    const activeSub = tenantSubscriptions.find(
      (sub) => sub.tenant === accessProperty.tenant && sub.status === "ACTIVE"
    );

    let subscribedKeys: string[] = [];
    if (activeSub) {
      const plan = plans.find((p) => p.id === activeSub.plan || p.name === activeSub.plan_name);
      if (plan) {
        subscribedKeys = (plan.products || []).map((p) => p.code.toLowerCase());
      }
    }

    const subscribed: typeof PLATFORM_APPLICATIONS = [];
    const other: typeof PLATFORM_APPLICATIONS = [];

    const dbProductCodes = products.map((p) => p.code.toLowerCase());

    const keyToProductCodeMap: Record<string, string[]> = {
      pms: ["pms"],
      pos: ["pos"],
      crm: ["crm"],
      analytics: ["analytics"],
      reports: ["reports"],
      channelManager: ["channel_manager", "channelmanager", "channel manager"],
      bookingEngine: ["booking_engine", "bookingengine"],
      aiHub: ["ai_hub", "aihub", "revenue_management"],
    };

    // Filter PLATFORM_APPLICATIONS to only show those that exist in the database
    const dbMatchedApps = PLATFORM_APPLICATIONS.filter((app) => {
      if (app.key === "superadmin") return false;
      const productCodes = keyToProductCodeMap[app.key] || [app.key.toLowerCase()];
      return productCodes.some((code) => dbProductCodes.includes(code));
    });

    dbMatchedApps.forEach((app) => {
      const productCodes = keyToProductCodeMap[app.key] || [app.key.toLowerCase()];
      const isSubscribed = productCodes.some((code) => subscribedKeys.includes(code));
      if (isSubscribed) {
        subscribed.push(app);
      } else {
        other.push(app);
      }
    });

    return { subscribed, other };
  }, [accessProperty, tenantSubscriptions, plans, products]);

  const handleLaunchApp = (app: typeof PLATFORM_APPLICATIONS[0]) => {
    if (!accessProperty || !authUser) return;

    const tenantObj = tenants.find((t) => t.id === accessProperty.tenant);
    if (!tenantObj) return;

    // Update user active property context
    updateUser(authUser.id, { property: accessProperty.name });

    // Redirect to select subdomain context
    const redirectUrl = `${app.route}?subdomain=${tenantObj.schema_name}`;
    window.location.assign(redirectUrl);
  };


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await propertyApi.uploadPropertyImage(file);
      setFormFields((prev) => ({ ...prev, image_url: res.image_url }));
      toast.success("Image uploaded successfully.");
    } catch (err: any) {
      toast.error("Failed to upload image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Filter states based on currently selected Country
  const filteredStates = useMemo(() => {
    if (!formFields.country) return states;
    const selectedCountryObj = countries.find(
      (c) => c.code.toLowerCase() === formFields.country?.toLowerCase() || c.name.toLowerCase() === formFields.country?.toLowerCase()
    );
    if (!selectedCountryObj) return states;
    const countryCode = selectedCountryObj.code.toLowerCase();
    const countryName = selectedCountryObj.name.toLowerCase();

    const matched = states.filter((s) => {
      const sCountry = (s.country || "").toLowerCase();
      const sCountryName = (s.country_name || "").toLowerCase();
      return sCountry === countryCode || sCountryName === countryName || sCountry === selectedCountryObj.id;
    });

    return matched.length > 0 ? matched : states;
  }, [states, countries, formFields.country]);

  // Handle Country selection with automatic Currency & Timezone binding
  const handleCountryChange = (countryVal: string) => {
    const selectedCountryObj = countries.find(
      (c) => c.code === countryVal || c.name.toLowerCase() === countryVal.toLowerCase()
    );
    const countryCode = selectedCountryObj ? selectedCountryObj.code.toUpperCase() : countryVal.toUpperCase();
    const countryName = selectedCountryObj ? selectedCountryObj.name : countryVal;

    let targetCurrency = formFields.currency || "";
    let targetTimezone = formFields.timezone || "";

    if (countryCode === "IN" || countryName.toLowerCase().includes("india")) {
      targetCurrency = "INR";
      targetTimezone = "Asia/Kolkata";
    } else if (countryCode === "US" || countryName.toLowerCase().includes("united states")) {
      targetCurrency = "USD";
      targetTimezone = "America/New_York";
    } else if (countryCode === "GB" || countryName.toLowerCase().includes("united kingdom")) {
      targetCurrency = "GBP";
      targetTimezone = "Europe/London";
    } else if (countryCode === "CA" || countryName.toLowerCase().includes("canada")) {
      targetCurrency = "CAD";
      targetTimezone = "America/Toronto";
    } else if (countryCode === "AU" || countryName.toLowerCase().includes("australia")) {
      targetCurrency = "AUD";
      targetTimezone = "Australia/Sydney";
    } else if (["FR", "DE", "ES", "IT", "NL", "BE", "AT", "EU"].includes(countryCode)) {
      targetCurrency = "EUR";
      targetTimezone = "Europe/Paris";
    } else {
      const cMatch = currencies.find((c) => c.code.includes(countryCode));
      if (cMatch) targetCurrency = cMatch.code;
      const tMatch = timezones.find((t) => t.code.toLowerCase().includes(countryCode.toLowerCase()));
      if (tMatch) targetTimezone = tMatch.code;
    }

    if (currencies.length > 0 && !currencies.some((c) => c.code === targetCurrency)) {
      targetCurrency = currencies[0].code;
    }
    if (timezones.length > 0 && !timezones.some((t) => t.code === targetTimezone)) {
      targetTimezone = timezones[0].code;
    }

    setFormFields((prev) => ({
      ...prev,
      country: countryName,
      state: "",
      currency: targetCurrency,
      timezone: targetTimezone,
    }));
  };

  // Free Postal Code / Pincode Auto-Fill Lookup Function (using Zippopotam.us & India Post free APIs)
  const handlePostalCodeLookup = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed || trimmed.length < 3) return;

    setIsLookingUpPin(true);
    try {
      const currentCountryObj = countries.find(
        (c) => c.name.toLowerCase() === (formFields.country || "").toLowerCase() || c.code.toLowerCase() === (formFields.country || "").toLowerCase()
      );
      let countryCode = currentCountryObj ? currentCountryObj.code.toLowerCase() : "in";

      let fetchedCity = "";
      let fetchedState = "";
      let fetchedCountry = "";

      // 1. Try India Post API for 6-digit Indian PIN codes
      if (/^\d{6}$/.test(trimmed) || countryCode === "in") {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${trimmed}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
              const po = data[0].PostOffice[0];
              fetchedCity = po.District || po.Name || "";
              fetchedState = po.State || "";
              fetchedCountry = po.Country || "India";
            }
          }
        } catch {
          // fallback
        }
      }

      // 2. Fallback to Zippopotam.us for global postal codes
      if (!fetchedState) {
        try {
          const zipRes = await fetch(`https://api.zippopotam.us/${countryCode}/${trimmed}`);
          if (zipRes.ok) {
            const zipData = await zipRes.json();
            if (zipData?.places?.length > 0) {
              const place = zipData.places[0];
              fetchedCity = place["place name"] || "";
              fetchedState = place["state"] || place["state abbreviation"] || "";
              fetchedCountry = zipData["country"] || "";
            }
          }
        } catch {
          // ignore
        }
      }

      if (fetchedState || fetchedCity) {
        const matchedCountryObj = countries.find(
          (c) => c.name.toLowerCase() === fetchedCountry.toLowerCase() || c.code.toLowerCase() === countryCode
        ) || currentCountryObj || countries[0];

        const targetCountryName = matchedCountryObj ? matchedCountryObj.name : (fetchedCountry || formFields.country);
        const targetCountryCode = matchedCountryObj ? matchedCountryObj.code : countryCode.toUpperCase();

        const targetStateMatch = states.find(
          (s) => s.name.toLowerCase() === fetchedState.toLowerCase() || s.code.toLowerCase() === fetchedState.toLowerCase()
        );
        const targetStateName = targetStateMatch ? targetStateMatch.name : fetchedState;

        let targetCurrency = formFields.currency;
        let targetTimezone = formFields.timezone;

        if (targetCountryCode === "IN") {
          targetCurrency = "INR";
          targetTimezone = "Asia/Kolkata";
        } else if (targetCountryCode === "US") {
          targetCurrency = "USD";
          targetTimezone = "America/New_York";
        } else if (targetCountryCode === "GB") {
          targetCurrency = "GBP";
          targetTimezone = "Europe/London";
        } else if (targetCountryCode === "CA") {
          targetCurrency = "CAD";
          targetTimezone = "America/Toronto";
        } else if (targetCountryCode === "AU") {
          targetCurrency = "AUD";
          targetTimezone = "Australia/Sydney";
        } else if (["FR", "DE", "ES", "IT", "NL", "BE", "AT", "EU"].includes(targetCountryCode)) {
          targetCurrency = "EUR";
          targetTimezone = "Europe/Paris";
        }

        setFormFields((prev) => ({
          ...prev,
          country: targetCountryName,
          state: targetStateName || prev.state,
          city: fetchedCity || prev.city,
          currency: targetCurrency || prev.currency,
          timezone: targetTimezone || prev.timezone,
        }));

        toast.success(`Location auto-filled for Pincode ${trimmed}: ${fetchedCity ? fetchedCity + ", " : ""}${targetStateName}`);
      }
    } catch {
      // ignore
    } finally {
      setIsLookingUpPin(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFields.tenant || !formFields.name || !formFields.address_line_1 || !formFields.city || !formFields.state || !formFields.country || !formFields.contact_email || !formFields.contact_phone) {
      toast.error("Please fill out all required fields.");
      return;
    }

    // Phone Number Validation: 7 to 15 digits
    const phoneTrimmed = (formFields.contact_phone || "").trim();
    const digitsOnly = phoneTrimmed.replace(/\D/g, "");
    const isValidPhone = /^\+?[0-9\s\-()]{7,20}$/.test(phoneTrimmed) && digitsOnly.length >= 7 && digitsOnly.length <= 15;

    if (!isValidPhone) {
      toast.error("Invalid contact phone number. Must contain 7 to 15 digits (e.g. +91 98765 43210 or 9876543210).");
      return;
    }

    try {
      if (editingProperty && editingProperty.id) {
        await propertyApi.updateSuperadminProperty(editingProperty.id, formFields);
        toast.success("Property updated successfully.");
      } else {
        await propertyApi.createSuperadminProperty(formFields as any);
        toast.success("Property onboarded successfully.");
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error("Failed to save property: " + err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await propertyApi.deleteSuperadminProperty(deleteTargetId);
      toast.success("Property deleted successfully.");
      setDeleteTargetId(null);
      loadData();
    } catch (err: any) {
      toast.error("Failed to delete property: " + err.message);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Superadmin Operations"
        title="Property Onboarding & Management"
        description="Onboard new hotel properties, villas, or guest houses and assign them to any tenant system."
      />

      <div className="responsive-page-x py-6 space-y-6">
        
        {/* Improvised Premium Search Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-surface-2/40 backdrop-blur-md p-4 rounded-2xl border border-border/80 shadow-sm">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-disabled" />
            <input
              type="text"
              placeholder={selectedTenantId ? `Search properties in ${selectedTenant?.name}...` : "Search tenants or properties..."}
              className="w-full bg-surface/90 border border-border hover:border-text-disabled focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full py-2.5 pl-11 pr-4 text-[13.5px] transition-all outline-none text-text-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={handleOpenNew} className="flex items-center gap-2 rounded-full px-5 py-2.5 font-medium transition hover:scale-[1.01]">
            <Plus className="h-4.5 w-4.5" />
            Onboard Property
          </Button>
        </div>

        {/* Selected Tenant Properties view */}
        {selectedTenantId ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedTenantId(null);
                  setSearch("");
                }}
                className="flex items-center justify-center h-9 w-9 rounded-full bg-surface-2 hover:bg-surface-3 border border-border text-text-secondary transition"
                title="Back to all tenants"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary shrink-0" />
                  {selectedTenant?.name}
                </h2>
                <p className="text-[12px] text-text-secondary">
                  Showing properties registered under schema <span className="font-semibold">{selectedTenant?.schema_name}</span>
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-[13px] text-text-secondary">Loading properties...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenantProperties.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-[13px] text-text-secondary">
                    No properties onboarded yet for this tenant. Click "Onboard Property" to add one.
                  </div>
                ) : (
                  tenantProperties.map((prop) => (
                    <Card key={prop.id} className="overflow-hidden flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                      <div>
                        {prop.image_url ? (
                          <img
                            src={prop.image_url}
                            alt={prop.name}
                            className="h-44 w-full object-cover"
                          />
                        ) : (
                          <div className="h-44 w-full bg-gradient-to-br from-primary/10 to-primary-tint/20 flex items-center justify-center text-primary/40">
                            <Home className="h-12 w-12 stroke-[1.5]" />
                          </div>
                        )}
                        <div className="p-5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                              {(prop.property_type || "Hotel").replace("_", " ")}
                            </span>
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                                prop.is_active ? "bg-[oklch(0.62_0.17_150)]/15 text-[oklch(0.62_0.17_150)]" : "bg-red-500/10 text-red-500"
                              }`}
                            >
                              {prop.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <h3 className="mt-3 text-base font-bold text-text-primary flex items-center gap-2">
                            <Home className="h-4.5 w-4.5 text-primary shrink-0" />
                            {prop.name}
                          </h3>

                          <div className="mt-4 space-y-2 text-[12px] text-text-secondary">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-text-disabled shrink-0 mt-0.5" />
                              <span>
                                {prop.address_line_1}
                                {prop.address_line_2 ? `, ${prop.address_line_2}` : ""}, {prop.city}, {prop.state}, {prop.country} - {prop.postal_code}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-text-disabled shrink-0" />
                              <span className="truncate">{prop.contact_email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-text-disabled shrink-0" />
                              <span>{prop.contact_phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mx-5 mb-5 pt-4 border-t border-border flex justify-between items-center text-[11px]">
                        <div className="text-text-disabled">
                          {prop.currency} • {prop.timezone}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            onClick={() => handleOpenAccess(prop)}
                            className="h-7 text-[11px] px-3 py-0 rounded-full font-bold bg-primary/10 hover:bg-primary border border-primary/20 hover:border-transparent text-primary hover:text-primary-foreground transition-all duration-200 shadow-sm flex items-center justify-center shrink-0"
                          >
                            Access
                          </Button>
                          <button
                            onClick={() => handleOpenEdit(prop)}
                            className="p-1.5 rounded hover:bg-surface-3 text-text-secondary transition"
                            title="Edit Details"
                          >
                            <Edit className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(prop.id || null)}
                            className="p-1.5 rounded hover:bg-red-500/10 text-red-500 transition"
                            title="Delete Property"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          /* Top level Tenant Grouping Grid view (Uses plain div to register click events cleanly) */
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Select Tenant to view properties
            </h2>

            {loading ? (
              <div className="text-center py-12 text-[13px] text-text-secondary">Loading tenants...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTenants.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-[13px] text-text-secondary">
                    No tenants found matching search criteria.
                  </div>
                ) : (
                  filteredTenants.map((tenant) => {
                    const propCount = tenantPropertyCounts[tenant.id] || 0;
                    return (
                      <div
                        key={tenant.id}
                        onClick={() => setSelectedTenantId(tenant.id)}
                        className="rounded-lg border border-border bg-surface shadow-e1 p-6 cursor-pointer hover:shadow-md hover:border-primary/50 hover:bg-surface-2/20 transition-all duration-200 group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                              <Building2 className="h-6 w-6" />
                            </div>
                            <span
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                propCount > 0
                                  ? "bg-[oklch(0.62_0.17_150)]/10 text-[oklch(0.62_0.17_150)]"
                                  : "bg-surface-3 text-text-disabled"
                              }`}
                            >
                              {propCount} {propCount === 1 ? "Property" : "Properties"}
                            </span>
                          </div>

                          <h3 className="mt-4 text-base font-bold text-text-primary group-hover:text-primary transition-colors">
                            {tenant.name}
                          </h3>

                          <div className="mt-2 space-y-1 text-[12px] text-text-secondary">
                            <p>
                              Schema: <span className="font-mono text-text-primary">{tenant.schema_name}</span>
                            </p>
                            <p className="truncate">
                              Domain: <span className="text-text-primary">{tenant.domain_url}</span>
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 pt-3 border-t border-border flex justify-end text-[11px] font-medium text-primary group-hover:translate-x-1 transition-transform">
                          View Properties →
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Onboard / Edit Property Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <Card className="w-full max-w-2xl bg-surface-2 border border-border/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh] rounded-2xl">
            <div className="px-6 py-4 border-b border-border bg-surface flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-bold text-text-primary">
                  {editingProperty ? "Edit Property Settings" : "Onboard New Property"}
                </h2>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Configure structural settings, geolocation, and dynamic contact bindings.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-surface-3 text-text-disabled hover:text-text-primary text-[14px] transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden bg-surface-2/40">
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                
                {/* Section 1: Basic Information Card */}
                <div className="bg-surface border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider border-b border-border/60 pb-2">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tenant Selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">
                        Assign to Tenant *
                      </label>
                      <select
                        className="h-10 w-full rounded-lg border border-border/80 bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                        value={formFields.tenant}
                        onChange={(e) => setFormFields({ ...formFields, tenant: e.target.value })}
                        required
                      >
                        <option value="" disabled>Select Tenant</option>
                        {tenants.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.schema_name})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Property Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">
                        Property Name *
                      </label>
                      <input
                        type="text"
                        className="h-10 w-full rounded-lg border border-border/80 bg-surface px-3.5 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                        placeholder="Grand Palace Resort"
                        value={formFields.name}
                        onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                        required
                      />
                    </div>

                    {/* Property Type */}
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">
                        Property Type *
                      </label>
                      <select
                        className="h-10 w-full rounded-lg border border-border/80 bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                        value={formFields.property_type}
                        onChange={(e) => setFormFields({ ...formFields, property_type: e.target.value })}
                        required
                      >
                        <option value="HOTEL">Hotel</option>
                        <option value="VILLA">Villa</option>
                        <option value="VACATION_RENTAL">Vacation Rental</option>
                        <option value="HOSTEL">Hostel</option>
                        <option value="APARTMENT">Apartment</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    {/* Status Toggle */}
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">
                        Status
                      </label>
                      <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/80 bg-surface-2/40 h-10">
                        <input
                          type="checkbox"
                          id="is_active"
                          className="rounded border-border text-primary focus:ring-primary h-4.5 w-4.5 bg-surface cursor-pointer"
                          checked={formFields.is_active}
                          onChange={(e) => setFormFields({ ...formFields, is_active: e.target.checked })}
                        />
                        <label htmlFor="is_active" className="text-[12.5px] font-medium text-text-primary cursor-pointer select-none">
                          Property Active
                        </label>
                      </div>
                    </div>

                    {/* Property Image Upload */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">
                        Property Image
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-dashed border-border bg-surface-2/20">
                        {formFields.image_url ? (
                          <div className="relative h-24 w-40 rounded-lg overflow-hidden border border-border group shrink-0">
                            <img
                              src={formFields.image_url}
                              alt="Property Preview"
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setFormFields((prev) => ({ ...prev, image_url: "" }))}
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-medium transition-opacity"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <div className="h-24 w-40 rounded-lg bg-surface border border-border flex flex-col items-center justify-center text-text-disabled shrink-0">
                            <Home className="h-8 w-8 stroke-[1.2]" />
                            <span className="text-[10px] mt-1">No Image Selected</span>
                          </div>
                        )}
                        <div className="flex-1 space-y-1 text-center sm:text-left w-full">
                          <label className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-border bg-surface hover:bg-surface-2 text-[12.5px] font-medium text-text-primary cursor-pointer transition shadow-sm">
                            <span>{uploading ? "Uploading..." : "Select from Local Folder"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                              disabled={uploading}
                            />
                          </label>
                          <p className="text-[10.5px] text-text-secondary">
                            Supported formats: JPG, PNG, WEBP. Max size 5MB.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Address & Location Card */}
                <div className="bg-surface border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider border-b border-border/60 pb-2">
                    Address & Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">Address Line 1 *</label>
                      <input
                        type="text"
                        className="h-10 w-full rounded-lg border border-border/80 bg-surface px-3.5 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                        placeholder="123 Main St"
                        value={formFields.address_line_1}
                        onChange={(e) => setFormFields({ ...formFields, address_line_1: e.target.value })}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">Address Line 2</label>
                      <input
                        type="text"
                        className="h-10 w-full rounded-lg border border-border/80 bg-surface px-3.5 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                        placeholder="Suite 100"
                        value={formFields.address_line_2}
                        onChange={(e) => setFormFields({ ...formFields, address_line_2: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">City *</label>
                      <input
                        type="text"
                        className="h-10 w-full rounded-lg border border-border/80 bg-surface px-3.5 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                        placeholder="Mumbai"
                        value={formFields.city}
                        onChange={(e) => setFormFields({ ...formFields, city: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">State / Region *</label>
                      {filteredStates.length > 0 ? (
                        <select
                          className="h-10 w-full rounded-lg border border-border/80 bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                          value={formFields.state}
                          onChange={(e) => setFormFields({ ...formFields, state: e.target.value })}
                          required
                        >
                          <option value="" disabled>Select State / Region</option>
                          {filteredStates.map((s) => (
                            <option key={s.id || s.code} value={s.name}>
                              {s.name} ({s.code})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className="h-10 w-full rounded-lg border border-border/80 bg-surface px-3.5 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                          placeholder="Maharashtra"
                          value={formFields.state}
                          onChange={(e) => setFormFields({ ...formFields, state: e.target.value })}
                          required
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">Country *</label>
                      <select
                        className="h-10 w-full rounded-lg border border-border/80 bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                        value={
                          countries.find(
                            (c) => c.name.toLowerCase() === (formFields.country || "").toLowerCase() || c.code.toLowerCase() === (formFields.country || "").toLowerCase()
                          )?.code || formFields.country
                        }
                        onChange={(e) => handleCountryChange(e.target.value)}
                        required
                      >
                        <option value="" disabled>Select Country</option>
                        {countries.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5 flex items-center justify-between">
                        <span>Postal Code *</span>
                        {isLookingUpPin && <span className="text-[10px] text-primary animate-pulse font-normal lowercase">Auto-filling location...</span>}
                      </label>
                      <input
                        type="text"
                        className="h-10 w-full rounded-lg border border-border/80 bg-surface px-3.5 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                        placeholder="e.g. 400001 or 90210"
                        value={formFields.postal_code}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormFields((prev) => ({ ...prev, postal_code: val }));
                          if (val.length >= 5) {
                            handlePostalCodeLookup(val);
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value) handlePostalCodeLookup(e.target.value);
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Contacts & Config Card */}
                <div className="bg-surface border border-border/80 rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider border-b border-border/60 pb-2">
                    Contacts & Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">Contact Email *</label>
                      <input
                        type="email"
                        className="h-10 w-full rounded-lg border border-border/80 bg-surface px-3.5 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                        placeholder="frontdesk@palace.com"
                        value={formFields.contact_email}
                        onChange={(e) => setFormFields({ ...formFields, contact_email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">Contact Phone *</label>
                      <input
                        type="text"
                        className="h-10 w-full rounded-lg border border-border/80 bg-surface px-3.5 text-[13px] text-text-primary placeholder:text-text-disabled focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
                        placeholder="+91 98765 43210"
                        value={formFields.contact_phone}
                        onChange={(e) => setFormFields({ ...formFields, contact_phone: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">Currency *</label>
                      <select
                        className="h-10 w-full rounded-lg border border-border/80 bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                        value={formFields.currency}
                        onChange={(e) => setFormFields({ ...formFields, currency: e.target.value })}
                        required
                      >
                        <option value="" disabled>Select Currency</option>
                        {currencies.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code} ({c.symbol || c.name})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1.5">Timezone *</label>
                      <select
                        className="h-10 w-full rounded-lg border border-border/80 bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                        value={formFields.timezone}
                        onChange={(e) => setFormFields({ ...formFields, timezone: e.target.value })}
                        required
                      >
                        <option value="" disabled>Select Timezone</option>
                        {timezones.map((tz) => (
                          <option key={tz.code} value={tz.code}>
                            {tz.name} ({tz.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border bg-surface flex justify-end gap-3 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full px-5 py-2 text-[13px] font-medium"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="rounded-full px-5 py-2 text-[13px] font-medium"
                >
                  {editingProperty ? "Save Changes" : "Onboard Property"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="h-5 w-5" />
              Confirm Property Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this property? All associated logs, assignments, and structural data under this property will be removed. This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">
              Yes, Delete Property
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Property Access Switcher Modal */}
      {accessModalOpen && accessProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <Card className="w-full max-w-lg bg-surface border border-border/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col rounded-2xl">
            <div className="px-6 py-4 border-b border-border bg-surface flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-text-primary">
                  Access Property Applications
                </h2>
                <p className="text-[11.5px] text-text-secondary mt-0.5">
                  Launch configured platforms for <span className="font-semibold text-primary">{accessProperty.name}</span>
                </p>
              </div>
              <button
                onClick={() => setAccessModalOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-surface-3 text-text-disabled hover:text-text-primary text-[14px] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
              {/* Section 1: Subscribed Products */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-success uppercase tracking-wider border-b border-border/60 pb-1.5 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  Subscribed Applications
                </h3>
                {accessApps.subscribed.length === 0 ? (
                  <p className="text-[12px] text-text-secondary italic">
                    No active product subscriptions resolved for this tenant.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {accessApps.subscribed.map((app) => {
                      const Icon = app.icon;
                      return (
                        <button
                          key={app.key}
                          onClick={() => handleLaunchApp(app)}
                          className="flex items-center gap-4 p-3.5 rounded-xl border border-border hover:border-success/40 bg-surface hover:bg-success/5 text-left transition-all group"
                        >
                          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-success/10 text-success group-hover:bg-success group-hover:text-white transition-all">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[13.5px] font-bold text-text-primary group-hover:text-success transition-colors">
                              {app.title}
                            </h4>
                            <p className="text-[11px] text-text-secondary truncate mt-0.5">
                              {app.description}
                            </p>
                          </div>
                          <span className="text-[12px] font-semibold text-success opacity-0 group-hover:opacity-100 transition-opacity">
                            Launch →
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 2: All Other Applications (Superadmin Bypass) */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider border-b border-border/60 pb-1.5 flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-primary" />
                  All Platform Applications (Superadmin Bypass)
                </h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {accessApps.other.map((app) => {
                    const Icon = app.icon;
                    return (
                      <button
                        key={app.key}
                        onClick={() => handleLaunchApp(app)}
                        className="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-primary/40 bg-surface hover:bg-primary/5 text-left transition-all group"
                      >
                        <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-surface-2 text-text-secondary group-hover:bg-primary group-hover:text-white transition-all">
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[12.5px] font-bold text-text-primary group-hover:text-primary transition-colors">
                            {app.title}
                          </h4>
                          <p className="text-[10.5px] text-text-secondary truncate mt-0.5">
                            {app.description}
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Bypass Launch →
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border bg-surface flex justify-end">
              <Button
                variant="outline"
                className="rounded-full px-5 py-2 text-[12.5px] font-medium"
                onClick={() => setAccessModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
