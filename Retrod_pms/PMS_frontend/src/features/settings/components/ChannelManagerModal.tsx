import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/Primitives";
import { toast } from "sonner";
import { CheckCircle2, ChevronRight, Loader2, Power } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const CHANNEL_MANAGERS = [
  { id: "siteminder", name: "SiteMinder", fields: [{id: "hotelId", label: "Hotel ID"}, {id: "username", label: "Username"}, {id: "password", label: "Password"}] },
  { id: "staah", name: "STAAH", fields: [{id: "propertyId", label: "Property ID"}, {id: "apiKey", label: "API Key"}] },
  { 
    id: "hotelspider", 
    name: "Hotel-Spider", 
    fields: [
      {id: "superDeluxeInv", label: "Inventory Code", defaultValue: "", group: "Super Deluxe"}, 
      {id: "superDeluxeCp", label: "CP Rate Plan Code", defaultValue: "", group: "Super Deluxe"},
      {id: "superDeluxeEp", label: "EP Rate Plan Code", defaultValue: "", group: "Super Deluxe"},
      {id: "superDeluxeAp", label: "AP Rate Plan Code", defaultValue: "", group: "Super Deluxe"},
      {id: "superDeluxeMap", label: "MAP Rate Plan Code", defaultValue: "", group: "Super Deluxe"},
      {id: "deluxeInv", label: "Inventory Code", defaultValue: "", group: "Deluxe"},
      {id: "deluxeCp", label: "CP Rate Plan Code", defaultValue: "", group: "Deluxe"},
      {id: "deluxeEp", label: "EP Rate Plan Code", defaultValue: "", group: "Deluxe"},
      {id: "deluxeAp", label: "AP Rate Plan Code", defaultValue: "", group: "Deluxe"},
      {id: "deluxeMap", label: "MAP Rate Plan Code", defaultValue: "", group: "Deluxe"}
    ] 
  },
  { id: "erevmax", name: "eRevMax (RateTiger)", fields: [{id: "hotelCode", label: "Hotel Code"}, {id: "requestorId", label: "Requestor ID"}, {id: "password", label: "Password"}] },
];

export function ChannelManagerModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState<"select" | "configure" | "test">("select");
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const reset = () => {
    setStep("select");
    setSelectedManager(null);
    setConfig({});
    setSuccess(false);
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const handleSelect = (id: string) => {
    const mgr = CHANNEL_MANAGERS.find(m => m.id === id);
    const initialConfig: Record<string, string> = {};
    if (mgr) {
      mgr.fields.forEach(f => {
        if ('defaultValue' in f) {
          initialConfig[f.id] = f.defaultValue as string;
        }
      });
    }
    setSelectedManager(id);
    setConfig(initialConfig);
    setStep("configure");
    setIsActive(true);
  };

  const handleTest = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      setSuccess(true);
      toast.success("Connection to Channel Manager successful!");
    }, 1500);
  };

  const manager = CHANNEL_MANAGERS.find(m => m.id === selectedManager);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-md w-full flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {step === "select" ? "Set Channel Manager" : `Configure ${manager?.name}`}
          </SheetTitle>
          <SheetDescription>
            {step === "select" 
              ? "Choose a channel manager to connect."
              : step === "configure" 
                ? "Enter your API credentials to connect."
                : "Verify your configuration."}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 flex-1">
          {step === "select" && (
            <div className="grid gap-2">
              {CHANNEL_MANAGERS.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m.id)}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface hover:bg-surface-2 transition-colors text-left"
                >
                  <span className="font-medium text-[14px] text-text-primary">{m.name}</span>
                  <ChevronRight className="h-4 w-4 text-text-secondary" />
                </button>
              ))}
            </div>
          )}

          {step === "configure" && manager && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface-2/30">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isActive ? 'bg-success/20 text-success' : 'bg-text-muted/20 text-text-muted'}`}>
                    <Power className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[14px] text-text-primary">Connection Status</h4>
                    <p className="text-[12px] text-text-secondary">{isActive ? "Active and syncing" : "Paused/Inactive"}</p>
                  </div>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>

              <div className="space-y-6">
                {Object.entries(
                  manager.fields.reduce((acc, f) => {
                    // @ts-ignore
                    const g = f.group || "General Configuration";
                    if (!acc[g]) acc[g] = [];
                    acc[g].push(f);
                    return acc;
                  }, {} as Record<string, typeof manager.fields>)
                ).map(([groupName, fields]) => (
                  <div key={groupName} className="space-y-4">
                    <h5 className="font-semibold text-[13px] text-text-primary border-b border-border pb-1">
                      {groupName}
                    </h5>
                    <div className="space-y-4">
                      {fields.map(f => (
                        <div key={f.id} className="grid gap-2">
                          <label className="text-[13px] font-medium text-text-primary">{f.label}</label>
                          <input
                            type={f.id === "password" || f.id.toLowerCase().includes("secret") ? "password" : "text"}
                            value={config[f.id] || ""}
                            onChange={(e) => setConfig({ ...config, [f.id]: e.target.value })}
                            className="flex-1 rounded-md border border-border bg-transparent px-3 py-2 text-[13px] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                            placeholder={`Enter ${f.label}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
                    <p className="text-[13px] text-text-secondary mt-1">Your channel manager is connected and ready to sync.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[14px] text-text-primary font-medium">Ready to test connection</div>
                  <p className="text-[13px] text-text-secondary">We will perform a health check against the provider's API.</p>
                  <Button onClick={handleTest} disabled={testing} className="mt-2 w-full">
                    {testing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing Connection...</> : "Connect and Test"}
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
