import { Trophy, Award, Gift, Sparkles } from 'lucide-react';

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
    <section id="prizes" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-10 relative">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-xs uppercase tracking-widest mb-3">
          <Trophy className="w-3.5 h-3.5" />
          <span>Reward Pool</span>
        </div>
        <h2 className="font-mono text-3xl sm:text-4xl font-extrabold text-white">
          Prizes & Accolades
        </h2>
        <p className="text-neutral-400 font-mono text-xs sm:text-sm mt-2">
          Substantial cash prizes, cloud credits, trophies, and fast-track interview opportunities.
        </p>
      </div>

      {/* Podium Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12">
        {/* 2nd Place */}
        {second && (
          <div className="p-6 rounded-2xl border border-white/10 bg-[#12121c]/90 text-center relative overflow-hidden order-2 md:order-1 hover:border-slate-400/50 transition-all shadow-xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-400/10 border border-slate-400/40 text-slate-300 font-mono font-extrabold flex items-center justify-center text-lg mb-3">
              2nd
            </div>
            <h3 className="font-mono text-lg font-bold text-white mb-1">{second.title}</h3>
            <div className="font-mono text-2xl font-black text-slate-300 mb-3">{second.amount}</div>
            <p className="text-xs text-neutral-400 font-sans">{second.perks}</p>
          </div>
        )}

        {/* 1st Place (Elevated Podium) */}
        {first && (
          <div className="p-8 rounded-2xl border-2 border-primary/60 bg-gradient-to-b from-[#161c1a] to-[#101018] text-center relative overflow-hidden order-1 md:order-2 md:-translate-y-4 hover:border-primary transition-all shadow-2xl shadow-primary/10">
            <div className="absolute top-0 right-0 bg-primary text-black font-mono font-bold text-[10px] px-3 py-1 rounded-bl-lg uppercase tracking-wider">
              Champions
            </div>
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 border border-primary text-primary font-mono font-extrabold flex items-center justify-center text-2xl mb-4 shadow-[0_0_20px_rgba(0,255,157,0.3)]">
              👑
            </div>
            <h3 className="font-mono text-xl font-bold text-white mb-1">{first.title}</h3>
            <div className="font-mono text-3xl sm:text-4xl font-black text-primary mb-3">
              {first.amount}
            </div>
            <p className="text-xs sm:text-sm text-neutral-300 font-sans">{first.perks}</p>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="p-6 rounded-2xl border border-white/10 bg-[#12121c]/90 text-center relative overflow-hidden order-3 hover:border-amber-700/50 transition-all shadow-xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-700/10 border border-amber-700/40 text-amber-500 font-mono font-extrabold flex items-center justify-center text-lg mb-3">
              3rd
            </div>
            <h3 className="font-mono text-lg font-bold text-white mb-1">{third.title}</h3>
            <div className="font-mono text-2xl font-black text-amber-500 mb-3">{third.amount}</div>
            <p className="text-xs text-neutral-400 font-sans">{third.perks}</p>
          </div>
        )}
      </div>

      {/* Special Prizes Grid */}
      {specials.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {specials.map((sp, idx) => (
            <div
              key={sp._id || idx}
              className="p-5 rounded-xl border border-white/10 bg-[#12121c]/70 flex items-center justify-between gap-4"
            >
              <div>
                <span className="text-[10px] font-mono text-accent uppercase tracking-wider font-bold">
                  Special Award
                </span>
                <h4 className="font-mono text-sm font-bold text-white">{sp.title}</h4>
                <p className="text-xs text-neutral-400 font-sans mt-0.5">{sp.perks}</p>
              </div>
              <div className="font-mono text-lg font-extrabold text-accent flex-shrink-0">
                {sp.amount}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
