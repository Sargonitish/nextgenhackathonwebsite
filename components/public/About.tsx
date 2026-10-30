import { Sparkles, Terminal } from 'lucide-react';

interface AboutProps {
  title: string;
  text: string;
}

export default function About({ title, text }: AboutProps) {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto z-10 relative">
      <div className="rounded-3xl border border-white/10 bg-[#0e0f18]/85 backdrop-blur-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-xs font-semibold uppercase tracking-widest mb-4">
          <Terminal className="w-3.5 h-3.5" />
          <span>ABOUT THE HACKATHON</span>
        </div>

        <h2 className="font-mono text-2xl sm:text-4xl font-black text-white mb-6 tracking-tight">
          {title || 'About HackX'}
        </h2>

        <div className="text-neutral-300 font-sans text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4">
          {text}
        </div>
      </div>
    </section>
  );
}
