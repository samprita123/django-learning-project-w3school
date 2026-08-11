import { Printer, Download, Mail, Copy } from "lucide-react";
import { Button } from "@/components/ui/Primitives";

export function InvoiceTemplate({ orderId }: { orderId?: string }) {
  const invoiceData = {
    businessName: "Retrod Restaurant & Bar",
    address: "42, Park Street, Kolkata, WB - 700016",
    gstin: "22AAAAA0000A1Z5",
    invoiceNo: "INV-2023-0891",
    date: "27-Jun-2026",
    time: "14:30",
    customer: "Rahul Sharma",
    phone: "+91 9876543210",
    cashier: "Staff User",
    items: [
      { name: "Butter Chicken", qty: 2, price: 450, total: 900 },
      { name: "Garlic Naan", qty: 4, price: 60, total: 240 },
    ],
    subtotal: 1140,
    cgst: 28.5,
    sgst: 28.5,
    total: 1197,
    paymentMode: "UPI",
  };

  return (
    <div className="bg-surface shadow-e2 rounded-lg border border-border p-6 sm:p-8 max-w-[400px] mx-auto font-mono text-[12px] text-text-primary">
      <div className="text-center space-y-1 mb-6 border-b border-border border-dashed pb-4">
        <h1 className="text-[16px] font-bold uppercase">{invoiceData.businessName}</h1>
        <p className="text-text-secondary">{invoiceData.address}</p>
        <p className="text-text-secondary">GSTIN: {invoiceData.gstin}</p>
      </div>

      <div className="space-y-1 mb-6">
        <div className="flex justify-between"><span>Inv No:</span> <span>{invoiceData.invoiceNo}</span></div>
        <div className="flex justify-between"><span>Date:</span> <span>{invoiceData.date} {invoiceData.time}</span></div>
        <div className="flex justify-between"><span>Cashier:</span> <span>{invoiceData.cashier}</span></div>
        <div className="flex justify-between mt-2 pt-2 border-t border-border border-dashed">
          <span>Customer:</span> <span>{invoiceData.customer}</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between border-b border-border border-dashed pb-2 mb-2 font-bold uppercase">
          <span className="flex-1">Item</span>
          <span className="w-12 text-center">Qty</span>
          <span className="w-16 text-right">Amount</span>
        </div>
        {invoiceData.items.map((item, idx) => (
          <div key={idx} className="flex justify-between mb-1.5">
            <span className="flex-1 truncate pr-2">{item.name}</span>
            <span className="w-12 text-center">{item.qty}</span>
            <span className="w-16 text-right">{item.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 border-t border-border border-dashed pt-4 mb-6">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{invoiceData.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>CGST (2.5%)</span>
          <span>{invoiceData.cgst.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>SGST (2.5%)</span>
          <span>{invoiceData.sgst.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[16px] font-bold mt-2 pt-2 border-t border-border border-dashed">
          <span>Grand Total</span>
          <span>₹{invoiceData.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="text-center space-y-1 mb-6">
        <p>Payment Mode: <span className="font-bold">{invoiceData.paymentMode}</span></p>
      </div>

      <div className="text-center text-text-secondary border-t border-border border-dashed pt-4">
        <p>Thank you for your visit!</p>
        <p className="mt-1">Have a great day.</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-2 hide-on-print">
        <Button variant="primary" className="col-span-2">
          <Printer className="h-4 w-4 mr-2" /> Print Receipt
        </Button>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" /> PDF</Button>
        <Button variant="outline"><Mail className="h-4 w-4 mr-2" /> Email</Button>
      </div>
    </div>
  );
}
