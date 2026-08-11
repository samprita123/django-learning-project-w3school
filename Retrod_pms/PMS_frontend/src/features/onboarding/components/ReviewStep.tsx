import { type OnboardingState } from "@/lib/onboarding-store";

interface ReviewStepProps {
  state: OnboardingState;
}

export function ReviewStep({ state }: ReviewStepProps) {
  const totalRooms = state.roomTypes.reduce((s, r) => s + r.count, 0);
  const connectedChannels = state.channelManager.channels
    .filter((channel) => channel.connected)
    .map((channel) => channel.label)
    .join(", ");
  const mappedChannels = state.channelManager.channels.filter((channel) => channel.mapped).length;
  const coverageRows: Array<{ label: string; done: boolean }> = [
    {
      label: "Property Information",
      done:
        state.profile.propertyName.trim().length > 1 &&
        state.profile.city.trim().length > 1 &&
        state.profile.contactEmail.includes("@"),
    },
    { label: "Room Configuration", done: state.roomTypes.length > 0 },
    { label: "Meal Plan Configuration", done: state.mealPlans.some((item) => item.active) },
    { label: "Rate Plan Configuration", done: state.ratePlans.some((item) => item.active) },
    { label: "Package Configuration", done: state.packages.some((item) => item.active) },
    { label: "User Setup", done: state.users.length > 0 },
    {
      label: "Tax Configuration",
      done: state.tax.gst >= 0 && state.tax.vat >= 0 && state.tax.cityTax >= 0,
    },
    {
      label: "Payment Configuration",
      done: state.payments.cash || state.payments.card || state.payments.upi,
    },
    {
      label: "Channel Manager Setup",
      done: state.channelManager.channels.some((channel) => channel.connected),
    },
    { label: "Booking Engine Setup", done: state.bookingEngine.enabled },
    {
      label: "Website Builder Setup",
      done:
        state.websiteBuilder.pagesConfigured &&
        state.websiteBuilder.roomsConfigured &&
        state.websiteBuilder.contactConfigured,
    },
    {
      label: "CRM Setup",
      done:
        state.crm.segmentsConfigured &&
        (state.crm.emailTemplatesConfigured ||
          state.crm.smsTemplatesConfigured ||
          state.crm.whatsappTemplatesConfigured),
    },
    {
      label: "Reservation Settings",
      done:
        state.reservationSettings.checkIn.length > 0 &&
        state.reservationSettings.checkOut.length > 0 &&
        state.reservationSettings.cancellationPolicy.length > 5,
    },
    {
      label: "Go Live Validation",
      done: state.validation.every((check) => check.status !== "error"),
    },
  ];
  const coverageDone = coverageRows.filter((row) => row.done).length;

  return (
    <div className="space-y-5">
      <p className="text-[13px] text-text-secondary">
        Review your configuration. Click <em>Finish setup</em> to commit invites and mark the
        property as live.
      </p>
      <div className="rounded-md border border-border bg-surface-2/30 p-4">
        <div className="label-uppercase mb-2">Go Live Validation</div>
        <div className="space-y-2">
          {state.validation.map((check) => (
            <div
              key={check.id}
              className="flex items-center justify-between rounded-md border border-border-subtle bg-surface px-3 py-2"
            >
              <div>
                <div className="text-[12px] font-medium text-text-primary">{check.label}</div>
                <div className="text-[11px] text-text-secondary">{check.message}</div>
              </div>
              <span
                className={`rounded px-2 py-1 text-[10px] uppercase ${
                  check.status === "pass"
                    ? "bg-primary-tint text-primary-pressed"
                    : check.status === "warning"
                      ? "bg-warning-tint text-warning"
                      : "bg-error-tint text-error"
                }`}
              >
                {check.status}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-md border border-border bg-surface p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="label-uppercase">Onboarding Coverage Matrix</div>
          <span className="rounded bg-surface-2 px-2 py-1 text-[11px] font-medium text-text-primary">
            {coverageDone}/{coverageRows.length} configured
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {coverageRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-md border border-border-subtle bg-surface-2/30 px-3 py-2"
            >
              <span className="text-[12px] text-text-primary">{row.label}</span>
              <span
                className={`rounded px-2 py-1 text-[10px] uppercase ${
                  row.done ? "bg-primary-tint text-primary-pressed" : "bg-warning-tint text-warning"
                }`}
              >
                {row.done ? "Configured" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Summary title="Property">
          <Line k="Name" v={state.profile.propertyName || "—"} />
          <Line k="Code" v={state.profile.propertyCode || "—"} />
          <Line k="Type" v={state.profile.propertyType} />
          <Line k="Location" v={`${state.profile.city || "—"}, ${state.profile.country}`} />
          <Line k="Currency · TZ" v={`${state.profile.currency} · ${state.profile.timezone}`} />
          <Line k="GST / VAT" v={state.profile.gstVatNumber || "—"} />
        </Summary>
        <Summary title="Inventory">
          <Line k="Room types" v={String(state.roomTypes.length)} />
          <Line k="Total rooms" v={String(totalRooms)} />
        </Summary>
        <Summary title="Rates, Meals & Tax">
          <Line k="Rate plans" v={String(state.ratePlans.length)} />
          <Line k="Meal plans" v={String(state.mealPlans.length)} />
          <Line k="Packages" v={String(state.packages.length)} />
          <Line
            k="Tax"
            v={`GST ${state.tax.gst}% · VAT ${state.tax.vat}% · City ${state.tax.cityTax}%`}
          />
        </Summary>
        <Summary title="Staff invites">
          <Line k="Total" v={String(state.users.length)} />
          {state.users.slice(0, 3).map((s) => (
            <Line key={s.id} k={s.name || "(unnamed)"} v={s.email || "—"} />
          ))}
        </Summary>
        <Summary title="Payments & Channels">
          <Line
            k="Payments"
            v={
              `${state.payments.cash ? "Cash " : ""}${state.payments.card ? "Card " : ""}${state.payments.upi ? "UPI" : ""}`.trim() ||
              "None"
            }
          />
          <Line k="Gateway" v={state.payments.paymentGateway || "—"} />
          <Line k="Connected channels" v={connectedChannels || "None"} />
          <Line k="Mapped channels" v={String(mappedChannels)} />
        </Summary>
        <Summary title="Booking, Website & CRM">
          <Line k="Booking engine" v={state.bookingEngine.enabled ? "Enabled" : "Disabled"} />
          <Line
            k="Promo codes"
            v={state.bookingEngine.promoCodesEnabled ? "Enabled" : "Disabled"}
          />
          <Line k="Direct booking offer" v={state.bookingEngine.directBookingOffer || "—"} />
          <Line
            k="Website pages"
            v={state.websiteBuilder.pagesConfigured ? "Configured" : "Pending"}
          />
          <Line
            k="Website contact"
            v={state.websiteBuilder.contactConfigured ? "Configured" : "Pending"}
          />
          <Line
            k="Website gallery"
            v={state.websiteBuilder.galleryConfigured ? "Configured" : "Pending"}
          />
          <Line k="Website SEO" v={state.websiteBuilder.seoConfigured ? "Configured" : "Pending"} />
          <Line k="Website theme" v={state.websiteBuilder.theme || "—"} />
          <Line
            k="CRM templates"
            v={
              state.crm.emailTemplatesConfigured ||
              state.crm.smsTemplatesConfigured ||
              state.crm.whatsappTemplatesConfigured
                ? "Configured"
                : "Pending"
            }
          />
          <Line k="CRM loyalty" v={state.crm.loyaltyConfigured ? "Configured" : "Pending"} />
        </Summary>
      </div>
    </div>
  );
}

function Summary({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2/30 p-4">
      <div className="label-uppercase mb-2">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 text-[12px]">
      <span className="text-text-secondary">{k}</span>
      <span className="truncate text-right font-medium text-text-primary">{v}</span>
    </div>
  );
}
export default ReviewStep;
