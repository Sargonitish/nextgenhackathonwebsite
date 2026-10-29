'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
  Square,
  Clock,
  PlusCircle,
  Calendar,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import FlipCountdown from '@/components/public/FlipCountdown';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminTimerPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event') || '';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eventData, setEventData] = useState<any>(null);

  // Form State for Schedule & Duration
  const [scheduledStart, setScheduledStart] = useState('');
  const [durationHours, setDurationHours] = useState(24);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [customExtendMins, setCustomExtendMins] = useState(15);

  const fetchEvent = async () => {
    try {
      const url = eventId ? `/api/admin/events/${eventId}` : '/api/admin/events';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const target = data.event || (data.events ? data.events[0] : null);
        if (target) {
          setEventData(target);
          if (target.timer?.scheduledStart) {
            setScheduledStart(
              new Date(target.timer.scheduledStart).toISOString().slice(0, 16)
            );
          }
          if (target.timer?.durationMs) {
            const totalMins = Math.floor(target.timer.durationMs / (60 * 1000));
            setDurationHours(Math.floor(totalMins / 60));
            setDurationMinutes(totalMins % 60);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const handleAction = async (action: string, value?: number) => {
    if (['start', 'end', 'reset'].includes(action)) {
      const confirmed = confirm(
        `Are you sure you want to execute "${action.toUpperCase()}" on the hackathon timer?`
      );
      if (!confirmed) return;
    }

    const currentId = eventId || eventData?._id;
    if (!currentId) {
      toast.error('No event edition selected');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: currentId,
          action,
          value,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || `Failed to execute ${action}`);
        return;
      }

      toast.success(json.message || 'Timer updated!');
      fetchEvent();
    } catch {
      toast.error('Network error executing timer action');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentId = eventId || eventData?._id;
    if (!currentId) return;

    const totalMs = (Number(durationHours) * 60 + Number(durationMinutes)) * 60 * 1000;
    if (totalMs <= 0) {
      toast.error('Duration must be greater than zero');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: currentId,
          action: 'schedule',
          scheduledStart: scheduledStart ? new Date(scheduledStart).toISOString() : undefined,
          value: totalMs,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Failed to save schedule');
        return;
      }

      toast.success('Schedule & duration updated successfully!');
      fetchEvent();
    } catch {
      toast.error('Network error saving schedule');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400 font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-primary" />
        Loading timer console...
      </div>
    );
  }

  const timer = eventData?.timer;
  const status = timer?.status || 'not_started';

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <TimerIcon className="w-5 h-5 text-primary" />
            Live Event Timer Console
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time synchronization for auditorium projectors, stage displays, and participant screens.
          </p>
        </div>

        <Link
          href="/live"
          target="_blank"
          className="px-4 py-2 rounded-lg border border-accent/40 bg-accent/10 hover:bg-accent/20 text-white font-bold flex items-center gap-2 shadow-lg transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          Open Full-Screen Live Projector (/live)
        </Link>
      </div>

      {/* Live Preview Card */}
      <div className="p-8 rounded-2xl border border-white/10 bg-[#12121c] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,157,0.05)_0%,transparent_70%)] -z-10" />
        <span className="text-neutral-400 text-xs mb-6 uppercase tracking-widest font-semibold">
          Live Client Preview: {eventData?.name}
        </span>
        <FlipCountdown
          initialTimer={timer}
          eventId={eventData?._id}
          size="lg"
          showProgress={true}
        />
      </div>

      {/* Control Buttons Grid */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#12121c] space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Operational Controls
          </h2>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              status === 'running'
                ? 'bg-primary text-black'
                : status === 'paused'
                ? 'bg-amber-400 text-black'
                : 'bg-neutral-800 text-neutral-300'
            }`}
          >
            Current Status: {status}
          </span>
        </div>

        {/* Primary State Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {status !== 'running' ? (
            <button
              type="button"
              onClick={() => handleAction(status === 'paused' ? 'resume' : 'start')}
              disabled={submitting}
              className="py-3 px-4 rounded-xl bg-primary hover:opacity-90 text-black font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              {status === 'paused' ? 'Resume Timer' : 'Start Marathon'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleAction('pause')}
              disabled={submitting}
              className="py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all"
            >
              <Pause className="w-4 h-4 fill-current" />
              Pause Timer
            </button>
          )}

          <button
            type="button"
            onClick={() => handleAction('end')}
            disabled={submitting || status === 'ended'}
            className="py-3 px-4 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
          >
            <Square className="w-4 h-4 fill-current" />
            End Hackathon
          </button>

          <button
            type="button"
            onClick={() => handleAction('reset')}
            disabled={submitting}
            className="py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-neutral-300 font-bold flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Not Started
          </button>

          <button
            type="button"
            onClick={fetchEvent}
            className="py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-neutral-300 font-bold flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Force Re-Sync
          </button>
        </div>

        {/* Extensions (+15m, +30m, +1h, custom) */}
        <div className="pt-4 border-t border-white/10">
          <span className="block text-neutral-400 mb-3 font-semibold">
            Extend Duration on the Fly (adds extra time immediately):
          </span>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleAction('extend', 15 * 60 * 1000)}
              disabled={submitting}
              className="px-3.5 py-2 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-bold flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              +15 Minutes
            </button>
            <button
              type="button"
              onClick={() => handleAction('extend', 30 * 60 * 1000)}
              disabled={submitting}
              className="px-3.5 py-2 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-bold flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              +30 Minutes
            </button>
            <button
              type="button"
              onClick={() => handleAction('extend', 60 * 60 * 1000)}
              disabled={submitting}
              className="px-3.5 py-2 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-bold flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              +1 Hour
            </button>

            {/* Custom extension */}
            <div className="flex items-center gap-2 ml-auto">
              <input
                type="number"
                min={1}
                max={600}
                value={customExtendMins}
                onChange={(e) => setCustomExtendMins(Number(e.target.value))}
                className="w-20 px-2 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white text-center"
              />
              <button
                type="button"
                onClick={() => handleAction('extend', customExtendMins * 60 * 1000)}
                disabled={submitting || customExtendMins <= 0}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white"
              >
                +Add Mins
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Configuration Form */}
      <form onSubmit={handleSaveSchedule} className="p-6 rounded-2xl border border-white/10 bg-[#12121c] space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Scheduled Start Time & Total Duration
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-neutral-400 mb-1">
              Scheduled Start Timestamp (IST)
            </label>
            <input
              type="datetime-local"
              value={scheduledStart}
              onChange={(e) => setScheduledStart(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
            />
            <span className="text-[10px] text-neutral-500 mt-1 block">
              Displays countdown &quot;Hackathon starts in&quot; prior to start
            </span>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Duration (Hours)</label>
            <input
              type="number"
              min={0}
              max={168}
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              required
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Duration (Minutes)</label>
            <input
              type="number"
              min={0}
              max={59}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              required
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold transition-colors"
          >
            Update Scheduled Parameters
          </button>
        </div>
      </form>
    </div>
  );
}
