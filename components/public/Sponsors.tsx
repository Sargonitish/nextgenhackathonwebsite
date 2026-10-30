import Image from 'next/image';

interface SponsorItem {
  _id?: string;
  name: string;
  logoUrl?: string;
  tier?: string;
  websiteUrl?: string;
}

export default function Sponsors({
  sponsors = [],
  contactEmail = 'sponsors@hackx.dev',
}: {
  sponsors: SponsorItem[];
  contactEmail?: string;
}) {
  const placeholders = ['LOGO A', 'LOGO B', 'LOGO C', 'LOGO D'];

  return (
    <section id="sponsors" className="py-20 max-w-[1280px] mx-auto px-4 sm:px-8 border-t border-line relative z-10">
      {/* Section Label */}
      <div className="font-mono text-xs text-offwhite/50 uppercase tracking-widest mb-10">
        06 / SPONSORS
      </div>

      <h2 className="sr-only">Partners & Sponsors</h2>

      {/* Grid of Logo Slots Separated by Hairlines */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-line">
        {sponsors.length > 0
          ? sponsors.map((sponsor, idx) => (
              <div
                key={sponsor._id || idx}
                className="border-r border-b border-line p-8 h-32 flex items-center justify-center bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
              >
                {sponsor.logoUrl ? (
                  <div className="relative h-12 w-full">
                    <Image
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      fill
                      className="object-contain filter grayscale hover:grayscale-0 transition-all"
                      unoptimized
                    />
                  </div>
                ) : (
                  <span className="font-mono text-sm font-bold text-offwhite/50 tracking-wider">
                    {sponsor.name}
                  </span>
                )}
              </div>
            ))
          : placeholders.map((p, idx) => (
              <div
                key={idx}
                className="border-r border-b border-line p-8 h-32 flex items-center justify-center border-dashed bg-white/[0.01]"
              >
                <span className="font-mono text-xs text-offwhite/30 tracking-widest uppercase">
                  {p}
                </span>
              </div>
            ))}
      </div>

      {/* Become a Sponsor Mailto Link */}
      <div className="mt-8 font-mono text-xs sm:text-sm">
        <a
          href={`mailto:${contactEmail}?subject=HackX%20Sponsorship%20Inquiry`}
          className="text-yellow hover:underline underline-offset-4 tracking-wider transition-colors inline-flex items-center gap-1.5"
        >
          <span>Become a sponsor</span>
          <span>→</span>
        </a>
      </div>
    </section>
  );
}
