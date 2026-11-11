'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import QRCode from 'qrcode';
import {
  Copy,
  Download,
  Check,
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  Printer,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ReceiptPrinter,
  type ReceiptPrinterStage,
} from '@/components/shared/ReceiptPrinter';

function RegisterSuccessContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const teamId = params.teamId as string;
  const token = searchParams.get('token');

  const [eventName, setEventName] = useState<string>('HACKX 2026');
  const [team, setTeam] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [stage, setStage] = useState<ReceiptPrinterStage>('processing');

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPrintTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
  };

  const triggerPrintSequence = () => {
    clearPrintTimers();
    setStage('processing');
    timerRef.current = setTimeout(() => {
      setStage('printing');
      completeTimerRef.current = setTimeout(() => {
        setStage('complete');
      }, 1800);
    }, 220);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadTeam() {
      if (!teamId || !token) {
        if (isMounted) {
          setError('Missing team identifier or security verification token.');
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(`/api/public/team-lookup?teamId=${teamId}&token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          if (isMounted) {
            setError(data.error || 'Failed to verify team registration');
            setLoading(false);
          }
          return;
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
        const checkinUrl = `${siteUrl}/checkin?team=${teamId}&token=${token}`;
        const qrUrl = await QRCode.toDataURL(checkinUrl, {
          width: 360,
          margin: 2,
          color: {
            dark: '#141923',
            light: '#F5F2E9',
          },
        });

        if (!isMounted) return;

        if (data.eventName) {
          setEventName(data.eventName);
        }
        setTeam(data.team);
        setQrDataUrl(qrUrl);
        setLoading(false);

        // Kick off hardware printing stage transition
        timerRef.current = setTimeout(() => {
          if (!isMounted) return;
          setStage('printing');
          completeTimerRef.current = setTimeout(() => {
            if (isMounted) setStage('complete');
          }, 1800);
        }, 350);
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Network error retrieving registration details');
          setLoading(false);
        }
      }
    }

    loadTeam();

    return () => {
      isMounted = false;
      clearPrintTimers();
    };
  }, [teamId, token]);

  const copyTeamId = () => {
    navigator.clipboard.writeText(teamId);
    setCopied(true);
    toast.success('Team ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-${teamId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('QR Code downloaded as PNG');
  };

  if (!loading && (error || !team)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-navy bg-[linear-gradient(to_right,rgba(242,239,230,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(242,239,230,0.06)_1px,transparent_1px)] bg-[size:48px_48px] text-offwhite font-mono text-xs">
        <div className="max-w-md w-full p-8 border border-line bg-[#0c223f] text-center shadow-hard">
          <AlertTriangle className="w-10 h-10 mx-auto text-yellow mb-4" />
          <h1 className="font-display text-lg font-black uppercase text-offwhite mb-2">
            Access Unauthorized
          </h1>
          <p className="text-offwhite/70 mb-6 leading-relaxed">{error}</p>
          <Link
            href="/find-registration"
            className="inline-block py-2.5 px-5 bg-yellow text-navy font-bold uppercase tracking-wider border border-yellow shadow-[3px_3px_0_rgba(242,239,230,0.3)]"
          >
            Recover Your Team Pass
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy bg-[linear-gradient(to_right,rgba(242,239,230,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(242,239,230,0.06)_1px,transparent_1px)] bg-[size:48px_48px] text-offwhite py-8 sm:py-12 px-4 font-mono text-xs">
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        {/* Top Bar */}
        <div className="w-full flex items-center justify-between mb-8 print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-offwhite/60 hover:text-yellow transition-colors uppercase tracking-wider text-[11px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>

          <div className="flex items-center gap-3">
            {!loading && team && (
              <button
                type="button"
                onClick={triggerPrintSequence}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-line text-offwhite/60 hover:text-yellow hover:border-yellow/50 transition-colors uppercase text-[10px]"
                title="Replay receipt feed animation"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reprint</span>
              </button>
            )}
            <span className="hidden sm:inline text-[10px] text-offwhite/40 uppercase tracking-widest">
              [ ENTRY PASS TERMINAL ]
            </span>
          </div>
        </div>

        {/* Interactive Thermal Receipt Printer */}
        <ReceiptPrinter.Root stage={stage} feedMotion="stepped">
          <ReceiptPrinter.Machine className="print:hidden">
            <ReceiptPrinter.Header>
              <div className="flex items-center gap-2 text-[10px] tracking-widest text-offwhite/60 uppercase">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    stage === 'complete'
                      ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                      : 'bg-yellow animate-pulse shadow-[0_0_8px_#FFD23F]'
                  }`}
                />
                <span>PASS-PRINTER // MK-II</span>
              </div>
              <span className="text-[10px] text-offwhite/40 uppercase tracking-wider">
                {team?.checkedIn ? '[CHECKED-IN]' : '[VERIFIED]'}
              </span>
            </ReceiptPrinter.Header>

            <ReceiptPrinter.Screen>
              <ReceiptPrinter.Status>
                {stage === 'processing' && 'Generating cryptographic pass...'}
                {stage === 'printing' && `Printing pass — ${team?.teamId || teamId}`}
                {stage === 'complete' && `Pass ready — ${team?.teamId || teamId}`}
              </ReceiptPrinter.Status>
            </ReceiptPrinter.Screen>
          </ReceiptPrinter.Machine>

          {/* Emerging Serrated Receipt Pass */}
          <ReceiptPrinter.Output>
            {team && (
              <ReceiptPrinter.Paper>
                {/* Receipt Title Stamp */}
                <div className="text-center space-y-1">
                  <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#141923]">
                    {eventName.toUpperCase()} // OFFICIAL ENTRY PASS
                  </div>
                  <div className="text-[10px] text-[#141923]/60 uppercase">
                    DESK CHECK-IN AUTHORIZATION SLIP
                  </div>
                </div>

                {/* Dashed Separator */}
                <div className="my-3.5 border-t border-dashed border-[#141923]/35" />

                {/* Team Metadata & Prominent Team ID */}
                <div className="text-center space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wide">
                    TEAM: {team.teamName}
                  </div>
                  <div className="text-[11px] text-[#141923]/75 uppercase">
                    TRACK: {team.track}
                  </div>
                  <div className="pt-1.5 text-2xl sm:text-[26px] font-black tracking-[0.08em] text-[#0B1F3A]">
                    {team.teamId}
                  </div>
                </div>

                {/* Scannable QR Code */}
                <div className="my-4 flex justify-center">
                  <div className="p-2 border border-[#141923]/20 bg-[#F5F2E9]">
                    {qrDataUrl && (
                      <Image
                        src={qrDataUrl}
                        alt={`QR code for ${team.teamId}`}
                        width={200}
                        height={200}
                        className="block"
                        unoptimized
                      />
                    )}
                  </div>
                </div>

                {/* Dashed Separator */}
                <div className="my-3.5 border-t border-dashed border-[#141923]/35" />

                {/* Member Roster */}
                <div className="space-y-2 text-left">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#141923]/80">
                    <span>REGISTERED ROSTER ({team.members?.length || 0})</span>
                    <span>YEAR / REG</span>
                  </div>

                  <div className="space-y-2">
                    {team.members?.map((m: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-2 text-[11px] leading-snug"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-[#141923] truncate">
                            {String(idx + 1).padStart(2, '0')}. {m.name}{' '}
                            {m.isLeader && (
                              <span className="ml-1 inline-block px-1 py-0.2 bg-[#141923] text-[#F5F2E9] text-[9px] font-bold tracking-wider">
                                LEADER
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#141923]/70 truncate">
                            {m.college} • {m.department}
                          </div>
                        </div>
                        <div className="text-right shrink-0 text-[10px] text-[#141923]/80">
                          <div>Yr {m.year}</div>
                          {m.registerNumber && (
                            <div className="font-bold">{m.registerNumber}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dashed Separator */}
                <div className="my-4 border-t border-dashed border-[#141923]/35" />

                {/* Checksum Footer */}
                <div className="text-center space-y-2">
                  <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#141923]/85">
                    TOKEN VERIFIED // SCAN AT DESK
                  </div>
                  <p className="text-[9px] text-[#141923]/60 leading-tight">
                    Present this QR badge &amp; college ID card during check-in.
                  </p>
                  {/* Simulated thermal barcode footer */}
                  <div
                    aria-hidden="true"
                    className="mx-auto mt-2 flex h-5 w-44 items-stretch justify-center gap-[2px] opacity-80"
                  >
                    {[2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2].map(
                      (w, i) => (
                        <span
                          key={i}
                          className="bg-[#141923]"
                          style={{ width: `${w * 2}px` }}
                        />
                      )
                    )}
                  </div>
                </div>
              </ReceiptPrinter.Paper>
            )}
          </ReceiptPrinter.Output>
        </ReceiptPrinter.Root>

        {/* Action Controls Dock (Appears cleanly below the serrated receipt edge) */}
        {!loading && team && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 print:hidden">
            <button
              type="button"
              onClick={downloadQr}
              className="px-5 py-2.5 bg-yellow text-navy font-mono text-xs font-bold uppercase tracking-wider border border-yellow shadow-[3px_3px_0_rgba(242,239,230,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_rgba(242,239,230,0.3)] transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD QR BADGE (PNG)</span>
            </button>

            <button
              type="button"
              onClick={copyTeamId}
              className="px-5 py-2.5 border border-line bg-[#0c223f] hover:border-yellow text-offwhite font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-yellow" />
              )}
              <span>{copied ? 'COPIED TEAM ID' : 'COPY TEAM ID'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2.5 border border-line bg-navy hover:border-yellow text-offwhite/80 hover:text-yellow font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
              title="Print physical pass copy"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">PRINT</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegisterSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy flex items-center justify-center text-yellow font-mono text-xs">
          Initializing receipt pass terminal...
        </div>
      }
    >
      <RegisterSuccessContent />
    </Suspense>
  );
}
