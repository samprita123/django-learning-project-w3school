export const MOCK_AUDIT_KPI = {
  occupancyPercent: 82,
  totalRooms: 150,
  occupiedRooms: 123,
  vacantRooms: 20,
  outOfOrder: 5,
  outOfService: 2,
  arrivals: 45,
  departures: 42,
  stayovers: 78,
  noShows: 2,
  walkIns: 5,
  earlyCheckins: 12,
  lateCheckouts: 8,
};

export const MOCK_FINANCIAL_SUMMARY = {
  roomRevenue: 24500.00,
  restaurantRevenue: 5200.50,
  laundryRevenue: 350.00,
  spaRevenue: 1200.00,
  banquetRevenue: 8500.00,
  otherRevenue: 150.00,
  taxCollected: 3192.04,
  discounts: 450.00,
  refunds: 0.00,
  cashPayments: 4200.00,
  cardPayments: 28500.50,
  upiPayments: 5400.00,
  corporateBilling: 4500.00,
  cityLedgerBalance: 12500.00,
};

export const MOCK_CASHIER_SHIFTS = [
  { id: "CSH-01", name: "Alice Smith", shift: "Morning", opening: 500, cashSales: 1200, refunds: 50, expenses: 0, dropped: 1650, variance: 0 },
  { id: "CSH-02", name: "Bob Jones", shift: "Evening", opening: 500, cashSales: 3000, refunds: 0, expenses: 100, dropped: 3350, variance: -50 },
];
