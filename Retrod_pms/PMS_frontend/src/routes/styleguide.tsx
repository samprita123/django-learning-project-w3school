import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Plus, Save } from "lucide-react";
import {
  PageHeader,
  Card,
  CardHeader,
  Button,
  KpiCard,
  StatusBadge,
  SectionDivider,
} from "@/components/ui/Primitives";

export const Route = createFileRoute("/styleguide")({
  component: StyleGuideRoute,
});

function swatch(label: string, className: string) {
  return (
    <div className="space-y-1">
      <div className={`h-12 rounded-md border border-border ${className}`} />
      <div className="text-[11px] text-text-secondary">{label}</div>
    </div>
  );
}

function StyleGuideRoute() {
  return (
    <div>
      <PageHeader
        eyebrow="Design"
        title="UI Styleguide"
        description="Reference page for Retrod tokens and shared primitives."
      />
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader title="Color Tokens" hint="Semantic token usage" />
          <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4 lg:grid-cols-8">
            {swatch("primary", "bg-primary")}
            {swatch("primary-tint", "bg-primary-tint")}
            {swatch("success", "bg-success")}
            {swatch("warning", "bg-warning")}
            {swatch("error", "bg-error")}
            {swatch("info", "bg-info")}
            {swatch("surface", "bg-surface")}
            {swatch("surface-2", "bg-surface-2")}
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Buttons" />
            <div className="flex flex-wrap gap-2 p-5">
              <Button>
                <Plus className="h-3.5 w-3.5" />
                Primary
              </Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">
                <AlertCircle className="h-3.5 w-3.5" />
                Danger
              </Button>
              <Button size="sm">
                <Save className="h-3.5 w-3.5" />
                Small
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Status Badges" />
            <div className="flex flex-wrap gap-2 p-5">
              <StatusBadge tone="success">Success</StatusBadge>
              <StatusBadge tone="warning">Warning</StatusBadge>
              <StatusBadge tone="error">Error</StatusBadge>
              <StatusBadge tone="info">Info</StatusBadge>
              <StatusBadge tone="neutral">Neutral</StatusBadge>
              <StatusBadge tone="brand">Brand</StatusBadge>
              <StatusBadge tone="dark">Dark</StatusBadge>
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader title="KPI Cards" />
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Occupancy" value="86%" delta="+4.2%" accent="success" />
            <KpiCard label="ADR" value="₹12,480" delta="-1.6%" deltaTone="error" accent="warning" />
            <KpiCard label="RevPAR" value="₹10,732" delta="+3.1%" accent="info" />
            <KpiCard label="Bookings" value="142" delta="+18 today" deltaTone="neutral" />
          </div>
        </Card>

        <Card>
          <CardHeader title="Typography & Utility" />
          <div className="space-y-3 p-5">
            <SectionDivider>Section Label</SectionDivider>
            <div className="font-display text-[26px] font-semibold text-text-primary">
              Display Heading
            </div>
            <div className="text-[14px] text-text-primary">Body text uses DM Sans token.</div>
            <div className="font-mono text-[13px] text-text-secondary">
              Monospace values use JetBrains Mono.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
