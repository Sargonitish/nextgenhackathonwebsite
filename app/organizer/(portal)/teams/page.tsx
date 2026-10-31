'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  QrCode,
  ShieldAlert,
  Loader2,
  Phone,
  Mail,
  GraduationCap,
  Building,
  ArrowRight,
} from 'lucide-react';

interface Member {
  _id?: string;
  name: string;
  college: string;
  department: string;
  year: string;
  isLeader: boolean;
  present?: boolean;
  phone: string;
  email?: string;
}

interface TeamItem {
  _id: string;
  teamId: string;
  teamName: string;
  track: string;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: { name: string } | null;
  members: Member[];
}

export default function OrganizerTeamsPage() {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'checkedIn' | 'pending'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search,
        status,
        page: page.toString(),
        limit: '15',
      });
      const res = await fetch(`/api/organizer/teams?${query.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load teams');
      }
      const data = await res.json();
      setTeams(data.teams || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTeams();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchTeams]);

  const toggleExpand = (id: string) => {
    setExpandedTeamId(expandedTeamId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            Participant Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Desk lookup with privacy-masked contacts ({totalCount} total teams)
          </p>
        </div>

        <Link
          href="/checkin"
          className="self-start sm:self-center px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
        >
          <QrCode className="w-4 h-4" /> Open Desk Scanner
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Team ID (e.g. HACKX-0001), team name, or member name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'pending', 'checkedIn'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-mono capitalize transition ${
                status === s
                  ? 'bg-cyan-500/10 border border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {s === 'all' && 'All'}
              {s === 'pending' && '⏳ Pending'}
              {s === 'checkedIn' && '✅ Checked-In'}
            </button>
          ))}
        </div>
      </div>

      {/* Teams List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
          <span className="text-xs font-mono">Loading participants...</span>
        </div>
      ) : teams.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400 font-mono">No matching teams found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teams.map((t) => {
            const isExpanded = expandedTeamId === t._id;
            const leader = t.members.find((m) => m.isLeader) || t.members[0];

            return (
              <div
                key={t._id}
                className="bg-[#0b101d] border border-slate-800/80 rounded-xl overflow-hidden hover:border-slate-700 transition"
              >
                {/* Team Card Summary Header */}
                <div
                  onClick={() => toggleExpand(t._id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {t.teamId}
                        </span>
                        <h3 className="font-bold text-slate-100 text-sm">{t.teamName}</h3>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                        <span>Lead: <strong className="text-slate-300">{leader?.name}</strong></span>
                        <span>•</span>
                        <span>{t.members.length} members</span>
                        <span>•</span>
                        <span className="text-slate-500 font-mono">Track: {t.track}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                    <span
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold ${
                        t.checkedIn
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {t.checkedIn ? '✅ Checked In' : '⏳ Pending'}
                    </span>

                    <button
                      type="button"
                      className="p-1 rounded bg-slate-900 text-slate-400 hover:text-slate-200"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-800/60 bg-slate-950/40 space-y-4">
                    {t.checkedIn && (
                      <div className="mt-3 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg flex items-center justify-between">
                        <span>
                          Checked in at{' '}
                          {t.checkedInAt
                            ? new Date(t.checkedInAt).toLocaleTimeString()
                            : 'N/A'}{' '}
                          {t.checkedInBy ? `by ${t.checkedInBy.name}` : ''}
                        </span>
                      </div>
                    )}

                    <div className="mt-3">
                      <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                        Registered Team Members
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {t.members.map((m, idx) => (
                          <div
                            key={m._id || idx}
                            className="bg-[#0b101d] border border-slate-800/80 rounded-lg p-3 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-200">
                                {m.name}
                              </span>
                              {m.isLeader && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                                  Leader
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 flex items-center gap-1.5">
                              <Building className="w-3.5 h-3.5 text-slate-500" />
                              <span>{m.college} ({m.department})</span>
                            </div>
                            <div className="text-slate-400 flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                              <span>Year: {m.year} {(m as any).registerNumber ? `• Reg: ${(m as any).registerNumber}` : ''}</span>
                            </div>
                            <div className="text-slate-400 flex items-center gap-1.5 font-mono">
                              <Phone className="w-3.5 h-3.5 text-cyan-500/60" />
                              <span>{m.phone}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Link
                        href={`/checkin?manual=${t.teamId}`}
                        className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        {t.checkedIn ? 'Review Check-In Record' : 'Check In This Team Now'}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs font-mono text-slate-400">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
