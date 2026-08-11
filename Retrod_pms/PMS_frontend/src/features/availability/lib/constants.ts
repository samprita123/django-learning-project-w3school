import type { AvailabilityRestriction, AvailabilityStatus } from "@/types/pms";

export const AVAILABILITY_STATUS_LABEL: Record<AvailabilityStatus, string> = {
  open: "Open",
  closed: "Closed",
};

export const RESTRICTION_LABEL: Record<AvailabilityRestriction, string> = {
  stop_sell: "Stop Sell",
  cta: "CTA",
  ctd: "CTD",
};

export const RESTRICTIONS: AvailabilityRestriction[] = ["stop_sell", "cta", "ctd"];
