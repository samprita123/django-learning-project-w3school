import { type OnboardingState } from "@/lib/onboarding-store";

interface IntegrationsStepProps {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
  disabled: boolean;
}

export function IntegrationsStep({ state, setState, disabled }: IntegrationsStepProps) {
  const toggleChannel = (key: string, mode: "connected" | "mapped") =>
    setState((s) => ({
      ...s,
      channelManager: {
        ...s.channelManager,
        channels: s.channelManager.channels.map((channel) =>
          channel.key === key ? { ...channel, [mode]: !channel[mode] } : channel,
        ),
      },
    }));
  const setPayments = (patch: Partial<OnboardingState["payments"]>) =>
    setState((s) => ({ ...s, payments: { ...s.payments, ...patch } }));
  const setWebsiteBuilder = (patch: Partial<OnboardingState["websiteBuilder"]>) =>
    setState((s) => ({ ...s, websiteBuilder: { ...s.websiteBuilder, ...patch } }));
  const setBookingEngine = (patch: Partial<OnboardingState["bookingEngine"]>) =>
    setState((s) => ({ ...s, bookingEngine: { ...s.bookingEngine, ...patch } }));
  const setCRM = (patch: Partial<OnboardingState["crm"]>) =>
    setState((s) => ({ ...s, crm: { ...s.crm, ...patch } }));

  const inputCls =
    "h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:opacity-60";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-md border border-border bg-surface p-4">
          <div className="label-uppercase mb-2">Payment Configuration</div>
          <div className="space-y-2 text-[12px]">
            <label className="flex items-center gap-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={state.payments.cash}
                onChange={(e) => setPayments({ cash: e.target.checked })}
              />
              Cash
            </label>
            <label className="flex items-center gap-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={state.payments.card}
                onChange={(e) => setPayments({ card: e.target.checked })}
              />
              Card
            </label>
            <label className="flex items-center gap-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={state.payments.upi}
                onChange={(e) => setPayments({ upi: e.target.checked })}
              />
              UPI
            </label>
            <label className="flex items-center gap-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={state.payments.onlinePayments}
                onChange={(e) => setPayments({ onlinePayments: e.target.checked })}
              />
              Online payments
            </label>
            <input
              disabled={disabled}
              className={inputCls}
              value={state.payments.paymentGateway}
              onChange={(e) => setPayments({ paymentGateway: e.target.value })}
              placeholder="Payment gateway"
            />
            <textarea
              disabled={disabled}
              className={`${inputCls} h-20 py-2`}
              value={state.payments.refundRules}
              onChange={(e) => setPayments({ refundRules: e.target.value })}
              placeholder="Refund rules"
            />
          </div>
        </div>
        <div className="rounded-md border border-border bg-surface p-4">
          <div className="label-uppercase mb-2">Booking Engine, Website Builder & CRM</div>
          <div className="space-y-2 text-[12px]">
            <label className="flex items-center gap-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={state.bookingEngine.enabled}
                onChange={(e) => setBookingEngine({ enabled: e.target.checked })}
              />
              Booking engine enabled
            </label>
            <label className="flex items-center gap-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={state.bookingEngine.promoCodesEnabled}
                onChange={(e) => setBookingEngine({ promoCodesEnabled: e.target.checked })}
              />
              Promo codes enabled
            </label>
            <input
              disabled={disabled}
              className={inputCls}
              value={state.bookingEngine.directBookingOffer}
              onChange={(e) => setBookingEngine({ directBookingOffer: e.target.value })}
              placeholder="Direct booking offer"
            />
            <label className="flex items-center gap-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={state.websiteBuilder.pagesConfigured}
                onChange={(e) => setWebsiteBuilder({ pagesConfigured: e.target.checked })}
              />
              Website pages configured
            </label>
            <label className="flex items-center gap-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={state.websiteBuilder.roomsConfigured}
                onChange={(e) => setWebsiteBuilder({ roomsConfigured: e.target.checked })}
              />
              Website room pages configured
            </label>
            <label className="flex items-center gap-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={state.websiteBuilder.offersConfigured}
                onChange={(e) => setWebsiteBuilder({ offersConfigured: e.target.checked })}
              />
              Website offers configured
            </label>
            <label className="flex items-center gap-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={state.websiteBuilder.galleryConfigured}
                onChange={(e) => setWebsiteBuilder({ galleryConfigured: e.target.checked })}
              />
              Website gallery configured
            </label>
            <label className="flex items-center gap-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={state.websiteBuilder.contactConfigured}
                onChange={(e) => setWebsiteBuilder({ contactConfigured: e.target.checked })}
              />
              Website contact configured
            </label>
            <label className="flex items-center gap-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={state.websiteBuilder.seoConfigured}
                onChange={(e) => setWebsiteBuilder({ seoConfigured: e.target.checked })}
              />
              Website SEO configured
            </label>
            <input
              disabled={disabled}
              className={inputCls}
              value={state.websiteBuilder.theme}
              onChange={(e) => setWebsiteBuilder({ theme: e.target.value })}
              placeholder="Website theme"
            />
            <label className="flex items-center gap-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={state.crm.segmentsConfigured}
                onChange={(e) => setCRM({ segmentsConfigured: e.target.checked })}
              />
              CRM guest segments configured
            </label>
            <label className="flex items-center gap-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={state.crm.emailTemplatesConfigured}
                onChange={(e) => setCRM({ emailTemplatesConfigured: e.target.checked })}
              />
              CRM email templates configured
            </label>
            <label className="flex items-center gap-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={state.crm.smsTemplatesConfigured}
                onChange={(e) => setCRM({ smsTemplatesConfigured: e.target.checked })}
              />
              CRM SMS templates configured
            </label>
            <label className="flex items-center gap-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={state.crm.whatsappTemplatesConfigured}
                onChange={(e) => setCRM({ whatsappTemplatesConfigured: e.target.checked })}
              />
              CRM WhatsApp templates configured
            </label>
            <label className="flex items-center gap-2">
              <input
                disabled={disabled}
                type="checkbox"
                checked={state.crm.loyaltyConfigured}
                onChange={(e) => setCRM({ loyaltyConfigured: e.target.checked })}
              />
              CRM loyalty configured
            </label>
          </div>
        </div>
      </div>
      <div className="rounded-md border border-border bg-surface p-4">
        <div className="label-uppercase mb-2">Channel Manager Setup</div>
        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-text-secondary">
              Provider
            </label>
            <input
              disabled={disabled}
              className={inputCls}
              value={state.channelManager.provider}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  channelManager: {
                    ...s.channelManager,
                    provider: e.target.value,
                  },
                }))
              }
              placeholder="e.g. SiteMinder"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {state.channelManager.channels.map((channel) => (
            <div
              key={channel.key}
              className="flex items-center justify-between rounded-md border border-border-subtle bg-surface-2/30 p-3"
            >
              <div>
                <div className="text-[13px] font-medium text-text-primary">{channel.label}</div>
                <div className="text-[11px] text-text-secondary">
                  {channel.connected ? "Connected" : "Not connected"} ·{" "}
                  {channel.mapped ? "Mapped" : "Unmapped"}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  disabled={disabled}
                  type="button"
                  onClick={() => toggleChannel(channel.key, "connected")}
                  className={`rounded px-2 py-1 ${
                    channel.connected
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-text-secondary"
                  }`}
                >
                  Connect
                </button>
                <button
                  disabled={disabled || !channel.connected}
                  type="button"
                  onClick={() => toggleChannel(channel.key, "mapped")}
                  className={`rounded px-2 py-1 ${
                    channel.mapped
                      ? "bg-[var(--color-success)] text-white"
                      : "border border-border text-text-secondary"
                  }`}
                >
                  Map
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <label className="mb-1.5 block text-[12px] font-medium text-text-secondary">
            Inventory sync interval (minutes)
          </label>
          <input
            disabled={disabled}
            type="number"
            className={inputCls}
            value={state.channelManager.inventorySyncMinutes}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                channelManager: {
                  ...s.channelManager,
                  inventorySyncMinutes: Number(e.target.value),
                },
              }))
            }
          />
        </div>
      </div>
      <div className="rounded-md border border-border bg-surface p-4">
        <div className="label-uppercase mb-2">Reusable Setup Screens</div>
        <div className="grid grid-cols-1 gap-2 text-[12px] md:grid-cols-2">
          <a
            className="rounded border border-border-subtle px-3 py-2 hover:bg-surface-2"
            href="/staff"
          >
            Staff Management
          </a>
          <a
            className="rounded border border-border-subtle px-3 py-2 hover:bg-surface-2"
            href="/pricing"
          >
            Dynamic Pricing / Rate Plans
          </a>
          <a
            className="rounded border border-border-subtle px-3 py-2 hover:bg-surface-2"
            href="/channel-manager/connections"
          >
            Channel Manager Connections
          </a>
          <a
            className="rounded border border-border-subtle px-3 py-2 hover:bg-surface-2"
            href="/channel-manager/room-mapping"
          >
            Channel Manager Room Mapping
          </a>
          <a
            className="rounded border border-border-subtle px-3 py-2 hover:bg-surface-2"
            href="/channel-manager/rate-plans"
          >
            Channel Manager Rate Plan Mapping
          </a>
          <a
            className="rounded border border-border-subtle px-3 py-2 hover:bg-surface-2"
            href="/booking-engine"
          >
            Booking Engine Settings
          </a>
          <a
            className="rounded border border-border-subtle px-3 py-2 hover:bg-surface-2"
            href="/website-builder"
          >
            Website Builder
          </a>
          <a
            className="rounded border border-border-subtle px-3 py-2 hover:bg-surface-2"
            href="/communications"
          >
            CRM Communications
          </a>
        </div>
      </div>
    </div>
  );
}
export default IntegrationsStep;
