import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNightAudit } from "../store/NightAuditContext";
import { ArrowRight, AlertTriangle, ShieldCheck } from "lucide-react";

export function ManagerApproval() {
  const { nextStep, prevStep, setManagerApproved } = useNightAudit();
  const [pin, setPin] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  const handleApprove = () => {
    if (pin === "1234") { // Mock PIN
      setManagerApproved(true);
      setError("");
      nextStep();
    } else {
      setError("Invalid PIN. Only authorized managers can approve the Night Audit.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto pt-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manager Approval Required</h2>
        <p className="text-muted-foreground">Please review the audit summary and provide authorization to roll the business date forward.</p>
      </div>

      <Card className="border-orange-200 bg-orange-50/30 dark:border-orange-900/50 dark:bg-orange-900/10">
        <CardHeader>
          <CardTitle className="text-orange-700 dark:text-orange-400 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" /> Audit Warnings (1)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm space-y-1 text-orange-800 dark:text-orange-300">
            <li>Cashier Bob Jones dropped with a $50.00 negative variance.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5 text-primary" /> Digital Signature
          </CardTitle>
          <CardDescription>Enter your Manager PIN to authorize closing the business day.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="remarks">Approval Remarks (Optional)</Label>
            <Textarea 
              id="remarks" 
              placeholder="Enter notes regarding variances or discrepancies..." 
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pin">Manager PIN</Label>
            <Input 
              id="pin" 
              type="password" 
              placeholder="****" 
              className="max-w-[200px] text-lg tracking-widest"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError("");
              }}
            />
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
            <p className="text-xs text-muted-foreground mt-1">Hint: The mock PIN is 1234</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={prevStep}>Go Back</Button>
        <Button size="lg" onClick={handleApprove} disabled={pin.length < 4}>
          Authorize & Roll Over Date <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
