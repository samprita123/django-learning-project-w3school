import { useState } from "react";
import { PosSidebar } from "./PosSidebar";
import { PosTopBar } from "./PosTopBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function PosShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

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
          "z-50 shrink-0",
          isMobile ? "fixed left-0 top-0 h-screen transition-transform duration-200" : "",
          isMobile && !mobileOpen ? "-translate-x-full" : "translate-x-0",
        )}
      >
        <PosSidebar collapsed={false} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <PosTopBar onOpenMobileNav={isMobile ? () => setMobileOpen(true) : undefined} />
        <main className="flex-1 overflow-x-hidden pb-[env(safe-area-inset-bottom)]">
          {children}
        </main>
      </div>
    </div>
  );
}
