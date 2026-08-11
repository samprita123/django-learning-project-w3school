import { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Filter, Plus, Search, Loader2 } from "lucide-react";
import { PageHeader, Button } from "@/components/ui/Primitives";
import { fetchApi } from "@/services/api/core";
import {
  useWaitlistQuery,
  useGroupBlocksQuery,
  useArrivalsTodayQuery,
  useDeparturesTodayQuery,
  useOccupancyByTypeQuery,
  useMealPlansQuery,
  useRatePlansQuery,
  useHotelPackagesQuery,
  useAddOnProductsQuery,
  useHousekeepingRoomsQuery,
} from "@/services/mock/queries";
import { KpiCard } from "@/components/ui/Primitives";
import { WaitlistView } from "./WaitlistView";
import { BlocksView } from "./BlocksView";
import { TimelineView } from "./TimelineView";
import { TableView } from "./TableView";
import { AvailabilityView } from "./AvailabilityView";
import { RateView } from "./RateView";
import { RestrictionsView } from "./RestrictionsView";



const sourceColor: Record<string, string> = {
  "Booking.com": "var(--color-info)",
  Expedia: "var(--color-warning)",
  Direct: "var(--color-primary)",
  Agoda: "var(--color-success)",
  Airbnb: "var(--color-error)",
  "Maintenance": "#d14343ff",
};

type BadgeTone = "success" | "warning" | "error" | "info" | "neutral" | "brand" | "dark";

const statusTone = (s: string) =>
  (({
    Confirmed: "success",
    "Checked-In": "info",
    "Checked-Out": "neutral",
    Pending: "warning",
    Cancelled: "error",
    "No-Show": "dark",
  })[s] as BadgeTone) || "neutral";

type View = "timeline" | "table" | "availability" | "rate" | "restrictions" | "waitlist" | "blocks";

export function ReservationsFeature() {
  const { data: waitlist = [] } = useWaitlistQuery();
  const { data: groupBlocks = [] } = useGroupBlocksQuery();
  const { data: arrivalsToday = [] } = useArrivalsTodayQuery();
  const { data: departuresToday = [] } = useDeparturesTodayQuery();
  const { data: occupancyByType = [] } = useOccupancyByTypeQuery();
  const { data: mealPlans = [] } = useMealPlansQuery();
  const { data: ratePlans = [] } = useRatePlansQuery();
  const { data: hotelPackages = [] } = useHotelPackagesQuery();
  const { data: addOnProducts = [] } = useAddOnProductsQuery();

  const [dbReservations, setDbReservations] = useState<any[]>([]);
  const [dbRooms, setDbRooms] = useState<any[]>([]);
  const [dbTypes, setDbTypes] = useState<any[]>([]);
  const [dbRestrictions, setDbRestrictions] = useState<any[]>([]);
  const [rateCalendar, setRateCalendar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("timeline");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [showLegend, setShowLegend] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Set timelineStartDate to the 1st of the current month
  const [timelineStartDate, setTimelineStartDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const propertyId = localStorage.getItem("retrod:active-property-id") || "";
    if (!propertyId) return;
    
    setLoading(true);
    
    // Calculate the active month window based on timelineStartDate
    const activeYear = new Date(timelineStartDate).getFullYear();
    const activeMonth = new Date(timelineStartDate).getMonth();
    const daysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
    
    const startStr = `${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-01`;
    const endStr = `${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
    
    Promise.all([
      // Only fetch active bookings or those intersecting our month window for speed!
      fetchApi<any>(`/api/reservations/bookings/?start_date=${startStr}&end_date=${endStr}`).catch(() => ({ results: [] })),
      fetchApi<any>("/api/inventory/units/?limit=1000").catch(() => ({ results: [] })),
      fetchApi<any>("/api/inventory/types/").catch(() => ({ results: [] })),
      fetchApi<any>(`/api/restrictions/?start_date=${startStr}&end_date=${endStr}&limit=1000`).catch(() => ({ results: [] })),
      fetchApi<any>(`/api/rates/calendar/property/${propertyId}?start_date=${startStr}&end_date=${endStr}`).catch(() => []),
      fetchApi<any>("/api/rates/rate-plan-inventories/?limit=100").catch(() => ({ results: [] })),
    ]).then(([resBookings, resUnits, resTypes, resRestrictions, resRates, resRatePlans]) => {
      setDbReservations(resBookings.results || resBookings || []);
      setDbRooms(resUnits.results || resUnits || []);
      
      const typesList = resTypes.results || resTypes || [];
      setDbTypes(typesList);
      setDbRestrictions(resRestrictions.results || resRestrictions || []);
      
      // Base rates map: roomTypeId -> base_rate
      const baseRatesMap: Record<string, number> = {};
      const ratePlansList = resRatePlans.results || resRatePlans || [];
      ratePlansList.forEach((rp: any) => {
        const rtypeId = rp.inventory_unit_type?.id || rp.inventory_unit_type;
        if (rtypeId && rp.base_rate) {
          baseRatesMap[rtypeId] = parseFloat(rp.base_rate);
        }
      });

      // Grouped RateCalendar by room type ID and date
      const groupedRates: Record<string, Record<string, any>> = {};
      const ratesList = resRates.results || resRates || [];
      ratesList.forEach((rate: any) => {
        const rtypeId = rate.inventory_unit_type?.id || rate.inventory_unit_type;
        if (rtypeId) {
          if (!groupedRates[rtypeId]) groupedRates[rtypeId] = {};
          groupedRates[rtypeId][rate.date] = rate;
        }
      });

      const days = Array.from({ length: daysInMonth }).map((_, i) => {
        const d = new Date(activeYear, activeMonth, 1 + i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dayVal = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dayVal}`;
      });

      // Active / Sellable room types only
      const sellableTypes = typesList.filter((t: any) => t.is_sellable !== false);

      const formattedRates = sellableTypes.map((t: any) => {
        const typeDays = days.map(dateStr => {
          const r = groupedRates[t.id]?.[dateStr];
          const rateVal = r ? parseFloat(r.amount) : (baseRatesMap[t.id] || 0);
          const isWeekend = new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6;
          return {
            rate: rateVal,
            tag: r && r.tag ? r.tag : (rateVal > 20000 ? "Event" : isWeekend ? "Weekend" : "BAR"),
          };
        });
        return { type: t.name, days: typeDays };
      });

      setRateCalendar(formattedRates);
    }).finally(() => setLoading(false));
  }, [timelineStartDate, refreshTrigger]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("app:sidebar-collapse", { detail: { collapsed: isFullscreen } })
    );
  }, [isFullscreen]);

function buildDateTime(dateStr: string, timeStr?: string | null, defaultHour = 12): Date {
  const d = new Date(dateStr);
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    let hours = defaultHour;
    let minutes = 0;
    if (timeStr) {
      const cleaned = timeStr.trim().toLowerCase();
      const match = cleaned.match(/^(\d+)(?::(\d+))?\s*(am|pm)?$/);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = match[2] ? parseInt(match[2], 10) : 0;
        const ampm = match[3];
        if (ampm === "pm" && hours < 12) hours += 12;
        if (ampm === "am" && hours === 12) hours = 0;
      } else {
        const colonMatch = cleaned.match(/^(\d+):(\d+)/);
        if (colonMatch) {
          hours = parseInt(colonMatch[1], 10);
          minutes = parseInt(colonMatch[2], 10);
        }
      }
    }
    return new Date(year, month, day, hours, minutes, 0, 0);
  }
  return d;
}

  const activeYear = useMemo(() => new Date(timelineStartDate).getFullYear(), [timelineStartDate]);
  const activeMonth = useMemo(() => new Date(timelineStartDate).getMonth(), [timelineStartDate]);
  const daysInMonth = useMemo(() => new Date(activeYear, activeMonth + 1, 0).getDate(), [activeYear, activeMonth]);

  const handlePrevMonth = () => {
    const d = new Date(timelineStartDate);
    d.setMonth(d.getMonth() - 1);
    setTimelineStartDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
  };

  const handleNextMonth = () => {
    const d = new Date(timelineStartDate);
    d.setMonth(d.getMonth() + 1);
    setTimelineStartDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
  };

  // Today's 0-based index within the active month view (-1 if not in this month)
  const todayIndex = useMemo(() => {
    const now = new Date();
    if (now.getFullYear() === activeYear && now.getMonth() === activeMonth) {
      return now.getDate() - 1; // 0-based
    }
    return -1;
  }, [activeYear, activeMonth]);

  // Dynamic Timeline Logic
  const timelineDays = useMemo(() => {
    return Array.from({ length: daysInMonth }).map((_, i) => {
      const d = new Date(activeYear, activeMonth, i + 1);
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    });
  }, [activeYear, activeMonth, daysInMonth]);

  const timelineRooms = useMemo(() => {
    if (dbRooms.length === 0) return [];
    return dbRooms
      .map((r: any) => {
        const typeObj = dbTypes.find((t: any) => t.id === r.inventory_unit_type);
        return {
          num: r.name,
          type: typeObj ? typeObj.name : "Deluxe Room",
        };
      })
      .sort((a, b) => a.num.localeCompare(b.num, undefined, { numeric: true }));
  }, [dbRooms, dbTypes]);

  const allTimelineBars = useMemo(() => {
    const bars: any[] = [];
    dbReservations.forEach((res: any) => {
      if (res.status === "CANCELLED" || res.status === "NO_SHOW") return;
      
      (res.room_allocations || []).forEach((alloc: any) => {
        if (!alloc.unit_name) return; // Unassigned
        
        const startObj = new Date(activeYear, activeMonth, 1, 0, 0, 0, 0);
        
        const ciStr = alloc.check_in_date || res.arrival_date;
        const coStr = alloc.check_out_date || res.departure_date;
        
        if (!ciStr || !coStr) return;
        
        let ciTime = res.event_start_time || res.check_in_time;
        if (!ciTime && res.checked_in_at) {
          const dateMatch = res.checked_in_at.match(/T(\d{2}:\d{2})/);
          if (dateMatch) ciTime = dateMatch[1];
        }
        if (!ciTime) ciTime = "14:00"; // default 2 PM check-in
        
        let coTime = res.event_end_time || res.check_out_time;
        if (!coTime && res.checked_out_at) {
          const dateMatch = res.checked_out_at.match(/T(\d{2}:\d{2})/);
          if (dateMatch) coTime = dateMatch[1];
        }
        if (!coTime) coTime = "10:00"; // default 10 AM check-out
        
        const ciObj = buildDateTime(ciStr, ciTime, 14);
        const coObj = buildDateTime(coStr, coTime, 10);
        
        if (coObj <= startObj) return;
        
        const dayDiff = (ciObj.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24);
        const nightsCount = (coObj.getTime() - ciObj.getTime()) / (1000 * 60 * 60 * 24);
        
        bars.push({
          id: `${res.id}-${alloc.id}`,
          reservationId: res.id,
          room: alloc.unit_name,
          start: dayDiff,
          span: nightsCount > 0 ? nightsCount : 1,
          label: res.primary_guest_name || "Guest",
          source: res.reservation_source_name || "Direct",
        });
      });
    });

    // Append room blocks / maintenance blocks as timeline bars
    groupBlocks.forEach((b: any) => {
      if (b.status === "CLOSED" || b.status === "CANCELLED") return;
      if (b.block_type !== "Conference Block") return;
      if (!b.start_date || !b.end_date || !b.pickup_location) return;
      
      const startObj = new Date(activeYear, activeMonth, 1, 0, 0, 0, 0);
      
      const bStart = buildDateTime(b.start_date, b.event_start_time || "00:00", 0);
      const bEnd = buildDateTime(b.end_date, b.event_end_time || "00:00", 0);
      
      if (bEnd <= startObj) return;
      
      const dayDiff = (bStart.getTime() - startObj.getTime()) / (1000 * 60 * 60 * 24);
      const nightsCount = (bEnd.getTime() - bStart.getTime()) / (1000 * 60 * 60 * 24);
      
      const blockedRoomNames = b.pickup_location.split(",");
      blockedRoomNames.forEach((roomName: string) => {
        bars.push({
          id: `${b.id}-${roomName}`,
          reservationId: null,
          room: roomName,
          start: dayDiff,
          span: nightsCount > 0 ? nightsCount : 1,
          label: b.name || "Blocked",
          source: "Maintenance",
        });
      });
    });

    return bars;
  }, [dbReservations, groupBlocks, activeYear, activeMonth]);

  const mappedReservations = useMemo(() => {
    return dbReservations.map((r: any) => {
      const firstAlloc = r.room_allocations?.[0];
      
      // Map API status string to match UI StatusBadge choices
      let uiStatus = r.status || "Confirmed";
      if (r.status === "CONFIRMED") uiStatus = "Confirmed";
      else if (r.status === "CHECKED_IN") uiStatus = "Checked-In";
      else if (r.status === "CHECKED_OUT") uiStatus = "Checked-Out";
      else if (r.status === "CANCELLED") uiStatus = "Cancelled";
      else if (r.status === "NO_SHOW") uiStatus = "No-Show";

      return {
        id: r.id,
        guest: r.primary_guest_name || "Guest",
        room: firstAlloc ? firstAlloc.unit_name || "Unassigned" : "Unassigned",
        type: firstAlloc ? firstAlloc.inventory_snapshot?.name || firstAlloc.unit_type_code || "Room" : "Room",
        ci: r.arrival_date || "",
        co: r.departure_date || "",
        source: r.reservation_source_name || "Direct",
        amount: parseFloat(r.total_amount) || 0,
        balance: parseFloat(r.balance_amount) || 0,
        status: uiStatus,
      };
    });
  }, [dbReservations]);

  const dynamicAvailabilityMatrix = useMemo(() => {
    return dbTypes
      .filter((type: any) => type.is_sellable !== false)
      .map((type: any) => {
        const typeRooms = dbRooms.filter((r: any) => r.inventory_unit_type === type.id);
        const totalCount = typeRooms.length || 5;
        
        const days = Array.from({ length: daysInMonth }).map((_, i) => {
          const dateObj = new Date(activeYear, activeMonth, i + 1);
          dateObj.setHours(0,0,0,0);
          
          let soldCount = 0;
          dbReservations.forEach((res: any) => {
            if (res.status === "CANCELLED" || res.status === "NO_SHOW") return;
            (res.room_allocations || []).forEach((alloc: any) => {
              const allocTypeId = alloc.inventory_unit_type;
              const allocTypeObj = dbTypes.find((t: any) => t.id === allocTypeId);
              const allocTypeName = allocTypeObj?.name || alloc.inventory_snapshot?.name || alloc.unit_type_code;
              
              const matchesType = (allocTypeId === type.id) || 
                (allocTypeName && type.name && allocTypeName.toLowerCase().trim() === type.name.toLowerCase().trim());
                
              if (!matchesType) return;
              
              const ci = new Date(alloc.check_in_date || res.arrival_date);
              ci.setHours(0,0,0,0);
              const co = new Date(alloc.check_out_date || res.departure_date);
              co.setHours(0,0,0,0);
              
              if (dateObj >= ci && dateObj < co) {
                soldCount++;
              }
            });
          });

          // Count active room blocks (maintenance) for this room type
          let blockedCount = 0;
          groupBlocks.forEach((b: any) => {
            if (b.status === "CLOSED" || b.status === "CANCELLED") return;
            if (b.block_type !== "Conference Block") return;
            if (!b.start_date || !b.end_date) return;
            
            const bStart = new Date(b.start_date);
            bStart.setHours(0,0,0,0);
            const bEnd = new Date(b.end_date);
            bEnd.setHours(0,0,0,0);
            
            if (dateObj >= bStart && dateObj < bEnd) {
              if (b.pickup_location) {
                const blockedRoomNames = b.pickup_location.split(",");
                const roomsOfThisTypeBlocked = typeRooms.filter((tr: any) => blockedRoomNames.includes(tr.name)).length;
                blockedCount += roomsOfThisTypeBlocked;
              } else {
                blockedCount += b.total_rooms || 0;
              }
            }
          });
          
          return {
            total: totalCount,
            sold: soldCount + blockedCount,
          };
        });
        
        return {
          type: type.name,
          days: days,
        };
      });
  }, [dbTypes, dbRooms, dbReservations, groupBlocks, daysInMonth, activeYear, activeMonth]);

  const filtered = useMemo(() => {
    if (statusFilter === "All") return mappedReservations;
    return mappedReservations.filter((r) => r.status.toUpperCase() === statusFilter.toUpperCase().replace("-", ""));
  }, [mappedReservations, statusFilter]);

  const totalRooms = dbRooms.length || 10;
  const occupied = useMemo(() => {
    let count = 0;
    dbReservations.forEach((res: any) => {
      if (res.status === "CHECKED_IN") {
        count += (res.room_allocations || []).length;
      }
    });
    return count;
  }, [dbReservations]);

  const occPct = Math.round((occupied / totalRooms) * 100);
  
  const arrivalsCount = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return dbReservations.filter((r) => r.arrival_date === todayStr).length;
  }, [dbReservations]);

  const departuresCount = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return dbReservations.filter((r) => r.departure_date === todayStr).length;
  }, [dbReservations]);

  const cancellationsToday = dbReservations.filter((r) => r.status === "CANCELLED").length;

  return (
    <div>
      {!isFullscreen && (
        <PageHeader
          eyebrow="Operations"
          title="Reservations"
          description="Plan, view, and manage every booking across rooms and channels."
          actions={
            <>
              <Link to="/reservations/new">
                <Button size="sm">
                  <Plus className="h-3.5 w-3.5" />
                  New reservation
                </Button>
              </Link>
            </>
          }
        />
      )}

      <div className={isFullscreen ? "w-full p-0 m-0" : "responsive-page-x space-y-5 py-4 sm:space-y-6 sm:py-6"}>
        {!isFullscreen && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <KpiCard label="Total reservations" value={String(dbReservations.length)} accent="brand" />
              <KpiCard label="Check-ins today" value={String(arrivalsCount)} accent="success" />
              <KpiCard
                label="Check-outs today"
                value={String(departuresCount)}
                accent="warning"
              />
              <KpiCard label="Occupancy" value={`${occPct}%`} accent="info" />
              <KpiCard
                label="Cancellations"
                value={String(cancellationsToday)}
                deltaTone="error"
                accent="error"
              />
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-disabled" />
                <input
                  className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-[13px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  placeholder="Search guest, ID, room, phone, email…"
                />
              </div>
              <div className="w-full overflow-x-auto sm:w-auto">
                <div className="flex min-w-max rounded-md border border-border bg-surface p-0.5 text-[12px]">
                  {(
                    [
                      "timeline",
                      "table",
                      "availability",
                      "rate",
                      "restrictions",
                      "waitlist",
                      "blocks",
                    ] as View[]
                  ).map((v) => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className={`rounded px-3 py-1 capitalize transition ${
                        view === v
                          ? "bg-foreground text-background"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {v === "rate"
                        ? "Rate Cal"
                        : v === "restrictions"
                          ? "Restrictions"
                          : v === "availability"
                            ? "Availability"
                            : v === "waitlist"
                              ? "Waitlist"
                              : v === "blocks"
                                ? "Blocks"
                                : v}
                    </button>
                  ))}
                </div>
              </div>
              {view === "table" && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8 rounded-md border border-border bg-surface px-2 text-[12px]"
                >
                  {[
                    "All",
                    "Confirmed",
                    "Checked-In",
                    "Pending",
                    "Cancelled",
                    "No-Show",
                    "Checked-Out",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              )}
              <div className="flex w-full flex-wrap items-center gap-2 text-[11px] text-text-secondary sm:ml-auto sm:w-auto">
                {view === "timeline" && (
                  <div className="flex items-center gap-2 mr-4">
                    <button
                      onClick={handlePrevMonth}
                      className="h-8 px-2.5 rounded-md border border-border bg-surface text-[12px] font-medium hover:bg-surface-2 transition"
                    >
                      &larr; Prev Month
                    </button>
                    <span className="font-semibold text-text-primary text-[12px] px-1.5 uppercase">
                      {new Date(timelineStartDate).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={handleNextMonth}
                      className="h-8 px-2.5 rounded-md border border-border bg-surface text-[12px] font-medium hover:bg-surface-2 transition"
                    >
                      Next Month &rarr;
                    </button>
                  </div>
                )}
                {view === "timeline" && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowLegend(!showLegend)}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-text-secondary hover:bg-surface-2 hover:text-text-primary transition focus:outline-none cursor-pointer"
                      title="View legend"
                    >
                      <span className="font-serif text-[12px] font-bold">i</span>
                    </button>
                    {showLegend && (
                      <div className="absolute right-0 top-8 z-50 flex flex-col gap-2 rounded-lg border border-border bg-surface p-3 shadow-lg min-w-[180px]">
                        <div className="text-[11px] font-semibold text-text-primary mb-1 border-b border-border pb-1">Channels</div>
                        <span className="flex items-center gap-2 text-[11px] text-text-secondary font-medium">
                          <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: "var(--color-primary)" }} />
                          Direct
                        </span>
                        <div className="text-[11px] font-semibold text-text-primary mt-2 mb-1 border-b border-border pb-1 pt-1">Indicators</div>
                        <span className="flex items-center gap-2 text-[11px] text-text-secondary font-medium">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: "#d14343ff" }} />
                          Maintenance
                        </span>
                        <span className="flex items-center gap-2 text-[11px] text-text-secondary font-medium">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" />
                          Stay Over
                        </span>
                        <span className="flex items-center gap-2 text-[11px] text-text-secondary font-medium">
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                          Due Out
                        </span>
                        <span className="flex items-center gap-2 text-[11px] text-text-secondary font-medium">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                          Confirmed Reservation
                        </span>
                        <span className="flex items-center gap-2 text-[11px] text-text-secondary font-medium">
                          <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
                          Cancelled Reservation
                        </span>
                        <span className="flex items-center gap-2 text-[11px] text-text-secondary font-medium">
                          <span className="h-2.5 w-2.5 rounded-full bg-slate-400 shrink-0 border border-dashed border-slate-600" />
                          Unassigned
                        </span>
                        <span className="flex items-center gap-2 text-[11px] text-text-secondary font-medium">
                          <span className="h-2.5 w-2.5 rounded-full bg-teal-500 shrink-0" />
                          Arrival
                        </span>
                        <span className="flex items-center gap-2 text-[11px] text-text-secondary font-medium">
                          <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shrink-0" />
                          Day Use
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {loading ? (
          <div className="flex h-96 items-center justify-center rounded-xl border border-border bg-surface shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-[13px] font-medium text-text-secondary">Loading reservations data...</span>
            </div>
          </div>
        ) : (
          <>
            {view === "timeline" && (
              <TimelineView 
                days={timelineDays} 
                rooms={timelineRooms} 
                bars={allTimelineBars} 
                sourceColor={sourceColor} 
                todayIndex={todayIndex} 
                onBarClick={() => setView("blocks")}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                handlePrevMonth={handlePrevMonth}
                handleNextMonth={handleNextMonth}
                timelineStartDate={timelineStartDate}
              />
            )}

            {view === "table" && (
              <TableView filtered={filtered} sourceColor={sourceColor} statusTone={statusTone} />
            )}

            {view === "availability" && <AvailabilityView availabilityMatrix={dynamicAvailabilityMatrix} days={timelineDays} todayIndex={todayIndex} />}

            {view === "rate" && <RateView rateCalendar={rateCalendar} onRefresh={() => setRefreshTrigger(prev => prev + 1)} />}

            {view === "restrictions" && <RestrictionsView restrictions={dbRestrictions} dbTypes={dbTypes} />}

            {view === "waitlist" && <WaitlistView entries={waitlist} />}

            {view === "blocks" && <BlocksView blocks={groupBlocks} />}
          </>
        )}
      </div>
    </div>
  );
}
export default ReservationsFeature;
