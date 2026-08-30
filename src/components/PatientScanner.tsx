import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  CameraOff,
  Search,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  QrCode,
  Sparkles,
  User,
  FileText,
  X,
  Volume2,
} from 'lucide-react';
import { Patient, Referral } from '../types';

interface PatientScannerProps {
  onPatientScanned?: (patientCode: string, patient?: Patient) => void;
  onReferralScanned?: (referralCode: string, referral?: Referral) => void;
  patients?: Patient[];
  referrals?: Referral[];
  mode?: 'doctor_patient_lookup' | 'hospital_triage_pass';
  title?: string;
  subtitle?: string;
}

export const PatientScanner: React.FC<PatientScannerProps> = ({
  onPatientScanned,
  onReferralScanned,
  patients = [],
  referrals = [],
  mode = 'doctor_patient_lookup',
  title,
  subtitle,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    type: 'success' | 'error';
    message: string;
    code?: string;
  } | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = useRef(`qr-reader-${Math.random().toString(36).substring(2, 9)}`);

  // Audio confirmation chime
  const playScanBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // Ignore audio constraints in restricted environments
    }
  };

  // Process decoded code string
  const handleCodeFound = (rawText: string) => {
    const cleanText = rawText.trim();
    if (!cleanText) return;

    playScanBeep();
    setScanResult(null);

    // 1. Try matching patient
    const matchedPatient = patients.find(
      (p) =>
        p.patient_code.toLowerCase() === cleanText.toLowerCase() ||
        p.id.toLowerCase() === cleanText.toLowerCase() ||
        (p.phone && p.phone.includes(cleanText))
    );

    // 2. Try matching referral
    const matchedReferral = referrals.find(
      (r) =>
        r.referral_code.toLowerCase() === cleanText.toLowerCase() ||
        r.id.toLowerCase() === cleanText.toLowerCase() ||
        r.patient?.patient_code.toLowerCase() === cleanText.toLowerCase()
    );

    if (matchedPatient && onPatientScanned) {
      onPatientScanned(matchedPatient.patient_code, matchedPatient);
    }

    if (matchedReferral && onReferralScanned) {
      onReferralScanned(matchedReferral.referral_code, matchedReferral);
    }

    if (matchedPatient || matchedReferral) {
      setScanResult({
        type: 'success',
        message: matchedPatient
          ? `Patient Record Verified: ${matchedPatient.name} (${matchedPatient.patient_code})`
          : `Referral Pass Verified: ${matchedReferral?.patient?.name || 'Patient'} (${matchedReferral?.referral_code})`,
        code: cleanText,
      });
    } else {
      // Still forward the code even if not in current local seed data
      if (onPatientScanned) onPatientScanned(cleanText);
      if (onReferralScanned) onReferralScanned(cleanText);

      setScanResult({
        type: 'success',
        message: `Scanned Code: ${cleanText}`,
        code: cleanText,
      });
    }
  };

  // Start Camera with html5-qrcode
  const startCamera = async () => {
    setCameraError(null);
    setIsScanning(true);

    try {
      // Check camera device availability
      const devices = await Html5Qrcode.getCameras().catch(() => []);
      if (!devices || devices.length === 0) {
        setCameraError('Camera access denied or unavailable. Please grant camera permission or use manual ID entry below.');
        setIsScanning(false);
        setIsCameraActive(false);
        return;
      }

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId.current);
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleCodeFound(decodedText);
          // Optional pause or stop after successful scan
        },
        () => {
          // Frame decode error (normal while scanning)
        }
      );

      setIsCameraActive(true);
      setIsScanning(false);
    } catch (err: any) {
      console.warn('Camera start issue:', err);
      setCameraError('Camera access denied or unavailable. Please check browser permissions or use manual entry.');
      setIsScanning(false);
      setIsCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Camera stop issue:', err);
      }
      setIsCameraActive(false);
    }
  };

  // Initialize camera when activeTab is camera
  useEffect(() => {
    if (activeTab === 'camera') {
      const timer = setTimeout(() => {
        startCamera();
      }, 250);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [activeTab]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle Manual Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      setScanResult({
        type: 'error',
        message: 'Please enter a valid Patient ID (e.g. PAT-001) or Referral Code (e.g. REF-000101)',
      });
      return;
    }
    handleCodeFound(manualCode.trim());
  };

  const defaultTitle =
    mode === 'doctor_patient_lookup'
      ? 'Doctor QR Scanner & Patient Lookup'
      : 'Hospital Triage QR Scanner & Pass Verification';

  const defaultSubtitle =
    mode === 'doctor_patient_lookup'
      ? 'Scan the patient digital QR code or enter Patient ID to fetch EHR and clinical vitals.'
      : 'Scan the incoming patient digital referral pass to confirm arrival and triage status.';

  return (
    <div className="w-full bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                mode === 'doctor_patient_lookup'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              <QrCode className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              {title || defaultTitle}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 ml-9">
            {subtitle || defaultSubtitle}
          </p>
        </div>

        {/* Tab Controls (Camera vs Manual) */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto shrink-0">
          <button
            type="button"
            id="tab-scanner-camera"
            onClick={() => setActiveTab('camera')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'camera'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-teal-600" />
            <span>Camera Scanner</span>
          </button>
          <button
            type="button"
            id="tab-scanner-manual"
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'manual'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Manual ID Entry</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CAMERA SCANNER */}
      {activeTab === 'camera' && (
        <div className="space-y-3">
          <div className="relative rounded-2xl bg-slate-950 text-white p-4 flex flex-col items-center justify-center overflow-hidden border border-slate-800 min-h-[280px]">
            {/* HTML5 QR Container */}
            <div
              id={scannerContainerId.current}
              className="w-full max-w-[280px] rounded-2xl overflow-hidden bg-slate-900 relative"
            />

            {/* If camera is starting or permission failed */}
            {!isCameraActive && (
              <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                {cameraError ? (
                  <div className="space-y-3 max-w-sm">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
                      <CameraOff className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-rose-300">
                      {cameraError}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      You can continue seamlessly using the <strong>Manual ID Entry</strong> tab or the quick test buttons below.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('manual')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition"
                    >
                      Switch to Manual Entry
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-300">
                      Initializing camera stream...
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Please allow camera permissions if prompted by your browser.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Camera Overlay Elements when active */}
            {isCameraActive && (
              <div className="mt-3 text-center">
                <span className="text-[11px] font-medium text-slate-300 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-800">
                  Point camera at patient QR code or digital pass
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MANUAL TEXT INPUT FALLBACK */}
      {activeTab === 'manual' && (
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                id="input-manual-patient-code"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter Patient ID (PAT-001) or Referral Code (REF-000101)..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>
            <button
              type="submit"
              id="btn-manual-fetch"
              className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Fetch Record</span>
            </button>
          </div>
        </form>
      )}

      {/* QUICK TEST DATA CHIPS (Works offline / in preview without camera) */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Quick Test Scan Demo</span>
          </span>
          <span className="text-[10px] text-slate-400">1-click test simulation</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {mode === 'doctor_patient_lookup' ? (
            patients.slice(0, 4).map((p) => (
              <button
                key={p.id}
                type="button"
                id={`chip-patient-${p.id}`}
                onClick={() => {
                  setManualCode(p.patient_code);
                  handleCodeFound(p.patient_code);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:border-teal-300 border border-slate-200 text-slate-700 hover:text-teal-900 text-xs font-semibold flex items-center gap-1 transition active:scale-95"
              >
                <User className="w-3 h-3 text-teal-600" />
                <span>
                  {p.name.split(' ')[0]} ({p.patient_code})
                </span>
              </button>
            ))
          ) : (
            referrals.slice(0, 4).map((r) => (
              <button
                key={r.id}
                type="button"
                id={`chip-ref-${r.id}`}
                onClick={() => {
                  setManualCode(r.referral_code);
                  handleCodeFound(r.referral_code);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-700 hover:text-blue-900 text-xs font-semibold flex items-center gap-1 transition active:scale-95"
              >
                <FileText className="w-3 h-3 text-blue-600" />
                <span>
                  {r.patient?.name.split(' ')[0] || 'Patient'} ({r.referral_code})
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Scan Result Feedback Message */}
      {scanResult && (
        <div
          className={`mt-3 p-3 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in-50 ${
            scanResult.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {scanResult.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{scanResult.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setScanResult(null)}
            className="p-1 hover:bg-slate-200/50 rounded-md text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
