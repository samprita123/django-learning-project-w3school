import { Card, CardHeader, StatusBadge, Button } from "@/components/ui/Primitives";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchApi } from "@/services/api/core";
import { useSaveGroupBlockMutation } from "@/services/mock/queries";

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
export function BlocksView({ blocks }: { blocks: any[] }) {
  const [filterMonth, setFilterMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [blockPurpose, setBlockPurpose] = useState("Maintenance");
  const [blockName, setBlockName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [roomType, setRoomType] = useState("all");
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [roomCount, setRoomCount] = useState("1");
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const saveMutation = useSaveGroupBlockMutation();

  useEffect(() => {
    // Fetch room types
    fetchApi<any>("/api/inventory/types/?is_sellable=true&limit=100")
      .then(res => setRoomTypes(res.results || res || []))
      .catch(() => {});
    
    // Fetch dynamic rooms
    fetchApi<any>("/api/inventory/units/?limit=1000")
      .then(res => setRoomsList(res.results || res || []))
      .catch(() => {});
  }, []);

  const openAddBlock = () => {
    setEditingBlockId(null);
    setBlockName("");
    setStartDate("");
    setEndDate("");
    setRoomCount("1");
    setSelectedRooms([]);
    setIsAddOpen(true);
  };

  const openEditBlock = (b: any) => {
    setEditingBlockId(b.id);
    setBlockName(b.name);
    setBlockPurpose("Maintenance");
    setStartDate(b.start_date || "");
    setEndDate(b.end_date || "");
    setRoomCount((b.total_rooms || 1).toString());
    setSelectedRooms(b.pickup_location ? b.pickup_location.split(",") : []); 
    setIsAddOpen(true);
  };

  // Filter available rooms dynamically by chosen room type
  const filteredRooms = roomsList.filter((room: any) => {
    const typeId = room.inventory_unit_type?.id || room.inventory_unit_type;
    return roomType === "all" || typeId === roomType;
  });

  const toggleRoom = (num: string) => {
    setSelectedRooms((prev) => 
      prev.includes(num) ? prev.filter((r) => r !== num) : [...prev, num]
    );
  };

  const handleAddBlock = () => {
    if (!blockName || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const propertyId = localStorage.getItem("retrod:active-property-id");
    if (!propertyId) {
      toast.error("No active property selected");
      return;
    }

    if (selectedRooms.length === 0) {
      toast.error("Please select at least one room to block.");
      return;
    }

    const payload: Record<string, any> = {
      name: blockName,
      block_type: "Conference Block", // Standard Room Block backend choice
      start_date: startDate,
      end_date: endDate,
      cutoff_date: endDate,
      total_rooms: selectedRooms.length,
      property: propertyId,
      pickup_location: selectedRooms.join(","),
    };

    if (!editingBlockId) {
      payload.code = `GRP-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    saveMutation.mutate(
      { id: editingBlockId || undefined, data: payload },
      {
        onSuccess: () => {
          toast.success(editingBlockId ? "Block updated successfully!" : "Block created successfully!");
          setIsAddOpen(false);
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to save block");
        }
      }
    );
  };

  // Only show maintenance/internal blocks (filter out actual guest group bookings)
  const filteredBlocks = blocks.filter((b) => {
    if (b.block_type !== "Conference Block") return false;
    if (!filterMonth || !b.start_date) return true;
    return b.start_date.startsWith(filterMonth);
  });

  return (
    <>
      <Card>
        <CardHeader 
          title="Room blocks & maintenance" 
          hint={`${filteredBlocks.length} active room blocks`} 
          action={
            <div className="flex items-center gap-3">
              <input 
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="h-8 rounded-md border border-border bg-surface px-2 text-sm focus:border-primary focus:outline-none"
              />
              <Button size="sm" onClick={openAddBlock}>
                <Plus className="h-4 w-4 mr-1" />
                Add Block
              </Button>
            </div>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-surface-2/40 text-left">
                {["Block Code", "Block Reason", "Dates", "Blocked Rooms", "Cut-off", "Status", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filteredBlocks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-secondary">
                    No active room blocks found for this month.
                  </td>
                </tr>
              ) : (
                filteredBlocks.map((b) => {
                  const blockedCount = b.total_rooms || 1;
                  const displayStatus = b.status === "OPEN" ? "Open" : b.status === "CLOSED" ? "Closed" : b.status;
                  return (
                    <tr key={b.id} className="border-b border-border-subtle hover:bg-surface-2/50">
                      <td className="px-4 py-3 font-mono text-[12px]">{b.code || b.id.substring(0, 8)}</td>
                      <td className="px-4 py-3 font-medium text-text-primary">{b.name}</td>
                      <td className="px-4 py-3 text-text-secondary">
                        {b.start_date} to {b.end_date}
                      </td>
                      <td className="px-4 py-3 font-mono">{blockedCount}</td>
                      <td className="px-4 py-3 text-text-secondary">{b.cutoff_date || b.end_date}</td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          tone={
                            b.status === "OPEN" ? "info" : b.status === "CLOSED" ? "success" : "neutral"
                          }
                        >
                          {displayStatus}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEditBlock(b)}
                          className="text-[12px] font-medium text-primary hover:underline"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent side="right" className="sm:max-w-md w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingBlockId ? "Edit Block" : "Add Block"}</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Purpose</label>
              <select 
                className="col-span-3 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                value={blockPurpose}
                onChange={(e) => setBlockPurpose(e.target.value)}
              >
                <option value="Maintenance">Maintenance</option>
                <option value="Internal">Internal Use</option>
              </select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Block Reason</label>
              <input 
                type="text"
                placeholder="e.g. Plumbing Repair, AC Maintenance"
                className="col-span-3 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Room Type</label>
              <select 
                className="col-span-3 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
              >
                <option value="all">All Room Types</option>
                {roomTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
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

            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right text-sm font-medium pt-2">Select Rooms</label>
              <div className="col-span-3 space-y-4">
                <div className="rounded-md border border-border bg-surface p-3">
                  <div className="mb-2 text-[11px] font-medium text-text-secondary uppercase tracking-wider flex justify-between">
                    <span>Available Rooms</span>
                    <span className="text-primary">{selectedRooms.length} selected</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                    {filteredRooms.length === 0 ? (
                      <span className="col-span-4 text-center text-text-secondary py-4 text-xs">
                        No rooms available for this selection.
                      </span>
                    ) : (
                      filteredRooms.map((room) => {
                        const isSelected = selectedRooms.includes(room.name);
                        return (
                          <button
                            key={room.id}
                            type="button"
                            onClick={() => toggleRoom(room.name)}
                            className={`flex items-center justify-center rounded border p-2 text-xs transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary font-medium"
                                : "border-border hover:border-primary/50 text-text-secondary"
                            }`}
                          >
                            {room.name}
                          </button>
                        );
                      })
                    )}
                  </div>
              </div>
            </div>
            </div>
          </div>
          <SheetFooter className="mt-4 border-t pt-4">
            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={saveMutation.isPending}>Cancel</Button>
            <Button onClick={handleAddBlock} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                </span>
              ) : editingBlockId ? (
                "Save Changes"
              ) : (
                "Create Block"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
export default BlocksView;
