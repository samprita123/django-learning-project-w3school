import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  PageHeader,
  KpiCard,
  Button,
  Card,
  CardHeader,
  StatusBadge,
} from "@/components/ui/Primitives";
import { useOpsTasksQuery, useSaveOpsTasksMutation, useUpdateOpsTaskMutation } from "@/services/mock/queries";
import type { OpsTask } from "@/types/pms";

type View = "list" | "board";
type FormField = "title" | "department" | "assignee" | "dueDate" | "dueTime";

interface TaskFormState {
  title: string;
  department: string;
  assignee: string;
  dueDate: string;
  dueTime: string;
  priority: OpsTask["priority"];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const EMPTY_FORM: TaskFormState = {
  title: "",
  department: "",
  assignee: "",
  dueDate: "",
  dueTime: "",
  priority: "Normal",
};

export function TasksFeature() {
  const { data: opsTasks = [] } = useOpsTasksQuery();
  const saveOpsTasksMutation = useSaveOpsTasksMutation();

  const [view, setView] = useState<View>("board");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState<TaskFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});
  const [submitError, setSubmitError] = useState("");

  const departmentOptions = useMemo(() => {
    const seed = ["FO", "HK", "Revenue", ...opsTasks.map((task) => task.department)];
    return Array.from(new Set(seed.filter(Boolean)));
  }, [opsTasks]);

  const open = opsTasks.filter((t) => t.status !== "Done");
  const dueToday = opsTasks.filter((t) => {
    if (t.status === "Done") return false;
    const dueDate = parseDueLabel(t.due);
    if (!dueDate) return false;
    const now = new Date();
    return (
      dueDate.getFullYear() === now.getFullYear() &&
      dueDate.getMonth() === now.getMonth() &&
      dueDate.getDate() === now.getDate()
    );
  }).length;
  const overdue = opsTasks.filter((t) => {
    if (t.status === "Done") return false;
    const dueDate = parseDueLabel(t.due);
    return Boolean(dueDate && dueDate.getTime() < Date.now());
  }).length;
  const completed7d = opsTasks.filter((t) => {
    if (t.status !== "Done") return false;
    const dueDate = parseDueLabel(t.due);
    if (!dueDate) return false;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return dueDate >= sevenDaysAgo;
  }).length;

  const requiredMissing =
    !form.title || !form.department || !form.assignee || !form.dueDate || !form.dueTime;
  const hasValidationErrors = Object.keys(errors).length > 0;
  const canSubmit = !requiredMissing && !hasValidationErrors && !saveOpsTasksMutation.isPending;

  const closeModal = () => {
    setShowCreateModal(false);
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitError("");
  };

  const updateField = <K extends keyof TaskFormState>(field: K, value: TaskFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSubmitError("");
    if (field in errors) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as FormField];
        return next;
      });
    }
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<FormField, string>> = {};
    if (!form.title.trim()) nextErrors.title = "Task title is required.";
    if (!form.department.trim()) nextErrors.department = "Department is required.";
    if (!form.assignee.trim()) nextErrors.assignee = "Assignee is required.";
    if (!form.dueDate) nextErrors.dueDate = "Due date is required.";
    if (!form.dueTime) nextErrors.dueTime = "Due time is required.";
    if (form.dueDate && form.dueTime) {
      const parsed = new Date(`${form.dueDate}T${form.dueTime}:00`);
      if (Number.isNaN(parsed.getTime())) {
        nextErrors.dueTime = "Enter a valid due date and time.";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreateTask = async () => {
    if (!validateForm()) return;
    const due = formatDueLabel(form.dueDate, form.dueTime);
    if (!due) {
      setErrors((prev) => ({ ...prev, dueTime: "Enter a valid due date and time." }));
      return;
    }

    const newTask: OpsTask = {
      id: nextTaskId(opsTasks),
      title: form.title.trim(),
      department: form.department.trim(),
      assignee: form.assignee.trim(),
      due,
      priority: form.priority,
      status: "Open",
    };

    try {
      await saveOpsTasksMutation.mutateAsync([...opsTasks, newTask]);
      closeModal();
    } catch {
      setSubmitError("Unable to create task. Please try again.");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Task Management"
        description="Cross-department tasks and follow-ups."
        actions={
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-3.5 w-3.5" />
            Create task
          </Button>
        }
      />
      <div className="responsive-page-x space-y-5 py-4 sm:space-y-6 sm:py-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <KpiCard label="Open tasks" value={String(open.length)} accent="brand" />
          <KpiCard label="Due today" value={String(dueToday)} accent="warning" />
          <KpiCard label="Overdue" value={String(overdue)} accent={overdue ? "error" : "success"} />
          <KpiCard label="Completed (7d)" value={String(completed7d)} accent="info" />
        </div>
        <div className="flex w-fit rounded-md border border-border bg-surface p-0.5 text-[12px]">
          {(["board", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded px-3 py-1 capitalize ${view === v ? "bg-foreground text-background" : "text-text-secondary"}`}
            >
              {v}
            </button>
          ))}
        </div>
        {view === "board" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {(["Open", "In Progress", "Done"] as const).map((col) => (
              <div key={col}>
                <div className="mb-2 text-[12px] font-semibold">{col}</div>
                <div className="space-y-2">
                  {opsTasks
                    .filter((t) => t.status === col)
                    .map((t) => (
                      <TaskBoardCard key={t.id} t={t} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader title="All tasks" />
            <div className="table-scroll-shadow overflow-x-auto">
              <table className="w-full min-w-[700px] text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-surface-2/40 text-left">
                    {["Task", "Dept", "Assignee", "Due", "Status"].map((h) => (
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
                  {opsTasks.map((t) => (
                    <TaskListRow key={t.id} t={t} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
      {showCreateModal ? (
        <TaskModal
          form={form}
          errors={errors}
          submitError={submitError}
          canSubmit={canSubmit}
          isSubmitting={saveOpsTasksMutation.isPending}
          departmentOptions={departmentOptions}
          onChange={updateField}
          onClose={closeModal}
          onSubmit={handleCreateTask}
        />
      ) : null}
    </div>
  );
}

function TaskBoardCard({ t }: { t: OpsTask }) {
  const updateMutation = useUpdateOpsTaskMutation();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMutation.mutate({ id: t.id, updates: { status: e.target.value } });
    toast.success("Task status updated.");
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMutation.mutate({ id: t.id, updates: { assignee: e.target.value } });
    toast.success("Task assigned successfully.");
  };

  return (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium text-[13px]">{t.title}</div>
        <StatusBadge tone={t.priority === "High" ? "warning" : "neutral"}>
          {t.priority}
        </StatusBadge>
      </div>
      <div className="mt-2 flex flex-col gap-2 border-t border-border-subtle pt-2 text-[11px] text-text-secondary">
        <div className="flex items-center justify-between">
          <span>Dept: {t.department}</span>
          <span>Due: {t.due}</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={t.assignee}
            onChange={handleAssigneeChange}
            className="h-6 flex-1 rounded border border-border-subtle bg-surface-2 px-1 text-[11px] outline-none"
          >
            <option value="Unassigned">Unassigned</option>
            <option value="John Doe">John Doe</option>
            <option value="Sarah J.">Sarah J.</option>
            <option value="Mike K.">Mike K.</option>
          </select>
          <select
            value={t.status}
            onChange={handleStatusChange}
            className="h-6 flex-1 rounded border border-border-subtle bg-surface-2 px-1 text-[11px] outline-none"
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
      </div>
    </Card>
  );
}

function TaskListRow({ t }: { t: OpsTask }) {
  const updateMutation = useUpdateOpsTaskMutation();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMutation.mutate({ id: t.id, updates: { status: e.target.value } });
    toast.success("Task status updated.");
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateMutation.mutate({ id: t.id, updates: { assignee: e.target.value } });
    toast.success("Task assigned successfully.");
  };

  return (
    <tr className="border-b border-border-subtle hover:bg-surface-2/50">
      <td className="px-4 py-3 font-medium">{t.title}</td>
      <td className="px-4 py-3">{t.department}</td>
      <td className="px-4 py-3">
        <select
          value={t.assignee}
          onChange={handleAssigneeChange}
          className="h-7 rounded border border-border-subtle bg-surface-2 px-2 text-[12px] outline-none"
        >
          <option value="Unassigned">Unassigned</option>
          <option value="John Doe">John Doe</option>
          <option value="Sarah J.">Sarah J.</option>
          <option value="Mike K.">Mike K.</option>
        </select>
      </td>
      <td className="px-4 py-3">{t.due}</td>
      <td className="px-4 py-3">
        <select
          value={t.status}
          onChange={handleStatusChange}
          className="h-7 rounded border border-border-subtle bg-surface-2 px-2 text-[12px] outline-none"
        >
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </td>
    </tr>
  );
}

function TaskModal({
  form,
  errors,
  submitError,
  canSubmit,
  isSubmitting,
  departmentOptions,
  onChange,
  onClose,
  onSubmit,
}: {
  form: TaskFormState;
  errors: Partial<Record<FormField, string>>;
  submitError: string;
  canSubmit: boolean;
  isSubmitting: boolean;
  departmentOptions: string[];
  onChange: <K extends keyof TaskFormState>(field: K, value: TaskFormState[K]) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity" 
        onClick={onClose} 
      />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] flex-col overflow-hidden border-l border-border bg-surface shadow-e3 animate-in slide-in-from-right duration-200">
        <div className="shrink-0 border-b border-border-subtle px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="text-[16px] font-semibold text-text-primary">Create Task</div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border-subtle px-2 py-1 text-[12px] text-text-secondary transition hover:bg-surface-2/70"
            >
              Close
            </button>
          </div>
          <div className="mt-1 text-[12px] text-text-secondary">
            Cross-department tasks and follow-ups.
          </div>
        </div>
        <div className="flex-1 overflow-auto p-5">
          <div className="grid grid-cols-1 gap-4">
            <TaskField label="Task title" error={errors.title} required>
              <input
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
                value={form.title}
                onChange={(event) => onChange("title", event.target.value)}
                placeholder="Example: VIP amenity setup - 405"
              />
            </TaskField>
            <TaskField label="Department" error={errors.department} required>
              <select
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
                value={form.department}
                onChange={(event) => onChange("department", event.target.value)}
              >
                <option value="">Select department</option>
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </TaskField>
            <TaskField label="Assignee" error={errors.assignee} required>
              <input
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
                value={form.assignee}
                onChange={(event) => onChange("assignee", event.target.value)}
                placeholder="Staff name"
              />
            </TaskField>
            <TaskField label="Priority">
              <select
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
                value={form.priority}
                onChange={(event) =>
                  onChange("priority", event.target.value as OpsTask["priority"])
                }
              >
                {(["Normal", "High"] as const).map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </TaskField>
            <TaskField label="Due date" error={errors.dueDate} required>
              <input
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
                type="date"
                value={form.dueDate}
                onChange={(event) => onChange("dueDate", event.target.value)}
              />
            </TaskField>
            <TaskField label="Due time" error={errors.dueTime} required>
              <input
                className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px]"
                type="time"
                value={form.dueTime}
                onChange={(event) => onChange("dueTime", event.target.value)}
              />
            </TaskField>
          </div>
          {submitError ? (
            <div className="mt-3 rounded-md border border-[var(--color-error)]/35 bg-[oklch(0.97_0.04_28)] p-2.5 text-[12px] text-[var(--color-error)]">
              {submitError}
            </div>
          ) : null}
        </div>
        <div className="shrink-0 flex justify-end gap-2 border-t border-border-subtle bg-surface-2/50 px-5 py-4">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" onClick={onSubmit} disabled={!canSubmit}>
            {isSubmitting ? "Creating..." : "Create task"}
          </Button>
        </div>
      </div>
    </>
  );
}

function TaskField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-medium text-text-secondary">
        {label}
        {required ? " *" : ""}
      </div>
      {children}
      {error ? <div className="mt-1 text-[11px] text-[var(--color-error)]">{error}</div> : null}
    </div>
  );
}

function formatDueLabel(dateValue: string, timeValue: string) {
  const date = new Date(`${dateValue}T${timeValue}:00`);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${timeValue}`;
}

function parseDueLabel(due: string) {
  const match = due.match(/^(\d{1,2}) ([A-Za-z]{3}) (\d{2}:\d{2})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = MONTHS.indexOf(match[2]);
  const [hh, mm] = match[3].split(":").map(Number);
  if (month < 0) return null;
  const date = new Date();
  date.setMonth(month, day);
  date.setHours(hh, mm, 0, 0);
  return date;
}

function nextTaskId(tasks: OpsTask[]) {
  const maxId = tasks.reduce((max, task) => {
    const n = Number(task.id.replace("TSK-", ""));
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `TSK-${maxId + 1}`;
}

export default TasksFeature;
