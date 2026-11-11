'use client';

import { useState, useEffect } from 'react';
import { Pause, Play } from 'lucide-react';

interface Announcement {
  _id: string;
  message: string;
}

export default function AnnouncementTicker() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/public/announcements');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch {
      // Silent error for public ticker
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 20000);
    return () => clearInterval(interval);
  }, []);

  if (announcements.length === 0) return null;

  return (
    <div className="relative z-30 w-full border-b border-line bg-navy/90 font-mono">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-2 flex items-center gap-3 sm:gap-4 overflow-hidden">
        {/* Live Broadcast Badge */}
        <div className="flex items-center gap-2 px-2.5 py-0.5 border border-yellow bg-yellow/10 text-yellow text-[11px] font-bold uppercase tracking-wider shrink-0 select-none">
          <span className="w-1.5 h-1.5 bg-yellow animate-pulse motion-reduce:animate-none" />
          <span>BROADCAST</span>
        </div>

        {/* WCAG 2.2.2 Pause / Play control for scrolling ticker */}
        <button
          type="button"
          onClick={() => setIsPaused((prev) => !prev)}
          aria-label={isPaused ? 'Resume live announcements' : 'Pause live announcements'}
          className="px-2 py-0.5 border border-line text-offwhite/75 hover:border-yellow hover:text-yellow transition-colors inline-flex items-center gap-1 text-[10px] uppercase tracking-wider shrink-0 cursor-pointer motion-reduce:hidden"
        >
          {isPaused ? (
            <>
              <Play className="w-2.5 h-2.5" aria-hidden="true" />
              <span>Play</span>
            </>
          ) : (
            <>
              <Pause className="w-2.5 h-2.5" aria-hidden="true" />
              <span>Pause</span>
            </>
          )}
        </button>

        {/* Marquee message loop */}
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div
            className="inline-block animate-marquee text-xs text-offwhite/80"
            style={isPaused ? { animationPlayState: 'paused' } : undefined}
          >
            {announcements.map((a) => (
              <span key={a._id} className="mx-6 tracking-wide">
                &gt;&gt; <span className="text-offwhite font-bold">{a.message}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
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
          animation: marquee 28s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none;
            transform: none;
            white-space: normal;
          }
        }
      `}</style>
    </div>
  );
}
