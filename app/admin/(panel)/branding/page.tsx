'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Palette, Save, RefreshCw, Eye } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import { toast } from 'sonner';

export default function BrandingPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event') || '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventData, setEventData] = useState<any>(null);

  // Branding State
  const [name, setName] = useState('');
  const [teamIdPrefix, setTeamIdPrefix] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#00ff9d');
  const [accentColor, setAccentColor] = useState('#7c3aed');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [sections, setSections] = useState<Record<string, boolean>>({
    hero: true,
    about: true,
    tracks: true,
    schedule: true,
    prizes: true,
    rules: true,
    coordinators: true,
    organizers: true,
    sponsors: true,
    gallery: true,
    faq: true,
    venue: true,
    contact: true,
  });

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
            setName(target.name || '');
            setTeamIdPrefix(target.teamIdPrefix || 'HACKX');
            setPrimaryColor(target.branding?.primaryColor || '#00ff9d');
            setAccentColor(target.branding?.accentColor || '#7c3aed');
            setLogoUrl(target.branding?.logoUrl || '');
            setFaviconUrl(target.branding?.faviconUrl || '');
            if (target.branding?.sections) {
              setSections(target.branding.sections);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load branding data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [eventId]);

  const handleToggleSection = (key: string) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const idToUpdate = eventId || eventData?._id;
    if (!idToUpdate) {
      toast.error('No event edition selected');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/events/${idToUpdate}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'branding',
          data: {
            name,
            teamIdPrefix,
            primaryColor,
            accentColor,
            logoUrl,
            faviconUrl,
            sections,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Failed to update branding');
        return;
      }

      toast.success('Saved ✓');
    } catch {
      toast.error('Network error during save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400 font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-primary" />
        Loading branding settings...
      </div>
    );
  }

  const sectionKeys = [
    { key: 'hero', label: 'Hero Countdown & CTA' },
    { key: 'about', label: 'About & Vision Section' },
    { key: 'tracks', label: 'Innovation Tracks Grid' },
    { key: 'schedule', label: 'Event Schedule Timeline' },
    { key: 'prizes', label: 'Prize Pool & Perks' },
    { key: 'rules', label: 'Rules & Code of Conduct' },
    { key: 'coordinators', label: 'Faculty & Student Leads' },
    { key: 'organizers', label: 'Organizing Team Volunteers' },
    { key: 'sponsors', label: 'Partners & Sponsor Grid' },
    { key: 'gallery', label: 'Past Moments Gallery' },
    { key: 'faq', label: 'Frequently Asked Questions' },
    { key: 'venue', label: 'Venue Map & Direction' },
    { key: 'contact', label: 'Contact & Socials Footer' },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-mono text-xl font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Branding & Visual Identity
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Configure event names, neon color palettes, logos, and toggle section visibility.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-primary hover:opacity-90 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-40"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save Branding
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identity & Prefix */}
        <div className="p-5 rounded-xl border border-white/10 bg-[#12121c] space-y-4">
          <h2 className="font-mono text-sm font-bold text-white mb-2">Edition Identity</h2>

          <div>
            <label className="block text-xs font-mono text-neutral-400 mb-1">
              Event Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-lg bg-black/40 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-neutral-400 mb-1">
              Team ID Prefix (e.g. HACKX)
            </label>
            <input
              type="text"
              value={teamIdPrefix}
              onChange={(e) => setTeamIdPrefix(e.target.value.toUpperCase())}
              required
              className="w-full px-3.5 py-2 rounded-lg bg-black/40 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-primary uppercase"
            />
            <span className="text-[10px] font-mono text-neutral-500 mt-1 block">
              Generates IDs like {teamIdPrefix || 'HACKX'}-0001
            </span>
          </div>

          {/* Color Pickers */}
          <div className="pt-2 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1">
                Neon Primary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-9 rounded cursor-pointer bg-transparent border border-white/20"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full px-2 py-1.5 rounded bg-black/40 border border-white/15 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1">
                Accent Glow Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-9 rounded cursor-pointer bg-transparent border border-white/20"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-full px-2 py-1.5 rounded bg-black/40 border border-white/15 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* Live Color Preview Pill */}
          <div className="p-3 rounded-lg border border-white/10 bg-black/60 flex items-center justify-between font-mono text-xs">
            <span className="text-neutral-400">Theme Preview:</span>
            <div className="flex items-center gap-2">
              <span
                style={{ backgroundColor: primaryColor }}
                className="px-2.5 py-1 rounded text-black font-bold text-[10px]"
              >
                Primary Accent
              </span>
              <span
                style={{ borderColor: accentColor, color: accentColor }}
                className="px-2.5 py-1 rounded border bg-white/5 text-[10px]"
              >
                Glow Accent
              </span>
            </div>
          </div>
        </div>

        {/* Assets (Logo & Favicon) */}
        <div className="p-5 rounded-xl border border-white/10 bg-[#12121c] space-y-4">
          <h2 className="font-mono text-sm font-bold text-white mb-2">Graphic Assets</h2>

          <ImageUpload
            label="Header Navbar Logo (PNG/SVG recommended)"
            value={logoUrl}
            onChange={setLogoUrl}
            eventSlug={eventData?.slug || 'hackx'}
            aspect="wide"
          />

          <ImageUpload
            label="Browser Tab Favicon (Square)"
            value={faviconUrl}
            onChange={setFaviconUrl}
            eventSlug={eventData?.slug || 'hackx'}
            aspect="square"
          />
        </div>
      </div>

      {/* Section Visibility Switches */}
      <div className="p-5 rounded-xl border border-white/10 bg-[#12121c]">
        <div className="mb-4">
          <h2 className="font-mono text-sm font-bold text-white">Public Section Toggles</h2>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Turn sections on or off on the public home page with one click.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
          {sectionKeys.map((sec) => {
            const isEnabled = sections[sec.key] !== false;
            return (
              <div
                key={sec.key}
                onClick={() => handleToggleSection(sec.key)}
                className={`p-3 rounded-xl border cursor-pointer select-none flex items-center justify-between transition-all ${
                  isEnabled
                    ? 'border-primary/40 bg-primary/5 text-white'
                    : 'border-white/5 bg-black/20 text-neutral-500'
                }`}
              >
                <div className="truncate mr-2">
                  <span className="block font-medium">{sec.label}</span>
                  <span className="text-[10px] text-neutral-400">#{sec.key}</span>
                </div>
                <div
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    isEnabled ? 'bg-primary' : 'bg-neutral-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-black transition-transform ${
                      isEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </form>
  );
}
