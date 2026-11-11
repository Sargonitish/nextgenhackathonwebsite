'use client';

import { useState, useEffect } from 'react';
import { ScrollTrigger } from '@/lib/gsap';

interface FaqItem {
  _id?: string;
  question: string;
  answer: string;
}

export default function Faq({ faqs = [] }: { faqs: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(frameId);
  }, [openIndex]);

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
    <section id="faqs" className="py-16 sm:py-20 max-w-[1280px] mx-auto px-4 sm:px-8 border-t border-line relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left Sticky Column Heading */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <h2 className="font-display font-black text-3xl sm:text-4xl text-offwhite tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 font-mono text-xs sm:text-sm text-offwhite/70 leading-relaxed max-w-xs">
            Eligibility, logistics, equipment, and venue details before check-in opens.
          </p>
        </div>

        {/* Right Column: Accordion with Hairline Separators */}
        <div className="lg:col-span-8 border-t border-b border-line divide-y divide-line">
          {items.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div key={faq._id || idx}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full py-6 text-left flex items-center justify-between gap-6 group cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-display font-bold text-lg sm:text-2xl text-offwhite group-hover:text-yellow transition-colors">
                    {faq.question}
                  </span>

                  {/* + / − Toggle in JetBrains Mono */}
                  <span className="font-mono text-xl sm:text-2xl text-offwhite/75 group-hover:text-yellow transition-colors shrink-0">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="pb-6 font-mono text-xs sm:text-sm text-offwhite/80 leading-relaxed max-w-2xl animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
