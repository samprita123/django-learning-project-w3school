import { useParams, Link } from "@tanstack/react-router";
import { useReservationQuery } from "@/services/mock/queries";
import { fetchApi } from "@/services/api/core";
import { toast } from "sonner";
import { PaymentGatewayModal } from "./PaymentGatewayModal";
import { PageHeader, Card, CardHeader } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  Calendar,
  CreditCard,
  User,
  Bed,
  CheckCircle2,
  Clock,
  Ban,
  Pencil,
  ArrowRightLeft,
  AlertCircle,
  Printer,
  Trash,
  History,
  Activity,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

interface PaymentTransaction {
  id: string;
  type: string;
  method: string;
  date: string;
  amount: number;
}

interface FolioCharge {
  id: string;
  date: string;
  description: string;
  qty: number;
  amount: number;
}

const availableRoomsMock = [
  { room: "101", type: "Standard" },
  { room: "102", type: "Standard" },
  { room: "201", type: "Deluxe" },
  { room: "202", type: "Deluxe" },
  { room: "205", type: "Deluxe" },
  { room: "301", type: "Suite" },
  { room: "302", type: "Suite" },
  { room: "405", type: "Penthouse" },
];

const getCleanDocTypeLabel = (docType: string) => {
  if (!docType) return "Not Provided";
  switch (docType.toUpperCase()) {
    case "PASSPORT": return "Passport";
    case "NATIONAL_ID": case "NATIONAL ID": return "National ID Card";
    case "DRIVING_LICENCE": case "DRIVING": case "DRIVER'S LICENSE": return "Driving Licence";
    default: return docType;
  }
};

export function ReservationDetailFeature() {
  const { reservationId } = useParams({ strict: false });
  const { data: mockReservation, isLoading: isMockLoading } = useReservationQuery(reservationId as string);

  const [rawBooking, setRawBooking] = useState<any>(null);
  const [guestProfile, setGuestProfile] = useState<any>(null);
  const [dbRooms, setDbRooms] = useState<any[]>([]);
  const [dbTypes, setDbTypes] = useState<any[]>([]);
  const [loadingReal, setLoadingReal] = useState(true);

  useEffect(() => {
    if (!reservationId) return;
    setLoadingReal(true);
    fetchApi<any>(`/api/reservations/bookings/${reservationId}/`)
      .then((booking) => {
        setRawBooking(booking);

        // Build folio charges from actual rate snapshots (one per night)
        const folioCharges: any[] = [];
        const allocations: any[] = booking.room_allocations || [];
        allocations.forEach((alloc: any) => {
          const typeName = alloc.inventory_snapshot?.name || alloc.unit_type_code || "Room";
          const snapshots: any[] = alloc.rate_snapshots || [];
          if (snapshots.length > 0) {
            // One row per night with the actual nightly amount
            snapshots.forEach((snap: any) => {
              folioCharges.push({
                id: snap.id || `snap-${alloc.id}-${snap.date}`,
                date: snap.date,
                description: `Room Charge (${typeName})`,
                qty: 1,
                amount: parseFloat(snap.amount_charged) || 0,
                _system: true,
              });

              // Add meal plan charge if snapshot or booking specifies a valid room meal plan
              const mealPlanName = snap.rate_snapshot?.meal_plan_name || snap.meal_plan_name || booking.meal_plan_name || (typeof booking.meal_plan === "string" ? booking.meal_plan : booking.meal_plan?.name);
              if (mealPlanName) {
                const mealPrice = parseFloat(snap.rate_snapshot?.meal_plan_price || booking.meal_plan_price || "0") || 0;
                folioCharges.push({
                  id: `meal-${snap.id || snap.date}`,
                  date: snap.date,
                  description: `Meal Plan (${mealPlanName})`,
                  qty: 1,
                  amount: mealPrice,
                  _system: true,
                });
              }
            });
          } else {
            // Fallback: single row for total nights if no snapshots yet
            const nights = Math.ceil(
              (new Date(alloc.check_out_date).getTime() - new Date(alloc.check_in_date).getTime()) /
                (1000 * 60 * 60 * 24)
            ) || 1;
            folioCharges.push({
              id: `alloc-${alloc.id}`,
              date: alloc.check_in_date,
              description: `Room Charge (${typeName})`,
              qty: nights,
              amount: parseFloat(booking.total_amount) / nights || 0,
              _system: true,
            });

            const mealPlanName = booking.meal_plan_name || (typeof booking.meal_plan === "string" ? booking.meal_plan : booking.meal_plan?.name);
            if (mealPlanName) {
              folioCharges.push({
                id: `meal-alloc-${alloc.id}`,
                date: alloc.check_in_date,
                description: `Meal Plan (${mealPlanName})`,
                qty: nights,
                amount: parseFloat(booking.meal_plan_amount || "0") / nights || 0,
                _system: true,
              });
            }
          }
        });

        // Add service addons (e.g. Spa Session)
        const serviceAddons: any[] = booking.services || [];
        serviceAddons.forEach((svc: any) => {
          const svcName = svc.service_name || svc.name || "Service Add-on";
          const svcPrice = parseFloat(svc.price) || 0;
          folioCharges.push({
            id: `svc-${svc.id}`,
            date: booking.arrival_date,
            description: `Service: ${svcName}`,
            qty: 1,
            amount: svcPrice,
            _system: true,
          });
        });

        // Add package addons
        const packageAddons: any[] = booking.packages || [];
        packageAddons.forEach((pkg: any) => {
          const pkgName = pkg.package_name || pkg.name || "Package Add-on";
          const pkgPrice = parseFloat(pkg.price) || 0;
          folioCharges.push({
            id: `pkg-${pkg.id}`,
            date: booking.arrival_date,
            description: `Package: ${pkgName}`,
            qty: 1,
            amount: pkgPrice,
            _system: true,
          });
        });

        if (booking.discount_amount && parseFloat(booking.discount_amount) > 0) {
          const discountVal = parseFloat(booking.discount_amount);
          folioCharges.push({
            id: `discount-${booking.id}`,
            date: booking.arrival_date,
            description: "Coupon Discount",
            qty: 1,
            amount: -discountVal,
            _system: true,
          });
        }

        // Keep any manually-added charges (non-system) from previous state
        setCharges(prev => {
          const manual = prev.filter((c: any) => !c._system);
          return [...folioCharges, ...manual];
        });

        if (booking.primary_guest) {
          fetchApi<any>(`/api/crm/guests/${booking.primary_guest}/`)
            .then((guest) => {
              setGuestProfile(guest);
              if (!guest.primary_email && !guest.primary_phone) {
                fetchApi<any>(`/api/crm/guests/?first_name=${guest.first_name}&last_name=${guest.last_name}`)
                  .then((res) => {
                    const profiles = res.results || res || [];
                    const profileWithContacts = profiles.find((p: any) => p.primary_email || p.primary_phone);
                    if (profileWithContacts) {
                      setGuestProfile((prev: any) => ({
                        ...prev,
                        primary_email: profileWithContacts.primary_email,
                        primary_phone: profileWithContacts.primary_phone,
                        primary_address: profileWithContacts.primary_address || prev?.primary_address,
                        id_type: profileWithContacts.id_type || prev?.id_type,
                        id_number: profileWithContacts.id_number || prev?.id_number,
                      }));
                    }
                  })
                  .catch((err) => console.error("Failed to query duplicate profiles:", err));
              }
            })
            .catch((err) => console.error("Failed to fetch guest profile:", err));
        }
      })
      .catch((err) => console.error("Failed to fetch booking detail:", err))
      .finally(() => setLoadingReal(false));

    Promise.all([
      fetchApi<any>("/api/inventory/units/?limit=1000").catch(() => ({ results: [] })),
      fetchApi<any>("/api/inventory/types/").catch(() => ({ results: [] }))
    ]).then(([resRooms, resTypes]) => {
      const typesList = resTypes.results || resTypes || [];
      setDbRooms(resRooms.results || resRooms || []);
      const activeTypes = typesList.filter((t: any) => {
        const isCurrentType = rawBooking?.room_allocations?.some((alloc: any) => alloc.inventory_unit_type === t.id);
        return (t.is_sellable === true && !t.deleted_at) || isCurrentType;
      });
      setDbTypes(activeTypes);
    });
  }, [reservationId]);

  const mappedReservation = useMemo(() => {
    if (!rawBooking) return null;
    const firstAlloc = rawBooking.room_allocations?.[0];
    
    let uiStatus = rawBooking.status || "Confirmed";
    if (rawBooking.status === "CONFIRMED") uiStatus = "Confirmed";
    else if (rawBooking.status === "CHECKED_IN") uiStatus = "Checked-In";
    else if (rawBooking.status === "CHECKED_OUT") uiStatus = "Checked-Out";
    else if (rawBooking.status === "CANCELLED") uiStatus = "Cancelled";
    else if (rawBooking.status === "NO_SHOW") uiStatus = "No-Show";

    let typeName = "Room";
    if (firstAlloc) {
      if (firstAlloc.inventory_snapshot?.name) {
        typeName = firstAlloc.inventory_snapshot.name;
      } else if (firstAlloc.unit_type_code) {
        typeName = firstAlloc.unit_type_code;
      } else if (firstAlloc.inventory_unit_type && dbTypes.length > 0) {
        const tObj = dbTypes.find((t: any) => t.id === firstAlloc.inventory_unit_type);
        if (tObj) typeName = tObj.name;
      }
    }

    const nights = Math.ceil((new Date(rawBooking.departure_date).getTime() - new Date(rawBooking.arrival_date).getTime()) / (1000 * 60 * 60 * 24)) || 1;

    return {
      id: rawBooking.id,
      status: uiStatus,
      ci: rawBooking.arrival_date,
      co: rawBooking.departure_date,
      guest: rawBooking.primary_guest_name || "Guest",
      room: firstAlloc ? firstAlloc.unit_name || `Unassigned (${typeName})` : `Unassigned (${typeName})`,
      type: typeName,
      nights: nights,
      amount: parseFloat(rawBooking.total_amount) || 0,
      balance: parseFloat(rawBooking.balance_amount) || 0,
      source: rawBooking.reservation_source_name || "Direct / Walk-In",
      check_in_time: rawBooking.check_in_time,
      check_out_time: rawBooking.check_out_time,
    };
  }, [rawBooking, dbTypes]);

  const matchedRooms = useMemo(() => {
    const firstAlloc = rawBooking?.room_allocations?.[0];
    if (!firstAlloc) return [];
    
    const targetTypeId = firstAlloc.inventory_unit_type;
    const targetTypeName = firstAlloc.inventory_snapshot?.name || firstAlloc.unit_type_code;
    
    let filtered = dbRooms.filter((r: any) => r.inventory_unit_type === targetTypeId);
    
    if (filtered.length === 0 && targetTypeName && dbTypes.length > 0) {
      const matchingTypeIds = dbTypes
        .filter((t: any) => t.name.toLowerCase().trim() === targetTypeName.toLowerCase().trim())
        .map((t: any) => t.id);
      filtered = dbRooms.filter((r: any) => matchingTypeIds.includes(r.inventory_unit_type));
    }
    
    return filtered;
  }, [dbRooms, rawBooking, dbTypes]);

  const reservation = mappedReservation || mockReservation;
  const isLoading = isMockLoading && loadingReal;

  const [statusOverride, setStatusOverride] = useState<string | null>(null);
  const [checkoutOverride, setCheckoutOverride] = useState<string | null>(null);
  const [isAmendOpen, setIsAmendOpen] = useState(false);
  const [newCheckoutDate, setNewCheckoutDate] = useState("");

  const [guestNameOverride, setGuestNameOverride] = useState<string | null>(null);
  const [guestEmailOverride, setGuestEmailOverride] = useState<string | null>(null);
  const [guestPhoneOverride, setGuestPhoneOverride] = useState<string | null>(null);
  const [guestAddressOverride, setGuestAddressOverride] = useState<string | null>(null);
  const [guestIdTypeOverride, setGuestIdTypeOverride] = useState<string | null>(null);
  const [guestIdNumberOverride, setGuestIdNumberOverride] = useState<string | null>(null);

  const [specialRequestsOverride, setSpecialRequestsOverride] = useState<string | null>(null);
  const [isSpecialRequestsEditOpen, setIsSpecialRequestsEditOpen] = useState(false);
  const [editSpecialRequests, setEditSpecialRequests] = useState("");

  const [activityLogs, setActivityLogs] = useState<{id: string, action: string, user: string, timestamp: string}[]>([]);

  useEffect(() => {
    if (rawBooking) {
      setActivityLogs([
        { 
          id: "log-1", 
          action: `Reservation Created via ${rawBooking.reservation_source_name || "Direct / Walk-In"}`, 
          user: "System", 
          timestamp: new Date(rawBooking.created_at || Date.now() - 86400000).toLocaleString() 
        },
        ...(rawBooking.paid_amount && parseFloat(rawBooking.paid_amount) > 0 ? [{
          id: "log-2",
          action: `Deposit Payment of ₹${parseFloat(rawBooking.paid_amount).toLocaleString()} Received`,
          user: "Front Desk (Admin)",
          timestamp: new Date(rawBooking.created_at || Date.now() - 80000000).toLocaleString()
        }] : [])
      ]);
    }
  }, [rawBooking]);

  const addLog = (action: string) => {
    setActivityLogs(prev => [{ id: `log-${Date.now()}`, action, user: "Current User", timestamp: new Date().toLocaleString() }, ...prev]);
  };

  const [isGuestEditOpen, setIsGuestEditOpen] = useState(false);
  const [editGuestName, setEditGuestName] = useState("");
  const [editGuestEmail, setEditGuestEmail] = useState("");
  const [editGuestPhone, setEditGuestPhone] = useState("");
  const [editGuestAddress, setEditGuestAddress] = useState("");
  const [editGuestIdType, setEditGuestIdType] = useState("");
  const [editGuestIdNumber, setEditGuestIdNumber] = useState("");
  const [guestIdFileObj, setGuestIdFileObj] = useState<File | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  const [roomOverride, setRoomOverride] = useState<string | null>(null);
  const [isRoomEditOpen, setIsRoomEditOpen] = useState(false);
  const [editRoom, setEditRoom] = useState("");
  const [editRoomReason, setEditRoomReason] = useState("");

  const [isRoomMoveOpen, setIsRoomMoveOpen] = useState(false);
  const [roomMoveType, setRoomMoveType] = useState("Standard Move");
  const [roomMoveNewType, setRoomMoveNewType] = useState("");
  const [roomMoveNewRoom, setRoomMoveNewRoom] = useState("");
  const [roomMoveReason, setRoomMoveReason] = useState("");

  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({ type: "Partial Payment", method: "Cash", amount: "" });
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [pendingPaymentAmount, setPendingPaymentAmount] = useState<number>(0);
  const [pendingPaymentType, setPendingPaymentType] = useState<string>("Partial Payment");

  const [charges, setCharges] = useState<FolioCharge[]>([]);
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [editingChargeId, setEditingChargeId] = useState<string | null>(null);
  const [chargeForm, setChargeForm] = useState({
    description: "Room Service",
    amount: "",
    taxType: "Excluded",
    taxPercent: "18",
  });

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printDocumentType, setPrintDocumentType] = useState("Estimated Invoice");

  useEffect(() => {
    if (rawBooking) {
      const paid = parseFloat(rawBooking.paid_amount) || 0;
      if (paid > 0) {
        setPayments([{
          id: "p1",
          type: "Advance Deposit",
          method: rawBooking.payment_method || rawBooking.corporate_billing_type || "Cash",
          date: new Date(rawBooking.created_at || rawBooking.arrival_date).toLocaleDateString(),
          amount: paid
        }]);
      }
    }
    
    if (rawBooking && charges.length === 0) {
      setCharges([
        {
          id: "c1",
          date: rawBooking.arrival_date,
          description: `Room Charge (${reservation.type})`,
          qty: reservation.nights,
          amount: parseFloat(rawBooking.total_amount) || 0
        },
        {
          id: "c2",
          date: rawBooking.arrival_date,
          description: "Taxes & Fees",
          qty: 1,
          amount: parseFloat(rawBooking.tax_amount) || 0
        }
      ]);
    }
  }, [rawBooking, reservation?.type, reservation?.nights]);

  const isBeforeCheckInDate = useMemo(() => {
    if (!reservation?.ci) return false;
    const todayStr = new Date().toISOString().split("T")[0];
    const checkInStr = new Date(reservation.ci).toISOString().split("T")[0];
    return todayStr < checkInStr;
  }, [reservation?.ci]);

  if (isLoading) {
    return <div className="p-8 text-center text-text-secondary">Loading reservation...</div>;
  }

  if (!reservation) {
    return <div className="p-8 text-center text-error">Reservation not found.</div>;
  }

  const currentStatus = statusOverride || reservation.status;
  const currentCheckout = checkoutOverride || reservation.co;
  const currentGuestName = guestNameOverride || rawBooking?.event_organizer_name || reservation.guest;
  const currentGuestEmail = guestEmailOverride || rawBooking?.event_organizer_email || guestProfile?.primary_email || "—";
  const currentGuestPhone = guestPhoneOverride || rawBooking?.event_organizer_contact || guestProfile?.primary_phone || "—";
  const currentGuestAddress = guestAddressOverride || rawBooking?.event_organizer_billing_address || guestProfile?.primary_address || "—";
  const currentGuestIdType = guestIdTypeOverride || guestProfile?.id_type || "Passport";
  const currentGuestIdNumber = guestIdNumberOverride || guestProfile?.id_number || "—";
  const currentSpecialRequests = specialRequestsOverride || (rawBooking?.special_requests ? (Array.isArray(rawBooking.special_requests) ? rawBooking.special_requests.join(", ") : rawBooking.special_requests) : "None");
  const currentRoom = roomOverride || reservation.room;

  // Calculate dynamic nights if checkout changed
  const checkInDate = new Date(reservation.ci);
  const checkOutDateObj = new Date(currentCheckout);
  const diffTime = Math.abs(checkOutDateObj.getTime() - checkInDate.getTime());
  const currentNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  const totalCharges = charges.length > 0 ? charges.reduce((acc, c) => acc + c.amount, 0) : (reservation ? reservation.amount : 0);
  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const currentBalanceDue = totalCharges - totalPaid;

  const handleAction = (action: string) => {
    if (!reservationId) return;

    if (action === "check-in") {
      fetchApi<any>(`/api/reservations/bookings/${reservationId}/check-in/`, {
        method: "POST"
      })
      .then(() => {
        toast.success("Guest checked in successfully!");
        setStatusOverride("Checked-In");
        addLog("Guest Checked In");
        window.location.reload();
      })
      .catch((err) => {
        console.error("Check-in failed:", err);
        toast.error(`Check-in failed: ${err.message || err}`);
      });
    }

    if (action === "check-out") {
      fetchApi<any>(`/api/reservations/bookings/${reservationId}/check-out/`, {
        method: "POST"
      })
      .then(() => {
        toast.success("Guest checked out successfully!");
        setStatusOverride("Checked-Out");
        addLog("Guest Checked Out");
        window.location.reload();
      })
      .catch((err) => {
        console.error("Check-out failed:", err);
        toast.error(`Check-out failed: ${err.message || err}`);
      });
    }

    if (action === "cancel") {
      fetchApi<any>(`/api/reservations/bookings/${reservationId}/cancel/`, {
        method: "POST",
        body: JSON.stringify({ cancellation_reason: "Guest request" }),
        headers: { "Content-Type": "application/json" }
      })
      .then(() => {
        toast.success("Reservation cancelled successfully!");
        setStatusOverride("Cancelled");
        addLog("Reservation Cancelled");
        window.location.reload();
      })
      .catch((err) => {
        console.error("Cancellation failed:", err);
        toast.error(`Cancellation failed: ${err.message || err}`);
      });
    }

    if (action === "undo-check-in") {
      fetchApi<any>(`/api/reservations/bookings/${reservationId}/undo-check-in/`, {
        method: "POST"
      })
      .then(() => {
        toast.success("Check-in undone successfully!");
        setStatusOverride("Confirmed");
        addLog("Undo Check-In");
        window.location.reload();
      })
      .catch((err) => {
        console.error("Undo check-in failed:", err);
        toast.error(`Undo check-in failed: ${err.message || err}`);
      });
    }

    if (action === "undo-check-out") {
      fetchApi<any>(`/api/reservations/bookings/${reservationId}/undo-check-out/`, {
        method: "POST"
      })
      .then(() => {
        toast.success("Check-out undone successfully!");
        setStatusOverride("Checked-In");
        addLog("Undo Check-Out");
        window.location.reload();
      })
      .catch((err) => {
        console.error("Undo check-out failed:", err);
        toast.error(`Undo check-out failed: ${err.message || err}`);
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Confirmed": return "bg-brand/10 text-brand";
      case "Checked-In": return "bg-success/10 text-success";
      case "Checked-Out": return "bg-border text-text-secondary";
      case "Cancelled": case "No-Show": return "bg-error/10 text-error";
      default: return "bg-warning/10 text-warning";
    }
  };

  return (
    <div className="space-y-6 print-container p-4">
      <div className="flex items-center gap-4">
        <Link to="/reservations" className="text-text-secondary hover:text-text-primary">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
              {currentGuestName}
            </h1>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusBadgeColor(currentStatus)}`}>
              {currentStatus}
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Res ID: {reservation.id} • {reservation.source}
          </p>
        </div>
        
        <div className="flex gap-2">
          {currentStatus === "Confirmed" && (
            <Button
              onClick={() => handleAction("check-in")}
              disabled={isBeforeCheckInDate}
              title={isBeforeCheckInDate ? "Check-in date has not arrived yet" : undefined}
              className={isBeforeCheckInDate ? "opacity-50 cursor-not-allowed" : ""}
            >
              Check In
            </Button>
          )}
          {currentStatus === "Checked-In" && (
            <>
              <Button onClick={() => handleAction("undo-check-in")} variant="outline">
                Undo Check-In
              </Button>
              <Button onClick={() => {
                setRoomMoveNewType(reservation.type);
                setRoomMoveNewRoom("");
                setRoomMoveReason("");
                setIsRoomMoveOpen(true);
              }} variant="outline" className="text-brand border-brand/20 hover:bg-brand/10">
                <ArrowRightLeft className="h-3.5 w-3.5 mr-2" /> Room Move
              </Button>
              <Button variant="outline" onClick={() => {
                setNewCheckoutDate(currentCheckout);
                setIsAmendOpen(true);
              }}>
                <Pencil className="h-3.5 w-3.5 mr-2" /> Amend
              </Button>
              <Button onClick={() => handleAction("check-out")} className="bg-red-500 text-white hover:bg-red-600">
                Check Out
              </Button>
            </>
          )}
          {currentStatus === "Checked-Out" && (
            <Button onClick={() => handleAction("undo-check-out")} variant="outline">
              Undo Check-Out
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsPrintModalOpen(true)}>
            <Printer className="h-3.5 w-3.5 mr-2" /> Print
          </Button>
          {["Confirmed", "Pending"].includes(currentStatus) && (
            <Button variant="outline" className="text-error border-error/20 hover:bg-error/10" onClick={() => handleAction("cancel")}>
              <Ban className="h-3.5 w-3.5 mr-2" /> Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Stay Details" />
            <div className="p-4 flex flex-wrap gap-8">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand/10 rounded-lg text-brand">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] text-text-secondary uppercase font-medium">Check In</p>
                  <p className="text-sm font-medium text-text-primary">{new Date(reservation.ci).toLocaleDateString("en-GB", { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                  <p className="text-[12px] text-text-secondary">{reservation.check_in_time ? `After ${reservation.check_in_time}` : "After 14:00"}</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center justify-center text-border">
                <ArrowRightLeft className="h-4 w-4" />
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand/10 rounded-lg text-brand">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] text-text-secondary uppercase font-medium">Check Out</p>
                  <p className="text-sm font-medium text-text-primary">{checkOutDateObj.toLocaleDateString("en-GB", { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                  <p className="text-[12px] text-text-secondary">{reservation.check_out_time ? `Before ${reservation.check_out_time}` : "Before 11:00"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 pl-4 sm:border-l border-border">
                <div className="p-2 bg-surface-hover rounded-lg text-text-secondary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] text-text-secondary uppercase font-medium">Duration</p>
                  <p className="text-sm font-medium text-text-primary">{currentNights} Nights</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] text-text-secondary uppercase font-medium">Room</p>
                  <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] text-brand" onClick={() => {
                    if (matchedRooms.length > 0) {
                      setEditRoom(matchedRooms[0].name);
                    } else {
                      setEditRoom(currentRoom);
                    }
                    setIsRoomEditOpen(true);
                  }}>
                    Change
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-brand" />
                  <span className="text-sm font-medium text-text-primary">{currentRoom} ({reservation.type})</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-text-secondary uppercase font-medium mb-1">Guests</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-brand" />
                  <span className="text-sm font-medium text-text-primary">2 Adults, 0 Children</span>
                </div>
              </div>
            </div>
          </Card>

          {(rawBooking?.event_venue || rawBooking?.event_type || rawBooking?.event_organizer_name) && (
            <Card>
              <CardHeader title="Event & Banquet Logistics" />
              <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-[11px] text-text-secondary uppercase font-medium">Venue</p>
                  <p className="font-semibold text-text-primary mt-0.5">{rawBooking.event_venue || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-text-secondary uppercase font-medium">Event Type</p>
                  <p className="font-semibold text-text-primary mt-0.5">{rawBooking.event_type || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-text-secondary uppercase font-medium">Expected Pax</p>
                  <p className="font-semibold text-text-primary mt-0.5">{rawBooking.event_pax ? `${rawBooking.event_pax} pax` : "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-text-secondary uppercase font-medium">Event Timing</p>
                  <p className="font-medium text-text-primary mt-0.5">
                    {rawBooking.event_start_time || "—"} {rawBooking.event_end_time ? `to ${rawBooking.event_end_time}` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-text-secondary uppercase font-medium">Seating Style</p>
                  <p className="font-medium text-text-primary mt-0.5">{rawBooking.event_seating_arrangement || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-text-secondary uppercase font-medium">Catering Menu</p>
                  <p className="font-medium text-text-primary mt-0.5">{rawBooking.event_catering_menu || "—"}</p>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="text-sm font-semibold text-text-primary">Folio Itemization</h2>
              <Button variant="outline" size="sm" onClick={() => {
                setEditingChargeId(null);
                setChargeForm({ description: "Room Service", amount: "", taxType: "Excluded", taxPercent: "18" });
                setIsChargeModalOpen(true);
              }}>
                Add Charge
              </Button>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-hover text-[11px] uppercase tracking-wider text-text-secondary">
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium">Description</th>
                    <th className="px-4 py-2 font-medium text-right">Qty</th>
                    <th className="px-4 py-2 font-medium text-right">Amount</th>
                    <th className="px-4 py-2 font-medium text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {charges.map(charge => (
                    <tr key={charge.id} className="group">
                      <td className="px-4 py-3 text-text-secondary">{charge.date}</td>
                      <td className="px-4 py-3 font-medium text-text-primary">{charge.description}</td>
                      <td className="px-4 py-3 text-right text-text-secondary">{charge.qty}</td>
                      <td className="px-4 py-3 text-right text-text-primary">{charge.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-text-secondary hover:text-brand transition-colors" onClick={() => {
                            setEditingChargeId(charge.id);
                            setChargeForm({ description: charge.description, amount: String(charge.amount), taxType: "Included", taxPercent: "0" });
                            setIsChargeModalOpen(true);
                          }}>
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button className="text-text-secondary hover:text-error transition-colors" onClick={() => {
                            setCharges(charges.filter(c => c.id !== charge.id));
                          }}>
                            <Trash className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {charges.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">No charges found.</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="border-t-2 border-border">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-medium text-text-primary">Total Charges</td>
                    <td className="px-4 py-3 text-right font-semibold text-text-primary">{totalCharges.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 border-b border-border p-4">
              <History className="h-4 w-4 text-text-secondary" />
              <h2 className="text-sm font-semibold text-text-primary">Activity Log</h2>
            </div>
            <div className="p-4">
              <div className="relative border-l border-border ml-2 space-y-6 pb-2">
                {activityLogs.map((log, index) => (
                  <div key={log.id} className="relative pl-6">
                    <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-surface border-2 border-brand ring-4 ring-surface" />
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                      <p className="text-sm font-medium text-text-primary">{log.action}</p>
                      <time className="text-[11px] text-text-secondary whitespace-nowrap">{log.timestamp}</time>
                    </div>
                    <p className="text-[12px] text-text-secondary">By: {log.user}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Payment Summary" />
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Total Amount</span>
                <span className="font-medium text-text-primary">{totalCharges.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Paid</span>
                <span className="font-medium text-success">{totalPaid.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold border-t border-border pt-3">
                <span className="text-text-primary">Balance Due</span>
                <span className={currentBalanceDue > 0 ? "text-error" : "text-text-primary"}>
                  {currentBalanceDue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                </span>
              </div>

              {currentBalanceDue > 0 && (
                <Button className="w-full mt-2" onClick={() => {
                  setEditingPaymentId(null);
                  setPaymentForm({ type: "Partial Payment", method: "Credit Card", amount: String(currentBalanceDue) });
                  setIsPaymentModalOpen(true);
                }}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Process Payment
                </Button>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="text-sm font-semibold text-text-primary">Guest Information</h2>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={() => {
                setEditGuestName(currentGuestName);
                setEditGuestEmail(currentGuestEmail);
                setEditGuestPhone(currentGuestPhone);
                setEditGuestAddress(currentGuestAddress);
                setEditGuestIdType(currentGuestIdType);
                setEditGuestIdNumber(currentGuestIdNumber);
                setIsGuestEditOpen(true);
              }}>
                <Pencil className="h-3 w-3 mr-1" /> Edit
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-[11px] text-text-secondary uppercase font-medium mb-1">Primary Guest</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-lg">
                    {currentGuestName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{currentGuestName}</p>
                    <p className="text-[12px] text-text-secondary">{currentGuestEmail}</p>
                    <p className="text-[12px] text-text-secondary">{currentGuestPhone}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-3 border-t border-border">
                <p className="text-[11px] text-text-secondary uppercase font-medium mb-1">Address</p>
                <p className="text-sm text-text-primary">{currentGuestAddress}</p>
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-[11px] text-text-secondary uppercase font-medium mb-1">ID Document</p>
                <div className="flex gap-4 items-start">
                  <div className="h-16 w-24 bg-surface-hover border border-border rounded overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => {
                    if (guestProfile?.id_proof_url) {
                      setZoomScale(1);
                      setIsPreviewOpen(true);
                    }
                  }}>
                    {guestProfile?.id_proof_url ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <img 
                          src={guestProfile.id_proof_url.startsWith("http") ? guestProfile.id_proof_url : `${import.meta.env.VITE_API_URL || "http://localhost:8000"}${guestProfile.id_proof_url}`} 
                          alt="ID Proof" 
                          className="w-full h-full object-cover hover:scale-105 transition-transform" 
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const span = document.createElement('span');
                              span.className = "text-[10px] text-brand underline uppercase font-semibold p-1 text-center";
                              span.innerText = "View Document";
                              parent.appendChild(span);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <span className="text-[10px] text-text-secondary uppercase font-semibold">ID Proof</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{getCleanDocTypeLabel(currentGuestIdType)}</p>
                    <p className="text-[12px] text-text-secondary"># {currentGuestIdNumber}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-[11px] text-text-secondary uppercase font-medium mb-1">Booking Source</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-primary">{reservation.source}</span>
                  {(reservation.source && reservation.source !== "Direct" && reservation.source !== "Direct / Walk-In") && (
                    <span className="px-1.5 py-0.5 rounded bg-surface-hover text-[10px] text-text-secondary border border-border">OTA</span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="text-sm font-semibold text-text-primary">Special Requests & Preferences</h2>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={() => {
                setEditSpecialRequests(currentSpecialRequests);
                setIsSpecialRequestsEditOpen(true);
              }}>
                <Pencil className="h-3 w-3 mr-1" /> Edit
              </Button>
            </div>
            <div className="p-4">
              {currentSpecialRequests ? (
                <p className="text-sm text-text-primary whitespace-pre-wrap">{currentSpecialRequests}</p>
              ) : (
                <p className="text-sm text-text-secondary italic">No special requests added.</p>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="text-sm font-semibold text-text-primary">Payment History</h2>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={() => {
                setEditingPaymentId(null);
                setPaymentForm({ type: "Deposit", method: "Cash", amount: "" });
                setIsPaymentModalOpen(true);
              }}>
                + Add Payment
              </Button>
            </div>
            <div className="p-0">
              <div className="divide-y divide-border">
                {payments.length > 0 ? payments.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text-primary">{p.type}</p>
                        <button className="text-text-secondary hover:text-brand transition-colors" onClick={() => {
                          setEditingPaymentId(p.id);
                          setPaymentForm({ type: p.type, method: p.method, amount: String(p.amount) });
                          setIsPaymentModalOpen(true);
                        }}>
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-[11px] text-text-secondary">{p.method} • {p.date}</p>
                    </div>
                    <span className="text-sm font-semibold text-text-primary">
                      {p.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </span>
                  </div>
                )) : (
                  <div className="p-4 text-center text-[12px] text-text-secondary">No payments recorded.</div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={isAmendOpen} onOpenChange={setIsAmendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Amend Stay</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="checkout">New Check-Out Date</Label>
              <Input
                id="checkout"
                type="date"
                value={newCheckoutDate}
                onChange={(e) => setNewCheckoutDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAmendOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (reservationId && newCheckoutDate) {
                fetchApi<any>(`/api/reservations/bookings/${reservationId}/`, {
                  method: "PATCH",
                  body: JSON.stringify({
                    departure_date: newCheckoutDate
                  }),
                  headers: {
                    "Content-Type": "application/json"
                  }
                })
                .then(() => {
                  toast.success("Stay amended successfully!");
                  setCheckoutOverride(newCheckoutDate);
                  setIsAmendOpen(false);
                  window.location.reload();
                })
                .catch((err) => {
                  console.error("Amend stay failed:", err);
                  toast.error(`Amend stay failed: ${err.message || err}`);
                });
              } else {
                setIsAmendOpen(false);
              }
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGuestEditOpen} onOpenChange={setIsGuestEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Guest Information</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="guestName">Full Name</Label>
                <Input
                  id="guestName"
                  value={editGuestName}
                  onChange={(e) => setEditGuestName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="guestEmail">Email Address</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={editGuestEmail}
                  onChange={(e) => setEditGuestEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="guestPhone">Contact Number</Label>
                <Input
                  id="guestPhone"
                  value={editGuestPhone}
                  onChange={(e) => setEditGuestPhone(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="guestAddress">Address</Label>
                <Input
                  id="guestAddress"
                  value={editGuestAddress}
                  onChange={(e) => setEditGuestAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div className="grid gap-2">
                <Label htmlFor="guestIdType">ID Type</Label>
                <select
                  id="guestIdType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={editGuestIdType}
                  onChange={(e) => setEditGuestIdType(e.target.value)}
                >
                  <option value="PASSPORT">Passport</option>
                  <option value="NATIONAL_ID">National ID Card</option>
                  <option value="DRIVING_LICENCE">Driving Licence</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="guestIdNumber">ID Number</Label>
                <Input
                  id="guestIdNumber"
                  value={editGuestIdNumber}
                  onChange={(e) => setEditGuestIdNumber(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="guestIdFile">Update ID Proof Image</Label>
              <Input
                id="guestIdFile"
                type="file"
                className="cursor-pointer"
                accept="image/*,.pdf"
                onChange={(e) => setGuestIdFileObj(e.target.files?.[0] || null)}
              />
              <p className="text-[11px] text-text-secondary">Optional. Upload a new image or PDF of the guest's ID.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGuestEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              try {
                const saveChanges = (uploadedUrl: string | null) => {
                  const safeGuestName = (editGuestName || "").trim();
                  const parts = safeGuestName.split(' ', 1);
                  const firstName = parts[0] || "Guest";
                  const lastName = safeGuestName.substring(firstName.length).trim() || "Profile";

                  const patchData: any = {
                    first_name: firstName,
                    last_name: lastName,
                    primary_email: editGuestEmail || "",
                    primary_phone: editGuestPhone || "",
                    primary_address: editGuestAddress || "",
                    id_type: editGuestIdType || "Passport",
                    id_number: editGuestIdNumber || ""
                  };

                  if (uploadedUrl) {
                    patchData.id_proof_url = uploadedUrl;
                  }

                  if (rawBooking?.primary_guest) {
                    fetchApi<any>(`/api/crm/guests/${rawBooking.primary_guest}/`, {
                      method: "PATCH",
                      body: JSON.stringify(patchData),
                      headers: {
                        "Content-Type": "application/json"
                      }
                    })
                    .then(() => {
                      toast.success("Guest details updated successfully!");
                      setGuestNameOverride(editGuestName);
                      setGuestEmailOverride(editGuestEmail);
                      setGuestPhoneOverride(editGuestPhone);
                      setGuestAddressOverride(editGuestAddress);
                      setGuestIdTypeOverride(editGuestIdType);
                      setGuestIdNumberOverride(editGuestIdNumber);
                      if (uploadedUrl) {
                        setGuestProfile((prev: any) => ({ ...prev, id_proof_url: uploadedUrl }));
                      }
                      setIsGuestEditOpen(false);
                      window.location.reload();
                    })
                    .catch((err: any) => {
                      console.error("Failed to patch guest profile:", err);
                      toast.error(`Failed to update guest details: ${err.message || err}`);
                    });
                  } else {
                    toast.error("No guest profile associated with this reservation.");
                  }
                };

                if (guestIdFileObj) {
                  const formData = new FormData();
                  formData.append("file", guestIdFileObj);
                  toast.loading("Uploading ID Proof document...", { id: "uploading-doc" });
                  fetchApi<any>("/api/crm/documents/upload/", {
                    method: "POST",
                    body: formData
                  })
                  .then(data => {
                    toast.dismiss("uploading-doc");
                    saveChanges(data.url);
                  })
                  .catch(err => {
                    toast.dismiss("uploading-doc");
                    console.error("Upload error:", err);
                    toast.error(`File upload failed: ${err.message || err}`);
                  });
                } else {
                  saveChanges(null);
                }
              } catch (e: any) {
                console.error("Save changes click error:", e);
                toast.error(`Click Error: ${e.message || e}`);
              }
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRoomEditOpen} onOpenChange={setIsRoomEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign / Change Room</DialogTitle>
          </DialogHeader>
          {(() => {
            const firstAlloc = rawBooking?.room_allocations?.[0];
            const bookedTypeId = firstAlloc?.inventory_unit_type;
            const selectedRoomObj = dbRooms.find((r: any) => r.name === editRoom);
            const isTypeMismatch = selectedRoomObj && bookedTypeId && selectedRoomObj.inventory_unit_type !== bookedTypeId;
            const selectedTypeName = isTypeMismatch ? dbTypes.find((t: any) => t.id === selectedRoomObj.inventory_unit_type)?.name || "Different Type" : null;

            return (
              <>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="roomNum">Select Room</Label>
                    <select
                      id="roomNum"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={editRoom}
                      onChange={(e) => { setEditRoom(e.target.value); setEditRoomReason(""); }}
                    >
                      <option value="" disabled>Select a room</option>
                      {dbTypes.map((type: any) => {
                        const roomsOfType = dbRooms.filter((r: any) => r.inventory_unit_type === type.id);
                        if (roomsOfType.length === 0) return null;
                        return (
                          <optgroup key={type.id} label={type.name}>
                            {roomsOfType.map((r: any) => (
                              <option key={r.id} value={r.name}>
                                {r.name} — {type.name}
                              </option>
                            ))}
                          </optgroup>
                        );
                      })}
                    </select>
                    {!isTypeMismatch && (
                      <p className="text-[11px] text-text-secondary">Booked category: {reservation.type}. Rooms of same type are pre-selected.</p>
                    )}
                  </div>

                  {isTypeMismatch && (
                    <div className="grid gap-2 rounded-md border border-warning/30 bg-warning/5 p-3">
                      <p className="text-[12px] font-medium text-warning">⚠ Room type mismatch — this is an upgrade/downgrade</p>
                      <p className="text-[11px] text-text-secondary">Booked: <strong>{reservation.type}</strong> → Selected: <strong>{selectedTypeName}</strong></p>
                      <Label htmlFor="upgradeReason">Upgrade / Change Reason <span className="text-error">*</span></Label>
                      <textarea
                        id="upgradeReason"
                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="e.g. Guest request, complimentary upgrade, maintenance issue..."
                        value={editRoomReason}
                        onChange={(e) => setEditRoomReason(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRoomEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    disabled={!editRoom || (isTypeMismatch && !editRoomReason.trim())}
                    onClick={() => {
                      if (selectedRoomObj && firstAlloc) {
                        const payload: any = {
                          allocation_id: firstAlloc.id,
                          room_id: selectedRoomObj.id,
                        };
                        if (isTypeMismatch && editRoomReason.trim()) {
                          payload.upgrade_reason = editRoomReason.trim();
                        }
                        fetchApi<any>(`/api/reservations/bookings/${reservationId}/assign-room/`, {
                          method: "POST",
                          body: JSON.stringify(payload),
                        })
                        .then(() => {
                          toast.success("Room assigned successfully!");
                          setRoomOverride(editRoom);
                          setIsRoomEditOpen(false);
                          setEditRoomReason("");
                          window.location.reload();
                        })
                        .catch((err) => {
                          console.error("Assign room failed:", err);
                          toast.error(err?.message || "Failed to assign room.");
                        });
                      } else {
                        toast.error("Could not resolve room or allocation.");
                      }
                    }}
                  >
                    Confirm Room Assignment
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={isRoomMoveOpen} onOpenChange={setIsRoomMoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Room Move</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="moveType">Move Type</Label>
              <select
                id="moveType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={roomMoveType}
                onChange={(e) => setRoomMoveType(e.target.value)}
              >
                <option value="Standard Move">Standard Move</option>
                <option value="Upgrade">Upgrade</option>
                <option value="Downgrade">Downgrade</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="newRoomType">New Room Category</Label>
                <select
                  id="newRoomType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={roomMoveNewType}
                  onChange={(e) => {
                    setRoomMoveNewType(e.target.value);
                    setRoomMoveNewRoom("");
                  }}
                >
                  <option value="" disabled>Select category</option>
                  {dbTypes.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newRoomNum">New Room Number</Label>
                <select
                  id="newRoomNum"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={roomMoveNewRoom}
                  onChange={(e) => setRoomMoveNewRoom(e.target.value)}
                >
                  <option value="" disabled>Select a room</option>
                  {dbRooms
                    .filter((r: any) => r.inventory_unit_type === roomMoveNewType)
                    .map((r: any) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="moveReason">Reason for Move (Optional)</Label>
              <Input
                id="moveReason"
                value={roomMoveReason}
                onChange={(e) => setRoomMoveReason(e.target.value)}
                placeholder="e.g. Guest requested better view"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoomMoveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              const selectedRoomObj = dbRooms.find(r => r.name === roomMoveNewRoom);
              const firstAlloc = rawBooking?.room_allocations?.[0];
              if (selectedRoomObj && firstAlloc) {
                fetchApi<any>(`/api/reservations/bookings/${reservationId}/change-room/`, {
                  method: "POST",
                  body: JSON.stringify({
                    allocation_id: firstAlloc.id,
                    new_room_id: selectedRoomObj.id
                  }),
                  headers: {
                    "Content-Type": "application/json"
                  }
                })
                .then(() => {
                  toast.success(`Room moved successfully to ${roomMoveNewRoom}!`);
                  setRoomOverride(roomMoveNewRoom);
                  setIsRoomMoveOpen(false);
                  window.location.reload();
                })
                .catch((err: any) => {
                  console.error("Room move failed:", err);
                  toast.error(`Room move failed: ${err.message || err}`);
                });
              } else {
                toast.error("Could not resolve room or allocation.");
              }
            }}>
              Confirm Room Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPaymentId ? "Edit Payment" : "Add Payment"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="paymentType">Payment Type</Label>
              <select
                id="paymentType"
                value={paymentForm.type}
                onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Partial Payment">Partial Payment</option>
                <option value="Deposit">Deposit</option>
                <option value="Full Payment">Full Payment</option>
                <option value="Room Charge">Room Charge</option>
                <option value="Incidentals / Extras">Incidentals / Extras</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <select
                id="paymentMethod"
                value={paymentForm.method}
                onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                className="w-full h-10 px-3 py-2 text-sm rounded-md border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="Debit Card">Debit Card</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Corporate Direct Bill">Corporate Direct Bill</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentAmount">Amount (₹)</Label>
              <Input
                id="paymentAmount"
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              const amountVal = Number(paymentForm.amount) || 0;
              if (amountVal <= 0) {
                toast.error("Please enter a valid payment amount.");
                return;
              }

              const processRecord = (typeStr: string, methodStr: string, val: number) => {
                const currentPaid = parseFloat(rawBooking?.paid_amount) || 0;
                const currentBalance = parseFloat(rawBooking?.balance_amount) || 0;
                
                const newPaidAmount = currentPaid + val;
                const newBalanceAmount = Math.max(0, currentBalance - val);
                
                if (rawBooking) {
                  fetchApi<any>(`/api/reservations/bookings/${reservationId}/`, {
                    method: "PATCH",
                    body: JSON.stringify({
                      paid_amount: newPaidAmount.toFixed(2),
                      balance_amount: newBalanceAmount.toFixed(2)
                    }),
                    headers: {
                      "Content-Type": "application/json"
                    }
                  })
                  .then(() => {
                    toast.success("Payment recorded successfully!");
                    if (editingPaymentId) {
                      setPayments(payments.map(p => p.id === editingPaymentId ? { ...p, type: typeStr, method: methodStr, amount: val } : p));
                      addLog(`Updated Payment: ${typeStr} (${methodStr}) for ₹${val}`);
                    } else {
                      setPayments([...payments, { id: `p-${Date.now()}`, type: typeStr, method: methodStr, amount: val, date: new Date().toLocaleDateString() }]);
                      addLog(`Added Payment: ${typeStr} (${methodStr}) for ₹${val}`);
                    }
                    setIsPaymentModalOpen(false);
                    window.location.reload();
                  })
                  .catch((err) => {
                    console.error("Failed to record payment:", err);
                    toast.error("Failed to record payment on server.");
                  });
                } else {
                  toast.error("No active reservation context.");
                }
              };

              if (paymentForm.method.toUpperCase().includes("UPI")) {
                setPendingPaymentAmount(amountVal);
                setPendingPaymentType(paymentForm.type);
                setIsPaymentModalOpen(false);
                setIsGatewayModalOpen(true);
              } else {
                processRecord(paymentForm.type, paymentForm.method, amountVal);
              }
            }}>
              {editingPaymentId ? "Save Changes" : "Add Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PaymentGatewayModal
        open={isGatewayModalOpen}
        onClose={() => setIsGatewayModalOpen(false)}
        amount={pendingPaymentAmount}
        guestName={currentGuestName}
        guestEmail={currentGuestEmail}
        guestPhone={currentGuestPhone}
        onPaymentComplete={(transactionId, gatewayName) => {
          const methodStr = `UPI (${gatewayName})`;
          const val = pendingPaymentAmount;
          const typeStr = pendingPaymentType;
          const currentPaid = parseFloat(rawBooking?.paid_amount) || 0;
          const currentBalance = parseFloat(rawBooking?.balance_amount) || 0;
          
          const newPaidAmount = currentPaid + val;
          const newBalanceAmount = Math.max(0, currentBalance - val);
          
          if (rawBooking) {
            fetchApi<any>(`/api/reservations/bookings/${reservationId}/`, {
              method: "PATCH",
              body: JSON.stringify({
                paid_amount: newPaidAmount.toFixed(2),
                balance_amount: newBalanceAmount.toFixed(2)
              }),
              headers: {
                "Content-Type": "application/json"
              }
            })
            .then(() => {
              toast.success(`Payment completed via ${gatewayName}! TXN: ${transactionId}`);
              setPayments([...payments, { id: `p-${Date.now()}`, type: typeStr, method: methodStr, amount: val, date: new Date().toLocaleDateString() }]);
              addLog(`Added Payment: ${typeStr} (${methodStr}) for ₹${val} via ${gatewayName} (${transactionId})`);
              setIsGatewayModalOpen(false);
              window.location.reload();
            })
            .catch((err) => {
              console.error("Failed to record gateway payment:", err);
              toast.error("Failed to record payment on server.");
            });
          }
        }}
      />

      <Dialog open={isChargeModalOpen} onOpenChange={setIsChargeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingChargeId ? "Edit Folio Charge" : "Add Folio Charge"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="chargeDesc">Charge Description</Label>
              {editingChargeId ? (
                <Input
                  id="chargeDesc"
                  value={chargeForm.description}
                  onChange={(e) => setChargeForm({ ...chargeForm, description: e.target.value })}
                />
              ) : (
                <select
                  id="chargeDesc"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={chargeForm.description}
                  onChange={(e) => setChargeForm({ ...chargeForm, description: e.target.value })}
                >
                  <option value="Room Service">Room Service</option>
                  <option value="Minibar">Minibar</option>
                  <option value="Spa & Wellness">Spa & Wellness</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Laundry">Laundry</option>
                  <option value="Airport Transfer">Airport Transfer</option>
                  <option value="Other">Other</option>
                </select>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="chargeAmount">Amount (₹)</Label>
              <Input
                id="chargeAmount"
                type="number"
                value={chargeForm.amount}
                onChange={(e) => setChargeForm({ ...chargeForm, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            {!editingChargeId && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="taxType">Tax Application</Label>
                  <select
                    id="taxType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={chargeForm.taxType}
                    onChange={(e) => setChargeForm({ ...chargeForm, taxType: e.target.value })}
                  >
                    <option value="Excluded">Tax Excluded</option>
                    <option value="Included">Tax Included</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="taxPercent">Tax Percentage</Label>
                  <select
                    id="taxPercent"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={chargeForm.taxPercent}
                    onChange={(e) => setChargeForm({ ...chargeForm, taxPercent: e.target.value })}
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChargeModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              const baseAmount = Number(chargeForm.amount) || 0;
              
              if (editingChargeId) {
                setCharges(charges.map(c => c.id === editingChargeId ? { ...c, description: chargeForm.description, amount: baseAmount } : c));
                addLog(`Updated Folio Charge: ${chargeForm.description} for ₹${baseAmount}`);
              } else {
                const taxPercent = Number(chargeForm.taxPercent) || 0;
                let finalAmount = baseAmount;
                let taxAmount = 0;
                
                if (chargeForm.taxType === "Excluded") {
                  taxAmount = baseAmount * (taxPercent / 100);
                  finalAmount = baseAmount;
                } else {
                  taxAmount = baseAmount - (baseAmount / (1 + taxPercent / 100));
                  finalAmount = baseAmount - taxAmount;
                }

                const newCharges: FolioCharge[] = [];
                const chargeId = `c${Date.now()}`;
                newCharges.push({
                  id: chargeId,
                  date: new Date().toLocaleDateString(),
                  description: chargeForm.description,
                  qty: 1,
                  amount: finalAmount
                });
                
                if (taxAmount > 0) {
                  newCharges.push({
                    id: `${chargeId}-tax`,
                    date: new Date().toLocaleDateString(),
                    description: `${chargeForm.description} Tax (${chargeForm.taxPercent}%)`,
                    qty: 1,
                    amount: taxAmount
                  });
                }
                
                setCharges([...charges, ...newCharges]);
                addLog(`Added Folio Charge: ${chargeForm.description} for ₹${baseAmount}`);
              }
              setIsChargeModalOpen(false);
            }}>
              {editingChargeId ? "Save Changes" : "Add Charge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Print Document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="docType">Select Document Type</Label>
              <select
                id="docType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={printDocumentType}
                onChange={(e) => setPrintDocumentType(e.target.value)}
              >
                <option value="Estimated Invoice">Estimated Invoice</option>
                <option value="Final Invoice">Final Invoice (Bill)</option>
                <option value="Guest Voucher">Guest Voucher</option>
                <option value="Registration Card">Registration Card</option>
              </select>
            </div>
            <p className="text-[12px] text-text-secondary mt-2">
              This will generate a printable version of the {printDocumentType} based on the current reservation details.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setIsPrintModalOpen(false);
              setTimeout(() => window.print(), 300);
            }}>
              <Printer className="h-3.5 w-3.5 mr-2" /> Print Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSpecialRequestsEditOpen} onOpenChange={setIsSpecialRequestsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Special Requests</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="specialRequests">Requests & Preferences</Label>
              <textarea
                id="specialRequests"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editSpecialRequests}
                onChange={(e) => setEditSpecialRequests(e.target.value)}
                placeholder="Enter any special requests, dietary requirements, or room preferences..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSpecialRequestsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setSpecialRequestsOverride(editSpecialRequests);
              setIsSpecialRequestsEditOpen(false);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>ID Document Preview</DialogTitle>
            {!guestProfile?.id_proof_url?.toLowerCase().endsWith('.pdf') && (
              <div className="flex items-center gap-2 pr-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.25))}
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs font-mono min-w-[36px] text-center">
                  {Math.round(zoomScale * 100)}%
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => setZoomScale(prev => Math.min(3, prev + 0.25))}
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-xs" 
                  onClick={() => setZoomScale(1)}
                >
                  Reset
                </Button>
              </div>
            )}
          </DialogHeader>
          <div className="flex items-center justify-center p-4 bg-surface rounded-lg border border-border mt-2 overflow-auto max-h-[75vh]">
            {guestProfile?.id_proof_url?.toLowerCase().endsWith('.pdf') ? (
              <iframe
                src={guestProfile.id_proof_url.startsWith("http") ? guestProfile.id_proof_url : `${import.meta.env.VITE_API_URL || "http://localhost:8000"}${guestProfile.id_proof_url}`}
                className="w-full h-[60vh] rounded-md border-0"
                title="ID Document PDF"
              />
            ) : (
              <div className="overflow-hidden w-full h-full flex items-center justify-center min-h-[40vh]">
                <img
                  src={guestProfile?.id_proof_url ? (guestProfile.id_proof_url.startsWith("http") ? guestProfile.id_proof_url : `${import.meta.env.VITE_API_URL || "http://localhost:8000"}${guestProfile.id_proof_url}`) : ""}
                  alt="ID Proof Preview"
                  className="max-w-full max-h-[60vh] object-contain rounded-md shadow-md transition-transform duration-200"
                  style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center' }}
                />
              </div>
            )}
          </div>
          <DialogFooter className="flex justify-between items-center sm:justify-between">
            <a
              href={guestProfile?.id_proof_url ? (guestProfile.id_proof_url.startsWith("http") ? guestProfile.id_proof_url : `${import.meta.env.VITE_API_URL || "http://localhost:8000"}${guestProfile.id_proof_url}`) : undefined}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand hover:underline flex items-center gap-1"
            >
              Open in new tab
            </a>
            <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
