import { useState } from "react";
import {
  Building2,
  Copy,
  CreditCard,
  Globe,
  Image,
  IndianRupee,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  ShieldAlert,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { Button, StatusBadge } from "@/components/ui/Primitives";
import { toast } from "sonner";
import type { HotelBookingEngine, PromoCodeConfig, RoomRateConfig } from "./types";

interface EngineConfigDrawerProps {
  engine: HotelBookingEngine | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedEngine: HotelBookingEngine) => void;
}

export function EngineConfigDrawer({
  engine,
  isOpen,
  onClose,
  onUpdate,
}: EngineConfigDrawerProps) {
  if (!isOpen || !engine) return null;

  const [activeTab, setActiveTab] = useState<
    "profile" | "media" | "rates" | "promos" | "policies" | "payments"
  >("profile");

  const [formData, setFormData] = useState<HotelBookingEngine>(JSON.parse(JSON.stringify(engine)));
  const [newSlideUrl, setNewSlideUrl] = useState("");
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoDiscount, setNewPromoDiscount] = useState("10");

  const handleSaveAll = () => {
    onUpdate({
      ...formData,
      lastSyncedAt: new Date().toISOString(),
      syncStatus: "synced",
    });
    toast.success(`Booking engine updated for "${formData.propertyName}"`);
  };

  const handleSyncItem = (itemLabel: string) => {
    toast.success(`Synced "${itemLabel}" live to Booking Engine!`);
  };

  const handleSyncAll = () => {
    onUpdate({
      ...formData,
      lastSyncedAt: new Date().toISOString(),
      syncStatus: "synced",
    });
    toast.success(`All rates, media, policies & payment settings synced live to Booking Engine!`);
  };

  const handleAddSlide = () => {
    if (!newSlideUrl) return;
    setFormData((prev) => ({
      ...prev,
      heroSlideshow: [...prev.heroSlideshow, newSlideUrl],
    }));
    setNewSlideUrl("");
    toast.success("Slideshow image added!");
  };

  const handleRemoveSlide = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      heroSlideshow: prev.heroSlideshow.filter((_, i) => i !== index),
    }));
    toast.info("Slideshow image removed");
  };

  const handleRateChange = (index: number, field: keyof RoomRateConfig, val: any) => {
    const updatedRates = [...formData.roomRates];
    updatedRates[index] = {
      ...updatedRates[index],
      [field]: val,
      isSynced: false,
    };
    setFormData((prev) => ({ ...prev, roomRates: updatedRates }));
  };

  const handleAddPromo = () => {
    if (!newPromoCode) return;
    const newP: PromoCodeConfig = {
      id: `promo-${Date.now()}`,
      code: newPromoCode.toUpperCase().replace(/\s+/g, ""),
      discountType: "percentage",
      discountValue: Number(newPromoDiscount) || 10,
      validFrom: new Date().toISOString().split("T")[0],
      validTo: "2026-12-31",
      minNights: 1,
      isActive: true,
    };
    setFormData((prev) => ({ ...prev, promos: [...prev.promos, newP] }));
    setNewPromoCode("");
    toast.success(`Promo code ${newP.code} created!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity">
      <div className="relative flex h-full w-full max-w-4xl flex-col border-l border-border bg-surface shadow-2xl animate-in slide-in-from-right duration-250">
        {/* Top Sticky Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-[19px] font-semibold text-text-primary">
                  {formData.propertyName}
                </h2>
                <StatusBadge tone={formData.status === "active" ? "success" : "warning"}>
                  {formData.status.toUpperCase()}
                </StatusBadge>
              </div>
              <p className="text-[12px] font-mono text-text-secondary flex items-center gap-2 mt-0.5">
                <span>booking.retrod.com/{formData.slug}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://booking.retrod.com/${formData.slug}`);
                    toast.success("Public Booking URL copied!");
                  }}
                  className="hover:text-primary"
                  title="Copy URL"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleSyncAll}>
              <RefreshCw className="h-3.5 w-3.5" />
              Sync All
            </Button>
            <Button size="sm" onClick={handleSaveAll}>
              <Save className="h-3.5 w-3.5" />
              Save Changes
            </Button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-border bg-surface-2/40 px-6 space-x-1 overflow-x-auto text-[13px] font-medium">
          {[
            { id: "profile", label: "Hotel Profile & Socials", icon: MapPin },
            { id: "media", label: "Media & Galleries", icon: Image },
            { id: "rates", label: "Rates & Sync", icon: IndianRupee },
            { id: "promos", label: "Promotions & Offers", icon: Tag },
            { id: "policies", label: "Policies & Rules", icon: ShieldAlert },
            { id: "payments", label: "Payment Gateways", icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 border-b-2 py-3 px-3.5 transition whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PROFILE & SOCIALS */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-1">
                    Hotel / Property Name
                  </label>
                  <input
                    type="text"
                    value={formData.propertyName}
                    onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-1">
                    Engine Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary font-mono focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1">
                  Custom Domain
                </label>
                <input
                  type="text"
                  value={formData.customDomain || ""}
                  onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                  placeholder="e.g. booking.grandheritage.com"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary font-mono focus:border-primary focus:outline-none"
                />
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-[14px] font-semibold text-text-primary flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-primary" /> Location & Contact Info
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[12px] font-medium text-text-secondary mb-1">
                      Full Address
                    </label>
                    <input
                      type="text"
                      value={formData.location.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: { ...formData.location, address: e.target.value },
                        })
                      }
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium text-text-secondary mb-1">City</label>
                      <input
                        type="text"
                        value={formData.location.city}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            location: { ...formData.location, city: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-text-secondary mb-1">State</label>
                      <input
                        type="text"
                        value={formData.location.state}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            location: { ...formData.location, state: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-text-secondary mb-1">Pincode</label>
                      <input
                        type="text"
                        value={formData.location.pincode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            location: { ...formData.location, pincode: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-medium text-text-secondary mb-1">Phone</label>
                      <input
                        type="text"
                        value={formData.location.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            location: { ...formData.location, phone: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-text-secondary mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.location.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            location: { ...formData.location, email: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-[14px] font-semibold text-text-primary flex items-center gap-2 mb-3">
                  <Globe className="h-4 w-4 text-info" /> Social Media Links & Website
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-medium text-text-secondary mb-1">
                      Instagram URL
                    </label>
                    <input
                      type="text"
                      value={formData.location.socials.instagram || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: {
                            ...formData.location,
                            socials: { ...formData.location.socials, instagram: e.target.value },
                          },
                        })
                      }
                      placeholder="https://instagram.com/hotel"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-text-secondary mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={formData.location.socials.whatsapp || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: {
                            ...formData.location,
                            socials: { ...formData.location.socials, whatsapp: e.target.value },
                          },
                        })
                      }
                      placeholder="+919876543210"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEDIA & ROOM GALLERIES */}
          {activeTab === "media" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Hotel Main Hero Slideshow */}
              <div className="rounded-xl border border-border bg-surface p-5 space-y-4 shadow-e1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[15px] font-semibold text-text-primary flex items-center gap-2">
                      <Image className="h-4 w-4 text-primary" /> Hotel Landing Page Slideshow
                    </h3>
                    <p className="text-[12px] text-text-secondary">
                      Main carousel images displayed at the top of the guest booking engine.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleSyncItem("Hero Slideshow")}>
                    <RefreshCw className="h-3.5 w-3.5" /> Sync Media
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {formData.heroSlideshow.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-surface-2"
                    >
                      <img src={imgUrl} alt={`Slide ${idx + 1}`} className="h-full w-full object-cover" />
                      <button
                        onClick={() => handleRemoveSlide(idx)}
                        className="absolute right-2 top-2 rounded-md bg-error/90 p-1 text-white opacity-0 transition group-hover:opacity-100"
                        title="Remove photo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newSlideUrl}
                    onChange={(e) => setNewSlideUrl(e.target.value)}
                    placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                    className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                  />
                  <Button type="button" onClick={handleAddSlide}>
                    <Plus className="h-4 w-4" /> Add Image
                  </Button>
                </div>
              </div>

              {/* Room Type Wise Galleries */}
              <div className="space-y-4">
                <h3 className="text-[15px] font-semibold text-text-primary flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-info" /> Room-Wise Photo Galleries
                </h3>
                {formData.roomGalleries.map((gallery) => (
                  <div key={gallery.id} className="rounded-xl border border-border bg-surface p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[14px] font-semibold text-text-primary">{gallery.roomTypeName}</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSyncItem(`${gallery.roomTypeName} Photos`)}
                      >
                        <RefreshCw className="h-3.5 w-3.5 text-text-tertiary" /> Sync Room Photos
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {gallery.photos.map((p, pIdx) => (
                        <div key={pIdx} className="relative h-20 w-32 overflow-hidden rounded-lg border border-border">
                          <img src={p} alt="Room" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RATES & SYNC */}
          {activeTab === "rates" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header Sync Banner */}
              <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div>
                  <h3 className="text-[14px] font-semibold text-primary flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" /> Base Rates & Extra Occupancy Fees
                  </h3>
                  <p className="text-[12px] text-text-secondary mt-0.5">
                    Update prices for room types, extra adults, and children. Click "Sync" per item or "Sync All" at top.
                  </p>
                </div>
                <Button onClick={handleSyncAll}>
                  <RefreshCw className="h-4 w-4" /> ⚡ SYNC ALL RATES
                </Button>
              </div>

              <div className="space-y-4">
                {formData.roomRates.map((rate, idx) => (
                  <div
                    key={rate.roomTypeId}
                    className="rounded-xl border border-border bg-surface p-5 space-y-4 shadow-e1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-text-primary font-bold text-[14px]">
                          ₹
                        </div>
                        <div>
                          <h4 className="text-[14px] font-semibold text-text-primary">{rate.roomTypeName}</h4>
                          <span className="text-[11px] text-text-tertiary">Tax Rate: {rate.taxPercentage}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge tone={rate.isSynced ? "success" : "warning"}>
                          {rate.isSynced ? "Synced" : "Pending Sync"}
                        </StatusBadge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            handleRateChange(idx, "isSynced", true);
                            handleSyncItem(`${rate.roomTypeName} Rate`);
                          }}
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Sync Room Rate
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t border-border pt-3">
                      <div>
                        <label className="block text-[12px] font-medium text-text-secondary mb-1">
                          Base Price / Night (₹)
                        </label>
                        <input
                          type="number"
                          value={rate.basePricePerNight}
                          onChange={(e) =>
                            handleRateChange(idx, "basePricePerNight", Number(e.target.value))
                          }
                          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary font-mono focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-text-secondary mb-1">
                          Extra Adult Price (₹) <span className="text-text-tertiary">(Optional)</span>
                        </label>
                        <input
                          type="number"
                          value={rate.extraAdultPrice || ""}
                          onChange={(e) =>
                            handleRateChange(idx, "extraAdultPrice", Number(e.target.value))
                          }
                          placeholder="e.g. 1500"
                          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary font-mono focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-text-secondary mb-1">
                          Extra Child Price (₹) <span className="text-text-tertiary">(Optional)</span>
                        </label>
                        <input
                          type="number"
                          value={rate.extraChildPrice || ""}
                          onChange={(e) =>
                            handleRateChange(idx, "extraChildPrice", Number(e.target.value))
                          }
                          placeholder="e.g. 800"
                          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary font-mono focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROMOTIONS & OFFERS */}
          {activeTab === "promos" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="rounded-xl border border-border bg-surface p-5 space-y-4 shadow-e1">
                <h3 className="text-[15px] font-semibold text-text-primary flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" /> Create New Promo / Coupon Code
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[12px] font-medium text-text-secondary mb-1">
                      Promo Code
                    </label>
                    <input
                      type="text"
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value)}
                      placeholder="e.g. FESTIVE20"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary uppercase font-mono focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-text-secondary mb-1">
                      Discount Value (%)
                    </label>
                    <input
                      type="number"
                      value={newPromoDiscount}
                      onChange={(e) => setNewPromoDiscount(e.target.value)}
                      placeholder="15"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary font-mono focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" className="w-full" onClick={handleAddPromo}>
                      <Plus className="h-4 w-4" /> Add Promo
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[14px] font-semibold text-text-primary">Active Promotions</h3>
                {formData.promos.length === 0 ? (
                  <p className="text-[13px] text-text-secondary italic">No active promo codes configured.</p>
                ) : (
                  formData.promos.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-tint text-success font-mono font-bold text-[14px]">
                          %
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[14px] font-bold text-text-primary">
                              {p.code}
                            </span>
                            <StatusBadge tone="success">
                              {p.discountValue}% OFF
                            </StatusBadge>
                          </div>
                          <span className="text-[11px] text-text-tertiary">
                            Valid from {p.validFrom} to {p.validTo} · Min Stay: {p.minNights} Night(s)
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            promos: formData.promos.filter((x) => x.id !== p.id),
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-error" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: POLICIES & RULES */}
          {activeTab === "policies" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-1">
                    Standard Check-in Time
                  </label>
                  <input
                    type="text"
                    value={formData.policies.checkInTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        policies: { ...formData.policies, checkInTime: e.target.value },
                      })
                    }
                    placeholder="14:00"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-1">
                    Standard Check-out Time
                  </label>
                  <input
                    type="text"
                    value={formData.policies.checkOutTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        policies: { ...formData.policies, checkOutTime: e.target.value },
                      })
                    }
                    placeholder="11:00"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1">
                  Cancellation Policy Description
                </label>
                <textarea
                  rows={3}
                  value={formData.policies.cancellationPolicyText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      policies: { ...formData.policies, cancellationPolicyText: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1">
                  Child Policy Details
                </label>
                <textarea
                  rows={2}
                  value={formData.policies.childPolicyText || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      policies: { ...formData.policies, childPolicyText: e.target.value },
                    })
                  }
                  placeholder="e.g. Children up to 6 years stay complimentary..."
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 6: PAYMENT GATEWAYS */}
          {activeTab === "payments" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="space-y-4">
                {formData.paymentGateways.map((gw, idx) => (
                  <div
                    key={gw.provider}
                    className="rounded-xl border border-border bg-surface p-5 space-y-4 shadow-e1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-6 w-6 text-primary" />
                        <div>
                          <h4 className="text-[15px] font-semibold text-text-primary capitalize">
                            {gw.provider.replace(/_/g, " ")} Gateway
                          </h4>
                          <span className="text-[11px] text-text-tertiary">
                            Direct Guest Payment Integration
                          </span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={gw.isEnabled}
                        onChange={(e) => {
                          const updated = [...formData.paymentGateways];
                          updated[idx].isEnabled = e.target.checked;
                          setFormData({ ...formData, paymentGateways: updated });
                        }}
                        className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                      />
                    </div>

                    {gw.isEnabled && (
                      <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
                        <div>
                          <label className="block text-[12px] font-medium text-text-secondary mb-1">
                            Merchant Key ID
                          </label>
                          <input
                            type="text"
                            value={gw.keyId || ""}
                            onChange={(e) => {
                              const updated = [...formData.paymentGateways];
                              updated[idx].keyId = e.target.value;
                              setFormData({ ...formData, paymentGateways: updated });
                            }}
                            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] font-mono text-text-primary focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[12px] font-medium text-text-secondary mb-1">
                            Merchant Key Secret
                          </label>
                          <input
                            type="password"
                            value={gw.keySecret || ""}
                            onChange={(e) => {
                              const updated = [...formData.paymentGateways];
                              updated[idx].keySecret = e.target.value;
                              setFormData({ ...formData, paymentGateways: updated });
                            }}
                            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] font-mono text-text-primary focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
