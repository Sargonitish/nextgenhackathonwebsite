import { Trophy, Award, Gift, Sparkles, Crown, Medal } from 'lucide-react';

interface PrizeItem {
  _id?: string;
  position: string;
  title: string;
  amount: string;
  perks?: string;
}

export default function Prizes({ prizes = [] }: { prizes: PrizeItem[] }) {
  if (prizes.length === 0) return null;

  const first = prizes.find((p) => p.position === '1st');
  const second = prizes.find((p) => p.position === '2nd');
  const third = prizes.find((p) => p.position === '3rd');
  const specials = prizes.filter((p) => !['1st', '2nd', '3rd'].includes(p.position));

  return (
    <section id="prizes" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-10 relative">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-xs font-semibold uppercase tracking-widest mb-4 backdrop-blur-md shadow-[0_0_15px_rgba(0,255,157,0.15)]">
          <Trophy className="w-3.5 h-3.5" />
          <span>REWARD POOL</span>
        </div>
        <h2 className="font-mono text-3xl sm:text-5xl font-black text-white tracking-tight">
          Prizes & Accolades
        </h2>
        <p className="text-neutral-400 font-sans text-sm sm:text-base mt-3 leading-relaxed">
          Massive cash rewards, cloud credits, trophies, and fast-tracked engineering interview pipelines.
        </p>
      </div>

      {/* 3D Podium Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12">
        {/* 2nd Place: Platinum Silver */}
        {second && (
          <div className="p-7 rounded-3xl border border-slate-500/30 bg-gradient-to-b from-[#131522] to-[#0c0d16] text-center relative overflow-hidden order-2 md:order-1 hover:border-slate-400/60 transition-all duration-300 shadow-2xl hover:-translate-y-2 group">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-slate-400 to-transparent" />
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-400/10 border border-slate-400/30 text-slate-200 font-mono font-black flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              🥈
            </div>
            <span className="font-mono text-[11px] font-bold text-slate-400 tracking-widest uppercase">
              Runner Up
            </span>
            <h3 className="font-mono text-lg font-bold text-white mb-2">{second.title}</h3>
            <div className="font-mono text-3xl font-black text-slate-200 mb-3 drop-shadow-[0_0_12px_rgba(203,213,225,0.3)]">
              {second.amount}
            </div>
            {second.perks && (
              <p className="text-xs text-neutral-400 font-sans leading-relaxed border-t border-white/5 pt-3">
                {second.perks}
              </p>
            )}
          </div>
        )}

        {/* 1st Place: Elevated Grand Champions (Gold & Emerald Aura) */}
        {first && (
          <div className="p-9 rounded-3xl border-2 border-primary/70 bg-gradient-to-b from-[#18241d] via-[#10151c] to-[#0a0c12] text-center relative overflow-hidden order-1 md:order-2 md:-translate-y-6 hover:border-primary transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(0,255,157,0.25)] group">
            {/* Holographic Top Banner */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-primary text-black font-mono font-black text-[11px] px-4 py-1.5 rounded-bl-xl uppercase tracking-wider shadow-md">
              👑 Grand Champion
            </div>

            <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/20 border border-primary text-primary font-mono font-black flex items-center justify-center text-3xl mb-4 shadow-[0_0_30px_rgba(0,255,157,0.45)] group-hover:scale-110 transition-transform">
              👑
            </div>

            <span className="font-mono text-xs font-black text-primary tracking-widest uppercase">
              First Place Overall
            </span>
            <h3 className="font-mono text-2xl font-black text-white mt-1 mb-2">
              {first.title}
            </h3>
            <div className="font-mono text-4xl sm:text-5xl font-black text-primary mb-4 drop-shadow-[0_0_20px_rgba(0,255,157,0.5)]">
              {first.amount}
            </div>
            {first.perks && (
              <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed border-t border-primary/20 pt-4">
                {first.perks}
              </p>
            )}
          </div>
        )}

        {/* 3rd Place: Cyber Bronze */}
        {third && (
          <div className="p-7 rounded-3xl border border-amber-600/30 bg-gradient-to-b from-[#18131d] to-[#0c0d16] text-center relative overflow-hidden order-3 hover:border-amber-500/60 transition-all duration-300 shadow-2xl hover:-translate-y-2 group">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-600/10 border border-amber-600/30 text-amber-300 font-mono font-black flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              🥉
            </div>
            <span className="font-mono text-[11px] font-bold text-amber-400 tracking-widest uppercase">
              Second Runner Up
            </span>
            <h3 className="font-mono text-lg font-bold text-white mb-2">{third.title}</h3>
            <div className="font-mono text-3xl font-black text-amber-300 mb-3 drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              {third.amount}
            </div>
            {third.perks && (
              <p className="text-xs text-neutral-400 font-sans leading-relaxed border-t border-white/5 pt-3">
                {third.perks}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Special Category Rewards (Bento Grid) */}
      {specials.length > 0 && (
        <div className="mt-14">
          <h4 className="font-mono text-lg font-bold text-white text-center mb-6 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Category Awards & Track Bounties</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {specials.map((item, idx) => (
              <div
                key={item._id || idx}
                className="p-5 rounded-2xl border border-white/10 bg-[#0e0f18]/80 hover:border-primary/40 backdrop-blur-md transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-mono text-xs text-neutral-400 uppercase font-semibold">
                    {item.position || 'Special'}
                  </div>
                  <div className="font-mono text-sm font-bold text-white">{item.title}</div>
                  {item.perks && (
                    <div className="text-[11px] text-neutral-400 font-sans mt-0.5">
                      {item.perks}
                    </div>
                  )}
                </div>
                <div className="font-mono text-lg font-black text-primary pl-4">
                  {item.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
