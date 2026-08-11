import { PageHeader, Card, CardHeader, KpiCard } from "@/components/ui/Primitives";
import { TrendingUp, TrendingDown, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/Primitives";

export function PosReportsFeature() {
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      <PageHeader
        eyebrow="Outlet Reports"
        title="POS Analytics & Reports"
        description="Comprehensive insights into sales, inventory, and staff performance."
        actions={
          <div className="flex gap-2 text-[13px]">
            <Button variant="outline" size="sm">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Today
            </Button>
            <Button variant="primary" size="sm">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
          </div>
        }
      />
      
      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Gross Sales" value="₹48,500" accent="success" delta="+15.2%" deltaTone="success" />
          <KpiCard label="Net Sales" value="₹45,100" accent="info" delta="+14.8%" deltaTone="success" />
          <KpiCard label="Total Discounts" value="₹3,400" accent="warning" delta="-5.2%" deltaTone="success" />
          <KpiCard label="Avg Order Value" value="₹480" accent="brand" delta="+2.1%" deltaTone="success" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Sales by Category" />
            <div className="p-5 flex items-end h-[250px] gap-4 pl-8 pb-8 relative">
              {/* Mock Bar Chart */}
              <div className="absolute left-2 top-4 bottom-8 flex flex-col justify-between text-[11px] text-text-secondary text-right">
                <span>15k</span>
                <span>10k</span>
                <span>5k</span>
                <span>0</span>
              </div>
              <div className="absolute left-8 right-4 bottom-8 border-t border-border" />
              <div className="absolute left-8 right-4 top-4 border-t border-border-subtle border-dashed" />
              <div className="absolute left-8 right-4 top-[calc(50%-1rem)] border-t border-border-subtle border-dashed" />

              <div className="flex-1 flex flex-col items-center justify-end h-full z-10 group">
                <div className="w-12 bg-primary/80 rounded-t-sm group-hover:bg-primary transition-colors" style={{ height: "80%" }} />
                <span className="text-[11px] mt-2 text-text-secondary group-hover:text-text-primary">Foods</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-end h-full z-10 group">
                <div className="w-12 bg-success/80 rounded-t-sm group-hover:bg-success transition-colors" style={{ height: "45%" }} />
                <span className="text-[11px] mt-2 text-text-secondary group-hover:text-text-primary">Drinks</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-end h-full z-10 group">
                <div className="w-12 bg-warning/80 rounded-t-sm group-hover:bg-warning transition-colors" style={{ height: "20%" }} />
                <span className="text-[11px] mt-2 text-text-secondary group-hover:text-text-primary">Snacks</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-end h-full z-10 group">
                <div className="w-12 bg-info/80 rounded-t-sm group-hover:bg-info transition-colors" style={{ height: "30%" }} />
                <span className="text-[11px] mt-2 text-text-secondary group-hover:text-text-primary">Desserts</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Top Performing Staff" />
            <div className="p-4">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/40 text-left">
                    <th className="px-4 py-2 font-medium text-text-secondary">Staff</th>
                    <th className="px-4 py-2 font-medium text-text-secondary text-right">Orders</th>
                    <th className="px-4 py-2 font-medium text-text-secondary text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { name: "Rahul Sharma", orders: 42, rev: 18400 },
                    { name: "Amit Kumar", orders: 38, rev: 15200 },
                    { name: "Neha Gupta", orders: 25, rev: 11500 },
                  ].map((s, i) => (
                    <tr key={i} className="hover:bg-surface-2/30">
                      <td className="px-4 py-3 font-medium text-text-primary">{s.name}</td>
                      <td className="px-4 py-3 text-right text-text-secondary">{s.orders}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-text-primary">₹{s.rev.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
