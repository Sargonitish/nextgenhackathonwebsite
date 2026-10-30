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
  tagline,
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

  // Clean title: strip trailing 4-digit year if present so it doesn't double-render
  const cleanTitle = title.replace(/\s*\b\d{4}\b\s*$/, '').trim() || title;
  const displayYear = title.match(/\b\d{4}\b$/)?.[0] || String(year);

  const solidChars = cleanTitle.toUpperCase().split('');
  const outlinedChars = displayYear.split('');

  return (
    <section className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-8 pt-8 sm:pt-14 pb-16 flex flex-col justify-start text-left">
      {/* 1. Architectural Blueprint Corner Crosshairs */}
      <div className="flex items-center justify-between text-yellow font-mono text-xs select-none mb-3">
        <span>+ [SPEC: AGENT-ORCHESTRATION-V2.6]</span>
        <span className="hidden sm:inline">[COORD: 12.9716° N / 77.5946° E] +</span>
      </div>

      {/* 2. Top Mono Metadata Stamp */}
      <div className="font-mono text-xs sm:text-sm text-offwhite/50 uppercase tracking-widest mb-4">
        {collegeName} / 24-HOUR HACKATHON / {year}
      </div>

      {/* 3. Main Grid: Headline + Live Agent Telemetry Terminal Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-2">
        {/* Left Column: Massive Headline */}
        <div className="lg:col-span-8">
          <h1 className="font-display font-black text-[15vw] sm:text-[14vw] lg:text-[160px] leading-[0.88] tracking-tighter text-offwhite select-none">
            {/* Solid Title Letters */}
            <span className="inline-block mr-2 sm:mr-5">
              {solidChars.map((char, index) => (
                <span
                  key={index}
                  className="char-fade"
                  style={{ animationDelay: `${index * 45}ms` }}
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
                  className="char-fade"
                  style={{
                    animationDelay: `${(solidChars.length + index) * 45}ms`,
                  }}
                >
                  {char}
                </span>
              ))}
            </span>
          </h1>

          {/* Architectural Dimension Caliper */}
          <div className="mt-6 mb-4 font-mono text-xs sm:text-sm text-offwhite/50 tracking-wider flex items-center gap-2 select-none">
            <span className="text-yellow">|←</span>
            <span className="h-[1px] flex-1 bg-line max-w-[120px]" />
            <span>24-HOUR AUTONOMOUS SPRINT // 1,440 MIN</span>
            <span className="h-[1px] flex-1 bg-line max-w-[120px]" />
            <span className="text-yellow">→|</span>
          </div>

          {/* Student Voice Subhead / Dynamic Tagline */}
          <p className="max-w-2xl font-mono text-xs sm:text-sm md:text-base text-offwhite/80 leading-relaxed">
            {tagline || '24 hours. Build an agent that actually does something. Free food, loud music, one trophy.'}
          </p>

          {/* Fast-Spec Feature Badges */}
          <div className="mt-5 flex flex-wrap gap-2.5 font-mono text-[11px] text-offwhite/70">
            <span className="px-2.5 py-1 border border-line bg-white/[0.02]">
              [ 01/ALL BRANCHES ELIGIBLE ]
            </span>
            <span className="px-2.5 py-1 border border-line bg-white/[0.02]">
              [ 02/ZERO REGISTRATION FEE ]
            </span>
            <span className="px-2.5 py-1 border border-line bg-white/[0.02]">
              [ 03/HARDWARE DEV KITS ]
            </span>
          </div>
        </div>

        {/* Right Column: Live Telemetry Terminal HUD Box */}
        <div className="lg:col-span-4 border border-line p-5 sm:p-6 bg-[#0c223f] shadow-hard-sm relative">
          {/* Terminal Title Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-line mb-4 font-mono text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow animate-pulse" />
              <span className="text-yellow font-bold uppercase tracking-wider">&gt;_ SYSTEM TELEMETRY</span>
            </div>
            <span className="text-offwhite/40">[LIVE]</span>
          </div>

          {/* Terminal Diagnostic Feed */}
          <div className="space-y-2.5 font-mono text-xs text-offwhite/80 leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="text-yellow">&gt;</span>
              <span>
                <strong className="text-offwhite">CLUSTER:</strong> 40 autonomous agents on-grid
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow">&gt;</span>
              <span>
                <strong className="text-offwhite">BOUNTY:</strong> ₹1,00,000 cash pool + cloud credits
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow">&gt;</span>
              <span>
                <strong className="text-offwhite">AMENITIES:</strong> Unlimited caffeine, snacks &amp; 24h WiFi
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow">&gt;</span>
              <span>
                <strong className="text-offwhite">MANDATE:</strong> Runnable CLI / agents, zero slides
              </span>
            </div>
            {regCount > 0 && (
              <div className="pt-2 border-t border-line text-yellow font-bold flex items-center justify-between">
                <span>REGISTERED TEAMS:</span>
                <span>{regCount} / 150</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Action CTAs */}
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

      {/* 5. Minimalist Plain Mono Countdown Row */}
      <div className="mt-14 pt-8 border-t border-line font-mono flex items-center justify-between flex-wrap gap-4 text-offwhite">
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

        <div className="text-xs text-offwhite/50 tracking-widest hidden md:block">
          [ 150 SEATS MAX // IN-PERSON // IST (+05:30) ]
        </div>
      </div>
    </section>
  );
}
