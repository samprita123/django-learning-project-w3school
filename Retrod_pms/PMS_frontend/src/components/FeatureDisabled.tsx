import { Link } from "@tanstack/react-router";

interface FeatureDisabledProps {
  title: string;
  description: string;
}

export function FeatureDisabled({ title, description }: FeatureDisabledProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-xl border border-border-subtle bg-surface p-6 text-center shadow-e1">
        <h2 className="text-[20px] font-semibold text-text-primary">{title}</h2>
        <p className="mt-2 text-[13px] text-text-secondary">{description}</p>
        <div className="mt-5">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition hover:bg-primary-pressed"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FeatureDisabled;
