import { useState } from "react";
import { Menu } from "lucide-react";
import { SuperadminSidebar } from "./SuperadminSidebar";
import { SuperadminTopBar } from "./SuperadminTopBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function SuperadminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const isSidebarCollapsed = isMobile ? false : collapsed;
  const showMobileSidebar = isMobile && mobileOpen;

  return (
    <div className={cn("flex min-h-screen w-full bg-background text-foreground", mobileOpen && isMobile ? "h-screen overflow-hidden" : "")}>
      {isMobile && mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-foreground/45"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={cn(
          "z-50",
          isMobile ? "fixed left-0 top-0 h-screen transition-transform duration-200" : "",
          isMobile && !showMobileSidebar ? "-translate-x-full" : "translate-x-0",
        )}
      >
        <SuperadminSidebar
          collapsed={isSidebarCollapsed}
          onToggle={() => (isMobile ? setMobileOpen(false) : setCollapsed((c) => !c))}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <SuperadminTopBar
          mobileNavButton={
            isMobile ? (
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setMobileOpen(true)}
                className="rounded-md p-2 text-text-secondary hover:bg-surface-2 hover:text-text-primary"
              >
                <Menu className="h-4 w-4" />
              </button>
            ) : null
          }
        />
        <main className="flex-1 overflow-x-hidden pb-[env(safe-area-inset-bottom)]">{children}</main>
      </div>
    </div>
  );
}
export default SuperadminShell;
