import { useState } from "react";
import { toast } from "sonner";
import { Download, FileSpreadsheet, FileText, Printer, ChevronRight } from "lucide-react";
import { PageHeader, KpiCard, Button, Card, CardHeader } from "@/components/ui/Primitives";
import {
  useRevenueTrendQuery,
  useOtaBreakdownQuery,
  useMealPlansQuery,
  useRatePlansQuery,
  useHotelPackagesQuery,
  useAddOnProductsQuery,
} from "@/services/mock/queries";
import { ReportsSidebar, ReportGroup } from "./ReportsSidebar";
import { RevenueTrendChart } from "./RevenueTrendChart";
import { OtaRevenueChart } from "./OtaRevenueChart";
import { OccupancyProgress } from "./OccupancyProgress";
import { ReportViewerModal } from "./ReportViewerModal";

const reportGroups: ReportGroup[] = [
  {
    title: "Dashboards",
    items: ["Performance Overview"],
  },
  {
    title: "Report Directory",
    items: [
      "Night Audit & Financials",
      "Front Office & Reception",
      "Housekeeping & Maintenance",
      "Sales & Marketing",
      "Point of Sale & F&B",
    ],
  },
];

const REPORTS_CATALOG: Record<string, { title: string; desc: string; type: string }[]> = {
  "Night Audit & Financials": [
    { title: "Manager's Flash Report", desc: "A daily snapshot of revenue, occupancy, and operating metrics.", type: "PDF / Excel" },
    { title: "Trial Balance", desc: "Detailed breakdown of all guest, city, and advanced ledger balances.", type: "PDF / CSV" },
    { title: "Tax & GST Liability", desc: "Summary of taxable revenue and corresponding tax collected.", type: "Excel / CSV" },
    { title: "Shift Collections", desc: "Payments received and refunds processed per cashier shift.", type: "PDF" },
    { title: "City Ledger & AR", desc: "Outstanding balances for direct billing and corporate accounts.", type: "PDF / Excel" },
  ],
  "Front Office & Reception": [
    { title: "Expected Arrivals", desc: "List of guests scheduled to check in, including VIP status and ETA.", type: "PDF / Print" },
    { title: "Expected Departures", desc: "List of guests scheduled to check out, with outstanding balances.", type: "PDF / Print" },
    { title: "In-House Guests", desc: "Current occupied rooms and registered guest details.", type: "PDF" },
    { title: "No-Show & Cancellations", desc: "Log of reservations that were cancelled or did not arrive.", type: "PDF / Excel" },
    { title: "Police / Immigration Export", desc: "C-Form and local law enforcement compliant guest list export.", type: "TXT / CSV" },
  ],
  "Housekeeping & Maintenance": [
    { title: "Room Discrepancy", desc: "Compares PMS occupancy status vs. Housekeeping physical status.", type: "PDF / Print" },
    { title: "OOO / OOS Log", desc: "Rooms marked as Out of Order or Out of Service with reasons.", type: "PDF / Excel" },
    { title: "Daily Task Assignment", desc: "Cleaning sheet allocated by attendant or zone.", type: "Print" },
  ],
  "Sales & Marketing": [
    { title: "Booking Pace", desc: "On-the-books (OTB) comparison against historical pace.", type: "Excel / CSV" },
    { title: "Source of Business", desc: "Revenue grouped by OTA, direct, corporate, and walk-ins.", type: "PDF / Excel" },
    { title: "Market Segmentation", desc: "Breakdown of volume and revenue by market segment codes.", type: "PDF / Excel" },
  ],
  "Point of Sale & F&B": [
    { title: "Meal Plan List", desc: "Breakfast, lunch, and dinner entitlement lists by room.", type: "Print / PDF" },
    { title: "POS Revenue", desc: "Summary of charges routed from restaurant and spa outlets.", type: "PDF / Excel" },
  ],
};

const tooltipStyle = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: 8,
  fontSize: 12,
};

export function ReportsFeature() {
  const { data: revenueTrend = [] } = useRevenueTrendQuery();
  const { data: otaBreakdown = [] } = useOtaBreakdownQuery();
  const { data: mealPlans = [] } = useMealPlansQuery();
  const { data: ratePlans = [] } = useRatePlansQuery();
  const { data: hotelPackages = [] } = useHotelPackagesQuery();
  const { data: addOnProducts = [] } = useAddOnProductsQuery();

  const [selectedCategory, setSelectedCategory] = useState<string>("Performance Overview");
  const [viewingReport, setViewingReport] = useState<string | null>(null);

  const renderDashboard = () => (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Revenue" value="₹1.42 Cr" delta="↑ 12.4% YoY" accent="brand" />
        <KpiCard label="Occupancy" value="78.4%" delta="↑ 2.1 pts" accent="info" />
        <KpiCard label="ADR" value="₹11,820" delta="↑ ₹420" accent="success" />
        <KpiCard label="RevPAR" value="₹9,267" delta="↑ ₹680" accent="success" />
      </div>

      <RevenueTrendChart revenueTrend={revenueTrend} tooltipStyle={tooltipStyle} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OtaRevenueChart otaBreakdown={otaBreakdown} tooltipStyle={tooltipStyle} />
        <OccupancyProgress />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-e1">
          <div className="label-uppercase mb-2">Plan Revenue Snapshot</div>
          <div className="space-y-2 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Reservations by meal plan</span>
              <span className="font-mono text-text-primary">{mealPlans.length} configured</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Revenue by rate plan</span>
              <span className="font-mono text-text-primary">{ratePlans.length} configured</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Package revenue tracking</span>
              <span className="font-mono text-text-primary">
                {hotelPackages.length} templates
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Add-on revenue tracking</span>
              <span className="font-mono text-text-primary">
                {addOnProducts.length} services
              </span>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4 shadow-e1">
          <div className="label-uppercase mb-2">Channel Mapping Readiness</div>
          <p className="text-[12px] text-text-secondary">
            Room type + meal plan + rate plan combinations are now represented in reservation
            model and can be mapped to OTA products in Channel Manager mapping flows.
          </p>
        </div>
      </div>
    </div>
  );

  const renderReportList = () => {
    const catalog = REPORTS_CATALOG[selectedCategory] || [];
    
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader title={selectedCategory} hint={`Available reports for ${selectedCategory.toLowerCase()}`} />
          <div className="divide-y divide-border-subtle">
            {catalog.map((report) => (
              <div key={report.title} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-surface-2/30 transition">
                <div className="max-w-[500px]">
                  <h4 className="font-medium text-[14px] text-text-primary mb-1">{report.title}</h4>
                  <p className="text-[13px] text-text-secondary leading-relaxed">{report.desc}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-surface-2 border border-border-subtle text-[11px] font-medium text-text-secondary uppercase tracking-wider mr-2">
                    {report.type}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => toast.info(`Configuration for ${report.title} is coming soon.`)}>
                    Configure
                  </Button>
                  <Button size="sm" onClick={() => setViewingReport(report.title)}>
                    Generate
                  </Button>
                </div>
              </div>
            ))}
            {catalog.length === 0 && (
              <div className="p-8 text-center text-text-secondary text-[13px]">
                No reports available for this category yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Reports & Analytics"
        actions={
          selectedCategory === "Performance Overview" ? (
            <>
              <Button variant="outline" size="sm">
                <FileText className="h-3.5 w-3.5" />
                PDF
              </Button>
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Excel
              </Button>
              <Button size="sm">
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
            </>
          ) : null
        }
      />

      <div className="responsive-page-x grid grid-cols-1 gap-5 py-4 sm:py-6 lg:grid-cols-[240px_1fr]">
        <ReportsSidebar
          groups={reportGroups}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <div className="min-w-0">
          {selectedCategory === "Performance Overview" ? renderDashboard() : renderReportList()}
        </div>
      </div>

      <ReportViewerModal 
        isOpen={viewingReport !== null} 
        onClose={() => setViewingReport(null)} 
        reportTitle={viewingReport} 
      />
    </div>
  );
}

export default ReportsFeature;
