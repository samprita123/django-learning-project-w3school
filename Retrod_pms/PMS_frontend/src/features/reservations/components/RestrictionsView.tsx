import { Lock, Ban, AlertOctagon, Plus, Edit2, Trash2 } from "lucide-react";
import { Card, CardHeader, Button } from "@/components/ui/Primitives";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { fetchApi } from "@/services/api/core";

interface RestrictionsViewProps {
  restrictions: any[];
  dbTypes?: any[];
}

export function RestrictionsView({ restrictions, dbTypes = [] }: RestrictionsViewProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [restrictionKind, setRestrictionKind] = useState("Min Stay");
  const [roomType, setRoomType] = useState("All Room Types");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [value, setValue] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  const [year, month] = currentMonth.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  const mappedRestrictions = useMemo(() => {
    return (restrictions || []).map((r: any) => {
      let kind = "Min Stay";
      if (r.restriction_type === "MAX_LOS") kind = "Max Stay";
      else if (r.restriction_type === "CTA") kind = "CTA";
      else if (r.restriction_type === "CTD") kind = "CTD";
      else if (r.restriction_type === "STOP_SELL") kind = "Stop Sell";

      let typeName = "All Room Types";
      if (r.inventory_unit_type) {
        const typeObj = dbTypes.find((t: any) => t.id === r.inventory_unit_type);
        if (typeObj) typeName = typeObj.name;
      }

      let dayNum = 15;
      if (r.date) {
        dayNum = parseInt(r.date.split("-")[2]);
      }

      return {
        id: r.id,
        kind,
        type: typeName,
        date: dayNum,
        rawDate: r.date,
        value: r.restriction_value,
      };
    });
  }, [restrictions, dbTypes]);

  const dateRangeNights = useMemo(() => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [startDate, endDate]);

  const openAdd = (initialDate?: string) => {
    setEditingIndex(null);
    setRestrictionKind("Min Stay");
    setRoomType("All Room Types");
    setStartDate(initialDate || "");
    setEndDate("");
    setValue("");
    setIsAddOpen(true);
  };

  const openEdit = (index: number) => {
    const r = mappedRestrictions[index];
    setEditingIndex(index);
    setRestrictionKind(r.kind);
    // Find room type ID if we can
    const typeObj = dbTypes.find((t: any) => t.name === r.type);
    setRoomType(typeObj ? typeObj.id : "All Room Types");
    setStartDate(r.rawDate || `${currentMonth}-${r.date.toString().padStart(2, '0')}`);
    setEndDate(r.rawDate || "");
    setValue(r.value ? r.value.toString() : "");
    setIsAddOpen(true);
  };

  const handleAddRestriction = () => {
    let backendType = "MIN_LOS";
    if (restrictionKind === "Max Stay") backendType = "MAX_LOS";
    else if (restrictionKind === "CTA") backendType = "CTA";
    else if (restrictionKind === "CTD") backendType = "CTD";
    else if (restrictionKind === "Stop Sell") backendType = "STOP_SELL";

    const payload = {
      start_date: startDate,
      end_date: endDate || startDate,
      inventory_unit_type: roomType === "All Room Types" ? null : roomType,
      restriction_type: backendType,
      restriction_value: value ? parseInt(value) : null,
    };

    if (editingIndex !== null) {
      const targetId = mappedRestrictions[editingIndex].id;
      if (targetId) {
        fetchApi<any>(`/api/restrictions/${targetId}/`, {
          method: "PATCH",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" }
        })
          .then(() => {
            toast.success("Restriction updated successfully!");
            setIsAddOpen(false);
            window.location.reload();
          })
          .catch(() => toast.error("Failed to update restriction."));
      }
    } else {
      fetchApi<any>("/api/restrictions/bulk-create/", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      })
        .then(() => {
          toast.success("Restriction created successfully!");
          setIsAddOpen(false);
          window.location.reload();
        })
        .catch(() => toast.error("Failed to create restriction."));
    }
  };

  const confirmRemove = () => {
    if (deleteConfirmIndex !== null) {
      const targetId = mappedRestrictions[deleteConfirmIndex].id;
      if (targetId) {
        fetchApi<any>(`/api/restrictions/${targetId}/`, {
          method: "DELETE"
        })
          .then(() => {
            toast.success("Restriction removed");
            setDeleteConfirmIndex(null);
            window.location.reload();
          })
          .catch(() => toast.error("Failed to delete restriction."));
      } else {
        setDeleteConfirmIndex(null);
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader
          title="Restriction calendar"
          hint="Min Stay · CTA · CTD · Stop Sell"
          action={
            <Button size="sm" onClick={() => openAdd()}>
              <Plus className="h-3.5 w-3.5" />
              Add restriction
            </Button>
          }
        />
      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
        <div>
          <div className="label-uppercase mb-2">Active restrictions</div>
          <ul className="divide-y divide-border-subtle rounded-md border border-border max-h-[300px] overflow-y-auto">
            {mappedRestrictions.map((r, i) => {
              const Icon = r.kind.includes("Stop")
                ? Lock
                : r.kind.includes("CTA") || r.kind.includes("CTD")
                  ? Ban
                  : AlertOctagon;
              const tone = r.kind.includes("Stop")
                ? "error"
                : r.kind.includes("CTA") || r.kind.includes("CTD")
                  ? "warning"
                  : "info";
              return (
                <li key={i} className="flex items-center gap-3 px-4 py-3">
                  <Icon
                    className={`h-4 w-4 ${
                      tone === "error"
                        ? "text-[var(--color-error)]"
                        : tone === "warning"
                          ? "text-[var(--color-warning)]"
                          : "text-[var(--color-info)]"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-text-primary">
                      {r.kind} · {r.type}
                    </div>
                    <div className="text-[11px] text-text-secondary">
                      {r.date} {new Date(year, month - 1).toLocaleString('default', { month: 'short' })} {year}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(i)} className="text-text-secondary hover:text-primary transition-colors p-1" title="Edit">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleteConfirmIndex(i)} className="text-text-secondary hover:text-[var(--color-error)] transition-colors p-1" title="Remove">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="label-uppercase">Calendar overview</div>
              <input 
                type="month"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
                className="h-7 rounded-md border border-border bg-surface px-2 text-[11px] font-medium focus:border-primary focus:outline-none"
              />
            </div>
            <select 
              className="h-7 rounded-md border border-border bg-surface px-2 text-[11px] font-medium focus:border-primary focus:outline-none"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Restrictions</option>
              <option value="Min Stay">Minimum Stay</option>
              <option value="Max Stay">Maximum Stay</option>
              <option value="CTA">CTA</option>
              <option value="CTD">CTD</option>
              <option value="Stop Sell">Stop Sell</option>
            </select>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const rIndex = mappedRestrictions.findIndex((x) => x.date === day && (filterType === "All" || x.kind === filterType));
              const r = rIndex !== -1 ? mappedRestrictions[rIndex] : undefined;
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (rIndex !== -1) {
                      openEdit(rIndex);
                    } else {
                      openAdd(`${currentMonth}-${day.toString().padStart(2, '0')}`);
                    }
                  }}
                  className={`aspect-square rounded-md border p-1.5 text-[10px] text-left transition-colors hover:opacity-80 ${
                    r
                      ? "border-[var(--color-warning)] bg-[oklch(0.97_0.05_70)] cursor-pointer"
                      : "border-border bg-surface hover:bg-surface-2 cursor-pointer"
                  }`}
                >
                  <div className="font-mono font-semibold text-text-primary">{day}</div>
                  {r && (
                    <div className="mt-0.5 truncate font-medium text-[var(--color-warning)]">
                      {r.kind}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      </Card>

      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent side="right" className="sm:max-w-md w-full">
          <SheetHeader>
            <SheetTitle>{editingIndex !== null ? "Edit Restriction" : "Add Restriction"}</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Restriction</label>
              <select 
                className="col-span-3 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                value={restrictionKind}
                onChange={(e) => setRestrictionKind(e.target.value)}
              >
                <option value="Min Stay">Minimum Stay</option>
                <option value="Max Stay">Maximum Stay</option>
                <option value="CTA">Closed to Arrival (CTA)</option>
                <option value="CTD">Closed to Departure (CTD)</option>
                <option value="Stop Sell">Stop Sell</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">Room Type</label>
              <select 
                className="col-span-3 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
              >
                <option value="All Room Types">All Room Types</option>
                {dbTypes.filter((t: any) => t.is_sellable !== false).map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
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
            {dateRangeNights !== null && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div />
                <div className="col-span-3 text-[12px] text-primary font-medium">
                  Selected Range: {dateRangeNights} {dateRangeNights === 1 ? "day" : "days"} ({startDate} to {endDate})
                </div>
              </div>
            )}
            {(restrictionKind === "Min Stay" || restrictionKind === "Max Stay") && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Days</label>
                <input 
                  type="number"
                  min="1"
                  className="col-span-3 h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
            )}
          </div>
          <SheetFooter className="mt-4 border-t pt-4">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddRestriction}>{editingIndex !== null ? "Save Changes" : "Add Restriction"}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={deleteConfirmIndex !== null} onOpenChange={(open) => !open && setDeleteConfirmIndex(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-text-secondary">
              Are you sure you want to remove this restriction? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmIndex(null)}>Cancel</Button>
            <Button variant="danger" className="bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90" onClick={confirmRemove}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
export default RestrictionsView;
