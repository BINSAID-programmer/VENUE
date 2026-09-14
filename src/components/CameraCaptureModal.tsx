import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, X, RotateCcw, Check, ArrowRight, RefreshCw, UploadCloud, AlertCircle, Sparkles } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string, mimeType: string) => void;
  onSendImmediately?: (imageDataUrl: string, mimeType: string) => void;
  onFallbackToFile: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  onSendImmediately,
  onFallbackToFile,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isInitializing, setIsInitializing] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Check available video devices
  const checkDevices = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }
    } catch {
      // ignore
    }
  }, []);

  // Stop active media stream tracks
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      setStream(null);
    }
  }, [stream]);

  // Start real device camera
  const startCamera = useCallback(
    async (mode: 'environment' | 'user') => {
      setIsInitializing(true);
      setPermissionError(null);

      // Stop previous stream if any
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError('Direct camera API is not supported on this device/browser. Please choose image upload.');
        setIsInitializing(false);
        return;
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
          },
          audio: false,
        });

        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
        checkDevices();
      } catch (err: any) {
        console.warn('Camera access error:', err);
        const errName = err?.name || '';
        if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
          setPermissionError(
            'Camera permission was denied. Please allow camera access in your browser or app settings to photograph questions, or select "Upload from Gallery".'
          );
        } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
          setPermissionError('No camera hardware was detected on this device. Please use file upload instead.');
        } else {
          setPermissionError(`Unable to start camera (${err?.message || 'Access error'}). Please use image upload.`);
        }
      } finally {
        setIsInitializing(false);
      }
    },
    [checkDevices, stream]
  );

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      startCamera(facingMode);
    } else {
      stopStream();
      setCapturedImage(null);
      setPermissionError(null);
    }
    return () => {
      stopStream();
    };
  }, [isOpen]);

  // Toggle front/rear camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture frame to canvas
  const handleShutter = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, width, height);

    // Compress to JPEG with high quality
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedImage(dataUrl);

    // Stop live stream while reviewing captured photo
    stopStream();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  // Confirm and attach photo
  const handleAttach = () => {
    if (!capturedImage) return;
    onCapture(capturedImage, 'image/jpeg');
    onClose();
  };

  // Confirm and send immediately
  const handleSendImmediately = () => {
    if (!capturedImage) return;
    if (onSendImmediately) {
      onSendImmediately(capturedImage, 'image/jpeg');
    } else {
      onCapture(capturedImage, 'image/jpeg');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800 z-10">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              {capturedImage ? 'Review Captured Photo' : 'Photograph Academic Question'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Screen */}
        <div className="relative flex-1 min-h-[320px] sm:min-h-[420px] bg-black flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            // Captured Preview Screen
            <div className="relative w-full h-full flex items-center justify-center p-2 bg-slate-950">
              <img
                src={capturedImage}
                alt="Captured academic question"
                className="max-h-[60vh] w-auto max-w-full object-contain rounded-lg border border-slate-800"
              />
              <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-[11px] font-medium text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Photo Captured</span>
              </div>
            </div>
          ) : permissionError ? (
            // Permission or Hardware Error State
            <div className="p-6 text-center max-w-sm space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-200">Camera Access Notice</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{permissionError}</p>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Camera Again</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onFallbackToFile();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Select Image from Files / Gallery</span>
                </button>
              </div>
            </div>
          ) : (
            // Live Video Feed & Viewfinder
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Framing */}
              <div className="absolute inset-6 sm:inset-10 border-2 border-sky-400/40 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-t-2 border-l-2 border-sky-400 -mt-1 -ml-1" />
                  <div className="w-5 h-5 border-t-2 border-r-2 border-sky-400 -mt-1 -mr-1" />
                </div>
                <div className="text-center">
                  <span className="px-2.5 py-1 rounded-md bg-slate-950/70 backdrop-blur-md text-[11px] font-medium text-slate-300 border border-slate-750">
                    Align equation or textbook problem
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-b-2 border-l-2 border-sky-400 -mb-1 -ml-1" />
                  <div className="w-5 h-5 border-b-2 border-r-2 border-sky-400 -mb-1 -mr-1" />
                </div>
              </div>

              {/* Camera Switcher (Front/Rear) if available */}
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-750 text-slate-200 hover:text-white transition-colors"
                  title="Switch Camera (Front/Rear)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              {isInitializing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-slate-300 text-xs">
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                  <span>Starting camera...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hidden Canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Bottom Control Bar */}
        <div className="px-4 py-3.5 bg-slate-950 border-t border-slate-800">
          {capturedImage ? (
            <div className="flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleRetake}
                className="py-2.5 px-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAttach}
                  className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold flex items-center gap-1.5 border border-sky-500/30 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Attach to Input</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendImmediately}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/30 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Send to AI</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              {/* Fallback to gallery upload */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onFallbackToFile();
                }}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-slate-800/60 transition-colors"
              >
                <UploadCloud className="w-4 h-4 text-sky-400" />
                <span>Choose File</span>
              </button>

              {/* Shutter Button */}
              <button
                type="button"
                disabled={isInitializing || Boolean(permissionError)}
                onClick={handleShutter}
                className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white text-slate-950 shadow-lg shadow-white/10 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none ring-4 ring-sky-500/40"
                title="Capture Photo"
              >
                <div className="w-11 h-11 rounded-full border-2 border-slate-900 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-slate-900" />
                </div>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-200 py-1.5 px-2.5 rounded-lg hover:bg-slate-800/60 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
