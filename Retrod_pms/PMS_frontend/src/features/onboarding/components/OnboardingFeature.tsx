import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Building2,
  BedDouble,
  Receipt,
  Users as UsersIcon,
  Plug,
  ScrollText,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { PageHeader, Card, CardHeader, Button, StatusBadge } from "@/components/ui/Primitives";
import {
  DEFAULT_ONBOARDING,
  computeOnboardingProgress,
  loadOnboarding,
  saveOnboarding,
  withDerivedOnboarding,
  type OnboardingStepKey,
  type OnboardingState,
} from "@/lib/onboarding-store";
import { type Role } from "@/types/rbac";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { publishOnboardingToRatePlans } from "@/features/rate-plans/lib/onboarding-publish";
import { publishOnboardingToAvailability } from "@/features/availability/lib/onboarding-publish";
import { publishOnboardingToTaxes } from "@/features/taxes-fees/lib/onboarding-publish";
import { dataKeys } from "@/services/mock/data-layer";
import type { FeatureFlags } from "@/types/entitlements";

import { ProfileStep } from "./ProfileStep";
import { RoomsStep } from "./RoomsStep";
import { RatesStep } from "./RatesStep";
import { StaffStep } from "./StaffStep";
import { IntegrationsStep } from "./IntegrationsStep";
import { PoliciesStep } from "./PoliciesStep";
import { ReviewStep } from "./ReviewStep";

const STEPS: Array<{
  key: OnboardingStepKey;
  label: string;
  icon: typeof Building2;
  desc: string;
}> = [
  {
    key: "dashboard",
    label: "Onboarding Dashboard",
    icon: Building2,
    desc: "Progress and next action",
  },
  {
    key: "property",
    label: "Property Information",
    icon: Building2,
    desc: "Identity and contacts",
  },
  {
    key: "rooms",
    label: "Room Types & Inventory",
    icon: BedDouble,
    desc: "Categories & inventory",
  },
  {
    key: "meal-plans",
    label: "Meal Plans, Rates & Tax",
    icon: Receipt,
    desc: "Meal plans, rates and taxes",
  },
  { key: "packages", label: "Packages", icon: Receipt, desc: "Hospitality package setup" },
  { key: "users", label: "User Setup", icon: UsersIcon, desc: "Roles and invitations" },
  {
    key: "payments",
    label: "Payments & Channels",
    icon: Plug,
    desc: "Payment + OTA + website + CRM",
  },
  {
    key: "reservation-settings",
    label: "Policies",
    icon: ScrollText,
    desc: "Reservation and cancellation policies",
  },
  {
    key: "go-live",
    label: "Go Live Validation",
    icon: CheckCircle2,
    desc: "Validation and launch",
  },
] as const;

export function OnboardingFeature() {
  const nav = useNavigate();
  const { can, inviteUser, setTenantFeature, setPropertyFeatures, logAuditEvent } = useAuth();
  const queryClient = useQueryClient();
  const [state, setState] = useState<OnboardingState>(DEFAULT_ONBOARDING);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadOnboarding());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveOnboarding(withDerivedOnboarding(state));
    }
  }, [state, hydrated]);

  const step = state.step;
  const setStep = (n: number) =>
    setState((s) => ({ ...s, step: Math.max(0, Math.min(STEPS.length - 1, n)) }));

  const canRun = can("onboarding.run");
  const progress = computeOnboardingProgress(withDerivedOnboarding(state));

  const finish = async () => {
    state.users.forEach((s) => {
      inviteUser({
        name: s.name,
        email: s.email,
        role: s.role as Role,
        property: state.profile.propertyName || "The Grand Palace",
      });
    });
    const finalState = withDerivedOnboarding({ ...state, completed: true });

    try {
      const [mergedPlans, mergedAvailability, taxPublish] = await Promise.all([
        publishOnboardingToRatePlans(finalState),
        publishOnboardingToAvailability(finalState),
        publishOnboardingToTaxes(finalState),
      ]);
      queryClient.setQueryData(dataKeys.ratePlans, mergedPlans);
      queryClient.setQueryData(dataKeys.availabilityCells, mergedAvailability);
      queryClient.setQueryData(dataKeys.taxComponents, taxPublish.components);
      queryClient.setQueryData(dataKeys.taxGroups, taxPublish.groups);
      logAuditEvent(
        "Onboarding steady-state publish",
        state.profile.propertyCode || "PROP-1",
        `Rate plans, availability (${mergedAvailability.filter((c) => c.id.startsWith("onb-")).length} cells), and taxes published.`,
      );
      toast.success("Rate plans, availability, and taxes published to steady-state modules.");
    } catch {
      toast.error("Go-live saved, but steady-state publish failed for one or more modules.");
    }

    setState(finalState);
    saveOnboarding(finalState);
    applyOnboardingEntitlements(finalState, setTenantFeature, setPropertyFeatures);
    nav({ to: "/rate-plans" });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Setup"
        title="Property Onboarding"
        description="Configure the property end-to-end before going live. Progress saves automatically."
        actions={
          <div className="flex items-center gap-2">
            {state.completed && <StatusBadge tone="success">Setup complete</StatusBadge>}
            <Button variant="outline" size="sm" onClick={() => setState(DEFAULT_ONBOARDING)}>
              Reset
            </Button>
          </div>
        }
      />

      {!canRun && (
        <div className="m-6 rounded-md border border-border bg-[oklch(0.96_0.06_70)]/30 p-4 text-[12px] text-text-secondary">
          Your role can view onboarding but not modify it. Contact an Owner or General Manager.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[260px_1fr]">
        {/* Stepper progress left-bar */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <ol className="p-2">
              {STEPS.map((s, idx) => {
                const Icon = s.icon;
                const active = idx === step;
                const done = idx < step;
                return (
                  <li key={s.key}>
                    <button
                      onClick={() => setStep(idx)}
                      className={`flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition ${
                        active ? "bg-primary-tint" : "hover:bg-surface-2"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold transition ${
                          done
                            ? "bg-[var(--color-success)] text-white"
                            : active
                              ? "bg-primary text-primary-foreground"
                              : "bg-surface-2 text-text-secondary"
                        }`}
                      >
                        {done ? <Check className="h-3 w-3" /> : idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`flex items-center gap-1.5 text-[13px] font-medium transition ${
                            active ? "text-primary-pressed" : "text-text-primary"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {s.label}
                        </div>
                        <div className="text-[11px] text-text-secondary">{s.desc}</div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </Card>
          <div className="mt-3 px-2 text-[11px] text-text-secondary">
            Step {step + 1} of {STEPS.length}
          </div>
        </aside>

        {/* Step configuration layouts */}
        <div>
          <Card>
            <CardHeader title={STEPS[step].label} hint={STEPS[step].desc} />
            <div className="p-6">
              {step === 0 && (
                <div className="space-y-4">
                  <div className="rounded-md border border-border bg-surface-2/30 p-4">
                    <div className="label-uppercase mb-2">Property Setup Progress</div>
                    <div className="text-[28px] font-display text-text-primary">
                      {progress.percentage}%
                    </div>
                    <div className="text-[12px] text-text-secondary">
                      {progress.completed} / {progress.total} onboarding stages completed
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {STEPS.slice(1).map((stepItem) => {
                      const done = state.progress[stepItem.key];
                      return (
                        <button
                          key={stepItem.key}
                          type="button"
                          onClick={() =>
                            setStep(STEPS.findIndex((entry) => entry.key === stepItem.key))
                          }
                          className="flex items-center justify-between rounded-md border border-border-subtle bg-surface px-3 py-2 text-left hover:bg-surface-2"
                        >
                          <span className="text-[12px] text-text-primary">{stepItem.label}</span>
                          <span
                            className={`rounded px-2 py-1 text-[10px] uppercase ${
                              done
                                ? "bg-primary-tint text-primary-pressed"
                                : "bg-warning-tint text-warning"
                            }`}
                          >
                            {done ? "Done" : "Pending"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="rounded-md border border-border bg-surface p-4 text-[12px] text-text-secondary">
                    Recommended next step:{" "}
                    <strong className="text-text-primary">
                      {STEPS.find((entry) => entry.key === progress.nextStep)?.label ?? "Go Live"}
                    </strong>
                  </div>
                </div>
              )}
              {step === 1 && <ProfileStep state={state} setState={setState} disabled={!canRun} />}
              {step === 2 && <RoomsStep state={state} setState={setState} disabled={!canRun} />}
              {step === 3 && <RatesStep state={state} setState={setState} disabled={!canRun} />}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="label-uppercase">Package Configuration</div>
                  <div className="space-y-2">
                    {state.packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="grid grid-cols-1 gap-2 rounded-md border border-border-subtle bg-surface-2/30 px-3 py-2 md:grid-cols-[1fr_150px_1fr_auto]"
                      >
                        <input
                          disabled={!canRun}
                          className="h-9 rounded-md border border-border bg-surface px-3 text-[13px]"
                          value={pkg.name}
                          onChange={(e) =>
                            setState((prev) => ({
                              ...prev,
                              packages: prev.packages.map((item) =>
                                item.id === pkg.id ? { ...item, name: e.target.value } : item,
                              ),
                            }))
                          }
                        />
                        <input
                          disabled={!canRun}
                          type="number"
                          className="h-9 rounded-md border border-border bg-surface px-3 text-[13px]"
                          value={pkg.basePrice}
                          onChange={(e) =>
                            setState((prev) => ({
                              ...prev,
                              packages: prev.packages.map((item) =>
                                item.id === pkg.id
                                  ? { ...item, basePrice: Number(e.target.value) }
                                  : item,
                              ),
                            }))
                          }
                        />
                        <input
                          disabled={!canRun}
                          className="h-9 rounded-md border border-border bg-surface px-3 text-[13px]"
                          value={pkg.includes}
                          onChange={(e) =>
                            setState((prev) => ({
                              ...prev,
                              packages: prev.packages.map((item) =>
                                item.id === pkg.id ? { ...item, includes: e.target.value } : item,
                              ),
                            }))
                          }
                        />
                        <label className="flex items-center gap-2 text-[12px]">
                          <input
                            disabled={!canRun}
                            type="checkbox"
                            checked={pkg.active}
                            onChange={(e) =>
                              setState((prev) => ({
                                ...prev,
                                packages: prev.packages.map((item) =>
                                  item.id === pkg.id ? { ...item, active: e.target.checked } : item,
                                ),
                              }))
                            }
                          />
                          Active
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {step === 5 && <StaffStep state={state} setState={setState} disabled={!canRun} />}
              {step === 6 && (
                <IntegrationsStep state={state} setState={setState} disabled={!canRun} />
              )}
              {step === 7 && <PoliciesStep state={state} setState={setState} disabled={!canRun} />}
              {step === 8 && <ReviewStep state={state} />}
            </div>
            <div className="flex items-center justify-between border-t border-border-subtle px-6 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(step - 1)}
                disabled={step === 0}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button size="sm" onClick={() => setStep(step + 1)}>
                  Save & continue
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button size="sm" onClick={finish} disabled={!canRun}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Finish setup
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
export default OnboardingFeature;

function applyOnboardingEntitlements(
  state: OnboardingState,
  setTenantFeature: (feature: keyof FeatureFlags, enabled: boolean) => void,
  setPropertyFeatures: (property: string, features: Partial<FeatureFlags>) => void,
) {
  const connectedChannels = state.channelManager.channels.some((channel) => channel.connected);
  const propertyName = state.profile.propertyName.trim() || "The Grand Palace";
  const features: FeatureFlags = {
    channelManager: connectedChannels,
    websiteBuilder: state.websiteBuilder.pagesConfigured || state.websiteBuilder.roomsConfigured,
    bookingEngine: state.bookingEngine.enabled,
    revenueAi: connectedChannels || state.ratePlans.some((plan) => plan.active),
    masterData: true,
  };

  (Object.entries(features) as Array<[keyof FeatureFlags, boolean]>).forEach(
    ([feature, enabled]) => {
      setTenantFeature(feature, enabled);
    },
  );
  setPropertyFeatures(propertyName, features);
}
