export function getSubdomain(): string {
  if (typeof window === "undefined") return "grandpalace";
  const saved = localStorage.getItem("retrod:active-subdomain");
  if (saved) return saved;

  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  
  if (parts.length >= 2 && parts[0] !== "localhost" && parts[0] !== "127" && parts[0] !== "www") {
    return parts[0];
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const param = urlParams.get("subdomain") || urlParams.get("tenant");
  if (param) return param;
  
  return "grandpalace";
}

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const LS_ACCESS_TOKEN = "retrod.auth.access_token";
export const LS_REFRESH_TOKEN = "retrod.auth.refresh_token";

export class AuthApiClient {
  private getHeaders(authRequired = false): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Tenant-Subdomain": getSubdomain(),
    };
    
    if (authRequired) {
      const token = localStorage.getItem(LS_ACCESS_TOKEN);
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let errMsg = "An error occurred";
      try {
        const errorData = await res.json();
        errMsg = errorData.error || errorData.detail || JSON.stringify(errorData);
      } catch {
        errMsg = await res.text();
      }
      throw new Error(errMsg);
    }
    return res.json() as Promise<T>;
  }

  async login(emailOrUsername: string, password: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/auth/login/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email_or_username: emailOrUsername, password }),
    });
    return this.handleResponse(res);
  }

  async requestOtp(contact: string): Promise<any> {
    const payload: Record<string, string> = {};
    if (contact.includes("@")) {
      payload["email"] = contact;
    } else {
      payload["phone"] = contact;
    }
    
    const res = await fetch(`${BASE_URL}/api/auth/request-otp/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(res);
  }

  async verifyOtp(contact: string, otpCode: string): Promise<any> {
    const payload: Record<string, string> = { otp_code: otpCode };
    if (contact.includes("@")) {
      payload["email"] = contact;
    } else {
      payload["phone"] = contact;
    }
    
    const res = await fetch(`${BASE_URL}/api/auth/verify-otp/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(res);
  }

  async checkConfirmationStatus(id: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/auth/check-confirmation-status/?id=${id}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async refreshToken(): Promise<string | null> {
    const refresh = localStorage.getItem(LS_REFRESH_TOKEN);
    if (!refresh) return null;
    
    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Subdomain": getSubdomain(),
        },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) {
        this.clearTokens();
        return null;
      }
      const data = await res.json();
      if (data.access) {
        localStorage.setItem(LS_ACCESS_TOKEN, data.access);
        if (data.refresh) {
          localStorage.setItem(LS_REFRESH_TOKEN, data.refresh);
        }
        return data.access;
      }
      return null;
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    const refresh = localStorage.getItem(LS_REFRESH_TOKEN);
    const headers = this.getHeaders(true);
    this.clearTokens();
    if (refresh) {
      try {
        await fetch(`${BASE_URL}/api/auth/logout/`, {
          method: "POST",
          headers,
          body: JSON.stringify({ refresh }),
        });
      } catch (err) {
        console.error("Logout request failed:", err);
      }
    }
  }

  async getCurrentUser(): Promise<any> {
    let res = await fetch(`${BASE_URL}/api/auth/me/`, {
      method: "GET",
      headers: this.getHeaders(true),
    });
    
    if (res.status === 401) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        res = await fetch(`${BASE_URL}/api/auth/me/`, {
          method: "GET",
          headers: this.getHeaders(true),
        });
      }
    }
    return this.handleResponse(res);
  }

  async forgotPassword(email: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, reset_method: "otp" }),
    });
    return this.handleResponse(res);
  }

  async resetPassword(payload: Record<string, string>): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/auth/reset-password/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(res);
  }

  async changePassword(payload: Record<string, string>): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/auth/change-password/`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(res);
  }

  async getSessions(): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/security/sessions/`, {
      method: "GET",
      headers: this.getHeaders(true),
    });
    return this.handleResponse(res);
  }

  async revokeSession(sessionId: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/security/sessions/revoke/`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify({ session_id: sessionId }),
    });
    return this.handleResponse(res);
  }

  async logoutAllSessions(): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/security/sessions/logout-all/`, {
      method: "POST",
      headers: this.getHeaders(true),
    });
    return this.handleResponse(res);
  }

  saveTokens(access: string, refresh: string) {
    localStorage.setItem(LS_ACCESS_TOKEN, access);
    localStorage.setItem(LS_REFRESH_TOKEN, refresh);
  }

  clearTokens() {
    localStorage.removeItem(LS_ACCESS_TOKEN);
    localStorage.removeItem(LS_REFRESH_TOKEN);
  }
}

export const authApi = new AuthApiClient();
