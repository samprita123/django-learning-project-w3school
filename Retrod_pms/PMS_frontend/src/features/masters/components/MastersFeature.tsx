import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Download,
  Filter,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PencilLine,
  FileUp,
  FileDown,
  Clock3,
} from "lucide-react";
import {
  PageHeader,
  Button,
  Card,
  CardHeader,
  StatusBadge,
  KpiCard,
} from "@/components/ui/Primitives";
import { RATE_PLAN_CATEGORY_LABEL } from "@/features/rate-plans/lib/constants";
import { TAX_COMPONENT_TYPE_LABEL } from "@/features/taxes-fees/lib/constants";
import { useRatePlansQuery, useTaxComponentsQuery } from "@/services/mock/queries";

type MasterScope = "Global" | "Tenant" | "Property";
type MasterPriority = "P1" | "P2" | "P3";
type MasterStatus = "Active" | "Inactive" | "Draft";

type MasterField = {
  name: string;
  type: string;
  required: boolean;
  description: string;
};

type MasterDependency = {
  module: string;
  screen: string;
  field: string;
};

type MasterRecord = {
  id: string;
  code: string;
  name: string;
  status: MasterStatus;
  effectiveFrom: string;
  effectiveTo?: string;
  updatedAt: string;
  updatedBy: string;
  attributes?: Record<string, string>;
};

type MasterDefinition = {
  id: string;
  module: string;
  name: string;
  purpose: string;
  scope: MasterScope;
  priority: MasterPriority;
  operations: {
    create: boolean;
    view: boolean;
    edit: boolean;
    disable: boolean;
    search: boolean;
    filter: boolean;
    export: boolean;
    bulkUpload: boolean;
  };
  fields: MasterField[];
  dependencies: MasterDependency[];
  records: MasterRecord[];
};

type AuditEvent = {
  id: string;
  at: string;
  by: string;
  action: string;
  recordCode: string;
  detail: string;
};

type CatalogueTab = "all" | "p1" | "property" | "tenant";
type WorkspaceTab = "records" | "attributes" | "dependencies" | "audit";
type RecordFormMode = "create" | "edit";
type RecordSortField = "code" | "name" | "status" | "updatedAt";

type RecordFormState = {
  code: string;
  name: string;
  status: MasterStatus;
  effectiveFrom: string;
  effectiveTo: string;
  attributes: Record<string, string>;
};

type ModalState =
  | { type: "none" }
  | { type: "record-form"; mode: RecordFormMode }
  | { type: "confirm-impact"; action: "inactive" | "archive" }
  | { type: "bulk-import" }
  | { type: "export" }
  | { type: "advanced-filters" };

const MASTER_DEFINITIONS: MasterDefinition[] = [
  {
    id: "room-type",
    module: "Inventory Setup",
    name: "Room Type Master",
    purpose: "Defines all sellable room categories and occupancy/rate baseline.",
    scope: "Property",
    priority: "P1",
    operations: {
      create: true,
      view: true,
      edit: true,
      disable: true,
      search: true,
      filter: true,
      export: true,
      bulkUpload: true,
    },
    fields: [
      {
        name: "Room Type Code",
        type: "Text",
        required: true,
        description: "Unique room category code.",
      },
      {
        name: "Room Type Name",
        type: "Text",
        required: true,
        description: "Display name in PMS and channels.",
      },
      {
        name: "Max Occupancy",
        type: "Number",
        required: true,
        description: "Maximum adults/children occupancy.",
      },
      {
        name: "Base Rate",
        type: "Currency",
        required: true,
        description: "Default base nightly rate.",
      },
      {
        name: "Amenities",
        type: "Tags",
        required: false,
        description: "Amenity list for rooms and website.",
      },
      {
        name: "Status",
        type: "Status",
        required: true,
        description: "Active/Inactive lifecycle status.",
      },
    ],
    dependencies: [
      { module: "Reservation", screen: "New Reservation", field: "Room Type" },
      { module: "Front Desk", screen: "Check-In", field: "Assign Room by Type" },
      { module: "Channel Manager", screen: "Room Mapping", field: "PMS Room Type" },
      { module: "Revenue", screen: "Revenue Dashboard", field: "Occupancy by Room Type" },
    ],
    records: [
      {
        id: "rt-1",
        code: "STD",
        name: "Standard Room",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-24 09:12",
        updatedBy: "System Admin",
      },
      {
        id: "rt-2",
        code: "DLX",
        name: "Deluxe Room",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-26 12:45",
        updatedBy: "Revenue Manager",
      },
      {
        id: "rt-3",
        code: "STE",
        name: "Suite",
        status: "Inactive",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-09 16:21",
        updatedBy: "Front Office Manager",
      },
    ],
  },
  {
    id: "meal-plan",
    module: "Revenue Management",
    name: "Meal Plan Master",
    purpose: "Defines EP/CP/MAP/AP/AI/UAI inclusions and pricing adjustments.",
    scope: "Property",
    priority: "P1",
    operations: {
      create: true,
      view: true,
      edit: true,
      disable: true,
      search: true,
      filter: true,
      export: true,
      bulkUpload: true,
    },
    fields: [
      { name: "Meal Plan Code", type: "Code", required: true, description: "EP/CP/MAP/AP/AI/UAI." },
      {
        name: "Meal Plan Name",
        type: "Text",
        required: true,
        description: "Display label for rates.",
      },
      {
        name: "Included Meals",
        type: "Text",
        required: true,
        description: "Breakfast/Lunch/Dinner inclusions.",
      },
      {
        name: "Price Adjustment",
        type: "Currency",
        required: true,
        description: "Additional nightly cost.",
      },
      { name: "Tax Group", type: "Lookup", required: true, description: "Mapped tax profile." },
      { name: "Status", type: "Status", required: true, description: "Publish state." },
    ],
    dependencies: [
      { module: "Reservation", screen: "New Reservation", field: "Meal Plan" },
      { module: "Channel Manager", screen: "Rate Plan Mapping", field: "Meal Plan" },
      { module: "Reports", screen: "Revenue by Meal Plan", field: "Meal Plan Dimension" },
    ],
    records: [
      {
        id: "mp-1",
        code: "EP",
        name: "European Plan",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-21 10:05",
        updatedBy: "Revenue Manager",
      },
      {
        id: "mp-2",
        code: "CP",
        name: "Continental Plan",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-22 15:44",
        updatedBy: "Revenue Manager",
      },
      {
        id: "mp-3",
        code: "MAP",
        name: "Modified American Plan",
        status: "Draft",
        effectiveFrom: "2026-07-01",
        updatedAt: "2026-05-31 11:32",
        updatedBy: "Product Ops",
      },
    ],
  },
  {
    id: "rate-plan",
    module: "Revenue Management",
    name: "Rate Plan Master",
    purpose:
      "Schema reference only — operational rate plan records are managed in the Rate Plans module.",
    scope: "Property",
    priority: "P1",
    operations: {
      create: true,
      view: true,
      edit: true,
      disable: true,
      search: true,
      filter: true,
      export: true,
      bulkUpload: true,
    },
    fields: [
      { name: "Rate Plan Code", type: "Code", required: true, description: "Unique plan code." },
      {
        name: "Rate Plan Name",
        type: "Text",
        required: true,
        description: "Flexible/Corporate/NRF etc.",
      },
      {
        name: "Discount %",
        type: "Percentage",
        required: true,
        description: "Plan-level discount or uplift.",
      },
      {
        name: "Policy",
        type: "Lookup",
        required: true,
        description: "Cancellation/refund policy.",
      },
      { name: "Min Stay", type: "Number", required: true, description: "Minimum nights rule." },
      { name: "Max Stay", type: "Number", required: true, description: "Maximum nights rule." },
      { name: "Status", type: "Status", required: true, description: "Rate plan availability." },
    ],
    dependencies: [
      { module: "Reservation", screen: "New Reservation", field: "Rate Plan" },
      { module: "Booking Engine", screen: "Direct Booking Offers", field: "Rate Plan Eligibility" },
      { module: "Channel Manager", screen: "Rate Plan Mapping", field: "PMS Rate Plan" },
    ],
    records: [
      {
        id: "rp-1",
        code: "FLEX",
        name: "Flexible Rate",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-15 14:18",
        updatedBy: "Revenue Manager",
      },
      {
        id: "rp-2",
        code: "CORP",
        name: "Corporate Rate",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-29 10:24",
        updatedBy: "Sales Head",
      },
      {
        id: "rp-3",
        code: "NRF",
        name: "Non Refundable",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-25 08:10",
        updatedBy: "Revenue Manager",
      },
    ],
  },
  {
    id: "payment-method",
    module: "Finance Configuration",
    name: "Payment Method Master",
    purpose: "Defines allowed tenders and gateway-backed payment methods.",
    scope: "Property",
    priority: "P1",
    operations: {
      create: true,
      view: true,
      edit: true,
      disable: true,
      search: true,
      filter: true,
      export: true,
      bulkUpload: false,
    },
    fields: [
      { name: "Method Code", type: "Code", required: true, description: "Short tender code." },
      { name: "Method Name", type: "Text", required: true, description: "Cash/Card/UPI/etc." },
      {
        name: "Gateway",
        type: "Lookup",
        required: false,
        description: "Optional payment gateway mapping.",
      },
      {
        name: "Online Enabled",
        type: "Boolean",
        required: true,
        description: "Available in online flow.",
      },
      {
        name: "Refund Rule",
        type: "Text",
        required: false,
        description: "Default refund behavior.",
      },
      { name: "Status", type: "Status", required: true, description: "Tender availability." },
    ],
    dependencies: [
      { module: "Reservation", screen: "Walk-in Booking", field: "Payment Method" },
      { module: "Front Desk", screen: "Check-In Payment", field: "Tender Selection" },
      { module: "Billing", screen: "Payment Posting", field: "Tender" },
    ],
    records: [
      {
        id: "pm-1",
        code: "CASH",
        name: "Cash",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-12 09:40",
        updatedBy: "Finance Admin",
      },
      {
        id: "pm-2",
        code: "CARD",
        name: "Card",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-12 09:42",
        updatedBy: "Finance Admin",
      },
      {
        id: "pm-3",
        code: "UPI",
        name: "UPI",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-22 12:19",
        updatedBy: "Finance Admin",
      },
    ],
  },
  {
    id: "booking-source",
    module: "Channel Management",
    name: "Booking Source Master",
    purpose: "Controls reservation source/channel values for PMS and reporting.",
    scope: "Tenant",
    priority: "P1",
    operations: {
      create: true,
      view: true,
      edit: true,
      disable: true,
      search: true,
      filter: true,
      export: true,
      bulkUpload: true,
    },
    fields: [
      {
        name: "Source Code",
        type: "Code",
        required: true,
        description: "Unique source identifier.",
      },
      { name: "Source Name", type: "Text", required: true, description: "Booking.com/Direct/etc." },
      {
        name: "Channel Type",
        type: "Lookup",
        required: true,
        description: "OTA, Direct, Corporate, GDS.",
      },
      {
        name: "Commission %",
        type: "Percentage",
        required: false,
        description: "Default commission hint.",
      },
      { name: "Status", type: "Status", required: true, description: "Source availability." },
    ],
    dependencies: [
      { module: "Reservation", screen: "New Reservation", field: "Source" },
      { module: "Reservations", screen: "Reservation Table", field: "Source Legend" },
      { module: "Reports", screen: "OTA Performance", field: "Source Dimension" },
      { module: "Channel Manager", screen: "Connections", field: "Channel Registry" },
    ],
    records: [
      {
        id: "bs-1",
        code: "DIR",
        name: "Direct",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-20 09:55",
        updatedBy: "Distribution Manager",
      },
      {
        id: "bs-2",
        code: "BKG",
        name: "Booking.com",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-20 10:01",
        updatedBy: "Distribution Manager",
      },
      {
        id: "bs-3",
        code: "EXP",
        name: "Expedia",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-20 10:06",
        updatedBy: "Distribution Manager",
      },
    ],
  },
  {
    id: "corporate-account",
    module: "Guest & Commercial",
    name: "Corporate Account Master",
    purpose: "Maintains corporate entities, negotiated contracts, and rate eligibility.",
    scope: "Tenant",
    priority: "P2",
    operations: {
      create: true,
      view: true,
      edit: true,
      disable: true,
      search: true,
      filter: true,
      export: true,
      bulkUpload: true,
    },
    fields: [
      { name: "Account Code", type: "Code", required: true, description: "Corporate account ID." },
      {
        name: "Company Name",
        type: "Text",
        required: true,
        description: "Company legal/display name.",
      },
      {
        name: "Rate Plan",
        type: "Lookup",
        required: true,
        description: "Default negotiated rate plan.",
      },
      {
        name: "Credit Terms",
        type: "Text",
        required: false,
        description: "Billing and settlement terms.",
      },
      {
        name: "Contact Person",
        type: "Text",
        required: false,
        description: "Primary coordinator.",
      },
      { name: "Status", type: "Status", required: true, description: "Account active/inactive." },
    ],
    dependencies: [
      { module: "Reservations", screen: "Corporate Booking", field: "Corporate Company" },
      { module: "Billing", screen: "City Ledger Transfer", field: "Corporate Account" },
      { module: "Reports", screen: "Corporate Revenue", field: "Corporate Dimension" },
    ],
    records: [
      {
        id: "ca-1",
        code: "INFY",
        name: "Infosys Ltd",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-30 11:20",
        updatedBy: "Sales Head",
      },
      {
        id: "ca-2",
        code: "TCS",
        name: "Tata Consultancy",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-30 11:22",
        updatedBy: "Sales Head",
      },
      {
        id: "ca-3",
        code: "DELOITTE",
        name: "Deloitte India",
        status: "Inactive",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-10 09:10",
        updatedBy: "Sales Head",
      },
    ],
  },
  {
    id: "package-master",
    module: "Revenue Management",
    name: "Package Master",
    purpose: "Defines bundled room + meal + service offerings sold in reservation flow.",
    scope: "Property",
    priority: "P1",
    operations: {
      create: true,
      view: true,
      edit: true,
      disable: true,
      search: true,
      filter: true,
      export: true,
      bulkUpload: true,
    },
    fields: [
      { name: "Package Code", type: "Code", required: true, description: "Unique package code." },
      {
        name: "Package Name",
        type: "Text",
        required: true,
        description: "Display package name for booking.",
      },
      {
        name: "Included Components",
        type: "Tags",
        required: true,
        description: "Room/meal/service inclusions.",
      },
      {
        name: "Pricing Model",
        type: "Lookup",
        required: true,
        description: "Fixed / Per Day / Per Guest.",
      },
      {
        name: "Price",
        type: "Currency",
        required: true,
        description: "Package price or uplift amount.",
      },
      { name: "Status", type: "Status", required: true, description: "Sellability state." },
    ],
    dependencies: [
      { module: "Reservation", screen: "New Reservation", field: "Package Selection" },
      { module: "Booking Engine", screen: "Packages", field: "Offer List" },
      { module: "Reports", screen: "Package Revenue", field: "Package Dimension" },
    ],
    records: [
      {
        id: "pkg-1",
        code: "HNYM",
        name: "Honeymoon Package",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-29 10:40",
        updatedBy: "Revenue Manager",
      },
      {
        id: "pkg-2",
        code: "WKND",
        name: "Weekend Getaway",
        status: "Draft",
        effectiveFrom: "2026-07-01",
        updatedAt: "2026-06-01 08:15",
        updatedBy: "Revenue Manager",
      },
    ],
  },
  {
    id: "addon-service",
    module: "Revenue Management",
    name: "Add-On Service Master",
    purpose: "Controls optional chargeable add-ons at reservation and folio level.",
    scope: "Property",
    priority: "P1",
    operations: {
      create: true,
      view: true,
      edit: true,
      disable: true,
      search: true,
      filter: true,
      export: true,
      bulkUpload: true,
    },
    fields: [
      { name: "Service Code", type: "Code", required: true, description: "Unique add-on code." },
      { name: "Service Name", type: "Text", required: true, description: "Display service name." },
      {
        name: "Charge Type",
        type: "Lookup",
        required: true,
        description: "Fixed / Percentage / Per Day / Per Guest.",
      },
      {
        name: "Base Charge",
        type: "Currency",
        required: true,
        description: "Default charge amount.",
      },
      {
        name: "Tax Group",
        type: "Lookup",
        required: true,
        description: "Mapped tax profile for service.",
      },
      { name: "Status", type: "Status", required: true, description: "Service availability." },
    ],
    dependencies: [
      { module: "Reservation", screen: "New Reservation", field: "Add-On Services" },
      { module: "Billing", screen: "Folio Posting", field: "Add-On Charges" },
      { module: "Reports", screen: "Add-On Revenue", field: "Service Dimension" },
    ],
    records: [
      {
        id: "ao-1",
        code: "AIRPICK",
        name: "Airport Pickup",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-28 11:11",
        updatedBy: "Front Office Manager",
      },
      {
        id: "ao-2",
        code: "EXBED",
        name: "Extra Bed",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-28 11:15",
        updatedBy: "Front Office Manager",
      },
    ],
  },
  {
    id: "tax-group",
    module: "Finance Configuration",
    name: "Tax Group Master",
    purpose: "Defines GST/VAT/city tax groups used by rates, packages, and folio charges.",
    scope: "Tenant",
    priority: "P1",
    operations: {
      create: true,
      view: true,
      edit: true,
      disable: true,
      search: true,
      filter: true,
      export: true,
      bulkUpload: false,
    },
    fields: [
      {
        name: "Tax Group Code",
        type: "Code",
        required: true,
        description: "Unique tax profile code.",
      },
      {
        name: "Tax Group Name",
        type: "Text",
        required: true,
        description: "Display tax profile name.",
      },
      {
        name: "Tax Type",
        type: "Lookup",
        required: true,
        description: "GST / VAT / City Tax / Service Charge.",
      },
      {
        name: "Rate %",
        type: "Percentage",
        required: true,
        description: "Applicable tax percentage.",
      },
      {
        name: "Inclusive",
        type: "Boolean",
        required: true,
        description: "Tax inclusive or exclusive.",
      },
      { name: "Status", type: "Status", required: true, description: "Tax applicability state." },
    ],
    dependencies: [
      { module: "Reservation", screen: "Pricing Review", field: "Tax Breakdown" },
      { module: "Billing", screen: "Invoice", field: "Tax Components" },
      { module: "Masters", screen: "Meal Plan/Rate/Add-On", field: "Tax Group Lookup" },
    ],
    records: [
      {
        id: "tax-1",
        code: "GST12",
        name: "GST 12%",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-23 09:30",
        updatedBy: "Finance Admin",
      },
      {
        id: "tax-2",
        code: "GST18",
        name: "GST 18%",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-23 09:32",
        updatedBy: "Finance Admin",
      },
    ],
  },
  {
    id: "market-segment",
    module: "Guest & Commercial",
    name: "Market Segment Master",
    purpose: "Standardizes booking demand segments for pricing and performance analytics.",
    scope: "Tenant",
    priority: "P2",
    operations: {
      create: true,
      view: true,
      edit: true,
      disable: true,
      search: true,
      filter: true,
      export: true,
      bulkUpload: true,
    },
    fields: [
      {
        name: "Segment Code",
        type: "Code",
        required: true,
        description: "Unique market segment code.",
      },
      {
        name: "Segment Name",
        type: "Text",
        required: true,
        description: "Corporate / Leisure / Group etc.",
      },
      {
        name: "Channel Type",
        type: "Lookup",
        required: false,
        description: "Linked dominant booking channel.",
      },
      {
        name: "Description",
        type: "Text",
        required: false,
        description: "Business note and usage intent.",
      },
      { name: "Status", type: "Status", required: true, description: "Availability state." },
    ],
    dependencies: [
      { module: "Reservation", screen: "New Reservation", field: "Market Segment" },
      { module: "Revenue", screen: "Demand Analytics", field: "Segment Insights" },
      { module: "Reports", screen: "Segment Performance", field: "Segment Dimension" },
    ],
    records: [
      {
        id: "ms-1",
        code: "CORP",
        name: "Corporate",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-27 14:00",
        updatedBy: "Sales Head",
      },
      {
        id: "ms-2",
        code: "LEIS",
        name: "Leisure",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-27 14:02",
        updatedBy: "Sales Head",
      },
    ],
  },
  {
    id: "cancellation-reason",
    module: "Reservation Settings",
    name: "Cancellation Reason Master",
    purpose: "Captures standardized cancellation reasons for audit and revenue leakage analysis.",
    scope: "Tenant",
    priority: "P2",
    operations: {
      create: true,
      view: true,
      edit: true,
      disable: true,
      search: true,
      filter: true,
      export: true,
      bulkUpload: false,
    },
    fields: [
      {
        name: "Reason Code",
        type: "Code",
        required: true,
        description: "Unique cancellation reason code.",
      },
      {
        name: "Reason Name",
        type: "Text",
        required: true,
        description: "Display cancellation reason.",
      },
      {
        name: "Category",
        type: "Lookup",
        required: false,
        description: "Price / Guest / Operational / Other.",
      },
      {
        name: "Refund Eligible",
        type: "Boolean",
        required: true,
        description: "Default refund handling guidance.",
      },
      { name: "Status", type: "Status", required: true, description: "Reason usability." },
    ],
    dependencies: [
      { module: "Reservation", screen: "Cancel Reservation", field: "Cancellation Reason" },
      { module: "Reports", screen: "Cancellation Analysis", field: "Reason Dimension" },
    ],
    records: [
      {
        id: "cr-1",
        code: "PLANCHG",
        name: "Plan Changed",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-25 12:02",
        updatedBy: "Front Office Manager",
      },
      {
        id: "cr-2",
        code: "PRICE",
        name: "Price Concern",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-25 12:05",
        updatedBy: "Front Office Manager",
      },
    ],
  },
  {
    id: "guest-category",
    module: "Guest Management",
    name: "Guest Category Master",
    purpose: "Defines guest tiers and VIP categories used in CRM and service personalization.",
    scope: "Tenant",
    priority: "P2",
    operations: {
      create: true,
      view: true,
      edit: true,
      disable: true,
      search: true,
      filter: true,
      export: true,
      bulkUpload: true,
    },
    fields: [
      {
        name: "Category Code",
        type: "Code",
        required: true,
        description: "Unique guest category code.",
      },
      {
        name: "Category Name",
        type: "Text",
        required: true,
        description: "VIP / Loyalty / Corporate / Regular.",
      },
      {
        name: "Benefit Profile",
        type: "Lookup",
        required: false,
        description: "Mapped benefit entitlements.",
      },
      {
        name: "Priority Level",
        type: "Number",
        required: false,
        description: "Service escalation rank.",
      },
      { name: "Status", type: "Status", required: true, description: "Category availability." },
    ],
    dependencies: [
      { module: "Guests", screen: "Guest Profile", field: "Guest Category" },
      { module: "Reservation", screen: "New Reservation", field: "Guest Tagging" },
      { module: "CRM", screen: "Segmentation", field: "Guest Category" },
    ],
    records: [
      {
        id: "gc-1",
        code: "VIP",
        name: "VIP Guest",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-26 17:12",
        updatedBy: "CRM Manager",
      },
      {
        id: "gc-2",
        code: "REG",
        name: "Regular Guest",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-26 17:14",
        updatedBy: "CRM Manager",
      },
    ],
  },
  {
    id: "room-status-reason",
    module: "Housekeeping Configuration",
    name: "Room Status Reason Master",
    purpose: "Defines OOO/OOS/maintenance reasons to standardize room downtime handling.",
    scope: "Property",
    priority: "P2",
    operations: {
      create: true,
      view: true,
      edit: true,
      disable: true,
      search: true,
      filter: true,
      export: true,
      bulkUpload: false,
    },
    fields: [
      { name: "Reason Code", type: "Code", required: true, description: "Unique reason code." },
      { name: "Reason Name", type: "Text", required: true, description: "Display reason label." },
      {
        name: "Status Type",
        type: "Lookup",
        required: true,
        description: "OOO / OOS / Maintenance.",
      },
      {
        name: "Default ETA (hrs)",
        type: "Number",
        required: false,
        description: "Expected return-to-service duration.",
      },
      { name: "Status", type: "Status", required: true, description: "Reason usability." },
    ],
    dependencies: [
      { module: "Housekeeping", screen: "Room Status", field: "Mark OOO/OOS Reason" },
      { module: "Maintenance", screen: "Work Order", field: "Maintenance Cause" },
      { module: "Reports", screen: "Room Downtime", field: "Reason Dimension" },
    ],
    records: [
      {
        id: "rsr-1",
        code: "PLUMB",
        name: "Plumbing Issue",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-19 13:20",
        updatedBy: "HK Supervisor",
      },
      {
        id: "rsr-2",
        code: "DEEPCLN",
        name: "Deep Cleaning",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-19 13:24",
        updatedBy: "HK Supervisor",
      },
    ],
  },
  {
    id: "department-master",
    module: "Administration",
    name: "Department Master",
    purpose:
      "Central department list used for tasks, approvals, staffing, and reporting ownership.",
    scope: "Tenant",
    priority: "P2",
    operations: {
      create: true,
      view: true,
      edit: true,
      disable: true,
      search: true,
      filter: true,
      export: true,
      bulkUpload: true,
    },
    fields: [
      {
        name: "Department Code",
        type: "Code",
        required: true,
        description: "Unique department code.",
      },
      {
        name: "Department Name",
        type: "Text",
        required: true,
        description: "Display department name.",
      },
      {
        name: "Cost Center",
        type: "Text",
        required: false,
        description: "Finance cost center mapping.",
      },
      { name: "Head of Department", type: "Lookup", required: false, description: "Current HoD." },
      {
        name: "Status",
        type: "Status",
        required: true,
        description: "Department active/inactive state.",
      },
    ],
    dependencies: [
      { module: "Tasks", screen: "Task Management", field: "Department" },
      { module: "Users", screen: "User Profile", field: "Department" },
      { module: "Reports", screen: "Department KPI", field: "Department Dimension" },
    ],
    records: [
      {
        id: "dep-1",
        code: "FO",
        name: "Front Office",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-18 09:08",
        updatedBy: "System Admin",
      },
      {
        id: "dep-2",
        code: "HK",
        name: "Housekeeping",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-18 09:12",
        updatedBy: "System Admin",
      },
      {
        id: "dep-3",
        code: "REV",
        name: "Revenue",
        status: "Active",
        effectiveFrom: "2026-01-01",
        updatedAt: "2026-05-18 09:14",
        updatedBy: "System Admin",
      },
    ],
  },
];

const priorityTone: Record<MasterPriority, "error" | "warning" | "info"> = {
  P1: "error",
  P2: "warning",
  P3: "info",
};

const statusTone: Record<MasterStatus, "success" | "neutral" | "warning"> = {
  Active: "success",
  Inactive: "neutral",
  Draft: "warning",
};

export function MastersFeature() {
  const { data: steadyRatePlans = [] } = useRatePlansQuery();
  const { data: steadyTaxComponents = [] } = useTaxComponentsQuery();
  const [masters, setMasters] = useState<MasterDefinition[]>(MASTER_DEFINITIONS);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([
    {
      id: "ae-1",
      at: "2026-05-30 11:20",
      by: "Sales Head",
      action: "Updated",
      recordCode: "INFY",
      detail: "Credit terms refreshed for FY contract.",
    },
    {
      id: "ae-2",
      at: "2026-05-31 11:32",
      by: "Product Ops",
      action: "Created Draft",
      recordCode: "MAP",
      detail: "Meal plan staged for monsoon campaign.",
    },
  ]);
  const [moduleFilter, setModuleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<MasterStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [catalogueTab, setCatalogueTab] = useState<CatalogueTab>("all");
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("records");
  const [selectedMasterId, setSelectedMasterId] = useState(MASTER_DEFINITIONS[0]?.id ?? "");
  const [selectedRecordId, setSelectedRecordId] = useState<string>("");
  const [draftRecord, setDraftRecord] = useState<MasterRecord | null>(null);
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [recordForm, setRecordForm] = useState<RecordFormState>({
    code: "",
    name: "",
    status: "Draft",
    effectiveFrom: todayAsInput(),
    effectiveTo: "",
    attributes: {},
  });
  const [recordFormDirty, setRecordFormDirty] = useState(false);
  const [inlineDirty, setInlineDirty] = useState(false);
  const [recordSearch, setRecordSearch] = useState("");
  const [sortField, setSortField] = useState<RecordSortField>("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [updatedByFilter, setUpdatedByFilter] = useState<string>("All");
  const [updatedDateFrom, setUpdatedDateFrom] = useState("");
  const [updatedDateTo, setUpdatedDateTo] = useState("");
  const [includeNoDependencyMasters, setIncludeNoDependencyMasters] = useState(true);

  const modules = useMemo(
    () => ["All", ...Array.from(new Set(masters.map((master) => master.module)))],
    [masters],
  );

  const filteredMasters = useMemo<MasterDefinition[]>(() => {
    const q = search.trim().toLowerCase();
    return masters.filter((master) => {
      if (catalogueTab === "p1" && master.priority !== "P1") return false;
      if (catalogueTab === "property" && master.scope !== "Property") return false;
      if (catalogueTab === "tenant" && master.scope !== "Tenant") return false;
      if (!includeNoDependencyMasters && master.dependencies.length === 0) return false;
      if (moduleFilter !== "All" && master.module !== moduleFilter) return false;
      if (
        statusFilter !== "All" &&
        !master.records.some((record) => record.status === statusFilter)
      )
        return false;
      if (!q) return true;
      const haystack = `${master.module} ${master.name} ${master.purpose}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [catalogueTab, includeNoDependencyMasters, masters, moduleFilter, search, statusFilter]);

  const selectedMaster =
    filteredMasters.find((master) => master.id === selectedMasterId) ?? filteredMasters[0] ?? null;
  const isRatePlanDelegated = selectedMaster?.id === "rate-plan";
  const isTaxGroupDelegated = selectedMaster?.id === "tax-group";

  const selectedRecord =
    selectedMaster?.records.find((record) => record.id === selectedRecordId) ??
    selectedMaster?.records[0] ??
    null;

  useEffect(() => {
    if (!selectedMaster) return;
    if (!selectedRecord || selectedRecord.id !== selectedRecordId) {
      const firstId = selectedMaster.records[0]?.id ?? "";
      setSelectedRecordId(firstId);
    }
  }, [selectedMaster, selectedRecord, selectedRecordId]);

  useEffect(() => {
    setDraftRecord(selectedRecord ?? null);
    setInlineDirty(false);
  }, [selectedRecord?.id]);

  useEffect(() => {
    setPageIndex(0);
  }, [selectedMaster?.id, recordSearch, sortField, sortDirection, pageSize]);

  const totalMasters = masters.length;
  const p1Masters = masters.filter((master) => master.priority === "P1").length;
  const totalFields = masters.reduce((sum, master) => sum + master.fields.length, 0);
  const totalDependencies = masters.reduce((sum, master) => sum + master.dependencies.length, 0);

  const selectedMasterAudit = useMemo(
    () =>
      selectedMaster
        ? auditEvents.filter((event) =>
            selectedMaster.records.some((record) => record.code === event.recordCode),
          )
        : [],
    [auditEvents, selectedMaster],
  );

  const updatedByOptions = useMemo(() => {
    if (!selectedMaster) return ["All"];
    return [
      "All",
      ...Array.from(new Set(selectedMaster.records.map((record) => record.updatedBy))),
    ];
  }, [selectedMaster]);

  const filteredAndSortedRecords = useMemo(() => {
    if (!selectedMaster) return [];

    const q = recordSearch.trim().toLowerCase();
    const dateFrom = updatedDateFrom.trim();
    const dateTo = updatedDateTo.trim();

    const records = selectedMaster.records.filter((record) => {
      if (q) {
        const haystack =
          `${record.code} ${record.name} ${record.status} ${record.updatedBy}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (updatedByFilter !== "All" && record.updatedBy !== updatedByFilter) return false;
      if (dateFrom && record.updatedAt.slice(0, 10) < dateFrom) return false;
      if (dateTo && record.updatedAt.slice(0, 10) > dateTo) return false;
      return true;
    });

    return [...records].sort((a, b) => {
      const aa = String(a[sortField] ?? "");
      const bb = String(b[sortField] ?? "");
      const cmp = aa.localeCompare(bb);
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [
    recordSearch,
    selectedMaster,
    sortDirection,
    sortField,
    updatedByFilter,
    updatedDateFrom,
    updatedDateTo,
  ]);

  const pageCount = Math.max(1, Math.ceil(filteredAndSortedRecords.length / pageSize));
  const pageRecords = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredAndSortedRecords.slice(start, start + pageSize);
  }, [filteredAndSortedRecords, pageIndex, pageSize]);

  useEffect(() => {
    setPageIndex((prev) => {
      const maxIndex = Math.max(0, Math.ceil(filteredAndSortedRecords.length / pageSize) - 1);
      return Math.min(prev, maxIndex);
    });
  }, [filteredAndSortedRecords.length, pageSize]);

  function openRecordForm(mode: RecordFormMode) {
    if (!selectedMaster) return;
    const dynamicFields = getDynamicFields(selectedMaster);
    const dynamicDefaults = Object.fromEntries(dynamicFields.map((field) => [field.name, ""]));

    if (mode === "edit" && selectedRecord) {
      setRecordForm({
        code: selectedRecord.code,
        name: selectedRecord.name,
        status: selectedRecord.status,
        effectiveFrom: selectedRecord.effectiveFrom,
        effectiveTo: selectedRecord.effectiveTo ?? "",
        attributes: {
          ...dynamicDefaults,
          ...(selectedRecord.attributes ?? {}),
        },
      });
    } else {
      setRecordForm({
        code: "",
        name: "",
        status: "Draft",
        effectiveFrom: todayAsInput(),
        effectiveTo: "",
        attributes: dynamicDefaults,
      });
    }

    setModal({ type: "record-form", mode });
    setRecordFormDirty(false);
  }

  function saveRecordForm() {
    if (!selectedMaster) return;
    const trimmedCode = recordForm.code.trim();
    const trimmedName = recordForm.name.trim();
    if (!trimmedCode || !trimmedName) return;

    setMasters((prev) =>
      prev.map((master) => {
        if (master.id !== selectedMaster.id) return master;

        if (modal.type === "record-form" && modal.mode === "edit" && selectedRecord) {
          return {
            ...master,
            records: master.records.map((record) =>
              record.id === selectedRecord.id
                ? {
                    ...record,
                    code: trimmedCode,
                    name: trimmedName,
                    status: recordForm.status,
                    effectiveFrom: recordForm.effectiveFrom,
                    effectiveTo: recordForm.effectiveTo || undefined,
                    attributes: recordForm.attributes,
                    updatedAt: nowStamp(),
                    updatedBy: "Current User",
                  }
                : record,
            ),
          };
        }

        const newRecord: MasterRecord = {
          id: `${master.id}-${Date.now()}`,
          code: trimmedCode,
          name: trimmedName,
          status: recordForm.status,
          effectiveFrom: recordForm.effectiveFrom,
          effectiveTo: recordForm.effectiveTo || undefined,
          attributes: recordForm.attributes,
          updatedAt: nowStamp(),
          updatedBy: "Current User",
        };
        setSelectedRecordId(newRecord.id);
        return { ...master, records: [newRecord, ...master.records] };
      }),
    );

    setAuditEvents((prev) => [
      {
        id: `ae-${Date.now()}`,
        at: nowStamp(),
        by: "Current User",
        action: modal.type === "record-form" && modal.mode === "edit" ? "Updated" : "Created",
        recordCode: trimmedCode,
        detail:
          modal.type === "record-form" && modal.mode === "edit"
            ? "Record details modified."
            : "New master record created.",
      },
      ...prev,
    ]);

    setModal({ type: "none" });
    setRecordFormDirty(false);
  }

  function saveInlineRecord() {
    if (!selectedMaster || !draftRecord) return;
    setMasters((prev) =>
      prev.map((master) =>
        master.id === selectedMaster.id
          ? {
              ...master,
              records: master.records.map((record) =>
                record.id === draftRecord.id
                  ? { ...draftRecord, updatedAt: nowStamp(), updatedBy: "Current User" }
                  : record,
              ),
            }
          : master,
      ),
    );

    setAuditEvents((prev) => [
      {
        id: `ae-${Date.now()}`,
        at: nowStamp(),
        by: "Current User",
        action: "Saved",
        recordCode: draftRecord.code,
        detail: "Inline changes saved.",
      },
      ...prev,
    ]);
    setInlineDirty(false);
  }

  function confirmImpactAction() {
    if (!selectedMaster || !selectedRecord || modal.type !== "confirm-impact") return;

    if (modal.action === "inactive") {
      setMasters((prev) =>
        prev.map((master) =>
          master.id === selectedMaster.id
            ? {
                ...master,
                records: master.records.map((record) =>
                  record.id === selectedRecord.id
                    ? {
                        ...record,
                        status: "Inactive",
                        updatedAt: nowStamp(),
                        updatedBy: "Current User",
                      }
                    : record,
                ),
              }
            : master,
        ),
      );
      setAuditEvents((prev) => [
        {
          id: `ae-${Date.now()}`,
          at: nowStamp(),
          by: "Current User",
          action: "Set Inactive",
          recordCode: selectedRecord.code,
          detail: `${selectedMaster.dependencies.length} dependency points reviewed.`,
        },
        ...prev,
      ]);
    } else {
      setMasters((prev) =>
        prev.map((master) =>
          master.id === selectedMaster.id
            ? {
                ...master,
                records: master.records.filter((record) => record.id !== selectedRecord.id),
              }
            : master,
        ),
      );
      setSelectedRecordId("");
      setAuditEvents((prev) => [
        {
          id: `ae-${Date.now()}`,
          at: nowStamp(),
          by: "Current User",
          action: "Archived",
          recordCode: selectedRecord.code,
          detail: "Record removed from active catalogue.",
        },
        ...prev,
      ]);
    }

    setModal({ type: "none" });
  }

  function closeModalWithGuard() {
    if (modal.type === "record-form" && recordFormDirty) {
      const shouldDiscard = window.confirm("You have unsaved form changes. Discard them?");
      if (!shouldDiscard) return;
      setRecordFormDirty(false);
    }
    setModal({ type: "none" });
  }

  function selectRecordWithGuard(recordId: string) {
    if (inlineDirty) {
      const shouldDiscard = window.confirm(
        "You have unsaved inline changes. Switch record and discard?",
      );
      if (!shouldDiscard) return;
      setInlineDirty(false);
    }
    setSelectedRecordId(recordId);
  }

  function changeSort(field: RecordSortField) {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDirection("asc");
  }

  function applyQuickCreatePreset(
    presetId: "active-standard" | "draft-future" | "inactive-legacy",
  ) {
    if (!selectedMaster) return;
    const nameBase = selectedMaster.name.replace(" Master", "");
    const presetMap = {
      "active-standard": {
        code: "NEW-ACTIVE",
        name: `${nameBase} Active`,
        status: "Active" as MasterStatus,
        effectiveFrom: todayAsInput(),
      },
      "draft-future": {
        code: "NEW-DRAFT",
        name: `${nameBase} Draft`,
        status: "Draft" as MasterStatus,
        effectiveFrom: todayAsInput(),
      },
      "inactive-legacy": {
        code: "LEGACY",
        name: `${nameBase} Legacy`,
        status: "Inactive" as MasterStatus,
        effectiveFrom: todayAsInput(),
      },
    };

    const preset = presetMap[presetId];
    const dynamicFields = getDynamicFields(selectedMaster);
    const dynamicDefaults = Object.fromEntries(dynamicFields.map((field) => [field.name, ""]));
    setRecordForm({
      code: preset.code,
      name: preset.name,
      status: preset.status,
      effectiveFrom: preset.effectiveFrom,
      effectiveTo: "",
      attributes: dynamicDefaults,
    });
    setRecordFormDirty(true);
    setModal({ type: "record-form", mode: "create" });
  }

  return (
    <div className="min-h-full bg-background">
      <PageHeader
        eyebrow="Administration"
        title="Master Data Management"
        description="Manage all PMS master entities, dropdown sources, status lifecycle, and dependency impact from a single control center."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setModal({ type: "bulk-import" })}>
              <FileUp className="h-3.5 w-3.5" />
              Bulk import
            </Button>
            <Button variant="outline" size="sm" onClick={() => setModal({ type: "export" })}>
              <FileDown className="h-3.5 w-3.5" />
              Export
            </Button>
            <Button
              size="sm"
              onClick={() => openRecordForm("create")}
              disabled={isRatePlanDelegated || isTaxGroupDelegated}
            >
              <Plus className="h-3.5 w-3.5" />
              Create master record
            </Button>
          </>
        }
      />

      <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <KpiCard label="Master Pages" value={String(totalMasters)} accent="brand" />
          <KpiCard label="P1 Masters" value={String(p1Masters)} accent="error" />
          <KpiCard label="Attributes" value={String(totalFields)} accent="info" />
          <KpiCard label="Dependencies" value={String(totalDependencies)} accent="warning" />
        </div>

        <Card>
          <CardHeader
            title="Master Catalogue"
            hint="Search, filter and select a master to manage records and attributes."
          />
          <div className="space-y-5 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2.5">
              {(
                [
                  ["all", "All Masters"],
                  ["p1", "Priority 1"],
                  ["property", "Property Scope"],
                  ["tenant", "Tenant Scope"],
                ] as Array<[CatalogueTab, string]>
              ).map(([tabId, label]) => (
                <button
                  key={tabId}
                  type="button"
                  onClick={() => setCatalogueTab(tabId)}
                  className={`rounded-md border px-3 py-1.5 text-[12px] transition ${
                    catalogueTab === tabId
                      ? "border-primary bg-primary-tint/40 text-primary"
                      : "border-border-subtle bg-surface text-text-secondary hover:bg-surface-2/70"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full flex-1 sm:min-w-[260px]">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-disabled" />
                <input
                  className="h-9 w-full rounded-md border border-border bg-surface pl-8 pr-3 text-[13px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  placeholder="Search master by module/name/purpose"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <select
                className="h-9 rounded-md border border-border bg-surface px-3 text-[12px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                value={moduleFilter}
                onChange={(event) => setModuleFilter(event.target.value)}
              >
                {modules.map((moduleName) => (
                  <option key={moduleName}>{moduleName}</option>
                ))}
              </select>
              <select
                className="h-9 rounded-md border border-border bg-surface px-3 text-[12px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as MasterStatus | "All")}
              >
                {(["All", "Active", "Inactive", "Draft"] as const).map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModal({ type: "advanced-filters" })}
              >
                <Filter className="h-3.5 w-3.5" />
                Advanced filters
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_1fr]">
              <div className="max-h-[690px] space-y-2 overflow-auto pr-1">
                {filteredMasters.map((master) => (
                  <button
                    key={master.id}
                    type="button"
                    onClick={() => {
                      setSelectedMasterId(master.id);
                      setSelectedRecordId("");
                      setWorkspaceTab("records");
                    }}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      selectedMaster?.id === master.id
                        ? "border-primary bg-primary-tint/40"
                        : "border-border-subtle bg-surface hover:bg-surface-2/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[12px] font-semibold text-text-primary">
                        {master.name}
                      </div>
                      <StatusBadge tone={priorityTone[master.priority]}>
                        {master.priority}
                      </StatusBadge>
                    </div>
                    <div className="mt-1 text-[11px] text-text-secondary">{master.module}</div>
                    <div className="mt-1 text-[11px] text-text-secondary">{master.scope} scope</div>
                  </button>
                ))}
              </div>

              {selectedMaster ? (
                <div className="space-y-4">
                  <Card className="border-border-subtle">
                    <CardHeader
                      title={selectedMaster.name}
                      hint={`${selectedMaster.module} · ${selectedMaster.scope} · ${selectedMaster.priority}`}
                    />
                    <div className="space-y-4 p-4 sm:p-5">
                      <div className="text-[12px] text-text-secondary">
                        {selectedMaster.purpose}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(
                          [
                            ["Create", selectedMaster.operations.create],
                            ["View", selectedMaster.operations.view],
                            ["Edit", selectedMaster.operations.edit],
                            ["Disable", selectedMaster.operations.disable],
                            ["Search", selectedMaster.operations.search],
                            ["Filter", selectedMaster.operations.filter],
                            ["Export", selectedMaster.operations.export],
                            ["Bulk Upload", selectedMaster.operations.bulkUpload],
                          ] as Array<[string, boolean]>
                        ).map(([label, enabled]) => (
                          <StatusBadge key={label} tone={enabled ? "success" : "neutral"}>
                            {label}
                          </StatusBadge>
                        ))}
                        {inlineDirty ? (
                          <StatusBadge tone="warning">Unsaved inline edits</StatusBadge>
                        ) : null}
                      </div>
                    </div>
                  </Card>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {(
                      [
                        ["records", "Records"],
                        ["attributes", "Attributes"],
                        ["dependencies", "Dependencies"],
                        ["audit", "Audit Trail"],
                      ] as Array<[WorkspaceTab, string]>
                    ).map(([tab, label]) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setWorkspaceTab(tab)}
                        className={`rounded-md border px-3 py-1.5 text-[12px] transition ${
                          workspaceTab === tab
                            ? "border-primary bg-primary-tint/40 text-primary"
                            : "border-border-subtle bg-surface text-text-secondary hover:bg-surface-2/70"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {workspaceTab === "attributes" ? (
                    <Card className="border-border-subtle">
                      <CardHeader
                        title="Attributes"
                        hint="Fields and validation surfaces for create/edit forms."
                      />
                      <div className="table-scroll-shadow overflow-x-auto">
                        <table className="w-full min-w-[520px] text-[12px]">
                          <thead>
                            <tr className="border-b border-border-subtle bg-surface-2/40 text-left">
                              {["Field", "Type", "Required"].map((header) => (
                                <th
                                  key={header}
                                  className="px-3 py-2 font-medium text-text-secondary"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {selectedMaster.fields.map((field) => (
                              <tr key={field.name} className="border-b border-border-subtle">
                                <td className="px-3 py-2">
                                  <div className="font-medium text-text-primary">{field.name}</div>
                                  <div className="text-[10px] text-text-secondary">
                                    {field.description}
                                  </div>
                                </td>
                                <td className="px-3 py-2">{field.type}</td>
                                <td className="px-3 py-2">{field.required ? "Y" : "N"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  ) : null}

                  {workspaceTab === "dependencies" ? (
                    <Card className="border-border-subtle">
                      <CardHeader
                        title="Dependencies"
                        hint="Impact matrix used for warning dialogs before status/archive actions."
                      />
                      <div className="table-scroll-shadow overflow-x-auto">
                        <table className="w-full min-w-[520px] text-[12px]">
                          <thead>
                            <tr className="border-b border-border-subtle bg-surface-2/40 text-left">
                              {["Module", "Screen", "Field"].map((header) => (
                                <th
                                  key={header}
                                  className="px-3 py-2 font-medium text-text-secondary"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {selectedMaster.dependencies.map((dependency) => (
                              <tr
                                key={`${dependency.module}-${dependency.screen}-${dependency.field}`}
                                className="border-b border-border-subtle"
                              >
                                <td className="px-3 py-2">{dependency.module}</td>
                                <td className="px-3 py-2">{dependency.screen}</td>
                                <td className="px-3 py-2">{dependency.field}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  ) : null}

                  {workspaceTab === "audit" ? (
                    <Card className="border-border-subtle">
                      <CardHeader
                        title="Audit Trail"
                        hint="UI-level history preview for create/edit/status/archive actions."
                      />
                      <div className="space-y-2 p-4 sm:p-5">
                        {selectedMasterAudit.length ? (
                          selectedMasterAudit.map((event) => (
                            <div
                              key={event.id}
                              className="rounded-lg border border-border-subtle bg-surface p-3"
                            >
                              <div className="flex flex-wrap items-center gap-2 text-[12px]">
                                <StatusBadge tone="info">{event.action}</StatusBadge>
                                <span className="font-medium text-text-primary">
                                  {event.recordCode}
                                </span>
                                <span className="text-text-secondary">by {event.by}</span>
                                <span className="ml-auto flex items-center gap-1 text-text-secondary">
                                  <Clock3 className="h-3.5 w-3.5" />
                                  {event.at}
                                </span>
                              </div>
                              <div className="mt-1 text-[11px] text-text-secondary">
                                {event.detail}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-[12px] text-text-secondary">
                            No audit events yet for this master.
                          </div>
                        )}
                      </div>
                    </Card>
                  ) : null}

                  {workspaceTab === "records" ? (
                    isRatePlanDelegated ? (
                      <Card className="border-border-subtle">
                        <CardHeader
                          title="Delegated to Rate Plans module"
                          hint="Create, edit, publish, and sync rate plans in steady-state operations."
                        />
                        <div className="space-y-4 p-4 sm:p-5">
                          <p className="text-[13px] text-text-secondary">
                            This master page keeps the attribute schema and dependency map. Live
                            rate plan records are maintained in{" "}
                            <Link
                              to="/rate-plans"
                              className="font-medium text-primary hover:underline"
                            >
                              Commercial → Rate Plans
                            </Link>
                            , including SU sync and versioning.
                          </p>
                          <Link
                            to="/rate-plans"
                            className="inline-flex h-8 items-center rounded-md border border-border bg-surface px-3 text-[12px] font-medium text-primary hover:bg-surface-2"
                          >
                            Open Rate Plans module
                          </Link>
                          <div className="table-scroll-shadow overflow-x-auto">
                            <table className="w-full min-w-[520px] text-[12px]">
                              <thead>
                                <tr className="border-b border-border-subtle bg-surface-2/40 text-left">
                                  {["Code", "Name", "Category", "Status", "Sync"].map((header) => (
                                    <th
                                      key={header}
                                      className="px-3 py-2 font-medium text-text-secondary"
                                    >
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {steadyRatePlans.map((plan) => (
                                  <tr key={plan.id} className="border-b border-border-subtle">
                                    <td className="px-3 py-2 font-mono">
                                      {plan.externalRatePlanCode}
                                    </td>
                                    <td className="px-3 py-2">{plan.name}</td>
                                    <td className="px-3 py-2">
                                      {RATE_PLAN_CATEGORY_LABEL[plan.category]}
                                    </td>
                                    <td className="px-3 py-2">
                                      <StatusBadge
                                        tone={plan.status === "Active" ? "success" : "warning"}
                                      >
                                        {plan.status}
                                      </StatusBadge>
                                    </td>
                                    <td className="px-3 py-2 capitalize">
                                      {plan.syncStatus.replace("_", " ")}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </Card>
                    ) : isTaxGroupDelegated ? (
                      <Card className="border-border-subtle">
                        <CardHeader
                          title="Delegated to Taxes & Fees module"
                          hint="GST, city tax, service charge, and tourism tax rules for folios and rates."
                        />
                        <div className="space-y-4 p-4 sm:p-5">
                          <p className="text-[13px] text-text-secondary">
                            This master page keeps the attribute schema and dependency map. Live tax
                            components and groups are maintained in{" "}
                            <Link
                              to="/taxes-fees"
                              className="font-medium text-primary hover:underline"
                            >
                              Commercial → Taxes & Fees
                            </Link>
                            , including folio calculation profiles.
                          </p>
                          <Link
                            to="/taxes-fees"
                            className="inline-flex h-8 items-center rounded-md border border-border bg-surface px-3 text-[12px] font-medium text-primary hover:bg-surface-2"
                          >
                            Open Taxes & Fees module
                          </Link>
                          <div className="table-scroll-shadow overflow-x-auto">
                            <table className="w-full min-w-[520px] text-[12px]">
                              <thead>
                                <tr className="border-b border-border-subtle bg-surface-2/40 text-left">
                                  {["Code", "Name", "Type", "Rate", "Status"].map((header) => (
                                    <th
                                      key={header}
                                      className="px-3 py-2 font-medium text-text-secondary"
                                    >
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {steadyTaxComponents.map((component) => (
                                  <tr key={component.id} className="border-b border-border-subtle">
                                    <td className="px-3 py-2 font-mono">{component.code}</td>
                                    <td className="px-3 py-2">{component.name}</td>
                                    <td className="px-3 py-2">
                                      {TAX_COMPONENT_TYPE_LABEL[component.type]}
                                    </td>
                                    <td className="px-3 py-2 font-mono">
                                      {component.flatAmount != null &&
                                      component.calculationBase === "per_night"
                                        ? `₹${component.flatAmount}/night`
                                        : `${component.ratePercent}%`}
                                    </td>
                                    <td className="px-3 py-2">
                                      <StatusBadge
                                        tone={component.status === "Active" ? "success" : "neutral"}
                                      >
                                        {component.status}
                                      </StatusBadge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <Card className="border-border-subtle">
                        <CardHeader
                          title="Master Records"
                          hint="Record-level management with sorting, pagination, and save guards."
                          action={
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openRecordForm("edit")}
                                disabled={!selectedRecord}
                              >
                                <PencilLine className="h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <Button size="sm" onClick={() => openRecordForm("create")}>
                                <Plus className="h-3.5 w-3.5" />
                                Add record
                              </Button>
                            </div>
                          }
                        />
                        <div className="grid grid-cols-1 gap-2 px-4 pt-4 md:grid-cols-2 xl:grid-cols-4">
                          <input
                            className="h-9 rounded-md border border-border bg-surface px-3 text-[12px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                            value={recordSearch}
                            onChange={(event) => setRecordSearch(event.target.value)}
                            placeholder="Search records"
                          />
                          <select
                            className="h-9 rounded-md border border-border bg-surface px-3 text-[12px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                            value={sortField}
                            onChange={(event) => changeSort(event.target.value as RecordSortField)}
                          >
                            <option value="updatedAt">Sort by Updated</option>
                            <option value="code">Sort by Code</option>
                            <option value="name">Sort by Name</option>
                            <option value="status">Sort by Status</option>
                          </select>
                          <select
                            className="h-9 rounded-md border border-border bg-surface px-3 text-[12px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                            value={sortDirection}
                            onChange={(event) =>
                              setSortDirection(event.target.value as "asc" | "desc")
                            }
                          >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                          </select>
                          <select
                            className="h-9 rounded-md border border-border bg-surface px-3 text-[12px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                            value={pageSize}
                            onChange={(event) => setPageSize(Number(event.target.value))}
                          >
                            {[5, 10, 20].map((size) => (
                              <option key={size} value={size}>
                                {size} / page
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[360px_1fr]">
                          <div className="space-y-2">
                            <div className="grid grid-cols-[80px_1fr_84px] items-center rounded-md border border-border-subtle bg-surface-2/30 px-2 py-1 text-[11px] font-medium text-text-secondary md:grid-cols-[88px_1fr_84px_84px]">
                              <button
                                type="button"
                                onClick={() => changeSort("code")}
                                className="text-left"
                              >
                                Code
                              </button>
                              <button
                                type="button"
                                onClick={() => changeSort("name")}
                                className="text-left"
                              >
                                Name
                              </button>
                              <button
                                type="button"
                                onClick={() => changeSort("status")}
                                className="text-left"
                              >
                                Status
                              </button>
                              <button
                                type="button"
                                onClick={() => changeSort("updatedAt")}
                                className="hidden text-left md:inline"
                              >
                                Updated
                              </button>
                            </div>
                            {pageRecords.length ? (
                              pageRecords.map((record) => (
                                <button
                                  key={record.id}
                                  type="button"
                                  onClick={() => selectRecordWithGuard(record.id)}
                                  className={`w-full rounded-md border p-2 text-left transition ${
                                    selectedRecord?.id === record.id
                                      ? "border-primary bg-primary-tint/40"
                                      : "border-border-subtle bg-surface hover:bg-surface-2/60"
                                  }`}
                                >
                                  <div className="grid grid-cols-[80px_1fr_84px] items-center gap-1 md:grid-cols-[88px_1fr_84px_84px]">
                                    <div className="truncate text-[12px] font-medium text-text-primary">
                                      {record.code}
                                    </div>
                                    <div className="truncate text-[11px] text-text-secondary">
                                      {record.name}
                                    </div>
                                    <div className="text-left">
                                      <StatusBadge tone={statusTone[record.status]}>
                                        {record.status}
                                      </StatusBadge>
                                    </div>
                                    <div className="hidden truncate text-[10px] text-text-disabled md:inline">
                                      {record.updatedAt.slice(5)}
                                    </div>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="rounded-md border border-dashed border-border p-3 text-[12px] text-text-secondary">
                                No records match this view.
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyQuickCreatePreset("active-standard")}
                                  >
                                    Quick Add Active
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => applyQuickCreatePreset("draft-future")}
                                  >
                                    Quick Add Draft
                                  </Button>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-between pt-1 text-[11px] text-text-secondary">
                              <span>
                                Page {Math.min(pageIndex + 1, pageCount)} of {pageCount}
                              </span>
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={pageIndex === 0}
                                  onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                                >
                                  Prev
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={pageIndex >= pageCount - 1}
                                  onClick={() =>
                                    setPageIndex((prev) => Math.min(pageCount - 1, prev + 1))
                                  }
                                >
                                  Next
                                </Button>
                              </div>
                            </div>
                          </div>
                          {draftRecord ? (
                            <div className="space-y-3 rounded-lg border border-border-subtle bg-surface-2/30 p-3 sm:p-4">
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <EditableField
                                  label="Code"
                                  value={draftRecord.code}
                                  onChange={(value) => {
                                    setDraftRecord({ ...draftRecord, code: value });
                                    setInlineDirty(true);
                                  }}
                                />
                                <EditableField
                                  label="Name"
                                  value={draftRecord.name}
                                  onChange={(value) => {
                                    setDraftRecord({ ...draftRecord, name: value });
                                    setInlineDirty(true);
                                  }}
                                />
                                <EditableSelect
                                  label="Status"
                                  value={draftRecord.status}
                                  options={["Active", "Inactive", "Draft"]}
                                  onChange={(value) => {
                                    setDraftRecord({
                                      ...draftRecord,
                                      status: value as MasterStatus,
                                    });
                                    setInlineDirty(true);
                                  }}
                                />
                                <EditableField
                                  label="Effective From"
                                  value={draftRecord.effectiveFrom}
                                  onChange={(value) => {
                                    setDraftRecord({ ...draftRecord, effectiveFrom: value });
                                    setInlineDirty(true);
                                  }}
                                  type="date"
                                />
                                <EditableField
                                  label="Effective To"
                                  value={draftRecord.effectiveTo ?? ""}
                                  onChange={(value) => {
                                    setDraftRecord({
                                      ...draftRecord,
                                      effectiveTo: value || undefined,
                                    });
                                    setInlineDirty(true);
                                  }}
                                  type="date"
                                />
                                <Field label="Updated By" value={draftRecord.updatedBy} />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" onClick={saveInlineRecord}>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Save
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setModal({ type: "confirm-impact", action: "inactive" })
                                  }
                                >
                                  <AlertTriangle className="h-3.5 w-3.5" />
                                  Set Inactive
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="h-3.5 w-3.5" />
                                  Export Record
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() =>
                                    setModal({ type: "confirm-impact", action: "archive" })
                                  }
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Archive
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => applyQuickCreatePreset("active-standard")}
                                >
                                  Preset: Active
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => applyQuickCreatePreset("draft-future")}
                                >
                                  Preset: Draft
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => applyQuickCreatePreset("inactive-legacy")}
                                >
                                  Preset: Legacy
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-md border border-dashed border-border p-5 text-center text-[12px] text-text-secondary">
                              Select a record to view and edit details.
                            </div>
                          )}
                        </div>
                      </Card>
                    )
                  ) : null}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-[13px] text-text-secondary">
                  No master matches current filter.
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {modal.type === "record-form" ? (
        <ModalShell
          title={modal.mode === "create" ? "Create Master Record" : "Edit Master Record"}
          onClose={closeModalWithGuard}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={closeModalWithGuard}>
                Cancel
              </Button>
              <Button size="sm" onClick={saveRecordForm}>
                Save record
              </Button>
            </>
          }
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <EditableField
              label="Code"
              value={recordForm.code}
              onChange={(value) => {
                setRecordForm((prev) => ({ ...prev, code: value }));
                setRecordFormDirty(true);
              }}
            />
            <EditableField
              label="Name"
              value={recordForm.name}
              onChange={(value) => {
                setRecordForm((prev) => ({ ...prev, name: value }));
                setRecordFormDirty(true);
              }}
            />
            <EditableSelect
              label="Status"
              value={recordForm.status}
              options={["Draft", "Active", "Inactive"]}
              onChange={(value) => {
                setRecordForm((prev) => ({ ...prev, status: value as MasterStatus }));
                setRecordFormDirty(true);
              }}
            />
            <EditableField
              label="Effective From"
              value={recordForm.effectiveFrom}
              onChange={(value) => {
                setRecordForm((prev) => ({ ...prev, effectiveFrom: value }));
                setRecordFormDirty(true);
              }}
              type="date"
            />
            <EditableField
              label="Effective To"
              value={recordForm.effectiveTo}
              onChange={(value) => {
                setRecordForm((prev) => ({ ...prev, effectiveTo: value }));
                setRecordFormDirty(true);
              }}
              type="date"
            />
          </div>
          {selectedMaster ? (
            <div className="mt-4">
              <div className="mb-2 text-[12px] font-semibold text-text-primary">
                Additional Attributes
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {getDynamicFields(selectedMaster).map((field) => (
                  <EditableField
                    key={field.name}
                    label={field.name}
                    value={recordForm.attributes[field.name] ?? ""}
                    onChange={(value) => {
                      setRecordForm((prev) => ({
                        ...prev,
                        attributes: { ...prev.attributes, [field.name]: value },
                      }));
                      setRecordFormDirty(true);
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </ModalShell>
      ) : null}

      {modal.type === "confirm-impact" && selectedMaster && selectedRecord ? (
        <ModalShell
          title={
            modal.action === "inactive"
              ? "Impact Check: Set Inactive"
              : "Impact Check: Archive Record"
          }
          onClose={() => setModal({ type: "none" })}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setModal({ type: "none" })}>
                Cancel
              </Button>
              <Button
                variant={modal.action === "archive" ? "danger" : "outline"}
                size="sm"
                onClick={confirmImpactAction}
              >
                Confirm
              </Button>
            </>
          }
        >
          <div className="text-[12px] text-text-secondary">
            <span className="font-medium text-text-primary">{selectedRecord.code}</span> is consumed
            in{" "}
            <span className="font-medium text-text-primary">
              {selectedMaster.dependencies.length}
            </span>{" "}
            downstream places. Review before continuing:
          </div>
          <div className="mt-3 space-y-2">
            {selectedMaster.dependencies.map((dependency) => (
              <div
                key={`${dependency.module}-${dependency.screen}-${dependency.field}`}
                className="rounded-md border border-border-subtle bg-surface p-2 text-[12px]"
              >
                <span className="font-medium text-text-primary">{dependency.module}</span> ·{" "}
                {dependency.screen} · {dependency.field}
              </div>
            ))}
          </div>
        </ModalShell>
      ) : null}

      {modal.type === "bulk-import" ? (
        <ModalShell
          title="Bulk Import (UI Preview)"
          onClose={() => setModal({ type: "none" })}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setModal({ type: "none" })}>
                Close
              </Button>
              <Button size="sm">Validate File</Button>
            </>
          }
        >
          <div className="text-[12px] text-text-secondary">
            Upload CSV/XLSX template with columns: `code`, `name`, `status`, `effectiveFrom`,
            `effectiveTo` and master-specific attributes.
          </div>
        </ModalShell>
      ) : null}

      {modal.type === "export" ? (
        <ModalShell
          title="Export Master Data (UI Preview)"
          onClose={() => setModal({ type: "none" })}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setModal({ type: "none" })}>
                Close
              </Button>
              <Button size="sm">Download</Button>
            </>
          }
        >
          <div className="space-y-2 text-[12px] text-text-secondary">
            <div>Select export range:</div>
            <label className="flex items-center gap-2">
              <input type="radio" name="export-range" defaultChecked />
              Current selected master
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="export-range" />
              Filtered catalogue
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="export-range" />
              Full master repository
            </label>
          </div>
        </ModalShell>
      ) : null}

      {modal.type === "advanced-filters" ? (
        <ModalShell
          title="Advanced Filters"
          onClose={() => setModal({ type: "none" })}
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUpdatedByFilter("All");
                  setUpdatedDateFrom("");
                  setUpdatedDateTo("");
                  setIncludeNoDependencyMasters(true);
                }}
              >
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={() => setModal({ type: "none" })}>
                Close
              </Button>
            </>
          }
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1 text-[11px] font-medium text-text-secondary">Updated By</div>
              <select
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
                value={updatedByFilter}
                onChange={(event) => setUpdatedByFilter(event.target.value)}
              >
                {updatedByOptions.map((updatedBy) => (
                  <option key={updatedBy} value={updatedBy}>
                    {updatedBy}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="mb-1 text-[11px] font-medium text-text-secondary">
                Include no-dependency masters
              </div>
              <label className="flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-[13px]">
                <input
                  type="checkbox"
                  checked={includeNoDependencyMasters}
                  onChange={(event) => setIncludeNoDependencyMasters(event.target.checked)}
                />
                Enabled
              </label>
            </div>
            <EditableField
              label="Updated Date From"
              value={updatedDateFrom}
              onChange={setUpdatedDateFrom}
              type="date"
            />
            <EditableField
              label="Updated Date To"
              value={updatedDateTo}
              onChange={setUpdatedDateTo}
              type="date"
            />
          </div>
          <div className="mt-3 rounded-lg border border-border-subtle bg-surface p-3 text-[12px] text-text-secondary">
            Filters are applied to record lists and catalogue behavior in real time.
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-medium text-text-secondary">{label}</div>
      <input
        className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
        value={value}
        readOnly
      />
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "date";
}) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-medium text-text-secondary">{label}</div>
      <input
        className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function EditableSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-medium text-text-secondary">{label}</div>
      <select
        className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-sidebar/55 p-0 backdrop-blur-[1px] sm:items-center sm:p-4">
      <div className="flex h-[100dvh] w-full flex-col border border-border bg-card shadow-e3 sm:h-auto sm:max-h-[85vh] sm:w-[80vw] sm:rounded-2xl lg:max-w-3xl">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3 sm:px-5">
          <div className="text-[14px] font-semibold text-text-primary">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border-subtle px-2 py-1 text-[12px] text-text-secondary transition hover:bg-surface-2/70"
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 sm:flex-none sm:p-5">{children}</div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-border-subtle px-4 py-3 sm:px-5">
          {footer}
        </div>
      </div>
    </div>
  );
}

function getDynamicFields(master: MasterDefinition) {
  return master.fields.filter((field) => !/(code|name|status)/i.test(field.name));
}

function todayAsInput() {
  return new Date().toISOString().slice(0, 10);
}

function nowStamp() {
  const date = new Date();
  const day = date.toISOString().slice(0, 10);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${day} ${hh}:${mm}`;
}

export default MastersFeature;
