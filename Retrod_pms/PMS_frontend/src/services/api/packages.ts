import { fetchApi } from "./core";

export interface HospitalityPackage {
  id?: string;
  name: string;
  price: string | number;
  inclusions: string;
  status: "Active" | "Draft";
}

export const fetchPackages = () => fetchApi<HospitalityPackage[]>("/api/rates/packages/");

export const createPackage = (pkg: HospitalityPackage) =>
  fetchApi<HospitalityPackage>("/api/rates/packages/", {
    method: "POST",
    body: JSON.stringify(pkg),
  });

export const updatePackage = (pkg: HospitalityPackage) =>
  fetchApi<HospitalityPackage>(`/api/rates/packages/${pkg.id}/`, {
    method: "PUT",
    body: JSON.stringify(pkg),
  });

export const deletePackage = (id: string) =>
  fetchApi<void>(`/api/rates/packages/${id}/`, {
    method: "DELETE",
  });
