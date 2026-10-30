'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FlipCountdown from './FlipCountdown';
import { TimerState } from '@/lib/timer';
import { ArrowRight, Flame, Calendar, Sparkles, Terminal } from 'lucide-react';

interface HeroProps {
  title: string;
  tagline: string;
  typingWords?: string[];
  timer?: TimerState | null;
  registrationOpen?: boolean;
  eventId?: string;
}

export default function Hero({
  title,
  tagline,
  typingWords = ['Build Autonomous Agents', 'Ship Scalable Web3', 'Innovate with AI', 'Disrupt with Code'],
  timer,
  registrationOpen = true,
  eventId,
}: HeroProps) {
  // Typing animation state
  const [wordIndex, setWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Live registration counter
  const [regCount, setRegCount] = useState<number>(0);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/public/stats');
        if (res.ok) {
          const data = await res.json();
          setRegCount(data.registeredTeamsCount || 0);
        }
      } catch {}
    }
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Typing effect loop
  useEffect(() => {
    if (typingWords.length === 0) return;

    const currentWord = typingWords[wordIndex % typingWords.length];
    const typingSpeed = isDeleting ? 35 : 85;

    const timerTimeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayedText(currentWord.substring(0, displayedText.length + 1));
        if (displayedText.length + 1 === currentWord.length) {
          setTimeout(() => setIsDeleting(true), 1600); // Pause before deleting
        }
      } else {
        setDisplayedText(currentWord.substring(0, displayedText.length - 1));
        if (displayedText.length - 1 === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => prev + 1);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timerTimeout);
  }, [displayedText, isDeleting, wordIndex, typingWords]);

  return (
    <section className="relative min-h-[88dvh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 text-center z-10">
      {/* 1. Live Stats Pill */}
      {regCount > 0 ? (
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-xs font-semibold shadow-[0_0_20px_rgba(0,255,157,0.15)] backdrop-blur-md animate-fade-in">
          <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>🔥 {regCount} teams registered and confirmed</span>
        </div>
      ) : (
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-xs font-semibold shadow-[0_0_20px_rgba(0,255,157,0.15)] backdrop-blur-md animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Flagship Collegiate Hackathon • Edition 2026</span>
        </div>
      )}

      {/* 2. Main Title */}
      <h1 className="font-mono text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white max-w-5xl leading-tight">
        <span className="bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
          {title}
        </span>
      </h1>

      {/* 3. Terminal Style Dynamic Subtitle */}
      <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-[#0e0f17]/80 backdrop-blur-md font-mono text-sm sm:text-lg md:text-xl font-bold text-primary shadow-lg">
        <Terminal className="w-4 h-4 text-primary shrink-0" />
        <span>&gt; {displayedText}</span>
        <span className="w-2.5 h-5 ml-0.5 bg-primary animate-pulse" />
      </div>

      {/* 4. Tagline */}
      <p className="mt-5 max-w-2xl text-sm sm:text-base md:text-lg text-neutral-300 font-sans leading-relaxed">
        {tagline}
      </p>

      {/* 5. Synchronized 3D Flip Countdown Clock */}
      <div className="my-8 sm:my-10 w-full max-w-3xl flex justify-center">
        <FlipCountdown
          initialTimer={timer}
          eventId={eventId}
          size="md"
          showProgress={true}
        />
      </div>

      {/* 6. Call to Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md font-mono text-xs font-bold">
        {registrationOpen ? (
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary hover:opacity-95 text-black shadow-[0_0_25px_rgba(0,255,157,0.35)] hover:shadow-[0_0_35px_rgba(0,255,157,0.55)] hover:scale-105 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Register Team Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : (
          <button
            disabled
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 text-neutral-500 cursor-not-allowed"
          >
            Registrations Closed
          </button>
        )}

        <a
          href="#schedule"
          className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 text-white backdrop-blur-md transition-all flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4 text-neutral-400" />
          <span>Explore Schedule</span>
        </a>
      </div>
    </section>
  );
}
