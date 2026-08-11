import { MOCK_ORDERS } from "../lib/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function QualityControl() {
  const qcOrders = MOCK_ORDERS.filter(o => o.status === "Washing" || o.status === "Ready for Delivery");

  const handlePass = (id: string) => {
    toast.success(`Order ${id} passed quality inspection`);
  };

  const handleFail = (id: string) => {
    toast.error(`Order ${id} failed inspection and sent for re-wash`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Quality Control</h2>
        <p className="text-muted-foreground">Inspect finished laundry before packaging and delivery.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Inspections</CardTitle>
          <CardDescription>Orders waiting for QA supervisor approval.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Checklist</TableHead>
                <TableHead className="text-right">Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qcOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.guestName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {order.items.map(item => (
                        <span key={item.id} className="text-xs text-muted-foreground">{item.quantity}x {item.category} ({item.serviceType})</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                       <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">Stains</Badge>
                       <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">Ironing</Badge>
                       <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">Count</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleFail(order.id)}>
                      <AlertTriangle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handlePass(order.id)}>
                      <CheckSquare className="h-4 w-4 mr-1" /> Pass
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
