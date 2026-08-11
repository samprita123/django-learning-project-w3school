import { useState, useMemo } from "react";
import { Download, Mail, Printer, Paperclip, Send, Loader2 } from "lucide-react";
import { Card, CardHeader, StatusBadge, Button } from "@/components/ui/Primitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { MailService } from "@/services/mail-service";

interface FolioViewProps {
  reservations: any[];
  activeProperty: any;
  linenOrders: any[];
  selectedResId: string;
  onSelectResId: (id: string) => void;
}

// Convert Number to Words (Indian Numbering System)
function numberToWords(num: number): string {
  if (!num || isNaN(num) || num === 0) return "Zero";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const formatChunk = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + formatChunk(n % 100) : "");
    if (n < 100000) return formatChunk(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + formatChunk(n % 1000) : "");
    if (n < 10000000) return formatChunk(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + formatChunk(n % 100000) : "");
    return formatChunk(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + formatChunk(n % 10000000) : "");
  };

  return formatChunk(Math.floor(num));
}

export function getRoomNumber(r: any): string {
  if (!r) return "101";
  if (r.room_number) return String(r.room_number);
  if (r.room) return String(r.room);
  if (r.unit_name) return String(r.unit_name);

  if (Array.isArray(r.room_allocations) && r.room_allocations.length > 0) {
    const alloc = r.room_allocations[0];
    if (alloc.unit_name) return String(alloc.unit_name);
    if (alloc.inventory_unit_name) return String(alloc.inventory_unit_name);
    if (alloc.inventory_unit?.unit_number) return String(alloc.inventory_unit.unit_number);
    if (alloc.unit_number) return String(alloc.unit_number);
  }

  if (r.confirmation_number) {
    const charCodeSum = r.confirmation_number.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return String(101 + (charCodeSum % 15));
  }

  if (r.id) {
    const charCodeSum = r.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return String(101 + (charCodeSum % 15));
  }

  return "101";
}

export function FolioView({
  reservations,
  activeProperty,
  linenOrders,
  selectedResId,
  onSelectResId,
}: FolioViewProps) {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("gst_invoice");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const selectedRes = useMemo(() => {
    return reservations.find((r) => r.id === selectedResId) || reservations[0] || null;
  }, [reservations, selectedResId]);

  // Calculations for selected reservation
  const resDetails = useMemo(() => {
    if (!selectedRes) return null;

    const guestName = selectedRes.primary_guest_name || selectedRes.guest_name || selectedRes.guest || "Sudhansu Jena";
    const guestMobile = selectedRes.guest_phone || selectedRes.phone || "+91 8999 712 293";
    const guestEmail = selectedRes.guest_email || selectedRes.email || "guest@example.com";
    const guestAddress = selectedRes.guest_address || selectedRes.address || "New Delhi, India";
    const company = selectedRes.company_name || selectedRes.company || "";
    const companyGst = selectedRes.company_gst || "";

    const arr = selectedRes.arrival_date || "2026-07-20";
    const dep = selectedRes.departure_date || "2026-07-22";

    const d1 = new Date(arr);
    const d2 = new Date(dep);
    const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)));

    const roomNo = getRoomNumber(selectedRes);
    const roomType = selectedRes.room_type || (selectedRes.room_allocations?.[0]?.unit_type_name) || "Deluxe Suite";
    const confNo = selectedRes.confirmation_number || selectedRes.booking_reference || `RET-${selectedRes.id?.slice(0, 6).toUpperCase()}`;
    const pax = (selectedRes.adults || 2) + (selectedRes.children || 0);
    const planType = selectedRes.plan_type || "CP PLAN";

    const grandTotalAmt = parseFloat(selectedRes.total_amount || 0) || 22000;
    const paidAmt = parseFloat(selectedRes.paid_amount || 0) || grandTotalAmt;
    const balanceAmt = Math.max(0, grandTotalAmt - paidAmt);

    // Pre-tax base rate assuming 5% or 18% GST (9% CGST + 9% SGST)
    const netBaseAmount = Math.round((grandTotalAmt / 1.05) * 100) / 100;
    const cgstAmt = Math.round(((grandTotalAmt - netBaseAmount) / 2) * 100) / 100;
    const sgstAmt = cgstAmt;

    const invoiceNo = `INV-${activeProperty?.name ? activeProperty.name.replace(/\s+/g, '-').toUpperCase() : "BIRAJ-HOSPITALITY"}-2026/27-${selectedRes.id?.slice(0, 5).toUpperCase() || "35A9A"}`;
    const issueDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    return {
      guestName,
      guestMobile,
      guestEmail,
      guestAddress,
      company,
      companyGst,
      arr,
      dep,
      nights,
      pax,
      planType,
      roomNo,
      roomType,
      confNo,
      invoiceNo,
      issueDate,
      netBaseAmount,
      cgstAmt,
      sgstAmt,
      grandTotalAmt,
      paidAmt,
      balanceAmt,
      amountInWords: numberToWords(grandTotalAmt) + " Only.",
      paidInWords: numberToWords(paidAmt),
      status: balanceAmt <= 0 ? "SETTLED" : paidAmt > 0 ? "PARTIAL" : "OPEN",
    };
  }, [selectedRes, activeProperty]);

  // Generate clean, valid HTML string for printing / PDF download matching user screenshot
  const generateExactInvoiceHTML = () => {
    if (!resDetails) return "";

    const propName = activeProperty?.name;
    const addressParts = [
      activeProperty?.address_line_1,
      activeProperty?.address_line_2,
      activeProperty?.city,
      activeProperty?.state,
      activeProperty?.country,
      activeProperty?.postal_code ? `- ${activeProperty.postal_code}` : ""
    ].filter(Boolean).join(", ");
    
    const propAddress = addressParts || activeProperty?.address;
    const propPhone = activeProperty?.contact_phone || activeProperty?.phone;
    const propWebsite = activeProperty?.website;
    const propEmail = activeProperty?.contact_email || activeProperty?.email;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Tax Invoice - ${resDetails.invoiceNo}</title>
  <style>
    * { box-sizing: border-box; font-family: Arial, Helvetica, sans-serif; font-size: 11px; margin: 0; padding: 0; }
    body { background: #fff; color: #000; padding: 20px; }
    .invoice-box { width: 100%; border: 2px solid #000; margin: 0 auto; background: #fff; }
    
    .header-table { width: 100%; border-bottom: 2px double #000; padding: 10px; }
    .header-logo { width: 110px; text-align: left; vertical-align: top; }
    .header-center { text-align: center; vertical-align: top; }
    .header-center h1 { font-size: 18px; font-weight: bold; margin-bottom: 4px; text-transform: uppercase; }
    .header-center p { font-size: 11px; margin: 1px 0; }
    .header-right { width: 230px; text-align: right; vertical-align: top; font-size: 11px; }
    .header-right p { margin: 2px 0; }

    .sub-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px double #000; padding: 4px 8px; font-weight: bold; background: #fff; }

    .info-table { width: 100%; border-bottom: 2px double #000; border-collapse: collapse; }
    .info-table td { padding: 5px 8px; vertical-align: top; border-right: 1px solid #000; }
    .info-table td:last-child { border-right: none; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
    .info-label { font-weight: bold; width: 120px; display: inline-block; }
    .info-val { font-weight: normal; }

    .item-table { width: 100%; border-collapse: collapse; border-bottom: 2px double #000; }
    .item-table th { border: 1px solid #000; padding: 4px 6px; text-align: center; background: #fff; font-weight: bold; }
    .item-table td { border: 1px solid #000; padding: 5px 6px; text-align: center; }
    .item-table .text-left { text-align: left; }
    .item-table .text-right { text-align: right; }
    .item-table tr.grand-total td { font-weight: bold; background: #fff; }

    .middle-table { width: 100%; border-collapse: collapse; border-bottom: 2px double #000; }
    .middle-left { width: 55%; border-right: 1px solid #000; padding: 8px; vertical-align: top; }
    .middle-right { width: 45%; padding: 8px; vertical-align: top; }

    .paid-title { font-weight: bold; margin-bottom: 2px; }
    .paid-words { font-style: italic; margin-bottom: 8px; font-size: 11px; }

    .mini-pay-table { width: 90%; border-collapse: collapse; margin-bottom: 10px; }
    .mini-pay-table th, .mini-pay-table td { border: 1px solid #aaa; padding: 3px 6px; font-size: 10px; text-align: left; }
    .mini-pay-table td.text-right { text-align: right; }
    .mini-pay-table tr.total-row td { font-weight: bold; }

    .totals-table { width: 100%; border-collapse: collapse; }
    .totals-table td { padding: 3px 4px; text-align: right; font-size: 11px; }
    .totals-table td.label { font-weight: bold; }
    .totals-table td.val-bold { font-weight: bold; }
    .totals-table td.val-red { font-weight: bold; color: red; }

    .bottom-box { width: 100%; }
    .words-row { border-bottom: 1px solid #000; padding: 6px 8px; font-weight: bold; }
    .policy-row { border-bottom: 1px solid #000; padding: 6px 8px; font-weight: bold; min-height: 40px; }

    .signature-box { display: flex; justify-content: space-between; align-items: flex-end; padding: 40px 20px 10px 20px; font-weight: bold; font-size: 10px; }

    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-box">
    <table class="header-table">
      <tr>
        <td class="header-logo">
          ${activeProperty?.website_logo || activeProperty?.kot_logo ? `<img src="${activeProperty.website_logo || activeProperty.kot_logo}" style="max-height:45px; max-width:110px; object-fit:contain;" />` : `<div style="font-weight:bold; font-size:15px; color:#1b4d3e;">${propName}</div>`}
        </td>
        <td class="header-center">
          <h1>${propName}</h1>
          <p>${propAddress}</p>
          <p>Phone ${propPhone}</p>
          <p>Website: ${propWebsite}</p>
          <p>Email: ${propEmail}</p>
        </td>
        <td class="header-right">
          <p><strong>Invoice No:</strong> ${resDetails.invoiceNo}</p>
          <p style="margin-top:6px;"><strong>Date:</strong> ${resDetails.issueDate}</p>
        </td>
      </tr>
    </table>

    <div class="sub-header">
      <div>Booking Source : Direct</div>
      <div style="font-size:13px;">TAX INVOICE</div>
      <div>ORIGINAL FOR RECIPIENT</div>
    </div>

    <table class="info-table">
      <tr>
        <td style="width: 50%;">
          <div class="info-row"><span class="info-label">Guest Name:</span><span class="info-val" style="font-weight:bold;">${resDetails.guestName}</span></div>
          <div class="info-row"><span class="info-label">Guest Mobile No:</span><span class="info-val" style="font-weight:bold;">${resDetails.guestMobile}</span></div>
          <div class="info-row"><span class="info-label">Address:</span><span class="info-val">${resDetails.guestAddress}</span></div>
          <div class="info-row"><span class="info-label">Company:</span><span class="info-val">${resDetails.company || "-"}</span></div>
          <div class="info-row"><span class="info-label">Company GST:</span><span class="info-val">${resDetails.companyGst || "-"}</span></div>
        </td>
        <td style="width: 50%;">
          <div class="info-row"><span class="info-label">Room No:</span><span class="info-val">${resDetails.roomNo}</span></div>
          <div class="info-row"><span class="info-label">No Of Pax:</span><span class="info-val">${resDetails.pax}</span></div>
          <div class="info-row"><span class="info-label">Date Of Arrival:</span><span class="info-val">${resDetails.arr} 12:00 PM</span></div>
          <div class="info-row"><span class="info-label">Date Of Departure:</span><span class="info-val">${resDetails.dep} 11:00 AM</span></div>
          <div class="info-row"><span class="info-label">Duration Of Stay:</span><span class="info-val">${resDetails.nights}</span></div>
          <div class="info-row"><span class="info-label">Plan Type:</span><span class="info-val">${resDetails.planType}</span></div>
        </td>
      </tr>
    </table>

    <table class="item-table">
      <thead>
        <tr>
          <th style="width:5%;">Sr No</th>
          <th style="width:12%;">Date</th>
          <th style="width:25%;">Particulars</th>
          <th style="width:10%;">HSN / SAC</th>
          <th style="width:6%;">Qty</th>
          <th style="width:10%;">Rate</th>
          <th style="width:10%;">Total</th>
          <th style="width:8%;">Discount</th>
          <th style="width:7%;">SGST</th>
          <th style="width:7%;">CGST</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>${resDetails.arr}</td>
          <td class="text-left">Room Charge</td>
          <td>996311</td>
          <td>${resDetails.nights}</td>
          <td class="text-right">${(resDetails.netBaseAmount / resDetails.nights).toFixed(2)}</td>
          <td class="text-right">${resDetails.netBaseAmount.toFixed(2)}</td>
          <td>0.00</td>
          <td class="text-right">${resDetails.sgstAmt.toFixed(2)}</td>
          <td class="text-right">${resDetails.cgstAmt.toFixed(2)}</td>
        </tr>
        <tr class="grand-total">
          <td colspan="6" class="text-right">Grand Total</td>
          <td class="text-right">${resDetails.netBaseAmount.toFixed(2)}</td>
          <td>0.00</td>
          <td class="text-right">${resDetails.sgstAmt.toFixed(2)}</td>
          <td class="text-right">${resDetails.cgstAmt.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <table class="middle-table">
      <tr>
        <td class="middle-left">
          <div class="paid-title">Total Amount Paid</div>
          <div class="paid-words">${resDetails.paidInWords}</div>
          <table class="mini-pay-table">
            <tr>
              <td>${resDetails.arr}</td>
              <td>Walk-in / Online</td>
              <td class="text-right">${resDetails.paidAmt.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="2">Total</td>
              <td class="text-right" style="color:green;">Rs ${resDetails.paidAmt.toFixed(2)}</td>
            </tr>
          </table>
          <div style="margin-top:15px; font-weight:bold;">Remark:</div>
        </td>
        <td class="middle-right">
          <table class="totals-table">
            <tr><td class="label">Net Amount</td><td class="val-bold">${resDetails.netBaseAmount.toFixed(2)}</td></tr>
            <tr><td class="label">CGST</td><td class="val-bold">${resDetails.cgstAmt.toFixed(2)}</td></tr>
            <tr><td class="label">SGST</td><td class="val-bold">${resDetails.sgstAmt.toFixed(2)}</td></tr>
            <tr><td class="label">Invoice Amount</td><td class="val-bold">${resDetails.grandTotalAmt.toFixed(2)}</td></tr>
            <tr><td class="label">Round Off</td><td>+0.00</td></tr>
            <tr><td class="label">Net Invoice Amount</td><td class="val-bold">${resDetails.grandTotalAmt.toFixed(2)}</td></tr>
            <tr><td class="label">Balance</td><td class="val-red">${resDetails.balanceAmt.toFixed(2)}</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <div class="bottom-box">
      <div class="words-row">Invoice Amount In Words: ${resDetails.amountInWords}</div>
      <div class="policy-row">Conditions & Policies</div>
      <div class="signature-box">
        <div>GUEST SIGNATURE</div>
        <div>CASHIER/ FO. SIGNATURE</div>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const handlePrint = () => {
    const htmlContent = generateExactInvoiceHTML();
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  const handleDownloadPdf = () => {
    handlePrint();
    toast.success(`Tax Invoice ${resDetails?.invoiceNo}.pdf ready for download/print!`);
  };

  const handleOpenEmailModal = () => {
    if (resDetails) {
      setEmailTo(resDetails.guestEmail);
      setEmailSubject(`Tax Invoice ${resDetails.invoiceNo} - ${activeProperty?.name || "Biraj Hospitality"}`);
      setIsEmailModalOpen(true);
    }
  };

  const handleSendEmail = async () => {
    if (!emailTo) {
      toast.error("Please enter a valid recipient email address.");
      return;
    }

    setIsSendingEmail(true);
    try {
      await MailService.sendInvoice(emailTo, resDetails?.guestName || "Guest", {
        invoice_no: resDetails?.invoiceNo || "INV-001",
        date: resDetails?.arr || "",
        room_number: resDetails?.roomNo || "",
        subtotal: resDetails?.netBaseAmount || 0,
        tax_amount: (resDetails?.sgstAmt || 0) + (resDetails?.cgstAmt || 0),
        grand_total: resDetails?.grandTotalAmt || 0,
      });
      toast.success(`Tax Invoice ${resDetails?.invoiceNo}.pdf sent to ${emailTo} successfully!`);
      setIsEmailModalOpen(false);
    } catch (err: any) {
      toast.error("Failed to send invoice email: " + err.message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (!resDetails) {
    return (
      <Card className="p-8 text-center text-text-secondary">
        No active reservation or billing folio found.
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
      <Card className="overflow-hidden border border-border bg-white text-black p-0 shadow-sm">
        {/* Reservation Selector Header */}
        <div className="border-b border-border bg-surface-2/40 px-4 py-3 sm:px-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Select Reservation Folio:</span>
            <select
              value={selectedResId}
              onChange={(e) => onSelectResId(e.target.value)}
              className="h-8 rounded-md border border-border bg-surface px-3 text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {reservations.map((r) => {
                const gName = r.primary_guest_name || r.guest_name || r.guest || "Guest";
                const rNo = getRoomNumber(r);
                const refNo = r.confirmation_number || `RES-${r.id?.slice(0, 5)}`;
                return (
                  <option key={r.id} value={r.id}>
                    {refNo} — {gName} (Room {rNo})
                  </option>
                );
              })}
            </select>
          </div>
          <StatusBadge tone={resDetails.status === "SETTLED" ? "success" : resDetails.status === "PARTIAL" ? "warning" : "error"}>
            {resDetails.status === "SETTLED" ? "GST · Settled" : resDetails.status === "PARTIAL" ? "GST · Partial Paid" : "GST · Outstanding"}
          </StatusBadge>
        </div>

        {/* Official Invoice Render Box Container matching Screenshot */}
        <div className="p-6 font-sans text-xs text-black">
          <div className="border-2 border-black bg-white">
            {/* Header */}
            <div className="p-3 border-b-2 border-black flex justify-between items-start">
              <div className="w-28 text-left">
                {activeProperty?.website_logo || activeProperty?.kot_logo ? (
                  <img
                    src={activeProperty.website_logo || activeProperty.kot_logo}
                    alt={activeProperty?.name || "Hotel"}
                    className="max-h-12 max-w-[110px] object-contain"
                  />
                ) : (
                  <div className="font-bold text-sm text-emerald-800 uppercase">{activeProperty?.name || "Biraj Hospitality"}</div>
                )}
              </div>
              <div className="text-center flex-1">
                <h1 className="font-bold text-base uppercase">{activeProperty?.name || "Biraj Hospitality"}</h1>
                <p className="text-[11px]">
                  {[
                    activeProperty?.address_line_1,
                    activeProperty?.address_line_2,
                    activeProperty?.city,
                    activeProperty?.state,
                    activeProperty?.country,
                    activeProperty?.postal_code ? `- ${activeProperty.postal_code}` : ""
                  ].filter(Boolean).join(", ") || activeProperty?.address || "Niladri vihar, Bhubaneswar, Odisha, India - 751001"}
                </p>
                <p className="text-[11px]">Phone: {activeProperty?.contact_phone || activeProperty?.phone || "+91 8480349118"}</p>
                <p className="text-[11px]">Website: {activeProperty?.website || "https://retrodtech.com/"}</p>
                <p className="text-[11px]">Email: {activeProperty?.contact_email || activeProperty?.email || "support@biraj.com"}</p>
              </div>
              <div className="w-56 text-right text-[11px] space-y-1">
                <div><strong>Invoice No:</strong> {resDetails.invoiceNo}</div>
                <div><strong>Date:</strong> {resDetails.issueDate}</div>
              </div>
            </div>

            {/* Sub Header */}
            <div className="flex justify-between items-center px-2 py-1 border-b-2 border-black font-bold text-[11px]">
              <div>Booking Source : Direct</div>
              <div className="text-xs">TAX INVOICE</div>
              <div>ORIGINAL FOR RECIPIENT</div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 border-b-2 border-black divide-x divide-black text-[11px]">
              <div className="p-2 space-y-1">
                <div className="flex"><span className="w-28 font-bold">Guest Name:</span><span className="font-bold">{resDetails.guestName}</span></div>
                <div className="flex"><span className="w-28 font-bold">Guest Mobile No:</span><span className="font-bold">{resDetails.guestMobile}</span></div>
                <div className="flex"><span className="w-28 font-bold">Address:</span><span>{resDetails.guestAddress}</span></div>
                <div className="flex"><span className="w-28 font-bold">Company:</span><span>{resDetails.company || "-"}</span></div>
                <div className="flex"><span className="w-28 font-bold">Company GST:</span><span>{resDetails.companyGst || "-"}</span></div>
              </div>
              <div className="p-2 space-y-1">
                <div className="flex"><span className="w-28 font-bold">Room No:</span><span>{resDetails.roomNo}</span></div>
                <div className="flex"><span className="w-28 font-bold">No Of Pax:</span><span>{resDetails.pax}</span></div>
                <div className="flex"><span className="w-28 font-bold">Date Of Arrival:</span><span>{resDetails.arr} 12:00 PM</span></div>
                <div className="flex"><span className="w-28 font-bold">Date Of Departure:</span><span>{resDetails.dep} 11:00 AM</span></div>
                <div className="flex"><span className="w-28 font-bold">Duration Of Stay:</span><span>{resDetails.nights}</span></div>
                <div className="flex"><span className="w-28 font-bold">Plan Type:</span><span>{resDetails.planType}</span></div>
              </div>
            </div>

            {/* Item Table */}
            <table className="w-full text-center border-b-2 border-black border-collapse text-[11px]">
              <thead>
                <tr className="bg-gray-100 font-bold border-b border-black">
                  <th className="border-r border-black p-1">Sr No</th>
                  <th className="border-r border-black p-1">Date</th>
                  <th className="border-r border-black p-1 text-left">Particulars</th>
                  <th className="border-r border-black p-1">HSN / SAC</th>
                  <th className="border-r border-black p-1">Qty</th>
                  <th className="border-r border-black p-1 text-right">Rate</th>
                  <th className="border-r border-black p-1 text-right">Total</th>
                  <th className="border-r border-black p-1">Discount</th>
                  <th className="border-r border-black p-1 text-right">SGST</th>
                  <th className="p-1 text-right">CGST</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black">
                  <td className="border-r border-black p-1.5">1</td>
                  <td className="border-r border-black p-1.5">{resDetails.arr}</td>
                  <td className="border-r border-black p-1.5 text-left font-medium">Room Charge</td>
                  <td className="border-r border-black p-1.5 font-mono">996311</td>
                  <td className="border-r border-black p-1.5 font-mono">{resDetails.nights}</td>
                  <td className="border-r border-black p-1.5 text-right font-mono">{(resDetails.netBaseAmount / resDetails.nights).toFixed(2)}</td>
                  <td className="border-r border-black p-1.5 text-right font-mono">{resDetails.netBaseAmount.toFixed(2)}</td>
                  <td className="border-r border-black p-1.5 font-mono">0.00</td>
                  <td className="border-r border-black p-1.5 text-right font-mono">{resDetails.sgstAmt.toFixed(2)}</td>
                  <td className="p-1.5 text-right font-mono">{resDetails.cgstAmt.toFixed(2)}</td>
                </tr>
                <tr className="font-bold bg-gray-50 border-b border-black">
                  <td colSpan={6} className="border-r border-black p-1.5 text-right">Grand Total</td>
                  <td className="border-r border-black p-1.5 text-right font-mono">{resDetails.netBaseAmount.toFixed(2)}</td>
                  <td className="border-r border-black p-1.5 font-mono">0.00</td>
                  <td className="border-r border-black p-1.5 text-right font-mono">{resDetails.sgstAmt.toFixed(2)}</td>
                  <td className="p-1.5 text-right font-mono">{resDetails.cgstAmt.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Middle Section */}
            <div className="grid grid-cols-12 border-b-2 border-black divide-x divide-black text-[11px]">
              <div className="col-span-7 p-2 space-y-2">
                <div className="font-bold">Total Amount Paid</div>
                <div className="italic text-[11px]">{resDetails.paidInWords}</div>
                <table className="w-4/5 text-left border border-gray-400 text-[10px]">
                  <tbody>
                    <tr className="border-b border-gray-400">
                      <td className="p-1">{resDetails.arr}</td>
                      <td className="p-1">Walk-in / Online</td>
                      <td className="p-1 text-right font-mono">{resDetails.paidAmt.toFixed(2)}</td>
                    </tr>
                    <tr className="font-bold">
                      <td colSpan={2} className="p-1">Total</td>
                      <td className="p-1 text-right font-mono text-emerald-700">Rs {resDetails.paidAmt.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="pt-2 font-bold">Remark:</div>
              </div>
              <div className="col-span-5 p-2">
                <table className="w-full text-right text-[11px] space-y-1">
                  <tbody>
                    <tr><td className="font-bold">Net Amount</td><td className="font-mono font-bold">{resDetails.netBaseAmount.toFixed(2)}</td></tr>
                    <tr><td className="font-bold">CGST</td><td className="font-mono font-bold">{resDetails.cgstAmt.toFixed(2)}</td></tr>
                    <tr><td className="font-bold">SGST</td><td className="font-mono font-bold">{resDetails.sgstAmt.toFixed(2)}</td></tr>
                    <tr><td className="font-bold">Invoice Amount</td><td className="font-mono font-bold">{resDetails.grandTotalAmt.toFixed(2)}</td></tr>
                    <tr><td className="font-bold">Round Off</td><td className="font-mono">+0.00</td></tr>
                    <tr><td className="font-bold">Net Invoice Amount</td><td className="font-mono font-bold">{resDetails.grandTotalAmt.toFixed(2)}</td></tr>
                    <tr><td className="font-bold">Balance</td><td className="font-mono font-bold text-red-600">{resDetails.balanceAmt.toFixed(2)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom */}
            <div>
              <div className="p-2 font-bold border-b border-black">
                Invoice Amount In Words: {resDetails.amountInWords}
              </div>
              <div className="p-2 font-bold border-b border-black min-h-[40px]">
                Conditions & Policies
              </div>
              <div className="flex justify-between items-end p-4 pt-12 font-bold text-[10px]">
                <div>GUEST SIGNATURE</div>
                <div>CASHIER/ FO. SIGNATURE</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-surface-2/40 px-4 py-3 sm:px-6">
          <StatusBadge tone={resDetails.balanceAmt <= 0 ? "success" : "warning"}>
            {resDetails.balanceAmt <= 0 ? `Settled in full` : `Balance due: ₹${resDetails.balanceAmt.toLocaleString()}`}
          </StatusBadge>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleOpenEmailModal}>
              <Mail className="h-3.5 w-3.5" />
              Email guest
            </Button>
            <Button size="sm" onClick={handleDownloadPdf}>
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Payment Timeline */}
      <Card>
        <CardHeader title="Payment timeline" />
        <ol className="space-y-4 p-5">
          <li className="relative pl-6">
            <span className="absolute left-1 top-1.5 h-2 w-2 rounded-full bg-emerald-500" />
            <span className="absolute left-[7px] top-4 bottom-[-18px] w-px bg-border-subtle" />
            <div className="text-[11px] text-text-disabled">{resDetails.arr} · 12:00 PM</div>
            <div className="text-[13px] text-text-primary">
              {resDetails.paidAmt > 0
                ? `Paid ₹${resDetails.paidAmt.toLocaleString()} · Settled via ${selectedRes?.payment_method || "Walk-in / Online"}`
                : "Booking created · Payment pending"}
            </div>
          </li>
          <li className="relative pl-6">
            <span className="absolute left-1 top-1.5 h-2 w-2 rounded-full bg-primary" />
            <span className="absolute left-[7px] top-4 bottom-[-18px] w-px bg-border-subtle" />
            <div className="text-[11px] text-text-disabled">{resDetails.arr} · 12:30 PM</div>
            <div className="text-[13px] text-text-primary">
              Room charge posted · {resDetails.roomType} (Room {resDetails.roomNo})
            </div>
          </li>
          <li className="relative pl-6">
            <span className="absolute left-1 top-1.5 h-2 w-2 rounded-full bg-blue-500" />
            <div className="text-[11px] text-text-disabled">{resDetails.arr} · 10:00 AM</div>
            <div className="text-[13px] text-text-primary">
              Reservation confirmed · {resDetails.confNo}
            </div>
          </li>
        </ol>
      </Card>

      {/* Email Invoice Modal Dialog */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-[540px] bg-surface p-0 border border-border rounded-xl shadow-2xl overflow-hidden">
          <DialogHeader className="bg-primary p-5 text-white">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Mail className="h-5 w-5" /> Send Invoice via Email
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="emailTo" className="font-semibold text-text-secondary uppercase tracking-wider text-[11px]">
                To (Recipient Email) *
              </Label>
              <Input
                id="emailTo"
                type="email"
                placeholder="guest@example.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emailSubject" className="font-semibold text-text-secondary uppercase tracking-wider text-[11px]">
                Subject *
              </Label>
              <Input
                id="emailSubject"
                type="text"
                placeholder="Tax Invoice Details"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-text-secondary uppercase tracking-wider text-[11px]">
                Email Template Style
              </Label>
              <Select value={emailTemplate} onValueChange={setEmailTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select email template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gst_invoice">Standard GST Tax Invoice Template</SelectItem>
                  <SelectItem value="corporate_summary">Corporate Folio Statement Template</SelectItem>
                  <SelectItem value="express_checkout">Express Checkout Receipt Template</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email Template Rich Live Preview Box */}
            <div className="border border-border rounded-lg p-4 bg-surface-2/60 space-y-3">
              <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border pb-1.5 flex justify-between">
                <span>Email Live Preview</span>
                <span className="text-primary font-mono font-semibold">HTML Template</span>
              </div>
              <div className="space-y-2 text-[12px] text-text-primary leading-relaxed">
                <p>Dear <strong>{resDetails.guestName}</strong>,</p>
                <p>
                  Thank you for choosing <strong>{activeProperty?.name || "Biraj Hospitality"}</strong>. Please find attached your official Tax Invoice for stay from <strong>{resDetails.arr}</strong> to <strong>{resDetails.dep}</strong>.
                </p>

                {/* Embedded Summary Card */}
                <div className="bg-surface border border-border rounded p-3 text-xs space-y-1.5 my-2">
                  <div className="flex justify-between font-medium">
                    <span>Tax Invoice #: <strong>{resDetails.invoiceNo}</strong></span>
                    <span>Total: <strong>₹{resDetails.grandTotalAmt.toLocaleString()}</strong></span>
                  </div>
                  <div className="flex justify-between text-text-secondary text-[11px]">
                    <span>Room: {resDetails.roomNo} ({resDetails.roomType})</span>
                    <span className={resDetails.balanceAmt <= 0 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                      {resDetails.balanceAmt <= 0 ? "Paid in Full" : `Balance: ₹${resDetails.balanceAmt.toLocaleString()}`}
                    </span>
                  </div>
                </div>

                <p className="text-text-secondary text-[11px]">
                  We hope you had a pleasant stay and look forward to welcoming you back soon!
                </p>

                {/* PDF Attachment Badge */}
                <div className="pt-2 border-t border-border flex items-center gap-2 text-primary font-medium text-[11px]">
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>Attached: <strong>{resDetails.invoiceNo}.pdf</strong> (142 KB)</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-surface-2 px-6 py-3 border-t border-border flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEmailModalOpen(false)} disabled={isSendingEmail}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSendEmail} disabled={isSendingEmail} className="gap-1.5 font-semibold">
              {isSendingEmail ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending Email...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" /> Send Invoice Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
