'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Plus,
  Copy,
  CheckCircle2,
  Archive,
  Trash2,
  RefreshCw,
  Flame,
  AlertTriangle,
  X,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

interface EventEdition {
  _id: string;
  name: string;
  slug: string;
  teamIdPrefix: string;
  isActive: boolean;
  isArchived: boolean;
  teamsCount: number;
  createdAt: string;
}

export default function EditionsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventEdition[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [blankModalOpen, setBlankModalOpen] = useState(false);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [sourceEvent, setSourceEvent] = useState<EventEdition | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [prefix, setPrefix] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch {
      toast.error('Failed to load editions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateBlank = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name,
          slug,
          teamIdPrefix: prefix,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to create edition');
        return;
      }
      toast.success('New blank edition created');
      setBlankModalOpen(false);
      resetForm();
      fetchEvents();
    } catch {
      toast.error('Network error creating edition');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceEvent) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clone',
          sourceEventId: sourceEvent._id,
          name,
          slug,
          teamIdPrefix: prefix,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to clone edition');
        return;
      }
      toast.success(`Cloned ${sourceEvent.name} successfully`);
      setCloneModalOpen(false);
      resetForm();
      fetchEvents();
    } catch {
      toast.error('Network error cloning edition');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetActive = async (id: string, eventName: string) => {
    if (!confirm(`Are you sure you want to make "${eventName}" the LIVE public event?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/events/${id}/activate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to activate edition');
        return;
      }
      toast.success(data.message || 'Edition activated!');
      fetchEvents();
    } catch {
      toast.error('Network error activating edition');
    }
  };

  const handleToggleArchive = async (id: string, currentArchived: boolean) => {
    const action = currentArchived ? 'unarchive' : 'archive';
    if (!confirm(`Are you sure you want to ${action} this edition?`)) return;

    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'archive',
          data: { isArchived: !currentArchived },
        }),
      });
      if (res.ok) {
        toast.success(`Edition ${action}d successfully`);
        fetchEvents();
      } else {
        const data = await res.json();
        toast.error(data.error || `Failed to ${action} edition`);
      }
    } catch {
      toast.error('Network error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmation = prompt(
      `To permanently delete "${name}", type DELETE in uppercase below:`
    );
    if (confirmation !== 'DELETE') {
      toast.info('Deletion cancelled');
      return;
    }

    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete edition');
        return;
      }
      toast.success('Archived edition deleted permanently');
      fetchEvents();
    } catch {
      toast.error('Network error deleting edition');
    }
  };

  const resetForm = () => {
    setName('');
    setSlug('');
    setPrefix('');
    setSourceEvent(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-mono text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Hackathon Editions
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Manage, clone, and switch between annual hackathon editions seamlessly.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setBlankModalOpen(true);
          }}
          className="px-4 py-2 rounded-lg bg-primary hover:opacity-90 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Edition (Blank)
        </button>
      </div>

      {/* Editions Table */}
      {loading ? (
        <div className="p-12 text-center text-neutral-400 font-mono text-sm flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-primary" />
          Loading editions...
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-[#12121c] overflow-hidden">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 text-neutral-400 bg-white/5">
                <th className="p-4 font-normal">Edition Name</th>
                <th className="p-4 font-normal">Slug</th>
                <th className="p-4 font-normal">Prefix</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 font-normal">Teams</th>
                <th className="p-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {events.map((ev) => (
                <tr key={ev._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white">
                    <div className="flex items-center gap-2">
                      {ev.isActive && <Flame className="w-4 h-4 text-primary animate-pulse" />}
                      <span>{ev.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-neutral-400">{ev.slug}</td>
                  <td className="p-4 text-primary">{ev.teamIdPrefix}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        ev.isActive
                          ? 'bg-primary/10 border border-primary/30 text-primary'
                          : ev.isArchived
                          ? 'bg-neutral-800 text-neutral-400'
                          : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
                      }`}
                    >
                      {ev.isActive ? 'LIVE' : ev.isArchived ? 'ARCHIVED' : 'DRAFT'}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-300">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-neutral-500" />
                      {ev.teamsCount}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!ev.isActive && !ev.isArchived && (
                        <button
                          onClick={() => handleSetActive(ev._id, ev.name)}
                          className="px-2.5 py-1 rounded bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 text-[11px] font-semibold"
                        >
                          Set Live
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSourceEvent(ev);
                          setName(`${ev.name} (Copy)`);
                          setSlug(`${ev.slug}-copy`);
                          setPrefix(ev.teamIdPrefix);
                          setCloneModalOpen(true);
                        }}
                        title="Clone into new year"
                        className="p-1.5 rounded border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {!ev.isActive && (
                        <button
                          onClick={() => handleToggleArchive(ev._id, ev.isArchived)}
                          title={ev.isArchived ? 'Unarchive' : 'Archive'}
                          className="p-1.5 rounded border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {ev.isArchived && ev.teamsCount === 0 && (
                        <button
                          onClick={() => handleDelete(ev._id, ev.name)}
                          title="Permanently Delete"
                          className="p-1.5 rounded border border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Blank Edition Modal */}
      {blankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12121c] p-6 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <h2 className="text-sm font-bold text-white">Create New Blank Edition</h2>
              <button onClick={() => setBlankModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBlank} className="space-y-4">
              <div>
                <label className="block text-neutral-300 mb-1">Edition Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }}
                  placeholder="e.g. HackX 2027"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Unique Slug (URL safe)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. hackx-2027"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Team ID Prefix</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                  placeholder="e.g. HACKX27"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary uppercase"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setBlankModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-white/15 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-primary text-black font-semibold hover:opacity-90"
                >
                  {submitting ? 'Creating...' : 'Create Edition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clone Edition Modal */}
      {cloneModalOpen && sourceEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#12121c] p-6 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <h2 className="text-sm font-bold text-white">
                Clone Edition: {sourceEvent.name}
              </h2>
              <button onClick={() => setCloneModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-neutral-400 mb-4 text-[11px]">
              This will copy all branding, tracks, coordinators, schedule, prizes, sponsors, and rules. Teams and live timers will be reset.
            </p>

            <form onSubmit={handleClone} className="space-y-4">
              <div>
                <label className="block text-neutral-300 mb-1">New Edition Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. HackX 2027"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">New Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. hackx-2027"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">New Team ID Prefix</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                  placeholder="e.g. HACKX27"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary uppercase"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCloneModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-white/15 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-primary text-black font-semibold hover:opacity-90"
                >
                  {submitting ? 'Cloning...' : 'Confirm Clone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
