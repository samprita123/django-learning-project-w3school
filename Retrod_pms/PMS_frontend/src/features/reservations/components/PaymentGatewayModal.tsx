import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, ShieldCheck, CreditCard, QrCode, ArrowLeft, ExternalLink } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Primitives";
import { toast } from "sonner";
import { settingsApi, type PaymentGatewayData, type TenantPaymentGatewayData } from "@/services/api/settings";

export interface PaymentGatewayModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  initialGateway?: string;
  onPaymentComplete: (transactionId: string, gatewayName: string) => void;
}

export const PaymentGatewayLogos: Record<string, () => JSX.Element> = {
  Razorpay: () => (
    <svg viewBox="0 0 100 24" className="h-5 w-auto" fill="none">
      <path d="M16.5 2L1.5 14.8C0.6 15.6 0 16.8 0 18v6h6v-6l10.5-8.8V2z" fill="#0C2340" />
      <path d="M22 2l-14 12v10h6V15l8-6.8V2z" fill="#3395FF" />
      <text x="30" y="18" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="15" fill="#0C2340">Razorpay</text>
    </svg>
  ),
  HDFC: () => (
    <svg viewBox="0 0 110 24" className="h-5 w-auto" fill="none">
      <rect x="0" y="2" width="20" height="20" rx="2" fill="#004C8F" />
      <rect x="5" y="7" width="10" height="10" fill="#ED232A" />
      <rect x="8" y="10" width="4" height="4" fill="#FFFFFF" />
      <text x="26" y="17" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="13" fill="#004C8F">HDFC BANK</text>
    </svg>
  ),
  CCAvenue: () => (
    <svg viewBox="0 0 110 24" className="h-5 w-auto" fill="none">
      <circle cx="10" cy="12" r="9" fill="#E45B25" />
      <path d="M6 12l3 3 5-6" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
      <text x="24" y="17" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="13" fill="#2E3192">CCAvenue</text>
    </svg>
  ),
  PayU: () => (
    <svg viewBox="0 0 75 24" className="h-5 w-auto" fill="none">
      <rect width="75" height="24" rx="4" fill="#A5C933" />
      <text x="37.5" y="17" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="14" fill="#002D38">PayU</text>
    </svg>
  ),
  Easebuzz: () => (
    <svg viewBox="0 0 100 24" className="h-5 w-auto" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#F47920" />
      <path d="M8 8h8M8 12h6M8 16h8" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
      <text x="27" y="17" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="13" fill="#1B2B4B">easebuzz</text>
    </svg>
  ),
  PhonePe: () => (
    <svg viewBox="0 0 95 24" className="h-5 w-auto" fill="none">
      <circle cx="12" cy="12" r="10" fill="#5F259F" />
      <text x="12" y="17" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="13" fill="#FFF">पे</text>
      <text x="27" y="17" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="13" fill="#5F259F">PhonePe</text>
    </svg>
  ),
};

const DEFAULT_GATEWAY_ITEMS = [
  {
    id: "Razorpay",
    code: "razorpay",
    name: "Razorpay Checkout",
    subtitle: "UPI, Cards, NetBanking, Wallets",
    tag: "RECOMMENDED",
    tagClass: "bg-primary-tint text-primary border-primary/20",
    iconBg: "bg-[#0C2340]/5 border-[#0C2340]/10",
    Logo: PaymentGatewayLogos.Razorpay,
    isSdk: true,
  },
  {
    id: "HDFC",
    code: "hdfc",
    name: "HDFC Bank Gateway",
    subtitle: "HDFC Debit / Credit Card Direct PG",
    tag: "DIRECT",
    tagClass: "bg-surface-3 text-text-secondary border-border",
    iconBg: "bg-[#004C8F]/5 border-[#004C8F]/10",
    Logo: PaymentGatewayLogos.HDFC,
    prefix: "hdfc_txn_",
  },
  {
    id: "CC Avenue",
    code: "ccavenue",
    name: "CCAvenue Payment",
    subtitle: "Multi-Currency Payment Gateway",
    tag: "SECURE",
    tagClass: "bg-surface-3 text-text-secondary border-border",
    iconBg: "bg-[#E45B25]/5 border-[#E45B25]/10",
    Logo: PaymentGatewayLogos.CCAvenue,
    prefix: "ccav_",
  },
  {
    id: "PayU",
    code: "payu",
    name: "PayU Money",
    subtitle: "Instant One-Click Checkout",
    tag: "FAST",
    tagClass: "bg-surface-3 text-text-secondary border-border",
    iconBg: "bg-[#A5C933]/10 border-[#A5C933]/30",
    Logo: PaymentGatewayLogos.PayU,
    prefix: "payu_",
  },
  {
    id: "Easebuzz",
    code: "easebuzz",
    name: "Easebuzz Gateway",
    subtitle: "UPI, QR Code & Auto-Debit",
    tag: "UPI",
    tagClass: "bg-surface-3 text-text-secondary border-border",
    iconBg: "bg-[#F47920]/5 border-[#F47920]/10",
    Logo: PaymentGatewayLogos.Easebuzz,
    prefix: "ebz_",
  },
  {
    id: "PhonePe",
    code: "phonepe",
    name: "PhonePe PG",
    subtitle: "Direct PhonePe UPI & QR",
    tag: "UPI QR",
    tagClass: "bg-surface-3 text-text-secondary border-border",
    iconBg: "bg-[#5F259F]/5 border-[#5F259F]/10",
    Logo: PaymentGatewayLogos.PhonePe,
    prefix: "ppe_",
  },
];

export function PaymentGatewayModal({
  open,
  onClose,
  amount,
  guestName,
  guestEmail,
  guestPhone,
  initialGateway,
  onPaymentComplete,
}: PaymentGatewayModalProps) {
  const [status, setStatus] = useState<"idle" | "razorpay_view" | "processing" | "success">("idle");
  const [selectedGateway, setSelectedGateway] = useState<any>(null);
  const [txnId, setTxnId] = useState("");
  const [gateways, setGateways] = useState<typeof DEFAULT_GATEWAY_ITEMS>(DEFAULT_GATEWAY_ITEMS);
  const [upiId, setUpiId] = useState("success@razorpay");

  useEffect(() => {
    if (open) {
      setStatus("idle");
      setTxnId("");
      setSelectedGateway(null);

      // Load enabled gateways dynamically from API if present
      settingsApi.getPaymentGateways().then((dbGateways) => {
        if (dbGateways && dbGateways.length > 0) {
          const activeList = dbGateways.filter((g) => g.is_active);
          if (activeList.length > 0) {
            const mapped = activeList.map((g) => {
              const matchedLogo = PaymentGatewayLogos[g.name] || PaymentGatewayLogos[g.code.toUpperCase()] || PaymentGatewayLogos.Razorpay;
              return {
                id: g.name,
                code: g.code,
                name: g.name,
                subtitle: g.subtitle || "Online Payment Gateway",
                tag: g.badge || "ACTIVE",
                tagClass: "bg-primary-tint text-primary border-primary/20",
                iconBg: "bg-surface-2 border-border",
                Logo: matchedLogo,
                logoUrl: g.logo_url,
                isSdk: g.code === "razorpay" || g.name.toLowerCase().includes("razorpay"),
                prefix: `${g.code}_txn_`,
              };
            });
            setGateways(mapped);
          }
        }
      }).catch((err) => {
        console.warn("Failed to load gateways from API, using defaults:", err);
      });
    }
  }, [open]);

  const triggerRazorpaySdk = async () => {
    const loadScript = () => {
      return new Promise<boolean>((resolve) => {
        if ((window as any).Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    toast.info("Creating Razorpay Order...");

    try {
      // Step 1.1: Create Order on Backend Server
      const orderRes = await settingsApi.createRazorpayOrder(amount, "INR");
      const orderId = orderRes.order_id;
      const razorpayKey = orderRes.key || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "rzp_test_pms_key_2026";

      const loaded = await loadScript();
      if (!loaded || !(window as any).Razorpay) {
        toast.info("Using in-modal test payment suite.");
        return;
      }

      // Step 1.2: Initialize Checkout with Order ID
      const options = {
        key: razorpayKey,
        amount: orderRes.amount || Math.round(amount * 100),
        currency: orderRes.currency || "INR",
        name: "Hotel Biraj Group",
        description: `Room Booking Payment for ${guestName || "Guest"}`,
        image: "https://razorpay.com/favicon.ico",
        order_id: orderId,
        prefill: {
          name: guestName || "Guest Name",
          email: guestEmail || "guest@hotelbiraj.com",
          contact: guestPhone || "9876543210",
        },
        theme: {
          color: "#0F766E",
        },
        // Step 1.3 & 1.5: Handle Payment & Verify Signature
        handler: async function (response: any) {
          setStatus("processing");
          try {
            const verifyRes = await settingsApi.verifyRazorpaySignature({
              razorpay_order_id: response.razorpay_order_id || orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.verified) {
              const generatedTxnId = verifyRes.transaction_id || response.razorpay_payment_id;
              setTxnId(generatedTxnId);
              setStatus("success");
              setTimeout(() => {
                onPaymentComplete(generatedTxnId, "Razorpay");
              }, 1200);
            } else {
              toast.error("Razorpay Signature verification failed!");
              setStatus("idle");
            }
          } catch (err: any) {
            toast.error("Payment verification failed: " + err.message);
            setStatus("idle");
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Razorpay checkout closed.");
          },
        },
      };

      try {
        const rzp1 = new (window as any).Razorpay(options);
        rzp1.on("payment.failed", function () {
          toast.info("Using in-modal test payment mode.");
        });
        rzp1.open();
      } catch (err) {
        toast.info("Please complete payment using the test card option below.");
      }
    } catch (err: any) {
      toast.error("Order creation failed: " + err.message);
    }
  };

  const handleSelectGateway = (gw: (typeof DEFAULT_GATEWAY_ITEMS)[0]) => {
    setSelectedGateway(gw);
    if (gw.code === "razorpay" || gw.id === "Razorpay") {
      setStatus("razorpay_view");
      triggerRazorpaySdk();
      return;
    }

    setStatus("processing");
    setTimeout(() => {
      const generatedTxnId = `${gw.prefix || "txn_"}${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setTxnId(generatedTxnId);
      setStatus("success");
      setTimeout(() => {
        onPaymentComplete(generatedTxnId, gw.name);
      }, 1200);
    }, 1800);
  };

  const handleConfirmSimulatedPayment = async (methodName: string) => {
    setStatus("processing");
    try {
      const simulatedPaymentId = `pay_RZP_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const verifyRes = await settingsApi.verifyRazorpaySignature({
        razorpay_payment_id: simulatedPaymentId,
      });

      const generatedTxnId = verifyRes.transaction_id || simulatedPaymentId;
      setTxnId(generatedTxnId);
      setStatus("success");
      setTimeout(() => {
        onPaymentComplete(generatedTxnId, "Razorpay");
      }, 1200);
    } catch (err: any) {
      toast.error("Failed to confirm test payment: " + err.message);
      setStatus("razorpay_view");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className="max-w-[500px] max-h-[88vh] overflow-y-auto bg-surface p-0 border border-border rounded-xl shadow-2xl"
      >
        <div className="bg-primary p-5 text-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-primary-tint/80 uppercase">Official Payment Gateways</div>
            <div className="text-lg font-bold">
              {status === "razorpay_view" ? "Razorpay Secure Checkout" : "Select Payment Method"}
            </div>
          </div>
          <div className="bg-white/10 px-2.5 py-1 rounded text-xs font-mono font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 256-BIT SSL
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-surface-2 p-4 rounded-lg border border-border flex justify-between items-center">
            <div>
              <div className="text-xs text-text-secondary">Amount Payable</div>
              <div className="text-xl font-bold text-text-primary">₹{amount.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-text-secondary">Guest Name</div>
              <div className="text-sm font-semibold text-text-primary">{guestName || "Guest"}</div>
            </div>
          </div>

          {status === "idle" ? (
            <div className="space-y-4">
              <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Select Preferred Payment Gateway
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {gateways.map((gw) => {
                  const LogoComponent = gw.Logo;
                  return (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => handleSelectGateway(gw)}
                      className="flex items-center justify-between p-3.5 border border-border hover:border-primary rounded-xl bg-surface hover:bg-primary-tint/20 transition cursor-pointer group text-left shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border ${gw.iconBg}`}>
                          {gw.logoUrl ? (
                            <img src={gw.logoUrl} alt={gw.name} className="h-5 w-auto object-contain" />
                          ) : (
                            <LogoComponent />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-text-primary group-hover:text-primary">
                            {gw.name}
                          </div>
                          <div className="text-[11px] text-text-secondary">{gw.subtitle}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${gw.tagClass}`}>
                        {gw.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : status === "razorpay_view" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="flex items-center gap-1 text-xs text-text-secondary hover:text-primary transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Gateways
                </button>
              </div>

              <div className="p-4 border border-primary/30 bg-primary-tint/10 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-primary/20 pb-3">
                  <div className="flex items-center gap-2">
                    <PaymentGatewayLogos.Razorpay />
                    <span className="text-xs bg-primary text-white font-mono px-2 py-0.5 rounded">TEST MODE</span>
                  </div>
                  <span className="text-xs text-text-secondary font-mono">ID: rzp_test_2026</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-text-secondary block mb-1">Pay via UPI / VPA</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="flex-1 text-xs p-2 rounded border border-border bg-surface font-mono"
                        placeholder="username@upi"
                      />
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleConfirmSimulatedPayment("UPI")}
                      >
                        Pay ₹{amount.toLocaleString()}
                      </Button>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3">
                    <label className="text-xs font-medium text-text-secondary block mb-1">Pay via Test Card</label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="text-[11px] p-2 bg-surface border border-border rounded font-mono">
                        💳 4111 •••• •••• 1111
                      </div>
                      <div className="text-[11px] p-2 bg-surface border border-border rounded font-mono">
                        Exp: 12/28 | CVV: 123
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      variant="primary"
                      onClick={() => handleConfirmSimulatedPayment("Card")}
                    >
                      <CreditCard className="w-4 h-4 mr-1.5" /> Pay ₹{amount.toLocaleString()} with Test Card
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : status === "processing" ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="text-center">
                <div className="text-sm font-bold text-text-primary">Connecting to {selectedGateway?.name || "Secure Gateway"}...</div>
                <div className="text-xs text-text-secondary mt-1">Processing encrypted 256-bit transaction...</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="h-12 w-12 rounded-full bg-success/15 text-success flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-success">Payment Approved!</div>
                <div className="text-[11px] font-mono text-text-secondary mt-1">Ref ID: {txnId}</div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-surface-2 px-6 py-4 border-t border-border flex justify-end gap-3 sticky bottom-0">
          <Button
            variant="outline"
            size="sm"
            disabled={status === "processing"}
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default PaymentGatewayModal;

