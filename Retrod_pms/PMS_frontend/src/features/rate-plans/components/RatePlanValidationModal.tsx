import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/ui/Primitives";
import type { RatePlanValidationIssue, RatePlanValidationResult } from "@/types/pms";

interface RatePlanValidationModalProps {
  open: boolean;
  mode: "validate" | "publish";
  result: RatePlanValidationResult | null;
  planName: string;
  onOpenChange: (open: boolean) => void;
  onGoToTab?: (tab: NonNullable<RatePlanValidationIssue["tab"]>) => void;
  onPublishAnyway?: () => void;
}

function IssueList({
  title,
  issues,
  tone,
  onGoToTab,
}: {
  title: string;
  issues: RatePlanValidationIssue[];
  tone: "error" | "warning";
  onGoToTab?: (tab: NonNullable<RatePlanValidationIssue["tab"]>) => void;
}) {
  if (issues.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-medium text-text-primary">{title}</span>
        <StatusBadge tone={tone === "error" ? "error" : "warning"}>{issues.length}</StatusBadge>
      </div>
      <ul className="space-y-2">
        {issues.map((item) => (
          <li
            key={item.ruleId + item.message}
            className="rounded-md border border-border-subtle bg-surface-2/40 px-3 py-2 text-[12px]"
          >
            <div className="font-mono text-[10px] text-text-secondary">{item.ruleId}</div>
            <div className="text-text-primary">{item.message}</div>
            {item.tab && onGoToTab && (
              <button
                type="button"
                className="mt-1 text-[11px] font-medium text-primary hover:underline"
                onClick={() => onGoToTab(item.tab!)}
              >
                Go to {item.tab}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RatePlanValidationModal({
  open,
  mode,
  result,
  planName,
  onOpenChange,
  onGoToTab,
  onPublishAnyway,
}: RatePlanValidationModalProps) {
  if (!result) return null;

  const blocking = result.errors.length > 0;
  const canPublishWithWarnings =
    mode === "publish" && result.canPublish && result.warnings.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {mode === "publish" ? "Publish rate plan" : "Validation results"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {planName ? `"${planName}" — ` : ""}
            {blocking
              ? "Fix blocking issues before publishing."
              : result.warnings.length > 0
                ? "All blocking checks passed. Review warnings before publish."
                : "All checks passed. Ready to publish."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="max-h-[320px] space-y-4 overflow-y-auto py-1">
          <IssueList
            title="Blocking errors"
            issues={result.errors}
            tone="error"
            onGoToTab={onGoToTab}
          />
          <IssueList
            title="Warnings"
            issues={result.warnings}
            tone="warning"
            onGoToTab={onGoToTab}
          />
          {!blocking && result.warnings.length === 0 && (
            <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-[12px] text-text-primary">
              Validation checklist complete. Publish will activate the plan and create a version
              snapshot.
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          {canPublishWithWarnings && onPublishAnyway && (
            <AlertDialogAction onClick={onPublishAnyway}>Publish anyway</AlertDialogAction>
          )}
          {mode === "publish" &&
            result.canPublish &&
            result.warnings.length === 0 &&
            onPublishAnyway && (
              <AlertDialogAction onClick={onPublishAnyway}>Publish</AlertDialogAction>
            )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
