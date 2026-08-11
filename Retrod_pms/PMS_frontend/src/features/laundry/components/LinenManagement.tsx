import { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { fetchApi } from "@/services/api/core";
import { toast } from "sonner";

interface LinenItem {
  id: string;
  name: string;
  location: string;
  total_qty: number;
  in_use_qty: number;
  in_wash_qty: number;
  damaged_qty: number;
  stock_status: string;
}

export function LinenManagement() {
  const [linens, setLinens] = useState<LinenItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newType, setNewType] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newTotalStock, setNewTotalStock] = useState("");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingLinen, setEditingLinen] = useState<LinenItem | null>(null);

  const activePropertyId = useMemo(() => {
    return localStorage.getItem("retrod:active-property-id") || "";
  }, []);

  const loadLinen = async () => {
    setIsLoading(true);
    try {
      const res = await fetchApi<any>(`/api/linen/items/?property=${activePropertyId}`);
      setLinens(Array.isArray(res) ? res : res?.results || []);
    } catch (err: any) {
      console.error("Failed to load linen:", err);
      toast.error("Failed to load linen inventory.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLinen();
  }, [activePropertyId]);

  const handleAddStock = async () => {
    if (!newType.trim() || !newLocation.trim() || !newTotalStock.trim()) {
      toast.error("All fields are required.");
      return;
    }

    const payload = {
      property: activePropertyId,
      name: newType.trim(),
      code: newType.trim().toUpperCase().replace(/[^A-Z0-9]/g, "_") + "_" + Math.floor(Math.random() * 1000),
      location: newLocation.trim(),
      total_qty: parseInt(newTotalStock) || 0,
      in_use_qty: 0,
      in_wash_qty: 0,
      damaged_qty: 0
    };
    
    try {
      await fetchApi("/api/linen/items/", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      toast.success("Linen stock added successfully.");
      setIsOpen(false);
      setNewType("");
      setNewLocation("");
      setNewTotalStock("");
      loadLinen();
    } catch (err: any) {
      toast.error("Failed to add linen: " + err.message);
    }
  };

  const handleUpdateStock = async () => {
    if (!editingLinen) return;
    
    const payload = {
      total_qty: editingLinen.total_qty,
      in_use_qty: editingLinen.in_use_qty,
      in_wash_qty: editingLinen.in_wash_qty,
      damaged_qty: editingLinen.damaged_qty,
      location: editingLinen.location
    };

    try {
      await fetchApi(`/api/linen/items/${editingLinen.id}/update-stock/`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      toast.success("Linen inventory updated successfully.");
      setIsEditOpen(false);
      setEditingLinen(null);
      loadLinen();
    } catch (err: any) {
      toast.error("Failed to update stock: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Linen Management</h2>
          <p className="text-muted-foreground">Track and manage hotel linen inventory.</p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Linen Stock
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Linen Stock</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Linen Type</Label>
              <Input
                id="type"
                placeholder="e.g. Bath Towel"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location / Department</Label>
              <Input
                id="location"
                placeholder="e.g. Housekeeping"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="totalStock">Total Stock Quantity</Label>
              <Input
                id="totalStock"
                type="number"
                placeholder="0"
                value={newTotalStock}
                onChange={(e) => setNewTotalStock(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStock}>
              Add Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Inventory: {editingLinen?.name}</DialogTitle>
          </DialogHeader>
          {editingLinen && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editTotalStock">Total Stock</Label>
                <Input
                  id="editTotalStock"
                  type="number"
                  value={editingLinen.total_qty}
                  onChange={(e) => setEditingLinen({ ...editingLinen, total_qty: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editInUse">In Use</Label>
                <Input
                  id="editInUse"
                  type="number"
                  value={editingLinen.in_use_qty}
                  onChange={(e) => setEditingLinen({ ...editingLinen, in_use_qty: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editInWash">In Wash</Label>
                <Input
                  id="editInWash"
                  type="number"
                  value={editingLinen.in_wash_qty}
                  onChange={(e) => setEditingLinen({ ...editingLinen, in_wash_qty: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editDamaged">Damaged</Label>
                <Input
                  id="editDamaged"
                  type="number"
                  value={editingLinen.damaged_qty}
                  onChange={(e) => setEditingLinen({ ...editingLinen, damaged_qty: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStock}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Current Linen Inventory</CardTitle>
          <CardDescription>Overview of all linen items across departments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Total Stock</TableHead>
                <TableHead className="text-right">In Use</TableHead>
                <TableHead className="text-right">In Wash</TableHead>
                <TableHead className="text-right">Damaged</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No linen stock found in database.
                  </TableCell>
                </TableRow>
              ) : (
                linens.map((linen) => {
                  const available = linen.total_qty - linen.in_use_qty - linen.in_wash_qty - linen.damaged_qty;
                  const status = available < linen.total_qty * 0.1 ? "Low Stock" : "Adequate";
                  return (
                    <TableRow key={linen.id}>
                      <TableCell className="font-medium">{linen.name}</TableCell>
                      <TableCell>{linen.location}</TableCell>
                      <TableCell className="text-right">{linen.total_qty}</TableCell>
                      <TableCell className="text-right">{linen.in_use_qty}</TableCell>
                      <TableCell className="text-right">{linen.in_wash_qty}</TableCell>
                      <TableCell className="text-right text-destructive">{linen.damaged_qty}</TableCell>
                      <TableCell>
                        <Badge variant={status === "Low Stock" ? "destructive" : "secondary"}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => {
                          setEditingLinen(linen);
                          setIsEditOpen(true);
                        }}>
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
