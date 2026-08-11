import { MOCK_UNIFORMS } from "../lib/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function StaffUniformManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Staff Uniforms</h2>
          <p className="text-muted-foreground">Manage and track employee uniforms.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Issue Uniform
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uniform Directory</CardTitle>
          <CardDescription>All issued uniforms and their current status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Uniform Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_UNIFORMS.map((uniform) => (
                <TableRow key={uniform.id}>
                  <TableCell className="font-medium">{uniform.employeeName}</TableCell>
                  <TableCell>{uniform.department}</TableCell>
                  <TableCell>{uniform.uniformType}</TableCell>
                  <TableCell>
                    <Badge variant={uniform.status === "Clean" ? "secondary" : uniform.status === "In Wash" ? "default" : "destructive"}>
                      {uniform.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Details</Button>
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
