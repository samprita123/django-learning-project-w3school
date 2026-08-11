import { fetchApi } from "./core";

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

export interface ProductFeature {
  id: string;
  product: string; // Product UUID
  code: string;
  name: string;
  description?: string;
  price?: number;
  is_active: boolean;
  created_at?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  billing_cycle: string; // e.g. "MONTHLY" | "YEARLY"
  price: number;
  currency: string;
  is_active: boolean;
  products: Product[];
  product_ids?: string[];
  feature_codes?: string[];
}

export interface AssignSubscriptionPayload {
  tenant: string; // Tenant ID
  plan_id: string;
  billing_cycle: "monthly" | "annual";
  override_price?: string;
  starts_at?: string; // ISO 8601
  ends_at?: string; // ISO 8601
}

export interface CustomSubscriptionFeatureItem {
  feature_id: string;
  price: number;
}

export interface CustomSubscriptionPayload {
  tenant_id: string;
  custom_name?: string;
  billing_cycle: "MONTHLY" | "YEARLY";
  price: number;
  currency: string;
  start_date?: string;
  end_date?: string;
  features: CustomSubscriptionFeatureItem[];
}

export const subscriptionApi = {
  // --- Products API ---
  getProducts: () => {
    return fetchApi<Product[]>("/api/products/");
  },
  createProduct: (payload: Omit<Product, "id">) => {
    return fetchApi<Product>("/api/products/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateProduct: (id: string, payload: Partial<Product>) => {
    return fetchApi<Product>(`/api/products/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  deleteProduct: (id: string) => {
    return fetchApi<void>(`/api/products/${id}/`, {
      method: "DELETE",
    });
  },

  // --- Product Features API ---
  getFeatures: () => {
    return fetchApi<ProductFeature[]>("/api/product-features/");
  },
  getProductFeatures: (productId: string) => {
    return fetchApi<ProductFeature[]>(`/api/products/${productId}/features/`);
  },
  createProductFeature: (payload: Omit<ProductFeature, "id">) => {
    return fetchApi<ProductFeature>("/api/product-features/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateProductFeature: (id: string, payload: Partial<ProductFeature>) => {
    return fetchApi<ProductFeature>(`/api/product-features/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  deleteProductFeature: (id: string) => {
    return fetchApi<void>(`/api/product-features/${id}/`, {
      method: "DELETE",
    });
  },

  // --- Subscription Plans API ---
  getPlans: () => {
    return fetchApi<SubscriptionPlan[]>("/api/subscriptions/plans/");
  },
  createPlan: (payload: Omit<SubscriptionPlan, "id" | "products">) => {
    return fetchApi<SubscriptionPlan>("/api/subscriptions/plans/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updatePlan: (id: string, payload: Partial<SubscriptionPlan>) => {
    return fetchApi<SubscriptionPlan>(`/api/subscriptions/plans/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  deletePlan: (id: string) => {
    return fetchApi<void>(`/api/subscriptions/plans/${id}/`, {
      method: "DELETE",
    });
  },

  assignSubscription: (payload: AssignSubscriptionPayload) => {
    return fetchApi<any>("/api/subscriptions/assign/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  assignCustomSubscription: (payload: CustomSubscriptionPayload) => {
    return fetchApi<any>("/api/subscriptions/custom-assign/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getTenantProducts: () => {
    return fetchApi<any[]>("/api/products/tenant-products/");
  },
};
