'use client';

import { useState, useEffect } from 'react';
import { Megaphone } from 'lucide-react';

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
      // Silent error for public ticker polling
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 20000); // 20s poll
    return () => clearInterval(interval);
  }, []);

  if (announcements.length === 0) return null;

  return (
    <div className="relative z-30 w-full border-b border-primary/20 bg-black/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-mono text-xs font-semibold uppercase tracking-wider flex-shrink-0">
          <Megaphone className="w-3.5 h-3.5" />
          <span>Live Alert</span>
        </div>

        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="inline-block animate-marquee font-mono text-xs text-neutral-300">
            {announcements.map((a) => (
              <span key={a._id} className="mx-6">
                ⚡ {a.message}
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
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
