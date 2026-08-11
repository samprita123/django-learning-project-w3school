import { useState } from "react";
import { Plus, Trash2, Edit2, Eye } from "lucide-react";
import {
  PageHeader,
  KpiCard,
  Button,
  Card,
  CardHeader,
  StatusBadge,
} from "@/components/ui/Primitives";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPackages, createPackage, updatePackage, deletePackage, HospitalityPackage } from "@/services/api/packages";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function PackagesFeature() {
  const queryClient = useQueryClient();
  const { data: packages = [], isLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: fetchPackages,
  });

  const createMutation = useMutation({
    mutationFn: createPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      setIsSheetOpen(false);
      setCurrentPackage({ name: "", price: "", inclusions: "", status: "Active" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updatePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      setIsSheetOpen(false);
      setCurrentPackage({ name: "", price: "", inclusions: "", status: "Active" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
  });

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<Partial<HospitalityPackage>>({
    name: "",
    price: "",
    inclusions: "",
    status: "Active",
  });

  const revenue = packages.reduce((a, p) => a + Number(p.price) * (/* mock bookingsMtd */ 0), 0);
  const activeCount = packages.filter((p) => p.status === "Active").length;

  const handleSavePackage = () => {
    if (!currentPackage.name || !currentPackage.price) return;

    if (currentPackage.id) {
      updateMutation.mutate(currentPackage as HospitalityPackage);
    } else {
      createMutation.mutate(currentPackage as HospitalityPackage);
    }
  };

  const handleCreateNew = () => {
    setCurrentPackage({ name: "", price: "", inclusions: "", status: "Active" });
    setIsViewMode(false);
    setIsSheetOpen(true);
  };

  const handleEdit = (pkg: HospitalityPackage) => {
    setCurrentPackage({ ...pkg });
    setIsViewMode(false);
    setIsSheetOpen(true);
  };

  const handleView = (pkg: HospitalityPackage) => {
    setCurrentPackage({ ...pkg });
    setIsViewMode(true);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (pkg: HospitalityPackage) => {
    updateMutation.mutate({ ...pkg, status: pkg.status === "Active" ? "Draft" : "Active" });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Packages"
        title="Packages"
        description="Hospitality package setup"
        actions={
          <Button size="sm" onClick={handleCreateNew}>
            <Plus className="h-3.5 w-3.5" />
            Create package
          </Button>
        }
      />

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-[400px] sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle>{currentPackage.id ? "Edit Package" : "Create New Package"}</SheetTitle>
          </SheetHeader>
          <div className="grid gap-5 py-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                value={currentPackage.name}
                onChange={(e) => setCurrentPackage({ ...currentPackage, name: e.target.value })}
                placeholder="e.g. Honeymoon Special"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={currentPackage.price}
                onChange={(e) => setCurrentPackage({ ...currentPackage, price: e.target.value })}
                placeholder="e.g. 15000"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inclusions">Inclusions</Label>
              <Input
                id="inclusions"
                value={currentPackage.inclusions}
                onChange={(e) => setCurrentPackage({ ...currentPackage, inclusions: e.target.value })}
                placeholder="e.g. Room, Breakfast, Spa"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={currentPackage.status}
                onChange={(e) => setCurrentPackage({ ...currentPackage, status: e.target.value })}
                disabled={isViewMode}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
          <SheetFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsSheetOpen(false)}>{isViewMode ? 'Close' : 'Cancel'}</Button>
            {!isViewMode && <Button onClick={handleSavePackage}>Save Package</Button>}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <div className="space-y-6 p-6">

        <Card>
          <CardHeader title="Package catalog" />
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-surface-2/40 text-left">
                {["Package", "Price", "Inclusions", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {packages.map((p) => (
                <tr key={p.id} className="border-b border-border-subtle hover:bg-surface-2/50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 font-mono">₹{Number(p.price).toLocaleString()}</td>
                  <td className="px-4 py-3 text-text-secondary">{p.inclusions || "None"}</td>

                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={p.status === "Active"}
                        onCheckedChange={() => handleToggleStatus(p)}
                      />
                      <StatusBadge tone={p.status === "Active" ? "success" : "neutral"}>
                        {p.status}
                      </StatusBadge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2 text-text-secondary">
                      <button type="button" title="View" className="hover:text-primary transition-colors" onClick={() => handleView(p)}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <button type="button" title="Edit" className="hover:text-primary transition-colors" onClick={() => handleEdit(p)}>
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button type="button" title="Delete" className="hover:text-red-500 transition-colors" onClick={() => p.id && handleDelete(p.id)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        {/* Removed redundant Hotel package templates block since Packages are now unified in HospitalityPackages */}
      </div>
    </div>
  );
}
export default PackagesFeature;
