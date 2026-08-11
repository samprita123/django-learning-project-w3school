import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNightAudit } from "../store/NightAuditContext";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { MOCK_CASHIER_SHIFTS } from "../lib/mockAuditData";

export function CashierClosing() {
  const { nextStep, prevStep, setCashierClosed } = useNightAudit();
  const [shifts, setShifts] = useState(MOCK_CASHIER_SHIFTS.map(s => ({ ...s, confirmed: false })));

  const handleConfirmShift = (id: string) => {
    setShifts(prev => prev.map(s => s.id === id ? { ...s, confirmed: true } : s));
  };

  const allConfirmed = shifts.every(s => s.confirmed);

  const handleContinue = () => {
    if (allConfirmed) {
      setCashierClosed(true);
      nextStep();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cashier Closing</h2>
          <p className="text-muted-foreground">Verify cash drops and variances for all shifts before proceeding.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={prevStep}>Back</Button>
          <Button onClick={handleContinue} disabled={!allConfirmed}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cashier Shifts Overview</CardTitle>
          <CardDescription>All cashiers must be closed out with no unexplained variance.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shift</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead className="text-right">Opening</TableHead>
                <TableHead className="text-right">Cash Sales</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Dropped</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell className="font-medium">{shift.shift}</TableCell>
                  <TableCell>{shift.name}</TableCell>
                  <TableCell className="text-right">${shift.opening.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${shift.cashSales.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-destructive">
                    {shift.expenses > 0 ? `-$${shift.expenses.toFixed(2)}` : "$0.00"}
                  </TableCell>
                  <TableCell className="text-right font-medium">${shift.dropped.toFixed(2)}</TableCell>
                  <TableCell className={`text-right font-bold ${shift.variance < 0 ? "text-destructive" : shift.variance > 0 ? "text-green-600" : ""}`}>
                    {shift.variance < 0 ? `-$${Math.abs(shift.variance).toFixed(2)}` : `$${shift.variance.toFixed(2)}`}
                  </TableCell>
                  <TableCell className="text-right">
                    {shift.confirmed ? (
                      <span className="inline-flex items-center text-sm text-green-600 font-medium">
                        <CheckCircle2 className="mr-1 h-4 w-4" /> Confirmed
                      </span>
                    ) : (
                      <Button size="sm" variant={shift.variance !== 0 ? "destructive" : "default"} onClick={() => handleConfirmShift(shift.id)}>
                        {shift.variance !== 0 ? "Accept Variance" : "Confirm Drop"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
