import { Plus, TrendingUp, PackageOpen, Users, Receipt, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  PageHeader,
  Button,
  Card,
  CardHeader,
  KpiCard,
} from "@/components/ui/Primitives";
import { OrderTrackingFeature } from "./OrderTrackingFeature";

export function PosOrdersFeature() {
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-surface-2/30">
      <PageHeader
        eyebrow="Outlet · Main Restaurant"
        title="POS Dashboard"
        description="Today's sales overview, quick actions, and low stock alerts."
        actions={
          <Link to="/pos/new">
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" />
              New order
            </Button>
          </Link>
        }
      />
      <div className="space-y-6 p-6">
        
        {/* KPI Row */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4 lg:grid-cols-3">
          <KpiCard label="Total Orders" value="64" accent="info" delta="+5" deltaTone="success" />
          <KpiCard label="Pending Orders" value="8" accent="warning" />
          <KpiCard label="Customers" value="45" accent="brand" delta="+2" deltaTone="success" />
          <KpiCard label="Avg Order Value" value="₹382" accent="info" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions & Tracking */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions */}
            <Card className="p-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <Link to="/pos/new" className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg hover:bg-surface-2 transition-colors text-text-primary">
                  <div className="w-10 h-10 rounded-full bg-primary-tint text-primary flex items-center justify-center"><Plus className="h-5 w-5" /></div>
                  <span className="text-[13px] font-medium">New Sale</span>
                </Link>
                <Link to="/pos/billing" className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg hover:bg-surface-2 transition-colors text-text-primary">
                  <div className="w-10 h-10 rounded-full bg-success-tint text-success flex items-center justify-center"><Receipt className="h-5 w-5" /></div>
                  <span className="text-[13px] font-medium">Sales History</span>
                </Link>
                <Link to="/pos/inventory" className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg hover:bg-surface-2 transition-colors text-text-primary">
                  <div className="w-10 h-10 rounded-full bg-warning-tint text-warning flex items-center justify-center"><PackageOpen className="h-5 w-5" /></div>
                  <span className="text-[13px] font-medium">Inventory</span>
                </Link>
                <Link to="/reports" className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg hover:bg-surface-2 transition-colors text-text-primary">
                  <div className="w-10 h-10 rounded-full bg-info-tint text-info flex items-center justify-center"><TrendingUp className="h-5 w-5" /></div>
                  <span className="text-[13px] font-medium">Reports</span>
                </Link>
              </div>
            </Card>

            {/* Live Order Tracking */}
            <OrderTrackingFeature />
          </div>

          {/* Right Sidebar Alerts & Top Items */}
          <div className="space-y-6">
            {/* Best Selling Items */}
            <Card>
              <CardHeader title="Best Selling Items" hint="Today" />
              <div className="p-4 space-y-4">
                {[
                  { name: "Butter Chicken", qty: 24, rev: 10800 },
                  { name: "Garlic Naan", qty: 68, rev: 4080 },
                  { name: "Cold Coffee", qty: 15, rev: 2700 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-medium text-text-primary">{item.name}</div>
                      <div className="text-[11px] text-text-secondary">{item.qty} sold</div>
                    </div>
                    <div className="font-mono text-[13px] font-semibold text-text-primary">
                      ₹{item.rev}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Low Stock Alerts */}
            <Card>
              <CardHeader title="Low Stock Alerts" action={<Button variant="ghost" size="sm" className="h-7 px-2">View All</Button>} />
              <div className="p-4 space-y-4">
                {[
                  { name: "Kingfisher Premium (650ml)", qty: 4 },
                  { name: "Paneer (Raw)", qty: "2 kg" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-error-tint/30 rounded-lg border border-error/20">
                    <div className="text-[13px] font-medium text-text-primary">{item.name}</div>
                    <div className="text-[12px] font-mono font-bold text-error">
                      {item.qty} left
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            
          </div>
        </div>

      </div>
    </div>
  );
}
