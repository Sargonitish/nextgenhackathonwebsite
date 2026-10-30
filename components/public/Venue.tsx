import { MapPin, Navigation } from 'lucide-react';

interface VenueProps {
  name: string;
  address: string;
  mapEmbedUrl?: string;
}

export default function Venue({ name, address, mapEmbedUrl }: VenueProps) {
  if (!name && !address) return null;

  return (
    <section id="venue" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-10 relative">
      <div className="rounded-3xl border border-white/10 bg-[#0e0f18]/85 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Details */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-xs font-semibold uppercase tracking-widest mb-4">
              <MapPin className="w-3.5 h-3.5" />
              <span>VENUE & LOCATION</span>
            </div>

            <h2 className="font-mono text-2xl sm:text-4xl font-black text-white mb-4 tracking-tight">
              {name || 'Hackathon Arena'}
            </h2>

            <p className="text-neutral-300 font-sans text-sm sm:text-base leading-relaxed mb-6">
              {address}
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-neutral-300">
              <Navigation className="w-4 h-4 text-primary shrink-0" />
              <span>Campus Security Check-in Gate 1 • Free Dedicated Parking</span>
            </div>
          </div>

          {/* Map Embed Iframe */}
          <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-white/15 bg-black/60 shadow-inner">
            {mapEmbedUrl ? (
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale contrast-125 opacity-85 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
              />
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center font-mono text-xs text-neutral-500">
                <MapPin className="w-6 h-6 mb-2 text-neutral-600" />
                <span>Map preview coordinates not configured yet</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
