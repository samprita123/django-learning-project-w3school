import { useState, useEffect } from "react";
import { PageHeader, Card, KpiCard, StatusBadge, Button } from "@/components/ui/Primitives";
import { Clock, ChefHat, Check, User, Hash, Printer, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Ticket = {
  id: string;
  station: string;
  table: string;
  captain: string;
  type: string;
  items: { name: string; qty: number; notes: string }[];
  status: "Queued" | "Preparing" | "Ready";
  startedAt?: number;
  queuedAt: number;
};

const initialTickets: Ticket[] = [
  {
    id: "KOT-881",
    station: "Main Kitchen",
    table: "T-12",
    captain: "Rahul S.",
    type: "Dine-in",
    items: [
      { name: "Butter Chicken", qty: 2, notes: "Less spicy" },
      { name: "Garlic Naan", qty: 4, notes: "" }
    ],
    status: "Preparing",
    queuedAt: Date.now() - 14 * 60000,
    startedAt: Date.now() - 14 * 60000,
  },
  { 
    id: "KOT-880", 
    station: "Pantry", 
    table: "Takeaway",
    captain: "Neha G.",
    type: "Takeaway",
    items: [
      { name: "Caesar Salad", qty: 1, notes: "Dressing on side" },
      { name: "Cold Coffee", qty: 2, notes: "No sugar" }
    ],
    status: "Queued",
    queuedAt: Date.now() - 3 * 60000,
  },
  {
    id: "KOT-879",
    station: "Dessert",
    table: "T-04",
    captain: "Amit K.",
    type: "Dine-in",
    items: [
      { name: "Chocolate Mousse", qty: 2, notes: "" }
    ],
    status: "Ready",
    queuedAt: Date.now() - 18 * 60000,
    startedAt: Date.now() - 18 * 60000,
  },
];

export function PosKotFeature() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [now, setNow] = useState(Date.now());
  const [printingTicket, setPrintingTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000); // update every 10s
    return () => clearInterval(timer);
  }, []);

  const updateStatus = (id: string, newStatus: Ticket["status"]) => {
    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        if (newStatus === "Preparing") {
          return { ...t, status: newStatus, startedAt: Date.now() };
        }
        return { ...t, status: newStatus };
      }
      return t;
    }));
    toast.success(`Ticket ${id} moved to ${newStatus}`);
  };

  const markServed = (id: string) => {
    setTickets(prev => prev.filter(t => t.id !== id));
    toast.success(`Ticket ${id} marked as Served`);
  };

  const printKot = (t: Ticket) => {
    setPrintingTicket(t);
  };

  const executePrint = () => {
    toast(`Sent KOT ${printingTicket?.id} to kitchen thermal printer`, { icon: <Printer className="h-4 w-4" /> });
    setPrintingTicket(null);
  };

  const getElapsedString = (t: Ticket) => {
    const start = t.status === "Queued" ? t.queuedAt : (t.startedAt || t.queuedAt);
    const mins = Math.floor((now - start) / 60000);
    return `${mins} min`;
  };

  const isWarning = (t: Ticket) => {
    const start = t.status === "Queued" ? t.queuedAt : (t.startedAt || t.queuedAt);
    const mins = Math.floor((now - start) / 60000);
    return mins >= 15;
  };

  const queued = tickets.filter(t => t.status === "Queued").length;
  const preparing = tickets.filter(t => t.status === "Preparing").length;
  const ready = tickets.filter(t => t.status === "Ready").length;

  return (
    <div>
      <PageHeader
        eyebrow="Kitchen Operations"
        title="Kitchen Order Tickets"
        description="Station routing, prep times, and bump bar workflow."
      />
      <div className="space-y-6 p-6 h-[calc(100vh-10rem)] flex flex-col">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 shrink-0">
          <KpiCard label="Queued" value={String(queued)} accent="warning" />
          <KpiCard label="Preparing" value={String(preparing)} accent="info" />
          <KpiCard label="Ready to pass" value={String(ready)} accent="success" />
          <KpiCard label="Avg Prep Time" value="12m" accent="brand" />
        </div>
        
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 h-full min-w-max items-start">
            {tickets.length === 0 && (
              <div className="flex items-center justify-center w-full h-full text-text-secondary text-sm">
                No active orders in the kitchen.
              </div>
            )}
            {tickets.map((t) => (
              <Card key={t.id} className="w-[300px] flex flex-col shrink-0 max-h-full">
                <div className="p-4 border-b border-border bg-surface-2/30">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-mono text-[13px] font-bold text-text-primary">{t.id}</div>
                    <StatusBadge
                      tone={
                        t.status === "Ready" ? "success" : t.status === "Preparing" ? "brand" : "warning"
                      }
                    >
                      {t.status}
                    </StatusBadge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[12px] text-text-secondary mt-3">
                    <div className="flex items-center gap-1.5">
                      <Hash className="h-3 w-3" />
                      <span className="font-medium text-text-primary">{t.table}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3" />
                      <span>{t.captain}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      <span className={isWarning(t) ? "text-error font-medium" : ""}>{getElapsedString(t)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ChefHat className="h-3 w-3" />
                      <span>{t.station}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {t.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="font-mono font-bold text-[14px] bg-surface-2 h-6 w-6 flex items-center justify-center rounded">
                        {item.qty}
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-medium text-text-primary">{item.name}</div>
                        {item.notes && (
                          <div className="text-[11px] text-error mt-0.5 font-medium flex items-center gap-1">
                            <span className="w-1 h-1 bg-error rounded-full block" /> {item.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-border bg-surface-2/30 grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="col-span-1" onClick={() => printKot(t)}>Print</Button>
                  {t.status === "Queued" && (
                    <Button variant="primary" size="sm" className="col-span-1" onClick={() => updateStatus(t.id, "Preparing")}>Start Prep</Button>
                  )}
                  {t.status === "Preparing" && (
                    <Button variant="primary" size="sm" className="col-span-1" onClick={() => updateStatus(t.id, "Ready")}>Mark Ready</Button>
                  )}
                  {t.status === "Ready" && (
                    <Button variant="outline" size="sm" className="col-span-1 border-success text-success hover:bg-success/10" onClick={() => markServed(t.id)}>
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Served
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!printingTicket} onOpenChange={(open) => !open && setPrintingTicket(null)}>
        <DialogContent className="max-w-[340px] p-0 overflow-hidden bg-white text-black">
          {printingTicket && (
            <div className="flex flex-col">
              {/* Thermal Receipt styling */}
              <div className="p-6 font-mono text-[13px] uppercase tracking-wide leading-relaxed bg-[#fdfdfd] print-container border-b-2 border-dashed border-gray-300">
                <div className="text-center mb-6">
                  <div className="text-[18px] font-bold mb-1">KOT</div>
                  <div className="text-[11px] text-gray-500">Retrod PMS System</div>
                  <div className="text-[11px] text-gray-500">{new Date().toLocaleString()}</div>
                </div>

                <div className="border-t border-b border-gray-800 py-2 mb-4">
                  <div className="flex justify-between">
                    <span>TICKET:</span>
                    <span className="font-bold">{printingTicket.id}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>TABLE:</span>
                    <span className="font-bold">{printingTicket.table}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>TYPE:</span>
                    <span>{printingTicket.type}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>WAITER:</span>
                    <span>{printingTicket.captain}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>STATION:</span>
                    <span>{printingTicket.station}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex font-bold border-b border-gray-300 pb-1">
                    <span className="w-8">QTY</span>
                    <span className="flex-1">ITEM</span>
                  </div>
                  {printingTicket.items.map((item, i) => (
                    <div key={i} className="flex flex-col">
                      <div className="flex items-start">
                        <span className="w-8 font-bold text-[14px]">{item.qty}</span>
                        <span className="flex-1 font-bold">{item.name}</span>
                      </div>
                      {item.notes && (
                        <div className="flex">
                          <span className="w-8"></span>
                          <span className="flex-1 text-gray-600 text-[11px] mt-0.5">** {item.notes} **</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="text-center mt-6 pt-4 border-t border-gray-800 text-[11px] text-gray-500">
                  *** END OF TICKET ***
                </div>
              </div>

              <div className="p-4 bg-gray-50 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setPrintingTicket(null)}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={executePrint}>
                  <Printer className="h-4 w-4 mr-1.5" />
                  Print to Kitchen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
