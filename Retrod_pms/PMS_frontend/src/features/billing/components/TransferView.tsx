import { useState, useMemo } from "react";
import { ArrowRightLeft, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, StatusBadge, Button } from "@/components/ui/Primitives";
import { fetchApi } from "@/services/api/core";
import { toast } from "sonner";
import { getRoomNumber } from "./FolioView";

interface TransferViewProps {
  reservations: any[];
  linenOrders: any[];
  selectedResId: string;
  onSelectResId: (id: string) => void;
}

export function TransferView({
  reservations,
  linenOrders,
  selectedResId,
  onSelectResId,
}: TransferViewProps) {
  const [targetResId, setTargetResId] = useState<string>("");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [managerPin, setManagerPin] = useState("");
  const [transferReason, setTransferReason] = useState("Guest request / Room move");
  const [isTransferring, setIsTransferring] = useState(false);

  // Source reservation selected
  const sourceRes = useMemo(() => {
    return reservations.find((r) => r.id === selectedResId) || reservations[0] || null;
  }, [reservations, selectedResId]);

  // Target reservation selected
  const targetRes = useMemo(() => {
    const availableTargets = reservations.filter((r) => r.id !== sourceRes?.id);
    if (!targetResId && availableTargets.length > 0) {
      return availableTargets[0];
    }
    return reservations.find((r) => r.id === targetResId) || availableTargets[0] || null;
  }, [reservations, sourceRes, targetResId]);

  // Build dynamic line items for the selected source room
  const sourceLineItems = useMemo(() => {
    if (!sourceRes) return [];

    const items: any[] = [];
    const arr = sourceRes.arrival_date || "2026-07-20";
    const dep = sourceRes.departure_date || "2026-07-22";
    const d1 = new Date(arr);
    const d2 = new Date(dep);
    const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)));

    const roomType = sourceRes.room_type || sourceRes.room_allocations?.[0]?.unit_type_name || "Deluxe Suite";
    const totalAmt = parseFloat(sourceRes.total_amount || 0) || 22000;
    const baseRoomAmt = Math.round(totalAmt / 1.18);

    // 1. Room Charge
    items.push({
      id: "transfer-room-charge",
      desc: `Room charge · ${roomType}`,
      cat: "Room",
      amt: baseRoomAmt,
    });

    // 2. Laundry Services
    const guestName = sourceRes.primary_guest_name || sourceRes.guest_name || sourceRes.guest || "";
    const roomNo = getRoomNumber(sourceRes);
    const roomLinenOrders = linenOrders.filter(
      (o) => o.room_number === roomNo || (guestName && o.guest_name?.toLowerCase() === guestName.toLowerCase())
    );

    roomLinenOrders.forEach((lOrder, idx) => {
      const orderTotal = parseFloat(lOrder.total_amount || 0) || 850;
      items.push({
        id: `transfer-laundry-${lOrder.id || idx}`,
        desc: `Laundry service · Order #${lOrder.id?.slice(0, 6).toUpperCase() || idx + 1}`,
        cat: "Laundry",
        amt: orderTotal,
      });
    });

    // 3. F&B Meals Add-on
    items.push({
      id: "transfer-fb-meals",
      desc: "Breakfast & Restaurant Meals · F&B",
      cat: "F&B",
      amt: 2400,
    });

    return items;
  }, [sourceRes, linenOrders]);

  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // Calculate sum of selected transfer amount
  const transferTotalAmount = useMemo(() => {
    return sourceLineItems
      .filter((item) => selectedItemIds.includes(item.id))
      .reduce((sum, item) => sum + item.amt, 0);
  }, [sourceLineItems, selectedItemIds]);

  const handleExecuteTransfer = async () => {
    if (selectedItemIds.length === 0) {
      toast.error("Please select at least 1 charge item to transfer.");
      return;
    }

    if (!targetRes) {
      toast.error("Please select a target room / folio destination.");
      return;
    }

    setIsTransferring(true);
    try {
      // Execute POST transfer request to backend API
      const res = await fetchApi<any>("/api/billing/adjustments/", {
        method: "POST",
        body: JSON.stringify({
          action: "TRANSFER",
          from_reservation_id: sourceRes?.id,
          to_reservation_id: targetRes?.id,
          transferred_item_ids: selectedItemIds,
          transfer_amount: transferTotalAmount,
          manager_pin: managerPin,
          reason: transferReason,
        }),
      });

      if (res && (res.status === "SUCCESS" || res.adjustment_id || res.id)) {
        const fromRoom = getRoomNumber(sourceRes);
        const fromGuest = sourceRes?.primary_guest_name || sourceRes?.guest_name || "Guest";
        const toRoom = getRoomNumber(targetRes);
        const toGuest = targetRes?.primary_guest_name || targetRes?.guest_name || "Guest";

        toast.success(
          `🎉 Transferred ₹${transferTotalAmount.toLocaleString()} from Room ${fromRoom} (${fromGuest}) to Room ${toRoom} (${toGuest}) successfully!`
        );
        setSelectedItemIds([]);
      } else {
        toast.error("Failed to execute transfer on backend database.");
      }
    } catch (err: any) {
      toast.error("Failed to execute transfer: " + err.message);
    } finally {
      setIsTransferring(false);
    }
  };

  if (!sourceRes) {
    return (
      <Card className="p-8 text-center text-text-secondary">
        No active room bookings found for charge transfer.
      </Card>
    );
  }

  const sourceRoomNo = getRoomNumber(sourceRes);
  const sourceGuestName = sourceRes.primary_guest_name || sourceRes.guest_name || sourceRes.guest || "Guest";

  return (
    <Card>
      <CardHeader
        title="Transfer Charges"
        hint="Move charges between actual room folios or to a master group account"
      />

      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[1fr_50px_1fr]">
        {/* FROM ROOM & GUEST */}
        <div className="space-y-3">
          <div className="label-uppercase text-primary font-bold">
            From Folio (Source Room) *
          </div>
          <select
            value={selectedResId}
            onChange={(e) => {
              onSelectResId(e.target.value);
              setSelectedItemIds([]);
            }}
            className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {reservations.map((r) => {
              const gName = r.primary_guest_name || r.guest_name || r.guest || "Guest";
              const rNo = getRoomNumber(r);
              const refNo = r.confirmation_number || `RES-${r.id?.slice(0, 5)}`;
              return (
                <option key={r.id} value={r.id}>
                  Room {rNo} · {gName} ({refNo})
                </option>
              );
            })}
          </select>

          <div className="text-xs text-text-secondary font-medium pt-1">
            Select items from Room <strong>{sourceRoomNo} ({sourceGuestName})</strong> to transfer:
          </div>

          <ul className="rounded-md border border-border bg-surface divide-y divide-border-subtle overflow-hidden">
            {sourceLineItems.map((item) => {
              const isSelected = selectedItemIds.includes(item.id);
              return (
                <li
                  key={item.id}
                  onClick={() => toggleItemSelection(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-[12px] cursor-pointer transition ${
                    isSelected ? "bg-primary-tint/30 font-medium" : "hover:bg-surface-2/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <div className="flex-1 text-text-primary">{item.desc}</div>
                  <span className="font-mono font-semibold text-text-primary">
                    ₹{item.amt.toLocaleString()}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="flex justify-between items-center rounded-md border border-border bg-surface-2/40 px-3 py-2 text-xs">
            <span className="text-text-secondary">Selected Transfer Total:</span>
            <span className="font-mono text-sm font-bold text-primary">
              ₹{transferTotalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* ARROW INDICATOR */}
        <div className="flex items-center justify-center">
          <div className="h-10 w-10 rounded-full border border-border bg-surface-2/60 flex items-center justify-center text-primary">
            <ArrowRightLeft className="h-5 w-5" />
          </div>
        </div>

        {/* TO DESTINATION ROOM & GUEST */}
        <div className="space-y-3">
          <div className="label-uppercase text-emerald-700 font-bold">
            To Destination (Target Room / Account) *
          </div>

          <select
            value={targetResId || (targetRes?.id || "")}
            onChange={(e) => setTargetResId(e.target.value)}
            className="h-9 w-full rounded-md border border-emerald-500 bg-surface px-3 text-[13px] font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {reservations
              .filter((r) => r.id !== sourceRes?.id)
              .map((r) => {
                const gName = r.primary_guest_name || r.guest_name || r.guest || "Guest";
                const rNo = getRoomNumber(r);
                const refNo = r.confirmation_number || `RES-${r.id?.slice(0, 5)}`;
                return (
                  <option key={r.id} value={r.id}>
                    Room {rNo} · {gName} ({refNo})
                  </option>
                );
              })}
            <option value="corporate-master">Master Group Block · Corporate Account</option>
            <option value="city-ledger">City Ledger · Infosys Ltd.</option>
          </select>

          <div className="rounded-md border border-emerald-500/30 bg-emerald-50/20 p-4 text-xs space-y-2">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Target Destination Selected
            </div>
            <div className="text-emerald-800">
              Transferring charges to: <strong>Room {getRoomNumber(targetRes)} ({targetRes?.primary_guest_name || targetRes?.guest_name || "Guest"})</strong>.
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="block">
              <div className="label-uppercase text-text-secondary text-[10px] mb-1">
                Reason / Remark *
              </div>
              <input
                type="text"
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[12px]"
                placeholder="Reason for transfer..."
              />
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="block">
              <div className="label-uppercase text-text-secondary text-[10px] mb-1 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Manager Authorization PIN (Optional)
              </div>
              <input
                type="password"
                value={managerPin}
                onChange={(e) => setManagerPin(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[12px]"
                placeholder="Manager PIN..."
              />
            </label>
          </div>

          <Button
            className="mt-4 w-full gap-1.5"
            size="sm"
            onClick={handleExecuteTransfer}
            disabled={isTransferring || selectedItemIds.length === 0}
          >
            {isTransferring ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Transferring...
              </>
            ) : (
              <>
                <ArrowRightLeft className="h-3.5 w-3.5" /> Transfer Charges
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
