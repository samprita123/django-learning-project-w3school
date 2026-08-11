import { NightAuditProvider, useNightAudit } from "../store/NightAuditContext";
import { NightAuditDashboard } from "./NightAuditDashboard";
import { NightAuditChecklist } from "./NightAuditChecklist";
import { AutoPostingModule } from "./AutoPostingModule";
import { CashierClosing } from "./CashierClosing";
import { ManagerApproval } from "./ManagerApproval";
import { RollOverComplete } from "./RollOverComplete";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";

const STEPS = [
  { id: 1, title: "Dashboard & Summary" },
  { id: 2, title: "Checklists & Validations" },
  { id: 3, title: "Auto Posting" },
  { id: 4, title: "Cashier Closing" },
  { id: 5, title: "Manager Approval" },
  { id: 6, title: "Roll Over & Reports" },
];

function WizardContent() {
  const { currentStep, businessDate } = useNightAudit();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <NightAuditDashboard />;
      case 2:
        return <NightAuditChecklist />;
      case 3:
        return <AutoPostingModule />;
      case 4:
        return <CashierClosing />;
      case 5:
        return <ManagerApproval />;
      case 6:
        return <RollOverComplete />;
      default:
        return <NightAuditDashboard />;
    }
  };

  return (
    <div className="flex h-full flex-col md:flex-row gap-6 p-6">
      {/* Sidebar Progress Tracker */}
      <div className="w-full md:w-64 shrink-0 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Night Audit</h2>
          <p className="text-sm text-muted-foreground">Business Date: {businessDate}</p>
        </div>
        
        <Card>
          <CardContent className="p-4 space-y-4">
            {STEPS.map((step) => (
              <div 
                key={step.id} 
                className={`flex items-center gap-3 ${currentStep === step.id ? "text-primary font-medium" : currentStep > step.id ? "text-muted-foreground" : "text-muted-foreground/50"}`}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className={`h-5 w-5 ${currentStep === step.id ? "text-primary fill-primary/10" : ""}`} />
                )}
                <span className="text-sm">{step.title}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {renderStep()}
      </div>
    </div>
  );
}

export function NightAuditWizard() {
  return (
    <NightAuditProvider>
      <WizardContent />
    </NightAuditProvider>
  );
}
