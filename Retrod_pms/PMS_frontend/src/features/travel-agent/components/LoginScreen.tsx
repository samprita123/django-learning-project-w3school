import { Link } from "@tanstack/react-router";
import { Building, ShieldCheck, Mail, Lock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Primitives";

export function LoginScreen() {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden w-1/2 bg-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 border border-white/20">
            <Building className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-8 text-4xl font-bold leading-tight text-white">
            Retrod B2B <br />
            Travel Partner Portal
          </h1>
          <p className="mt-4 max-w-md text-slate-300">
            Join thousands of travel partners worldwide. Access live inventory, manage bookings, and track your commissions seamlessly.
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-white/10 border border-white/20 p-2"><ShieldCheck className="h-5 w-5 text-white" /></div>
            <div>
              <h3 className="font-semibold text-white">Secure & Reliable</h3>
              <p className="text-[13px] text-slate-300">Enterprise-grade security for your transactions.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full items-center justify-center bg-background p-8 lg:w-1/2">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">Welcome back</h2>
            <p className="mt-2 text-[13px] text-text-secondary">Please sign in to your agent account.</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-text-primary">Agency Code / Agent ID</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  defaultValue="AGT-99281"
                  className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-[13px] text-text-primary outline-none placeholder:text-text-disabled focus:border-brand"
                  placeholder="Enter your Agent ID"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-medium text-text-primary">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  defaultValue="password123"
                  className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-[13px] text-text-primary outline-none placeholder:text-text-disabled focus:border-brand"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[12px]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-border text-brand focus:ring-brand" defaultChecked />
                <span className="text-text-secondary">Remember me</span>
              </label>
              <a href="#" className="font-medium text-brand hover:underline">Forgot password?</a>
            </div>

            <Link to="/travel-agent/dashboard" className="block mt-6">
              <Button variant="primary" className="w-full justify-center py-2.5">
                Sign In
              </Button>
            </Link>
          </form>

          <div className="border-t border-border-subtle p-3 bg-surface-2/30 rounded-b-lg">
            <a href="/travel-agent/login" className="flex w-full items-center justify-center gap-1.5 text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors">
                Access B2B Portal <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>

          <div className="text-center text-[12px] text-text-secondary">
            Not a registered partner? <Link to="/travel-agent/register" className="font-medium text-brand hover:underline">Apply here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
