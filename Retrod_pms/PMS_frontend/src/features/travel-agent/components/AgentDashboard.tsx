import { Link } from "@tanstack/react-router";
import { ArrowUpRight, TrendingUp, DollarSign, Calendar, Search, Users, Activity } from "lucide-react";
import { PageHeader, KpiCard, Card, CardHeader, Button, StatusBadge } from "@/components/ui/Primitives";

export function AgentDashboard() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Welcome, Global Escapes</h2>
          <p className="text-[13px] text-text-secondary mt-1">Here's your booking and financial summary.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/travel-agent/search">
            <Button variant="primary" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Book New Room
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Today's Bookings" value="4" delta="2 pending" deltaTone="neutral" accent="brand" />
        <KpiCard label="Upcoming Check-ins" value="12" delta="Next 7 days" deltaTone="neutral" accent="info" />
        <KpiCard label="Commission Earned" value="₹42,500" delta="MTD" deltaTone="success" accent="success" />
        <KpiCard label="Available Credit" value="₹1,50,000" delta="Limit: ₹2L" deltaTone="neutral" accent="warning" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Recent Bookings" hint="Latest 5 reservations" />
            <div className="table-scroll-shadow overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/40 text-left">
                    <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">Booking Ref</th>
                    <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">Guest</th>
                    <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">Hotel</th>
                    <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">Check-in</th>
                    <th className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: "RES-9982", guest: "Sarah Jenkins", hotel: "The Grand Palace", date: "22 May 2026", status: "Confirmed", tone: "success" },
                    { id: "RES-9981", guest: "Marcus Chen", hotel: "The Grand Palace", date: "24 May 2026", status: "Waitlisted", tone: "warning" },
                    { id: "RES-9979", guest: "Priya Sharma", hotel: "Retrod Resort Goa", date: "25 May 2026", status: "Confirmed", tone: "success" },
                    { id: "RES-9975", guest: "David Smith", hotel: "The Grand Palace", date: "28 May 2026", status: "Cancelled", tone: "error" },
                    { id: "RES-9970", guest: "Anita Desai", hotel: "Retrod Resort Goa", date: "02 Jun 2026", status: "Confirmed", tone: "success" },
                  ].map((row) => (
                    <tr key={row.id} className="border-b border-border-subtle hover:bg-surface-2/30">
                      <td className="px-4 py-3 font-mono text-[12px] text-brand cursor-pointer hover:underline">{row.id}</td>
                      <td className="px-4 py-3 font-medium">{row.guest}</td>
                      <td className="px-4 py-3 text-text-secondary">{row.hotel}</td>
                      <td className="px-4 py-3">{row.date}</td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={row.tone as any}>{row.status}</StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <Card>
               <CardHeader title="Performance Metrics" />
               <div className="p-4 space-y-4">
                 <div className="flex justify-between items-end">
                   <div>
                     <div className="text-[11px] text-text-secondary">Conversion Rate</div>
                     <div className="text-xl font-bold">18.4%</div>
                   </div>
                   <Activity className="h-5 w-5 text-brand opacity-50" />
                 </div>
                 <div className="flex justify-between items-end">
                   <div>
                     <div className="text-[11px] text-text-secondary">Avg Daily Rate (ADR)</div>
                     <div className="text-xl font-bold">₹8,450</div>
                   </div>
                   <TrendingUp className="h-5 w-5 text-success opacity-50" />
                 </div>
                 <div className="flex justify-between items-end">
                   <div>
                     <div className="text-[11px] text-text-secondary">Avg Length of Stay</div>
                     <div className="text-xl font-bold">3.2 Nights</div>
                   </div>
                   <Calendar className="h-5 w-5 text-info opacity-50" />
                 </div>
               </div>
             </Card>
             <Card>
               <CardHeader title="Top Selling Hotels" />
               <div className="p-4 space-y-4">
                 {[
                   { name: "The Grand Palace", bookings: 42, rev: "₹3.2L" },
                   { name: "Retrod Resort Goa", bookings: 28, rev: "₹2.8L" },
                   { name: "City Center Inn", bookings: 14, rev: "₹85k" },
                 ].map((h, i) => (
                   <div key={i} className="flex items-center justify-between">
                     <div className="space-y-0.5">
                       <div className="text-[13px] font-medium">{h.name}</div>
                       <div className="text-[11px] text-text-secondary">{h.bookings} bookings MTD</div>
                     </div>
                     <div className="text-[13px] font-medium">{h.rev}</div>
                   </div>
                 ))}
               </div>
             </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Commission Overview" hint="MTD" />
            <div className="p-4 space-y-5">
              <div>
                <div className="text-[11px] text-text-secondary uppercase tracking-wider font-medium">Pending Payment</div>
                <div className="mt-1 text-2xl font-bold text-brand">₹1,12,400</div>
                <div className="text-[11px] text-text-secondary mt-1">Due by 05 Jun 2026</div>
              </div>
              <div className="h-px w-full bg-border-subtle" />
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-text-secondary">Earned (MTD)</span>
                  <span className="font-medium">₹42,500</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-text-secondary">Paid (MTD)</span>
                  <span className="font-medium">₹0</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-text-secondary">Reversals</span>
                  <span className="font-medium text-error">-₹1,200</span>
                </div>
              </div>
              <Button variant="outline" className="w-full justify-center">
                Download Statement
              </Button>
            </div>
          </Card>
          
          <Card>
            <CardHeader title="Wallet Balance" />
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10 text-success">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium">Prepaid Wallet</div>
                    <div className="text-[11px] text-text-secondary">ID: WLT-9281</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">₹45,000</div>
                </div>
              </div>
              <Button variant="primary" className="w-full justify-center">
                Top Up Wallet
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
