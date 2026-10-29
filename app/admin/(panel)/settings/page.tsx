'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sliders, Save, RefreshCw, AlertCircle, Key } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event') || '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventData, setEventData] = useState<any>(null);

  // Settings State
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [maxTeams, setMaxTeams] = useState<number | ''>('');
  const [minTeamSize, setMinTeamSize] = useState(2);
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [organizerSignupOpen, setOrganizerSignupOpen] = useState(true);
  const [organizerSignupCode, setOrganizerSignupCode] = useState('');

  useEffect(() => {
    async function loadEvent() {
      try {
        const url = eventId ? `/api/admin/events/${eventId}` : '/api/admin/events';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const target = data.event || (data.events ? data.events[0] : null);
          if (target) {
            setEventData(target);
            const s = target.settings || {};
            setRegistrationOpen(s.registrationOpen ?? true);
            setRegistrationDeadline(
              s.registrationDeadline ? new Date(s.registrationDeadline).toISOString().slice(0, 16) : ''
            );
            setMaxTeams(s.maxTeams ?? '');
            setMinTeamSize(s.minTeamSize ?? 2);
            setMaxTeamSize(s.maxTeamSize ?? 4);
            setOrganizerSignupOpen(s.organizerSignupOpen ?? true);
            setOrganizerSignupCode(s.organizerSignupCode || '');
          }
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [eventId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const idToUpdate = eventId || eventData?._id;
    if (!idToUpdate) {
      toast.error('No event edition selected');
      return;
    }

    if (minTeamSize < 1 || maxTeamSize < minTeamSize) {
      toast.error('Invalid team size configuration');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/events/${idToUpdate}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'settings',
          data: {
            registrationOpen,
            registrationDeadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : null,
            maxTeams: maxTeams === '' ? null : Number(maxTeams),
            minTeamSize: Number(minTeamSize),
            maxTeamSize: Number(maxTeamSize),
            organizerSignupOpen,
            organizerSignupCode: organizerSignupCode.trim() ? organizerSignupCode.trim() : null,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Failed to update settings');
        return;
      }

      toast.success('Saved ✓');
    } catch {
      toast.error('Network error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400 font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-primary" />
        Loading event settings...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl mx-auto font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            Hackathon Operational Settings
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure registration deadlines, maximum capacity caps, and organizer access codes.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-primary hover:opacity-90 text-black font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-40"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save Settings
        </button>
      </div>

      {/* Registration Settings */}
      <div className="p-5 rounded-xl border border-white/10 bg-[#12121c] space-y-5">
        <h2 className="text-sm font-bold text-white">Student Registration Gates</h2>

        {/* Registration Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-black/40">
          <div>
            <span className="text-sm font-semibold text-white block">Accepting Registrations</span>
            <span className="text-neutral-400 text-[11px] block mt-0.5">
              When toggled off, the public `/register` form will show &quot;Registrations Closed&quot;.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setRegistrationOpen(!registrationOpen)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              registrationOpen ? 'bg-primary' : 'bg-neutral-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-black transition-transform ${
                registrationOpen ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-neutral-400 mb-1">
              Hard Registration Deadline (IST)
            </label>
            <input
              type="datetime-local"
              value={registrationDeadline}
              onChange={(e) => setRegistrationDeadline(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
            />
            <span className="text-[10px] text-neutral-500 mt-1 block">
              Form automatically locks after this exact minute
            </span>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">
              Maximum Team Capacity Cap
            </label>
            <input
              type="number"
              value={maxTeams}
              onChange={(e) => setMaxTeams(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 100 (leave blank for unlimited)"
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Team Size Rules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-neutral-400 mb-1">Minimum Team Size</label>
            <input
              type="number"
              min={1}
              max={10}
              value={minTeamSize}
              onChange={(e) => setMinTeamSize(Number(e.target.value))}
              required
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Maximum Team Size</label>
            <input
              type="number"
              min={minTeamSize}
              max={10}
              value={maxTeamSize}
              onChange={(e) => setMaxTeamSize(Number(e.target.value))}
              required
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Organizer Signup Controls */}
      <div className="p-5 rounded-xl border border-white/10 bg-[#12121c] space-y-5">
        <h2 className="text-sm font-bold text-white">Organizer Applications Access</h2>

        {/* Organizer Signup Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-black/40">
          <div>
            <span className="text-sm font-semibold text-white block">Allow Volunteer Sign-Ups</span>
            <span className="text-neutral-400 text-[11px] block mt-0.5">
              Enables the `/organizer/signup` portal for new student volunteers & faculty leads.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOrganizerSignupOpen(!organizerSignupOpen)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              organizerSignupOpen ? 'bg-primary' : 'bg-neutral-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-black transition-transform ${
                organizerSignupOpen ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-neutral-400 mb-1">
            Passcode Gate for Organizer Sign-Up (Optional)
          </label>
          <div className="relative max-w-sm">
            <Key className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={organizerSignupCode}
              onChange={(e) => setOrganizerSignupCode(e.target.value)}
              placeholder="e.g. HACKXORG2026"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
            />
          </div>
          <span className="text-[10px] text-neutral-500 mt-1 block">
            If set, organizers must enter this exact code during signup, preventing unauthorized requests.
          </span>
        </div>
      </div>
    </form>
  );
}
