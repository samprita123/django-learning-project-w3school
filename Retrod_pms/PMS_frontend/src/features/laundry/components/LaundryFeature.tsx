import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LaundryDashboard } from "./LaundryDashboard";
import { GuestLaundryRequest } from "./GuestLaundryRequest";
import { LaundryWorkflow } from "./LaundryWorkflow";
import { LinenManagement } from "./LinenManagement";
import { StaffUniformManagement } from "./StaffUniformManagement";
import { LaundryMachines } from "./LaundryMachines";
import { BillingModule } from "./BillingModule";
import { QualityControl } from "./QualityControl";
import { PageHeader } from "@/components/ui/Primitives";

export function LaundryFeature() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Laundry Management"
        description="Complete lifecycle management for guest laundry, linen, and uniforms."
      />

      <div className="flex-1 overflow-auto bg-muted/20 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col space-y-6">
          <TabsList className="w-fit">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="requests">New Request</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="linen">Linen</TabsTrigger>
            {/* <TabsTrigger value="uniforms">Uniforms</TabsTrigger>
            <TabsTrigger value="machines">Machines</TabsTrigger>
            <TabsTrigger value="qc">Quality Control</TabsTrigger> */}
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="m-0 flex-1 outline-none">
            <LaundryDashboard />
          </TabsContent>
          
          <TabsContent value="requests" className="m-0 flex-1 outline-none">
            <GuestLaundryRequest />
          </TabsContent>
          
          <TabsContent value="workflow" className="m-0 flex-1 outline-none">
            <LaundryWorkflow />
          </TabsContent>

          <TabsContent value="linen" className="m-0 flex-1 outline-none">
            <LinenManagement />
          </TabsContent>

          {/* <TabsContent value="uniforms" className="m-0 flex-1 outline-none">
            <StaffUniformManagement />
          </TabsContent>

          <TabsContent value="machines" className="m-0 flex-1 outline-none">
            <LaundryMachines />
          </TabsContent>

          <TabsContent value="qc" className="m-0 flex-1 outline-none">
            <QualityControl />
          </TabsContent> */}

          <TabsContent value="billing" className="m-0 flex-1 outline-none">
            <BillingModule />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
