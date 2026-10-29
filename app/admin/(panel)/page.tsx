'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  CalendarDays,
  Activity,
  Timer,
  Play,
  ArrowRight,
  Bell,
  RefreshCw,
  QrCode,
  Shield,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event') || '';

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startingTimer, setStartingTimer] = useState(false);

  const fetchStats = async () => {
    try {
      const url = eventId ? `/api/admin/stats?event=${eventId}` : '/api/admin/stats';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [eventId]);

  const handleQuickStartTimer = async () => {
    if (!stats?.eventId) return;
    setStartingTimer(true);
    try {
      const res = await fetch('/api/admin/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: stats.eventId,
          action: 'start',
        }),
      });
      if (res.ok) {
        toast.success('Event timer started successfully!');
        fetchStats();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to start timer');
      }
    } catch {
      toast.error('Network error starting timer');
    } finally {
      setStartingTimer(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400 font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-primary" />
        Loading real-time dashboard data...
      </div>
    );
  }

  const timerStatus = stats?.timer?.status || 'not_started';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 🔔 Pending Organizers Alert Banner */}
      {stats?.pendingOrganizers > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-red-500/20 text-red-400">
              <Bell className="w-5 h-5 animate-bounce" />
            </span>
            <div>
              <h2 className="font-mono font-bold text-sm text-white">
                Pending Organizer Requests
              </h2>
              <p className="text-xs text-neutral-300">
                You have {stats.pendingOrganizers} organizer application(s) awaiting approval for desk check-in duties.
              </p>
            </div>
          </div>
          <Link
            href="/admin/organizers"
            className="px-3.5 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            Review Now
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Teams */}
        <div className="p-5 rounded-xl border border-white/10 bg-[#12121c] backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="font-mono text-xs uppercase tracking-wider">Total Teams</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-white">
            {stats?.totalTeams ?? 0}
          </div>
          <span className="text-[11px] font-mono text-neutral-400 mt-1 block">
            Across all innovation tracks
          </span>
        </div>

        {/* Today's Registrations */}
        <div className="p-5 rounded-xl border border-white/10 bg-[#12121c] backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="font-mono text-xs uppercase tracking-wider">Registered Today</span>
            <CalendarDays className="w-4 h-4 text-accent" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-white">
            +{stats?.todayTeams ?? 0}
          </div>
          <span className="text-[11px] font-mono text-neutral-400 mt-1 block">
            Since midnight (00:00 IST)
          </span>
        </div>

        {/* Checked-in Teams */}
        <div className="p-5 rounded-xl border border-white/10 bg-[#12121c] backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="font-mono text-xs uppercase tracking-wider">Checked-In Desk</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-white">
            {stats?.checkedInTeams ?? 0} / {stats?.totalTeams ?? 0}
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all"
              style={{
                width: `${
                  stats?.totalTeams > 0
                    ? Math.round((stats.checkedInTeams / stats.totalTeams) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Registration Status */}
        <div className="p-5 rounded-xl border border-white/10 bg-[#12121c] backdrop-blur-md">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="font-mono text-xs uppercase tracking-wider">Portal Status</span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                stats?.registrationOpen ? 'bg-primary animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="font-mono text-xl font-bold text-white">
              {stats?.registrationOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
          <Link
            href="/admin/settings"
            className="text-[11px] font-mono text-neutral-400 hover:text-white mt-2 block underline"
          >
            Configure deadlines & capacity →
          </Link>
        </div>
      </div>

      {/* Timer Quick Control Card */}
      <div className="p-5 rounded-xl border border-white/10 bg-gradient-to-r from-primary/10 via-[#12121c] to-accent/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-primary">
            <Timer className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-white">
                Live Hackathon Countdown
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  timerStatus === 'running'
                    ? 'bg-primary text-black'
                    : timerStatus === 'paused'
                    ? 'bg-amber-400 text-black'
                    : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                {timerStatus}
              </span>
            </div>
            <p className="text-xs text-neutral-300 font-mono mt-0.5">
              Syncs seamlessly across public site, projectors, and mobile apps without clock drift.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {timerStatus !== 'running' && (
            <button
              onClick={handleQuickStartTimer}
              disabled={startingTimer}
              className="px-4 py-2 rounded-lg bg-primary hover:opacity-90 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {startingTimer ? 'Starting...' : 'Quick Start (24h)'}
            </button>
          )}
          <Link
            href="/admin/timer"
            className="px-4 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white font-mono text-xs flex items-center gap-1.5 transition-all"
          >
            Timer Console
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/live"
            target="_blank"
            className="px-4 py-2 rounded-lg border border-accent/40 bg-accent/10 hover:bg-accent/20 text-white font-mono text-xs flex items-center gap-1.5 transition-all"
          >
            Projector View
          </Link>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registrations Per Day */}
        <div className="p-5 rounded-xl border border-white/10 bg-[#12121c] flex flex-col">
          <h2 className="font-mono font-bold text-sm text-white mb-1">
            Registration Velocity (Last 7 Days)
          </h2>
          <p className="text-xs text-neutral-400 font-mono mb-4">
            New team registrations per day
          </p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.timelineData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="date" stroke="#666" tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis stroke="#666" allowDecimals={false} tick={{ fontSize: 11, fill: '#888' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12121a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#00ff9d"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#00ff9d' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Teams per Track */}
        <div className="p-5 rounded-xl border border-white/10 bg-[#12121c] flex flex-col">
          <h2 className="font-mono font-bold text-sm text-white mb-1">
            Distribution by Innovation Track
          </h2>
          <p className="text-xs text-neutral-400 font-mono mb-4">
            Team participation by selected category
          </p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.tracksData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="track" stroke="#666" tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis stroke="#666" allowDecimals={false} tick={{ fontSize: 11, fill: '#888' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12121a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Latest 5 Registered Teams Table */}
      <div className="p-5 rounded-xl border border-white/10 bg-[#12121c]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-mono font-bold text-sm text-white">
              Recently Registered Teams
            </h2>
            <p className="text-xs text-neutral-400 font-mono">
              Live registrations stream
            </p>
          </div>
          <Link
            href="/admin/registrations"
            className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
          >
            View All Registrations →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400">
                <th className="pb-3 font-normal">Team ID</th>
                <th className="pb-3 font-normal">Team Name</th>
                <th className="pb-3 font-normal">Track</th>
                <th className="pb-3 font-normal">Leader Email</th>
                <th className="pb-3 font-normal">Status</th>
                <th className="pb-3 font-normal">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats?.recentTeams?.map((t: any) => (
                <tr key={t.teamId} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-bold text-primary">{t.teamId}</td>
                  <td className="py-3 font-medium text-white">{t.teamName}</td>
                  <td className="py-3 text-neutral-300">{t.track}</td>
                  <td className="py-3 text-neutral-400">{t.leaderEmail}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.checkedIn
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {t.checkedIn ? 'Checked-In' : 'Pending Check-in'}
                    </span>
                  </td>
                  <td className="py-3 text-neutral-500">
                    {new Date(t.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
              {(!stats?.recentTeams || stats.recentTeams.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500 font-mono">
                    No teams have registered yet for this edition.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
