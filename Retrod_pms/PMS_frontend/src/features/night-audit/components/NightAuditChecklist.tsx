import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNightAudit } from "../store/NightAuditContext";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, PlayCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: "pending" | "running" | "success" | "error";
  errorMessage?: string;
}

const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: "res", title: "Reservation Validation", description: "Checking for pending check-ins, no-shows, and overbookings.", status: "pending" },
  { id: "room", title: "Room Status Validation", description: "Verifying FO vs Housekeeping discrepancies.", status: "pending" },
  { id: "folio", title: "Guest Folio Validation", description: "Ensuring all posted charges match and balances are accurate.", status: "pending" },
  { id: "pos", title: "POS Validation", description: "Checking that all restaurant and bar transactions are closed and synced.", status: "pending" },
  { id: "tax", title: "Tax Validation", description: "Verifying GST, VAT, and city taxes are calculated correctly.", status: "pending" },
];

export function NightAuditChecklist() {
  const { nextStep, prevStep, setChecklistValidated } = useNightAudit();
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [isAllValid, setIsAllValid] = useState(false);

  const runValidation = (id: string) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, status: "running" } : item)));
    
    // Simulate API call for validation
    setTimeout(() => {
      setChecklist((prev) => {
        const updated = prev.map((item) => {
          if (item.id === id) {
            // Simulate an error on the room validation just to show the UI
            if (id === "room" && item.status === "running" && !item.errorMessage) {
              return { ...item, status: "error" as const, errorMessage: "Mismatch found: Room 304 is marked Vacant Dirty in FO but Clean in HK." };
            }
            return { ...item, status: "success" as const, errorMessage: undefined };
          }
          return item;
        });
        
        if (updated.every(i => i.status === "success")) {
          setIsAllValid(true);
        }
        
        return updated;
      });
    }, 1500);
  };

  const resolveError = (id: string) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, status: "success", errorMessage: undefined } : item)));
    if (checklist.every(i => i.id === id || i.status === "success")) {
      setIsAllValid(true);
    }
  };

  const runAll = () => {
    checklist.forEach(item => {
      if (item.status === "pending") runValidation(item.id);
    });
  };

  const handleContinue = () => {
    if (isAllValid) {
      setChecklistValidated(true);
      nextStep();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Checklists</h2>
          <p className="text-muted-foreground">Validate operations across all departments before posting.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={prevStep}>Back</Button>
          <Button onClick={runAll} variant="secondary" disabled={isAllValid}>
            <PlayCircle className="mr-2 h-4 w-4" /> Run All Checks
          </Button>
          <Button onClick={handleContinue} disabled={!isAllValid}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {checklist.map((item) => (
          <Card key={item.id} className={item.status === "error" ? "border-destructive" : ""}>
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </div>
              <div>
                {item.status === "pending" && (
                  <Button variant="outline" size="sm" onClick={() => runValidation(item.id)}>
                    Validate
                  </Button>
                )}
                {item.status === "running" && (
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                  </div>
                )}
                {item.status === "success" && (
                  <div className="flex items-center text-green-600 font-medium text-sm">
                    <CheckCircle2 className="mr-2 h-5 w-5" /> Passed
                  </div>
                )}
              </div>
            </CardHeader>
            {item.status === "error" && (
              <CardContent className="pt-0 pb-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Failed</AlertTitle>
                  <AlertDescription className="flex justify-between items-center mt-2">
                    <span>{item.errorMessage}</span>
                    <Button variant="destructive" size="sm" onClick={() => resolveError(item.id)}>
                      Auto-Resolve
                    </Button>
                  </AlertDescription>
                </Alert>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
