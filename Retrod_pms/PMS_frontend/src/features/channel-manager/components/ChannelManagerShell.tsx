import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/Primitives";
import { ChannelManagerSidebar } from "./ChannelManagerSidebar";

export function ChannelManagerShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <PageHeader
        eyebrow="Commercial · SU Channel Manager"
        title={title}
        description={description}
        actions={actions}
      />
      <div className="responsive-page-x grid grid-cols-1 gap-5 py-4 sm:py-6 lg:grid-cols-[220px_1fr]">
        <ChannelManagerSidebar />
        <div className="min-w-0 space-y-5 sm:space-y-6">{children}</div>
      </div>
    </div>
  );
}
