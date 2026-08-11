import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  PageHeader,
  Card,
  CardHeader,
  Button,
  StatusBadge,
  KpiCard,
} from "@/components/ui/Primitives";
import { Plus, Edit2, Eye, ChevronLeft, ChevronRight, MapPin, Globe, Phone, Mail, Star, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { fetchApi } from "@/services/api/core";

function ImageSlider({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  if (!images || images.length === 0) {
    return (
      <div className="h-48 w-full bg-surface-hover rounded-none flex flex-col items-center justify-center border-b border-border text-text-secondary">
        No photos uploaded.
      </div>
    );
  }

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative h-56 w-full bg-surface-2 overflow-hidden group">
      <img src={images[currentIndex]} alt="Property" className="h-full w-full object-cover" />
      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 hover:bg-background text-text-primary shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 hover:bg-background text-text-primary shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-background/80 text-[11px] font-medium text-text-primary shadow-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}

function GoogleMapEmbed({ address, city, mapUrl }: { address: string; city: string; mapUrl?: string }) {
  let src = "";

  if (mapUrl) {
    const trimmed = mapUrl.trim();
    // Support full iframe embed code pasted by user
    if (trimmed.includes("<iframe")) {
      const match = trimmed.match(/src=["']([^"']+)["']/i);
      if (match && match[1]) {
        src = match[1];
      }
    } else if (trimmed.startsWith("http")) {
      // Direct URL - use as-is if it's already an embed link
      src = trimmed;
    }
  }

  // Fallback to address-based search
  if (!src) {
    const query = [address, city].filter(Boolean).join(", ");
    src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border h-48 bg-surface-2">
      <iframe
        title="Google Map"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={src}
      />
    </div>
  );
}

export function HotelsFeature() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeViewHotel, setActiveViewHotel] = useState<any | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const toggleActive = async (hotel: any) => {
    if (togglingId === hotel.id) return;
    setTogglingId(hotel.id);
    // Optimistic update
    setHotels(prev => prev.map(h => h.id === hotel.id ? { ...h, is_active: !h.is_active } : h));
    try {
      await fetchApi(`/api/properties/${hotel.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !hotel.is_active }),
      });
    } catch {
      // Rollback on failure
      setHotels(prev => prev.map(h => h.id === hotel.id ? { ...h, is_active: hotel.is_active } : h));
    } finally {
      setTogglingId(null);
    }
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await fetchApi<any[]>("/api/properties/");
        setHotels(data);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setHotels([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const totalProperties = hotels.length;
  const liveProperties = hotels.filter(h => h.is_active).length;
  const inactiveProperties = totalProperties - liveProperties;
  const totalRooms = hotels.reduce((acc, h) => acc + (Number(h.rooms) || 0), 0);

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Hotels"
        description="Manage multi-property portfolio setup and rollout health."
        actions={
          <Link to="/hotels/new">
            <Button size="sm">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add hotel
            </Button>
          </Link>
        }
      />

      <div className="responsive-page-x space-y-5 py-4 sm:space-y-6 sm:py-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Properties" value={String(totalProperties)} accent="brand" />
          <KpiCard label="Live" value={String(liveProperties)} accent="success" />
          <KpiCard label="Inactive" value={String(inactiveProperties)} accent="info" />
          <KpiCard label="Total rooms" value={String(totalRooms)} accent="warning" />
        </div>

        <Card>
          <CardHeader title="Properties"/>
          <div className="table-scroll-shadow overflow-x-auto">
            <table className="w-full min-w-[780px] text-[13px]">
              <thead>
                <tr className="border-b border-border bg-surface-2/40 text-left">
                  {["S.No", "Hotel", "City", "Tier", "Status", "Rooms", ""].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-text-secondary text-sm">
                      Loading properties...
                    </td>
                  </tr>
                ) : hotels.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-text-secondary text-sm">
                      No properties found.
                    </td>
                  </tr>
                ) : hotels.map((hotel, index) => {
                  const statusStr = hotel.is_active ? "Live" : "Inactive";
                  const tone = hotel.is_active ? "success" : "warning";
                  const tierStr = hotel.star_rating ? `${hotel.star_rating} Star` : "Standard";

                  return (
                    <tr
                      key={hotel.id}
                      className="border-b border-border-subtle hover:bg-surface-2/40"
                    >
                      <td className="px-4 py-3 font-semibold text-text-secondary">{index + 1}</td>
                      <td className="px-4 py-3 font-medium text-text-primary">
                        <Link
                          to={`/hotels/${hotel.id}/edit`}
                          className="hover:text-brand hover:underline transition-colors text-left block w-full"
                        >
                          {hotel.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{hotel.city}</td>
                      <td className="px-4 py-3 text-text-secondary">{tierStr}</td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={tone}>
                          {statusStr}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 font-mono text-text-secondary">{hotel.rooms || "0"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Active / Inactive toggle */}
                          <button
                            onClick={() => toggleActive(hotel)}
                            disabled={togglingId === hotel.id}
                            title={hotel.is_active ? "Deactivate property" : "Activate property"}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                              hotel.is_active ? "bg-success" : "bg-surface-2"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
                                hotel.is_active ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <button 
                            onClick={() => setActiveViewHotel(hotel)}
                            className="inline-block p-1.5 rounded hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <Link 
                            to={`/hotels/${hotel.id}/edit`}
                            className="inline-block p-1.5 rounded hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
                            title="Edit Property"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Property Detail Right Drawer */}
      {activeViewHotel && (() => {
        const logo = activeViewHotel.website_logo || "";
        const photos = activeViewHotel.photos || [];
        const tier = activeViewHotel.star_rating ? `${activeViewHotel.star_rating} Star` : "Standard";

        return (
          <Dialog open={!!activeViewHotel} onOpenChange={(open) => !open && setActiveViewHotel(null)}>
            <DialogContent className="fixed left-auto right-0 top-0 translate-x-0 translate-y-0 z-50 h-full w-full sm:max-w-[480px] max-h-none border-l border-border bg-surface text-text-primary shadow-2xl p-0 flex flex-col overflow-y-auto duration-300 sm:rounded-none">

              {/* Top: Photos Slider acting as hero background */}
              <div className="relative shrink-0">
                <ImageSlider images={photos} />

                {/* Close Button */}
                <button
                  onClick={() => setActiveViewHotel(null)}
                  className="absolute top-3 right-3 z-10 p-1.5 bg-background/80 hover:bg-background text-text-primary rounded-full shadow"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Logo overlapping bottom of slider */}
                <div className="absolute -bottom-10 left-5 z-10">
                  {logo ? (
                    <div className="w-20 h-20 rounded-full border-4 border-surface bg-surface shadow-lg overflow-hidden flex items-center justify-center">
                      <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full border-4 border-surface bg-brand shadow-lg flex items-center justify-center">
                      <Star className="h-9 w-9 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="pt-14 px-5 pb-8 flex flex-col gap-5">
                {/* Name + meta */}
                <div>
                  <h2 className="text-xl font-display font-bold text-text-primary leading-tight">
                    {activeViewHotel.name}
                  </h2>
                  <p className="text-[13px] text-text-secondary mt-0.5">
                    {activeViewHotel.property_type || "Hotel"} • {tier} •{" "}
                    <span className={activeViewHotel.is_active ? "text-success font-medium" : "text-warning font-medium"}>
                      {activeViewHotel.is_active ? "Live" : "Inactive"}
                    </span>
                  </p>
                </div>

                {/* Description */}
                {activeViewHotel.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">About</h4>
                    <p className="text-sm text-text-primary leading-relaxed">
                      {activeViewHotel.description}
                    </p>
                  </div>
                )}

                {/* Stay Info */}
                <div className="grid grid-cols-2 gap-3 bg-surface-hover rounded-lg border border-border p-3 text-sm">
                  <div>
                    <span className="text-[11px] text-text-secondary uppercase tracking-wide block">Check-in</span>
                    <span className="font-semibold text-text-primary">{activeViewHotel.check_in_time || "14:00"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-text-secondary uppercase tracking-wide block">Check-out</span>
                    <span className="font-semibold text-text-primary">{activeViewHotel.check_out_time || "11:00"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-text-secondary uppercase tracking-wide block">Min Age</span>
                    <span className="font-semibold text-text-primary">{activeViewHotel.min_age || "18"} Yrs</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-text-secondary uppercase tracking-wide block">Pets Allowed</span>
                    <span className="font-semibold text-text-primary">{activeViewHotel.pets_allowed || "No"}</span>
                  </div>
                </div>

                {/* Location & Map */}
                <div>
                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Location & Map</h4>
                  <div className="flex items-start gap-2 bg-surface-hover rounded-lg border border-border p-3 mb-3">
                    <MapPin className="h-4 w-4 text-text-secondary shrink-0 mt-0.5" />
                    <span className="text-sm text-text-primary">
                      {[activeViewHotel.address_line_1, activeViewHotel.city, activeViewHotel.state, activeViewHotel.country].filter(Boolean).join(", ")}
                      {activeViewHotel.postal_code ? ` - ${activeViewHotel.postal_code}` : ""}
                    </span>
                  </div>
                  <GoogleMapEmbed
                    address={activeViewHotel.address_line_1}
                    city={activeViewHotel.city}
                    mapUrl={activeViewHotel.google_map_url}
                  />
                </div>

                {/* Contact Info - stacked to prevent overlap */}
                <div className="border-t border-border pt-4 flex flex-col gap-3">
                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Contact</h4>
                  <div className="flex items-start gap-2.5">
                    <Mail className="h-4 w-4 text-text-secondary shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-text-secondary block">Email</span>
                      <span className="text-sm font-medium text-text-primary break-all">{activeViewHotel.contact_email}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone className="h-4 w-4 text-text-secondary shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-text-secondary block">Phone</span>
                      <span className="text-sm font-medium text-text-primary">{activeViewHotel.contact_phone}</span>
                    </div>
                  </div>
                  {activeViewHotel.website && (
                    <div className="flex items-start gap-2.5">
                      <Globe className="h-4 w-4 text-text-secondary shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] text-text-secondary block">Website</span>
                        <a
                          href={activeViewHotel.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-brand hover:underline break-all"
                        >
                          {activeViewHotel.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

export default HotelsFeature;
