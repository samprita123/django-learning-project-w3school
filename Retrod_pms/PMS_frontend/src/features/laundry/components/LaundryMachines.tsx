import { MOCK_MACHINES } from "../lib/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function LaundryMachines() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Machines & Equipment</h2>
        <p className="text-muted-foreground">Monitor the status and usage of laundry machines.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipment Status</CardTitle>
          <CardDescription>Live monitoring of washers, dryers, and irons.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Machine Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Current Load</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_MACHINES.map((machine) => (
                <TableRow key={machine.id}>
                  <TableCell className="font-medium">{machine.name}</TableCell>
                  <TableCell>{machine.type}</TableCell>
                  <TableCell>{machine.capacity}</TableCell>
                  <TableCell>
                    {machine.currentLoad !== undefined ? (
                      <div className="flex items-center gap-2">
                        <Progress value={machine.currentLoad} className="w-[60px]" />
                        <span className="text-xs text-muted-foreground">{machine.currentLoad}%</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={machine.status === "Operating" ? "default" : machine.status === "Idle" ? "secondary" : "destructive"}>
                      {machine.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm text-primary cursor-pointer hover:underline">Log Maintenance</span>
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
