import { Link, useRouterState } from "@tanstack/react-router";
import { Card, CardHeader } from "@/components/ui/Primitives";
import { CHANNEL_MANAGER_NAV } from "@/app/navigation/nav-config";

export function ChannelManagerSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Card className="sticky top-20 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin">
      <CardHeader title="Channel Manager" hint="SU API connected" />
      <ul className="p-2">
        {CHANNEL_MANAGER_NAV.map((item) => {
          if (!item.to) return null;
          const active =
            pathname === item.to ||
            (item.to !== "/channel-manager" && pathname.startsWith(item.to));
          return (
            <li key={item.id}>
              <Link
                to={item.to}
                className={`block rounded-md px-3 py-2 text-[12px] transition ${
                  active
                    ? "bg-primary-tint font-medium text-primary-pressed"
                    : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
