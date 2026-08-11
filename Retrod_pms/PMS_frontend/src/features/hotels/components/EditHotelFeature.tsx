import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { PageHeader, Card, CardHeader, Button } from "@/components/ui/Primitives";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ChevronLeft, UploadCloud, Save, Building2, MapPin, Settings, DollarSign, Image as ImageIcon, Bold, Italic, Underline, List, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, X, Plus } from "lucide-react";
import { hotelRegistry } from "@/features/core/data/catalog";
import { toast } from "sonner";
import { fetchApi } from "@/services/api/core";

function MockRichTextEditor({ id, value, onChange, placeholder }: { id: string, value: string, onChange: (val: string) => void, placeholder?: string }) {
  return (
    <div className="border border-input rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background transition-shadow">
      <div className="flex items-center gap-1 border-b border-input bg-surface-hover px-2 py-1.5 flex-wrap">
        <button type="button" className="p-1.5 text-text-secondary hover:bg-surface-2 rounded hover:text-text-primary transition-colors"><Bold className="h-3.5 w-3.5" /></button>
        <button type="button" className="p-1.5 text-text-secondary hover:bg-surface-2 rounded hover:text-text-primary transition-colors"><Italic className="h-3.5 w-3.5" /></button>
        <button type="button" className="p-1.5 text-text-secondary hover:bg-surface-2 rounded hover:text-text-primary transition-colors"><Underline className="h-3.5 w-3.5" /></button>
        <div className="w-[1px] h-4 bg-border mx-1" />
        <button type="button" className="p-1.5 text-text-secondary hover:bg-surface-2 rounded hover:text-text-primary transition-colors"><List className="h-3.5 w-3.5" /></button>
        <button type="button" className="p-1.5 text-text-secondary hover:bg-surface-2 rounded hover:text-text-primary transition-colors"><LinkIcon className="h-3.5 w-3.5" /></button>
        <div className="w-[1px] h-4 bg-border mx-1" />
        <button type="button" className="p-1.5 text-text-secondary hover:bg-surface-2 rounded hover:text-text-primary transition-colors"><AlignLeft className="h-3.5 w-3.5" /></button>
        <button type="button" className="p-1.5 text-text-secondary hover:bg-surface-2 rounded hover:text-text-primary transition-colors"><AlignCenter className="h-3.5 w-3.5" /></button>
        <button type="button" className="p-1.5 text-text-secondary hover:bg-surface-2 rounded hover:text-text-primary transition-colors"><AlignRight className="h-3.5 w-3.5" /></button>
      </div>
      <textarea 
        id={id}
        placeholder={placeholder}
        className="flex min-h-[100px] w-full bg-background px-3 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-y"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

interface SearchableSelectProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function SearchableSelect({ options, value, onChange, placeholder = "Select...", className = "", disabled = false }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOpt = options.find(o => o.value === value);

  return (
    <div className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        <span className="truncate">{selectedOpt ? selectedOpt.label : placeholder}</span>
        <span className="text-xs text-text-secondary">▼</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[calc(100%+4px)] left-0 z-20 w-full rounded-md border border-border bg-surface text-text-primary shadow-md p-2 flex flex-col gap-1.5 max-h-60 overflow-hidden">
            <input
              type="text"
              className="h-8 w-full px-2 text-sm bg-background border border-input rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <div className="overflow-y-auto max-h-48 grid gap-0.5 pt-1 pr-0.5">
              {filtered.length === 0 ? (
                <div className="p-2 text-xs text-text-secondary text-center">No options found.</div>
              ) : (
                filtered.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
                      opt.value === value ? "bg-brand text-brand-foreground" : "hover:bg-surface-2"
                    }`}
                  >
                    {opt.label}
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

export function EditHotelFeature() {
  const navigate = useNavigate();
  const { hotelId } = useParams({ strict: false });
  
  const [formData, setFormData] = useState({
    name: "",
    type: "Hotel",
    starRating: "4",
    description: "",
    currency: "INR",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    phone: "",
    email: "",
    website: "",
    checkIn: "14:00",
    checkOut: "11:00",
    minAge: "18",
    petsAllowed: "No",
    taxId: "",
    googleMapUrl: "",
    cancellationPolicy: "",
    refundPolicy: "",
    houseRules: "",
    timezone: "Asia/Kolkata",
    cgst: "18",
    vat: "0",
    cityTax: "0",
    serviceCharge: "0",
    luxuryTax: "0",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [systemTaxes, setSystemTaxes] = useState<any[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [websiteLogo, setWebsiteLogo] = useState<string>("");
  const [kotPosLogo, setKotPosLogo] = useState<string>("");
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [newTax, setNewTax] = useState({ name: "", rate: "" });
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [timezones, setTimezones] = useState<any[]>([]);
  const [dbAmenities, setDbAmenities] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const taxes = await fetchApi<any[]>("/api/superadmin-taxes/");
        setSystemTaxes(taxes.filter(t => t.status === "active"));
        
        const cList = await fetchApi<any[]>("/api/reference/countries/");
        setCountries(cList);
        
        const sList = await fetchApi<any[]>("/api/reference/states/");
        setStates(sList);

        const currList = await fetchApi<any[]>("/api/reference/currencies/");
        setCurrencies(currList);

        const tzList = await fetchApi<any[]>("/api/reference/timezones/");
        setTimezones(tzList);

        const ams = await fetchApi<any[]>("/api/inventory/amenities/");
        setDbAmenities(ams);
      } catch (err) {
        console.error("Failed to load taxes/geo/ref data:", err);
      }
    };
    loadData();
  }, []);

  const handleCreateCustomTax = async () => {
    if (!newTax.name || !newTax.rate) {
      toast.error("Please enter a tax name and percentage rate.");
      return;
    }
    try {
      const created = await fetchApi<any>("/api/superadmin-taxes/", {
        method: "POST",
        body: JSON.stringify({
          name: newTax.name,
          rate: String(Number(newTax.rate)),
          type: "percentage",
          status: "active"
        })
      });
      toast.success(`Tax ${created.name} created successfully!`);
      // Re-fetch active taxes
      const taxes = await fetchApi<any[]>("/api/superadmin-taxes/");
      setSystemTaxes(taxes.filter(t => t.status === "active"));
      setShowTaxModal(false);
      setNewTax({ name: "", rate: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to create tax");
    }
  };

  useEffect(() => {
    const loadHotel = async () => {
      if (!hotelId) return;
      try {
        const hotel = await fetchApi<any>(`/api/properties/${hotelId}/`);
        setFormData({
          name: hotel.name || "",
          type: (hotel.property_type || "HOTEL").toLowerCase().replace("_", " "),
          starRating: hotel.star_rating || "4",
          description: hotel.description || "",
          currency: hotel.currency || "INR",
          address: hotel.address_line_1 || "",
          city: hotel.city || "",
          state: hotel.state || "",
          country: hotel.country || "",
          zipCode: hotel.postal_code || "",
          phone: hotel.contact_phone || "",
          email: hotel.contact_email || "",
          website: hotel.website || "",
          checkIn: hotel.check_in_time || "14:00",
          checkOut: hotel.check_out_time || "11:00",
          minAge: String(hotel.min_age || 18),
          petsAllowed: hotel.pets_allowed || "No",
          taxId: hotel.tax_id || "",
          googleMapUrl: hotel.google_map_url || "",
          cancellationPolicy: hotel.cancellation_policy || "",
          refundPolicy: hotel.refund_policy || "",
          houseRules: hotel.house_rules || "",
          timezone: hotel.timezone || "Asia/Kolkata",
          cgst: String(hotel.cgst || "18"),
          vat: String(hotel.vat || "0"),
          cityTax: String(hotel.city_tax || "0"),
          serviceCharge: String(hotel.service_charge || "0"),
          luxuryTax: String(hotel.luxury_tax || "0"),
        });
        setSelectedAmenities(hotel.amenities || []);
        if (hotel.photos) setUploadedPhotos(hotel.photos);
        if (hotel.website_logo) setWebsiteLogo(hotel.website_logo);
        if (hotel.kot_logo) setKotPosLogo(hotel.kot_logo);
      } catch (err: any) {
        console.error("Failed to load property details:", err);
      }
    };
    loadHotel();
  }, [hotelId]);

  const handleAmenitiesChange = (amenityCode: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityCode) ? prev.filter(a => a !== amenityCode) : [...prev, amenityCode]
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError("");
    setFieldErrors({});
    try {
      const payload = {
        name: formData.name,
        property_type: formData.type.toUpperCase().replace(" ", "_"),
        address_line_1: formData.address,
        address_line_2: "",
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postal_code: formData.zipCode,
        contact_email: formData.email,
        contact_phone: formData.phone,
        currency: formData.currency,
        timezone: formData.timezone,
        image_url: "",
        is_active: true,
        description: formData.description,
        star_rating: formData.starRating,
        website: formData.website,
        check_in_time: formData.checkIn,
        check_out_time: formData.checkOut,
        min_age: Number(formData.minAge) || 18,
        pets_allowed: formData.petsAllowed,
        tax_id: formData.taxId,
        google_map_url: formData.googleMapUrl,
        cancellation_policy: formData.cancellationPolicy,
        refund_policy: formData.refundPolicy,
        house_rules: formData.houseRules,
        cgst: formData.cgst || "0.00",
        vat: formData.vat || "0.00",
        city_tax: formData.cityTax || "0.00",
        service_charge: formData.serviceCharge || "0.00",
        luxury_tax: formData.luxuryTax || "0.00",
        amenities: selectedAmenities,
        website_logo: websiteLogo,
        kot_logo: kotPosLogo,
        photos: uploadedPhotos
      };

      await fetchApi(`/api/properties/${hotelId}/`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      navigate({ to: "/hotels" });
    } catch (err: any) {
      try {
        const parsed = JSON.parse(err.message);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          setFieldErrors(parsed);
        } else {
          setError(err.message || "Failed to update property");
        }
      } catch {
        setError(err.message || "Failed to update property");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCountryObj = countries.find(c => c.name.toLowerCase() === (formData.country || "").toLowerCase());
  const filteredStates = selectedCountryObj ? states.filter(s => s.country === selectedCountryObj.id) : states;

  return (
    <div className="pb-12">
      <div className="flex items-center gap-4 px-4 py-4 sm:px-6 border-b border-border bg-surface">
        <Link to="/hotels" className="text-text-secondary hover:text-text-primary">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="label-uppercase mb-1.5">Portfolio &rsaquo; Hotels</div>
          <h1 className="font-display text-[22px] font-semibold leading-tight text-text-primary sm:text-[26px]">
            Edit Property {formData.name ? `(${formData.name})` : ""}
          </h1>
        </div>
      </div>

      <div className="responsive-page-x max-w-5xl mx-auto space-y-6 py-6">
        
        {/* Basic Information */}
        <Card>
          <CardHeader 
            title="Basic Information" 
            hint="Core details about the property." 
          />
          <div className="p-4 sm:p-6 grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name <span className="text-error">*</span></Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Grand Plaza Resort" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Property Type <span className="text-error">*</span></Label>
                <select 
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="Hotel">Hotel</option>
                  <option value="Resort">Resort</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Serviced Apartment">Serviced Apartment</option>
                  <option value="Villa">Villa</option>
                  <option value="Guest House">Guest House</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="starRating">Star Rating</Label>
                <select 
                  id="starRating"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.starRating}
                  onChange={(e) => setFormData({...formData, starRating: e.target.value})}
                >
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                  <option value="Unrated">Unrated / Boutique</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Base Currency</Label>
                <select 
                  id="currency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value})}
                >
                  <option value="">Select Currency</option>
                  {currencies.map(c => (
                    <option key={c.id} value={c.code}>
                      {c.code} {c.symbol ? `(${c.symbol})` : ""} - {c.name}
                    </option>
                  ))}
                  {formData.currency && !currencies.some(c => c.code === formData.currency) && (
                    <option value={formData.currency}>{formData.currency}</option>
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select 
                  id="timezone"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.timezone}
                  onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                >
                  <option value="">Select Timezone</option>
                  {timezones.map(t => (
                    <option key={t.id} value={t.code}>
                      {t.code} {t.utc_offset ? `(UTC ${t.utc_offset})` : ""} - {t.name}
                    </option>
                  ))}
                  {formData.timezone && !timezones.some(t => t.code === formData.timezone) && (
                    <option value={formData.timezone}>{formData.timezone}</option>
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Property Description</Label>
              <MockRichTextEditor
                id="description"
                placeholder="Write a compelling description of the property for guests..."
                value={formData.description}
                onChange={(val) => setFormData({...formData, description: val})}
              />
            </div>
          </div>
        </Card>

        {/* Location & Contact */}
        <Card>
          <CardHeader 
            title="Location & Contact" 
            hint="Where is it located and how can guests reach out?" 
          />
          <div className="p-4 sm:p-6 grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address <span className="text-error">*</span></Label>
              <Input 
                id="address" 
                placeholder="123 Example Street" 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country <span className="text-error">*</span></Label>
                <SearchableSelect
                  options={countries.map(c => ({ label: c.name, value: c.name }))}
                  value={formData.country}
                  onChange={(val) => setFormData({...formData, country: val, state: ""})}
                  placeholder="Select Country"
                  className={fieldErrors.country ? "border-error focus:ring-error" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State / Province</Label>
                <SearchableSelect
                  options={filteredStates.map(s => ({ label: s.name, value: s.name }))}
                  value={formData.state}
                  onChange={(val) => setFormData({...formData, state: val})}
                  placeholder={formData.country ? "Select State" : "Select Country first"}
                  className={fieldErrors.state ? "border-error focus:ring-error" : ""}
                  disabled={!formData.country}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City <span className="text-error">*</span></Label>
                <Input id="city" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip / Postal Code</Label>
                <Input id="zipCode" value={formData.zipCode} onChange={(e) => setFormData({...formData, zipCode: e.target.value})} />
              </div>
            </div>
            
            <div className="border-t border-border pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone</Label>
                <Input id="phone" type="tel" placeholder="+1 234 567 8900" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input id="email" type="email" placeholder="hello@hotel.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input id="website" type="url" placeholder="https://www.hotel.com" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} />
              </div>
            </div>

            <div className="border-t border-border pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="googleMapUrl">Google Maps Location URL</Label>
                <Input id="googleMapUrl" type="url" placeholder="https://maps.google.com/..." value={formData.googleMapUrl} onChange={(e) => setFormData({...formData, googleMapUrl: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Brand Logos</Label>
                 <input 
                  type="file" 
                  id="website-logo-input" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const formData = new FormData();
                      formData.append("file", file);
                      try {
                        const res = await fetchApi<{ url: string }>("/api/properties/upload_photo/", {
                          method: "POST",
                          body: formData
                        });
                        setWebsiteLogo(res.url);
                      } catch (err) {
                        toast.error("Failed to upload logo.");
                      }
                    }
                  }}
                />
                <input 
                  type="file" 
                  id="kot-logo-input" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const formData = new FormData();
                      formData.append("file", file);
                      try {
                        const res = await fetchApi<{ url: string }>("/api/properties/upload_photo/", {
                          method: "POST",
                          body: formData
                        });
                        setKotPosLogo(res.url);
                      } catch (err) {
                        toast.error("Failed to upload logo.");
                      }
                    }
                  }}
                />
                <div className="flex items-center gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      className="w-full bg-surface border-dashed"
                      onClick={() => document.getElementById("website-logo-input")?.click()}
                    >
                      <UploadCloud className="h-4 w-4 mr-2 text-text-secondary" />
                      Website Logo
                    </Button>
                    {websiteLogo && (
                      <div className="relative w-24 h-12 rounded border border-border bg-surface-2 overflow-hidden self-center flex items-center justify-center p-1">
                        <img src={websiteLogo} alt="Website Logo" className="max-h-full max-w-full object-contain" />
                        <button 
                          type="button" 
                          onClick={() => setWebsiteLogo("")}
                          className="absolute -top-1 -right-1 p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      className="w-full bg-surface border-dashed"
                      onClick={() => document.getElementById("kot-logo-input")?.click()}
                    >
                      <UploadCloud className="h-4 w-4 mr-2 text-text-secondary" />
                      KOT / POS Logo
                    </Button>
                    {kotPosLogo && (
                      <div className="relative w-24 h-12 rounded border border-border bg-surface-2 overflow-hidden self-center flex items-center justify-center p-1">
                        <img src={kotPosLogo} alt="KOT / POS Logo" className="max-h-full max-w-full object-contain" />
                        <button 
                          type="button" 
                          onClick={() => setKotPosLogo("")}
                          className="absolute -top-1 -right-1 p-0.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[12px] text-text-secondary mt-2">Upload high-res PNGs with transparent backgrounds.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Detailed Hotel Policies */}
        <Card>
          <CardHeader title="Hotel Policies" hint="Define terms and conditions for guests." />
          <div className="p-4 sm:p-6 grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
              <MockRichTextEditor 
                id="cancellationPolicy" 
                placeholder="Specify timelines and penalty charges for cancellations..."
                value={formData.cancellationPolicy}
                onChange={(val) => setFormData({...formData, cancellationPolicy: val})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refundPolicy">Refund Policy</Label>
              <MockRichTextEditor 
                id="refundPolicy" 
                placeholder="Detail the process and timelines for refunds..."
                value={formData.refundPolicy}
                onChange={(val) => setFormData({...formData, refundPolicy: val})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="houseRules">General House Rules</Label>
              <MockRichTextEditor 
                id="houseRules" 
                placeholder="Rules regarding smoking, parties, quiet hours, etc."
                value={formData.houseRules}
                onChange={(val) => setFormData({...formData, houseRules: val})}
              />
            </div>
          </div>
        </Card>

        {/* Policies */}
        <Card>
          <CardHeader title="Policies & Restrictions" hint="Operational rules for the property." />
          <div className="p-4 sm:p-6 grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn">Check-in Time</Label>
                <Input id="checkIn" type="time" value={formData.checkIn} onChange={(e) => setFormData({...formData, checkIn: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOut">Check-out Time</Label>
                <Input id="checkOut" type="time" value={formData.checkOut} onChange={(e) => setFormData({...formData, checkOut: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minAge">Min Check-in Age</Label>
                <Input id="minAge" type="number" min="0" value={formData.minAge} onChange={(e) => setFormData({...formData, minAge: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="petsAllowed">Pets Allowed</Label>
                <select 
                  id="petsAllowed"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.petsAllowed}
                  onChange={(e) => setFormData({...formData, petsAllowed: e.target.value})}
                >
                  <option value="No">No</option>
                  <option value="Yes (Free)">Yes (Free)</option>
                  <option value="Yes (Charges Apply)">Yes (Charges Apply)</option>
                  <option value="On Request">On Request</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader title="Facilities & Amenities" hint="Select all that apply to this property." />
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {dbAmenities.map(amenity => (
                <label key={amenity.code} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-surface hover:bg-surface-hover cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    className="mt-1 h-4 w-4 rounded border-input text-brand focus:ring-brand"
                    checked={selectedAmenities.includes(amenity.code)}
                    onChange={() => handleAmenitiesChange(amenity.code)}
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-text-primary flex items-center gap-2">
                      {amenity.name}
                      {amenity.icon_name && <span className="text-[10px] text-text-secondary bg-surface-2 px-1 rounded">{amenity.icon_name}</span>}
                    </span>
                    <span className="text-[11px] text-text-secondary">
                      {amenity.category} • {amenity.chargeable ? `Chargeable ($${amenity.price})` : "Free"}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </Card>

        {/* Media Upload */}
        <Card>
          <CardHeader title="Property Photos" hint="Upload high-quality images of the exterior, lobby, and rooms." />
          <div className="p-4 sm:p-6">
            <input 
              type="file" 
              id="property-photos-input" 
              multiple 
              accept="image/*" 
              className="hidden" 
              onChange={async (e) => {
                if (e.target.files) {
                  const filesArray = Array.from(e.target.files);
                  try {
                    const uploadPromises = filesArray.map(async (file) => {
                      const formData = new FormData();
                      formData.append("file", file);
                      const res = await fetchApi<{ url: string }>("/api/properties/upload_photo/", {
                        method: "POST",
                        body: formData
                      });
                      return res.url;
                    });
                    const urls = await Promise.all(uploadPromises);
                    setUploadedPhotos(prev => [...prev, ...urls]);
                  } catch (err) {
                    toast.error("Failed to upload photos.");
                  }
                }
              }}
            />
            <div 
              onClick={() => document.getElementById("property-photos-input")?.click()}
              className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center bg-surface-hover hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-4">
                <UploadCloud className="h-6 w-6" />
              </div>
              <h3 className="text-[15px] font-medium text-text-primary mb-1">Click or drag images to upload</h3>
              <p className="text-[13px] text-text-secondary max-w-sm mb-6">
                Upload up to 50 photos. Supported formats: JPG, PNG, WEBP (Max 10MB each).
              </p>
              <Button variant="outline" className="bg-surface pointer-events-none">
                <ImageIcon className="h-4 w-4 mr-2" /> Browse Files
              </Button>
            </div>
            
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-6">
                {uploadedPhotos.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-surface-2">
                    <img src={url} alt={`Property Preview ${idx + 1}`} className="h-full w-full object-cover" />
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedPhotos(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Financials */}
        <Card>
          <CardHeader title="Financial & Legal" hint="Tax and billing configurations." />
          <div className="p-4 sm:p-6 grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / Business Registration Number</Label>
                <Input id="taxId" placeholder="e.g. GSTIN / EIN" value={formData.taxId} onChange={(e) => setFormData({...formData, taxId: e.target.value})} />
              </div>
            </div>

            <div className="pt-4 border-t border-border-subtle">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium">GST tax structure (India) & Local Taxes</h4>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowTaxModal(true)}
                  className="h-8 px-2.5 text-[11px]"
                >
                  <Plus className="h-3 w-3 mr-1" /> Create Custom Tax
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cgst">CGST %</Label>
                  <select 
                    id="cgst"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.cgst}
                    onChange={(e) => setFormData({...formData, cgst: e.target.value})}
                  >
                    <option value="0">0% (None)</option>
                    {systemTaxes.map(tax => (
                      <option key={tax.id} value={String(Number(tax.rate))}>
                        {tax.name} ({Number(tax.rate)}%)
                      </option>
                    ))}
                    {!systemTaxes.some(t => String(Number(t.rate)) === String(Number(formData.cgst))) && formData.cgst && formData.cgst !== "0" && (
                      <option value={formData.cgst}>{formData.cgst}% (Custom)</option>
                    )}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vat">VAT %</Label>
                  <select 
                    id="vat"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.vat}
                    onChange={(e) => setFormData({...formData, vat: e.target.value})}
                  >
                    <option value="0">0% (None)</option>
                    {systemTaxes.map(tax => (
                      <option key={tax.id} value={String(Number(tax.rate))}>
                        {tax.name} ({Number(tax.rate)}%)
                      </option>
                    ))}
                    {!systemTaxes.some(t => String(Number(t.rate)) === String(Number(formData.vat))) && formData.vat && formData.vat !== "0" && (
                      <option value={formData.vat}>{formData.vat}% (Custom)</option>
                    )}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cityTax">City tax %</Label>
                  <select 
                    id="cityTax"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.cityTax}
                    onChange={(e) => setFormData({...formData, cityTax: e.target.value})}
                  >
                    <option value="0">0% (None)</option>
                    {systemTaxes.map(tax => (
                      <option key={tax.id} value={String(Number(tax.rate))}>
                        {tax.name} ({Number(tax.rate)}%)
                      </option>
                    ))}
                    {!systemTaxes.some(t => String(Number(t.rate)) === String(Number(formData.cityTax))) && formData.cityTax && formData.cityTax !== "0" && (
                      <option value={formData.cityTax}>{formData.cityTax}% (Custom)</option>
                    )}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceCharge">Service charge %</Label>
                  <select 
                    id="serviceCharge"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.serviceCharge}
                    onChange={(e) => setFormData({...formData, serviceCharge: e.target.value})}
                  >
                    <option value="0">0% (None)</option>
                    {systemTaxes.map(tax => (
                      <option key={tax.id} value={String(Number(tax.rate))}>
                        {tax.name} ({Number(tax.rate)}%)
                      </option>
                    ))}
                    {!systemTaxes.some(t => String(Number(t.rate)) === String(Number(formData.serviceCharge))) && formData.serviceCharge && formData.serviceCharge !== "0" && (
                      <option value={formData.serviceCharge}>{formData.serviceCharge}% (Custom)</option>
                    )}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="luxuryTax">Luxury tax %</Label>
                  <select 
                    id="luxuryTax"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.luxuryTax}
                    onChange={(e) => setFormData({...formData, luxuryTax: e.target.value})}
                  >
                    <option value="0">0% (None)</option>
                    {systemTaxes.map(tax => (
                      <option key={tax.id} value={String(Number(tax.rate))}>
                        {tax.name} ({Number(tax.rate)}%)
                      </option>
                    ))}
                    {!systemTaxes.some(t => String(Number(t.rate)) === String(Number(formData.luxuryTax))) && formData.luxuryTax && formData.luxuryTax !== "0" && (
                      <option value={formData.luxuryTax}>{formData.luxuryTax}% (Custom)</option>
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Footer */}
        {error && (
          <div className="text-red-500 text-sm px-4 mb-2 text-right">
            {error}
          </div>
        )}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button variant="ghost" onClick={() => navigate({ to: "/hotels" })} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>

      </div>

      {showTaxModal && (
        <Dialog open={showTaxModal} onOpenChange={setShowTaxModal}>
          <DialogContent className="sm:max-w-[425px] bg-surface text-text-primary border border-border">
            <DialogHeader>
              <DialogTitle>Create Custom Tax</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tax-name" className="text-right">Tax Name</Label>
                <Input
                  id="tax-name"
                  placeholder="e.g. Local Cess"
                  value={newTax.name}
                  onChange={(e) => setNewTax({ ...newTax, name: e.target.value })}
                  className="col-span-3 bg-background border-input"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tax-rate" className="text-right">Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  placeholder="e.g. 2.5"
                  value={newTax.rate}
                  onChange={(e) => setNewTax({ ...newTax, rate: e.target.value })}
                  className="col-span-3 bg-background border-input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowTaxModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCustomTax}>
                Create Tax
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

