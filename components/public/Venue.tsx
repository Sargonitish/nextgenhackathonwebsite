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
  return (
    <section id="venue" className="py-20 max-w-[1280px] mx-auto px-4 sm:px-8 border-t border-line relative z-10">
      {/* Section Label */}
      <div className="font-mono text-xs text-offwhite/50 uppercase tracking-widest mb-10">
        08 / VENUE
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Details */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-display font-black text-3xl sm:text-5xl text-offwhite tracking-tight">
            {name || 'MAIN AUDITORIUM & INNOVATION HUB'}
          </h2>

          <p className="font-mono text-xs sm:text-sm text-offwhite/70 tracking-wider">
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
        <div className="lg:col-span-5 h-64 sm:h-72 border border-line bg-white/[0.01] flex items-center justify-center relative overflow-hidden">
          {/* Subtle blueprint grid coordinates */}
          <div className="absolute top-3 left-3 font-mono text-[10px] text-offwhite/30">
            LAT: 12.9716° N / LON: 77.5946° E
          </div>
          <div className="absolute bottom-3 right-3 font-mono text-[10px] text-offwhite/30">
            [ SECTOR A-4 ]
          </div>

          {/* Center Crosshair '+' Pin */}
          <div className="flex flex-col items-center gap-2 select-none">
            <div className="w-8 h-8 flex items-center justify-center text-yellow font-mono text-2xl font-light">
              +
            </div>
            <span className="font-mono text-[11px] text-offwhite/50 tracking-widest uppercase">
              HACKATHON ARENA PIN
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
