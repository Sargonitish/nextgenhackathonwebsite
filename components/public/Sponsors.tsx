import Image from 'next/image';
import { BadgeDollarSign } from 'lucide-react';

interface SponsorItem {
  _id?: string;
  name: string;
  logoUrl: string;
  website?: string;
  tier: string;
}

export default function Sponsors({ sponsors = [] }: { sponsors: SponsorItem[] }) {
  if (sponsors.length === 0) return null;

  return (
    <section id="sponsors" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-10 relative">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-xs uppercase tracking-widest mb-3">
          <BadgeDollarSign className="w-3.5 h-3.5" />
          <span>Ecosystem Backers</span>
        </div>
        <h2 className="font-mono text-3xl sm:text-4xl font-extrabold text-white">
          Sponsors & Partners
        </h2>
        <p className="text-neutral-400 font-mono text-xs sm:text-sm mt-2">
          Backed by leading global technology infrastructure providers and developer communities.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {sponsors.map((s, idx) => {
          const Content = (
            <div className="p-6 rounded-2xl border border-white/10 bg-[#12121c]/70 hover:border-primary/40 hover:bg-[#161624] transition-all flex flex-col items-center justify-center text-center group h-36">
              <div className="relative w-36 h-14 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all">
                <Image
                  src={s.logoUrl}
                  alt={s.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-[10px] font-mono text-neutral-500 mt-2 block group-hover:text-primary transition-colors">
                {s.tier || s.name}
              </span>
            </div>
          );

          return s.website ? (
            <a
              key={s._id || idx}
              href={s.website}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              {Content}
            </a>
          ) : (
            <div key={s._id || idx}>{Content}</div>
          );
        })}
      </div>
    </section>
  );
}
