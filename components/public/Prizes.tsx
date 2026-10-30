interface PrizeItem {
  _id?: string;
  position: string;
  title: string;
  amount: string;
  perks?: string;
}

export default function Prizes({ prizes = [] }: { prizes: PrizeItem[] }) {
  // Extract or fall back to blueprint defaults
  const first: PrizeItem = prizes.find((p) => p.position === '1st') || {
    position: '1st',
    title: 'First Place Overall',
    amount: '₹50,000',
    perks: 'Trophy, cloud credits, direct interview fast-track.',
  };
  const second: PrizeItem = prizes.find((p) => p.position === '2nd') || {
    position: '2nd',
    title: 'Second Place',
    amount: '₹30,000',
    perks: 'Runner-up trophy and hardware dev kits.',
  };
  const third: PrizeItem = prizes.find((p) => p.position === '3rd') || {
    position: '3rd',
    title: 'Third Place',
    amount: '₹15,000',
    perks: 'Trophy and software subscriptions.',
  };

  const specials = prizes.filter((p) => !['1st', '2nd', '3rd'].includes(p.position));

  return (
    <section id="prizes" className="py-20 max-w-[1280px] mx-auto px-4 sm:px-8 border-t border-line relative z-10">
      {/* Section Label */}
      <div className="font-mono text-xs text-offwhite/50 uppercase tracking-widest mb-10">
        03 / PRIZES
      </div>

      <h2 className="sr-only">Prize Pool & Awards</h2>

      {/* Asymmetric Staggered Layout (NOT 3 Identical Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        {/* 1st Place (Takes 55% Width, Taller & Heroic) */}
        <div className="lg:col-span-7 border border-line p-8 sm:p-12 bg-white/[0.01] flex flex-col justify-between min-h-[380px] relative">
          <div className="flex items-start justify-between">
            {/* Oversized 140px-180px Numeral */}
            <div className="font-display font-black text-8xl sm:text-[160px] text-yellow leading-none select-none">
              1
            </div>
            <div className="font-mono text-xs uppercase tracking-widest text-yellow border border-yellow px-3 py-1">
              GRAND CHAMPION
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-line">
            <div className="font-mono text-3xl sm:text-5xl font-bold text-offwhite tracking-tight">
              {first.amount}
            </div>
            <div className="font-mono text-sm sm:text-base text-offwhite/80 font-semibold mt-1">
              {first.title}
            </div>
            {first.perks && (
              <div className="font-mono text-xs text-offwhite/50 mt-2">
                {first.perks}
              </div>
            )}
          </div>
        </div>

        {/* 2nd & 3rd Place (Stacked / Offset in remaining 45% width) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* 2nd Place */}
          <div className="border border-line p-6 sm:p-8 bg-white/[0.01] flex items-center justify-between gap-6">
            <div className="font-display font-black text-6xl sm:text-8xl text-offwhite/40 leading-none select-none shrink-0">
              2
            </div>
            <div className="text-right">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-offwhite">
                {second.amount}
              </div>
              <div className="font-mono text-xs sm:text-sm text-offwhite/80 font-semibold mt-0.5">
                {second.title}
              </div>
              {second.perks && (
                <div className="font-mono text-[11px] text-offwhite/50 mt-1">
                  {second.perks}
                </div>
              )}
            </div>
          </div>

          {/* 3rd Place */}
          <div className="border border-line p-6 sm:p-8 bg-white/[0.01] flex items-center justify-between gap-6">
            <div className="font-display font-black text-6xl sm:text-8xl text-offwhite/40 leading-none select-none shrink-0">
              3
            </div>
            <div className="text-right">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-offwhite">
                {third.amount}
              </div>
              <div className="font-mono text-xs sm:text-sm text-offwhite/80 font-semibold mt-0.5">
                {third.title}
              </div>
              {third.perks && (
                <div className="font-mono text-[11px] text-offwhite/50 mt-1">
                  {third.perks}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Special Category Prizes in a Mono Row separated by | */}
      <div className="pt-6 border-t border-line font-mono text-xs sm:text-sm text-offwhite/70 flex flex-wrap items-center gap-3 sm:gap-6">
        <span className="text-offwhite font-bold uppercase tracking-wider">CATEGORY BOUNTIES:</span>
        {specials.length > 0 ? (
          specials.map((s, idx) => (
            <span key={s._id || idx} className="flex items-center gap-3">
              <span>{s.title} ({s.amount})</span>
              {idx < specials.length - 1 && <span className="text-line">|</span>}
            </span>
          ))
        ) : (
          <>
            <span>Best Autonomous UI/UX ₹5,000</span>
            <span className="text-line">|</span>
            <span>Best Web3 Agent Solver ₹5,000</span>
            <span className="text-line">|</span>
            <span>Freshers Team Bounty ₹5,000</span>
          </>
        )}
      </div>
    </section>
  );
}
