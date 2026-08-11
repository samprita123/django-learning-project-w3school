import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchApi } from "@/services/api/core";
import { toast } from "sonner";

// Columns map to backend choices: PICKUP_REQUESTED, RECEIVED_AT_LAUNDRY, WASHING, READY_FOR_DELIVERY
const COLUMNS = [
  "Pickup Requested",
  "Received at Laundry",
  "Washing",
  "Ready for Delivery",
] as const;

type ColumnType = typeof COLUMNS[number];

const mapDBStatusToUI = (status: string): ColumnType => {
  if (status === "PICKUP_REQUESTED" || status === "PICKED_UP") return "Pickup Requested";
  if (status === "RECEIVED_AT_LAUNDRY") return "Received at Laundry";
  if (status === "WASHING" || status === "IRONING") return "Washing";
  return "Ready for Delivery";
};

const mapUIToDBStatus = (status: ColumnType): string => {
  if (status === "Pickup Requested") return "PICKUP_REQUESTED";
  if (status === "Received at Laundry") return "RECEIVED_AT_LAUNDRY";
  if (status === "Washing") return "WASHING";
  return "READY_FOR_DELIVERY";
};

export function LaundryWorkflow() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const activePropertyId = useMemo(() => {
    return localStorage.getItem("retrod:active-property-id") || "";
  }, []);

  const loadWorkflow = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi<any>(`/api/linen/orders/?property=${activePropertyId}`);
      const list = Array.isArray(res) ? res : res?.results || [];
      setOrders(list);

      // Re-sync selected order details
      if (selectedOrder) {
        const fresh = list.find((o: any) => o.id === selectedOrder.id);
        setSelectedOrder(fresh || null);
      }
    } catch (err: any) {
      console.error("Failed to load laundry workflow:", err);
      toast.error("Failed to load laundry orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflow();
  }, [activePropertyId]);

  const handleDrop = async (e: React.DragEvent, newStatus: ColumnType) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData("orderId");
    if (!orderId) return;

    try {
      const dbStatus = mapUIToDBStatus(newStatus);
      await fetchApi(`/api/linen/orders/${orderId}/update-status/`, {
        method: "POST",
        body: JSON.stringify({ status: dbStatus }),
      });
      toast.success("Order status updated successfully.");
      loadWorkflow();
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === "PICKUP_REQUESTED") return "Pickup Requested";
    if (status === "RECEIVED_AT_LAUNDRY") return "Received at Laundry";
    if (status === "WASHING") return "Washing";
    if (status === "READY_FOR_DELIVERY") return "Ready for Delivery";
    if (status === "DELIVERED") return "Delivered";
    return status;
  };

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 space-y-6 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Laundry Workflow</h2>
            <p className="text-muted-foreground">Kanban board to track laundry orders.</p>
          </div>
          <Badge variant="outline" className="cursor-pointer py-1 px-3" onClick={loadWorkflow}>
            Refresh
          </Badge>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {COLUMNS.map((col) => {
            const columnOrders = orders.filter((o) => mapDBStatusToUI(o.status) === col);

            return (
              <div 
                key={col} 
                className="w-[300px] shrink-0 rounded-lg bg-muted/50 p-4 flex flex-col"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, col)}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-medium text-sm text-muted-foreground">{col}</h3>
                  <Badge variant="secondary">{columnOrders.length}</Badge>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnOrders.map((order) => (
                    <Card 
                      key={order.id} 
                      className={`cursor-pointer hover:border-primary/50 transition-colors ${selectedOrder?.id === order.id ? 'border-primary shadow-sm' : ''}`}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("orderId", order.id)}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <CardHeader className="p-3 pb-2">
                        <CardTitle className="text-sm flex justify-between">
                          <span>{order.guest_name}</span>
                          <span className="text-xs text-muted-foreground">{order.order_number || order.id.substring(0, 8)}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="text-xs text-muted-foreground mb-2">Room {order.room_number}</div>
                        <div className="flex flex-wrap gap-1">
                          {order.items?.slice(0, 2).map((item: any) => (
                            <Badge key={item.id} variant="outline" className="text-[10px]">
                              {item.quantity}x {item.category}
                            </Badge>
                          ))}
                          {order.items?.length > 2 && (
                            <Badge variant="outline" className="text-[10px]">+{order.items.length - 2}</Badge>
                          )}
                        </div>
                        {order.service_speed === "EXPRESS" && (
                          <div className="mt-2 flex">
                             <Badge className="bg-orange-500 hover:bg-orange-600 text-[10px]">Express</Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedOrder && (
        <div className="w-[350px] shrink-0 border-l pl-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium">Order Details</h3>
            <p className="text-sm text-muted-foreground">{selectedOrder.order_number || selectedOrder.id}</p>
          </div>
          
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Guest</div>
                  <div className="font-medium">{selectedOrder.guest_name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-muted-foreground">Room</div>
                  <div className="font-medium">{selectedOrder.room_number}</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
                <Badge variant="secondary" className="text-xs">{getStatusLabel(selectedOrder.status)}</Badge>
              </div>
              
              {selectedOrder.service_speed === "EXPRESS" && (
                <div>
                  <Badge className="bg-orange-500 text-white">Express Delivery</Badge>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm font-medium text-muted-foreground">Items</div>
                  <div className="text-xs text-muted-foreground">
                    Total: {selectedOrder.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0}
                  </div>
                </div>
                <ul className="space-y-2 text-sm border rounded-md p-3 bg-muted/20">
                  {selectedOrder.items?.map((item: any) => (
                    <li key={item.id} className="flex justify-between items-center">
                      <span>{item.category} ({item.service})</span>
                      <span className="font-medium">x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
