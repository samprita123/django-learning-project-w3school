import { useState, useEffect } from "react";
import { CheckCircle2, Clock, ChefHat, Package, Edit, Timer, XCircle } from "lucide-react";
import { PageHeader, Card, Button } from "@/components/ui/Primitives";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

type OrderStatus = "Order Placed" | "Preparing" | "Ready" | "Delivered";

type Order = {
  id: string;
  location: string;
  type: string;
  time: string;
  elapsed: string;
  status: OrderStatus;
  isReal?: boolean;
};

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "Order Placed": return "bg-info-tint text-info border-info/20";
    case "Preparing": return "bg-warning-tint text-warning-strong border-warning/20";
    case "Ready": return "bg-success-tint text-success border-success/20";
    default: return "bg-surface-2 text-text-secondary border-border";
  }
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case "Order Placed": return <Clock className="h-4 w-4" />;
    case "Preparing": return <ChefHat className="h-4 w-4" />;
    case "Ready": return <Package className="h-4 w-4" />;
    default: return <CheckCircle2 className="h-4 w-4" />;
  }
};

const initialDummyOrders: Order[] = [
  { id: "KOT-1042", location: "Table 12", type: "Dine-in", time: "14:30", elapsed: "25 min ago", status: "Ready" },
  { id: "KOT-1043", location: "Room 302", type: "Room Service", time: "14:40", elapsed: "15 min ago", status: "Preparing" },
  { id: "KOT-1044", location: "Takeaway", type: "Takeaway", time: "14:50", elapsed: "5 min ago", status: "Order Placed" },
];

export function OrderTrackingFeature() {
  const [latestOrder, setLatestOrder] = useState<any>(null);
  const [dummyOrders, setDummyOrders] = useState<Order[]>(initialDummyOrders);
  const navigate = useNavigate();

  useEffect(() => {
    const loadOrder = () => {
      try {
        const data = localStorage.getItem('pos_latest_order');
        if (data) {
          setLatestOrder(JSON.parse(data));
        } else {
          setLatestOrder(null);
        }
      } catch (e) {
        // ignore
      }
    };
    
    loadOrder();
    window.addEventListener("pos_order_placed", loadOrder);
    return () => window.removeEventListener("pos_order_placed", loadOrder);
  }, []);

  const handleCancelOrder = (order: Order) => {
    if (confirm(`Are you sure you want to void order ${order.id}?`)) {
      if (order.isReal) {
        localStorage.removeItem('pos_latest_order');
        setLatestOrder(null);
      } else {
        setDummyOrders(prev => prev.filter(o => o.id !== order.id));
      }
      toast.success(`Order ${order.id} has been voided.`);
    }
  };

  const activeOrders: Order[] = latestOrder 
    ? [
        { 
          id: latestOrder.id, 
          location: latestOrder.location, 
          type: latestOrder.type, 
          time: latestOrder.time, 
          elapsed: "Just now", 
          status: "Order Placed",
          isReal: true
        },
        ...dummyOrders
      ] 
    : dummyOrders;

  return (
    <div>
      <PageHeader
        eyebrow="Fulfillment"
        title="Active Orders"
        description="Monitor real-time status of orders in the kitchen."
      />
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeOrders.map(order => (
            <Card key={order.id} className="p-4 flex flex-col hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[15px] font-semibold text-text-primary">{order.id}</h3>
                  <p className="text-[12px] text-text-secondary">{order.location} • {order.type}</p>
                </div>
                <div className={`px-2.5 py-1 rounded-full border text-[11px] font-medium flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-border border-dashed flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[12px] text-text-secondary">
                  <Timer className="h-4 w-4" />
                  <span className={order.elapsed.includes("25 min") ? "text-error font-medium" : ""}>
                    {order.elapsed}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-[11px] px-2 border-error text-error hover:bg-error-tint hover:border-error-strong"
                    onClick={() => handleCancelOrder(order)}
                    title="Void Order"
                  >
                    <XCircle className="h-3 w-3" />
                    Void
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-[11px] px-3"
                    onClick={() => {
                      if (order.isReal) {
                        sessionStorage.setItem("edit_pos_order", "true");
                        navigate({ to: "/pos/new" });
                      } else {
                        toast("Editing dummy orders is not supported.");
                      }
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
