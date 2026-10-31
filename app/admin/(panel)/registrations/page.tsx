'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  UserCheck,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  RefreshCw,
  X,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

export default function RegistrationsPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event') || '';

  const [teams, setTeams] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [track, setTrack] = useState('');
  const [checkedIn, setCheckedIn] = useState('');
  const [loading, setLoading] = useState(true);

  // Detail Modal
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTeams = async (targetPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (eventId) params.set('event', eventId);
      params.set('page', String(targetPage));
      params.set('limit', '15');
      if (search.trim()) params.set('search', search.trim());
      if (track) params.set('track', track);
      if (checkedIn) params.set('checkedIn', checkedIn);

      const res = await fetch(`/api/admin/teams?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams || []);
        setTotal(data.total || 0);
        setPage(data.page || 1);
        setPages(data.pages || 1);
      }
    } catch {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams(1);
  }, [eventId, track, checkedIn]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTeams(1);
  };

  const handleExportCsv = () => {
    const url = eventId
      ? `/api/admin/teams/export?event=${eventId}`
      : '/api/admin/teams/export';
    window.location.href = url;
    toast.success('Downloading CSV export...');
  };

  const handleDeleteTeam = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete team "${name}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/teams/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete team');
        return;
      }
      toast.success(data.message || 'Team deleted');
      setSelectedTeam(null);
      fetchTeams(page);
    } catch {
      toast.error('Network error deleting team');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Registered Teams ({total})
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Full participant database, member contact rosters, and attendance audits.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 rounded-lg bg-primary hover:opacity-90 text-black font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
        >
          <Download className="w-4 h-4" />
          Export CSV (Excel Ready)
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-xl border border-white/10 bg-[#12121c] flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team ID, team name, leader email or phone..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary text-xs"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={checkedIn}
            onChange={(e) => setCheckedIn(e.target.value)}
            className="px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary text-xs"
          >
            <option value="">All Attendance</option>
            <option value="true">Checked In Only</option>
            <option value="false">Pending Check-in</option>
          </select>

          <button
            onClick={() => fetchTeams(1)}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Teams Table */}
      <div className="rounded-xl border border-white/10 bg-[#12121c] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            Loading teams database...
          </div>
        ) : teams.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 border border-dashed border-white/10 rounded-xl m-4">
            No teams match your search filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-neutral-400 bg-white/5">
                  <th className="p-3.5 font-normal">Team ID</th>
                  <th className="p-3.5 font-normal">Team Name</th>
                  <th className="p-3.5 font-normal">Track</th>
                  <th className="p-3.5 font-normal">Leader Email</th>
                  <th className="p-3.5 font-normal">Members</th>
                  <th className="p-3.5 font-normal">Check-in Status</th>
                  <th className="p-3.5 font-normal">Registered</th>
                  <th className="p-3.5 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {teams.map((t) => (
                  <tr
                    key={t._id}
                    onClick={() => setSelectedTeam(t)}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="p-3.5 font-bold text-primary">{t.teamId}</td>
                    <td className="p-3.5 font-medium text-white">{t.teamName}</td>
                    <td className="p-3.5 text-neutral-300">{t.track}</td>
                    <td className="p-3.5 text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <span>{t.leaderEmail}</span>
                        {t.isGoogleVerified && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono flex items-center gap-1"
                            title="Verified via Google OAuth"
                          >
                            <span>✓</span> Google
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-neutral-300">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-neutral-500" />
                        {t.members?.length || 0}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.checkedIn
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {t.checkedIn ? 'Checked-In' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-3.5 text-neutral-500">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedTeam(t)}
                          className="p-1.5 rounded border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10"
                          title="View Members Roster"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(t._id, t.teamName)}
                          className="p-1.5 rounded border border-red-500/20 text-red-400 hover:bg-red-500/10"
                          title="Delete Team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-neutral-400 text-xs">
              Page {page} of {pages} ({total} Total Teams)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchTeams(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-white/15 text-neutral-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchTeams(page + 1)}
                disabled={page >= pages}
                className="p-1.5 rounded-lg border border-white/15 text-neutral-300 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Team Detail Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#12121c] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                  {selectedTeam.teamId}
                </span>
                <h2 className="text-lg font-bold text-white">{selectedTeam.teamName}</h2>
                <span className="text-xs text-neutral-400">Track: {selectedTeam.track}</span>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Check-in info */}
            <div className="p-3.5 rounded-xl border border-white/10 bg-black/40 flex items-center justify-between">
              <div>
                <span className="text-neutral-400 block text-[11px]">Desk Attendance:</span>
                <span className="text-white font-bold">
                  {selectedTeam.checkedIn ? '✅ Checked-In' : '⏳ Pending Arrival'}
                </span>
                {selectedTeam.checkedInAt && (
                  <span className="text-[10px] text-neutral-500 block">
                    At {new Date(selectedTeam.checkedInAt).toLocaleString()}
                    {selectedTeam.checkedInBy?.name ? ` by ${selectedTeam.checkedInBy.name}` : ''}
                  </span>
                )}
              </div>
              <span className="text-xs text-neutral-400">
                Registered: {new Date(selectedTeam.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Member List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Full Member Rosters
              </h3>
              <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-black/20">
                {selectedTeam.members?.map((m: any, idx: number) => (
                  <div key={idx} className="p-3.5 flex items-start justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{m.name}</span>
                        {m.isLeader && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-primary/20 text-primary font-bold">
                            Leader
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded ${
                            m.present ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          {m.present ? 'Present' : 'Absent'}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1 space-y-0.5">
                        <div>📧 {m.email}</div>
                        <div>📞 {m.phone}</div>
                        <div>🏛 {m.college} • {m.department} (Year {m.year}) {m.registerNumber ? `• Reg: ${m.registerNumber}` : ''}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => handleDeleteTeam(selectedTeam._id, selectedTeam.teamName)}
                disabled={deleting}
                className="px-3.5 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Delete Team
              </button>
              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className="px-4 py-2 rounded-lg bg-white/10 text-white font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
