'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CheckinScanner from '@/components/shared/CheckinScanner';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Users,
  Camera,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

function CheckinDeskContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamParam = searchParams.get('team');
  const tokenParam = searchParams.get('token');

  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [manualQuery, setManualQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Desk Stats Counter
  const [deskStats, setDeskStats] = useState({ checkedIn: 0, total: 0 });

  // Lookup Result
  const [team, setTeam] = useState<any>(null);
  const [isAlreadyCheckedIn, setIsAlreadyCheckedIn] = useState(false);
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null);
  const [checkedInBy, setCheckedInBy] = useState<any>(null);
  const [presentMemberIds, setPresentMemberIds] = useState<string[]>([]);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const fetchDeskStats = async () => {
    try {
      const res = await fetch('/api/public/stats');
      if (res.ok) {
        const data = await res.json();
        setDeskStats((prev) => ({ ...prev, total: data.registeredTeamsCount || 0 }));
      }
      const adminRes = await fetch('/api/admin/stats');
      if (adminRes.ok) {
        const aData = await adminRes.json();
        setDeskStats({
          checkedIn: aData.checkedInTeams || 0,
          total: aData.totalTeams || 0,
        });
      }
    } catch {}
  };

  useEffect(() => {
    fetchDeskStats();
  }, []);

  // Handle URL query parameters (auto-lookup from camera QR scan)
  useEffect(() => {
    if (teamParam) {
      handleLookup(teamParam, tokenParam || undefined);
    }
  }, [teamParam, tokenParam]);

  const handleLookup = async (teamId: string, token?: string) => {
    if (!teamId.trim()) return;

    setLoading(true);
    setLookupError(null);
    setTeam(null);

    try {
      const res = await fetch('/api/staff/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'lookup',
          teamId: teamId.trim(),
          token,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.error || 'Team not found or invalid token');
        setLoading(false);
        return;
      }

      setTeam(data.team);
      setIsAlreadyCheckedIn(data.isAlreadyCheckedIn);
      setCheckedInAt(data.checkedInAt);
      setCheckedInBy(data.checkedInBy);

      // Default: all members checked present
      const allIds = (data.team.members || []).map((m: any) => m._id);
      setPresentMemberIds(allIds);
    } catch (err) {
      setLookupError('Network error during team lookup');
    } finally {
      setLoading(false);
    }
  };

  // Callback from html5-qrcode camera
  const handleCameraScan = (decodedText: string) => {
    try {
      // Check if scanned text is a full URL with ?team= &token=
      if (decodedText.includes('team=')) {
        const url = new URL(decodedText);
        const teamId = url.searchParams.get('team');
        const token = url.searchParams.get('token');
        if (teamId) {
          handleLookup(teamId, token || undefined);
          return;
        }
      }
      // Scanned raw Team ID directly
      handleLookup(decodedText.trim());
    } catch {
      handleLookup(decodedText.trim());
    }
  };

  const toggleMemberPresent = (memberId: string) => {
    setPresentMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleConfirmCheckin = async () => {
    if (!team) return;

    setConfirming(true);
    try {
      const res = await fetch('/api/staff/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm',
          teamId: team.teamId,
          presentMemberIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to confirm check-in');
        setConfirming(false);
        return;
      }

      // Haptic feedback & audio
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }

      toast.success(`✓ ${team.teamId} Checked-in successfully!`);
      fetchDeskStats();

      // Return to scanner automatically after 2 seconds
      setTimeout(() => {
        setTeam(null);
        setLookupError(null);
        setManualQuery('');
        setConfirming(false);
      }, 2000);
    } catch {
      toast.error('Network error confirming check-in');
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090f] text-white p-4 sm:p-6 lg:p-8 font-mono text-xs">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Top Header & Live Counter */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Desk</span>
          </Link>

          <div className="px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold">
            {deskStats.checkedIn} / {deskStats.total} Teams Checked In
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2">
            <QrCode className="w-6 h-6 text-primary" />
            Registration Desk Scanner
          </h1>
          <p className="text-neutral-400 text-[11px] mt-1">
            Scan participant QR pass or search team ID to verify attendance.
          </p>
        </div>

        {/* Mode Selector (Camera vs Manual) */}
        {!team && !lookupError && (
          <div className="flex rounded-xl bg-[#12121c] p-1 border border-white/10">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'camera'
                  ? 'bg-primary text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              Camera Scanner
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'manual'
                  ? 'bg-primary text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              Manual Search
            </button>
          </div>
        )}

        {/* Camera Scanner View */}
        {!team && !lookupError && activeTab === 'camera' && (
          <div className="p-6 rounded-3xl border border-white/10 bg-[#12121c] flex flex-col items-center">
            <CheckinScanner
              onScan={handleCameraScan}
              isActive={activeTab === 'camera' && !loading}
            />
            <p className="text-neutral-400 text-[10px] mt-4 text-center">
              Align team QR badge within camera viewfinder for instant lookup.
            </p>
          </div>
        )}

        {/* Manual Search Form */}
        {!team && !lookupError && activeTab === 'manual' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup(manualQuery);
            }}
            className="p-6 rounded-3xl border border-white/10 bg-[#12121c] space-y-4"
          >
            <div>
              <label className="block text-neutral-400 uppercase text-[10px] tracking-wider mb-1">
                Enter Team ID
              </label>
              <input
                type="text"
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value.toUpperCase())}
                placeholder="e.g. HACKX-0001"
                required
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-primary uppercase tracking-wider"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !manualQuery.trim()}
              className="w-full py-3 rounded-xl bg-primary text-black font-bold flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Lookup Team Pass
            </button>
          </form>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="p-12 text-center text-primary flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Verifying team cryptographic credentials...</span>
          </div>
        )}

        {/* Error Card */}
        {lookupError && !loading && (
          <div className="p-6 rounded-3xl border border-red-500/30 bg-red-500/10 text-center space-y-4">
            <XCircle className="w-10 h-10 text-red-400 mx-auto" />
            <h2 className="text-base font-bold text-white">Verification Failed</h2>
            <p className="text-neutral-300 text-xs">{lookupError}</p>
            <button
              onClick={() => {
                setLookupError(null);
                setTeam(null);
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold"
            >
              Scan Again
            </button>
          </div>
        )}

        {/* Result Card: Team Verified */}
        {team && !loading && (
          <div
            className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6 ${
              isAlreadyCheckedIn
                ? 'border-amber-400/50 bg-[#181610]'
                : 'border-emerald-500/50 bg-[#0e1713]'
            }`}
          >
            {/* Status Header Banner */}
            {isAlreadyCheckedIn ? (
              <div className="p-3.5 rounded-xl border border-amber-400/40 bg-amber-400/10 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-amber-400 block">Already Checked In!</span>
                  <span className="text-neutral-300 text-[11px] block mt-0.5">
                    Verified at{' '}
                    {checkedInAt ? new Date(checkedInAt).toLocaleTimeString() : 'Earlier'}
                    {checkedInBy?.name ? ` by ${checkedInBy.name}` : ''}.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-emerald-400 block">Valid Pass Verified</span>
                  <span className="text-neutral-300 text-[11px] block mt-0.5">
                    Ready to confirm attendance.
                  </span>
                </div>
              </div>
            )}

            {/* Team Info */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Team Name & Track
                </span>
                <h2 className="text-lg font-black text-white">{team.teamName}</h2>
                <span className="text-primary text-xs font-semibold">{team.track}</span>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Team ID
                </span>
                <span className="text-xl font-black text-white">{team.teamId}</span>
              </div>
            </div>

            {/* Member Attendance Checklist */}
            <div className="space-y-3">
              <span className="block text-neutral-400 text-xs font-semibold">
                Mark Member Physical Attendance (tick present):
              </span>

              <div className="space-y-2">
                {team.members?.map((m: any) => {
                  const isPresent = presentMemberIds.includes(m._id);
                  return (
                    <div
                      key={m._id}
                      onClick={() => toggleMemberPresent(m._id)}
                      className={`p-3.5 rounded-xl border cursor-pointer select-none flex items-center justify-between transition-all ${
                        isPresent
                          ? 'border-primary/50 bg-primary/10 text-white'
                          : 'border-white/10 bg-black/40 text-neutral-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{m.name}</span>
                          {m.isLeader && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/20 text-primary font-bold">
                              Leader
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">
                          {m.college} • {m.department} (Year {m.year})
                        </span>
                        {m.phone && (
                          <span className="text-[10px] text-neutral-500 block">
                            Phone: {m.phone}
                          </span>
                        )}
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isPresent
                            ? 'bg-primary border-primary text-black'
                            : 'border-white/20 bg-transparent'
                        }`}
                      >
                        {isPresent && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setTeam(null);
                  setLookupError(null);
                }}
                className="w-1/3 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold"
              >
                Scan Next
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckin}
                disabled={confirming}
                className="w-2/3 py-3 rounded-xl bg-primary text-black font-extrabold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-primary/25 disabled:opacity-40"
              >
                {confirming ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {isAlreadyCheckedIn ? 'Update Attendance' : 'Confirm Check-in'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckinDeskPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070913] flex items-center justify-center text-emerald-400 font-mono text-xs">
          Loading desk scanner...
        </div>
      }
    >
      <CheckinDeskContent />
    </Suspense>
  );
}
