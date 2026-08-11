import { Link } from "@tanstack/react-router";

interface AccessDeniedProps {
  title?: string;
  description?: string;
}

export default function AccessDenied({
  title = "You do not have access to this page",
  description = "Your current role does not include the required permission for this route. Ask an administrator to update your access.",
}: AccessDeniedProps) {
  return (
    <div className="responsive-page-x py-6 sm:py-8">
      <div className="mx-auto max-w-2xl rounded-lg border border-warning/40 bg-warning-tint p-5 shadow-e1">
        <h2 className="text-[16px] font-semibold text-text-primary">{title}</h2>
        <p className="mt-2 text-[13px] text-text-secondary">{description}</p>
        <div className="mt-4">
          <Link
            to="/"
            className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground hover:bg-primary-pressed"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
