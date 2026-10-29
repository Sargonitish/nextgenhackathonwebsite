'use client';

import { useState, useEffect } from 'react';
import FlipCountdown from '@/components/public/FlipCountdown';
import { Megaphone, Maximize, Minimize, Sparkles } from 'lucide-react';

interface AnnouncementItem {
  _id: string;
  message: string;
  createdAt: string;
}

export default function LiveProjectorPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [fullscreen, setFullscreen] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/public/announcements');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 20000); // 20s poll
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setFullscreen(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#07070c] text-white flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden select-none">
      {/* Background Matrix / Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(0,255,157,0.08)_0%,transparent_60%)] -z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />

      {/* Top Header Bar */}
      <header className="flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-mono font-bold text-lg">
            ⚡
          </div>
          <div>
            <h1 className="font-mono font-extrabold text-xl tracking-tight text-white uppercase">
              HackX 2026 • Live Stage Display
            </h1>
            <span className="font-mono text-xs text-primary flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              Auditorium Synchronized
            </span>
          </div>
        </div>

        <button
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
          className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
        >
          {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </header>

      {/* Center Giant Flip Timer */}
      <main className="my-auto py-12 flex flex-col items-center justify-center z-10 scale-95 sm:scale-105 md:scale-125 transition-transform">
        <FlipCountdown size="xl" showProgress={true} />
      </main>

      {/* Bottom Live Announcement Marquee */}
      <footer className="z-20 w-full max-w-6xl mx-auto">
        {announcements.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-3 flex items-center gap-3 overflow-hidden shadow-2xl">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-black font-mono font-bold text-xs uppercase tracking-wider flex-shrink-0">
              <Megaphone className="w-4 h-4" />
              <span>Announcements</span>
            </div>

            <div className="overflow-hidden whitespace-nowrap flex-1">
              <div className="inline-block animate-marquee font-mono text-sm text-neutral-200">
                {announcements.map((a, idx) => (
                  <span key={a._id} className="mx-8">
                    🔥 {a.message}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </footer>

      {/* Keyframe Marquee Animation */}
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
