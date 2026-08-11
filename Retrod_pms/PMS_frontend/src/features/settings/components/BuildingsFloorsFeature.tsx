import { useState, useEffect, useMemo, useRef } from "react";
import {
  Building as BuildingIcon,
  Layers,
  Plus,
  Edit3,
  Trash2,
  Box,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RotateCw,
  Grid,
  Zap,
  Radio,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import {
  PageHeader,
  Card,
  CardHeader,
  KpiCard,
  Button,
} from "@/components/ui/Primitives";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { fetchApi } from "@/services/api/core";
import {
  buildingsFloorsApi,
  Building,
  Floor,
} from "@/services/api/buildings-floors";

export function BuildingsFloorsFeature() {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [unitTypes, setUnitTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active selections
  const [activeBuildingId, setActiveBuildingId] = useState<string | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<"3d" | "2d">("2d");
  const [is3dTilted, setIs3dTilted] = useState(false);

  // Real-time Mouse Cursor Tilt State
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Right-side Sheets / Modals State
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [buildingForm, setBuildingForm] = useState({ property: "", code: "", name: "", description: "" });

  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [floorForm, setFloorForm] = useState({ floor_number: 1, name: "" });

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignRoomTarget, setAssignRoomTarget] = useState<any | null>(null);

  const loadData = async (targetPropId?: string) => {
    setIsLoading(true);
    const pId = targetPropId || selectedPropertyId || localStorage.getItem("retrod:active-property-id") || undefined;
    try {
      const [bList, fList, rList, tList] = await Promise.all([
        buildingsFloorsApi.getBuildings(pId).catch(() => []),
        buildingsFloorsApi.getFloors().catch(() => []),
        fetchApi<any>(pId ? `/api/inventory/units/?property=${pId}&limit=1000` : "/api/inventory/units/?limit=1000").then((res) => res.results || res || []).catch(() => []),
        fetchApi<any>(pId ? `/api/inventory/types/?property=${pId}` : "/api/inventory/types/").then((res) => res.results || res || []).catch(() => []),
      ]);

      let currentBuildings = bList;
      // Seed default building if none exist yet for this property
      if (currentBuildings.length === 0 && pId) {
        try {
          const defaultB = await buildingsFloorsApi.createBuilding({
            property: pId,
            code: "MAIN",
            name: "Main Tower",
            description: "Primary hotel structure & luxury suites",
          });
          currentBuildings = [defaultB];
          // Seed default floors for main building
          const f1 = await buildingsFloorsApi.createFloor({ building: defaultB.id, floor_number: 1, name: "1st Floor" });
          const f2 = await buildingsFloorsApi.createFloor({ building: defaultB.id, floor_number: 2, name: "2nd Floor" });
          fList.push(f1, f2);
        } catch (e) {
          console.warn("Could not auto-seed default building:", e);
        }
      }

      setBuildings(currentBuildings);
      setFloors(fList);
      setRooms(rList);
      setUnitTypes(tList);

      if (currentBuildings.length > 0) {
        if (!activeBuildingId || !currentBuildings.some((b: Building) => b.id === activeBuildingId)) {
          setActiveBuildingId(currentBuildings[0].id);
        }
      } else {
        setActiveBuildingId(null);
      }
    } catch (e) {
      console.error("Failed to load building & floor data:", e);
      toast.error("Failed to load building & floor records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetchApi<any>("/api/properties/");
        const list = Array.isArray(res) ? res : res.results || [];
        setProperties(list);
        const activePId = localStorage.getItem("retrod:active-property-id") || list[0]?.id || "";
        if (activePId) {
          setSelectedPropertyId(activePId);
          loadData(activePId);
        } else {
          loadData();
        }
      } catch (e) {
        loadData();
      }
    };
    init();
  }, []);

  // Mouse Cursor Tilt Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!is3dTilted || viewMode !== "3d" || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -20 + 20;
    const rotateY = ((x - centerX) / centerX) * 25 - 10;

    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const activeBuilding = useMemo(() => {
    return buildings.find((b) => b.id === activeBuildingId) || buildings[0] || null;
  }, [buildings, activeBuildingId]);

  const buildingFloors = useMemo(() => {
    if (!activeBuilding) return [];
    return floors
      .filter((f) => f.building === activeBuilding.id)
      .sort((a, b) => b.floor_number - a.floor_number);
  }, [floors, activeBuilding]);

  const roomsByFloor = useMemo(() => {
    const map: Record<string, any[]> = {};
    buildingFloors.forEach((f) => {
      map[f.id] = rooms.filter(
        (r) =>
          (activeBuilding ? r.property === activeBuilding.property : true) &&
          (r.floor_id === f.id ||
            (String(r.building) === activeBuilding?.id && String(r.floor) === String(f.floor_number)))
      );
    });
    return map;
  }, [rooms, buildingFloors, activeBuilding]);

  const unassignedRooms = useMemo(() => {
    return rooms.filter((r) => {
      // 1. Must belong to the currently selected property
      const currentPropId = activeBuilding?.property || selectedPropertyId;
      if (currentPropId && r.property !== currentPropId) {
        return false;
      }

      // 2. A room needs floor assignment if its floor_id is null/empty
      const hasFloorAssigned = Boolean(r.floor_id);
      if (hasFloorAssigned) return false;

      // 3. Must be a standard guest room (sellable and non-event/banquet space)
      const unitType = unitTypes.find((t) => t.id === r.inventory_unit_type);
      if (!unitType) return true;

      const categoryCode = String(unitType.category_code || unitType.category?.code || "").toLowerCase();
      const typeName = String(unitType.name || "").toLowerCase();
      const roomName = String(r.name || "").toLowerCase();

      const isNonStandardSpace =
        categoryCode.includes("banquet") ||
        categoryCode.includes("meeting") ||
        categoryCode.includes("hall") ||
        categoryCode.includes("event") ||
        categoryCode.includes("facility") ||
        typeName.includes("banquet") ||
        typeName.includes("meeting") ||
        typeName.includes("hall") ||
        typeName.includes("conference") ||
        typeName.includes("facility") ||
        roomName.includes("banquet") ||
        roomName.includes("hall");

      return !isNonStandardSpace && unitType.is_sellable !== false;
    });
  }, [rooms, unitTypes, activeBuilding, selectedPropertyId]);

  // Handlers for Building CRUD
  const handleOpenBuildingModal = (b?: Building) => {
    if (b) {
      setEditingBuilding(b);
      setBuildingForm({
        property: b.property || selectedPropertyId,
        code: b.code,
        name: b.name,
        description: b.description || "",
      });
    } else {
      setEditingBuilding(null);
      setBuildingForm({
        property: selectedPropertyId,
        code: `B${buildings.length + 1}`,
        name: `Wing ${buildings.length + 1}`,
        description: "",
      });
    }
    setIsBuildingModalOpen(true);
  };

  const handleSaveBuilding = async () => {
    if (!buildingForm.name.trim() || !buildingForm.code.trim()) {
      toast.error("Please provide both name and code for the building.");
      return;
    }
    const payload = {
      ...buildingForm,
      property: buildingForm.property || selectedPropertyId,
    };
    try {
      if (editingBuilding) {
        await buildingsFloorsApi.updateBuilding(editingBuilding.id, payload);
        toast.success("Building updated successfully!");
      } else {
        const newB = await buildingsFloorsApi.createBuilding(payload);
        toast.success("New Building added!");
        setActiveBuildingId(newB.id);
      }
      setIsBuildingModalOpen(false);
      loadData(selectedPropertyId);
    } catch (e: any) {
      toast.error(e.message || "Failed to save building.");
    }
  };

  const handleDeleteBuilding = async (id: string) => {
    if (!confirm("Are you sure you want to delete this building? Floors and room mappings will be unlinked.")) return;
    try {
      await buildingsFloorsApi.deleteBuilding(id);
      toast.success("Building deleted.");
      setActiveBuildingId(buildings.find((b) => b.id !== id)?.id || null);
      loadData(selectedPropertyId);
    } catch (e: any) {
      toast.error("Failed to delete building.");
    }
  };

  // Handlers for Floor CRUD
  const handleOpenFloorModal = (f?: Floor) => {
    if (!activeBuilding) {
      toast.error("Please select or create a building first.");
      return;
    }
    if (f) {
      setEditingFloor(f);
      setFloorForm({ floor_number: f.floor_number, name: f.name });
    } else {
      setEditingFloor(null);
      const nextNum = buildingFloors.length > 0 ? Math.max(...buildingFloors.map((fl) => fl.floor_number)) + 1 : 1;
      setFloorForm({ floor_number: nextNum, name: `${nextNum}${getOrdinalSuffix(nextNum)} Floor` });
    }
    setIsFloorModalOpen(true);
  };

  const handleSaveFloor = async () => {
    if (!activeBuilding) return;
    if (!floorForm.name.trim()) {
      toast.error("Floor name is required.");
      return;
    }
    try {
      if (editingFloor) {
        await buildingsFloorsApi.updateFloor(editingFloor.id, {
          name: floorForm.name,
          floor_number: Number(floorForm.floor_number),
        });
        toast.success("Floor updated!");
      } else {
        await buildingsFloorsApi.createFloor({
          building: activeBuilding.id,
          floor_number: Number(floorForm.floor_number),
          name: floorForm.name,
        });
        toast.success("Floor created!");
      }
      setIsFloorModalOpen(false);
      loadData(selectedPropertyId);
    } catch (e: any) {
      toast.error(e.message || "Failed to save floor.");
    }
  };

  const handleDeleteFloor = async (id: string) => {
    if (!confirm("Are you sure you want to remove this floor?")) return;
    try {
      await buildingsFloorsApi.deleteFloor(id);
      toast.success("Floor removed.");
      loadData(selectedPropertyId);
    } catch (e: any) {
      toast.error("Failed to delete floor.");
    }
  };

  // Room placement handler
  const handleAssignRoom = async (roomId: string, bId: string | null, fId: string | null, fName?: string) => {
    try {
      const targetPropId = activeBuilding?.property || selectedPropertyId;
      await buildingsFloorsApi.assignRoomToBuildingFloor(roomId, bId, fId, fName, targetPropId);
      toast.success("Room placement updated!");
      setIsAssignModalOpen(false);
      setAssignRoomTarget(null);
      loadData(selectedPropertyId);
    } catch (e: any) {
      toast.error("Failed to update room placement.");
    }
  };

  const propertyFloors = useMemo(() => {
    const buildingIds = new Set(buildings.map((b) => b.id));
    return floors.filter((f) => buildingIds.has(f.building));
  }, [floors, buildings]);

  const propertyRooms = useMemo(() => {
    const currentPropId = activeBuilding?.property || selectedPropertyId;
    return rooms.filter((r) => (currentPropId ? r.property === currentPropId : true));
  }, [rooms, activeBuilding, selectedPropertyId]);

  const totalRoomsMapped = useMemo(() => {
    return propertyRooms.filter((r) => r.floor_id).length;
  }, [propertyRooms]);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        eyebrow="Administration"
        title="Building & Floor Management"
        description="Configure multi-property structures, architectural floor levels, and interactive 2D room layouts."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {properties.length > 0 && (
              <div className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg border border-border shadow-xs">
                <BuildingIcon className="w-4 h-4 text-brand" />
                <span className="text-xs font-semibold text-text-secondary">Property:</span>
                <select
                  className="bg-transparent text-xs font-bold text-text-primary focus:outline-none cursor-pointer"
                  value={selectedPropertyId}
                  onChange={(e) => {
                    const pId = e.target.value;
                    setSelectedPropertyId(pId);
                    localStorage.setItem("retrod:active-property-id", pId);
                    setActiveBuildingId(null);
                    loadData(pId);
                  }}
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.code ? ` (${p.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <Button size="sm" onClick={() => handleOpenBuildingModal()} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90 font-semibold">
              <Plus className="w-4 h-4" /> Add Building
            </Button>
          </div>
        }
      />

      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Buildings"
          title="Total Buildings"
          value={String(buildings.length)}
          subtitle="Property structures"
          accent="brand"
          icon={<BuildingIcon className="w-5 h-5 text-brand" />}
        />
        <KpiCard
          label="Architectural Floors"
          title="Architectural Floors"
          value={String(propertyFloors.length)}
          subtitle="Levels across buildings"
          accent="info"
          icon={<Layers className="w-5 h-5 text-blue-500" />}
        />
        <KpiCard
          label="Mapped Rooms"
          title="Mapped Rooms"
          value={`${totalRoomsMapped} / ${propertyRooms.length}`}
          subtitle="Assigned to floors"
          accent="success"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />
        <KpiCard
          label="Unassigned Rooms"
          title="Unassigned Rooms"
          value={String(unassignedRooms.length)}
          subtitle="Awaiting floor placement"
          accent="warning"
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
        />
      </div>

      {/* Buildings Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {buildings.map((b) => {
            const isActive = b.id === activeBuildingId;
            return (
              <button
                key={b.id}
                onClick={() => setActiveBuildingId(b.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand text-brand-foreground shadow-md shadow-brand/20 font-semibold"
                    : "bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border"
                }`}
              >
                <BuildingIcon className="w-4 h-4" />
                <span>{b.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isActive ? "bg-white/20 text-white" : "bg-surface-hover text-text-tertiary"}`}>
                  {b.code}
                </span>
              </button>
            );
          })}
        </div>

        {activeBuilding && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleOpenBuildingModal(activeBuilding)} className="h-8 text-xs text-text-secondary hover:text-text-primary">
              <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Building
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDeleteBuilding(activeBuilding.id)} className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleOpenFloorModal()} className="h-8 text-xs text-brand font-medium">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Floor
            </Button>
          </div>
        )}
      </div>

      {/* Main 3D Wireframe / 2D Building Floor Visual Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left Visualizer Canvas (Pure, Simple, Perfectly Aligned 2D Architectural Diagram) */}
        <Card className="relative overflow-hidden p-6 min-h-[620px] flex flex-col justify-between bg-surface border border-border shadow-sm rounded-2xl">
          {/* Controls Bar */}
          <div className="flex items-center justify-between bg-surface-hover/60 p-3 rounded-xl border border-border shadow-xs mb-4">
            <div className="flex items-center gap-3">
              <BuildingIcon className="w-4 h-4 text-brand" />
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider font-mono">
                {activeBuilding?.name || "Building Architecture"}
              </span>
              <span className="text-xs text-text-tertiary font-mono">({buildingFloors.length} Floors)</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "2d" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("2d")}
                className="h-7 text-[11px] px-2.5 gap-1.5"
              >
                <Grid className="w-3.5 h-3.5" /> Architectural Diagram View
              </Button>
            </div>
          </div>

          {/* Architectural Building Structure Visualizer */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-text-secondary text-sm font-mono">
              Loading building structure...
            </div>
          ) : buildingFloors.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <Layers className="w-12 h-12 text-text-tertiary mb-3 stroke-[1.5]" />
              <h3 className="text-base font-semibold text-text-primary">No Floors Added Yet</h3>
              <p className="text-xs text-text-secondary max-w-sm mt-1 mb-4">
                Add architectural floor levels to <strong>{activeBuilding?.name}</strong> to place guest rooms.
              </p>
              <Button size="sm" onClick={() => handleOpenFloorModal()} className="bg-brand text-brand-foreground font-bold">
                <Plus className="w-4 h-4 mr-1" /> Add First Floor
              </Button>
            </div>
          ) : (
            /* PURE, SIMPLE, PERFECTLY ALIGNED 2D ARCHITECTURAL DIAGRAM */
            <div className="flex-1 flex flex-col justify-center items-center py-6 px-4">
              <div className="w-full max-w-3xl space-y-0">
                
                {/* 1. TOP EXTENDING ROOF SLAB */}
                <div className="relative mx-auto w-[104%] -ml-[2%] h-6 bg-surface-hover border-2 border-border rounded-t-md shadow-xs flex items-center justify-between px-4 z-20">
                  <div className="text-[10px] font-bold font-mono text-text-secondary tracking-widest uppercase">
                    ROOF OVERHANG
                  </div>
                  <div className="w-2 h-2 rounded-full bg-brand" />
                </div>

                {/* 2. MAIN BUILDING ENCLOSURE BOX */}
                <div className="relative border-2 border-border bg-surface rounded-b-xl shadow-xs overflow-hidden">
                  <div className="divide-y-2 divide-border">
                    {buildingFloors.map((fl, idx) => {
                      const floorRooms = roomsByFloor[fl.id] || [];
                      const isSelected = selectedFloorId === fl.id;
                      const isGroundFloor = idx === buildingFloors.length - 1;

                      return (
                        <div
                          key={fl.id}
                          onClick={() => setSelectedFloorId(isSelected ? null : fl.id)}
                          className={`relative p-5 transition-colors cursor-pointer flex items-center justify-between gap-6 ${
                            isSelected ? "bg-brand/5" : "hover:bg-surface-hover/50"
                          }`}
                        >
                          {/* Interior Rooms Grid */}
                          <div className="flex-1 flex flex-wrap items-center justify-center gap-4">
                            {floorRooms.length === 0 ? (
                              <div className="py-3 px-6 text-xs font-mono text-text-tertiary border border-dashed border-border rounded-lg bg-surface/50">
                                Empty Floor Corridor (No rooms assigned)
                              </div>
                            ) : (
                              floorRooms.map((room) => {
                                const statusColor = getSimpleStatusColor(room.housekeeping_status, room.operational_status);
                                const unitType = unitTypes.find((t) => t.id === room.inventory_unit_type);
                                const isSpecialRoom = room.name.toLowerCase().includes("banquet") || room.name === "0001" || isGroundFloor;

                                return (
                                  <div key={room.id} className="flex flex-col items-center">
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAssignRoomTarget(room);
                                        setIsAssignModalOpen(true);
                                      }}
                                      className={`relative min-w-[75px] sm:min-w-[90px] px-3.5 py-2.5 rounded-lg border-2 text-center transition-all hover:-translate-y-0.5 shadow-xs cursor-pointer ${statusColor.bg} ${statusColor.border}`}
                                    >
                                      {/* Room Number */}
                                      <div className="text-sm font-bold font-mono text-text-primary tracking-tight">{room.name}</div>
                                      
                                      {/* Room Type Label */}
                                      <div className="text-[10px] text-text-secondary truncate max-w-[80px]">
                                        {unitType?.name || "Room"}
                                      </div>
                                    </div>

                                    {/* Callout Arrow for Special Rooms (e.g. Banquet / Room 0001) */}
                                    {isSpecialRoom && (
                                      <div className="flex flex-col items-center mt-1">
                                        <span className="text-[10px] text-brand font-bold">↑ {unitType?.name || "Banquet"}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* Right Side Floor Callout Line & Label (Matching Diagram Sketch Reference) */}
                          <div className="flex items-center gap-2 border-l-2 border-border pl-4 shrink-0 min-w-[130px]">
                            <span className="w-4 h-0.5 bg-border" />
                            <div className="text-left">
                              <span className="text-xs font-bold font-mono text-text-primary block">{fl.name}</span>
                              <span className="text-[10px] text-text-tertiary font-mono">Level {fl.floor_number}</span>
                            </div>

                            <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenFloorModal(fl);
                                }}
                                className="p-1 text-text-tertiary hover:text-text-primary"
                                title="Edit Floor"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer View Legend */}
          <div className="mt-6 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-text-secondary font-mono">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500 border border-emerald-600" /> Clean / Available</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-400 border border-amber-500" /> Inspection / Dirty</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-500 border border-blue-600" /> Occupied</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500 border border-red-600" /> Maintenance / OOO</span>
            </div>
            <span className="text-[11px] text-text-tertiary">Click any room box to assign or edit floor placement</span>
          </div>
        </Card>

        {/* Right Panel: Unassigned Rooms Pool */}
        <div className="space-y-4">
          <Card className="p-4 bg-surface border-border shadow-sm">
            <CardHeader
              title="Unassigned Rooms"
              hint={`${unassignedRooms.length} rooms awaiting floor placement`}
            />

            <div className="mt-3 space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {unassignedRooms.length === 0 ? (
                <div className="text-center py-8 text-xs text-text-tertiary">
                  All inventory rooms are mapped to architectural floors! 🎉
                </div>
              ) : (
                unassignedRooms.map((room) => {
                  const unitType = unitTypes.find((t) => t.id === room.inventory_unit_type);
                  return (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface-hover/50 hover:bg-surface-hover transition group"
                    >
                      <div>
                        <div className="text-xs font-bold text-text-primary font-mono">{room.name}</div>
                        <div className="text-[10px] text-text-secondary">{unitType?.name || "Room Unit"}</div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAssignRoomTarget(room);
                          setIsAssignModalOpen(true);
                        }}
                        className="h-7 text-xs px-2.5 bg-brand/10 border-brand/20 text-brand hover:bg-brand hover:text-white"
                      >
                        Assign Floor
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* RIGHT-SIDE SHEET DRAWER: Add/Edit Building */}
      <Sheet open={isBuildingModalOpen} onOpenChange={setIsBuildingModalOpen}>
        <SheetContent side="right" className="bg-surface text-text-primary p-6 sm:max-w-md border-l border-border shadow-2xl overflow-y-auto flex flex-col justify-between">
          <div>
            <SheetHeader>
              <SheetTitle className="text-lg font-bold text-text-primary">
                {editingBuilding ? "Edit Building" : "Add New Building"}
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-4 my-6">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Target Property *</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm font-semibold focus:border-brand focus:outline-none"
                  value={buildingForm.property || selectedPropertyId}
                  onChange={(e) => setBuildingForm({ ...buildingForm, property: e.target.value })}
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.code ? ` (${p.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Building Code *</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:border-brand focus:outline-none"
                  placeholder="E.g. TOWER-A, WING-EAST"
                  value={buildingForm.code}
                  onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Building Name *</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:border-brand focus:outline-none"
                  placeholder="E.g. Ocean View Tower"
                  value={buildingForm.name}
                  onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Description (Optional)</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:border-brand focus:outline-none resize-none"
                  placeholder="Brief architectural details or amenities"
                  value={buildingForm.description}
                  onChange={(e) => setBuildingForm({ ...buildingForm, description: e.target.value })}
                />
              </div>
            </div>
          </div>

          <SheetFooter className="gap-2 border-t border-border pt-4">
            <Button variant="outline" size="sm" onClick={() => setIsBuildingModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveBuilding} className="bg-brand text-brand-foreground">
              {editingBuilding ? "Update Building" : "Create Building"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* RIGHT-SIDE SHEET DRAWER: Add/Edit Floor */}
      <Sheet open={isFloorModalOpen} onOpenChange={setIsFloorModalOpen}>
        <SheetContent side="right" className="bg-surface text-text-primary p-6 sm:max-w-md border-l border-border shadow-2xl overflow-y-auto flex flex-col justify-between">
          <div>
            <SheetHeader>
              <SheetTitle className="text-lg font-bold text-text-primary">
                {editingFloor ? "Edit Floor Level" : "Add Floor to Building"}
              </SheetTitle>
            </SheetHeader>

            <div className="space-y-4 my-6">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Floor Level Number *</label>
                <input
                  type="number"
                  min={0}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:border-brand focus:outline-none"
                  value={floorForm.floor_number}
                  onChange={(e) => setFloorForm({ ...floorForm, floor_number: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Floor Display Name *</label>
                <input
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:border-brand focus:outline-none"
                  placeholder="E.g. Ground Floor, 1st Floor, Executive Level"
                  value={floorForm.name}
                  onChange={(e) => setFloorForm({ ...floorForm, name: e.target.value })}
                />
              </div>
            </div>
          </div>

          <SheetFooter className="gap-2 border-t border-border pt-4">
            <Button variant="outline" size="sm" onClick={() => setIsFloorModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveFloor} className="bg-brand text-brand-foreground">
              {editingFloor ? "Update Floor" : "Add Floor"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* RIGHT-SIDE SHEET DRAWER: Assign Room Placement */}
      {assignRoomTarget && (
        <Sheet open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
          <SheetContent side="right" className="bg-surface text-text-primary p-6 sm:max-w-md border-l border-border shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div>
              <SheetHeader>
                <SheetTitle className="text-lg font-bold text-text-primary">
                  Assign Room {assignRoomTarget.name} to Floor
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-4 my-6">
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">Target Building</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:border-brand focus:outline-none"
                    value={activeBuildingId || ""}
                    onChange={(e) => setActiveBuildingId(e.target.value)}
                  >
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">Target Architectural Floor Level</label>
                  <select
                    id="target-floor-select"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm focus:border-brand focus:outline-none"
                    defaultValue={assignRoomTarget.floor_id || ""}
                  >
                    <option value="">-- Unassigned (Detach from floor) --</option>
                    {buildingFloors.map((fl) => (
                      <option key={fl.id} value={fl.id}>
                        {fl.name} (Level {fl.floor_number})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <SheetFooter className="gap-2 border-t border-border pt-4">
              <Button variant="outline" size="sm" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-brand text-brand-foreground"
                onClick={() => {
                  const sel = (document.getElementById("target-floor-select") as HTMLSelectElement)?.value;
                  const selectedFloor = buildingFloors.find((f) => f.id === sel);
                  handleAssignRoom(
                    assignRoomTarget.id,
                    activeBuildingId,
                    sel || null,
                    selectedFloor ? selectedFloor.name : undefined
                  );
                }}
              >
                Save Placement
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

// Helpers
function getOrdinalSuffix(i: number) {
  const j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

function getSimpleStatusColor(housekeeping: string = "clean", operational: string = "operational") {
  if (operational === "out_of_order" || operational === "maintenance") {
    return {
      bg: "bg-red-50 dark:bg-red-950/40",
      border: "border-red-400 dark:border-red-600",
    };
  }
  if (housekeeping === "dirty") {
    return {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-400 dark:border-amber-600",
    };
  }
  return {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-400 dark:border-emerald-600",
  };
}




