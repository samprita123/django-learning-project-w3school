import { useState } from "react";
import { Save, Store, Receipt, IndianRupee, ImagePlus, CheckCircle2 } from "lucide-react";
import { Button, Card, CardHeader } from "@/components/ui/Primitives";

export function PosSettingsFeature() {
  const [formData, setFormData] = useState({
    outletName: "Main Restaurant",
    address: "123 Hotel Avenue, City Center, 400001",
    contactNumber: "+91 98765 43210",
    gstNumber: "27ABCDE1234F1Z5",
    fssaiNumber: "11519000000123",
    footerMessage: "Thank you for dining with us!",
    upiId: "hotelname@okhdfcbank",
    merchantName: "Retrod Hotel Restaurant",
  });

  const [activeTab, setActiveTab] = useState<"billing" | "payment">("billing");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">POS Settings</h1>
          <p className="text-[13px] text-text-secondary mt-1">Configure outlet details, billing information, and payment gateways.</p>
        </div>
        <Button variant="primary" onClick={handleSave}>
          {isSaved ? <CheckCircle2 className="h-4 w-4 mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
          {isSaved ? "Saved" : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <Card className="md:col-span-1 h-fit p-2">
          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => setActiveTab("billing")}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                activeTab === "billing" ? "bg-brand/10 text-brand" : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
              }`}
            >
              <Store className="h-4 w-4" />
              Outlet & Billing
            </button>
            <button
              onClick={() => setActiveTab("payment")}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                activeTab === "payment" ? "bg-brand/10 text-brand" : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
              }`}
            >
              <IndianRupee className="h-4 w-4" />
              Payment Gateway
            </button>
          </nav>
        </Card>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          {activeTab === "billing" && (
            <>
              <Card>
                <CardHeader title="Outlet Information" hint="Basic details printed on the top of the bill" />
                <div className="p-5 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-text-primary">Outlet Logo</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-surface-2/50 transition-colors cursor-pointer w-full max-w-sm">
                      <div className="w-12 h-12 bg-surface-2 rounded-full flex items-center justify-center mb-3">
                        <ImagePlus className="h-6 w-6 text-text-secondary" />
                      </div>
                      <p className="text-[13px] font-medium text-text-primary">Click to upload logo</p>
                      <p className="text-[11px] text-text-secondary mt-1">Recommended: 400x150px, Max 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-text-primary">Outlet Name</label>
                      <input
                        type="text"
                        value={formData.outletName}
                        onChange={(e) => setFormData({ ...formData, outletName: e.target.value })}
                        className="w-full h-9 px-3 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-medium text-text-primary">Contact Number</label>
                      <input
                        type="text"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                        className="w-full h-9 px-3 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-text-primary">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={2}
                      className="w-full p-3 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand resize-none"
                    />
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader title="Tax & Compliance" hint="Legal numbers required for billing" />
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-text-primary">GST Number</label>
                    <input
                      type="text"
                      value={formData.gstNumber}
                      onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                      className="w-full h-9 px-3 rounded-md border border-border bg-surface text-[13px] font-mono focus:outline-none focus:border-brand uppercase"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-text-primary">FSSAI License Number</label>
                    <input
                      type="text"
                      value={formData.fssaiNumber}
                      onChange={(e) => setFormData({ ...formData, fssaiNumber: e.target.value })}
                      className="w-full h-9 px-3 rounded-md border border-border bg-surface text-[13px] font-mono focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader title="Receipt Footer" hint="Message printed at the bottom of the bill" />
                <div className="p-5">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-text-primary">Footer Message</label>
                    <input
                      type="text"
                      value={formData.footerMessage}
                      onChange={(e) => setFormData({ ...formData, footerMessage: e.target.value })}
                      className="w-full h-9 px-3 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </Card>
            </>
          )}

          {activeTab === "payment" && (
            <Card>
              <CardHeader title="UPI QR Settings" hint="Configure UPI details to generate payment QR codes on bills" />
              <div className="p-5 space-y-6">
                <div className="bg-brand/5 border border-brand/20 rounded-lg p-4 flex gap-3">
                  <Receipt className="h-5 w-5 text-brand shrink-0" />
                  <div>
                    <h4 className="text-[14px] font-semibold text-brand-dark">Dynamic QR Code Generation</h4>
                    <p className="text-[13px] text-brand-dark/80 mt-1">
                      By configuring your UPI details, the POS will automatically generate and print a dynamic QR code on the final receipt containing the exact bill amount. This allows customers to pay directly to your bank account via PhonePe, GPay, Paytm, etc.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-text-primary">Merchant UPI ID <span className="text-error">*</span></label>
                    <input
                      type="text"
                      value={formData.upiId}
                      onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                      placeholder="e.g. hotelname@okhdfcbank"
                      className="w-full h-9 px-3 rounded-md border border-border bg-surface text-[13px] font-mono focus:outline-none focus:border-brand"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-text-primary">Merchant Name (as registered with bank) <span className="text-error">*</span></label>
                    <input
                      type="text"
                      value={formData.merchantName}
                      onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
                      placeholder="e.g. Retrod Hotel Restaurant"
                      className="w-full h-9 px-3 rounded-md border border-border bg-surface text-[13px] focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <p className="text-[12px] text-text-secondary">Scan this sample QR to test your configuration</p>
                  <div className="h-24 w-24 bg-surface-2 rounded-md border border-border flex items-center justify-center">
                    {/* Placeholder for actual QR code preview */}
                    <div className="text-[10px] text-text-secondary text-center p-2">QR Code Preview</div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
