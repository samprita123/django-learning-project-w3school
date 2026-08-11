import { useState } from "react";
import {
  Building2,
  Copy,
  Globe,
  Plus,
  RefreshCw,
  Search,
  Settings,
  X,
} from "lucide-react";
import { Button, KpiCard, StatusBadge } from "@/components/ui/Primitives";
import { toast } from "sonner";
import { EngineConfigDrawer } from "./EngineConfigDrawer";
import { INITIAL_BOOKING_ENGINES } from "./mockData";
import { RegisterEngineWizard } from "./RegisterEngineWizard";
import type { HotelBookingEngine } from "./types";

interface BookingEngineControlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingEngineControlModal({
  isOpen,
  onClose,
}: BookingEngineControlModalProps) {
  if (!isOpen) return null;

  const [engines, setEngines] = useState<HotelBookingEngine[]>(INITIAL_BOOKING_ENGINES);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedEngine, setSelectedEngine] = useState<HotelBookingEngine | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const handleSyncAllEngines = () => {
    const updated = engines.map((e) => ({
      ...e,
      syncStatus: "synced" as const,
      lastSyncedAt: new Date().toISOString(),
    }));
    setEngines(updated);
    toast.success("Batch Sync Complete! All Hotel Booking Engines are in sync with PMS.");
  };

  const handleRegisterNewEngine = (newEng: HotelBookingEngine) => {
    setEngines((prev) => [newEng, ...prev]);
  };

  const handleUpdateEngine = (updatedEng: HotelBookingEngine) => {
    setEngines((prev) => prev.map((e) => (e.id === updatedEng.id ? updatedEng : e)));
    setSelectedEngine(updatedEng);
  };

  const filteredEngines = engines.filter((e) => {
    const matchesSearch =
      e.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBookings = engines.reduce((acc, curr) => acc + curr.totalDirectBookings, 0);
  const totalRevenue = engines.reduce((acc, curr) => acc + curr.totalDirectRevenue, 0);
  const activeCount = engines.filter((e) => e.status === "active").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="relative flex h-full max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-2/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-[20px] font-semibold text-text-primary">
                  Booking Engine Super Admin Setup
                </h2>
                <StatusBadge tone="success">{activeCount} Active Engines</StatusBadge>
              </div>
              <p className="text-[12px] text-text-secondary">
                Register hotel booking engines, manage rates & galleries, sync live availability & payment gateways.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleSyncAllEngines}>
              <RefreshCw className="h-4 w-4" /> ⚡ SYNC ALL ENGINES
            </Button>
            <Button size="sm" onClick={() => setIsWizardOpen(true)}>
              <Plus className="h-4 w-4" /> Register New Hotel Engine
            </Button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <KpiCard
              label="Registered Engines"
              value={String(engines.length)}
              subtitle={`${activeCount} live in production`}
              accent="brand"
            />
            <KpiCard
              label="Total Direct Bookings"
              value={String(totalBookings)}
              subtitle="Processed via website"
              accent="info"
            />
            <KpiCard
              label="Direct Revenue"
              value={`₹${(totalRevenue / 100000).toFixed(2)}L`}
              subtitle="0% OTA Commission Saved"
              accent="success"
            />
            <KpiCard
              label="PMS Inventory Sync"
              value="Healthy"
              subtitle="Real-time rate push active"
              accent="warning"
            />
          </div>

          {/* Search & Action Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-disabled" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by hotel name, slug, or city..."
                  className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text-primary focus:border-primary focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <p className="text-[12px] text-text-secondary">
              Showing {filteredEngines.length} of {engines.length} engines
            </p>
          </div>

          {/* Engines Table */}
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-e1">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-border bg-surface-2/60 text-[12px] font-semibold text-text-secondary">
                <tr>
                  <th className="px-4 py-3">Hotel Property</th>
                  <th className="px-4 py-3">Engine Slug & URL</th>
                  <th className="px-4 py-3">Engine Status</th>
                  <th className="px-4 py-3">Direct Revenue</th>
                  <th className="px-4 py-3">Sync Health</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredEngines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-secondary">
                      No hotel booking engines found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredEngines.map((eng) => (
                    <tr key={eng.id} className="hover:bg-surface-2/30 transition">
                      <td className="px-4 py-3 font-medium text-text-primary">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-text-primary">{eng.propertyName}</div>
                            <div className="text-[11px] text-text-tertiary">{eng.location.city}, {eng.location.state}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-[12px] text-text-secondary">
                        <div className="flex items-center gap-1.5">
                          <span>booking.retrod.com/{eng.slug}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`https://booking.retrod.com/${eng.slug}`);
                              toast.success("Booking URL copied!");
                            }}
                            className="text-text-tertiary hover:text-primary"
                            title="Copy Link"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge tone={eng.status === "active" ? "success" : "warning"}>
                          {eng.status.toUpperCase()}
                        </StatusBadge>
                      </td>

                      <td className="px-4 py-3 font-mono font-medium text-text-primary">
                        ₹{(eng.totalDirectRevenue / 1000).toFixed(0)}k
                        <span className="text-[11px] text-text-tertiary ml-1">({eng.totalDirectBookings} bookings)</span>
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge tone={eng.syncStatus === "synced" ? "success" : "warning"}>
                          {eng.syncStatus === "synced" ? "Synced" : "Pending Push"}
                        </StatusBadge>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedEngine(eng);
                              setIsDrawerOpen(true);
                            }}
                          >
                            <Settings className="h-3.5 w-3.5" /> Setup & Sync
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide-over Config Drawer */}
      <EngineConfigDrawer
        engine={selectedEngine}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdate={handleUpdateEngine}
      />

      {/* Registration Wizard Modal */}
      <RegisterEngineWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onRegister={handleRegisterNewEngine}
      />
    </div>
  );
}
