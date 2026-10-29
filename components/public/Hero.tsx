'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FlipCountdown from './FlipCountdown';
import { TimerState } from '@/lib/timer';
import { ArrowRight, Flame, Calendar, Sparkles } from 'lucide-react';

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
  typingWords = ['Build', 'Innovate', 'Disrupt', 'Ship'],
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
    const typingSpeed = isDeleting ? 40 : 90;

    const timerTimeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayedText(currentWord.substring(0, displayedText.length + 1));
        if (displayedText.length + 1 === currentWord.length) {
          setTimeout(() => setIsDeleting(true), 1500); // Pause before deleting
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
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 py-16 text-center z-10">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(0,255,157,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* RegCounter Pill */}
      {regCount > 0 && (
        <div className="mb-4 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-xs font-semibold shadow-lg shadow-primary/10 animate-fade-in">
          <Flame className="w-3.5 h-3.5 animate-bounce text-amber-400" />
          <span>🔥 {regCount} teams registered and confirmed!</span>
        </div>
      )}

      {/* Main Title */}
      <h1 className="font-mono text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-4xl leading-tight">
        {title}
      </h1>

      {/* Cycling Dynamic Subtitle */}
      <div className="mt-3 h-10 font-mono text-xl sm:text-2xl font-bold text-primary flex items-center justify-center">
        <span>{displayedText}</span>
        <span className="w-2.5 h-6 ml-1 bg-primary animate-pulse" />
      </div>

      {/* Tagline */}
      <p className="mt-3 max-w-2xl text-sm sm:text-base text-neutral-300 font-sans">
        {tagline}
      </p>

      {/* Synchronized 3D Flip Countdown Clock */}
      <div className="my-10 w-full max-w-3xl flex justify-center">
        <FlipCountdown
          initialTimer={timer}
          eventId={eventId}
          size="md"
          showProgress={true}
        />
      </div>

      {/* Call to Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md font-mono text-xs font-bold">
        {registrationOpen ? (
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary hover:opacity-90 text-black shadow-lg shadow-primary/25 hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <span>Register Team Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <button
            disabled
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 text-neutral-500 cursor-not-allowed"
          >
            Registrations Closed
          </button>
        )}

        <a
          href="#schedule"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white transition-all flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4 text-neutral-400" />
          <span>View Schedule</span>
        </a>
      </div>
    </section>
  );
}
