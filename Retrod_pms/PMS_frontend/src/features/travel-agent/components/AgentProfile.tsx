import { Building, Mail, Phone, MapPin, Briefcase, CreditCard, ShieldCheck, Globe, Award, FileText, UploadCloud, Landmark, X } from "lucide-react";
import { Card, CardHeader, Button } from "@/components/ui/Primitives";
import { useState, useRef } from "react";

export function AgentProfile() {
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chequeUploaded, setChequeUploaded] = useState(false);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Agency Profile</h2>
        <p className="text-[13px] text-text-secondary mt-1">Manage your agency details, contacts, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="General Information" />
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-border-subtle">
                <div className="h-16 w-16 overflow-hidden rounded-full border border-border">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Agent Logo" className="h-full w-full object-cover" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-text-primary">Global Escapes Travel</h3>
                  <div className="text-[12px] text-text-secondary">Agent ID: AGT-99281</div>
                </div>
                <div className="ml-auto">
                  <Button variant="outline" size="sm">Change Logo</Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-text-primary">Agency Name</label>
                  <div className="relative">
                    <Building className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                    <input type="text" defaultValue="Global Escapes Travel" className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-text-primary">Primary Contact Name</label>
                  <div className="relative">
                    <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                    <input type="text" defaultValue="Sarah Jenkins" className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-text-primary">Email Address</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                    <input type="email" defaultValue="contact@globalescapes.com" className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-text-primary">Phone Number</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                    <input type="tel" defaultValue="+91 98765 43210" className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" />
                  </div>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[12px] font-medium text-text-primary">Address</label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-text-secondary" />
                    <textarea className="min-h-[80px] w-full rounded-md border border-border bg-surface pl-9 pr-3 py-2 text-[13px] text-text-primary focus:border-brand focus:outline-none" defaultValue="45 Business Park Road, Sector 44, Gurgaon, Haryana 122003" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border-subtle">
                <Button variant="primary">Save Changes</Button>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Accreditations & Web Presence" />
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-text-primary">IATA Number</label>
                  <div className="relative">
                    <Award className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                    <input type="text" defaultValue="14-3 1234 5" className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-text-primary">TAAI / IATO Number</label>
                  <div className="relative">
                    <Award className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                    <input type="text" placeholder="Optional" className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" />
                  </div>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[12px] font-medium text-text-primary">Website URL</label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                    <input type="url" defaultValue="https://www.globalescapes.com" className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-border-subtle">
                <Button variant="primary">Save Accreditations</Button>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Bank Account Details (For Payouts)" />
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[12px] font-medium text-text-primary">Account Name</label>
                  <div className="relative">
                    <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                    <input type="text" defaultValue="Global Escapes Travel Pvt Ltd" className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-text-primary">Account Number</label>
                  <div className="relative">
                    <Landmark className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                    <input type="text" defaultValue="9876543210123" className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-text-primary">IFSC / SWIFT Code</label>
                  <input type="text" defaultValue="HDFC0001234" className="h-10 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[12px] font-medium text-text-primary">Bank Name</label>
                  <input type="text" defaultValue="HDFC Bank, Cyber City Branch" className="h-10 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-border-subtle">
                <Button variant="primary">Save Bank Details</Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Account Status" />
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20 text-success">
                <ShieldCheck className="h-5 w-5" />
                <div>
                  <div className="text-[13px] font-bold">Verified Partner</div>
                  <div className="text-[11px] opacity-80">KYC Approved</div>
                </div>
              </div>
              
              <div className="space-y-2 pt-2 border-t border-border-subtle text-[13px]">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Tier</span>
                  <span className="font-bold text-brand">Platinum</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Base Commission</span>
                  <span className="font-medium text-text-primary">15%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Credit Limit</span>
                  <span className="font-medium text-text-primary">₹2,00,000</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Billing & Tax" />
            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-text-primary">GSTIN</label>
                <div className="relative">
                  <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                  <input type="text" defaultValue="07AAAAA0000A1Z5" className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-text-primary">PAN</label>
                <input type="text" defaultValue="ABCDE1234F" className="h-10 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" />
              </div>
              <Button variant="outline" className="w-full justify-center">Update Tax Info</Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="KYC & Documents" />
            <div className="p-4 space-y-4">
              <div className="text-[12px] text-text-secondary">Upload required documents to maintain verified status.</div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-2/30">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 flex items-center justify-center rounded bg-success/10 text-success">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-text-primary">Incorporation Cert.</div>
                      <div className="text-[10px] text-success">Verified</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={() => setViewingDoc('Incorporation Cert.')}>View</Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-2/30">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 flex items-center justify-center rounded bg-success/10 text-success">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-text-primary">Owner Aadhaar/ID</div>
                      <div className="text-[10px] text-success">Verified</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={() => setViewingDoc('Owner Aadhaar/ID')}>View</Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-border hover:border-brand/50 transition-colors cursor-pointer bg-surface">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 flex items-center justify-center rounded bg-surface-2 text-text-secondary">
                      <UploadCloud className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-text-primary">Cancelled Cheque</div>
                      <div className={`text-[10px] ${chequeUploaded ? 'text-success' : 'text-error'}`}>{chequeUploaded ? 'Pending Review' : 'Pending Upload'}</div>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={() => setChequeUploaded(true)} 
                    accept="image/*,.pdf" 
                  />
                  <Button variant="outline" size="sm" className="h-6 px-2 text-[11px]" onClick={() => fileInputRef.current?.click()}>
                    {chequeUploaded ? 'Re-upload' : 'Upload'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-xl overflow-hidden w-full max-w-2xl shadow-2xl">
            <div className="p-4 border-b border-border flex justify-between items-center bg-surface-2/50">
              <div>
                <h3 className="font-bold text-text-primary text-[16px]">{viewingDoc}</h3>
                <div className="text-[12px] text-text-secondary font-mono mt-1">Verified Document</div>
              </div>
              <button onClick={() => setViewingDoc(null)} className="text-text-secondary hover:text-error p-1 rounded-md hover:bg-surface transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 bg-surface-2/30 flex justify-center items-center min-h-[400px]">
              <div className="text-center space-y-4">
                <FileText className="h-16 w-16 text-text-secondary mx-auto opacity-50" />
                <div>
                  <p className="text-[14px] font-medium text-text-primary">Document preview is available in production.</p>
                  <p className="text-[12px] text-text-secondary mt-1">Simulated view for {viewingDoc}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end bg-surface-2/50">
              <Button variant="primary" onClick={() => setViewingDoc(null)}>Close Viewer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
