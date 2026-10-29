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

export default function Tracks({ tracks = [] }: { tracks: TrackItem[] }) {
  if (tracks.length === 0) return null;

  return (
    <section id="tracks" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-xs uppercase tracking-widest mb-3">
          <Layers className="w-3.5 h-3.5" />
          <span>Innovation Tracks</span>
        </div>
        <h2 className="font-mono text-3xl sm:text-4xl font-extrabold text-white">
          Choose Your Battleground
        </h2>
        <p className="text-neutral-400 font-mono text-xs sm:text-sm mt-2">
          Select one of the dedicated tracks to build, innovate, and compete for category prizes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map((track, idx) => {
          const Icon = iconMap[track.icon] || Code;
          return (
            <div
              key={track._id || idx}
              className="p-6 rounded-2xl border border-white/10 bg-[#12121c]/90 hover:border-primary/50 hover:bg-[#151522] transition-all group backdrop-blur-md shadow-xl"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-4 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(0,255,157,0.3)] transition-all">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-mono text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                {track.title}
              </h3>
              <p className="text-neutral-400 text-xs sm:text-sm font-sans leading-relaxed">
                {track.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
