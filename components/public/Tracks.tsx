import {
  Bot,
  Shield,
  Activity,
  Cpu,
  Globe,
  Code,
  Database,
  Smartphone,
  Layers,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface TrackItem {
  _id?: string;
  title: string;
  description: string;
  icon: string;
}

const iconMap: Record<string, any> = {
  Bot,
  Shield,
  Activity,
  Cpu,
  Globe,
  Code,
  Database,
  Smartphone,
};

// Default tags for tracks to create modern dev category badges
const trackTags: Record<string, string[]> = {
  AI: ['LLMs', 'Agents', 'Neural Nets'],
  Cybersecurity: ['Zero Trust', 'Auth', 'PenTest'],
  Fintech: ['DeFi', 'Payments', 'Crypto'],
  Healthcare: ['Biotech', 'Wearables', 'Vision'],
  Web3: ['Smart Contracts', 'Solidity', 'dApps'],
  Cloud: ['Serverless', 'DevOps', 'Microservices'],
};

export default function Tracks({ tracks = [] }: { tracks: TrackItem[] }) {
  if (tracks.length === 0) return null;

  return (
    <section id="tracks" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-xs font-semibold uppercase tracking-widest mb-4 backdrop-blur-md shadow-[0_0_15px_rgba(0,255,157,0.15)]">
          <Layers className="w-3.5 h-3.5" />
          <span>INNOVATION TRACKS</span>
        </div>
        <h2 className="font-mono text-3xl sm:text-5xl font-black text-white tracking-tight">
          Choose Your Battleground
        </h2>
        <p className="text-neutral-400 font-sans text-sm sm:text-base mt-3 leading-relaxed">
          Select one of our dedicated development tracks to engineer cutting-edge solutions and compete for specialized category rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map((track, idx) => {
          const Icon = iconMap[track.icon] || Code;
          return (
            <div
              key={track._id || idx}
              className="p-7 rounded-3xl border border-white/10 bg-[#0e0f18]/80 hover:bg-[#131522]/90 hover:border-primary/50 transition-all duration-300 group backdrop-blur-xl shadow-xl flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(0,0,0,0.6),0_0_24px_rgba(0,255,157,0.15)]"
            >
              <div>
                {/* Header with Icon & Track Number */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(0,255,157,0.4)] transition-all">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="font-mono text-xs text-neutral-500 font-bold tracking-widest uppercase">
                    TRACK 0{idx + 1}
                  </span>
                </div>

                {/* Track Title */}
                <h3 className="font-mono text-xl font-bold text-white mb-2.5 group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>{track.title}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-primary" />
                </h3>

                {/* Track Description */}
                <p className="text-neutral-400 text-xs sm:text-sm font-sans leading-relaxed mb-6">
                  {track.description}
                </p>
              </div>

              {/* Bottom Track Meta / Tech Badges */}
              <div className="pt-4 border-t border-white/5 flex flex-wrap gap-1.5 font-mono text-[10px]">
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-neutral-300">
                  Open Source
                </span>
                <span className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary">
                  Prizes Eligible
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
