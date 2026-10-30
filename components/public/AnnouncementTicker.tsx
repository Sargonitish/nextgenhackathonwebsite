'use client';

import { useState, useEffect } from 'react';

interface Announcement {
  _id: string;
  message: string;
}

export default function AnnouncementTicker() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

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
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-2 flex items-center gap-4 overflow-hidden">
        {/* Live Broadcast Badge */}
        <div className="flex items-center gap-2 px-2.5 py-0.5 border border-yellow bg-yellow/10 text-yellow text-[11px] font-bold uppercase tracking-wider shrink-0 select-none">
          <span className="w-1.5 h-1.5 bg-yellow animate-pulse" />
          <span>BROADCAST</span>
        </div>

        {/* Marquee message loop */}
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="inline-block animate-marquee text-xs text-offwhite/80">
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
      `}</style>
    </div>
  );
}
