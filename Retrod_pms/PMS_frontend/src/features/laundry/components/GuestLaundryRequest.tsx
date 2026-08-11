import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash, AlertCircle, Clock, CheckCircle2, Info } from "lucide-react";
import { toast } from "sonner";
import { fetchApi } from "@/services/api/core";

// Price catalog for calculation
const PRICE_CATALOG: Record<string, Record<string, number>> = {
  shirts: { wash: 10.0, dry: 15.0, press: 5.0 },
  trousers: { wash: 12.0, dry: 18.0, press: 6.0 },
  suits: { wash: 30.0, dry: 50.0, press: 15.0 },
  dresses: { wash: 20.0, dry: 35.0, press: 10.0 },
  others: { wash: 8.0, dry: 12.0, press: 4.0 }
};

const serviceLabel = (s: string) => {
  if (s === "wash") return "Wash & Fold";
  if (s === "dry") return "Dry Cleaning";
  return "Steam Press";
};

const categoryLabel = (c: string) => {
  if (c === "shirts") return "Shirts";
  if (c === "trousers") return "Trousers";
  if (c === "suits") return "Suits";
  if (c === "dresses") return "Dresses";
  return "Others";
};

interface StayingGuestInfo {
  reservationId: string;
  guestName: string;
  roomNumber: string;
  arrivalDate: string;
  departureDate: string;
  checkOutTime: string;
}

export function GuestLaundryRequest() {
  const [dropdownOptions, setDropdownOptions] = useState<any[]>([]);
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
  const [items, setItems] = useState([{ category: "shirts", quantity: 1, service: "wash" }]);
  
  const [selectedRoom, setSelectedRoom] = useState("");
  const [guestName, setGuestName] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [serviceSpeed, setServiceSpeed] = useState<"STANDARD" | "EXPRESS">("STANDARD");
  const [selectedResId, setSelectedResId] = useState<string | null>(null);
  const [stayingInfo, setStayingInfo] = useState<StayingGuestInfo | null>(null);

  const activePropertyId = useMemo(() => {
    return localStorage.getItem("retrod:active-property-id") || "";
  }, []);

  // Today's date string format YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch reservations and all rooms
        const [res, unitsRes] = await Promise.all([
          fetchApi<any>(`/api/reservations/bookings/?property=${activePropertyId}`).catch(() => ({ results: [] })),
          fetchApi<any>(`/api/inventory/units/?limit=1000`).catch(() => ({ results: [] }))
        ]);

        const reservations = Array.isArray(res) ? res : res?.results || [];
        const units = Array.isArray(unitsRes) ? unitsRes : unitsRes?.results || [];

        // Build active staying guests map by room number
        const optionsMap: Record<string, any> = {};

        // 1. Process active reservations covering today's date
        reservations.forEach((r: any) => {
          if (r.status === "CANCELLED" || r.status === "NO_SHOW") return;
          
          const arr = r.arrival_date;
          const dep = r.departure_date;

          // Check if guest is staying currently on today's date
          const isStaying = (!arr || arr <= todayStr) && (!dep || dep >= todayStr);

          // Get allocated room numbers
          const allocRooms: string[] = [];
          (r.room_allocations || []).forEach((alloc: any) => {
            const roomNo = alloc.unit_name || alloc.room_number || alloc.room;
            if (roomNo) allocRooms.push(roomNo);
          });
          if (r.room_number && !allocRooms.includes(r.room_number)) {
            allocRooms.push(r.room_number);
          }

          allocRooms.forEach((roomNo) => {
            const gName = r.primary_guest_name || r.guest_name || r.guest || "Guest";
            const coTime = r.check_out_time || "11:00 AM";

            optionsMap[roomNo] = {
              roomNumber: roomNo,
              guestName: gName,
              reservationId: r.id,
              isStaying: isStaying,
              arrivalDate: arr,
              departureDate: dep,
              checkOutTime: coTime,
              label: isStaying 
                ? `Room ${roomNo} - ${gName} (In-House · Departs ${dep})`
                : `Room ${roomNo} - ${gName} (Booked)`
            };
          });
        });

        // 2. Add vacant rooms from units
        units.forEach((u: any) => {
          if (u.name && !optionsMap[u.name]) {
            optionsMap[u.name] = {
              roomNumber: u.name,
              guestName: "",
              reservationId: null,
              isStaying: false,
              arrivalDate: "",
              departureDate: "",
              checkOutTime: "11:00 AM",
              label: `Room ${u.name} (Vacant)`
            };
          }
        });

        // Sort options numerically by room number
        const sortedOptions = Object.values(optionsMap).sort((a, b) => 
          a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
        );

        setDropdownOptions(sortedOptions);
      } catch (err) {
        console.error("Failed to load active guests/rooms:", err);
      }
    };
    fetchData();
  }, [activePropertyId, todayStr]);

  // Handle room selection & dynamic guest name resolution
  const handleSelectRoom = (opt: any) => {
    setSelectedRoom(opt.roomNumber);
    setGuestName(opt.guestName);
    setSelectedResId(opt.reservationId);
    
    if (opt.isStaying || opt.reservationId) {
      setStayingInfo({
        reservationId: opt.reservationId,
        guestName: opt.guestName,
        roomNumber: opt.roomNumber,
        arrivalDate: opt.arrivalDate,
        departureDate: opt.departureDate,
        checkOutTime: opt.checkOutTime || "11:00 AM"
      });
    } else {
      setStayingInfo(null);
    }

    // Auto-set initial pickup time (default 4h from now for Express, 24h for Standard)
    const defaultHours = serviceSpeed === "EXPRESS" ? 4 : 24;
    const initialPickup = new Date(Date.now() + defaultHours * 3600 * 1000);
    const tzOffset = initialPickup.getTimezoneOffset() * 60000;
    const localISOTime = new Date(initialPickup.getTime() - tzOffset).toISOString().slice(0, 16);
    setPickupTime(localISOTime);

    setIsRoomDropdownOpen(false);
  };

  // Lead time calculations & checkout validation
  const checkoutValidation = useMemo(() => {
    if (!stayingInfo || !stayingInfo.departureDate) return { valid: true, warning: null, hoursLeft: 999 };

    const depParts = stayingInfo.departureDate.split("-");
    if (depParts.length !== 3) return { valid: true, warning: null, hoursLeft: 999 };

    let coHour = 11;
    let coMin = 0;
    const coTimeStr = stayingInfo.checkOutTime || "11:00 AM";
    const cleaned = coTimeStr.trim().toLowerCase();
    const match = cleaned.match(/^(\d+)(?::(\d+))?\s*(am|pm)?$/);
    if (match) {
      coHour = parseInt(match[1], 10);
      coMin = match[2] ? parseInt(match[2], 10) : 0;
      if (match[3] === "pm" && coHour < 12) coHour += 12;
      if (match[3] === "am" && coHour === 12) coHour = 0;
    }

    const coDateTime = new Date(
      parseInt(depParts[0], 10),
      parseInt(depParts[1], 10) - 1,
      parseInt(depParts[2], 10),
      coHour,
      coMin
    );

    const now = new Date();
    const hoursLeft = (coDateTime.getTime() - now.getTime()) / (1000 * 3600);

    if (hoursLeft <= 0) {
      return {
        valid: false,
        warning: `Guest checkout date & time (${stayingInfo.departureDate} at ${stayingInfo.checkOutTime}) has already passed. Request cannot be placed.`,
        hoursLeft
      };
    }

    if (hoursLeft < 4) {
      return {
        valid: false,
        warning: `Guest checks out in ${hoursLeft.toFixed(1)} hours (${stayingInfo.checkOutTime}). Express service requires at least 4 hours prior to checkout.`,
        hoursLeft
      };
    }

    if (serviceSpeed === "STANDARD" && hoursLeft < 24) {
      return {
        valid: false,
        warning: `Standard service requires 24 hours turnaround. Guest departs in ${hoursLeft.toFixed(1)} hours (${stayingInfo.departureDate}). Please select Express Service (4h turnaround).`,
        hoursLeft
      };
    }

    return { valid: true, warning: null, hoursLeft };
  }, [stayingInfo, serviceSpeed]);

  const addItem = () => setItems([...items, { category: "shirts", quantity: 1, service: "wash" }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !guestName) {
      toast.error("Please select a room number first to dynamically load the guest name.");
      return;
    }

    if (!checkoutValidation.valid) {
      toast.error(checkoutValidation.warning || "Laundry request exceeds guest checkout time limit.");
      return;
    }

    const orderItems = items.map((item) => {
      const unitPrice = PRICE_CATALOG[item.category]?.[item.service] || 5.0;
      return {
        category: categoryLabel(item.category),
        item_name: categoryLabel(item.category),
        quantity: item.quantity,
        service: serviceLabel(item.service),
        unit_price: unitPrice.toFixed(2),
      };
    });

    const payload = {
      property: activePropertyId,
      reservation: selectedResId,
      room_number: selectedRoom,
      guest_name: guestName,
      expected_pickup_time: pickupTime ? new Date(pickupTime).toISOString() : null,
      service_speed: serviceSpeed,
      status: "PICKUP_REQUESTED",
      items: orderItems,
    };

    try {
      await fetchApi("/api/linen/orders/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success("Laundry request submitted successfully!");
      setItems([{ category: "shirts", quantity: 1, service: "wash" }]);
      setSelectedRoom("");
      setGuestName("");
      setPickupTime("");
      setServiceSpeed("STANDARD");
      setSelectedResId(null);
      setStayingInfo(null);
    } catch (err: any) {
      toast.error("Failed to create laundry order: " + err.message);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">New Laundry Request</h2>
        <p className="text-muted-foreground">Select a room number to automatically fetch the staying guest.</p>
      </div>

      {/* Processing Time Lead-Time Info Bar */}
      <div className="rounded-lg border border-info/30 bg-info-tint/30 p-3.5 flex items-start gap-3 text-xs">
        <Info className="h-4 w-4 text-info shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-text-primary">Service Lead Time & Checkout Cutoff Policy</div>
          <div className="text-text-secondary">
            • <strong className="text-text-primary">Standard Service:</strong> Requires 24-hour turnaround (must be requested at least 24h prior to guest checkout).<br />
            • <strong className="text-text-primary">Express Service:</strong> Requires 4-hour turnaround (must be requested at least 4h prior to guest checkout).
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Guest Information</CardTitle>
            <CardDescription>Select room number to auto-fill guest details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Room Number Dropdown First */}
              <div className="relative space-y-2 flex-1">
                <Label htmlFor="room" className="font-semibold text-xs uppercase tracking-wider text-text-secondary">
                  Room Number *
                </Label>
                <Input
                  id="room"
                  placeholder="Select room number (e.g. 202, 204)"
                  value={selectedRoom}
                  onFocus={() => setIsRoomDropdownOpen(true)}
                  onChange={(e) => {
                    setSelectedRoom(e.target.value);
                    const opt = dropdownOptions.find(o => o.roomNumber.toLowerCase() === e.target.value.trim().toLowerCase());
                    if (opt) {
                      handleSelectRoom(opt);
                    } else {
                      setGuestName("");
                      setSelectedResId(null);
                      setStayingInfo(null);
                    }
                    setIsRoomDropdownOpen(true);
                  }}
                  required
                />
                {isRoomDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsRoomDropdownOpen(false)} />
                    <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-md border border-border bg-surface py-1 shadow-lg z-20">
                      {dropdownOptions
                        .filter(o => o.roomNumber.toLowerCase().includes(selectedRoom.toLowerCase()))
                        .map(o => (
                          <div
                            key={o.roomNumber}
                            className={`px-3 py-2 text-[13px] flex items-center justify-between hover:bg-surface-2 cursor-pointer transition-colors ${
                              selectedRoom === o.roomNumber ? "bg-primary/10 font-semibold" : ""
                            }`}
                            onClick={() => handleSelectRoom(o)}
                          >
                            <span>{o.label}</span>
                            {o.isStaying && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                                Staying
                              </span>
                            )}
                          </div>
                        ))
                      }
                      {dropdownOptions.filter(o => o.roomNumber.toLowerCase().includes(selectedRoom.toLowerCase())).length === 0 && (
                        <div
                          className="px-3 py-2 text-[13px] italic text-text-secondary cursor-pointer hover:bg-surface-2"
                          onClick={() => setIsRoomDropdownOpen(false)}
                        >
                          Use custom room "{selectedRoom}"
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Dynamically Fetched Guest Name */}
              <div className="space-y-2">
                <Label htmlFor="guest" className="font-semibold text-xs uppercase tracking-wider text-text-secondary">
                  Guest Name (Auto-fetched) *
                </Label>
                <Input 
                  id="guest" 
                  placeholder={selectedRoom ? "Guest Name" : "Select a room number first..."} 
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required 
                />
              </div>
            </div>

            {/* Staying Guest Info & Checkout Lead Time Status Badge */}
            {stayingInfo && (
              <div className="rounded-md border border-border bg-surface-2/50 p-3 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>
                    Active Stay: <strong>Room {stayingInfo.roomNumber}</strong> — {stayingInfo.guestName} (Departs: <strong>{stayingInfo.departureDate}</strong> at {stayingInfo.checkOutTime})
                  </span>
                </div>
                <div className="text-[11px] text-text-secondary">
                  {checkoutValidation.hoursLeft < 900 && (
                    <span>Time to Checkout: <strong>{checkoutValidation.hoursLeft.toFixed(1)}h</strong></span>
                  )}
                </div>
              </div>
            )}

            {/* Checkout Cutoff Warning Banner */}
            {!checkoutValidation.valid && (
              <div className="rounded-md border border-rose-300 bg-rose-50 text-rose-800 p-3 text-xs flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{checkoutValidation.warning}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickup" className="font-semibold text-xs uppercase tracking-wider text-text-secondary">
                  Expected Pickup Time *
                </Label>
                <Input 
                  id="pickup" 
                  type="datetime-local" 
                  value={pickupTime} 
                  onChange={(e) => setPickupTime(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="express" className="font-semibold text-xs uppercase tracking-wider text-text-secondary">
                  Service Speed *
                </Label>
                <Select 
                  value={serviceSpeed} 
                  onValueChange={(val) => setServiceSpeed(val as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select speed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD">
                      Standard (24 Hours Lead Time)
                    </SelectItem>
                    <SelectItem value="EXPRESS">
                      Express (4 Hours Lead Time)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Laundry Items</CardTitle>
            <CardDescription>Add garments to be processed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex items-end gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={item.category} 
                    onValueChange={(val) => handleItemChange(index, "category", val)} 
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shirts">Shirts</SelectItem>
                      <SelectItem value="trousers">Trousers</SelectItem>
                      <SelectItem value="suits">Suits</SelectItem>
                      <SelectItem value="dresses">Dresses</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24 space-y-2">
                  <Label>Quantity</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={item.quantity} 
                    onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)} 
                    required 
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Service</Label>
                  <Select 
                    value={item.service} 
                    onValueChange={(val) => handleItemChange(index, "service", val)} 
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wash">Wash & Fold</SelectItem>
                      <SelectItem value="dry">Dry Cleaning</SelectItem>
                      <SelectItem value="press">Steam Press</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {items.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeItem(index)} 
                    className="text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addItem} className="mt-2 w-full border-dashed">
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!checkoutValidation.valid}
            >
              Submit Request
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
