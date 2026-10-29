'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileText, Save, RefreshCw, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ContentPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event') || '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventData, setEventData] = useState<any>(null);

  // Content State
  const [heroTitle, setHeroTitle] = useState('');
  const [heroTagline, setHeroTagline] = useState('');
  const [typingWords, setTypingWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState('');

  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [rulesText, setRulesText] = useState('');

  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [mapEmbedUrl, setMapEmbedUrl] = useState('');

  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [socials, setSocials] = useState({
    instagram: '',
    linkedin: '',
    twitter: '',
    website: '',
    whatsapp: '',
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
            const c = target.content || {};
            setHeroTitle(c.heroTitle || '');
            setHeroTagline(c.heroTagline || '');
            setTypingWords(c.typingWords || []);
            setAboutTitle(c.aboutTitle || '');
            setAboutText(c.aboutText || '');
            setRulesText(c.rulesText || '');
            setVenueName(c.venueName || '');
            setVenueAddress(c.venueAddress || '');
            setMapEmbedUrl(c.mapEmbedUrl || '');
            setContactEmail(c.contactEmail || '');
            setContactPhone(c.contactPhone || '');
            setSocials({
              instagram: c.socials?.instagram || '',
              linkedin: c.socials?.linkedin || '',
              twitter: c.socials?.twitter || '',
              website: c.socials?.website || '',
              whatsapp: c.socials?.whatsapp || '',
            });
          }
        }
      } catch (err) {
        console.error('Failed to load content:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [eventId]);

  const handleAddWord = () => {
    if (!newWord.trim()) return;
    if (typingWords.includes(newWord.trim())) {
      toast.error('Word already added');
      return;
    }
    setTypingWords([...typingWords, newWord.trim()]);
    setNewWord('');
  };

  const handleRemoveWord = (word: string) => {
    setTypingWords(typingWords.filter((w) => w !== word));
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
          section: 'content',
          data: {
            heroTitle,
            heroTagline,
            typingWords,
            aboutTitle,
            aboutText,
            rulesText,
            venueName,
            venueAddress,
            mapEmbedUrl,
            contactEmail,
            contactPhone,
            socials,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || 'Failed to update content');
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
        Loading content fields...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-5xl mx-auto font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Site Content & Copywriting
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Customize hero banners, typing cycles, about text, rules markdown, and venue coordinates.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-primary hover:opacity-90 text-black font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-40"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save Content
        </button>
      </div>

      {/* Hero Section */}
      <div className="p-5 rounded-xl border border-white/10 bg-[#12121c] space-y-4">
        <h2 className="text-sm font-bold text-white">Hero Header & Tagline</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-neutral-400 mb-1">Hero Main Title</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Hero Subtitle / Tagline</label>
            <input
              type="text"
              value={heroTagline}
              onChange={(e) => setHeroTagline(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Typing Animation Words */}
        <div>
          <label className="block text-neutral-400 mb-1">
            Typing Animation Words (cycled sequentially in Hero)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {typingWords.map((word) => (
              <span
                key={word}
                className="px-2.5 py-1 rounded-lg bg-white/10 text-white flex items-center gap-1.5"
              >
                {word}
                <button
                  type="button"
                  onClick={() => handleRemoveWord(word)}
                  className="hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddWord();
                }
              }}
              placeholder="e.g. Build Autonomous AI"
              className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={handleAddWord}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* About & Rules Markdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl border border-white/10 bg-[#12121c] space-y-3">
          <h2 className="text-sm font-bold text-white">About Section</h2>
          <div>
            <label className="block text-neutral-400 mb-1">About Title</label>
            <input
              type="text"
              value={aboutTitle}
              onChange={(e) => setAboutTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-neutral-400 mb-1">About Story & Description</label>
            <textarea
              rows={8}
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary font-mono"
            />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-white/10 bg-[#12121c] space-y-3">
          <h2 className="text-sm font-bold text-white">Rules & Code of Conduct (Markdown)</h2>
          <label className="block text-neutral-400 mb-1">
            Markdown formatted guidelines for participants
          </label>
          <textarea
            rows={11}
            value={rulesText}
            onChange={(e) => setRulesText(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary font-mono text-[11px]"
          />
        </div>
      </div>

      {/* Venue & Map Coordinates */}
      <div className="p-5 rounded-xl border border-white/10 bg-[#12121c] space-y-4">
        <h2 className="text-sm font-bold text-white">Venue & Location</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-neutral-400 mb-1">Venue Hall / Building</label>
            <input
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Physical Address</label>
            <input
              type="text"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-neutral-400 mb-1">
            Google Maps Embed IFrame URL (src attribute)
          </label>
          <input
            type="url"
            value={mapEmbedUrl}
            onChange={(e) => setMapEmbedUrl(e.target.value)}
            placeholder="https://www.google.com/maps/embed?pb=..."
            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Contact & Social Links */}
      <div className="p-5 rounded-xl border border-white/10 bg-[#12121c] space-y-4">
        <h2 className="text-sm font-bold text-white">Contact & Social Channels</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-neutral-400 mb-1">Official Contact Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Helpdesk Phone Number</label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-neutral-400 mb-1">Instagram URL</label>
            <input
              type="url"
              value={socials.instagram}
              onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">LinkedIn URL</label>
            <input
              type="url"
              value={socials.linkedin}
              onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Twitter / X URL</label>
            <input
              type="url"
              value={socials.twitter}
              onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
