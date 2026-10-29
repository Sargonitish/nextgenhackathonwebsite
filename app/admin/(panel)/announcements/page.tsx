'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Megaphone, Send, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AnnouncementsAdminPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event') || '';

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const url = eventId ? `/api/admin/announcements?event=${eventId}` : '/api/admin/announcements';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [eventId]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: eventId || undefined,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to post announcement');
        return;
      }

      toast.success('Announcement broadcasted! Appears on public ticker within 20s.');
      setMessage('');
      fetchAnnouncements();
    } catch {
      toast.error('Network error posting announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement from ticker?')) return;
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Announcement deleted');
        fetchAnnouncements();
      } else {
        toast.error('Failed to delete announcement');
      }
    } catch {
      toast.error('Network error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-mono text-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            Live Marquee Announcements
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Broadcast urgent updates directly to the public home marquee and live hall projector ticker.
          </p>
        </div>
      </div>

      {/* Post Form */}
      <form onSubmit={handlePost} className="p-5 rounded-xl border border-white/10 bg-[#12121c] space-y-4">
        <label className="block text-neutral-300 font-semibold">
          Broadcast Message (supports emojis)
        </label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. 🍕 Midnight Pizza has arrived at the Cafeteria Lounge! Bring your hacker badges."
          required
          className="w-full px-3.5 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary text-xs"
        />

        <div className="flex justify-between items-center pt-2">
          <span className="text-[11px] text-neutral-500">
            Automatically distributed to connected devices within 20 seconds.
          </span>
          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="px-4 py-2 rounded-lg bg-primary hover:opacity-90 text-black font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-40"
          >
            {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Broadcast Ticker Message
          </button>
        </div>
      </form>

      {/* Announcements List */}
      <div className="p-5 rounded-xl border border-white/10 bg-[#12121c] space-y-3">
        <h2 className="text-sm font-bold text-white mb-2">Live & Recent Broadcasts</h2>

        {loading ? (
          <div className="py-8 text-center text-neutral-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-8 text-center text-neutral-500 border border-dashed border-white/10 rounded-lg">
            No announcements currently active. Type a message above to broadcast.
          </div>
        ) : (
          <div className="space-y-2">
            {announcements.map((a) => (
              <div
                key={a._id}
                className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-black/40 hover:border-white/20 transition-all"
              >
                <div className="truncate mr-4">
                  <p className="text-white text-xs font-medium">{a.message}</p>
                  <span className="text-[10px] text-neutral-500">
                    {new Date(a.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(a._id)}
                  title="Remove Announcement"
                  className="p-1.5 rounded border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
