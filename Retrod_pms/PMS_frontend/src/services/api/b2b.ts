import { fetchApi } from "./core";

export interface B2BPartnerPayload {
  name: string;
  contact: string;
  email: string;
  phone: string;
  location: string;
  status?: string;
  commission?: number;
  creditLimit?: number;
  incorporation?: File | string | null;
  ownerId?: File | string | null;
  cheque?: File | string | null;
}

export const b2bApi = {
  getAll: async () => {
    return fetchApi<any>("/api/b2b/b2b-agents/");
  },

  create: async (payload: B2BPartnerPayload) => {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("contact", payload.contact);
    formData.append("email", payload.email);
    formData.append("phone", payload.phone);
    formData.append("location", payload.location);
    if (payload.status) {
      formData.append("status", payload.status);
    }
    if (payload.commission !== undefined) {
      formData.append("commission", String(payload.commission));
    }
    if (payload.creditLimit !== undefined) {
      formData.append("creditLimit", String(payload.creditLimit));
    }
    if (payload.incorporation) {
      formData.append("incorporation", payload.incorporation);
    }
    if (payload.ownerId) {
      formData.append("ownerId", payload.ownerId);
    }
    if (payload.cheque) {
      formData.append("cheque", payload.cheque);
    }

    return fetchApi<any>("/api/b2b/b2b-agents/", {
      method: "POST",
      body: formData,
    });
  },

  update: async (agentId: string, payload: Partial<B2BPartnerPayload>) => {
    const formData = new FormData();
    if (payload.name) formData.append("name", payload.name);
    if (payload.contact !== undefined) formData.append("contact", payload.contact);
    if (payload.email) formData.append("email", payload.email);
    if (payload.phone) formData.append("phone", payload.phone);
    if (payload.location) formData.append("location", payload.location);
    if (payload.status) formData.append("status", payload.status);
    if (payload.commission !== undefined) formData.append("commission", String(payload.commission));
    if (payload.creditLimit !== undefined) formData.append("creditLimit", String(payload.creditLimit));
    if (payload.incorporation) formData.append("incorporation", payload.incorporation);
    if (payload.ownerId) formData.append("ownerId", payload.ownerId);
    if (payload.cheque) formData.append("cheque", payload.cheque);

    return fetchApi<any>(`/api/b2b/b2b-agents/${agentId}/`, {
      method: "PATCH",
      body: formData,
    });
  },
};
