import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

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
  const placeholders = ['SPONSOR LOGO 01', 'SPONSOR LOGO 02', 'SPONSOR LOGO 03', 'SPONSOR LOGO 04'];

  return (
    <section id="sponsors" className="py-20 max-w-[1280px] mx-auto px-4 sm:px-8 border-t border-line relative z-10">
      {/* Section Header */}
      <div className="flex items-center justify-between font-mono text-xs text-offwhite/50 uppercase tracking-widest mb-8">
        <div>07 / PARTNERS &amp; SPONSORS</div>
        <div className="hidden sm:inline">[INDUSTRY BACKERS // CLOUD CREDITS]</div>
      </div>

      <div className="mb-10">
        <h2 className="font-display text-2xl sm:text-3xl font-black text-offwhite uppercase tracking-tight">
          POWERED BY INDUSTRY LEADERS
        </h2>
        <p className="font-mono text-xs sm:text-sm text-offwhite/70 mt-2 max-w-2xl leading-relaxed">
          Generous organizations backing student engineers with cloud computing grants, APIs, hardware dev kits, and hiring bounties.
        </p>
      </div>

      {/* Grid of Logo Slots Separated by Hairlines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-line bg-navy">
        {sponsors.length > 0
          ? sponsors.map((sponsor, idx) => {
              const cardContent = (
                <div className="w-full h-full p-6 flex flex-col items-center justify-between relative group">
                  {/* Blueprint Corner Accents */}
                  <span className="absolute top-2 left-2 text-[10px] text-yellow/40 select-none group-hover:text-yellow transition-colors">+</span>
                  <span className="absolute top-2 right-2 text-[10px] text-yellow/40 select-none group-hover:text-yellow transition-colors">+</span>

                  {/* Tier Stamp / Metadata */}
                  <div className="w-full flex items-center justify-between font-mono text-[10px] text-offwhite/40 mb-2">
                    <span className="uppercase text-yellow font-bold tracking-wider">
                      {sponsor.tier ? `[ ${sponsor.tier} ]` : `[ PARTNER 0${idx + 1} ]`}
                    </span>
                    {sponsor.websiteUrl && (
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-yellow transition-opacity" />
                    )}
                  </div>

                  {/* Enlarged High-Visibility Logo Slot (h-24 sm:h-28) */}
                  <div className="relative w-full h-24 sm:h-28 flex items-center justify-center my-auto px-4">
                    {sponsor.logoUrl ? (
                      <div className="relative w-full h-full max-w-[240px]">
                        <Image
                          src={sponsor.logoUrl}
                          alt={sponsor.name}
                          fill
                          className="object-contain transition-transform duration-300 group-hover:scale-105"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <span className="font-mono text-base font-bold text-offwhite tracking-wider text-center">
                        {sponsor.name}
                      </span>
                    )}
                  </div>

                  {/* Sponsor Name Footnote */}
                  <div className="w-full text-center mt-2 border-t border-line/40 pt-2 font-mono text-[11px] text-offwhite/60 group-hover:text-yellow transition-colors truncate">
                    {sponsor.name}
                  </div>
                </div>
              );

              return (
                <div
                  key={sponsor._id || idx}
                  className="border-r border-b border-line h-48 sm:h-56 bg-[#0c223f]/80 hover:bg-[#102b4e] hover:border-yellow transition-all duration-150 flex items-center justify-center shadow-hard-sm"
                >
                  {sponsor.websiteUrl ? (
                    <a
                      href={sponsor.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-full block cursor-pointer"
                      title={`Visit ${sponsor.name}`}
                    >
                      {cardContent}
                    </a>
                  ) : (
                    cardContent
                  )}
                </div>
              );
            })
          : placeholders.map((p, idx) => (
              <div
                key={idx}
                className="border-r border-b border-line p-6 h-48 sm:h-56 flex flex-col items-center justify-center border-dashed bg-white/[0.01]"
              >
                <span className="text-yellow/40 text-xs mb-2">+</span>
                <span className="font-mono text-xs text-offwhite/40 tracking-widest uppercase">
                  {p}
                </span>
                <span className="text-[10px] text-offwhite/30 font-mono mt-1">AVAILABLE SLOT</span>
              </div>
            ))}
      </div>

      {/* Become a Sponsor Callout Link */}
      <div className="mt-8 font-mono text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-line/40">
        <a
          href={`mailto:${contactEmail}?subject=HackX%20Sponsorship%20Inquiry`}
          className="text-yellow hover:underline underline-offset-4 tracking-wider transition-colors inline-flex items-center gap-2 font-bold uppercase"
        >
          <span>BECOME AN OFFICIAL SPONSOR</span>
          <span>→</span>
        </a>
        <span className="text-offwhite/40 text-xs">
          Direct outreach: <span className="text-offwhite/70">{contactEmail}</span>
        </span>
      </div>
    </section>
  );
}
