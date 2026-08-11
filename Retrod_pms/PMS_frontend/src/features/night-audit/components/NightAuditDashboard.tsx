import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNightAudit } from "../store/NightAuditContext";
import { Button } from "@/components/ui/button";
import { MOCK_AUDIT_KPI, MOCK_FINANCIAL_SUMMARY } from "../lib/mockAuditData";
import { ArrowRight, BedDouble, Building2, CreditCard, Users } from "lucide-react";

export function NightAuditDashboard() {
  const { nextStep, setDashboardReviewed } = useNightAudit();

  const handleContinue = () => {
    setDashboardReviewed(true);
    nextStep();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Dashboard</h2>
          <p className="text-muted-foreground">Review the day's operational and financial summaries.</p>
        </div>
        <Button onClick={handleContinue} size="lg">
          Start Checklists <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_AUDIT_KPI.occupancyPercent}%</div>
            <p className="text-xs text-muted-foreground">
              {MOCK_AUDIT_KPI.occupiedRooms} / {MOCK_AUDIT_KPI.totalRooms} Rooms Occupied
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(
                MOCK_FINANCIAL_SUMMARY.roomRevenue +
                MOCK_FINANCIAL_SUMMARY.restaurantRevenue +
                MOCK_FINANCIAL_SUMMARY.spaRevenue +
                MOCK_FINANCIAL_SUMMARY.banquetRevenue
              ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Excluding taxes & fees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arrivals & Departures</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {MOCK_AUDIT_KPI.arrivals} / {MOCK_AUDIT_KPI.departures}
            </div>
            <p className="text-xs text-muted-foreground">{MOCK_AUDIT_KPI.stayovers} Stayovers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Room Status</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_AUDIT_KPI.vacantRooms} Vacant</div>
            <p className="text-xs text-muted-foreground">
              {MOCK_AUDIT_KPI.outOfOrder} OOO, {MOCK_AUDIT_KPI.outOfService} OOS
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Rooms</span>
              <span className="font-medium">${MOCK_FINANCIAL_SUMMARY.roomRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Restaurant & Bar</span>
              <span className="font-medium">${MOCK_FINANCIAL_SUMMARY.restaurantRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Spa & Wellness</span>
              <span className="font-medium">${MOCK_FINANCIAL_SUMMARY.spaRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Banquets</span>
              <span className="font-medium">${MOCK_FINANCIAL_SUMMARY.banquetRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold">Tax Collected</span>
              <span className="font-semibold">${MOCK_FINANCIAL_SUMMARY.taxCollected.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Collection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Credit Card</span>
              <span className="font-medium">${MOCK_FINANCIAL_SUMMARY.cardPayments.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Cash</span>
              <span className="font-medium">${MOCK_FINANCIAL_SUMMARY.cashPayments.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">UPI / Digital</span>
              <span className="font-medium">${MOCK_FINANCIAL_SUMMARY.upiPayments.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-muted-foreground">Corporate / Direct Bill</span>
              <span className="font-medium">${MOCK_FINANCIAL_SUMMARY.corporateBilling.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-2 text-destructive">
              <span className="font-semibold">City Ledger Balance</span>
              <span className="font-semibold">${MOCK_FINANCIAL_SUMMARY.cityLedgerBalance.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
