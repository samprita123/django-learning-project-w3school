import { fetchApi } from "./core";

export interface Building {
  id: string;
  property: string;
  code: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Floor {
  id: string;
  building: string;
  floor_number: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface FloorPlan {
  id: string;
  floor: string;
  file_url: string;
  version: string;
}

export interface CreateBuildingPayload {
  property?: string;
  code: string;
  name: string;
  description?: string;
}

export interface CreateFloorPayload {
  building: string;
  floor_number: number;
  name: string;
}

export const buildingsFloorsApi = {
  getBuildings: async (propertyId?: string): Promise<Building[]> => {
    const url = propertyId ? `/api/buildings/?property=${propertyId}` : "/api/buildings/";
    const res = await fetchApi<any>(url);
    return Array.isArray(res) ? res : res.results || [];
  },

  createBuilding: async (payload: CreateBuildingPayload): Promise<Building> => {
    let propertyId = payload.property;
    if (!propertyId) {
      propertyId = localStorage.getItem("retrod:active-property-id") || undefined;
    }
    if (!propertyId) {
      // Fetch default property from API if localStorage empty
      const props = await fetchApi<any>("/api/properties/");
      const list = Array.isArray(props) ? props : props.results || [];
      propertyId = list[0]?.id;
    }

    return fetchApi<Building>("/api/buildings/", {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        property: propertyId,
      }),
    });
  },

  updateBuilding: async (id: string, payload: Partial<CreateBuildingPayload>): Promise<Building> => {
    return fetchApi<Building>(`/api/buildings/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteBuilding: async (id: string): Promise<void> => {
    return fetchApi<void>(`/api/buildings/${id}/`, {
      method: "DELETE",
    });
  },

  getFloors: async (buildingId?: string): Promise<Floor[]> => {
    const endpoint = buildingId ? `/api/floors/?building=${buildingId}` : "/api/floors/";
    const res = await fetchApi<any>(endpoint);
    return Array.isArray(res) ? res : res.results || [];
  },

  createFloor: async (payload: CreateFloorPayload): Promise<Floor> => {
    return fetchApi<Floor>("/api/floors/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateFloor: async (id: string, payload: Partial<CreateFloorPayload>): Promise<Floor> => {
    return fetchApi<Floor>(`/api/floors/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteFloor: async (id: string): Promise<void> => {
    return fetchApi<void>(`/api/floors/${id}/`, {
      method: "DELETE",
    });
  },

  assignRoomToBuildingFloor: async (
    roomId: string,
    buildingId: string | null,
    floorId: string | null,
    floorName?: string,
    propertyId?: string
  ): Promise<any> => {
    const payload: any = {
      building: buildingId,
      floor_id: floorId,
      floor: floorName || "",
    };
    if (propertyId) {
      payload.property = propertyId;
    }
    return fetchApi<any>(`/api/inventory/units/${roomId}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
