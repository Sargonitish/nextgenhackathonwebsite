'use client';

import { useRef } from 'react';
import { gsap, useGSAP, SplitText } from '@/lib/gsap';

interface AboutProps {
  title?: string;
  text?: string;
  prizePool?: string;
  tracksCount?: number;
  maxTeams?: number;
}

export default function About({
  title,
  text,
  prizePool = '₹1,00,000',
  tracksCount = 4,
  maxTeams = 150,
}: AboutProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const defaultParagraphs = [
    'Most hackathons end with half-baked presentation decks and polished Figma prototypes that do nothing. HackX is different. We care about working software, runnable CLI binaries, and autonomous systems that execute tasks without human hand-holding.',
    'Whether you are building multi-agent workflows, autonomous smart contract auditors, or local LLM pipelines on consumer hardware, you have 24 hours to turn an ambitious architectural premise into reality.',
    'Free food, unlimited coffee, high-speed WiFi, and industry mentors circulating the floor all night. Bring your laptop and your sharpest ideas.',
  ];

  const paragraphs = text
    ? text.split('\n\n').filter((p) => p.trim().length > 0)
    : defaultParagraphs;

  const headingCopy =
    title || 'Not another hackathon. A 24-hour sprint to build agents that act on their own.';

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const cleanups: Array<() => void> = [];

        if (headingRef.current) {
          const split = new SplitText(headingRef.current, { type: 'words' });
          cleanups.push(() => split.revert());

          gsap.fromTo(
            split.words,
            { opacity: 0.3 },
            {
              opacity: 1,
              stagger: 0.05,
              ease: 'none',
              scrollTrigger: {
                trigger: headingRef.current,
                start: 'top 85%',
                end: 'top 35%',
                scrub: 0.4,
              },
            }
          );
        }

        gsap.from('[data-about-card]', {
          y: 18,
          opacity: 0,
          duration: 0.4,
          stagger: 0.07,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: '[data-about-bento]',
            start: 'top 84%',
            once: true,
          },
        });

        return () => {
          cleanups.forEach((fn) => fn());
        };
      });
    },
    { scope: sectionRef, dependencies: [headingCopy], revertOnUpdate: true }
  );

  const specMetrics = [
    { label: 'DURATION', value: '24 HRS', highlight: false },
    { label: 'DOMAINS', value: `${String(tracksCount).padStart(2, '0')} TRACKS`, highlight: false },
    { label: 'PRIZE POOL', value: prizePool, highlight: true },
    { label: 'CAPACITY', value: `${maxTeams} TEAMS`, highlight: false },
  ];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-20 max-w-[1280px] mx-auto px-4 sm:px-8 border-t border-line relative z-10"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column (60% on desktop) - Statement Headline */}
        <div className="lg:col-span-7">
          <h2
            ref={headingRef}
            className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-offwhite leading-[1.05] tracking-tight"
          >
            {headingCopy}
          </h2>
        </div>

        {/* Right Column (40% on desktop) - Dynamic / Student Voice Paragraphs + 2x2 CAD Spec Bento */}
        <div className="lg:col-span-5 flex flex-col justify-between font-mono text-xs sm:text-sm text-offwhite/85 space-y-5 leading-relaxed">
          {paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}

          {/* 2x2 CAD Spec Bento */}
          <div
            data-about-bento
            className="pt-6 border-t border-line grid grid-cols-2 gap-3"
          >
            {specMetrics.map((spec) => (
              <div
                key={spec.label}
                data-about-card
                className="border border-line bg-[#0c223f]/65 p-3.5 sm:p-4 font-mono"
              >
                <div className="text-[10px] text-offwhite/60 tracking-widest uppercase mb-1">
                  {spec.label}
                </div>
                <div
                  className={`text-sm sm:text-base font-bold tracking-wider ${
                    spec.highlight ? 'text-yellow' : 'text-offwhite'
                  }`}
                >
                  {spec.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
