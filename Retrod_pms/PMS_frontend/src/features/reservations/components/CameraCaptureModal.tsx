import { useEffect, useRef, useState } from "react";
import { X, Camera, RefreshCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/Primitives";

interface CameraCaptureModalProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

export function CameraCaptureModal({ onCapture, onClose }: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Failed to access camera. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-lg rounded-xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2/30">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-brand" />
            <h2 className="text-lg font-semibold text-text-primary">Capture ID Proof</h2>
          </div>
          <button 
            onClick={() => { stopCamera(); onClose(); }} 
            className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 flex flex-col items-center bg-black/5 relative aspect-video w-full">
          {error ? (
            <div className="flex-1 flex items-center justify-center text-error p-4 text-center">
              {error}
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-contain rounded-md" />
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover rounded-md"
            />
          )}
          
          {/* Hidden canvas for taking snapshot */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-4 border-t border-border flex justify-center gap-4 bg-surface-2/30">
          {capturedImage ? (
            <>
              <Button variant="outline" type="button" onClick={retakePhoto} className="flex-1">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Retake
              </Button>
              <Button variant="primary" type="button" onClick={confirmPhoto} className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Use Photo
              </Button>
            </>
          ) : (
            <Button 
              variant="primary" 
              type="button" 
              onClick={capturePhoto} 
              className="flex-1 h-12 text-base"
              disabled={!!error}
            >
              <Camera className="w-5 h-5 mr-2" />
              Capture
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
