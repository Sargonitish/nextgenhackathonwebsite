'use client';

import { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface FaqItem {
  _id?: string;
  question: string;
  answer: string;
}

export default function Faq({ faqs = [] }: { faqs: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (faqs.length === 0) return null;

  return (
    <section id="faqs" className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto z-10 relative">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-xs font-semibold uppercase tracking-widest mb-4 backdrop-blur-md shadow-[0_0_15px_rgba(0,255,157,0.15)]">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>KNOWLEDGE BASE</span>
        </div>
        <h2 className="font-mono text-3xl sm:text-5xl font-black text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-neutral-400 font-sans text-sm sm:text-base mt-3 leading-relaxed">
          Everything you need to know about eligibility, logistics, food, accommodations, and hackathon guidelines.
        </p>
      </div>

      <div className="space-y-4 font-mono">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq._id || idx}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-xl ${
                isOpen
                  ? 'border-primary/50 bg-[#121422] shadow-[0_8px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(0,255,157,0.1)]'
                  : 'border-white/10 bg-[#0e0f18]/80 hover:border-white/20'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-primary flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed border-t border-white/5">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
