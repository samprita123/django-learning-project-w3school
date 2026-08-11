import { Card, CardHeader, KpiCard } from "@/components/ui/Primitives";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Package, TrendingUp, AlertTriangle, ArrowDownRight, ArrowUpRight, DollarSign, Clock } from "lucide-react";

// Mock Data
const consumptionData = [
  { name: "Mon", cost: 12000, value: 35000 },
  { name: "Tue", cost: 14500, value: 41000 },
  { name: "Wed", cost: 11000, value: 32000 },
  { name: "Thu", cost: 16000, value: 48000 },
  { name: "Fri", cost: 22000, value: 65000 },
  { name: "Sat", cost: 28000, value: 85000 },
  { name: "Sun", cost: 26000, value: 78000 },
];

const topConsumed = [
  { item: "Basmati Rice", qty: "45 kg", cost: "₹4,500" },
  { item: "Chicken (Whole)", qty: "32 kg", cost: "₹6,400" },
  { item: "Cooking Oil", qty: "18 L", cost: "₹2,100" },
  { item: "Onions", qty: "25 kg", cost: "₹1,250" },
  { item: "Tomatoes", qty: "20 kg", cost: "₹1,400" },
];

const lowStockAlerts = [
  { sku: "RAW-012", name: "Fresh Cream", current: 2, par: 10, unit: "L" },
  { sku: "RAW-045", name: "Mushrooms", current: 1.5, par: 5, unit: "kg" },
  { sku: "RAW-088", name: "Saffron", current: 0.1, par: 0.5, unit: "kg" },
  { sku: "PKG-002", name: "Takeaway Boxes", current: 150, par: 500, unit: "pcs" },
];

export function InventoryDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-brand hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[13px] font-medium text-text-secondary mb-1">Inventory Valuation</p>
              <h3 className="text-2xl font-bold text-text-primary">₹12.4L</h3>
            </div>
            <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[12px]">
            <ArrowUpRight className="h-3 w-3 text-success mr-1" />
            <span className="text-success font-medium">2.4%</span>
            <span className="text-text-secondary ml-1">vs last month</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-success hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[13px] font-medium text-text-secondary mb-1">Today's Consumption</p>
              <h3 className="text-2xl font-bold text-text-primary">₹24,500</h3>
            </div>
            <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center text-success">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[12px]">
            <span className="text-text-secondary">Food Cost: </span>
            <span className="text-text-primary font-bold ml-1"> 28.5%</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-warning hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[13px] font-medium text-text-secondary mb-1">Low Stock Items</p>
              <h3 className="text-2xl font-bold text-text-primary">12</h3>
            </div>
            <div className="h-8 w-8 rounded-full bg-warning/10 flex items-center justify-center text-warning">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[12px]">
            <span className="text-error font-medium">3 Critical</span>
            <span className="text-text-secondary ml-1">requiring immediate PO</span>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-info hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[13px] font-medium text-text-secondary mb-1">Pending Deliveries</p>
              <h3 className="text-2xl font-bold text-text-primary">5</h3>
            </div>
            <div className="h-8 w-8 rounded-full bg-info/10 flex items-center justify-center text-info">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[12px]">
            <span className="text-text-secondary">Expected today: </span>
            <span className="text-text-primary font-bold ml-1"> 2 Vendors</span>
          </div>
        </Card>
      </div>

      {/* Middle Row: Charts & Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader title="Consumption vs Revenue (7 Days)" />
          <div className="p-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={consumptionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₹${Number(value || 0).toLocaleString()}`, undefined]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="value" name="Revenue" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                <Area type="monotone" dataKey="cost" name="Food Cost" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Consumed */}
        <Card>
          <CardHeader title="Top Consumed Items" hint="By Volume" />
          <div className="p-0">
            <ul className="divide-y divide-border">
              {topConsumed.map((item, idx) => (
                <li key={idx} className="p-4 flex items-center justify-between hover:bg-surface-2/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-surface-2 flex items-center justify-center text-text-secondary border border-border">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-text-primary">{item.item}</p>
                      <p className="text-[11px] text-text-secondary">{item.qty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-mono text-text-primary">{item.cost}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {/* Bottom Row: Low Stock Alerts */}
      <Card>
        <CardHeader 
          title="Low Stock Alerts" 
          hint="Items below par level" 
          action={<button className="text-[13px] text-brand hover:underline font-medium">Create PO</button>} 
        />
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-surface-2/40 text-left">
                <th className="px-4 py-3 font-medium text-text-secondary">SKU</th>
                <th className="px-4 py-3 font-medium text-text-secondary">Item Name</th>
                <th className="px-4 py-3 font-medium text-text-secondary text-right">Current Stock</th>
                <th className="px-4 py-3 font-medium text-text-secondary text-right">Par Level</th>
                <th className="px-4 py-3 font-medium text-text-secondary text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStockAlerts.map((item, idx) => {
                const isCritical = item.current <= item.par * 0.3;
                return (
                  <tr key={idx} className="border-b border-border-subtle hover:bg-surface-2/40">
                    <td className="px-4 py-3 font-mono text-[12px] text-text-secondary">{item.sku}</td>
                    <td className="px-4 py-3 font-medium text-text-primary">{item.name}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-mono font-bold ${isCritical ? 'text-error' : 'text-warning'}`}>
                        {item.current} {item.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-text-secondary text-right">{item.par} {item.unit}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        isCritical ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning-dark'
                      }`}>
                        {isCritical ? 'Critical' : 'Reorder'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
