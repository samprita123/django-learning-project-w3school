import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNightAudit } from "../store/NightAuditContext";
import { FileText, Download, CheckCircle, Calendar, RefreshCcw, Mail, MessageCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function RollOverComplete() {
  const { businessDate, rollOverDate, setStep } = useNightAudit();
  const [rollingOver, setRollingOver] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 5;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setRollingOver(false);
        rollOverDate(); // Proceed to update the date in context
      }
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadReport = (name: string) => {
    console.log(`Downloading ${name}...`);
  };

  if (rollingOver) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] space-y-6">
        <RefreshCcw className="h-16 w-16 text-primary animate-spin" />
        <h2 className="text-2xl font-bold">Rolling Over Business Date...</h2>
        <p className="text-muted-foreground">Generating reports and updating ledgers. Please do not close this window.</p>
        <Progress value={progress} className="w-[300px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-500 max-w-4xl mx-auto pt-8">
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Night Audit Completed Successfully!</h2>
        <p className="text-muted-foreground text-lg flex items-center justify-center">
          The hotel is now operating on <Calendar className="mx-2 h-5 w-5" /> <span className="font-semibold text-foreground ml-1">{businessDate}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Audit Reports</CardTitle>
          <CardDescription>The following reports have been generated and archived. Copies have been emailed to management.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              "Daily Revenue Report",
              "Tax Collection Summary",
              "Occupancy & Arrival Report",
              "Cashier Shift Variances",
              "City Ledger Transfer Log",
              "Housekeeping Discrepancy Report"
            ].map((report) => (
              <div key={report} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span className="font-medium text-sm">{report}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDownloadReport(report)} title="Download">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t p-4">
          <Button variant="outline" onClick={() => console.log('Emailing all reports...')}>
            <Mail className="mr-2 h-4 w-4" />
            Email All
          </Button>
          <Button variant="outline" onClick={() => console.log('Sending all reports via WhatsApp...')}>
            <MessageCircle className="mr-2 h-4 w-4 text-green-500" />
            WhatsApp All
          </Button>
        </CardFooter>
      </Card>

      <div className="flex justify-center pt-4">
        <Button size="lg" onClick={() => window.location.href = '/'}>
          Return to Front Desk
        </Button>
      </div>
    </div>
  );
}
