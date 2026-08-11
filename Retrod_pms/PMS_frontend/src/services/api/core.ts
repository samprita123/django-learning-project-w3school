import { getSubdomain, LS_ACCESS_TOKEN, LS_REFRESH_TOKEN } from "../auth-api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(LS_ACCESS_TOKEN);
  const propertyId = localStorage.getItem("retrod:active-property-id");
  const headers: Record<string, string> = {
    "X-Tenant-Subdomain": getSubdomain(),
    ...((options.headers as Record<string, string>) || {}),
  };

  if (propertyId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(propertyId)) {
    headers["X-Property-ID"] = propertyId;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Try to refresh token
    const refresh = localStorage.getItem(LS_REFRESH_TOKEN);
    if (refresh) {
      try {
        const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Tenant-Subdomain": getSubdomain(),
          },
          body: JSON.stringify({ refresh }),
        });
        
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          if (data.access) {
            localStorage.setItem(LS_ACCESS_TOKEN, data.access);
            if (data.refresh) {
              localStorage.setItem(LS_REFRESH_TOKEN, data.refresh);
            }
            headers["Authorization"] = `Bearer ${data.access}`;
            // Retry the original request
            res = await fetch(`${BASE_URL}${endpoint}`, {
              ...options,
              headers,
            });
          } else {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("auth-unauthorized"));
            }
          }
        } else {
          // If refresh fails, let the original 401 propagate
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth-unauthorized"));
          }
        }
      } catch (e) {
        // Ignore refresh errors
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth-unauthorized"));
        }
      }
    } else {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth-unauthorized"));
      }
    }
  }

  if (!res.ok) {
    let errMsg = `HTTP ${res.status} ${res.statusText}`;
    try {
      const text = await res.text();
      try {
        const errorData = JSON.parse(text);
        errMsg = errorData.error || errorData.detail || (typeof errorData === "string" ? errorData : JSON.stringify(errorData));
      } catch {
        errMsg = text.length < 200 ? text : `HTTP ${res.status} (${res.statusText})`;
      }
    } catch {
      errMsg = `HTTP ${res.status} (${res.statusText})`;
    }
    throw new Error(errMsg);
  }

  if (res.status === 204) {
    return {} as T; // No content
  }

  return res.json() as Promise<T>;
}
