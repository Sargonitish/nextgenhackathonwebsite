import ReactMarkdown from 'react-markdown';
import { ShieldCheck, BookOpen } from 'lucide-react';

export default function Rules({ rulesText }: { rulesText: string }) {
  if (!rulesText) return null;

  return (
    <section id="rules" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto z-10 relative">
      <div className="rounded-3xl border border-white/10 bg-[#12121c]/80 backdrop-blur-xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
            Fair Play & Standards
          </span>
        </div>

        <h2 className="font-mono text-2xl sm:text-3xl font-extrabold text-white mb-6">
          Rules & Code of Conduct
        </h2>

        <div className="prose prose-invert max-w-none text-neutral-300 font-sans text-xs sm:text-sm leading-relaxed space-y-3">
          <ReactMarkdown>{rulesText}</ReactMarkdown>
        </div>
      </div>
    </section>
  );
}
