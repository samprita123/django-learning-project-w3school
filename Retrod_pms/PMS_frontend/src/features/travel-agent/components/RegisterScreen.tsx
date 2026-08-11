import { Link } from "@tanstack/react-router";
import { Building, ShieldCheck, Mail, Lock, User, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Primitives";

export function RegisterScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex w-full items-center justify-center bg-background p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">Apply as a Partner</h2>
            <p className="mt-2 text-[13px] text-text-secondary">Please fill in the details below to enroll your agency.</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-text-primary">Agency Name</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                  <Building className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-[13px] text-text-primary outline-none placeholder:text-text-disabled focus:border-brand"
                  placeholder="Enter your agency name"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-medium text-text-primary">Contact Person</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-[13px] text-text-primary outline-none placeholder:text-text-disabled focus:border-brand"
                  placeholder="Full name"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-medium text-text-primary">Email Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-[13px] text-text-primary outline-none placeholder:text-text-disabled focus:border-brand"
                  placeholder="you@agency.com"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-text-primary">Phone Number</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="tel"
                  className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-[13px] text-text-primary outline-none placeholder:text-text-disabled focus:border-brand"
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-medium text-text-primary">Location / Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                  <MapPin className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-[13px] text-text-primary outline-none placeholder:text-text-disabled focus:border-brand"
                  placeholder="City, Country"
                  required
                />
              </div>
            </div>

            <Link to="/travel-agent/login" className="block mt-6">
              <Button variant="primary" className="w-full justify-center py-2.5">
                Submit Application
              </Button>
            </Link>
          </form>

          <div className="text-center text-[12px] text-text-secondary">
            Already a registered partner? <Link to="/travel-agent/login" className="font-medium text-brand hover:underline">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
