'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Loader2,
  Compass,
} from 'lucide-react';

interface Stats {
  eventName?: string;
  totalTeams: number;
  checkedIn: number;
  remaining: number;
  tracksData: Array<{ title: string; count: number }>;
  registrationOpen: boolean;
  organizerName?: string;
}

export default function OrganizerDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch('/api/organizer/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(() => loadStats(), 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
        <span className="text-xs font-mono">Loading operations desk...</span>
      </div>
    );
  }

  const checkinRate = stats?.totalTeams
    ? Math.round((stats.checkedIn / stats.totalTeams) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/80 via-[#0b1329] to-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
            <Compass className="w-4 h-4" /> Live Event Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white mt-1">
            {stats?.eventName || 'Hackathon Active Edition'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Welcome back, <span className="text-slate-200 font-semibold">{stats?.organizerName}</span>. Ready for participant intake?
          </p>
        </div>

        <button
          onClick={() => loadStats(true)}
          disabled={refreshing}
          className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/checkin"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-transparent border border-emerald-500/40 p-6 hover:border-emerald-400 transition-all duration-300 shadow-lg shadow-emerald-950/20 flex items-center justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <QrCode className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-mono text-white group-hover:text-emerald-300 transition">
              Desk QR Scanner
            </h2>
            <p className="text-xs text-slate-400 max-w-xs">
              Fast camera check-in, search by token, mark attendance & assign badges.
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-6 h-6" />
          </div>
        </Link>

        <Link
          href="/organizer/teams"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/20 via-cyan-600/10 to-transparent border border-cyan-500/40 p-6 hover:border-cyan-400 transition-all duration-300 shadow-lg shadow-cyan-950/20 flex items-center justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-mono text-white group-hover:text-cyan-300 transition">
              Participant Roster
            </h2>
            <p className="text-xs text-slate-400 max-w-xs">
              Quick desk search for teams, verification, masked contacts & member lists.
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>TOTAL REGISTERED</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {stats?.totalTeams ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {stats?.registrationOpen ? '🟢 Registration open' : '🔴 Registration closed'}
          </div>
        </div>

        <div className="bg-[#0b101d] border border-emerald-500/30 rounded-xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
            <span>TEAMS CHECKED IN</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            {stats?.checkedIn ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {checkinRate}% of registered teams present
          </div>
        </div>

        <div className="bg-[#0b101d] border border-amber-500/30 rounded-xl p-5 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-amber-400">
            <span>AWAITING ARRIVAL</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400">
            {stats?.remaining ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Pending check-in verification
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-300">
          <span>DESK CHECK-IN COMPLETION</span>
          <span className="text-cyan-400 font-bold">{checkinRate}%</span>
        </div>
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, checkinRate))}%` }}
          />
        </div>
      </div>

      {/* Track Distribution */}
      {stats?.tracksData && stats.tracksData.length > 0 && (
        <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Distribution by Track
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.tracksData.map((t, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 space-y-1"
              >
                <div className="text-xs text-slate-400 truncate" title={t.title}>
                  {t.title}
                </div>
                <div className="text-xl font-bold font-mono text-slate-100">
                  {t.count} <span className="text-xs font-normal text-slate-500">teams</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
