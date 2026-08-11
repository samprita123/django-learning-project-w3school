import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Plane, Search, Calendar, DollarSign, User, LogOut, Building, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/travel-agent/dashboard", icon: Plane },
  { label: "Book a Room", href: "/travel-agent/search", icon: Search },
  { label: "Reservations", href: "/travel-agent/reservations", icon: Calendar },
  { label: "Commissions", href: "/travel-agent/commissions", icon: DollarSign },
  { label: "My Profile", href: "/travel-agent/profile", icon: User },
];

export function TravelAgentLayout() {
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If we are on the login or register page, don't show the portal nav
  if (pathname === "/travel-agent/login" || pathname === "/travel-agent/register") {
    return (
      <div className="min-h-screen bg-surface-2 text-text-primary">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-2 text-text-primary font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-surface px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            className="sm:hidden p-2 text-text-secondary hover:text-text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded bg-brand/10 text-brand">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-text-primary leading-tight">Retrod Hotels</h1>
            <p className="text-[10px] uppercase tracking-wider text-text-secondary font-medium">B2B Partner Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[13px] font-medium">Global Escapes Travel</span>
            <span className="text-[11px] text-text-secondary">Agent ID: AGT-99281</span>
          </div>
          <div className="h-9 w-9 overflow-hidden rounded-full border border-border">
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Agent" className="h-full w-full object-cover" />
          </div>
          <Link to="/travel-agent/login" className="hidden sm:flex p-2 text-text-secondary hover:text-error transition-colors">
            <LogOut className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-20 w-64 border-r border-border bg-surface pt-16 transition-transform duration-200 ease-in-out sm:sticky sm:top-16 sm:h-[calc(100vh-4rem)] sm:translate-x-0 sm:pt-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex h-full flex-col p-4 overflow-y-auto">
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary px-3 shrink-0">
              Portal Menu
            </div>
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-brand/10 text-brand"
                        : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-border pt-4">
              <div className="rounded-lg bg-surface-2 p-4 text-[12px]">
                <div className="text-text-secondary mb-1">Available Credit</div>
                <div className="text-lg font-bold text-text-primary">₹1,50,000</div>
                <div className="mt-2 text-[10px] text-text-secondary">Limit: ₹2,00,000</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-10 bg-black/20 backdrop-blur-sm sm:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
