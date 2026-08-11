import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNightAudit } from "../store/NightAuditContext";
import { ArrowRight, Terminal } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LogEntry {
  id: string;
  time: string;
  message: string;
  status: "info" | "success" | "warning";
}

const POSTING_TASKS = [
  "Connecting to Restaurant POS...",
  "Importing F&B Charges: 42 tickets found.",
  "Posting F&B Charges to Guest Folios...",
  "Connecting to Laundry & Spa systems...",
  "Importing Ancillary Charges: 12 tickets found.",
  "Posting Ancillary Charges to Guest Folios...",
  "Calculating Daily Room Rates...",
  "Applying Corporate Discounts...",
  "Posting Room Charges: 123 rooms processed.",
  "Posting Fixed Meal Plan Charges...",
  "Validating Total Posted Revenue against Ledger...",
  "Auto-Posting Routine Completed Successfully."
];

export function AutoPostingModule() {
  const { nextStep, prevStep, setAutoPostingComplete } = useNightAudit();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const startPosting = () => {
    setIsRunning(true);
    setLogs([{ id: "start", time: new Date().toLocaleTimeString(), message: "Initializing Auto-Posting sequence...", status: "info" }]);
    setProgress(0);

    let currentTask = 0;
    const interval = setInterval(() => {
      if (currentTask >= POSTING_TASKS.length) {
        clearInterval(interval);
        setIsRunning(false);
        setAutoPostingComplete(true);
        return;
      }

      setLogs((prev) => [
        ...prev,
        {
          id: `task-${currentTask}`,
          time: new Date().toLocaleTimeString(),
          message: POSTING_TASKS[currentTask],
          status: currentTask === POSTING_TASKS.length - 1 ? "success" : "info"
        }
      ]);
      
      setProgress(((currentTask + 1) / POSTING_TASKS.length) * 100);
      currentTask++;
    }, 800);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Auto Posting</h2>
          <p className="text-muted-foreground">Automatically post room rates, fixed charges, and import from other departments.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={prevStep} disabled={isRunning}>Back</Button>
          <Button onClick={nextStep} disabled={progress < 100}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <Terminal className="mr-2 h-5 w-5" /> Posting Console
            </CardTitle>
            {!isRunning && progress === 0 && (
              <Button onClick={startPosting}>Start Auto-Posting</Button>
            )}
          </div>
          {isRunning || progress > 0 ? (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="p-0">
          <div 
            ref={scrollRef}
            className="h-[400px] bg-slate-950 text-slate-50 p-4 font-mono text-sm overflow-y-auto"
          >
            {logs.length === 0 ? (
              <div className="text-slate-500 italic">Waiting to start posting...</div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-4">
                    <span className="text-slate-500 shrink-0">[{log.time}]</span>
                    <span className={
                      log.status === "success" ? "text-green-400" :
                      log.status === "warning" ? "text-yellow-400" : "text-slate-300"
                    }>
                      {log.message}
                    </span>
                  </div>
                ))}
                {isRunning && (
                  <div className="flex gap-4 animate-pulse">
                    <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
                    <span className="text-slate-300">_</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
