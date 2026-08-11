import type { RatePlanCategory, RatePlanSyncStatus } from "@/types/pms";

export const ROOM_TYPE_OPTIONS = [
  { id: "rt-deluxe-king", code: "DLX-KING", name: "Deluxe King" },
  { id: "rt-deluxe-twin", code: "DLX-TWIN", name: "Deluxe Twin" },
  { id: "rt-premier-suite", code: "PRM-SUITE", name: "Premier Suite" },
  { id: "rt-executive", code: "EXEC", name: "Executive" },
  { id: "rt-heritage-suite", code: "HTG-SUITE", name: "Heritage Suite" },
] as const;

export const RATE_PLAN_CATEGORY_LABEL: Record<RatePlanCategory, string> = {
  bar: "BAR",
  corporate: "Corporate",
  package: "Package",
  seasonal: "Seasonal",
  non_refundable: "Non-refundable",
  member: "Member / Loyalty",
  promotional: "Promotional",
};

export const RATE_PLAN_CATEGORIES = Object.keys(RATE_PLAN_CATEGORY_LABEL) as RatePlanCategory[];

export const MEAL_PLAN_CODES = ["EP", "CP", "MAP", "AP", "AI", "UAI"] as const;

export const MEAL_PLAN_LABEL: Record<(typeof MEAL_PLAN_CODES)[number], string> = {
  EP: "Room only",
  CP: "Breakfast incl.",
  MAP: "Half board",
  AP: "Full board",
  AI: "All inclusive",
  UAI: "Ultra all inclusive",
};

export const SYNC_STATUS_LABEL: Record<RatePlanSyncStatus, string> = {
  not_synced: "Not synced",
  pending: "Pending",
  synced: "Synced",
  error: "Error",
};

export const EDITOR_TABS = [
  "General",
  "Pricing",
  "Restrictions",
  "Policies",
  "Room & meal",
  "Channels",
  "History",
] as const;

export type EditorTab = (typeof EDITOR_TABS)[number];
