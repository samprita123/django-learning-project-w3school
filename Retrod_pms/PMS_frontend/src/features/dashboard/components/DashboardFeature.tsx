import { Filter, Download, Sparkles, ArrowUpRight, Loader2 } from "lucide-react";
import { PageHeader, KpiCard, Button } from "@/components/ui/Primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useMemo } from "react";
import { LiveOccupancy } from "./LiveOccupancy";
import { RevenueKpis } from "./RevenueKpis";
import { ArrivalsDepartures } from "./ArrivalsDepartures";
import { AlertNotifications } from "./AlertNotifications";
import { HousekeepingOverview } from "./HousekeepingOverview";
import { RevenueForecast } from "./RevenueForecast";
import { RevenueOccupancyTrend } from "./RevenueOccupancyTrend";
import { ActivityFeed } from "./ActivityFeed";
import { OpsSummaryRow } from "./OpsSummaryRow";
import { fetchApi } from "@/services/api/core";

const tooltipStyle = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "var(--shadow-e2)",
};

const fmtINR = (n: number) =>
  n >= 10000000
    ? `₹${(n / 10000000).toFixed(2)} Cr`
    : n >= 100000
      ? `₹${(n / 100000).toFixed(2)} L`
      : n >= 1000
        ? `₹${(n / 1000).toFixed(1)}k`
        : `₹${n}`;

export function DashboardFeature() {
  const [timeFilter, setTimeFilter] = useState("7days");
  const [isLoading, setIsLoading] = useState(true);

  const [propertyName, setPropertyName] = useState("The Grand Palace");
  const [propertyCity, setPropertyCity] = useState("New Delhi");

  // Dynamic States
  const [dbReservations, setDbReservations] = useState<any[]>([]);
  const [dbRooms, setDbRooms] = useState<any[]>([]);
  const [dbTypes, setDbTypes] = useState<any[]>([]);
  const [maintStats, setMaintStats] = useState<any>({ open_work_orders: 0, critical_count: 0 });

  const activePropertyId = useMemo(() => {
    return localStorage.getItem("retrod:active-property-id") || "";
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const activeProp = localStorage.getItem("retrod:active-property-id") || "";
      if (!activeProp) return;

      const [propsRes, resvRes, roomsRes, typesRes, maintRes] = await Promise.all([
        fetchApi<any>("/api/properties/").catch(() => []),
        fetchApi<any>("/api/reservations/bookings/").catch(() => ({ results: [] })),
        fetchApi<any>("/api/inventory/units/?limit=1000").catch(() => ({ results: [] })),
        fetchApi<any>("/api/inventory/types/").catch(() => ({ results: [] })),
        fetchApi<any>(`/api/maintenance/tickets/stats/?property=${activeProp}`).catch(() => ({ open_work_orders: 0, critical_count: 0 })),
      ]);

      // 1. Resolve Active Property Name & City
      const propList = Array.isArray(propsRes) ? propsRes : propsRes?.results || [];
      const activeP = propList.find((p: any) => p.id === activeProp);
      if (activeP) {
        setPropertyName(activeP.name);
        setPropertyCity(activeP.city || activeP.address || "New Delhi");
      }

      // 2. Load lists
      const bookings = Array.isArray(resvRes) ? resvRes : resvRes?.results || [];
      const rooms = Array.isArray(roomsRes) ? roomsRes : roomsRes?.results || [];
      const types = Array.isArray(typesRes) ? typesRes : typesRes?.results || [];

      // Filter by active property context
      setDbReservations(bookings.filter((b: any) => b.property === activeProp || b.property_id === activeProp));
      setDbRooms(rooms.filter((r: any) => r.property === activeProp || r.property_id === activeProp));
      setDbTypes(types);
      setMaintStats(maintRes);
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activePropertyId]);

  // Compute live occupancy metrics
  const occupancyByType = useMemo(() => {
    if (dbTypes.length === 0) return [];
    
    return dbTypes.map((t: any) => {
      const typeRooms = dbRooms.filter((r: any) => r.inventory_unit_type === t.id);
      const total = typeRooms.length;
      
      // count active check-ins for this room type
      const occupied = dbReservations.filter((res: any) => {
        if (res.status !== "CHECKED_IN") return false;
        return (res.room_allocations || []).some((a: any) => a.inventory_unit_type === t.id);
      }).length;

      return {
        type: t.name,
        occupied,
        total,
      };
    }).filter(t => t.total > 0);
  }, [dbTypes, dbRooms, dbReservations]);

  const totalRooms = useMemo(() => {
    return occupancyByType.reduce((sum, item) => sum + item.total, 0) || dbRooms.length || 1;
  }, [occupancyByType, dbRooms]);

  const occupied = useMemo(() => {
    return occupancyByType.reduce((sum, item) => sum + item.occupied, 0) || 0;
  }, [occupancyByType]);

  const occPct = useMemo(() => {
    return Math.round((occupied / totalRooms) * 100);
  }, [occupied, totalRooms]);

  // Compute daily revenue & calculations
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const roomsRevenueToday = useMemo(() => {
    const todayBookings = dbReservations.filter(res => res.arrival_date === todayStr || res.status === "CHECKED_IN");
    return todayBookings.reduce((sum, res) => sum + parseFloat(res.total_amount || 0), 0);
  }, [dbReservations, todayStr]);

  const revenueKpis = useMemo(() => {
    // Dynamic F&B, Spa, and Misc ratios based on rooms revenue
    const roomsVal = roomsRevenueToday || 1842000;
    const fbVal = roomsVal * 0.35;
    const spaVal = roomsVal * 0.11;
    const miscVal = roomsVal * 0.05;

    return [
      { label: "Rooms", today: roomsVal, budget: 1700000, sty: 1610000 },
      { label: "Food & Beverage", today: fbVal, budget: 700000, sty: 580000 },
      { label: "Spa & Wellness", today: spaVal, budget: 150000, sty: 142000 },
      { label: "Misc", today: miscVal, budget: 80000, sty: 78000 },
    ];
  }, [roomsRevenueToday]);

  // ADR & RevPAR today calculations
  const inHouseGuests = useMemo(() => {
    return dbReservations.filter(res => res.status === "CHECKED_IN").length;
  }, [dbReservations]);

  const adrToday = useMemo(() => {
    return inHouseGuests > 0 ? Math.round(roomsRevenueToday / inHouseGuests) : 12400;
  }, [roomsRevenueToday, inHouseGuests]);

  const revParMtd = useMemo(() => {
    return Math.round(adrToday * (occPct / 100)) || 8440;
  }, [adrToday, occPct]);

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + " · Live";
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-[13px] font-medium text-text-secondary">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={todayLabel}
        title="Good morning, Aarav"
        description={`Real-time command center for ${propertyName}, ${propertyCity}.`}
        actions={
          <>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="h-8 text-xs w-[130px] bg-surface">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="month">Month wise</SelectItem>
                <SelectItem value="year">Year wise</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </>
        }
      />

      <div className="space-y-6 p-6">
        {/* === Row 1: Live Occupancy Gauge + Revenue KPI cards === */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
          <LiveOccupancy 
            occPct={occPct} 
            occupied={occupied} 
            totalRooms={totalRooms} 
            occupancyByType={occupancyByType.length > 0 ? occupancyByType : [
              { type: "Deluxe King", occupied: 31, total: 36 },
              { type: "Deluxe Twin", occupied: 22, total: 28 },
              { type: "Premier Suite", occupied: 19, total: 24 },
            ]} 
          />
          <RevenueKpis fmtINR={fmtINR} revenueKpis={revenueKpis} />
        </div>

        {/* === KPI strip === */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="ADR Today" value={fmtINR(adrToday)} delta="↑ ₹800 vs LW" accent="brand" />
          <KpiCard label="RevPAR · MTD" value={fmtINR(revParMtd)} delta="↑ 5.4% vs LM" accent="success" />
          <KpiCard
            label="In-House Guests"
            value={String(inHouseGuests || 84)}
            delta="6 VIPs"
            deltaTone="neutral"
            accent="info"
          />
          <KpiCard
            label="Open Work Orders"
            value={String(maintStats?.open_work_orders ?? 11)}
            delta={`${maintStats?.critical_count ?? 2} critical`}
            deltaTone="error"
            accent="warning"
          />
        </div>

        {/* === Row 2: Arrivals/Departures + Alerts === */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ArrivalsDepartures />
          <AlertNotifications />
        </div>

        {/* === Ops command center (P0) === */}
        <OpsSummaryRow />

        {/* === Row 3: HK Status overview + Forecast === */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <HousekeepingOverview />
          <RevenueForecast fmtINR={fmtINR} tooltipStyle={tooltipStyle} />
        </div>

        {/* B2B Travel Agent Portal Card */}
        <div className="rounded-lg border border-border bg-surface shadow-sm">
          <div className="border-b border-border-subtle p-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-medium text-text-primary">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-brand/10 text-brand">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                Travel Agent Overview
              </div>
            </div>
          </div>
          <div className="p-4 grid grid-cols-4 gap-4">
            <div>
              <div className="text-[11px] text-text-secondary uppercase tracking-wider font-medium">Agents</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-semibold">124</span>
                <span className="text-[11px] text-success">8 active</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-text-secondary uppercase tracking-wider font-medium">Bookings</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-semibold">12</span>
                <span className="text-[11px] text-text-secondary">Today</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-text-secondary uppercase tracking-wider font-medium">Pending</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-semibold text-[var(--color-warning)]">₹42.5k</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-text-secondary uppercase tracking-wider font-medium">Revenue</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-semibold text-brand">₹8.2L</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
