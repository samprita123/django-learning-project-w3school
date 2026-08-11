export const crmLeads = [
  {
    id: "LD-1004",
    name: "Blue Lotus Events",
    source: "Website",
    stage: "Qualified",
    owner: "Aarav",
    eta: "Today",
    date: "2024-01-15",
  },
  {
    id: "LD-1005",
    name: "Skyline Corporate",
    source: "Referral",
    stage: "Proposal",
    owner: "Neha",
    eta: "Tomorrow",
    date: "2024-02-20",
  },
  {
    id: "LD-1006",
    name: "Sapphire Weddings",
    source: "Social",
    stage: "Negotiation",
    owner: "Vikram",
    eta: "2 days",
    date: "2024-03-10",
  },
  {
    id: "LD-1007",
    name: "Heritage Group Stay",
    source: "OTA",
    stage: "New",
    owner: "Priya",
    eta: "Today",
    date: "2024-03-25",
  },
] as const;

export const hotelRegistry = [
  {
    id: "H-001",
    name: "The Grand Palace",
    city: "New Delhi",
    tier: "Luxury",
    status: "Live",
    rooms: 280,
  },
  {
    id: "H-002",
    name: "Retrod City Suites",
    city: "Mumbai",
    tier: "Business",
    status: "Onboarding",
    rooms: 126,
  },
  {
    id: "H-003",
    name: "Lotus Bay Resort",
    city: "Goa",
    tier: "Resort",
    status: "Live",
    rooms: 94,
  },
  {
    id: "H-004",
    name: "Highland Retreat",
    city: "Shimla",
    tier: "Boutique",
    status: "Pilot",
    rooms: 52,
  },
] as const;

export const serviceCatalog = [
  {
    id: "SV-101",
    category: "Add-On",
    name: "Airport Pickup",
    price: "₹1,800",
    status: "Active",
  },
  {
    id: "SV-204",
    category: "Concierge",
    name: "City Heritage Tour",
    price: "₹4,500",
    status: "Seasonal",
  },
  {
    id: "SV-087",
    category: "Transport",
    name: "Premium Sedan (4h)",
    price: "₹3,200",
    status: "Active",
  },
  {
    id: "SV-301",
    category: "Add-On",
    name: "Late Checkout",
    price: "₹2,000",
    status: "Draft",
  },
] as const;
