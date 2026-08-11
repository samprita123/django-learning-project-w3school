import { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText, Send } from "lucide-react";
import { fetchApi } from "@/services/api/core";

export function BillingModule() {
  const [unbilledOrders, setUnbilledOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activePropertyId = useMemo(() => {
    return localStorage.getItem("retrod:active-property-id") || "";
  }, []);

  const loadUnbilled = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi<any>(`/api/linen/orders/?is_posted_to_folio=false&property=${activePropertyId}`);
      const list = Array.isArray(res) ? res : res?.results || [];
      // Filter orders that are READY_FOR_DELIVERY or DELIVERED
      const filtered = list.filter((o: any) => o.status === "READY_FOR_DELIVERY" || o.status === "DELIVERED");
      setUnbilledOrders(filtered);
    } catch (err: any) {
      console.error("Failed to load unbilled orders:", err);
      toast.error("Failed to load pending bills.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUnbilled();
  }, [activePropertyId]);

  const handlePostToFolio = async (orderId: string) => {
    try {
      await fetchApi(`/api/linen/orders/${orderId}/post-to-folio/`, {
        method: "POST"
      });
      toast.success(`Successfully posted charges to Guest Folio`);
      loadUnbilled();
    } catch (err: any) {
      toast.error("Failed to post folio: " + err.message);
    }
  };

  const handlePrintReceipt = async (orderId: string) => {
    try {
      const receipt = await fetchApi<any>(`/api/linen/orders/${orderId}/receipt/`);
      toast.info(`Receipt for order #${receipt.order_number || orderId}: Total amount is $${receipt.total_amount}.`);
    } catch (err: any) {
      toast.error("Failed to fetch receipt data.");
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === "READY_FOR_DELIVERY") return "Ready for Delivery";
    if (status === "DELIVERED") return "Delivered to Room";
    return status;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Billing & Folio</h2>
          <p className="text-muted-foreground">Manage guest laundry charges and post to PMS folio.</p>
        </div>
        <Badge variant="outline" className="cursor-pointer py-1 px-3" onClick={loadUnbilled}>
          Refresh
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unbilled Orders</CardTitle>
          <CardDescription>Completed laundry orders pending folio posting.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Guest Name</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Status</TableHead>
                <CardTitle className="text-right inline-block w-full py-2">Total Amount</CardTitle>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unbilledOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No unbilled completed laundry orders found.
                  </TableCell>
                </TableRow>
              ) : (
                unbilledOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number || order.id.substring(0, 8)}</TableCell>
                    <TableCell>{order.guest_name}</TableCell>
                    <TableCell>{order.room_number}</TableCell>
                    <TableCell>
                       <Badge variant="secondary">{getStatusLabel(order.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      ${parseFloat(order.total_amount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handlePrintReceipt(order.id)}>
                        <FileText className="h-4 w-4 mr-1" /> Receipt
                      </Button>
                      <Button size="sm" onClick={() => handlePostToFolio(order.id)}>
                        <Send className="h-4 w-4 mr-1" /> Post to Folio
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
