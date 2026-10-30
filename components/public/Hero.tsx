'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TimerState, computeTimerView } from '@/lib/timer';

interface HeroProps {
  title?: string;
  tagline?: string;
  collegeName?: string;
  year?: number;
  timer?: TimerState | null;
  registrationOpen?: boolean;
  eventId?: string;
}

export default function Hero({
  title = 'HACKX',
  collegeName = 'COLLEGE OF ENGINEERING',
  year = 2026,
  timer,
  registrationOpen = true,
  eventId,
}: HeroProps) {
  const [regCount, setRegCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<{
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    status: 'upcoming' | 'live' | 'ended';
  }>({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    status: 'upcoming',
  });

  // Fetch registered stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/public/stats');
        if (res.ok) {
          const data = await res.json();
          setRegCount(data.registeredTeamsCount || 0);
        }
      } catch {}
    }
    fetchStats();
  }, []);

  // Compute countdown in IST
  useEffect(() => {
    const updateCountdown = () => {
      const view = computeTimerView(timer, Date.now());

      if (view.status === 'running') {
        setTimeLeft({
          days: String(view.days).padStart(2, '0'),
          hours: String(view.hours).padStart(2, '0'),
          minutes: String(view.minutes).padStart(2, '0'),
          seconds: String(view.seconds).padStart(2, '0'),
          status: 'live',
        });
      } else if (view.status === 'ended') {
        setTimeLeft((prev) => ({ ...prev, status: 'ended' }));
      } else {
        setTimeLeft({
          days: String(view.days).padStart(2, '0'),
          hours: String(view.hours).padStart(2, '0'),
          minutes: String(view.minutes).padStart(2, '0'),
          seconds: String(view.seconds).padStart(2, '0'),
          status: 'upcoming',
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Headline characters for staggered reveal
  const solidChars = title.toUpperCase().split('');
  const outlinedChars = String(year).split('');

  return (
    <section className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-8 pt-12 sm:pt-20 pb-16 flex flex-col justify-start text-left">
      {/* 1. Tiny Mono Metadata Label */}
      <div className="font-mono text-xs sm:text-sm text-offwhite/50 uppercase tracking-widest mb-4 sm:mb-6">
        {collegeName} / 24-HOUR HACKATHON / {year}
      </div>

      {/* 2. Huge Asymmetric Left-Aligned Headline */}
      <h1 className="font-display font-black text-[15vw] sm:text-[16vw] lg:text-[180px] leading-[0.88] tracking-tighter text-offwhite select-none">
        {/* Solid Characters with staggered animation delay */}
        <span className="inline-block mr-2 sm:mr-6">
          {solidChars.map((char, index) => (
            <span
              key={index}
              className="inline-block opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'forwards' }}
            >
              {char}
            </span>
          ))}
        </span>

        {/* Outlined Year Characters */}
        <span className="inline-block text-outline">
          {outlinedChars.map((char, index) => (
            <span
              key={index}
              className="inline-block opacity-0 animate-fade-in"
              style={{
                animationDelay: `${(solidChars.length + index) * 40}ms`,
                animationFillMode: 'forwards',
              }}
            >
              {char}
            </span>
          ))}
        </span>
      </h1>

      {/* 3. Dimension-Line Technical Decoration */}
      <div className="mt-6 mb-4 font-mono text-xs sm:text-sm text-offwhite/40 tracking-widest select-none">
        ←—— 24 HRS ——→
      </div>

      {/* 4. Casual Student Voice Subhead */}
      <p className="max-w-2xl font-mono text-sm sm:text-base text-offwhite/80 leading-relaxed">
        24 hours. Build an agent that actually does something. Free food, loud music, one trophy.
      </p>

      {/* 5. Registered Counter (Only shown if count >= 10 per blueprint spec) */}
      {regCount >= 10 && (
        <div className="mt-4 font-mono text-xs text-yellow tracking-wider">
          [ {regCount} TEAMS REGISTERED AND CONFIRMED ]
        </div>
      )}

      {/* 6. CTAs */}
      <div className="mt-8 flex flex-wrap items-center gap-6 font-mono text-xs sm:text-sm">
        {registrationOpen ? (
          <Link
            href="/register"
            className="px-7 py-3.5 bg-yellow text-navy font-bold uppercase tracking-wider border border-yellow shadow-hard hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_#FFD23F] transition-all"
          >
            Register your team →
          </Link>
        ) : (
          <span className="px-7 py-3.5 bg-line text-offwhite/40 font-bold uppercase cursor-not-allowed">
            Registrations Closed
          </span>
        )}

        <a
          href="#schedule"
          className="text-offwhite hover:text-yellow underline underline-offset-4 tracking-wider transition-colors"
        >
          See the schedule
        </a>
      </div>

      {/* 7. Minimalist Plain Mono Countdown Row */}
      <div className="mt-16 pt-8 border-t border-line font-mono flex items-center flex-wrap gap-4 text-offwhite">
        {timeLeft.status === 'live' ? (
          <div className="text-xl sm:text-2xl font-bold text-yellow tracking-widest">
            HACKING IS LIVE
          </div>
        ) : timeLeft.status === 'ended' ? (
          <div className="text-xl sm:text-2xl font-bold text-offwhite/50 tracking-widest">
            HACKX {year} HAS ENDED
          </div>
        ) : (
          <div className="flex items-center gap-3 sm:gap-6 text-xl sm:text-3xl font-bold tracking-wider">
            <div className="flex items-baseline gap-1">
              <span>{timeLeft.days}</span>
              <span className="text-[11px] sm:text-xs text-offwhite/50 font-normal">d</span>
            </div>
            <span className="text-line">|</span>

            <div className="flex items-baseline gap-1">
              <span>{timeLeft.hours}</span>
              <span className="text-[11px] sm:text-xs text-offwhite/50 font-normal">h</span>
            </div>
            <span className="text-line">|</span>

            <div className="flex items-baseline gap-1">
              <span>{timeLeft.minutes}</span>
              <span className="text-[11px] sm:text-xs text-offwhite/50 font-normal">m</span>
            </div>
            <span className="text-line">|</span>

            <div className="flex items-baseline gap-1 text-yellow">
              <span>{timeLeft.seconds}</span>
              <span className="text-[11px] sm:text-xs text-offwhite/50 font-normal">s</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
