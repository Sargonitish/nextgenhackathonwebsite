'use client';

import ScrambleText from '@/components/shared/ScrambleText';

interface TrackItem {
  _id?: string;
  title: string;
  description: string;
  icon?: string;
}

export default function Tracks({ tracks = [] }: { tracks: TrackItem[] }) {
  // Fallback default tracks if database has empty list
  const displayTracks: TrackItem[] =
    tracks.length > 0
      ? tracks
      : [
          {
            title: 'Autonomous Software Engineers',
            description: 'Agents that plan, write code, run unit tests, and resolve bugs end-to-end.',
          },
          {
            title: 'Decentralized Intelligence & Web3',
            description: 'Autonomous financial agents, smart contract auditing swarms, and on-chain solvers.',
          },
          {
            title: 'Local & Edge Machine Learning',
            description: 'Quantized neural networks, tiny models, and privacy-first local agents on consumer chips.',
          },
          {
            title: 'Physical & Cyber Hardware Systems',
            description: 'Autonomous robotics, embedded agents, sensor telemetry, and automation controllers.',
          },
        ];

  return (
    <section id="tracks" className="py-20 max-w-[1280px] mx-auto px-4 sm:px-8 border-t border-line relative z-10">
      {/* Section Label */}
      <div className="font-mono text-xs text-offwhite/50 uppercase tracking-widest mb-8">
        01 / TRACKS
      </div>

      <h2 className="sr-only">Innovation Tracks</h2>

      {/* Numbered Rows List (NOT Cards) */}
      <div className="border-b border-line">
        {displayTracks.map((track, idx) => {
          const trackNum = String(idx + 1).padStart(2, '0');
          return (
            <div
              key={track._id || idx}
              className="group border-t border-line py-8 sm:py-10 px-2 sm:px-6 transition-all duration-200 hover:bg-white/[0.03] flex items-center justify-between gap-6 cursor-default"
            >
              {/* Left: Track Number */}
              <div className="font-display font-black text-3xl sm:text-5xl text-offwhite/40 group-hover:text-yellow transition-colors shrink-0">
                <ScrambleText text={trackNum} trigger="hover" durationMs={320} />
              </div>

              {/* Middle: Title & Description */}
              <div className="flex-1 pr-4">
                <h3 className="font-display font-bold text-xl sm:text-3xl text-offwhite group-hover:text-yellow transition-colors">
                  <ScrambleText text={track.title} trigger="hover" durationMs={380} />
                </h3>
                <p className="mt-1.5 font-mono text-xs sm:text-sm text-offwhite/60 leading-relaxed max-w-3xl">
                  {track.description}
                </p>
              </div>

              {/* Right: Sliding Arrow */}
              <div className="font-mono text-2xl text-offwhite/40 group-hover:text-yellow group-hover:translate-x-2 transition-all shrink-0">
                →
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
