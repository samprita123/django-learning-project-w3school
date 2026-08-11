import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Globe,
  IndianRupee,
  MapPin,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Primitives";
import { toast } from "sonner";
import type { HotelBookingEngine } from "./types";

interface RegisterEngineWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (engine: HotelBookingEngine) => void;
}

export function RegisterEngineWizard({
  isOpen,
  onClose,
  onRegister,
}: RegisterEngineWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [propertyName, setPropertyName] = useState("");
  const [slug, setSlug] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [deluxePrice, setDeluxePrice] = useState("4500");
  const [deluxeExtraAdult, setDeluxeExtraAdult] = useState("1200");
  const [deluxeExtraChild, setDeluxeExtraChild] = useState("600");

  const [gatewayProvider, setGatewayProvider] = useState<"razorpay" | "stripe">("razorpay");
  const [gatewayKeyId, setGatewayKeyId] = useState("");
  const [payAtHotelAllowed, setPayAtHotelAllowed] = useState(true);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setPropertyName(val);
    if (!slug || slug === val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, val.length - 1)) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      );
    }
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyName || !slug) {
      toast.error("Please fill in property name and slug");
      return;
    }

    const newEngine: HotelBookingEngine = {
      id: `eng-${Date.now().toString().slice(-4)}`,
      propertyId: `prop-${Date.now().toString().slice(-4)}`,
      propertyName,
      slug,
      customDomain: customDomain ? customDomain.trim() : undefined,
      status: "active",
      syncStatus: "synced",
      lastSyncedAt: new Date().toISOString(),
      apiKey: `be_live_${slug.replace(/-/g, "_")}_${Math.random().toString(36).substring(2, 10)}`,
      heroSlideshow: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      ],
      location: {
        address: address || "Main Street Road",
        city: city || "City",
        state: state || "State",
        pincode: pincode || "000000",
        country: "India",
        phone: phone || "+91 98765 00000",
        email: email || `contact@${slug}.com`,
        socials: {
          website: customDomain ? `https://${customDomain}` : `https://booking.retrod.com/${slug}`,
        },
      },
      roomGalleries: [
        {
          id: `rg-${Date.now()}-1`,
          roomTypeId: "rt-deluxe",
          roomTypeName: "Deluxe Executive Room",
          coverPhoto: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
          photos: [
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
          ],
        },
      ],
      roomRates: [
        {
          roomTypeId: "rt-deluxe",
          roomTypeName: "Deluxe Executive Room",
          basePricePerNight: Number(deluxePrice) || 4500,
          extraAdultPrice: Number(deluxeExtraAdult) || 1200,
          extraChildPrice: Number(deluxeExtraChild) || 600,
          taxPercentage: 12,
          isSynced: true,
          lastSyncedAt: new Date().toISOString(),
        },
      ],
      promos: [],
      policies: {
        checkInTime: "14:00",
        checkOutTime: "11:00",
        cancellationType: "flexible",
        cancellationNoticeDays: 2,
        cancellationPolicyText: "Free cancellation up to 48 hours before check-in date.",
      },
      paymentGateways: [
        {
          provider: gatewayProvider,
          isEnabled: true,
          keyId: gatewayKeyId || "rzp_test_samplekey123",
          keySecret: "••••••••••••••••",
          isSandbox: true,
          payAtHotelAllowed,
          depositPercentage: 100,
        },
      ],
      totalDirectBookings: 0,
      totalDirectRevenue: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    onRegister(newEngine);
    toast.success(`Booking engine registered for "${propertyName}"!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-2/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-[18px] font-semibold text-text-primary">
                Register New Hotel Booking Engine
              </h2>
              <p className="text-[12px] text-text-secondary">
                Step {step} of 4 — {step === 1 ? "Property & Slug" : step === 2 ? "Location & Contact" : step === 3 ? "Rates & Occupants" : "Payments & Keys"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-border-subtle">
          <div
            className="h-1 bg-primary transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <form onSubmit={step === 4 ? handleFinish : (e) => { e.preventDefault(); setStep((s) => (s + 1) as any); }} className="p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1">
                  Hotel / Property Name <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-text-disabled" />
                  <input
                    type="text"
                    required
                    value={propertyName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Royal Heritage Resort"
                    className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1">
                  Booking Engine Slug / Subdomain <span className="text-error">*</span>
                </label>
                <div className="flex rounded-lg border border-border bg-surface overflow-hidden text-[13px]">
                  <span className="bg-surface-2 px-3 py-2 text-text-tertiary border-r border-border font-mono text-[12px]">
                    booking.retrod.com/
                  </span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="royal-heritage-resort"
                    className="w-full bg-transparent px-3 py-2 text-text-primary font-mono text-[13px] focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-text-tertiary">
                  This will be the direct public URL for guest reservations.
                </p>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1">
                  Custom Domain (Optional)
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-text-disabled" />
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="booking.royalheritage.com"
                    className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1">
                  Full Street Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-text-disabled" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 10 Beach Road, Candolim"
                    className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Goa"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Goa"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="403515"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-1">Support Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-1">Support Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="reservations@hotel.com"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <h4 className="text-[13px] font-semibold text-primary flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  Initial Deluxe Room Pricing & Extra Charges
                </h4>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Set default rates to show on booking engine. Additional room types can be added after registration.
                </p>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1">
                  Base Price / Night (₹)
                </label>
                <input
                  type="number"
                  value={deluxePrice}
                  onChange={(e) => setDeluxePrice(e.target.value)}
                  placeholder="4500"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-1">
                    Extra Adult Price (₹) <span className="text-text-tertiary">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    value={deluxeExtraAdult}
                    onChange={(e) => setDeluxeExtraAdult(e.target.value)}
                    placeholder="1200"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-1">
                    Extra Child Price (₹) <span className="text-text-tertiary">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    value={deluxeExtraChild}
                    onChange={(e) => setDeluxeExtraChild(e.target.value)}
                    placeholder="600"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1">
                  Payment Gateway Provider
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGatewayProvider("razorpay")}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-left transition ${
                      gatewayProvider === "razorpay"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-surface hover:bg-surface-2"
                    }`}
                  >
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-[13px] font-medium text-text-primary">Razorpay</div>
                      <div className="text-[11px] text-text-secondary">UPI, NetBanking, Cards</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGatewayProvider("stripe")}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-left transition ${
                      gatewayProvider === "stripe"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-surface hover:bg-surface-2"
                    }`}
                  >
                    <CreditCard className="h-5 w-5 text-info" />
                    <div>
                      <div className="text-[13px] font-medium text-text-primary">Stripe</div>
                      <div className="text-[11px] text-text-secondary">Global Credit / Debit</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1">
                  Merchant Key ID
                </label>
                <input
                  type="text"
                  value={gatewayKeyId}
                  onChange={(e) => setGatewayKeyId(e.target.value)}
                  placeholder="rzp_test_xxxxxx or pk_test_xxxxxx"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary font-mono focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2/50 p-3.5">
                <div>
                  <div className="text-[13px] font-medium text-text-primary">Allow Pay at Hotel</div>
                  <div className="text-[11px] text-text-secondary">
                    Guests can reserve online and pay balance at check-in desk
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={payAtHotelAllowed}
                  onChange={(e) => setPayAtHotelAllowed(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((s) => (s - 1) as any)}
              >
                Previous
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button type="button" onClick={() => setStep((s) => (s + 1) as any)}>
                Continue
              </Button>
            ) : (
              <Button type="submit">
                <CheckCircle2 className="h-4 w-4" />
                Finish & Provision Engine
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
