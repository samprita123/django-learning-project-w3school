import { fetchApi } from "./core";

export interface Amenity {
  id: string;
  code: string;
  name: string;
  category: string;
  chargeable?: boolean;
  price?: number;
  description?: string;
  icon_name?: string;
  tenant?: string | null;
}

export const amenitiesApi = {
  getAmenities: () => {
    return fetchApi<Amenity[]>("/api/inventory/amenities/");
  },

  createAmenity: (data: Partial<Amenity>) => {
    return fetchApi<Amenity>("/api/inventory/amenities/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateAmenity: (id: string, data: Partial<Amenity>) => {
    return fetchApi<Amenity>(`/api/inventory/amenities/${id}/`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteAmenity: (id: string) => {
    return fetchApi<void>(`/api/inventory/amenities/${id}/`, {
      method: "DELETE",
    });
  },
};
