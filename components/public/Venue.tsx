'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

interface VenueProps {
  name?: string;
  address?: string;
  mapEmbedUrl?: string;
}

export default function Venue({
  name = 'MAIN AUDITORIUM & INNOVATION HUB',
  address = 'CAMPUS RESEARCH PARK, BLOCK 4, 3RD FLOOR',
  mapEmbedUrl,
}: VenueProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-draw]', {
          drawSVG: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '[data-venue-blueprint]',
            start: 'top 80%',
            once: true,
          },
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="venue"
      className="py-16 sm:py-20 max-w-[1280px] mx-auto px-4 sm:px-8 border-t border-line relative z-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Details */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-display font-black text-3xl sm:text-5xl text-offwhite tracking-tight">
            {name || 'MAIN AUDITORIUM & INNOVATION HUB'}
          </h2>

          <p className="font-mono text-xs sm:text-sm text-offwhite/80 tracking-wider">
            {address || 'CAMPUS RESEARCH PARK, BLOCK 4, 3RD FLOOR'}
          </p>

          <div className="pt-4">
            <a
              href={mapEmbedUrl || 'https://maps.google.com'}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs sm:text-sm text-yellow hover:underline underline-offset-4 tracking-wider inline-flex items-center gap-1.5"
            >
              <span>Get directions</span>
              <span>→</span>
            </a>
          </div>
        </div>

        {/* Right Column: Outlined Rectangle with Center Crosshair Pin */}
        <div
          data-venue-blueprint
          className="lg:col-span-5 h-64 sm:h-72 border border-line bg-white/[0.01] flex items-center justify-center relative overflow-hidden"
        >
          {/* Blueprint alignment axes */}
          <svg
            className="pointer-events-none absolute inset-0 w-full h-full text-offwhite/15"
            viewBox="0 0 400 280"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <line
              data-draw
              x1="0"
              y1="140"
              x2="400"
              y2="140"
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <line
              data-draw
              x1="200"
              y1="0"
              x2="200"
              y2="280"
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Blueprint grid coordinates */}
          <div className="absolute top-3 left-3 font-mono text-[10px] text-offwhite/65">
            LAT: 12.9716° N / LON: 77.5946° E
          </div>
          <div className="absolute bottom-3 right-3 font-mono text-[10px] text-offwhite/65">
            SECTOR A-4
          </div>

          {/* Center Crosshair Pin */}
          <div className="relative z-10 flex flex-col items-center gap-2 select-none">
            <svg
              className="w-12 h-12 text-yellow"
              viewBox="0 0 48 48"
              fill="none"
              aria-hidden="true"
            >
              <circle
                data-draw
                cx="24"
                cy="24"
                r="13"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeOpacity="0.65"
              />
              <path data-draw d="M8 14V8H14" stroke="currentColor" strokeWidth="1.25" />
              <path data-draw d="M34 8H40V14" stroke="currentColor" strokeWidth="1.25" />
              <path data-draw d="M40 34V40H34" stroke="currentColor" strokeWidth="1.25" />
              <path data-draw d="M14 40H8V34" stroke="currentColor" strokeWidth="1.25" />
              <line data-draw x1="14" y1="24" x2="34" y2="24" stroke="currentColor" strokeWidth="1.5" />
              <line data-draw x1="24" y1="14" x2="24" y2="34" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="font-mono text-[11px] text-offwhite/75 tracking-widest uppercase">
              Hackathon Arena Pin
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
