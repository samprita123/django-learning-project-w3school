import { Card } from "@/components/ui/Primitives";

export type ReportGroup = {
  title: string;
  items: string[];
};

interface ReportsSidebarProps {
  groups: ReportGroup[];
  selectedCategory: string;
  onSelectCategory: (c: string) => void;
}

export function ReportsSidebar({
  groups,
  selectedCategory,
  onSelectCategory,
}: ReportsSidebarProps) {
  return (
    <Card className="h-fit py-2">
      {groups.map((group, groupIndex) => (
        <div key={group.title} className={groupIndex > 0 ? "mt-4" : ""}>
          <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
            {group.title}
          </div>
          <ul className="px-2 space-y-0.5">
            {group.items.map((c) => {
              const active = selectedCategory === c;
              return (
                <li key={c}>
                  <button
                    onClick={() => onSelectCategory(c)}
                    className={`w-full rounded-md px-3 py-2 text-left text-[13px] transition ${
                      active
                        ? "bg-primary-tint text-primary-pressed font-medium"
                        : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                    }`}
                  >
                    {c}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </Card>
  );
}
export default ReportsSidebar;
