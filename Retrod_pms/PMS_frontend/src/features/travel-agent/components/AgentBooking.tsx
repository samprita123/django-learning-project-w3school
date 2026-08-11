import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Building, Calendar, Users, FileText, CreditCard, X, UploadCloud, Camera, Plus, Trash2 } from "lucide-react";
import { Card, CardHeader, Button } from "@/components/ui/Primitives";

export function AgentBooking() {
  const [step, setStep] = useState<1 | 2>(1);
  const [roomsCount, setRoomsCount] = useState(1);
  const [idFiles, setIdFiles] = useState<Record<number, File | null>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadRoom, setActiveUploadRoom] = useState<number>(0);

  const [cameraActiveForRoom, setCameraActiveForRoom] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async (roomIndex: number) => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      setCameraActiveForRoom(roomIndex);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream, cameraActiveForRoom]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActiveForRoom(null);
  };

  const captureImage = () => {
    if (videoRef.current && cameraActiveForRoom !== null) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `ID_Capture_Room_${cameraActiveForRoom + 1}.jpg`, { type: "image/jpeg" });
            setIdFiles(prev => ({ ...prev, [cameraActiveForRoom]: file }));
            stopCamera();
          }
        }, "image/jpeg");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIdFiles(prev => ({ ...prev, [activeUploadRoom]: e.target.files![0] }));
    }
  };

  const handleCapture = (roomIndex: number) => {
    startCamera(roomIndex);
  };

  const baseGrossRate = 17000;
  const baseDiscount = 2550;
  const totalGrossRate = baseGrossRate * roomsCount;
  const totalDiscount = baseDiscount * roomsCount;
  const totalPayable = totalGrossRate - totalDiscount;

  if (step === 2) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-text-primary">Booking Confirmed!</h2>
          <p className="mt-2 text-[13px] text-text-secondary">
            Your booking reference is <span className="font-bold text-text-primary">RES-9983</span>. An email confirmation has been sent to your registered agency email.
          </p>
          <div className="mt-6 p-4 rounded-xl bg-surface-2 border border-border text-left space-y-3">
            <div className="flex justify-between text-[13px]">
              <span className="text-text-secondary">Rooms</span>
              <span className="font-medium text-text-primary">{roomsCount} Room(s)</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-text-secondary">Hotel</span>
              <span className="font-medium text-text-primary">The Grand Palace, New Delhi</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-text-secondary">Check-in</span>
              <span className="font-medium text-text-primary">24 May 2026</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-text-secondary">Amount Payable (Net)</span>
              <span className="font-medium text-text-primary">₹{totalPayable.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-text-secondary">Est. Commission</span>
              <span className="font-medium text-brand">₹{totalDiscount.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/travel-agent/search">
              <Button variant="outline">Book Another Room</Button>
            </Link>
            <Link to="/travel-agent/dashboard">
              <Button variant="primary">Return to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const renderRoomForm = (index: number) => {
    const idFile = idFiles[index];

    return (
      <div key={index} className="space-y-4 pt-6 first:pt-0 border-t first:border-0 border-border">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-text-primary text-[14px]">Room {index + 1} Guest</h4>
          {roomsCount > 1 && (
            <button 
              onClick={() => {
                setRoomsCount(prev => prev - 1);
                // optionally clean up idFiles for this index
              }} 
              className="text-error hover:text-error-hover text-[12px] flex items-center"
            >
              <Trash2 className="h-3 w-3 mr-1" /> Remove Room
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-text-primary">First Name *</label>
            <input type="text" className="h-10 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" placeholder="e.g. John" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-text-primary">Last Name *</label>
            <input type="text" className="h-10 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" placeholder="e.g. Doe" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-text-primary">Email Address</label>
            <input type="email" className="h-10 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" placeholder="Guest email (optional)" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-text-primary">Phone Number</label>
            <input type="tel" className="h-10 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" placeholder="Guest phone (optional)" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-text-primary">Special Requests</label>
          <textarea className="min-h-[60px] w-full rounded-md border border-border bg-surface p-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" placeholder="Any special requests or preferences..." />
        </div>
        
        <div className="space-y-4 pt-4 border-t border-border-subtle">
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-text-primary">ID Proof Type</label>
            <select className="h-10 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-brand focus:outline-none">
              <option value="">Select ID Type</option>
              <option value="passport">Passport</option>
              <option value="driving_license">Driving License</option>
              <option value="national_id">National ID / Aadhaar</option>
              <option value="other">Other Government ID</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-text-primary">Upload or Capture ID Proof</label>
            
            {!idFile ? (
              <div className="flex gap-4">
                <div 
                  className="flex-1 flex justify-center rounded-lg border border-dashed border-border-subtle px-4 py-4 transition-colors hover:border-brand/50 hover:bg-surface cursor-pointer"
                  onClick={() => { setActiveUploadRoom(index); fileInputRef.current?.click(); }}
                >
                  <div className="text-center">
                    <UploadCloud className="mx-auto h-6 w-6 text-text-disabled" />
                    <div className="mt-2 text-[12px] font-medium text-brand">Upload File</div>
                    <div className="text-[10px] text-text-disabled mt-1">PNG, JPG, PDF</div>
                  </div>
                </div>
                <div 
                  className="flex-1 flex justify-center rounded-lg border border-dashed border-border-subtle px-4 py-4 transition-colors hover:border-brand/50 hover:bg-surface cursor-pointer"
                  onClick={() => handleCapture(index)}
                >
                  <div className="text-center">
                    <Camera className="mx-auto h-6 w-6 text-text-disabled" />
                    <div className="mt-2 text-[12px] font-medium text-brand">Capture ID</div>
                    <div className="text-[10px] text-text-disabled mt-1">Use Camera</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-1 flex items-center justify-between rounded-lg border border-border-subtle bg-surface px-4 py-3">
                <div className="flex items-center gap-3">
                  {idFile.type.startsWith('image/') ? (
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded border border-border">
                      <img src={URL.createObjectURL(idFile)} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-brand/10 text-brand">
                      <FileText className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <div className="text-[13px] font-medium text-text-primary line-clamp-1">{idFile.name}</div>
                    <div className="text-[11px] text-text-secondary">{(idFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="rounded p-1.5 text-text-secondary hover:bg-surface-2 hover:text-error transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIdFiles(prev => ({...prev, [index]: null}));
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <input 
        ref={fileInputRef}
        type="file" 
        className="hidden" 
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
      />

      <div className="flex items-center gap-4">
        <Link to="/travel-agent/search" className="flex h-8 w-8 items-center justify-center rounded-full bg-surface hover:bg-surface-2 border border-border text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Complete Booking</h2>
          <p className="text-[13px] text-text-secondary mt-1">Provide guest details and agency reference to confirm.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader title="1. Guest Details" />
            <div className="p-5 space-y-6">
              {[...Array(roomsCount)].map((_, index) => renderRoomForm(index))}
              
              <div className="pt-4 border-t border-border flex justify-center">
                <Button variant="outline" onClick={() => setRoomsCount(prev => prev + 1)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Another Room
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="2. Agency Details & Payment" />
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-text-primary">Agency Reference / PNR</label>
                  <input type="text" className="h-10 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-brand focus:outline-none" placeholder="e.g. AGT-102948" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-text-primary">Payment Method</label>
                  <select className="h-10 w-full rounded-md border border-border bg-surface px-3 text-[13px] text-text-primary focus:border-brand focus:outline-none">
                    <option>Pay via Agent Prepaid Wallet (₹1,50,000 available)</option>
                    <option>Pay by Corporate Credit Card</option>
                    <option>Guest to Pay at Hotel (Net Rate Billed to Agent)</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <div className="sticky top-20 space-y-4">
            <Card>
              <div className="p-5 space-y-6">
                <div>
                  <h3 className="font-bold text-text-primary text-[15px]">The Grand Palace</h3>
                  <div className="flex items-center gap-1 text-[12px] text-text-secondary mt-1">
                    <Building className="h-3 w-3" /> New Delhi, India
                  </div>
                </div>

                <div className="space-y-3 border-y border-border-subtle py-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-text-secondary mt-0.5" />
                    <div>
                      <div className="text-[12px] font-medium text-text-primary">24 May 2026 - 26 May 2026</div>
                      <div className="text-[11px] text-text-secondary">2 Nights</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-text-secondary mt-0.5" />
                    <div>
                      <div className="text-[12px] font-medium text-text-primary">{2 * roomsCount} Adults, 0 Children</div>
                      <div className="text-[11px] text-text-secondary">{roomsCount} Room(s)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-text-secondary mt-0.5" />
                    <div>
                      <div className="text-[12px] font-medium text-text-primary">Deluxe King Room</div>
                      <div className="text-[11px] text-text-secondary">Room Only (B2B Standard)</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-text-secondary">Gross Rate</span>
                    <span className="font-medium text-text-primary line-through text-text-secondary">₹{totalGrossRate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-text-secondary">Agent Discount (15%)</span>
                    <span className="font-medium text-success">-₹{totalDiscount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-text-secondary">Taxes & Fees</span>
                    <span className="font-medium text-text-primary">Included</span>
                  </div>
                </div>

                <div className="border-t border-border-subtle pt-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[15px] font-bold text-text-primary">₹{totalPayable.toLocaleString()}</div>
                      <div className="text-[10px] text-text-secondary">Net Payable Amount</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[12px] font-medium text-brand">₹{totalDiscount.toLocaleString()}</div>
                      <div className="text-[10px] text-text-secondary">Your Commission</div>
                    </div>
                  </div>
                </div>

                <Button variant="primary" className="w-full justify-center h-11 text-[14px]" onClick={() => setStep(2)}>
                  Confirm Booking
                </Button>
                <div className="text-center text-[10px] text-text-secondary">
                  By clicking Confirm Booking, you agree to the <a href="#" className="underline">B2B Terms & Conditions</a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {cameraActiveForRoom !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-surface rounded-xl overflow-hidden w-full max-w-lg shadow-2xl">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-text-primary">Capture ID (Room {cameraActiveForRoom + 1})</h3>
              <button onClick={stopCamera} className="text-text-secondary hover:text-error p-1 rounded-md hover:bg-surface-2 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative bg-black flex justify-center items-center h-[300px]">
              <video ref={videoRef} className="max-w-full max-h-full object-contain" playsInline muted />
              {!stream && <div className="absolute text-white text-[13px]">Requesting camera access...</div>}
            </div>
            <div className="p-4 border-t border-border flex justify-center bg-surface-2">
              <Button variant="primary" onClick={captureImage} disabled={!stream} className="w-full max-w-xs justify-center h-12 rounded-full shadow-lg">
                <Camera className="h-5 w-5 mr-2" /> Take Photo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
