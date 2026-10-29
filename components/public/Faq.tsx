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
    <section id="faqs" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto z-10 relative">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-xs uppercase tracking-widest mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Knowledge Base</span>
        </div>
        <h2 className="font-mono text-3xl sm:text-4xl font-extrabold text-white">
          Frequently Asked Questions
        </h2>
        <p className="text-neutral-400 font-mono text-xs sm:text-sm mt-2">
          Everything you need to know about eligibility, food, hardware, and event guidelines.
        </p>
      </div>

      <div className="space-y-3 font-mono">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq._id || idx}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isOpen
                  ? 'border-primary/40 bg-[#141420] shadow-lg shadow-primary/5'
                  : 'border-white/10 bg-[#12121c]/70 hover:border-white/20'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-primary flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-neutral-300 font-sans leading-relaxed border-t border-white/5">
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
