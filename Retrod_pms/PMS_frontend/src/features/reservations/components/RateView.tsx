import { Card, CardHeader, Button } from "@/components/ui/Primitives";
import { type RateCalendarEntry } from "@/types/pms";
import { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { toast } from "sonner";
import { fetchApi } from "@/services/api/core";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface RateViewProps {
  rateCalendar: RateCalendarEntry[];
  onRefresh?: () => void;
}

/* ── tiny inline range-calendar ─────────────────────────────────────── */
function RangeCalendar({
  startDate,
  endDate,
  onRangeChange,
}: {
  startDate: string;
  endDate: string;
  onRangeChange: (s: string, e: string) => void;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState<Date>(
    startDate ? new Date(startDate) : new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selecting, setSelecting] = useState<"start" | "end">("start");
  const [hovered, setHovered] = useState<string>("");

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayVal = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dayVal}`;
  };
  const monthLabel = cursor.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const handleDayClick = (day: number) => {
    const clicked = fmt(new Date(year, month, day));
    if (selecting === "start") {
      onRangeChange(clicked, "");
      setSelecting("end");
    } else {
      if (clicked < startDate) {
        onRangeChange(clicked, startDate);
      } else {
        onRangeChange(startDate, clicked);
      }
      setSelecting("start");
    }
  };

  const isInRange = (day: number) => {
    const d = fmt(new Date(year, month, day));
    const end = endDate || hovered;
    if (!startDate || !end) return false;
    return d > startDate && d < end;
  };

  const isStart = (day: number) => fmt(new Date(year, month, day)) === startDate;
  const isEnd = (day: number) => fmt(new Date(year, month, day)) === endDate;

  return (
    <div className="rounded-xl border border-border bg-surface p-3 shadow-sm">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="rounded p-1 hover:bg-surface-2"
        >
          <ChevronLeft className="h-4 w-4 text-text-secondary" />
        </button>
        <span className="text-[13px] font-semibold text-text-primary">{monthLabel}</span>
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="rounded p-1 hover:bg-surface-2"
        >
          <ChevronRight className="h-4 w-4 text-text-secondary" />
        </button>
      </div>
      {/* Day names */}
      <div className="mb-1 grid grid-cols-7 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d} className="text-[10px] font-medium text-text-secondary py-1">
            {d}
          </span>
        ))}
      </div>
      {/* Days grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const start = isStart(day);
          const end = isEnd(day);
          const inRange = isInRange(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDayClick(day)}
              onMouseEnter={() => setHovered(fmt(new Date(year, month, day)))}
              onMouseLeave={() => setHovered("")}
              className={[
                "h-8 w-full text-[12px] transition-colors rounded",
                start || end
                  ? "bg-primary text-white font-semibold"
                  : inRange
                    ? "bg-primary/15 text-primary"
                    : "hover:bg-surface-2 text-text-primary",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
      {/* Hint */}
      <p className="mt-2 text-center text-[10px] text-text-secondary">
        {selecting === "start" ? "Click to select start date" : "Click to select end date"}
      </p>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
export function RateView({ rateCalendar, onRefresh }: RateViewProps) {
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);

  // Dynamic state
  const [roomTypes, setRoomTypes] = useState<{ id: string; name: string }[]>([]);
  const [mealPlans, setMealPlans] = useState<{ id: string; code: string; name: string }[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);

  // Form state
  const [selectedTypeId, setSelectedTypeId] = useState<string>("all");
  const [selectedMealPlanId, setSelectedMealPlanId] = useState<string>("");
  const [newRate, setNewRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const propertyId = localStorage.getItem("retrod:active-property-id") || "";

  /* Fetch room types and meal plans once when sheet opens */
  const fetchMeta = useCallback(async () => {
    if (roomTypes.length && mealPlans.length) return;
    setLoadingMeta(true);
    try {
      const [typesRes, mealsRes] = await Promise.all([
        fetchApi<any>("/api/inventory/types/?is_sellable=true&limit=500").catch(() => ({ results: [] })),
        fetchApi<any>("/api/rates/meal-plans/?limit=100").catch(() => ({ results: [] })),
      ]);
      setRoomTypes(typesRes.results || typesRes || []);
      setMealPlans(mealsRes.results || mealsRes || []);
    } finally {
      setLoadingMeta(false);
    }
  }, [roomTypes.length, mealPlans.length]);

  useEffect(() => {
    if (isBulkUpdateOpen) fetchMeta();
  }, [isBulkUpdateOpen, fetchMeta]);

  const handleBulkUpdate = async () => {
    if (!newRate) {
      toast.error("Please enter a new rate.");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please select a date range.");
      return;
    }
    if (!propertyId) {
      toast.error("No active property selected.");
      return;
    }

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        property_id: propertyId,
        inventory_unit_type_id: selectedTypeId === "all" ? "all" : selectedTypeId,
        start_date: startDate,
        end_date: endDate,
        new_rate: parseFloat(newRate),
      };
      if (selectedMealPlanId) body.meal_plan_id = selectedMealPlanId;

      const res = await fetchApi<any>("/api/rates/calendar/bulk-update-rates/", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const typeName =
        selectedTypeId === "all"
          ? "All Room Types"
          : roomTypes.find((r) => r.id === selectedTypeId)?.name || selectedTypeId;

      toast.success(
        `Rates updated for ${typeName} · ${startDate} → ${endDate} · ${res.calendar_records_rebuilt ?? 0} records rebuilt`
      );
      setIsBulkUpdateOpen(false);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update rates. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const numDays = rateCalendar.length > 0 ? rateCalendar[0].days.length : 30;

  return (
    <>
      <Card>
        <CardHeader
          title="Rate calendar"
          hint="BAR per room type · click to edit"
          action={
            <Button size="sm" variant="outline" onClick={() => setIsBulkUpdateOpen(true)}>
              Bulk update
            </Button>
          }
        />
        <div className="overflow-x-auto w-full">
          <div className="p-4" style={{ minWidth: `${160 + numDays * 65}px` }}>
            <div
              className="grid gap-px bg-border-subtle"
              style={{ gridTemplateColumns: `160px repeat(${numDays}, minmax(60px, 1fr))` }}
            >
              <div className="bg-surface px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-text-secondary sticky left-0 z-10 border-r border-border shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                Room type
              </div>
              {Array.from({ length: numDays }, (_, i) => (
                <div
                  key={i}
                  className="bg-surface px-1 py-2 text-center text-[10px] font-medium text-text-secondary"
                >
                  {i + 1}
                </div>
              ))}
              {rateCalendar.map((row) => (
                <div key={row.type} className="contents">
                  <div className="bg-surface px-3 py-2 text-[12px] font-medium text-text-primary sticky left-0 z-10 border-r border-border shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                    {row.type}
                  </div>
                  {row.days.map((d, i) => {
                    const cls =
                      d.tag === "Event"
                        ? "bg-primary-tint text-primary-pressed"
                        : d.tag === "Weekend"
                          ? "bg-[oklch(0.96_0.06_70)] text-[var(--color-warning)]"
                          : "bg-surface text-text-primary";
                    return (
                      <button
                        key={i}
                        className={`flex flex-col items-center justify-center py-2 text-[10px] font-mono transition hover:opacity-80 ${cls}`}
                      >
                        <span className="font-semibold">₹{Math.round(d.rate)}</span>
                        <span className="text-[8px] opacity-60">{d.tag}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Bulk Update Sheet */}
      <Sheet open={isBulkUpdateOpen} onOpenChange={setIsBulkUpdateOpen}>
        <SheetContent side="right" className="sm:max-w-lg w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Bulk Update Rates</SheetTitle>
          </SheetHeader>

          {loadingMeta ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-5 py-6">
              {/* Room Type */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Room Type</label>
                <select
                  className="col-span-3 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  value={selectedTypeId}
                  onChange={(e) => setSelectedTypeId(e.target.value)}
                >
                  <option value="all">All Room Types</option>
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Meal Plan */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Meal Plan</label>
                <select
                  className="col-span-3 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  value={selectedMealPlanId}
                  onChange={(e) => setSelectedMealPlanId(e.target.value)}
                >
                  <option value="">No specific plan (all)</option>
                  {mealPlans.length > 0 ? (
                    mealPlans.map((mp) => (
                      <option key={mp.id} value={mp.id}>
                        {mp.name} ({mp.code})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="EP">Room Only (EP)</option>
                      <option value="CP">Bed & Breakfast (CP)</option>
                      <option value="MAP">Half Board (MAP)</option>
                      <option value="AP">Full Board (AP)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Range Calendar */}
              <div className="grid grid-cols-4 gap-4">
                <label className="text-right text-sm font-medium pt-1">Date Range</label>
                <div className="col-span-3 space-y-2">
                  <RangeCalendar
                    startDate={startDate}
                    endDate={endDate}
                    onRangeChange={(s, e) => {
                      setStartDate(s);
                      setEndDate(e);
                    }}
                  />
                  {startDate && (
                    <p className="text-[11px] text-text-secondary">
                      {startDate}
                      {endDate ? ` → ${endDate}` : " (select end date)"}
                    </p>
                  )}
                </div>
              </div>

              {/* New Rate */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">New Rate (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="e.g. 15000"
                  className="col-span-3 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                />
              </div>
            </div>
          )}

          <SheetFooter className="mt-4 border-t pt-4">
            <Button variant="outline" onClick={() => setIsBulkUpdateOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdate} disabled={submitting || loadingMeta}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                "Update Rates"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
export default RateView;
