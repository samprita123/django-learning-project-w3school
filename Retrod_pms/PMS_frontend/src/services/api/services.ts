import { fetchApi } from "./core";

export interface Service {
  id?: string;
  name: string;
  category: "Add-On" | "Concierge" | "Transport" | string;
  category_name?: string;
  price: string | number;
  status: "Active" | "Seasonal" | "Draft" | string;
  tenant?: string;
  created_at?: string;
  updated_at?: string;
}

export const fetchServices = async (): Promise<Service[]> => {
  return await fetchApi("/api/rates/services/");
};

export const createService = async (data: Service): Promise<Service> => {
  return await fetchApi("/api/rates/services/", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateService = async (data: Service): Promise<Service> => {
  if (!data.id) throw new Error("Service ID is required for update");
  return await fetchApi(`/api/rates/services/${data.id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteService = async (id: string): Promise<void> => {
  await fetchApi(`/api/rates/services/${id}/`, {
    method: "DELETE",
  });
};

export const bulkRenameCategory = async (oldName: string, newName: string): Promise<any> => {
  return await fetchApi("/api/rates/services/bulk-rename-category/", {
    method: "POST",
    body: JSON.stringify({ old_name: oldName, new_name: newName }),
  });
};

export interface ServiceCategory {
  id?: string;
  name: string;
  description?: string;
}

export const fetchServiceCategories = async (): Promise<ServiceCategory[]> => {
  return await fetchApi("/api/rates/service-categories/");
};

export const createServiceCategory = async (data: ServiceCategory): Promise<ServiceCategory> => {
  return await fetchApi("/api/rates/service-categories/", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateServiceCategory = async (data: ServiceCategory): Promise<ServiceCategory> => {
  if (!data.id) throw new Error("Category ID is required for update");
  return await fetchApi(`/api/rates/service-categories/${data.id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteServiceCategory = async (id: string): Promise<void> => {
  await fetchApi(`/api/rates/service-categories/${id}/`, {
    method: "DELETE",
  });
};
