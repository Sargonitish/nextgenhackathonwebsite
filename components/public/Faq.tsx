'use client';

import { useState } from 'react';

interface FaqItem {
  _id?: string;
  question: string;
  answer: string;
}

export default function Faq({ faqs = [] }: { faqs: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const defaultFaqs: FaqItem[] = [
    {
      question: 'Who can participate?',
      answer: 'Any college student with a valid student ID. All years, all branches. Freshers and seniors are equally welcome.',
    },
    {
      question: 'Is there a registration fee?',
      answer: "No. It is completely free — food, swag, and high-speed WiFi are 100% covered by our sponsors.",
    },
    {
      question: 'What should I bring?',
      answer: 'Your laptop, charger, valid student ID, and plenty of caffeine tolerance. We provide power strips and internet access.',
    },
    {
      question: "I don't have a team yet. Can I still register?",
      answer: "Yes. Register solo and we'll match you with others at the team formation session right before hacking begins.",
    },
    {
      question: 'Is food provided throughout the 24 hours?',
      answer: 'Yes. Dinner, midnight pizzas, morning breakfast, and unlimited beverages are covered. Dietary options available.',
    },
    {
      question: 'Is there accommodation / resting area?',
      answer: "The venue is open 24 hours. Bring a sleeping bag or hoodie if you plan to nap, though most teams stay wired all night.",
    },
  ];

  const items = faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <section id="faqs" className="py-20 max-w-[1280px] mx-auto px-4 sm:px-8 border-t border-line relative z-10">
      {/* Section Label */}
      <div className="font-mono text-xs text-offwhite/50 uppercase tracking-widest mb-10">
        09 / FAQS
      </div>

      <h2 className="sr-only">Frequently Asked Questions</h2>

      {/* Accordion with Hairline Separators (No Cards, No Backgrounds) */}
      <div className="border-b border-line max-w-4xl">
        {items.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div key={faq._id || idx} className="border-t border-line">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full py-6 text-left flex items-center justify-between gap-6 group"
                aria-expanded={isOpen}
              >
                <span className="font-display font-bold text-lg sm:text-2xl text-offwhite group-hover:text-yellow transition-colors">
                  {faq.question}
                </span>

                {/* + / − Toggle in JetBrains Mono */}
                <span className="font-mono text-xl sm:text-2xl text-offwhite/60 group-hover:text-yellow transition-colors shrink-0">
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              {isOpen && (
                <div className="pb-6 font-mono text-xs sm:text-sm text-offwhite/70 leading-relaxed max-w-2xl animate-fade-in">
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
