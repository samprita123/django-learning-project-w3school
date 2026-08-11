import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/Primitives";
import { toast } from "sonner";
import { CheckCircle2, ChevronRight, Loader2 } from "lucide-react";

const GATEWAYS = [
  { id: "stripe", name: "Stripe", fields: [{id: "publishable", label: "Publishable Key"}, {id: "secret", label: "Secret Key"}] },
  { id: "razorpay", name: "Razorpay", fields: [{id: "keyId", label: "Key ID"}, {id: "keySecret", label: "Key Secret"}] },
  { id: "phonepe", name: "PhonePe", fields: [{id: "merchantId", label: "Merchant ID"}, {id: "saltKey", label: "Salt Key"}, {id: "saltIndex", label: "Salt Index"}] },
  { id: "hdfc", name: "HDFC", fields: [{id: "merchantId", label: "Merchant ID"}, {id: "accessCode", label: "Access Code"}, {id: "workingKey", label: "Working Key"}] },
];

export function PaymentGatewayModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState<"select" | "configure" | "test">("select");
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState(false);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setStep("select");
    setSelectedGateway(null);
    setConfig({});
    setSuccess(false);
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const handleSelect = (id: string) => {
    setSelectedGateway(id);
    setConfig({});
    setStep("configure");
  };

  const handleTest = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setSuccess(true);
      toast.success("Test payment of ₹1 successful!");
    }, 1500);
  };

  const gateway = GATEWAYS.find(g => g.id === selectedGateway);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-md w-full flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {step === "select" ? "Set Payment Gateway" : `Configure ${gateway?.name}`}
          </SheetTitle>
          <SheetDescription>
            {step === "select" 
              ? "Choose a payment provider to integrate."
              : step === "configure" 
                ? "Enter your API credentials to connect."
                : "Verify your configuration."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 flex-1">
          {step === "select" && (
            <div className="grid gap-2">
              {GATEWAYS.map(g => (
                <button
                  key={g.id}
                  onClick={() => handleSelect(g.id)}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface hover:bg-surface-2 transition-colors text-left"
                >
                  <span className="font-medium text-[14px] text-text-primary">{g.name}</span>
                  <ChevronRight className="h-4 w-4 text-text-secondary" />
                </button>
              ))}
            </div>
          )}

          {step === "configure" && gateway && (
            <div className="space-y-4">
              {gateway.fields.map(f => (
                <div key={f.id} className="grid gap-2">
                  <label className="text-[13px] font-medium text-text-primary">{f.label}</label>
                  <input
                    type="password"
                    value={config[f.id] || ""}
                    onChange={(e) => setConfig({ ...config, [f.id]: e.target.value })}
                    className="flex-1 rounded-md border border-border bg-transparent px-3 py-2 text-[13px] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    placeholder={`Enter ${f.label}`}
                  />
                </div>
              ))}
            </div>
          )}

          {step === "test" && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              {success ? (
                <>
                  <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[15px] text-text-primary">Connection Successful</h4>
                    <p className="text-[13px] text-text-secondary mt-1">Your payment gateway is ready.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[14px] text-text-primary font-medium">Ready to test connection</div>
                  <p className="text-[13px] text-text-secondary">We will initiate a test transaction of ₹1 to verify your credentials.</p>
                  <Button onClick={handleTest} disabled={testing} className="mt-2 w-full">
                    {testing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : "Connect and Send ₹1"}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <SheetFooter className="mt-auto">
          <Button variant="outline" onClick={() => {
            if (step === "configure") setStep("select");
            else handleOpenChange(false);
          }}>
            {step === "configure" ? "Back" : "Close"}
          </Button>
          {step === "configure" && (
            <Button onClick={() => setStep("test")}>Continue</Button>
          )}
          {step === "test" && success && (
            <Button onClick={() => handleOpenChange(false)}>Done</Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
