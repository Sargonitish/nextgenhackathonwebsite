'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, SwitchCamera, RefreshCw } from 'lucide-react';

interface CheckinScannerProps {
  onScan: (decodedText: string) => void;
  isActive: boolean;
}

export default function CheckinScanner({ onScan, isActive }: CheckinScannerProps) {
  const [cameras, setCameras] = useState<any[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader-container';

  useEffect(() => {
    async function initCameras() {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Try to select back camera by default
          const backIndex = devices.findIndex((d) =>
            d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear')
          );
          setCurrentCameraIndex(backIndex !== -1 ? backIndex : 0);
        } else {
          setError('No camera detected on this device.');
        }
      } catch (err) {
        setError('Camera permission denied or camera not accessible.');
      }
    }
    initCameras();
  }, []);

  useEffect(() => {
    if (!isActive || cameras.length === 0) {
      stopScanner();
      return;
    }

    const cameraId = cameras[currentCameraIndex]?.id;
    if (!cameraId) return;

    const html5QrCode = new Html5Qrcode(scannerContainerId, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });
    scannerRef.current = html5QrCode;

    html5QrCode
      .start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onScan(decodedText);
        },
        () => {
          // Frame scan error (normal during searching for QR)
        }
      )
      .catch((err) => {
        console.error('Html5Qrcode start error:', err);
      });

    return () => {
      stopScanner();
    };
  }, [isActive, currentCameraIndex, cameras]);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
    }
  };

  const handleSwitchCamera = () => {
    if (cameras.length > 1) {
      stopScanner();
      setCurrentCameraIndex((prev) => (prev + 1) % cameras.length);
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto flex flex-col items-center">
      {error ? (
        <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 font-mono text-xs text-center">
          {error}
        </div>
      ) : (
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-primary/40 bg-black/80 shadow-2xl">
          <div id={scannerContainerId} className="w-full h-full" />

          {/* Scanner Overlay Guide */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="w-56 h-56 rounded-2xl border-2 border-primary/60 shadow-[0_0_20px_rgba(0,255,157,0.2)] animate-pulse" />
          </div>

          {/* Switch Camera Button */}
          {cameras.length > 1 && (
            <button
              type="button"
              onClick={handleSwitchCamera}
              className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/70 border border-white/20 text-white font-mono text-xs flex items-center gap-1.5 hover:bg-black"
            >
              <SwitchCamera className="w-4 h-4" />
              <span>Flip</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
