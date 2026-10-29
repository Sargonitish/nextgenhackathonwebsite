'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import QRCode from 'qrcode';
import {
  CheckCircle2,
  Copy,
  Download,
  Check,
  QrCode,
  Users,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

function RegisterSuccessContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const teamId = params.teamId as string;
  const token = searchParams.get('token');

  const [team, setTeam] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadTeam() {
      if (!teamId || !token) {
        setError('Missing team identifier or security verification token.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/public/team-lookup?teamId=${teamId}&token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to verify team registration');
          setLoading(false);
          return;
        }

        setTeam(data.team);

        // Generate QR code encoding the checkin URL
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
        const checkinUrl = `${siteUrl}/checkin?team=${teamId}&token=${token}`;
        const qrUrl = await QRCode.toDataURL(checkinUrl, {
          width: 320,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        setQrDataUrl(qrUrl);
      } catch (err) {
        console.error(err);
        setError('Network error retrieving registration details');
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-neutral-400 font-mono text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-primary" />
        Generating official security badge & QR pass...
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f] text-white font-mono text-xs">
        <div className="max-w-md w-full p-8 rounded-3xl border border-white/10 bg-[#12121c] text-center shadow-2xl">
          <AlertTriangle className="w-10 h-10 mx-auto text-amber-400 mb-4" />
          <h1 className="text-base font-bold text-white mb-2">Access Unauthorized</h1>
          <p className="text-neutral-400 mb-6 leading-relaxed">{error}</p>
          <Link
            href="/find-registration"
            className="inline-block py-2.5 px-4 rounded-xl bg-primary text-black font-bold"
          >
            Recover Your Team Pass
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-12 px-4 sm:px-6 lg:px-8 font-mono text-xs">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>

        {/* Celebration Card */}
        <div className="p-8 sm:p-10 rounded-3xl border border-primary/30 bg-[#12121c] text-center shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary text-3xl mb-4 shadow-[0_0_20px_rgba(0,255,157,0.4)]">
            🎉
          </div>

          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary uppercase tracking-widest text-[10px] font-bold mb-2">
            Registration Confirmed
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Welcome, {team.teamName}!
          </h1>

          <p className="text-neutral-400 text-xs max-w-md mx-auto mb-6">
            Track: <span className="text-primary font-semibold">{team.track}</span>
          </p>

          {/* Large Team ID Box */}
          <div className="p-4 rounded-2xl border border-white/10 bg-black/60 max-w-sm mx-auto mb-8 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] text-neutral-500 uppercase block">Official Team ID</span>
              <span className="text-2xl font-black text-primary tracking-wider">{team.teamId}</span>
            </div>
            <button
              onClick={copyTeamId}
              className="p-2.5 rounded-xl border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Copy Team ID"
            >
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Official Registration QR Code */}
          <div className="inline-block p-4 rounded-2xl bg-white shadow-2xl mx-auto mb-4">
            {qrDataUrl && (
              <Image
                src={qrDataUrl}
                alt={`QR code for ${team.teamId}`}
                width={240}
                height={240}
                className="rounded-lg"
              />
            )}
          </div>

          <p className="text-neutral-400 text-[11px] mb-6">
            📌 Show this QR code at the campus registration desk for fast verification.
          </p>

          {/* Buttons: Download QR & Copy */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={downloadQr}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-black font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Download QR Badge (PNG)
            </button>
            <button
              onClick={copyTeamId}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Copy className="w-4 h-4" />
              Copy Team ID
            </button>
          </div>
        </div>

        {/* Members Roster Summary */}
        <div className="p-6 rounded-2xl border border-white/10 bg-[#12121c] space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Registered Team Members ({team.members?.length || 0})
          </h2>

          <div className="divide-y divide-white/5">
            {team.members?.map((m: any, idx: number) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">
                    {m.name} {m.isLeader && <span className="text-primary font-normal">(Leader)</span>}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {m.college} • {m.department}
                  </span>
                </div>
                <span className="text-neutral-400 text-[11px]">Year {m.year}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070913] flex items-center justify-center text-cyan-400 font-mono text-xs">
          Loading registration passport...
        </div>
      }
    >
      <RegisterSuccessContent />
    </Suspense>
  );
}
