import { useState } from "react";
import { Search, Filter, Download, MoreVertical, Eye, Edit, XCircle, X, Calendar, MapPin, Building, Users, CreditCard } from "lucide-react";
import { Card, CardHeader, Button, StatusBadge } from "@/components/ui/Primitives";
import { Link } from "@tanstack/react-router";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function AgentReservations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingReservation, setViewingReservation] = useState<any | null>(null);
  const [modifyingReservation, setModifyingReservation] = useState<any | null>(null);

  const reservations = [
    { id: "RES-9983", guest: "John Doe", hotel: "The Grand Palace", checkIn: "24 May 2026", checkOut: "26 May 2026", amount: "₹14,450", status: "Confirmed", tone: "success", room: "Deluxe King Room", guestsCount: "2 Adults", payment: "Agent Prepaid Wallet", bookedOn: "20 May 2026" },
    { id: "RES-9982", guest: "Sarah Jenkins", hotel: "The Grand Palace", checkIn: "22 May 2026", checkOut: "24 May 2026", amount: "₹18,200", status: "Checked In", tone: "info", room: "Executive Suite", guestsCount: "1 Adult", payment: "Corporate Credit Card", bookedOn: "15 May 2026" },
    { id: "RES-9981", guest: "Marcus Chen", hotel: "The Grand Palace", checkIn: "24 May 2026", checkOut: "28 May 2026", amount: "₹45,500", status: "Waitlisted", tone: "warning", room: "Presidential Suite", guestsCount: "2 Adults, 2 Children", payment: "Pending", bookedOn: "21 May 2026" },
    { id: "RES-9979", guest: "Priya Sharma", hotel: "Retrod Resort Goa", checkIn: "25 May 2026", checkOut: "30 May 2026", amount: "₹38,000", status: "Confirmed", tone: "success", room: "Ocean View Villa", guestsCount: "2 Adults", payment: "Agent Prepaid Wallet", bookedOn: "18 May 2026" },
    { id: "RES-9975", guest: "David Smith", hotel: "The Grand Palace", checkIn: "28 May 2026", checkOut: "01 Jun 2026", amount: "₹22,100", status: "Cancelled", tone: "error", room: "Deluxe King Room", guestsCount: "1 Adult", payment: "Refunded", bookedOn: "10 May 2026" },
    { id: "RES-9970", guest: "Anita Desai", hotel: "Retrod Resort Goa", checkIn: "02 Jun 2026", checkOut: "05 Jun 2026", amount: "₹28,500", status: "Confirmed", tone: "success", room: "Poolside Cabana", guestsCount: "3 Adults", payment: "Guest to Pay at Hotel", bookedOn: "12 May 2026" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Reservations</h2>
          <p className="text-[13px] text-text-secondary mt-1">Manage and view all your agency bookings.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Link to="/travel-agent/search">
            <Button variant="primary" size="sm">
              Book New Room
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-2/30">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search by Guest or Ref ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-[13px] text-text-primary focus:border-brand focus:outline-none"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select className="h-9 w-full sm:w-auto rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-brand focus:outline-none">
              <option>All Hotels</option>
              <option>The Grand Palace</option>
              <option>Retrod Resort Goa</option>
            </select>
            <Button variant="outline" size="sm" className="w-full sm:w-auto h-9">
              <Filter className="h-4 w-4 mr-2" /> Filters
            </Button>
          </div>
        </div>
        
        <div className="table-scroll-shadow overflow-x-auto min-h-[400px]">
          <table className="w-full text-[13px] text-left">
            <thead className="bg-surface-2/50 text-[10px] uppercase tracking-wider text-text-secondary border-b border-border-subtle">
              <tr>
                <th className="p-4 font-medium">Ref ID</th>
                <th className="p-4 font-medium">Guest Name</th>
                <th className="p-4 font-medium">Hotel</th>
                <th className="p-4 font-medium">Dates</th>
                <th className="p-4 font-medium">Net Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {reservations.map((res) => (
                <tr key={res.id} className="hover:bg-surface-2/30 transition-colors">
                  <td className="p-4 font-mono text-[12px] text-brand font-medium cursor-pointer hover:underline" onClick={() => setViewingReservation(res)}>{res.id}</td>
                  <td className="p-4 font-medium text-text-primary">{res.guest}</td>
                  <td className="p-4 text-text-secondary">{res.hotel}</td>
                  <td className="p-4">
                    <div className="text-[12px]">{res.checkIn}</div>
                    <div className="text-[10px] text-text-secondary">to {res.checkOut}</div>
                  </td>
                  <td className="p-4 font-medium">{res.amount}</td>
                  <td className="p-4">
                    <StatusBadge tone={res.tone as any}>{res.status}</StatusBadge>
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4 text-text-secondary" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewingReservation(res)}>
                          <Eye className="mr-2 h-4 w-4 text-text-secondary" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setModifyingReservation(res)}>
                          <Edit className="mr-2 h-4 w-4 text-text-secondary" /> Modify Dates
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-error">
                          <XCircle className="mr-2 h-4 w-4" /> Cancel Booking
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Details Modal */}
      {viewingReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-xl overflow-hidden w-full max-w-2xl shadow-2xl">
            <div className="p-5 border-b border-border flex justify-between items-center bg-surface-2/50">
              <div>
                <h3 className="font-bold text-text-primary text-[16px]">Reservation Details</h3>
                <div className="text-[12px] text-text-secondary font-mono mt-1">Ref: {viewingReservation.id}</div>
              </div>
              <button onClick={() => setViewingReservation(null)} className="text-text-secondary hover:text-error p-1 rounded-md hover:bg-surface transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-text-primary text-[18px]">{viewingReservation.hotel}</h4>
                  <div className="flex items-center gap-1 text-[13px] text-text-secondary mt-1">
                    <MapPin className="h-3 w-3" /> New Delhi, India
                  </div>
                </div>
                <StatusBadge tone={viewingReservation.tone}>{viewingReservation.status}</StatusBadge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-border-subtle">
                <div>
                  <div className="text-[11px] text-text-secondary uppercase tracking-wider">Check In</div>
                  <div className="font-medium text-[13px] text-text-primary mt-1">{viewingReservation.checkIn}</div>
                  <div className="text-[11px] text-text-secondary">14:00 PM</div>
                </div>
                <div>
                  <div className="text-[11px] text-text-secondary uppercase tracking-wider">Check Out</div>
                  <div className="font-medium text-[13px] text-text-primary mt-1">{viewingReservation.checkOut}</div>
                  <div className="text-[11px] text-text-secondary">11:00 AM</div>
                </div>
                <div>
                  <div className="text-[11px] text-text-secondary uppercase tracking-wider">Room Type</div>
                  <div className="font-medium text-[13px] text-text-primary mt-1">{viewingReservation.room}</div>
                  <div className="text-[11px] text-text-secondary">Room Only</div>
                </div>
                <div>
                  <div className="text-[11px] text-text-secondary uppercase tracking-wider">Guests</div>
                  <div className="font-medium text-[13px] text-text-primary mt-1">{viewingReservation.guest}</div>
                  <div className="text-[11px] text-text-secondary">{viewingReservation.guestsCount}</div>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-text-primary text-[14px] mb-3">Payment Summary</h5>
                <div className="bg-surface-2 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-text-secondary">Net Payable Amount</span>
                    <span className="font-medium text-text-primary">{viewingReservation.amount}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-text-secondary">Payment Method</span>
                    <span className="font-medium text-text-primary">{viewingReservation.payment}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-text-secondary">Booked On</span>
                    <span className="font-medium text-text-primary">{viewingReservation.bookedOn}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-3 bg-surface-2/50">
              <Button variant="outline" onClick={() => { setViewingReservation(null); setModifyingReservation(viewingReservation); }}>
                <Edit className="h-4 w-4 mr-2" /> Modify Dates
              </Button>
              <Button variant="primary" onClick={() => setViewingReservation(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modify Dates Modal */}
      {modifyingReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-xl overflow-hidden w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-border flex justify-between items-center bg-surface-2/50">
              <div>
                <h3 className="font-bold text-text-primary text-[16px]">Modify Dates</h3>
                <div className="text-[12px] text-text-secondary font-mono mt-1">Ref: {modifyingReservation.id}</div>
              </div>
              <button onClick={() => setModifyingReservation(null)} className="text-text-secondary hover:text-error p-1 rounded-md hover:bg-surface transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); alert("Dates modified successfully!"); setModifyingReservation(null); }}>
              <div className="p-6 space-y-4">
                <div className="p-3 bg-brand/5 border border-brand/20 rounded-lg text-[12px] text-text-secondary flex gap-2">
                  <Calendar className="h-4 w-4 text-brand shrink-0" />
                  <p>Modifying dates may result in a change in the booking rate depending on hotel availability and seasonal pricing.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-text-primary">New Check-in Date</label>
                    <input type="date" className="h-10 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" defaultValue="2026-05-24" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-medium text-text-primary">New Check-out Date</label>
                    <input type="date" className="h-10 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" defaultValue="2026-05-26" />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-border flex justify-end gap-3 bg-surface-2/50">
                <Button variant="outline" type="button" onClick={() => setModifyingReservation(null)}>Cancel</Button>
                <Button variant="primary" type="submit">Check Availability & Update</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
