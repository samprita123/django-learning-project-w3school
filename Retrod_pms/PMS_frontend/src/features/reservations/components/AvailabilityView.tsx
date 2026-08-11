import { Card, CardHeader, Button } from "@/components/ui/Primitives";
import { type AvailabilityMatrixEntry } from "@/types/pms";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";

interface AvailabilityViewProps {
  availabilityMatrix: AvailabilityMatrixEntry[];
  days?: string[];
  todayIndex?: number; // 0-based index of today in days[]; -1 if not this month
}

export function AvailabilityView({ availabilityMatrix, days = [], todayIndex = -1 }: AvailabilityViewProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      const container = scrollContainerRef.current;
      if (container && todayIndex >= 0) {
        const columnOffset = 160 + todayIndex * 60 + 30;
        const scrollTarget = columnOffset - container.clientWidth / 2;
        container.scrollLeft = scrollTarget;
      }
    }, 100);
  }, [todayIndex]);
  const [blockPurpose, setBlockPurpose] = useState("Group");
  const [blockName, setBlockName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [roomType, setRoomType] = useState("All Room Types");
  const [roomCount, setRoomCount] = useState("1");

  const handleBlockClick = (type: string, dateNum: number) => {
    setRoomType(type);
    setStartDate(`2026-05-${dateNum.toString().padStart(2, '0')}`);
    setEndDate("");
    setIsAddOpen(true);
  };

  const handleAddBlock = () => {
    if (!blockName || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success(`Block for ${blockName} created successfully!`);
    setIsAddOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader title="Availability calendar" hint="14-day · click a cell to block rooms" />
      <div className="p-3 sm:p-4">
        <div className="space-y-2 md:hidden">
          {availabilityMatrix.map((row) => (
            <div key={row.type} className="rounded-md border border-border-subtle bg-surface p-3">
              <div className="mb-2 text-[12px] font-semibold text-text-primary">{row.type}</div>
              <div className="grid grid-cols-7 gap-1.5">
                {row.days.map((d, i) => {
                  const free = d.total - d.sold;
                  const pct = free / d.total;
                  const isPast = todayIndex >= 0 && i < todayIndex;
                  const isToday = i === todayIndex;
                  const cls = isPast
                    ? "bg-border-subtle text-text-disabled opacity-60"
                    : free === 0
                      ? "bg-[oklch(0.96_0.06_27)] text-[var(--color-error)]"
                      : (free <= 1 || pct <= 0.34)
                        ? "bg-[oklch(0.96_0.06_70)] text-[var(--color-warning)]"
                        : "bg-[oklch(0.96_0.05_152)] text-[var(--color-success)]";
                  return (
                    <button
                      key={i}
                      onClick={() => handleBlockClick(row.type, days[i] ? parseInt(days[i].split(" ")[0]) : 15 + i)}
                      className={`flex flex-col items-center justify-center rounded py-2 text-[10px] font-mono font-medium ring-1 ${isToday ? "ring-primary ring-2" : "ring-transparent"} ${cls}`}
                    >
                      <span>{days[i] ? days[i].split(" ")[0] : 15 + i}</span>
                      <span>{free}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div ref={scrollContainerRef} className="table-scroll-shadow hidden overflow-x-auto md:block w-full max-w-full pb-3">
          <div style={{ minWidth: `${160 + (days.length * 60)}px` }}>
            <div
              className="grid gap-px bg-border-subtle"
              style={{ gridTemplateColumns: `160px repeat(${days.length}, 1fr)` }}
            >
              <div className="bg-surface px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                Room type
              </div>
              {days.map((day, i) => {
                const isToday = i === todayIndex;
                const isPast = todayIndex >= 0 && i < todayIndex;
                return (
                  <div
                    key={i}
                    className={`px-1 py-2 text-center text-[10px] font-medium whitespace-nowrap ${
                      isToday
                        ? "bg-primary/10 text-primary font-bold"
                        : isPast
                          ? "bg-surface text-text-disabled"
                          : "bg-surface text-text-secondary"
                    }`}
                  >
                    {isToday ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[9px] font-bold">
                        {day.split(" ")[0]}
                      </span>
                    ) : (
                      day
                    )}
                  </div>
                );
              })}
              {availabilityMatrix.map((row) => (
                <div key={row.type} className="contents">
                  <div className="bg-surface px-3 py-2 text-[12px] font-medium text-text-primary">
                    {row.type}
                  </div>
                  {row.days.map((d, i) => {
                    const free = d.total - d.sold;
                    const pct = free / d.total;
                    const isPast = todayIndex >= 0 && i < todayIndex;
                    const isToday = i === todayIndex;
                    const cls = isPast
                      ? "bg-border-subtle/40 text-text-disabled"
                      : free === 0
                        ? "bg-[oklch(0.96_0.06_27)] text-[var(--color-error)]"
                        : (free <= 1 || pct <= 0.34)
                          ? "bg-[oklch(0.96_0.06_70)] text-[var(--color-warning)]"
                          : "bg-[oklch(0.96_0.05_152)] text-[var(--color-success)]";
                    return (
                      <button
                        key={i}
                        onClick={() => handleBlockClick(row.type, days[i] ? parseInt(days[i].split(" ")[0]) : 15 + i)}
                        className={`flex flex-col items-center justify-center py-2 text-[11px] font-mono font-medium transition hover:scale-105 outline-none ${isToday ? "ring-2 ring-inset ring-primary" : ""} ${cls}`}
                        style={{ opacity: isPast ? 0.5 : 1 }}
                      >
                        <span>{free}</span>
                        <span className="text-[9px] opacity-60">/{d.total}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[oklch(0.96_0.05_152)]" />
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[oklch(0.96_0.06_70)]" />
            Few left
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[oklch(0.96_0.06_27)]" />
            Sold out
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-border-subtle opacity-60" />
            Past
          </span>
        </div>
      </div>
    </Card>
      
    <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent side="right" className="sm:max-w-md w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Block</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Purpose</label>
              <select 
                className="col-span-3 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                value={blockPurpose}
                onChange={(e) => setBlockPurpose(e.target.value)}
              >
                <option value="Group">Group Booking</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Internal">Internal Use</option>
                <option value="Allotment">Allotment</option>
              </select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Block Reason</label>
              <input 
                type="text"
                placeholder={blockPurpose === "Maintenance" ? "e.g. Plumbing Repair" : "e.g. Wedding Group"}
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
                <option value="All Room Types">All Room Types</option>
                <option value="Deluxe King">Deluxe King</option>
                <option value="Executive Suite">Executive Suite</option>
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Start Date</label>
              <input 
                type="date"
                className="col-span-3 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">End Date</label>
              <input 
                type="date"
                className="col-span-3 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">No. of Rooms</label>
              <input 
                type="number"
                min="1"
                className="col-span-3 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                value={roomCount}
                onChange={(e) => setRoomCount(e.target.value)}
              />
            </div>
          </div>
          <SheetFooter className="mt-4 border-t pt-4">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddBlock}>Create Block</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
export default AvailabilityView;
