import ReactMarkdown from 'react-markdown';
import { ShieldCheck } from 'lucide-react';

export default function Rules({ rulesText }: { rulesText: string }) {
  if (!rulesText) return null;

  return (
    <section id="rules" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto z-10 relative">
      <div className="rounded-3xl border border-white/10 bg-[#0e0f18]/85 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
        <div className="absolute top-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-xs font-semibold uppercase tracking-widest mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>FAIR PLAY & STANDARDS</span>
        </div>

        <h2 className="font-mono text-2xl sm:text-4xl font-black text-white mb-6 tracking-tight">
          Rules & Code of Conduct
        </h2>

        <div className="prose prose-invert max-w-none text-neutral-300 font-sans text-xs sm:text-sm leading-relaxed space-y-3">
          <ReactMarkdown>{rulesText}</ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
