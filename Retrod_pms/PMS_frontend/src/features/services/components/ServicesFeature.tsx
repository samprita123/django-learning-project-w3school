import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  PageHeader,
  Card,
  CardHeader,
  Button,
  StatusBadge,
  KpiCard,
} from "@/components/ui/Primitives";
import { Plus, Trash2, Edit2, Eye } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchServices, createService, updateService, deleteService, Service, fetchServiceCategories, createServiceCategory, ServiceCategory } from "@/services/api/services";

const statusTone: Record<string, "success" | "warning" | "neutral"> = {
  Active: "success",
  Seasonal: "warning",
  Draft: "neutral",
};

export function ServicesFeature() {
  const queryClient = useQueryClient();
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  const createMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setIsDialogOpen(false);
      setCurrentService({ name: "", category: "Add-On", price: "", status: "Active" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setIsDialogOpen(false);
      setCurrentService({ name: "", category: "Add-On", price: "", status: "Active" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<Service>>({ name: "", category: "Add-On", price: "", status: "Active" });
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const { data: serviceCategories = [] } = useQuery({
    queryKey: ["serviceCategories"],
    queryFn: fetchServiceCategories,
  });

  const createCategoryMutation = useMutation({
    mutationFn: createServiceCategory,
    onSuccess: (newCat) => {
      queryClient.invalidateQueries({ queryKey: ["serviceCategories"] });
      setCurrentService({ ...currentService, category: newCat.id });
      setIsAddingCustomCategory(false);
      toast.success("Category created successfully");
    },
    onError: (err: any) => {
      toast.error("Failed to create category: " + (err.message || err));
    }
  });

  const [customCategoryName, setCustomCategoryName] = useState("");

  const handleSaveService = () => {
    if (!currentService.name || !currentService.price) return;
    
    if (isAddingCustomCategory) {
      if (!customCategoryName) return;
      // create category first
      createCategoryMutation.mutate({ name: customCategoryName });
      return; // wait for onSuccess to trigger service save, or actually we can just create it and then user clicks save again?
      // better yet, we can chain it, but since createCategoryMutation is async, let's just make the user click save again or chain it.
      // let's do an async flow here:
    }
    
    saveFinalService();
  };

  const saveFinalService = () => {
    if (currentService.id) {
      updateMutation.mutate(currentService as Service);
    } else {
      createMutation.mutate(currentService as Service);
    }
  };

  // We can also trigger saveFinalService automatically if we set a flag, but for simplicity, let's just let handleSaveService be async.
  const handleSaveWithAsyncCategory = async () => {
    if (!currentService.name || !currentService.price) return;
    if (isAddingCustomCategory) {
      if (!customCategoryName) return;
      try {
        const newCat = await createServiceCategory({ name: customCategoryName });
        queryClient.invalidateQueries({ queryKey: ["serviceCategories"] });
        setIsAddingCustomCategory(false);
        const updatedService = { ...currentService, category: newCat.id };
        if (updatedService.id) {
          updateMutation.mutate(updatedService as Service);
        } else {
          createMutation.mutate(updatedService as Service);
        }
      } catch (err: any) {
        toast.error("Failed to create category: " + (err.message || err));
      }
    } else {
      if (currentService.id) {
        updateMutation.mutate(currentService as Service);
      } else {
        createMutation.mutate(currentService as Service);
      }
    }
  };

  const handleCreateNew = () => {
    setCurrentService({ name: "", category: "", price: "", status: "Active" });
    setIsAddingCustomCategory(false);
    setCustomCategoryName("");
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (svc: Service) => {
    setCurrentService({ ...svc });
    setIsAddingCustomCategory(false);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleView = (svc: Service) => {
    setCurrentService({ ...svc });
    setIsAddingCustomCategory(false);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (svc: Service) => {
    const newStatus = svc.status === "Active" ? "Draft" : "Active";
    updateMutation.mutate({ ...svc, status: newStatus });
  };

  const handleSubmit = async () => {
    if (!currentService.name || !currentService.name.trim()) {
      toast.error("Service name is required.");
      return;
    }
    if (currentService.price === undefined || currentService.price === "" || Number(currentService.price) < 0) {
      toast.error("Valid price is required.");
      return;
    }

    let targetCategoryId: string | null = (currentService.category as string) || null;

    if (isAddingCustomCategory) {
      const trimmedName = customCategoryName.trim();
      if (!trimmedName) {
        toast.error("Please enter a name for the new category.");
        return;
      }

      const existing = serviceCategories.find(
        (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (existing && existing.id) {
        targetCategoryId = existing.id;
      } else {
        try {
          const newCat = await createServiceCategory({ name: trimmedName });
          queryClient.invalidateQueries({ queryKey: ["serviceCategories"] });
          targetCategoryId = newCat.id || null;
          toast.success(`Category '${trimmedName}' created successfully.`);
        } catch (err: any) {
          toast.error("Failed to create category: " + (err.message || err));
          return;
        }
      }
    }

    const payload = {
      ...currentService,
      category: targetCategoryId || null,
      price: Number(currentService.price),
    } as Service;

    if (payload.id) {
      updateMutation.mutate(payload, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["services"] });
          setIsDialogOpen(false);
          toast.success("Service updated successfully.");
        },
        onError: (err: any) => {
          toast.error("Failed to update service: " + (err.message || err));
        },
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["services"] });
          setIsDialogOpen(false);
          toast.success("Service created successfully.");
        },
        onError: (err: any) => {
          toast.error("Failed to create service: " + (err.message || err));
        },
      });
    }
  };

  const getCategoryDisplayName = (svc: Service) => {
    if (svc.category_name) return svc.category_name;
    if (!svc.category) return "—";
    const found = serviceCategories.find((c) => c.id === svc.category);
    if (found) return found.name;
    return svc.category;
  };

  const activeCount = services.filter(s => s.status === "Active").length;
  const seasonalCount = services.filter(s => s.status === "Seasonal").length;
  const draftCount = services.filter(s => s.status === "Draft").length;

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="Services"
        description="Unified service catalog for add-ons, concierge, and transport offerings."
        actions={
          <Button size="sm" onClick={handleCreateNew}>
            <Plus className="h-3.5 w-3.5" />
            New service
          </Button>
        }
      />

      <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <SheetContent side="right" className="w-[400px] sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle>{currentService.id ? (isViewMode ? 'View Service' : 'Edit Service') : 'Add New Service'}</SheetTitle>
          </SheetHeader>
          <div className="grid gap-5 py-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={currentService.name}
                onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
                disabled={isViewMode}
                placeholder="e.g. Spa Session"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={currentService.price}
                onChange={(e) => setCurrentService({ ...currentService, price: e.target.value })}
                disabled={isViewMode}
                placeholder="e.g. 2500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={isAddingCustomCategory ? "__NEW__" : (currentService.category || "")}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "__NEW__") {
                    setIsAddingCustomCategory(true);
                  } else {
                    setIsAddingCustomCategory(false);
                    setCurrentService({ ...currentService, category: val });
                  }
                }}
                disabled={isViewMode}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Category...</option>
                {serviceCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
                {!isViewMode && (
                  <option value="__NEW__">+ Add New Category...</option>
                )}
              </select>
            </div>
            {isAddingCustomCategory && !isViewMode && (
              <div className="grid gap-2">
                <Label htmlFor="customCategory">New Category Name</Label>
                <Input
                  id="customCategory"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  placeholder="e.g. Travel, Spa, Dining"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={currentService.status}
                onChange={(e) => setCurrentService({ ...currentService, status: e.target.value })}
                disabled={isViewMode}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Active">Active</option>
                <option value="Seasonal">Seasonal</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {isViewMode ? "Close" : "Cancel"}
            </Button>
            {!isViewMode && (
              <Button onClick={handleSubmit}>
                {currentService.id ? "Update Service" : "Save Service"}
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <div className="responsive-page-x py-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Catalog Items" value={services.length.toString()} accent="brand" />
          <KpiCard label="Active" value={activeCount.toString()} accent="success" />
          <KpiCard label="Seasonal" value={seasonalCount.toString()} accent="warning" />
          <KpiCard label="Draft" value={draftCount.toString()} accent="info" />
        </div>

        <Card>
          <CardHeader
            title="Service catalog"
            hint="Cross-domain monetization controls"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-2/50 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                <tr>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                      Loading services...
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                      No services configured. Create one to begin.
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr
                      key={service.id}
                      className="border-b border-border-subtle hover:bg-surface-2/40"
                    >
                      <td className="px-4 py-3 font-medium text-text-primary">{service.name}</td>
                      <td className="px-4 py-3 text-text-secondary">{getCategoryDisplayName(service)}</td>
                      <td className="px-4 py-3 font-mono text-text-secondary">₹{Number(service.price).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={service.status === "Active"}
                            onCheckedChange={() => handleToggleStatus(service)}
                          />
                          <StatusBadge tone={statusTone[service.status] ?? "neutral"}>
                            {service.status}
                          </StatusBadge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2 text-text-secondary">
                          <button type="button" title="View" className="hover:text-primary transition-colors" onClick={() => handleView(service)}>
                            <Eye className="w-4 h-4" />
                          </button>
                          <button type="button" title="Edit" className="hover:text-primary transition-colors" onClick={() => handleEdit(service)}>
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button type="button" title="Delete" className="hover:text-red-500 transition-colors" onClick={() => service.id && handleDelete(service.id)}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ServicesFeature;
