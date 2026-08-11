import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shirt, CheckCircle, Clock, CircleDollarSign } from "lucide-react";
import { fetchApi } from "@/services/api/core";
import { toast } from "sonner";

interface StatData {
  pending_pickups: number;
  in_washing: number;
  ready_for_delivery: number;
  today_revenue: number;
  recent_orders: any[];
}

export function LaundryDashboard() {
  const [stats, setStats] = useState<StatData>({
    pending_pickups: 0,
    in_washing: 0,
    ready_for_delivery: 0,
    today_revenue: 0,
    recent_orders: [],
  });
  const [machines, setMachines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activePropertyId = useMemo(() => {
    return localStorage.getItem("retrod:active-property-id") || "";
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch dashboard stats
      const statsRes = await fetchApi<StatData>(`/api/linen/orders/dashboard-stats/?property=${activePropertyId}`);
      if (statsRes) {
        setStats(statsRes);
      }

      // 2. Fetch machines status
      const machinesRes = await fetchApi<any>(`/api/linen/machines/?property=${activePropertyId}`);
      setMachines(Array.isArray(machinesRes) ? machinesRes : machinesRes?.results || []);
    } catch (err: any) {
      console.error("Failed to load laundry dashboard stats:", err);
      toast.error("Failed to load laundry stats.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [activePropertyId]);

  const activeMachines = useMemo(() => {
    return machines.filter((m) => m.status === "OPERATING").length;
  }, [machines]);

  const getStatusLabel = (status: string) => {
    if (status === "PICKUP_REQUESTED") return "Pickup Requested";
    if (status === "RECEIVED_AT_LAUNDRY") return "Received at Laundry";
    if (status === "WASHING") return "Washing";
    if (status === "READY_FOR_DELIVERY") return "Ready for Delivery";
    if (status === "DELIVERED") return "Delivered";
    return status;
  };

  const getMachineTypeLabel = (mType: string) => {
    if (mType === "WASHER") return "Washer";
    if (mType === "DRYER") return "Dryer";
    if (mType === "IRON_PRESS") return "Iron Press";
    return mType;
  };

  const getMachineStatusLabel = (status: string) => {
    if (status === "OPERATING") return "Operating";
    if (status === "IDLE") return "Idle";
    if (status === "MAINTENANCE") return "Maintenance";
    return status;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of today's laundry operations.</p>
        </div>
        <Badge variant="outline" className="cursor-pointer py-1 px-3" onClick={loadDashboard}>
          Refresh
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Pickups</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending_pickups}</div>
            <p className="text-xs text-muted-foreground">Require immediate action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Washing</CardTitle>
            <Shirt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.in_washing}</div>
            <p className="text-xs text-muted-foreground">Currently processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ready for Delivery</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ready_for_delivery}</div>
            <p className="text-xs text-muted-foreground">To be dispatched</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.today_revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From guest laundry</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest guest laundry requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent_orders.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-6">No recent orders.</div>
              ) : (
                stats.recent_orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{order.guest_name} - Room {order.room_number}</span>
                      <span className="text-xs text-muted-foreground">
                        {order.items?.length || 0} items • {order.service_speed === "EXPRESS" ? "Express" : "Standard"}
                      </span>
                    </div>
                    <Badge variant={order.status === "PICKUP_REQUESTED" ? "destructive" : "secondary"}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Machine Status</CardTitle>
            <CardDescription>{activeMachines} machines currently operating.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              {machines.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-6">No machines registered.</div>
              ) : (
                machines.map((machine) => (
                  <div key={machine.id} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{machine.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {getMachineTypeLabel(machine.machine_type)} • {machine.capacity_kg}
                      </span>
                    </div>
                    <Badge variant={machine.status === "OPERATING" ? "default" : machine.status === "MAINTENANCE" ? "destructive" : "secondary"}>
                      {getMachineStatusLabel(machine.status)}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
