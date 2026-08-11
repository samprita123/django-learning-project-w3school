import { fetchApi } from "./core";

export interface InventoryUnit {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  floor: string;
  operational_status: string;
  housekeeping_status: string;
  maintenance_status: string;
  created_by: string;
  updated_by: string;
  tenant: string;
  property: string;
  inventory_unit_type: string;
  parent_unit: string | null;
  building: string | null;
  floor_id: string | null;
}

export const inventoryApi = {
  getInventoryUnits: async (): Promise<InventoryUnit[]> => {
    return fetchApi<InventoryUnit[]>("/api/inventory/units/", {
      method: "GET",
    });
  },

  getInventoryUnit: async (id: string): Promise<InventoryUnit> => {
    return fetchApi<InventoryUnit>(`/api/inventory/units/${id}/`, {
      method: "GET",
    });
  },

  updateInventoryUnit: async (id: string, data: Partial<InventoryUnit>): Promise<InventoryUnit> => {
    return fetchApi<InventoryUnit>(`/api/inventory/units/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  patchInventoryUnit: async (id: string, data: Partial<InventoryUnit>): Promise<InventoryUnit> => {
    return fetchApi<InventoryUnit>(`/api/inventory/units/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteInventoryUnit: async (id: string): Promise<void> => {
    return fetchApi<void>(`/api/inventory/units/${id}/`, {
      method: "DELETE",
    });
  },
};
