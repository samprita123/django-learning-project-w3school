import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ArrowRight,
  ArrowLeft,
  IdCard,
  KeyRound,
  CreditCard,
  CheckCircle2,
  Camera,
  AlertCircle,
  CalendarClock,
  Building2,
  Gift,
  Footprints,
  Users,
  Clock,
} from "lucide-react";
import {
  PageHeader,
  Card,
  CardHeader,
  Button,
  StatusBadge,
  KpiCard,
} from "@/components/ui/Primitives";
import {
  useFrontDeskArrivalQueueQuery,
  useFrontDeskCheckoutQueueQuery,
  useFrontDeskWorkflowReservationsQuery,
  useOnlineCheckInsQuery,
} from "@/services/mock/queries";
import type {
  FrontDeskBlockerCode,
  FrontDeskChecklistKey,
  FrontDeskWorkflowReservation,
  ReservationType,
} from "@/types/pms";

const CHECKIN_STEPS: FrontDeskChecklistKey[] = [
  "find_guest",
  "verify_id",
  "assign_room",
  "collect_payment",
  "issue_key",
];

const BLOCKER_LABEL: Record<FrontDeskBlockerCode, string> = {
  missing_id: "Missing guest ID verification",
  pending_po: "Corporate PO/reference is pending",
  unsettled_folio: "Outstanding folio balance exists",
  room_not_ready: "Assigned room is not housekeeping-ready",
  pickup_mismatch: "Group pickup/rooming list mismatch",
  event_overage_pending: "Event overage charges still pending",
};

const TYPE_META: Record<
  ReservationType,
  {
    label: string;
    tone: "brand" | "info" | "warning" | "success" | "neutral";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  individual: { label: "Individual", tone: "info", icon: IdCard },
  group: { label: "Group", tone: "warning", icon: Users },
  corporate: { label: "Corporate", tone: "brand", icon: Building2 },
  package: { label: "Package", tone: "success", icon: Gift },
  walkin: { label: "Walk-In", tone: "neutral", icon: Footprints },
  event: { label: "Event", tone: "warning", icon: CalendarClock },
};

const STATUS_LABEL: Record<FrontDeskWorkflowReservation["frontDeskStatus"], string> = {
  pre_arrival: "Pre-arrival",
  pending_id: "Pending ID",
  pending_payment: "Pending payment",
  room_assigned: "Room assigned",
  checked_in: "Checked in",
  checkout_due: "Checkout due",
  checkout_in_progress: "Checkout in progress",
  checked_out: "Checked out",
  no_show: "No-show",
  cancelled: "Cancelled",
};

function stepLabelForType(type: ReservationType, key: FrontDeskChecklistKey) {
  if (type === "event" && key === "collect_payment") return "Settle advance/banquet billing";
  if (type === "group" && key === "assign_room") return "Batch assign room block";
  if (type === "corporate" && key === "collect_payment") return "Validate PO/direct bill";
  if (type === "walkin" && key === "find_guest") return "Capture walk-in profile";
  return {
    find_guest: "Find guest",
    verify_id: "Verify ID",
    assign_room: "Assign room",
    collect_payment: "Payment",
    issue_key: "Issue key",
    review_folio: "Review folio",
    return_key: "Return key",
    send_invoice: "Send invoice",
    handover_hk: "Handover HK",
  }[key];
}

function blockerForStep(stepKey: FrontDeskChecklistKey): FrontDeskBlockerCode[] {
  if (stepKey === "verify_id") return ["missing_id"];
  if (stepKey === "assign_room") return ["room_not_ready", "pickup_mismatch"];
  if (stepKey === "collect_payment")
    return ["pending_po", "unsettled_folio", "event_overage_pending"];
  return [];
}

export function CheckInFeature() {
  const { data: arrivalsToday = [] } = useFrontDeskArrivalQueueQuery();
  const { data: departuresToday = [] } = useFrontDeskCheckoutQueueQuery();
  const { data: allWorkflowReservations = [] } = useFrontDeskWorkflowReservationsQuery();
  const { data: onlineCheckIns = [] } = useOnlineCheckInsQuery();

  const [tab, setTab] = useState<"checkin" | "online" | "checkout">("checkin");
  const pendingOnline = onlineCheckIns.filter((o) => o.status === "Pending review").length;

  const [selectedArrivalId, setSelectedArrivalId] = useState<string>("");
  const [selectedCheckoutId, setSelectedCheckoutId] = useState<string>("");
  const [step, setStep] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<string>("");

  useEffect(() => {
    if (!selectedArrivalId && arrivalsToday[0]) setSelectedArrivalId(arrivalsToday[0].id);
  }, [arrivalsToday, selectedArrivalId]);

  useEffect(() => {
    if (!selectedCheckoutId && departuresToday[0]) setSelectedCheckoutId(departuresToday[0].id);
  }, [departuresToday, selectedCheckoutId]);

  const selectedArrival = useMemo(
    () => arrivalsToday.find((r) => r.id === selectedArrivalId) ?? arrivalsToday[0],
    [arrivalsToday, selectedArrivalId],
  );

  const selectedCheckout = useMemo(
    () => departuresToday.find((r) => r.id === selectedCheckoutId) ?? departuresToday[0],
    [departuresToday, selectedCheckoutId],
  );

  useEffect(() => {
    setStep(0);
    if (selectedArrival?.room) setSelectedRoom(selectedArrival.room);
  }, [selectedArrival?.id, selectedArrival?.room]);

  const currentStepKey = CHECKIN_STEPS[step] ?? "find_guest";
  const stepChecklistItem = selectedArrival?.checkinChecklist.find((x) => x.key === currentStepKey);
  const blockersForCurrentStep = blockerForStep(currentStepKey);
  const activeBlockers =
    selectedArrival?.blockerCodes.filter((x) => blockersForCurrentStep.includes(x)) ?? [];
  const canAdvanceCurrentStep =
    (stepChecklistItem?.required ? stepChecklistItem.done : true) && activeBlockers.length === 0;

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Check-In / Check-Out"
        description="Three-click arrivals. One-tap departures with auto-folio close."
      />

      <div className="responsive-page-x space-y-5 py-4 sm:space-y-6 sm:py-6">
        <div className="w-full overflow-x-auto">
          <div className="flex min-w-max rounded-md border border-border bg-surface p-0.5 text-[13px]">
            <button
              type="button"
              onClick={() => setTab("checkin")}
              className={`rounded px-4 py-1.5 transition ${
                tab === "checkin" ? "bg-foreground text-background" : "text-text-secondary"
              }`}
            >
              Walk-in check-in
            </button>
            <button
              type="button"
              onClick={() => setTab("online")}
              className={`rounded px-4 py-1.5 transition ${
                tab === "online" ? "bg-foreground text-background" : "text-text-secondary"
              }`}
            >
              Online pre-check-in · {onlineCheckIns.length}
            </button>
            <button
              type="button"
              onClick={() => setTab("checkout")}
              className={`rounded px-4 py-1.5 transition ${
                tab === "checkout" ? "bg-foreground text-background" : "text-text-secondary"
              }`}
            >
              Check-Out · {departuresToday.length}
            </button>
          </div>
        </div>

        {tab === "online" && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                label="Pre-check-ins today"
                value={String(onlineCheckIns.length)}
                accent="brand"
              />
              <KpiCard label="Pending review" value={String(pendingOnline)} accent="warning" />
              <KpiCard label="Completed" value="1" accent="success" />
              <KpiCard label="Avg completion" value="4.2 min" accent="info" />
            </div>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
              <Card>
                <CardHeader title="Online queue" hint="Sorted by ETA" />
                <ul className="divide-y divide-border-subtle">
                  {onlineCheckIns.map((o, i) => {
                    const linked = allWorkflowReservations.find((r) => r.id === o.resId);
                    const type = linked?.reservationType ?? "individual";
                    const typeMeta = TYPE_META[type];
                    return (
                      <li
                        key={o.resId}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition ${
                          i === 0 ? "bg-primary-tint/40" : "hover:bg-surface-2/60"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-medium text-text-primary">{o.guest}</div>
                          <div className="text-[11px] text-text-secondary">
                            {o.resId} · {o.roomType}
                          </div>
                          <div className="mt-1">
                            <StatusBadge tone={typeMeta.tone}>{typeMeta.label}</StatusBadge>
                          </div>
                        </div>
                        <StatusBadge
                          tone={
                            o.status === "Approved"
                              ? "success"
                              : o.status === "Needs info"
                                ? "error"
                                : "warning"
                          }
                        >
                          {o.status}
                        </StatusBadge>
                      </li>
                    );
                  })}
                </ul>
              </Card>
              <Card>
                <CardHeader
                  title="Verify · Elena Rodriguez"
                  hint={
                    onlineCheckIns[0]
                      ? `${onlineCheckIns[0].resId} · ETA ${onlineCheckIns[0].eta}`
                      : "No pending rows"
                  }
                />
                {onlineCheckIns[0] ? (
                  <div className="space-y-4 p-4 text-[13px] sm:p-5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <VerifyRow label="ID verified" ok={onlineCheckIns[0].idVerified} />
                      <VerifyRow label="Payment" value={onlineCheckIns[0].paymentStatus} />
                      <VerifyRow label="Room type" value={onlineCheckIns[0].roomType} />
                      <VerifyRow label="ETA" value={onlineCheckIns[0].eta} />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button size="sm">Approve & assign room</Button>
                      <Button size="sm" variant="outline">
                        Request more info
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 text-[13px] text-text-secondary">
                    No online pre-check-ins right now.
                  </div>
                )}
              </Card>
            </div>
          </>
        )}

        {tab === "checkin" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
            {/* Arrivals queue */}
            <Card>
              <CardHeader title="Arrivals queue" hint="Typed by reservation flow" />
              <div className="border-b border-border-subtle p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-disabled" />
                  <input
                    className="h-8 w-full rounded-md border border-border bg-surface pl-8 pr-2 text-[12px]"
                    placeholder="Search name / RES no…"
                  />
                </div>
              </div>
              <ul className="max-h-[540px] divide-y divide-border-subtle overflow-y-auto scrollbar-thin sm:max-h-[640px]">
                {arrivalsToday.map((r, i) => {
                  const typeMeta = TYPE_META[r.reservationType];
                  const Icon = typeMeta.icon;
                  return (
                    <li
                      key={r.id}
                      onClick={() => setSelectedArrivalId(r.id)}
                      className={`flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-surface-2/60 transition ${
                        selectedArrival?.id === r.id
                          ? "bg-primary-tint/40"
                          : i === 0
                            ? "bg-surface-2/20"
                            : ""
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 text-text-secondary" />
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                        {r.guest
                          .split(" ")
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-medium text-text-primary">
                          {r.guest}
                        </div>
                        <div className="text-[11px] text-text-secondary">
                          {r.id} · {r.nights}N · {STATUS_LABEL[r.frontDeskStatus]}
                        </div>
                        <div className="mt-1">
                          <StatusBadge tone={typeMeta.tone}>{typeMeta.label}</StatusBadge>
                        </div>
                      </div>
                      <StatusBadge tone={r.blockerCodes.length ? "warning" : "success"}>
                        {r.blockerCodes.length ? `${r.blockerCodes.length} blockers` : "Ready"}
                      </StatusBadge>
                    </li>
                  );
                })}
              </ul>
            </Card>

            {/* Wizard */}
            <Card>
              <CardHeader
                title={`Express check-in · ${selectedArrival?.guest ?? "No arrival selected"}`}
                hint={
                  selectedArrival
                    ? `${selectedArrival.id} · ${selectedArrival.source} · ${selectedArrival.nights} nights`
                    : "Select a reservation from queue"
                }
                action={
                  selectedArrival ? (
                    <StatusBadge tone={selectedArrival.balance ? "warning" : "success"}>
                      {selectedArrival.balance
                        ? `Pending balance ₹${selectedArrival.balance.toLocaleString()}`
                        : "Balance settled"}
                    </StatusBadge>
                  ) : null
                }
              />

              {/* Stepper */}
              <div className="flex items-center gap-2 overflow-x-auto border-b border-border-subtle px-4 py-3 text-[12px] sm:px-5">
                {CHECKIN_STEPS.map((s, i) => (
                  <div key={s} className="flex items-center gap-2 whitespace-nowrap">
                    <button
                      onClick={() => setStep(i)}
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold transition ${
                        i < step
                          ? "bg-[var(--color-success)] text-white"
                          : i === step
                            ? "bg-primary text-primary-foreground"
                            : "border border-border text-text-disabled"
                      }`}
                    >
                      {i < step ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                    </button>
                    <span className={i <= step ? "text-text-primary" : "text-text-disabled"}>
                      {selectedArrival
                        ? stepLabelForType(selectedArrival.reservationType, s)
                        : stepLabelForType("individual", s)}
                    </span>
                    {i < CHECKIN_STEPS.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-text-disabled" />
                    )}
                  </div>
                ))}
              </div>

              {selectedArrival?.blockerCodes.length ? (
                <div className="border-b border-border-subtle bg-[oklch(0.98_0.03_70)] px-5 py-2.5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-secondary">
                    <span className="font-medium text-text-primary">Action blockers:</span>
                    {selectedArrival.blockerCodes.map((code) => (
                      <StatusBadge key={code} tone="warning">
                        {BLOCKER_LABEL[code]}
                      </StatusBadge>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="p-4 sm:p-5">
                {selectedArrival ? (
                  <>
                    {step === 0 && <StepFind reservation={selectedArrival} />}
                    {step === 1 && <StepID reservation={selectedArrival} />}
                    {step === 2 && (
                      <StepRoom
                        reservation={selectedArrival}
                        selected={selectedRoom}
                        onSelect={setSelectedRoom}
                      />
                    )}
                    {step === 3 && <StepPayment reservation={selectedArrival} />}
                    {step === 4 && <StepKey reservation={selectedArrival} room={selectedRoom} />}
                  </>
                ) : (
                  <div className="text-[13px] text-text-secondary">
                    No arrivals available for check-in.
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle bg-surface-2/40 px-4 py-3 sm:px-5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </Button>
                {step < 4 ? (
                  <Button
                    size="sm"
                    onClick={() => setStep((s) => Math.min(4, s + 1))}
                    disabled={!selectedArrival || !canAdvanceCurrentStep}
                  >
                    Continue
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={Boolean(selectedArrival?.blockerCodes.length)}
                    title={
                      selectedArrival?.blockerCodes.length
                        ? "Resolve blockers before completing check-in."
                        : undefined
                    }
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Complete check-in
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}

        {tab === "checkout" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader
                title="Express check-out"
                hint="Auto-charged on opt-in"
                action={<StatusBadge tone="info">Card on file</StatusBadge>}
              />
              <ul className="divide-y divide-border-subtle">
                {departuresToday.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5 sm:py-3.5"
                  >
                    <div>
                      <div className="text-[14px] font-medium text-text-primary">{r.guest}</div>
                      <div className="text-[11px] text-text-secondary">
                        Room {r.room} · final folio emailed at 06:00 ·{" "}
                        {TYPE_META[r.reservationType].label}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Confirm auto-charge
                    </Button>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeader
                title="Standard check-out"
                hint={
                  selectedCheckout
                    ? `Selected: ${selectedCheckout.guest} (${TYPE_META[selectedCheckout.reservationType].label})`
                    : "Folio review · multi-tender · GST invoice"
                }
              />
              <ul className="divide-y divide-border-subtle">
                {departuresToday.map((r) => (
                  <li
                    key={r.id}
                    onClick={() => setSelectedCheckoutId(r.id)}
                    className={`flex cursor-pointer flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-surface-2/40 sm:px-5 sm:py-3.5 ${
                      selectedCheckout?.id === r.id ? "bg-primary-tint/30" : ""
                    }`}
                  >
                    <div>
                      <div className="text-[14px] font-medium text-text-primary">{r.guest}</div>
                      <div className="text-[11px] text-text-secondary">
                        Room {r.room} · Checkout 11:00 · {STATUS_LABEL[r.frontDeskStatus]}
                      </div>
                      <div className="mt-1">
                        <StatusBadge tone={TYPE_META[r.reservationType].tone}>
                          {TYPE_META[r.reservationType].label}
                        </StatusBadge>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {r.balance ? (
                        <StatusBadge tone="warning">₹{r.balance.toLocaleString()} due</StatusBadge>
                      ) : (
                        <StatusBadge tone="success">Settled</StatusBadge>
                      )}
                      <Button
                        size="sm"
                        disabled={
                          r.blockerCodes.includes("unsettled_folio") ||
                          r.blockerCodes.includes("event_overage_pending")
                        }
                      >
                        Settle & checkout
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader
                title="Checkout controls"
                hint="Per-type settlement + closure checklist"
              />
              {selectedCheckout ? (
                <div className="grid grid-cols-1 gap-5 p-4 sm:p-5 lg:grid-cols-[1.2fr_1fr]">
                  <div className="space-y-4">
                    <div className="rounded-md border border-border bg-surface p-4">
                      <div className="label-uppercase">Settlement strategy</div>
                      <div className="mt-2 text-[13px] text-text-secondary">
                        {checkoutStrategyForType(selectedCheckout)}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button size="sm">Review folio</Button>
                        <Button size="sm" variant="outline">
                          Post adjustment
                        </Button>
                        <Button size="sm" variant="outline">
                          Transfer to city ledger
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-md border border-border bg-surface p-4">
                      <div className="label-uppercase">Operational blockers</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedCheckout.blockerCodes.length ? (
                          selectedCheckout.blockerCodes.map((code) => (
                            <StatusBadge key={code} tone="warning">
                              {BLOCKER_LABEL[code]}
                            </StatusBadge>
                          ))
                        ) : (
                          <StatusBadge tone="success">No blockers</StatusBadge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-md border border-border bg-surface-2/40 p-4">
                    <div className="label-uppercase">Closure checklist</div>
                    <div className="mt-3 space-y-2">
                      {selectedCheckout.checkoutChecklist.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-start gap-2 rounded border border-border-subtle bg-surface px-3 py-2"
                        >
                          <span
                            className={`mt-1 h-2 w-2 rounded-full ${item.done ? "bg-success" : "bg-warning"}`}
                          />
                          <div className="text-[12px]">
                            <div className="font-medium text-text-primary">
                              {stepLabelForType(selectedCheckout.reservationType, item.key)}
                            </div>
                            {item.note ? (
                              <div className="text-text-secondary">{item.note}</div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      className="mt-4 w-full"
                      size="sm"
                      disabled={selectedCheckout.blockerCodes.length > 0}
                    >
                      Complete checkout
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-5 text-[13px] text-text-secondary">No checkouts pending.</div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";

function StepFind({ reservation }: { reservation: FrontDeskWorkflowReservation }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <FieldRow label="Guest name" value={reservation.guest} />
      <FieldRow label="Source" value={reservation.source} />
      <FieldRow label="Reservation" value={reservation.id} mono />
      <FieldRow label="Room" value={reservation.room} mono />
      <FieldRow
        label="Stay"
        value={`${reservation.ci} → ${reservation.co} · ${reservation.nights} nights`}
      />
      <FieldRow label="Type" value={TYPE_META[reservation.reservationType].label} />
    </div>
  );
}

function StepID({ reservation }: { reservation: FrontDeskWorkflowReservation }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_280px]">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label>
          <div className="label-uppercase mb-1">ID type</div>
          <select className={inputCls}>
            <option>Passport</option>
            <option>Aadhaar</option>
            <option>Driving licence</option>
          </select>
        </label>
        <label>
          <div className="label-uppercase mb-1">ID number</div>
          <input className={inputCls} defaultValue="UK-PP 893421" />
        </label>
        <label>
          <div className="label-uppercase mb-1">Nationality</div>
          <input className={inputCls} defaultValue="United Kingdom" />
        </label>
        <label>
          <div className="label-uppercase mb-1">Date of birth</div>
          <input type="date" className={inputCls} defaultValue="1989-04-12" />
        </label>
        <label className="col-span-2">
          <div className="label-uppercase mb-1">Form C (foreign nationals)</div>
          <div className="rounded-md border border-border bg-surface-2/40 px-3 py-2 text-[12px] text-text-secondary">
            Auto-generated from passport scan · ready to file
          </div>
        </label>
      </div>
      <div className="rounded-md border-2 border-dashed border-border bg-surface-2/30 p-6 text-center">
        <Camera className="mx-auto h-8 w-8 text-text-disabled" />
        <div className="mt-2 text-[12px] font-medium text-text-primary">Scan / upload ID</div>
        <div className="text-[11px] text-text-secondary">
          {reservation.reservationType === "walkin"
            ? "Mandatory for walk-in profile activation"
            : "Front + back · OCR extracts fields"}
        </div>
        <Button size="sm" variant="outline" className="mt-3">
          <IdCard className="h-3.5 w-3.5" />
          Scan now
        </Button>
      </div>
    </div>
  );
}

function StepRoom({
  reservation,
  selected,
  onSelect,
}: {
  reservation: FrontDeskWorkflowReservation;
  selected: string;
  onSelect: (r: string) => void;
}) {
  const ready = ["104", "108", "204", "207", "211", "303", "308", "402"];
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[12px] text-text-secondary">
          Pre-assigned:{" "}
          <span className="font-mono text-text-primary">
            {reservation.room} · {reservation.type}
          </span>
        </div>
        <div className="flex gap-2">
          {reservation.reservationType === "group" ? (
            <Button size="sm" variant="outline">
              Batch assign room block
            </Button>
          ) : null}
          <Button size="sm" variant="outline">
            Suggest upgrade
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {ready.map((n) => (
          <button
            key={n}
            onClick={() => onSelect(n)}
            className={`aspect-[3/2.4] rounded-md border-2 p-2 text-left transition ${
              selected === n
                ? "border-primary bg-primary-tint"
                : "border-[var(--color-success)] bg-[oklch(0.96_0.04_152)]"
            }`}
          >
            <div
              className={`font-mono text-[13px] font-semibold ${
                selected === n ? "text-primary" : "text-[var(--color-success)]"
              }`}
            >
              {n}
            </div>
            <div className="text-[10px] text-text-secondary">Ready</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepPayment({ reservation }: { reservation: FrontDeskWorkflowReservation }) {
  return (
    <div>
      <div className="mb-3 flex items-start gap-3 rounded-md border border-[var(--color-warning)]/30 bg-[oklch(0.97_0.05_70)] p-3 text-[12px]">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warning)]" />
        <div className="flex-1">
          <div className="font-medium text-text-primary">Outstanding balance: ₹4,800</div>
          <div className="text-text-secondary">
            {reservation.billingMode === "direct_bill"
              ? "Validate PO and move charge to city ledger before key issue."
              : "Collect before issuing key. Payment can be split across tenders."}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { name: "Card", hint: "Visa · MC · RuPay · Amex" },
          { name: "UPI", hint: "Scan QR · GPay · PhonePe" },
          { name: "Cash", hint: "INR · counter receipt" },
        ].map((p) => (
          <button
            key={p.name}
            className="rounded-lg border border-border bg-surface p-4 text-left hover:border-primary"
          >
            <CreditCard className="mb-2 h-5 w-5 text-primary" />
            <div className="text-[14px] font-semibold text-text-primary">{p.name}</div>
            <div className="text-[11px] text-text-secondary">{p.hint}</div>
          </button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label>
          <div className="label-uppercase mb-1">Amount</div>
          <input className={inputCls} defaultValue="₹4,800" />
        </label>
        <label>
          <div className="label-uppercase mb-1">Reference</div>
          <input className={inputCls} placeholder="TXN / approval code" />
        </label>
      </div>
    </div>
  );
}

function StepKey({
  reservation,
  room,
}: {
  reservation: FrontDeskWorkflowReservation;
  room: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-tint">
        <KeyRound className="h-7 w-7 text-primary" />
      </div>
      <div className="mt-3 font-display text-[20px] font-semibold text-text-primary">
        Issue key card · Room {room}
      </div>
      <div className="mt-1 text-[12px] text-text-secondary">
        Encoder Lobby-A · valid until {reservation.co} 11:00
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Button variant="outline" size="sm">
          Print welcome letter
        </Button>
        <Button size="sm">
          <KeyRound className="h-3.5 w-3.5" />
          Encode keys (×2)
        </Button>
      </div>
    </div>
  );
}

function checkoutStrategyForType(reservation: FrontDeskWorkflowReservation) {
  if (reservation.reservationType === "group") {
    return "Group checkout: settle master folio plus validate per-room incidentals before final departure close.";
  }
  if (reservation.reservationType === "corporate") {
    return "Corporate checkout: route eligible charges to city ledger and collect only non-billable incidentals from guest.";
  }
  if (reservation.reservationType === "package") {
    return "Package checkout: reconcile package entitlements consumed vs unused credits, then close folio.";
  }
  if (reservation.reservationType === "walkin") {
    return "Walk-in checkout: quick settle with deposit reconciliation and instant tax invoice handover.";
  }
  if (reservation.reservationType === "event") {
    return "Event checkout: settle venue/catering/AV split and close overage charges before checkout completion.";
  }
  return "Standard checkout: verify folio, collect dues/refund credits, issue invoice, and close room status.";
}

function VerifyRow({ label, ok, value }: { label: string; ok?: boolean; value?: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-2/40 p-2.5">
      <div className="label-uppercase text-[9px]">{label}</div>
      <div className="mt-0.5 font-medium text-text-primary">
        {value ?? (ok ? "Yes" : "Pending")}
      </div>
    </div>
  );
}

function FieldRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="label-uppercase text-[10px]">{label}</div>
      <div className={`mt-1 text-[13px] text-text-primary ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
export default CheckInFeature;
