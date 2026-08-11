import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Lock } from "lucide-react";
import { StatusBadge } from "@/components/ui/Primitives";
import { cn } from "@/lib/utils";
import type { PlatformAppDefinition } from "@/types/platform";

type ApplicationCardProps = {
  app: PlatformAppDefinition & { subscribed?: boolean };
  onSubscribeClick?: (title: string) => void;
};

export function ApplicationCard({ app, onSubscribeClick }: ApplicationCardProps) {
  const Icon = app.icon;
  const isComingSoon = app.status === "coming_soon";
  const isSubscribed = app.subscribed !== false;

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface shadow-e1 ring-1 ring-border-subtle">
          <Icon className="h-5 w-5 text-primary" aria-hidden />
        </div>
        {isComingSoon ? (
          <StatusBadge tone="warning">Coming Soon</StatusBadge>
        ) : !isSubscribed ? (
          <StatusBadge tone="info">Subscribe</StatusBadge>
        ) : (
          <StatusBadge tone="success">Active</StatusBadge>
        )}
      </div>

      <div className="mt-4 flex-1">
        <h3 className="font-display text-[17px] font-semibold leading-snug text-text-primary flex items-center gap-1.5">
          {app.title}
          {!isSubscribed && !isComingSoon && <Lock className="h-3.5 w-3.5 text-text-disabled shrink-0" />}
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">{app.description}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={`${app.title} features`}>
          {app.features.map((feature) => (
            <li
              key={feature}
              className="rounded-md bg-surface-2/80 px-2 py-1 text-[11px] font-medium text-text-secondary ring-1 ring-border-subtle"
            >
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div
        className={cn(
          "mt-5 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md text-[12px] font-medium transition",
          isComingSoon
            ? "cursor-not-allowed border border-border bg-surface text-text-disabled"
            : !isSubscribed
            ? "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-e1"
            : "bg-primary text-primary-foreground group-hover:bg-primary-pressed shadow-e1",
        )}
      >
        {isComingSoon ? "Coming Soon" : !isSubscribed ? "Subscribe Now" : app.openLabel}
        {isComingSoon ? (
          <Clock className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
        )}
      </div>
    </>
  );

  if (isComingSoon) {
    return (
      <article
        className={cn(
          "flex h-full flex-col rounded-xl border bg-surface p-5 shadow-e1",
          app.accentClass,
        )}
        aria-label={`${app.title} — coming soon`}
      >
        {content}
      </article>
    );
  }

  if (!isSubscribed) {
    return (
      <div
        onClick={() => onSubscribeClick?.(app.title)}
        className={cn(
          "group flex h-full flex-col rounded-xl border bg-surface p-5 shadow-e1 transition cursor-pointer",
          "hover:shadow-e2 hover:border-primary/20",
          app.accentClass,
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      to={app.route}
      className={cn(
        "group flex h-full flex-col rounded-xl border bg-surface p-5 shadow-e1 transition",
        "hover:shadow-e2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
        app.accentClass,
      )}
    >
      {content}
    </Link>
  );
}
