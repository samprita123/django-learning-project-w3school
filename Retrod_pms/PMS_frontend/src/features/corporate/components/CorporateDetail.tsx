import { useState } from "react";
import { type CorporateAccount } from "@/types/pms";
import { PageHeader, Card, CardHeader, Button, StatusBadge } from "@/components/ui/Primitives";
import { ArrowLeft, Building2, FileText, CreditCard, CalendarRange, Briefcase } from "lucide-react";

interface CorporateDetailProps {
  account: CorporateAccount;
  onBack: () => void;
}

export function CorporateDetail({ account, onBack }: CorporateDetailProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "rates" | "billing" | "reservations">("overview");

  const tabs = [
    { id: "overview", label: "Overview & Production", icon: <Building2 className="h-4 w-4" /> },
    { id: "rates", label: "Negotiated Rates", icon: <FileText className="h-4 w-4" /> },
    { id: "billing", label: "Direct Billing (AR)", icon: <CreditCard className="h-4 w-4" /> },
    { id: "reservations", label: "Active Reservations", icon: <CalendarRange className="h-4 w-4" /> },
  ] as const;

  return (
    <div>
      <PageHeader
        eyebrow="Corporate Account"
        title={account.company}
        description={`Rate Code: ${account.rateCode} | Contact: ${account.contact || "—"}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              Back to Accounts
            </Button>
            <Button size="sm">
              <Briefcase className="h-3.5 w-3.5 mr-1" />
              New Corporate Booking
            </Button>
          </>
        }
      />

      <div className="px-6 border-b border-border-subtle bg-surface flex gap-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 flex items-center gap-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id 
                ? "border-primary text-primary" 
                : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === "overview" && <OverviewTab account={account} />}
        {activeTab === "rates" && <RatesTab account={account} />}
        {activeTab === "billing" && <BillingTab account={account} />}
        {activeTab === "reservations" && <ReservationsTab account={account} />}
      </div>
    </div>
  );
}

function OverviewTab({ account }: { account: CorporateAccount }) {
  const target = account.annualRoomNightTarget || 0;
  const ytd = account.ytdRoomNights || 0;
  const progress = target > 0 ? Math.min((ytd / target) * 100, 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader title="Company Profile" />
        <div className="p-4 space-y-4 text-sm">
          <div className="flex justify-between border-b border-border-subtle pb-2">
            <span className="text-text-secondary">Company Name</span>
            <span className="font-medium text-text-primary">{account.company}</span>
          </div>
          <div className="flex justify-between border-b border-border-subtle pb-2">
            <span className="text-text-secondary">Tax ID / GST</span>
            <span className="font-mono text-text-primary">{account.taxId || "—"}</span>
          </div>
          <div className="flex justify-between border-b border-border-subtle pb-2">
            <span className="text-text-secondary">Address</span>
            <span className="font-medium text-text-primary text-right max-w-[200px] truncate" title={account.address}>{account.address || "—"}</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Primary Contact" />
        <div className="p-4 space-y-4 text-sm">
          <div className="flex justify-between border-b border-border-subtle pb-2">
            <span className="text-text-secondary">Contact Name</span>
            <span className="font-medium text-text-primary">{account.contact || "—"}</span>
          </div>
          <div className="flex justify-between border-b border-border-subtle pb-2">
            <span className="text-text-secondary">Email</span>
            <span className="font-medium text-primary hover:underline cursor-pointer">{account.contactEmail || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Phone</span>
            <span className="font-medium text-text-primary">{account.contactPhone || "—"}</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Production Tracker (YTD)" />
        <div className="p-4 space-y-4 text-sm">
          <div className="flex justify-between border-b border-border-subtle pb-2">
            <span className="text-text-secondary">Annual Target</span>
            <span className="font-medium text-text-primary">{target} room nights</span>
          </div>
          <div className="flex justify-between border-b border-border-subtle pb-2">
            <span className="text-text-secondary">YTD Actualized</span>
            <span className="font-medium text-[var(--color-success)]">{ytd} room nights</span>
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-text-secondary mb-1 uppercase tracking-wider font-medium">
              <span>Pacing</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-success)]" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function RatesTab({ account }: { account: CorporateAccount }) {
  if (!account.contracts || account.contracts.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-16">
        <p className="text-text-secondary text-sm">No negotiated rates configured for this account.</p>
        <Button size="sm" className="mt-4">Add Rate Contract</Button>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Negotiated Rate Contracts" action={<Button size="sm" variant="outline">Add Contract</Button>} />
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-2/40 text-left">
              <th className="px-4 py-2.5 font-medium text-text-secondary uppercase tracking-wider text-[10px]">Rate Code</th>
              <th className="px-4 py-2.5 font-medium text-text-secondary uppercase tracking-wider text-[10px]">Room Type</th>
              <th className="px-4 py-2.5 font-medium text-text-secondary uppercase tracking-wider text-[10px]">Discount Type</th>
              <th className="px-4 py-2.5 font-medium text-text-secondary uppercase tracking-wider text-[10px]">Value</th>
              <th className="px-4 py-2.5 font-medium text-text-secondary uppercase tracking-wider text-[10px]">LRA / NLRA</th>
              <th className="px-4 py-2.5 font-medium text-text-secondary uppercase tracking-wider text-[10px]">Blackout Dates</th>
              <th className="px-4 py-2.5 font-medium text-text-secondary uppercase tracking-wider text-[10px]"></th>
            </tr>
          </thead>
          <tbody>
            {account.contracts.map((c, i) => (
              <tr key={i} className="border-b border-border-subtle hover:bg-surface-2/50">
                <td className="px-4 py-3 font-mono text-primary font-medium">{c.rateCode}</td>
                <td className="px-4 py-3 text-text-primary">{c.roomType}</td>
                <td className="px-4 py-3 text-text-secondary">{c.discountType}</td>
                <td className="px-4 py-3 font-mono text-text-primary">
                  {c.discountType === "Fixed" ? `₹${c.discountValue.toLocaleString()}` : `${c.discountValue}% Off`}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge tone={c.isLRA ? "success" : "warning"}>{c.isLRA ? "LRA" : "NLRA"}</StatusBadge>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {c.blackoutDates && c.blackoutDates.length > 0 ? c.blackoutDates.join(", ") : "None"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-primary hover:underline font-medium text-xs">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function BillingTab({ account }: { account: CorporateAccount }) {
  const aging = account.arAging;
  const limit = account.creditLimit || 0;
  const bal = account.currentBalance || 0;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader title="Accounts Receivable (City Ledger)" />
        <div className="p-4 space-y-4 text-sm">
          <div className="flex justify-between border-b border-border-subtle pb-2">
            <span className="text-text-secondary">Credit Limit</span>
            <span className="font-mono text-text-primary font-medium">₹{limit.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-b border-border-subtle pb-2">
            <span className="text-text-secondary">Current Balance</span>
            <span className="font-mono text-[var(--color-error)] font-medium">₹{bal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-b border-border-subtle pb-2">
            <span className="text-text-secondary">Available Credit</span>
            <span className="font-mono text-[var(--color-success)] font-medium">₹{(limit - bal).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Account Status</span>
            {bal > limit ? <StatusBadge tone="error">Credit Hold</StatusBadge> : <StatusBadge tone="success">In Good Standing</StatusBadge>}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="AR Aging Summary" action={<Button size="sm" variant="outline">View Invoices</Button>} />
        <div className="p-4">
          {!aging ? (
            <p className="text-text-secondary text-sm">No AR data available.</p>
          ) : (
            <div className="space-y-4">
              <AgingRow label="Current (0-30 Days)" amount={aging.current} color="var(--color-success)" />
              <AgingRow label="30-60 Days" amount={aging.thirtyDays} color="var(--color-warning)" />
              <AgingRow label="60-90 Days" amount={aging.sixtyDays} color="var(--color-warning)" />
              <AgingRow label="90+ Days (Overdue)" amount={aging.ninetyPlusDays} color="var(--color-error)" />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function AgingRow({ label, amount, color }: { label: string; amount: number; color: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-secondary font-medium">{label}</span>
      <span className="font-mono font-medium" style={{ color: amount > 0 ? color : "var(--color-text-primary)" }}>
        {amount > 0 ? `₹${amount.toLocaleString()}` : "—"}
      </span>
    </div>
  );
}

function ReservationsTab({ account }: { account: CorporateAccount }) {
  return (
    <Card>
      <CardHeader title="Active Reservations" hint={`Booked under ${account.rateCode}`} />
      <div className="p-16 flex flex-col items-center text-center">
        <CalendarRange className="h-10 w-10 text-text-disabled mb-4" />
        <h3 className="text-text-primary font-medium">No upcoming reservations</h3>
        <p className="text-sm text-text-secondary mt-1">There are no future reservations booked under this corporate account's rate code.</p>
      </div>
    </Card>
  );
}
