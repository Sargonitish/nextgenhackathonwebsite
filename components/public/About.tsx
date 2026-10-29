import { Sparkles, Terminal } from 'lucide-react';

interface AboutProps {
  title: string;
  text: string;
}

export default function About({ title, text }: AboutProps) {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto z-10 relative">
      <div className="rounded-3xl border border-white/10 bg-[#12121c]/80 backdrop-blur-xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
            About The Marathon
          </span>
        </div>

        <h2 className="font-mono text-2xl sm:text-3xl font-extrabold text-white mb-6">
          {title || 'About HackX'}
        </h2>

        <div className="prose prose-invert max-w-none text-neutral-300 font-sans text-sm sm:text-base leading-relaxed whitespace-pre-line">
          {text}
        </div>
      </div>
    </section>
  );
}
