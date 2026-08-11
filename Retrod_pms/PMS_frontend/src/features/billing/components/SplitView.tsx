import { useState, useMemo } from "react";
import { ArrowRightLeft, Check, Split, Loader2 } from "lucide-react";
import { Card, CardHeader, StatusBadge, Button } from "@/components/ui/Primitives";
import { fetchApi } from "@/services/api/core";
import { toast } from "sonner";
import { getRoomNumber } from "./FolioView";

interface SplitViewProps {
  reservations: any[];
  linenOrders: any[];
  selectedResId: string;
  onSelectResId: (id: string) => void;
}

export function SplitView({
  reservations,
  linenOrders,
  selectedResId,
  onSelectResId,
}: SplitViewProps) {
  const [splitToFolioBItemIds, setSplitToFolioBItemIds] = useState<string[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [targetCompany, setTargetCompany] = useState("Corporate / Direct Bill");

  const selectedRes = useMemo(() => {
    return reservations.find((r) => r.id === selectedResId) || reservations[0] || null;
  }, [reservations, selectedResId]);

  // Build dynamic line items for the selected reservation
  const lineItems = useMemo(() => {
    if (!selectedRes) return [];

    const items: any[] = [];
    const arr = selectedRes.arrival_date || "2026-07-20";
    const dep = selectedRes.departure_date || "2026-07-22";
    const d1 = new Date(arr);
    const d2 = new Date(dep);
    const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)));

    const roomType = selectedRes.room_type || selectedRes.room_allocations?.[0]?.unit_type_name || "Deluxe Suite";
    const totalAmt = parseFloat(selectedRes.total_amount || 0) || 22000;
    const baseRoomAmt = Math.round(totalAmt / 1.18);

    // 1. Room Charge Item
    items.push({
      id: "item-room-charge",
      date: arr,
      desc: `Room charge · ${roomType}`,
      cat: "Room",
      qty: nights,
      amt: baseRoomAmt,
    });

    // 2. Room Laundry / Linen Orders items if available
    const guestName = selectedRes.primary_guest_name || selectedRes.guest_name || selectedRes.guest || "";
    const roomNo = getRoomNumber(selectedRes);
    const roomLinenOrders = linenOrders.filter(
      (o) => o.room_number === roomNo || (guestName && o.guest_name?.toLowerCase() === guestName.toLowerCase())
    );

    roomLinenOrders.forEach((lOrder, idx) => {
      const orderTotal = parseFloat(lOrder.total_amount || 0) || 850;
      items.push({
        id: `item-laundry-${lOrder.id || idx}`,
        date: lOrder.created_at ? new Date(lOrder.created_at).toISOString().split("T")[0] : arr,
        desc: `Laundry service · Order #${lOrder.id?.slice(0, 6).toUpperCase() || idx + 1}`,
        cat: "Laundry",
        qty: lOrder.items?.length || 1,
        amt: orderTotal,
      });
    });

    // 3. F&B Welcome Drink / Meals Add-on
    items.push({
      id: "item-welcome-fb",
      date: arr,
      desc: "Welcome Drinks & Breakfast · F&B",
      cat: "F&B",
      qty: 1,
      amt: 1200,
    });

    return items;
  }, [selectedRes, linenOrders]);

  // Compute Subtotal for Folio A and Folio B
  const { folioAItems, folioBItems, subtotalA, subtotalB } = useMemo(() => {
    const a: any[] = [];
    const b: any[] = [];
    let sumA = 0;
    let sumB = 0;

    lineItems.forEach((item) => {
      if (splitToFolioBItemIds.includes(item.id)) {
        b.push(item);
        sumB += item.amt;
      } else {
        a.push(item);
        sumA += item.amt;
      }
    });

    return { folioAItems: a, folioBItems: b, subtotalA: sumA, subtotalB: sumB };
  }, [lineItems, splitToFolioBItemIds]);

  const toggleItemSplit = (itemId: string) => {
    setSplitToFolioBItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleApplySplit = async () => {
    if (folioBItems.length === 0) {
      toast.error("Please move at least 1 item to Folio B before applying split.");
      return;
    }

    setIsApplying(true);
    try {
      // POST split adjustment to backend API
      const res = await fetchApi<any>("/api/billing/adjustments/", {
        method: "POST",
        body: JSON.stringify({
          action: "SPLIT",
          reservation_id: selectedRes?.id,
          folio_a_amount: subtotalA,
          folio_b_amount: subtotalB,
          folio_b_company: targetCompany,
          items_split: splitToFolioBItemIds,
        }),
      });

      if (res && (res.status === "SUCCESS" || res.adjustment_id || res.id)) {
        toast.success(
          `🎉 Folio split applied! Folio A (Guest): ₹${subtotalA.toLocaleString()} | Folio B (${targetCompany}): ₹${subtotalB.toLocaleString()}`
        );
      } else {
        toast.error("Failed to apply folio split on backend database.");
      }
    } catch (err: any) {
      toast.error("Failed to apply split: " + err.message);
    } finally {
      setIsApplying(false);
    }
  };

  if (!selectedRes) {
    return (
      <Card className="p-8 text-center text-text-secondary">
        No active reservation found to split folio.
      </Card>
    );
  }

  const guestName = selectedRes.primary_guest_name || selectedRes.guest_name || selectedRes.guest || "Guest";
  const roomNo = getRoomNumber(selectedRes);

  return (
    <Card>
      <CardHeader
        title="Split Folio"
        hint="Select charges to split into a second master/corporate folio"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase text-text-secondary">Active Reservation:</span>
            <select
              value={selectedResId}
              onChange={(e) => onSelectResId(e.target.value)}
              className="h-8 rounded-md border border-border bg-surface px-3 text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {reservations.map((r) => {
                const gName = r.primary_guest_name || r.guest_name || r.guest || "Guest";
                const rNo = getRoomNumber(r);
                const refNo = r.confirmation_number || `RES-${r.id?.slice(0, 5)}`;
                return (
                  <option key={r.id} value={r.id}>
                    {refNo} — {gName} (Room {rNo})
                  </option>
                );
              })}
            </select>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-2">
        {/* Folio A: Guest Pays */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="label-uppercase text-primary font-bold">
              Folio A · Guest Pays ({guestName})
            </div>
            <StatusBadge tone="neutral">Room {roomNo}</StatusBadge>
          </div>

          <div className="rounded-md border border-border bg-surface divide-y divide-border-subtle overflow-hidden">
            {lineItems.length === 0 && (
              <div className="p-4 text-center text-xs text-text-disabled">No line items available</div>
            )}
            {lineItems.map((item) => {
              const isMovedToB = splitToFolioBItemIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 text-[13px] transition ${
                    isMovedToB ? "opacity-40 bg-surface-2/30" : "bg-surface hover:bg-surface-2/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!isMovedToB}
                      onChange={() => toggleItemSplit(item.id)}
                      className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                    />
                    <div>
                      <div className="font-medium text-text-primary">{item.desc}</div>
                      <div className="text-[11px] text-text-secondary">{item.date} · {item.cat}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-text-primary">₹{item.amt.toLocaleString()}</span>
                    <button
                      onClick={() => toggleItemSplit(item.id)}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      {isMovedToB ? "Move back" : "Split →"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center rounded-md border border-border bg-surface-2/40 px-4 py-2.5 text-[13px]">
            <span className="text-text-secondary font-medium">Subtotal (Folio A):</span>
            <span className="font-mono text-base font-bold text-text-primary">₹{subtotalA.toLocaleString()}</span>
          </div>
        </div>

        {/* Folio B: Corporate / Master Direct Bill */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="label-uppercase text-emerald-700 font-bold">
              Folio B · Direct Bill To Company
            </div>
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              className="h-7 w-48 rounded border border-border bg-surface px-2 text-xs font-medium text-text-primary"
              placeholder="Company name..."
            />
          </div>

          <div className="rounded-md border border-emerald-500/30 bg-emerald-50/20 divide-y divide-emerald-100 min-h-[160px] overflow-hidden">
            {folioBItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-text-disabled">
                No items split yet. Select items on the left or click "Split →" to move charges here.
              </div>
            ) : (
              folioBItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 text-[13px] bg-white/80">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <div>
                      <div className="font-medium text-text-primary">{item.desc}</div>
                      <div className="text-[11px] text-text-secondary">{item.date} · {item.cat}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-emerald-800">₹{item.amt.toLocaleString()}</span>
                    <button
                      onClick={() => toggleItemSplit(item.id)}
                      className="text-[11px] text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-between items-center rounded-md border border-emerald-500/30 bg-emerald-50/50 px-4 py-2.5 text-[13px]">
            <span className="text-emerald-900 font-medium">Subtotal (Folio B):</span>
            <span className="font-mono text-base font-bold text-emerald-700">₹{subtotalB.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-border-subtle bg-surface-2/40 px-6 py-4">
        <div className="text-xs text-text-secondary">
          Splitting charges will generate separate invoices for <strong className="text-text-primary">{guestName}</strong> and <strong className="text-emerald-700">{targetCompany}</strong>.
        </div>
        <Button size="sm" onClick={handleApplySplit} disabled={isApplying || folioBItems.length === 0} className="gap-1.5">
          {isApplying ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Applying Split...
            </>
          ) : (
            <>
              <Split className="h-3.5 w-3.5" /> Apply Split
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
