import { fetchApi } from "./core";

export interface LostFoundItemPayload {
  item_type: "LOST" | "FOUND";
  item_name: string;
  description: string;
  location_found?: string;
  finder_name?: string;
  image?: File | null;
  guest_name?: string;
  guest_contact?: string;
  status?: string;
  property?: string;
}

export const lostFoundApi = {
  getAll: async () => {
    const propertyId = localStorage.getItem("retrod:active-property-id");
    const qs = propertyId ? `?property=${propertyId}` : "";
    return fetchApi<any>(`/api/lost-found/items/${qs}`);
  },

  getStats: async () => {
    return fetchApi<any>("/api/lost-found/items/stats/");
  },

  getSuggestions: async (id: number | string) => {
    return fetchApi<any>(`/api/lost-found/items/${id}/suggested-matches/`);
  },

  create: async (payload: LostFoundItemPayload) => {
    const propertyId = localStorage.getItem("retrod:active-property-id");
    const formData = new FormData();
    formData.append("item_type", payload.item_type);
    formData.append("item_name", payload.item_name);
    formData.append("description", payload.description);
    if (payload.location_found) formData.append("location_found", payload.location_found);
    if (payload.finder_name) formData.append("finder_name", payload.finder_name);
    if (payload.guest_name) formData.append("guest_name", payload.guest_name);
    if (payload.guest_contact) formData.append("guest_contact", payload.guest_contact);
    if (payload.status) formData.append("status", payload.status);
    
    // Auto-fill active property if not specified
    const activePropertyId = payload.property || propertyId || "";
    if (activePropertyId) {
      formData.append("property", activePropertyId);
    }

    if (payload.image) {
      formData.append("image", payload.image);
    }

    return fetchApi<any>("/api/lost-found/items/", {
      method: "POST",
      body: formData,
    });
  },

  claim: async (id: number | string, claimedBy: string) => {
    return fetchApi<any>(`/api/lost-found/items/${id}/claim/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ claimed_by: claimedBy }),
    });
  },

  dispose: async (id: number | string, reason: string) => {
    return fetchApi<any>(`/api/lost-found/items/${id}/dispose/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ disposed_reason: reason }),
    });
  },
};
