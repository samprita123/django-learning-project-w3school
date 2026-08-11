import { fetchApi } from "./core";

export interface Country {
  code: string;
  name: string;
  phone_code?: string;
  is_active: boolean;
}

export interface Currency {
  code: string;
  name: string;
  symbol?: string;
  is_active: boolean;
}

export interface Timezone {
  code: string;
  name: string;
  utc_offset?: string;
  is_active: boolean;
}

export interface State {
  id?: string;
  code: string;
  name: string;
  country?: string;
  country_name?: string;
  is_active: boolean;
}

export const referenceApi = {
  getCountries: (isActive?: boolean) => {
    const params = isActive !== undefined ? `?is_active=${isActive}` : "";
    return fetchApi<Country[]>(`/api/reference/countries/${params}`);
  },

  getStates: (country?: string, isActive?: boolean) => {
    const queryParams: string[] = [];
    if (country) queryParams.push(`country=${encodeURIComponent(country)}`);
    if (isActive !== undefined) queryParams.push(`is_active=${isActive}`);
    const qs = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
    return fetchApi<State[]>(`/api/reference/states/${qs}`);
  },

  getCurrencies: (isActive?: boolean) => {
    const params = isActive !== undefined ? `?is_active=${isActive}` : "";
    return fetchApi<Currency[]>(`/api/reference/currencies/${params}`);
  },

  getTimezones: (isActive?: boolean) => {
    const params = isActive !== undefined ? `?is_active=${isActive}` : "";
    return fetchApi<Timezone[]>(`/api/reference/timezones/${params}`);
  },
};
