import { useState } from "react";
import {
  PageHeader,
  KpiCard,
  Card,
  CardHeader,
  StatusBadge,
  Button,
} from "@/components/ui/Primitives";
import { useRegistrationCardsQuery } from "@/services/mock/queries";

export function RegistrationCardsFeature() {
  const { data: registrationCards = [] } = useRegistrationCardsQuery();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected =
    registrationCards.find((r) => r.id === selectedId) ?? registrationCards[0] ?? null;
  const signed = registrationCards.filter((r) => r.status === "Signed").length;

  return (
    <div>
      <PageHeader
        eyebrow="Guests"
        title="Digital Registration Cards"
        description="E-sign capture and compliance archive."
      />
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Signed today" value={String(signed)} accent="success" />
          <KpiCard label="Pending signature" value="1" accent="warning" />
          <KpiCard label="Exceptions" value="1" accent="error" />
          <KpiCard label="Avg sign time" value="2.1 min" accent="info" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <Card>
            <CardHeader title="Registration archive" />
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-surface-2/40 text-left">
                  {["ID", "Guest", "Reservation", "Status", "Signed"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {registrationCards.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className={`cursor-pointer border-b border-border-subtle hover:bg-surface-2/50 ${selected?.id === r.id ? "bg-primary-tint/30" : ""}`}
                  >
                    <td className="px-4 py-3 font-mono text-[12px]">{r.id}</td>
                    <td className="px-4 py-3 font-medium">{r.guest}</td>
                    <td className="px-4 py-3 font-mono">{r.resId}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        tone={
                          r.status === "Signed"
                            ? "success"
                            : r.status === "Pending"
                              ? "warning"
                              : "error"
                        }
                      >
                        {r.status}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{r.signedAt ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card>
            <CardHeader title="Preview" hint={selected?.template ?? "No card selected"} />
            {selected ? (
              <div className="space-y-3 p-5 text-[13px]">
                <p className="font-display text-[16px] font-semibold">Registration card</p>
                <p className="text-text-secondary">Guest: {selected.guest}</p>
                <p className="text-text-secondary">Reservation: {selected.resId}</p>
                <div className="mt-4 rounded-md border border-dashed border-border bg-surface-2/40 p-8 text-center text-[12px] text-text-secondary">
                  PDF preview · {selected.status}
                </div>
                <Button variant="outline" size="sm" className="w-full justify-center">
                  Download PDF
                </Button>
              </div>
            ) : (
              <div className="p-5 text-[13px] text-text-secondary">
                No registration cards available.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
export default RegistrationCardsFeature;
