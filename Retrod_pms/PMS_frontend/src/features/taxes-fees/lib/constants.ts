import type { TaxComponentType } from "@/types/pms";

export const TAX_COMPONENT_TYPE_LABEL: Record<TaxComponentType, string> = {
  gst: "GST",
  city_tax: "City Tax",
  service_charge: "Service Charge",
  tourism_tax: "Tourism Tax",
  vat: "VAT",
  luxury_tax: "Luxury Tax",
};

export const TAX_COMPONENT_TYPES = Object.keys(TAX_COMPONENT_TYPE_LABEL) as TaxComponentType[];

export const CALCULATION_BASE_LABEL = {
  room_tariff: "Room tariff",
  folio_subtotal: "Folio subtotal",
  per_night: "Per night (flat)",
  per_guest_night: "Per guest · night",
} as const;
