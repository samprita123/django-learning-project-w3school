import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const isSidebarCollapsed = isMobile ? false : collapsed;
  const showMobileSidebar = isMobile && mobileOpen;

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const custom = e as CustomEvent;
      if (typeof custom.detail?.collapsed === "boolean") {
        setCollapsed(custom.detail.collapsed);
      }
    };
    window.addEventListener("app:sidebar-collapse", handleToggle);
    return () => window.removeEventListener("app:sidebar-collapse", handleToggle);
  }, []);

  return (
    <div
      className={cn(
        "flex min-h-screen w-full bg-background text-foreground",
        mobileOpen && isMobile ? "h-screen overflow-hidden" : "",
      )}
    >
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
        <Sidebar
          collapsed={isSidebarCollapsed}
          onToggle={() => (isMobile ? setMobileOpen(false) : setCollapsed((c) => !c))}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          onOpenMobileNav={isMobile ? () => setMobileOpen(true) : undefined}
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
        <main className="flex-1 overflow-x-hidden pb-[env(safe-area-inset-bottom)]">
          {children}
        </main>
      </div>
    </div>
  );
}
