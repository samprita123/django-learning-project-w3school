import { getSubdomain, authApi } from "../auth-api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface SystemLanguageData {
  id?: string;
  name: string;
  code: string;
  is_active: boolean;
  is_default: boolean;
}

export interface SystemTaxData {
  id?: string;
  name: string;
  rate: number;
  type: "percentage" | "fixed";
  status: "active" | "inactive";
  tenant?: string | null;
}

export interface SystemDocumentTypeData {
  id?: string;
  name: string;
  required_checkin: boolean;
  expiry_required: boolean;
  tenant?: string | null;
}

export interface SystemCurrencyData {
  id?: string;
  code: string;
  symbol: string;
  name: string;
  country?: string;
  country_name?: string;
  is_active: boolean;
  is_default: boolean;
  tenant?: string | null;

  // Format Settings
  symbol_position?: string;
  decimal_places?: number;
  decimal_separator?: string;
  thousands_separator?: string;
  add_space?: boolean;
  show_decimals?: boolean;
}

export interface SystemDateFormatData {
  id?: string;
  format: string;
  label: string;
  is_default: boolean;
  tenant?: string | null;
}

export interface SystemTimeFormatData {
  id?: string;
  format: string;
  label: string;
  is_default: boolean;
  tenant?: string | null;
}

export interface CouponData {
  id?: string;
  code: string;
  discount_type: "FLAT" | "PERCENTAGE";
  discount_value: string;
  valid_from: string | null;
  valid_until: string | null;
  max_uses: number | null;
  current_uses?: number;
  is_active: boolean;
  tenant?: string | null;
}

class SettingsApiClient {
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Tenant-Subdomain": getSubdomain(),
    };
    const token = localStorage.getItem("retrod.auth.access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
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



  // Languages
  async getLanguages(): Promise<SystemLanguageData[]> {
    const res = await fetch(`${BASE_URL}/api/superadmin-languages/`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async createLanguage(data: SystemLanguageData): Promise<SystemLanguageData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-languages/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async updateLanguage(id: string, data: Partial<SystemLanguageData>): Promise<SystemLanguageData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-languages/${id}/`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async deleteLanguage(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/superadmin-languages/${id}/`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to delete language.");
    }
  }

  // Taxes
  async getTaxes(): Promise<SystemTaxData[]> {
    const res = await fetch(`${BASE_URL}/api/superadmin-taxes/`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async createTax(data: SystemTaxData): Promise<SystemTaxData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-taxes/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async updateTax(id: string, data: Partial<SystemTaxData>): Promise<SystemTaxData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-taxes/${id}/`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async deleteTax(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/superadmin-taxes/${id}/`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to delete tax.");
    }
  }

  // Documents
  async getDocuments(): Promise<SystemDocumentTypeData[]> {
    const res = await fetch(`${BASE_URL}/api/superadmin-documents/`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async createDocument(data: SystemDocumentTypeData): Promise<SystemDocumentTypeData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-documents/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async updateDocument(id: string, data: Partial<SystemDocumentTypeData>): Promise<SystemDocumentTypeData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-documents/${id}/`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/superadmin-documents/${id}/`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to delete document type.");
    }
  }

  // Currencies
  async getCurrencies(): Promise<SystemCurrencyData[]> {
    const res = await fetch(`${BASE_URL}/api/superadmin-currencies/`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async createCurrency(data: SystemCurrencyData): Promise<SystemCurrencyData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-currencies/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async updateCurrency(id: string, data: Partial<SystemCurrencyData>): Promise<SystemCurrencyData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-currencies/${id}/`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async deleteCurrency(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/superadmin-currencies/${id}/`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to delete currency.");
    }
  }

  // Date Formats
  async getDateFormats(): Promise<SystemDateFormatData[]> {
    const res = await fetch(`${BASE_URL}/api/superadmin-date-formats/`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async createDateFormat(data: SystemDateFormatData): Promise<SystemDateFormatData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-date-formats/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async updateDateFormat(id: string, data: Partial<SystemDateFormatData>): Promise<SystemDateFormatData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-date-formats/${id}/`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async deleteDateFormat(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/superadmin-date-formats/${id}/`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to delete date format.");
    }
  }

  // Time Formats
  async getTimeFormats(): Promise<SystemTimeFormatData[]> {
    const res = await fetch(`${BASE_URL}/api/superadmin-time-formats/`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async createTimeFormat(data: SystemTimeFormatData): Promise<SystemTimeFormatData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-time-formats/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async updateTimeFormat(id: string, data: Partial<SystemTimeFormatData>): Promise<SystemTimeFormatData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-time-formats/${id}/`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async deleteTimeFormat(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/superadmin-time-formats/${id}/`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to delete time format.");
    }
  }

  // Tenant Configurations
  async getTenantConfigurations(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/api/tenant-configurations/`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async updateTenantConfiguration(id: string, data: any): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/tenant-configurations/${id}/`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
      });
    return this.handleResponse(res);
  }

  async deleteTenantConfiguration(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/tenant-configurations/${id}/`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok && res.status !== 204) {
      await this.handleResponse(res);
    }
  }

  // Coupons
  async getCoupons(): Promise<CouponData[]> {
    const res = await fetch(`${BASE_URL}/api/rates/coupons/`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async createCoupon(data: Partial<CouponData>): Promise<CouponData> {
    const res = await fetch(`${BASE_URL}/api/rates/coupons/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async updateCoupon(id: string, data: Partial<CouponData>): Promise<CouponData> {
    const res = await fetch(`${BASE_URL}/api/rates/coupons/${id}/`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async deleteCoupon(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/rates/coupons/${id}/`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok && res.status !== 204) {
      await this.handleResponse(res);
    }
  }

  // Countries
  async getCountries(): Promise<CountryData[]> {
    const res = await fetch(`${BASE_URL}/api/reference/countries/`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async createCountry(data: CountryData): Promise<CountryData> {
    const res = await fetch(`${BASE_URL}/api/reference/countries/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async updateCountry(id: string, data: Partial<CountryData>): Promise<CountryData> {
    const res = await fetch(`${BASE_URL}/api/reference/countries/${id}/`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async deleteCountry(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/reference/countries/${id}/`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to delete country.");
    }
  }

  // States
  async getStates(countryId?: string): Promise<StateData[]> {
    const url = countryId 
      ? `${BASE_URL}/api/reference/states/?country=${countryId}` 
      : `${BASE_URL}/api/reference/states/`;
    const res = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async createState(data: StateData): Promise<StateData> {
    const res = await fetch(`${BASE_URL}/api/reference/states/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async updateState(id: string, data: Partial<StateData>): Promise<StateData> {
    const res = await fetch(`${BASE_URL}/api/reference/states/${id}/`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async deleteState(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/reference/states/${id}/`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to delete state.");
    }
  }

  // Departments
  async getDepartments(): Promise<DepartmentData[]> {
    const res = await fetch(`${BASE_URL}/api/superadmin-departments/`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async createDepartment(data: DepartmentData): Promise<DepartmentData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-departments/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async updateDepartment(id: string, data: Partial<DepartmentData>): Promise<DepartmentData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-departments/${id}/`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async deleteDepartment(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/superadmin-departments/${id}/`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to delete department.");
    }
  }

  // Shifts
  async getShifts(): Promise<ShiftData[]> {
    const res = await fetch(`${BASE_URL}/api/superadmin-shifts/`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async createShift(data: ShiftData): Promise<ShiftData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-shifts/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async updateShift(id: string, data: Partial<ShiftData>): Promise<ShiftData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-shifts/${id}/`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async deleteShift(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/superadmin-shifts/${id}/`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to delete shift.");
    }
  }

  // Occupancy Types
  async getOccupancyTypes(): Promise<OccupancyTypeData[]> {
    const res = await fetch(`${BASE_URL}/api/superadmin-occupancy-types/`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async createOccupancyType(data: OccupancyTypeData): Promise<OccupancyTypeData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-occupancy-types/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async updateOccupancyType(id: string, data: Partial<OccupancyTypeData>): Promise<OccupancyTypeData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-occupancy-types/${id}/`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async deleteOccupancyType(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/superadmin-occupancy-types/${id}/`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to delete occupancy type.");
    }
  }

  // Booking Sources
  async getBookingSources(): Promise<BookingSourceData[]> {
    const res = await fetch(`${BASE_URL}/api/superadmin-booking-sources/`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async createBookingSource(data: BookingSourceData): Promise<BookingSourceData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-booking-sources/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async updateBookingSource(id: string, data: Partial<BookingSourceData>): Promise<BookingSourceData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-booking-sources/${id}/`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  // Payment Gateways (Superadmin)
  async getPaymentGateways(): Promise<PaymentGatewayData[]> {
    const res = await fetch(`${BASE_URL}/api/superadmin-payment-gateways/`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async createPaymentGateway(data: PaymentGatewayData): Promise<PaymentGatewayData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-payment-gateways/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async updatePaymentGateway(id: string, data: Partial<PaymentGatewayData>): Promise<PaymentGatewayData> {
    const res = await fetch(`${BASE_URL}/api/superadmin-payment-gateways/${id}/`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async deletePaymentGateway(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/superadmin-payment-gateways/${id}/`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Failed to delete payment gateway.");
    }
  }

  // Tenant Payment Gateways (System Setup / Tenant Settings)
  async getTenantPaymentGateways(): Promise<TenantPaymentGatewayData[]> {
    const res = await fetch(`${BASE_URL}/api/tenant-payment-gateways/`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async createOrUpdateTenantPaymentGateway(data: Partial<TenantPaymentGatewayData>): Promise<TenantPaymentGatewayData> {
    const method = data.id ? "PATCH" : "POST";
    const url = data.id ? `${BASE_URL}/api/tenant-payment-gateways/${data.id}/` : `${BASE_URL}/api/tenant-payment-gateways/`;
    const res = await fetch(url, {
      method,
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  // Razorpay Integration API Endpoints
  async createRazorpayOrder(amount: number, currency: string = "INR", receipt?: string): Promise<{ order_id: string; amount: number; currency: string; key: string; status: string; mode: string }> {
    const res = await fetch(`${BASE_URL}/api/payments/razorpay/create-order/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ amount, currency, receipt }),
    });
    return this.handleResponse(res);
  }

  async verifyRazorpaySignature(payload: { razorpay_order_id?: string; razorpay_payment_id: string; razorpay_signature?: string }): Promise<{ verified: boolean; message: string; transaction_id: string; order_id?: string }> {
    const res = await fetch(`${BASE_URL}/api/payments/razorpay/verify-signature/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(res);
  }
}

export interface PaymentGatewayData {
  id?: string;
  name: string;
  code: string;
  subtitle?: string;
  badge?: string;
  logo_url?: string;
  is_active: boolean;
  is_default?: boolean;
}

export interface TenantPaymentGatewayData {
  id?: string;
  tenant?: string | null;
  gateway: string;
  gateway_details?: PaymentGatewayData;
  is_enabled: boolean;
  api_key?: string;
  api_secret?: string;
  merchant_id?: string;
  extra_config?: Record<string, any>;
}

export interface BookingSourceData {
  id?: string;
  name: string;
  icon?: string;
  details?: string;
  is_active: boolean;
}

export interface CountryData {
  id?: string;
  code: string;
  name: string;
  phone_code?: string;
  is_active: boolean;
}

export interface StateData {
  id?: string;
  country: string;
  country_name?: string;
  code: string;
  name: string;
  is_active: boolean;
}

export interface DepartmentData {
  id?: string;
  name: string;
  code: string;
  description: string;
  tenant?: string | null;
}

export interface ShiftData {
  id?: string;
  name: string;
  code: string;
  start_time: string;
  end_time: string;
  description: string;
  tenant?: string | null;
}

export interface OccupancyTypeData {
  id?: string;
  name: string;
  code: string;
  max_guests: number;
  multiplier: number;
  is_active: boolean;
  tenant?: string | null;
}

export const settingsApi = new SettingsApiClient();

