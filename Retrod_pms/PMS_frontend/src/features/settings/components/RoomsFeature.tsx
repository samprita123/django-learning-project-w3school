import { useState, useEffect } from "react";
import { Plus, Eye, Edit3, Image, Check, Star } from "lucide-react";
import {
  PageHeader,
  Card,
  CardHeader,
  KpiCard,
  StatusBadge,
  Button,
} from "@/components/ui/Primitives";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { toast } from "sonner";
import { fetchApi } from "@/services/api/core";

export function RoomsFeature() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [activeViewRoom, setActiveViewRoom] = useState<any>(null);

  // Real data lists
  const [properties, setProperties] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [dbAmenities, setDbAmenities] = useState<any[]>([]);
  const [dbMealPlans, setDbMealPlans] = useState<any[]>([]);
  const [customPrices, setCustomPrices] = useState<any[]>([]);
  const [ratePlans, setRatePlans] = useState<any[]>([]);
  const [ratePlanInventories, setRatePlanInventories] = useState<any[]>([]);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [unitsList, setUnitsList] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Form Fields State
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [inventoryCount, setInventoryCount] = useState(0);
  const [baseRate, setBaseRate] = useState(0);
  const [description, setDescription] = useState("");
  const [roomNumbersText, setRoomNumbersText] = useState("");
  const [maxAdults, setMaxAdults] = useState(2);
  const [maxChildren, setMaxChildren] = useState(0);
  const [extraAdultCharge, setExtraAdultCharge] = useState(0);
  const [extraChildCharge, setExtraChildCharge] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedMealPlans, setSelectedMealPlans] = useState<Record<string, { selected: boolean; price: number }>>({});
  const [status, setStatus] = useState("Selling");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [props, cats, types, ams, meals, cpPrices, rPlans, rpInvs, media, units] = await Promise.all([
        fetchApi<any[]>("/api/properties/"),
        fetchApi<any[]>("/api/inventory/categories/"),
        fetchApi<any[]>("/api/inventory/types/"),
        fetchApi<any[]>("/api/inventory/amenities/"),
        fetchApi<any[]>("/api/rates/meal-plans/"),
        fetchApi<any[]>("/api/rates/tenant-meal-plan-prices/"),
        fetchApi<any[]>("/api/rates/rate-plans/"),
        fetchApi<any[]>("/api/rates/rate-plan-inventories/"),
        fetchApi<any[]>("/api/inventory/media/"),
        fetchApi<any[]>("/api/inventory/units/")
      ]);

      setProperties(props || []);
      setCategories(cats || []);
      setRoomTypes(types || []);
      setDbAmenities(ams || []);
      setDbMealPlans(meals || []);
      setCustomPrices(cpPrices || []);
      setRatePlans(rPlans || []);
      setRatePlanInventories(rpInvs || []);
      setMediaList(media || []);
      setUnitsList(units || []);

      if (props && props.length > 0) setSelectedProperty(props[0].id);
      if (cats && cats.length > 0) setSelectedCategory(cats[0].id);
    } catch (error) {
      console.error("Failed to load room type data:", error);
      toast.error("Failed to load settings from database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getId = (val: any): string => {
    if (!val) return "";
    if (typeof val === "object") return String(val.id || "");
    return String(val);
  };

  const getBaseRateForRoomType = (roomTypeId: string, propertyId: string) => {
    const targetRoomTypeId = getId(roomTypeId);
    const targetPropId = getId(propertyId);

    const propertyPlans = ratePlans.filter(rp => getId(rp.property) === targetPropId);
    const barPlan = propertyPlans.find(rp => rp.code === "BAR" || rp.category === "bar") || propertyPlans[0];

    if (barPlan) {
      const barPlanId = getId(barPlan.id);
      const rpi = ratePlanInventories.find(
        item => getId(item.inventory_unit_type) === targetRoomTypeId && getId(item.rate_plan) === barPlanId
      );
      if (rpi && rpi.base_rate !== undefined && rpi.base_rate !== null) {
        return parseFloat(String(rpi.base_rate)) || 0;
      }
    }

    // Fallback search across any rate plan for this room type
    const fallbackRpi = ratePlanInventories.find(
      item => getId(item.inventory_unit_type) === targetRoomTypeId
    );
    if (fallbackRpi && fallbackRpi.base_rate !== undefined && fallbackRpi.base_rate !== null) {
      return parseFloat(String(fallbackRpi.base_rate)) || 0;
    }

    return 0;
  };

  const handleAdd = () => {
    setEditingType(null);
    setName("");
    setCode("");
    setInventoryCount(0);
    setBaseRate(0);
    setDescription("");
    setRoomNumbersText("");
    setMaxAdults(2);
    setMaxChildren(0);
    setExtraAdultCharge(0);
    setExtraChildCharge(0);
    setSelectedAmenities([]);
    setSelectedFile(null);

    // Initialize meal plan states
    const initialMeals: Record<string, { selected: boolean; price: number }> = {};
    dbMealPlans.forEach(plan => {
      initialMeals[plan.id] = { selected: false, price: parseFloat(plan.price_adjustment) || 0 };
    });
    setSelectedMealPlans(initialMeals);

    setStatus("Selling");
    setIsEditorOpen(true);
  };

  const handleEdit = async (type: any) => {
    setEditingType(type);
    setSelectedProperty(getId(type.property) || "");
    setSelectedCategory(getId(type.category) || "");
    setName(type.name || "");
    setCode(type.code || "");
    setInventoryCount(type.rooms_count || 0);

    // Find base rate from rate plan inventory
    const rateVal = getBaseRateForRoomType(type.id, type.property);
    setBaseRate(rateVal);

    setDescription(type.description || "");

    // Load overrides
    const initialMeals: Record<string, { selected: boolean; price: number }> = {};
    dbMealPlans.forEach(plan => {
      const custom = customPrices.find(cp => cp.meal_plan === plan.id && cp.inventory_unit_type === type.id);
      initialMeals[plan.id] = {
        selected: !!custom,
        price: custom ? parseFloat(custom.price) : (parseFloat(plan.price_adjustment) || 0)
      };
    });
    setSelectedMealPlans(initialMeals);

    setMaxAdults(type.max_adults || 2);
    setMaxChildren(type.max_children || 0);
    setExtraAdultCharge(type.extra_adult_charge || 0);
    setExtraChildCharge(type.extra_child_charge || 0);

    // Set amenities
    setSelectedAmenities(type.amenities || []);
    
    // Load physical rooms
    const currentUnits = unitsList.filter(u => u.inventory_unit_type === type.id);
    setRoomNumbersText(currentUnits.map(u => u.name).join(", "));
    setSelectedFile(null);

    setStatus(type.is_sellable !== false ? "Selling" : "Inactive");
    setIsEditorOpen(true);
  };

  const toggleActive = async (type: any) => {
    const nextState = !type.is_sellable;
    setTogglingId(type.id);

    // Optimistic Update
    setRoomTypes(prev => prev.map(t => t.id === type.id ? { ...t, is_sellable: nextState } : t));

    try {
      await fetchApi(`/api/inventory/types/${type.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_sellable: nextState })
      });
      toast.success(`Room type status changed successfully.`);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle status.");
      // Rollback
      setRoomTypes(prev => prev.map(t => t.id === type.id ? { ...t, is_sellable: !nextState } : t));
    } finally {
      setTogglingId(null);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a room type name.");
      return;
    }

    try {
      const payload = {
        property: selectedProperty,
        category: selectedCategory,
        name: name,
        code: code || name.toUpperCase().replace(/\s+/g, "_"),
        max_adults: maxAdults,
        max_children: maxChildren,
        is_sellable: status === "Selling",
        base_occupancy: maxAdults,
        max_occupancy: maxAdults + maxChildren,
        amenities: selectedAmenities
      };

      let savedType: any;
      if (editingType) {
        savedType = await fetchApi<any>(`/api/inventory/types/${editingType.id}/`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        savedType = await fetchApi<any>("/api/inventory/types/", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      if (savedType && savedType.id) {
        
        // Real File Upload
        if (selectedFile) {
          const formData = new FormData();
          formData.append("file", selectedFile);
          formData.append("inventory_unit_type", savedType.id);

          await fetchApi("/api/inventory/media/upload/", {
            method: "POST",
            body: formData,
          });
        }

        // Save physical rooms (basic reconciliation: if a name isn't there, create it)
        let roomNumbers = roomNumbersText.split(",").map(r => r.trim()).filter(Boolean);
        const existingUnits = unitsList.filter(u => u.inventory_unit_type === savedType.id);
        
        const numProvided = existingUnits.length + roomNumbers.length;
        if (inventoryCount > numProvided) {
           for(let i = 1; i <= (inventoryCount - numProvided); i++) {
              roomNumbers.push(`Room ${existingUnits.length + roomNumbers.length + 1}`);
           }
        }

        const toCreate = roomNumbers.filter(rn => !existingUnits.some(eu => eu.name === rn));
        
        for (const rn of toCreate) {
          await fetchApi("/api/inventory/units/", {
            method: "POST",
            body: JSON.stringify({
              property: selectedProperty,
              inventory_unit_type: savedType.id,
              name: rn,
              operational_status: "operational",
              housekeeping_status: "clean"
            })
          });
        }

        // Find or create BAR RatePlan link
        const targetPropId = getId(selectedProperty);
        const targetTypeId = getId(savedType.id);
        const propertyPlans = ratePlans.filter(rp => getId(rp.property) === targetPropId);
        let barPlan = propertyPlans.find(rp => rp.code === "BAR" || rp.category === "bar") || propertyPlans[0];

        if (!barPlan) {
          try {
            barPlan = await fetchApi<any>("/api/rates/rate-plans/", {
              method: "POST",
              body: JSON.stringify({
                property: targetPropId,
                code: "BAR",
                name: "Best Available Rate",
                category: "bar",
                type: "public",
                pricing_mode: "independent",
                is_active: true
              })
            });
            if (barPlan) {
              setRatePlans(prev => [...prev, barPlan]);
            }
          } catch (e) {
            console.error("Auto-creating BAR rate plan failed:", e);
          }
        }

        if (barPlan) {
          const barPlanId = getId(barPlan.id);
          const existingRpi = ratePlanInventories.find(
            item => getId(item.inventory_unit_type) === targetTypeId && getId(item.rate_plan) === barPlanId
          );

          const rpiPayload = {
            rate_plan: barPlanId,
            inventory_unit_type: targetTypeId,
            base_rate: Number(baseRate) || 0
          };

          if (existingRpi) {
            const updatedRpi = await fetchApi<any>(`/api/rates/rate-plan-inventories/${existingRpi.id}/`, {
              method: "PUT",
              body: JSON.stringify(rpiPayload)
            });
            setRatePlanInventories(prev => prev.map(r => getId(r.id) === getId(existingRpi.id) ? updatedRpi : r));
          } else {
            const newRpi = await fetchApi<any>("/api/rates/rate-plan-inventories/", {
              method: "POST",
              body: JSON.stringify(rpiPayload)
            });
            setRatePlanInventories(prev => [...prev, newRpi]);
          }
        }

        // Save/Delete custom meal plan prices
        const pricePromises = Object.entries(selectedMealPlans)
          .map(async ([mealPlanId, data]) => {
            const existing = customPrices.find(cp => cp.meal_plan === mealPlanId && cp.inventory_unit_type === savedType.id);
            const overridePayload = {
              meal_plan: mealPlanId,
              inventory_unit_type: savedType.id,
              price: data.price
            };

            if (data.selected) {
              if (existing) {
                return fetchApi(`/api/rates/tenant-meal-plan-prices/${existing.id}/`, {
                  method: "PUT",
                  body: JSON.stringify(overridePayload)
                });
              } else {
                return fetchApi("/api/rates/tenant-meal-plan-prices/", {
                  method: "POST",
                  body: JSON.stringify(overridePayload)
                });
              }
            } else {
              if (existing) {
                return fetchApi(`/api/rates/tenant-meal-plan-prices/${existing.id}/`, {
                  method: "DELETE"
                });
              }
            }
          });

        await Promise.all(pricePromises.filter(Boolean));
      }

      toast.success(editingType ? "Room type updated successfully" : "Room type created successfully");
      setIsEditorOpen(false);
      loadData();
    } catch (error: any) {
      console.error(error);
      let msg = error?.message || "Failed to save room type configuration.";
      if (msg.includes("unique set") || msg.includes("already exists")) {
        msg = `Room type code '${typeCode || code}' already exists for this property. Please use a unique room type code.`;
      }
      toast.error(msg);
    }
  };

  const handleAmenityChange = (amenityCode: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityCode) ? prev.filter(c => c !== amenityCode) : [...prev, amenityCode]
    );
  };

  const handleMealPlanToggle = (planId: string) => {
    setSelectedMealPlans(prev => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        selected: !prev[planId]?.selected
      }
    }));
  };

  const handleMealPlanPriceChange = (planId: string, price: number) => {
    setSelectedMealPlans(prev => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        price: price
      }
    }));
  };

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Rooms & Inventory"
        description="Room type configuration, base rates, and live availability."
        actions={
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-3.5 w-3.5" />
            Add room type
          </Button>
        }
      />
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <KpiCard label="Total Rooms Types" value={String(roomTypes.length)} accent="info" />
          <KpiCard label="Hotels Linked" value={String(properties.length)} accent="brand" />
          <KpiCard label="Active Meal Plans" value={String(dbMealPlans.length)} accent="success" />
          <KpiCard label="Amenities Available" value={String(dbAmenities.length)} accent="warning" />
        </div>

        <Card>
          <CardHeader title="Room types" />
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-surface-2/40 text-left">
                {["Type Name", "Hotel", "Base Rate", "Limits", "Status", ""].map((h) => (
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                    Loading room types configurations...
                  </td>
                </tr>
              ) : roomTypes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                    No room types configured. Add one to begin.
                  </td>
                </tr>
              ) : (
                roomTypes.map((t) => {
                  const prop = properties.find(p => p.id === t.property);
                  const isSelling = t.is_sellable !== false;
                  const rateVal = getBaseRateForRoomType(t.id, t.property);
                  return (
                    <tr key={t.id} className="border-b border-border-subtle hover:bg-surface-2/50">
                      <td className="px-4 py-3 font-medium text-text-primary">{t.name}</td>
                      <td className="px-4 py-3 text-text-secondary">{prop ? prop.name : "-"}</td>
                      <td className="px-4 py-3 font-mono text-text-primary font-medium"><span className="font-sans">₹</span>{rateVal.toLocaleString()}</td>
                      <td className="px-4 py-3 text-text-secondary">{t.max_adults} Adults, {t.max_children} Children</td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={isSelling ? "success" : "warning"}>
                          {isSelling ? "Selling" : "Inactive"}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {/* Toggle Button */}
                          <button
                            onClick={() => toggleActive(t)}
                            disabled={togglingId === t.id}
                            title={isSelling ? "Deactivate room type" : "Activate room type"}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${isSelling ? "bg-success" : "bg-surface-2"
                              }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${isSelling ? "translate-x-4" : "translate-x-0"
                                }`}
                            />
                          </button>

                          {/* View Button */}
                          <button
                            onClick={() => setActiveViewRoom(t)}
                            className="inline-block p-1.5 rounded hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleEdit(t)}
                            className="inline-block p-1.5 rounded hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                            title="Edit Room Type"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {/* VIEW ROOM TYPE SHEET */}
      <Sheet open={!!activeViewRoom} onOpenChange={(open) => { if (!open) setActiveViewRoom(null); }}>
        <SheetContent side="right" className="sm:max-w-md p-0 overflow-y-auto bg-surface border-l border-border text-text-primary">
          {activeViewRoom && (() => {
            const prop = properties.find(p => p.id === activeViewRoom.property);
            const cat = categories.find(c => c.id === activeViewRoom.category);
            const isSelling = activeViewRoom.is_sellable !== false;
            const rateVal = getBaseRateForRoomType(activeViewRoom.id, activeViewRoom.property);

            // Check for uploaded images
            const images = mediaList.filter(
              m => m.inventory_unit_type === activeViewRoom.id && m.media_type === "image"
            );

            const activeUnits = unitsList.filter(u => u.inventory_unit_type === activeViewRoom.id);

            return (
              <div className="flex flex-col h-full overflow-y-auto">
                {/* Header Image Background Slider */}
                <div className="relative shrink-0 h-72 bg-surface-2 flex items-center justify-center border-b border-border overflow-hidden">
                  {images.length > 0 ? (
                    <img
                      src={images[0].media_url}
                      alt={activeViewRoom.name}
                      className="w-full h-full object-contain bg-black/5"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-text-secondary">
                      <Image className="h-8 w-8" />
                      <span className="text-xs font-medium">No photos uploaded for this room type</span>
                    </div>
                  )}

                  {/* Active / Inactive Status pill */}
                  <div className="absolute top-4 right-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase shadow-sm ${isSelling ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                      {isSelling ? "Selling" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex flex-col gap-6 shrink-0">
                  <div>
                    <h2 className="text-lg font-bold text-text-primary leading-snug">{activeViewRoom.name}</h2>
                    <p className="text-[12px] text-text-secondary font-mono mt-0.5">CODE: {activeViewRoom.code}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-surface-2/40 rounded-lg p-3 border border-border text-[13px]">
                    <div>
                      <span className="text-[10px] text-text-secondary uppercase font-medium block">Hotel</span>
                      <span className="font-semibold text-text-primary">{prop ? prop.name : "-"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-secondary uppercase font-medium block">Category</span>
                      <span className="font-semibold text-text-primary">{cat ? cat.name : "-"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-secondary uppercase font-medium block">Base Rate</span>
                      <span className="font-semibold text-text-primary font-mono"><span className="font-sans">₹</span>{rateVal.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-secondary uppercase font-medium block">Occupancy</span>
                      <span className="font-semibold text-text-primary">{activeViewRoom.max_adults} Adults, {activeViewRoom.max_children} Children</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-secondary uppercase font-medium block">Extra Adult</span>
                      <span className="font-semibold text-text-primary font-mono"><span className="font-sans">₹</span>{activeViewRoom.extra_adult_charge || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-secondary uppercase font-medium block">Extra Child</span>
                      <span className="font-semibold text-text-primary font-mono"><span className="font-sans">₹</span>{activeViewRoom.extra_child_charge || 0}</span>
                    </div>
                  </div>

                  {/* Physical Rooms Details */}
                  <div>
                    <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Physical Rooms ({activeUnits.length})</h4>
                    {activeUnits.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {activeUnits.map(unit => (
                          <span key={unit.id} className="inline-flex items-center justify-center px-2 py-1 bg-surface-2 border border-border rounded text-xs font-semibold text-text-primary">
                            {unit.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-text-secondary">No physical rooms assigned.</p>
                    )}
                  </div>

                  {activeViewRoom.description && (
                    <div>
                      <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Description</h4>
                      <p className="text-sm text-text-primary leading-relaxed bg-surface-2/30 p-2.5 rounded border border-border/50">
                        {activeViewRoom.description}
                      </p>
                    </div>
                  )}

                  {/* Amenities */}
                  <div>
                    <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Amenities</h4>
                    {activeViewRoom.amenities && activeViewRoom.amenities.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {activeViewRoom.amenities.map((aCode: string) => {
                          const matchingAm = dbAmenities.find(am => am.code === aCode);
                          return (
                            <span key={aCode} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/5 border border-primary/20 text-primary rounded-full text-xs font-medium">
                              <Check className="h-3 w-3" />
                              {matchingAm ? matchingAm.name : aCode}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-text-secondary">No amenities configured for this room type.</p>
                    )}
                  </div>

                  {/* Meal Plan Price Overrides */}
                  <div>
                    <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Meal Plans Overrides</h4>
                    <div className="space-y-2">
                      {dbMealPlans.filter(plan => {
                        return customPrices.some(cp => cp.meal_plan === plan.id && cp.inventory_unit_type === activeViewRoom.id);
                      }).map(plan => {
                        const custom = customPrices.find(cp => cp.meal_plan === plan.id && cp.inventory_unit_type === activeViewRoom.id);
                        return (
                          <div key={plan.id} className="flex items-center justify-between text-[13px] bg-surface-2/30 p-2.5 rounded border border-border">
                            <div>
                              <span className="font-semibold text-text-primary block">{plan.name} ({plan.code})</span>
                              <span className="text-[10px] text-text-secondary">System Price: <span className="font-sans">₹</span>{parseFloat(plan.price_adjustment).toFixed(2)}</span>
                            </div>
                            <span className="font-semibold text-primary font-mono">
                              <span className="font-sans">₹</span>{custom ? parseFloat(custom.price).toFixed(2) : parseFloat(plan.price_adjustment).toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                      {dbMealPlans.filter(plan => {
                        return customPrices.some(cp => cp.meal_plan === plan.id && cp.inventory_unit_type === activeViewRoom.id);
                      }).length === 0 && (
                          <p className="text-xs text-text-secondary">No custom meal plans selected for this room type.</p>
                        )}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-border mt-auto flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setActiveViewRoom(null)}>Close View</Button>
                </div>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* ADD/EDIT ROOM TYPE SHEET */}
      <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <SheetContent side="right" className="sm:max-w-md overflow-y-auto bg-surface text-text-primary border-l border-border">
          <SheetHeader>
            <SheetTitle>{editingType ? "Configure Room Type" : "Add Room Type"}</SheetTitle>
          </SheetHeader>
          <div className="py-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary border-b border-border-subtle pb-1">General Info</h3>

              <div>
                <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Property / Hotel</label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Room Type Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary"
                  placeholder="e.g. Deluxe Suite"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Room Type Code (Unique)</label>
                <input
                  type="text"
                  value={code}
                  disabled={!!editingType}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary font-mono uppercase"
                  placeholder="e.g. DELUXE_SUITE"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Inventory Count</label>
                  <input
                    type="number"
                    value={inventoryCount}
                    onChange={(e) => setInventoryCount(parseInt(e.target.value) || 0)}
                    className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Base Rate (₹)</label>
                  <input
                    type="number"
                    value={baseRate}
                    onChange={(e) => setBaseRate(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary h-20"
                  placeholder="Room amenities and features..."
                />
              </div>

              <div>
                <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Room Images</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[11px] file:bg-primary/10 file:text-primary file:font-medium" 
                />
                <p className="text-[10px] text-text-secondary mt-1">Select multiple images to upload to the gallery.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-1">
                <h3 className="text-sm font-semibold text-text-primary">Physical Rooms</h3>
                <span className="text-[11px] font-medium px-2 py-0.5 bg-surface-2 rounded text-text-secondary">
                  {inventoryCount} Rooms
                </span>
              </div>
              <div>
                <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Assign Room Numbers</label>
                <textarea
                  value={roomNumbersText}
                  onChange={(e) => setRoomNumbersText(e.target.value)}
                  className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary h-20"
                  placeholder="Enter comma-separated room numbers (e.g., 101, 102, 103, 104...)"
                />
                <p className="text-[10px] text-text-secondary mt-1">
                  Enter the specific room numbers that belong to this room type. Separate multiple rooms with commas.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary border-b border-border-subtle pb-1">Occupancy Limits</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Max Adults</label>
                  <input
                    type="number"
                    value={maxAdults}
                    onChange={(e) => setMaxAdults(parseInt(e.target.value) || 0)}
                    className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Max Children</label>
                  <input
                    type="number"
                    value={maxChildren}
                    onChange={(e) => setMaxChildren(parseInt(e.target.value) || 0)}
                    className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Extra Adult (₹)</label>
                  <input
                    type="number"
                    value={extraAdultCharge}
                    onChange={(e) => setExtraAdultCharge(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Extra Child (₹)</label>
                  <input
                    type="number"
                    value={extraChildCharge}
                    onChange={(e) => setExtraChildCharge(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary border-b border-border-subtle pb-1">Amenities</h3>
              <div className="grid grid-cols-2 gap-3">
                {(() => {
                  const selectedPropObj = properties.find(p => p.id === selectedProperty);
                  const hotelAmenities = selectedPropObj?.amenities || [];
                  const filteredAmenities = (hotelAmenities && hotelAmenities.length > 0)
                    ? dbAmenities.filter(amenity => hotelAmenities.includes(amenity.code) || hotelAmenities.includes(amenity.id))
                    : dbAmenities;

                  if (filteredAmenities.length === 0) {
                    return <p className="text-xs text-text-secondary col-span-2">No amenities available in the system.</p>;
                  }

                  return filteredAmenities.map(amenity => (
                    <div key={amenity.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`amenity-${amenity.id}`}
                        checked={selectedAmenities.includes(amenity.code)}
                        onChange={() => handleAmenityChange(amenity.code)}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                      />
                      <label htmlFor={`amenity-${amenity.id}`} className="text-[12px] text-text-primary cursor-pointer select-none">{amenity.name}</label>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary border-b border-border-subtle pb-1">Meal Plans</h3>
              <div className="space-y-3">
                {dbMealPlans.map(plan => (
                  <div key={plan.id} className="flex items-center gap-3 bg-surface-2/30 p-2.5 rounded border border-border-subtle">
                    <input
                      type="checkbox"
                      id={`meal-${plan.id}`}
                      checked={!!selectedMealPlans[plan.id]?.selected}
                      onChange={() => handleMealPlanToggle(plan.id)}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                    />
                    <label htmlFor={`meal-${plan.id}`} className="text-[13px] font-medium text-text-primary flex-1 cursor-pointer select-none">
                      {plan.name} ({plan.code})
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-text-secondary">₹</span>
                      <input
                        type="number"
                        value={selectedMealPlans[plan.id]?.price ?? 0}
                        onChange={(e) => handleMealPlanPriceChange(plan.id, parseFloat(e.target.value) || 0)}
                        className="w-20 rounded border border-border-subtle bg-surface px-2 py-1 text-[12px] outline-none focus:border-primary text-right font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary border-b border-border-subtle pb-1">Settings</h3>
              <div>
                <label className="text-[11px] uppercase text-text-secondary font-medium mb-1 block">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary"
                >
                  <option value="Selling">Active / Selling</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default RoomsFeature;
