'use client';

import { useState, useEffect } from 'react';
import { computeTimerView, TimerState, TimerView } from '@/lib/timer';
import { motion, AnimatePresence } from 'framer-motion';

interface FlipCountdownProps {
  initialTimer?: TimerState | null;
  eventId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showProgress?: boolean;
}

function DigitCard({ value, label, size = 'md' }: { value: number; label: string; size: string }) {
  const formatted = String(value).padStart(2, '0');

  const cardSizes = {
    sm: 'w-11 h-14 text-xl sm:w-14 sm:h-16 sm:text-2xl',
    md: 'w-16 h-20 text-3xl sm:w-24 sm:h-28 sm:text-5xl',
    lg: 'w-20 h-24 text-4xl sm:w-28 sm:h-34 sm:text-6xl md:w-32 md:h-38 md:text-7xl',
    xl: 'w-24 h-28 text-5xl sm:w-36 sm:h-44 sm:text-8xl md:w-44 md:h-52 md:text-9xl',
  };

  const labelSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px] sm:text-xs',
    lg: 'text-xs sm:text-sm',
    xl: 'text-sm sm:text-base font-bold',
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative rounded-2xl border border-white/15 bg-gradient-to-b from-[#141522] via-[#0d0e17] to-[#08080f] font-mono font-black text-white shadow-[0_12px_28px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden backdrop-blur-xl ${cardSizes[size as keyof typeof cardSizes]}`}
      >
        {/* Top Card Specular Reflection */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

        {/* Horizontal Mechanical Groove & Divider */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-black/80 z-20 shadow-sm" />

        {/* Side Mechanical Hinge Notches */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-black rounded-r-sm z-30" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-black rounded-l-sm z-30" />

        {/* Animated Digits with Neon Glow */}
        <AnimatePresence mode="popLayout">
          <motion.span
            key={formatted}
            initial={{ y: -16, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="text-primary drop-shadow-[0_0_16px_rgba(0,255,157,0.5)] z-10"
          >
            {formatted}
          </motion.span>
        </AnimatePresence>
      </div>

      <span
        className={`mt-2.5 font-mono uppercase tracking-widest text-neutral-400 font-bold ${labelSizes[size as keyof typeof labelSizes]}`}
      >
        {label}
      </span>
    </div>
  );
}

export default function FlipCountdown({
  initialTimer,
  eventId,
  size = 'md',
  showProgress = true,
}: FlipCountdownProps) {
  const [timerState, setTimerState] = useState<TimerState | null>(initialTimer || null);
  const [serverOffset, setServerOffset] = useState<number>(0);
  const [view, setView] = useState<TimerView>(() => computeTimerView(initialTimer, Date.now()));

  // Fetch updated timer from server
  const fetchTimer = async () => {
    try {
      const url = eventId ? `/api/public/timer?event=${eventId}` : '/api/public/timer';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const clientNow = Date.now();
        const offset = data.serverNow ? data.serverNow - clientNow : 0;
        setServerOffset(offset);
        if (data.timer) {
          setTimerState(data.timer);
        }
      }
    } catch (err) {
      console.error('Failed to sync timer:', err);
    }
  };

  useEffect(() => {
    fetchTimer();

    // Re-fetch every 15s to stay drift-free
    const pollInterval = setInterval(fetchTimer, 15000);

    // Sync immediately when browser window gains focus
    const handleFocus = () => fetchTimer();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [eventId]);

  // Tick local view every 1s
  useEffect(() => {
    const tick = () => {
      const now = Date.now() + serverOffset;
      setView(computeTimerView(timerState, now));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timerState, serverOffset]);

  const isPaused = view.status === 'paused';

  return (
    <div className="flex flex-col items-center">
      {/* Dynamic Status / Mode Badge */}
      <div className="mb-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-[#0d0e17]/80 backdrop-blur-xl shadow-lg">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            view.status === 'running'
              ? 'bg-primary animate-pulse shadow-[0_0_10px_rgba(0,255,157,0.8)]'
              : isPaused
              ? 'bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]'
              : 'bg-neutral-500'
          }`}
        />
        <span
          className={`font-mono text-xs font-bold tracking-widest uppercase ${
            isPaused ? 'text-amber-400' : 'text-neutral-200'
          }`}
        >
          {view.label}
        </span>
      </div>

      {/* 3D Flip Clock Grid */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-5">
        <DigitCard value={view.days} label="Days" size={size} />
        <span className="font-mono text-2xl sm:text-4xl text-neutral-600 font-extrabold pb-6">:</span>
        <DigitCard value={view.hours} label="Hours" size={size} />
        <span className="font-mono text-2xl sm:text-4xl text-neutral-600 font-extrabold pb-6">:</span>
        <DigitCard value={view.minutes} label="Minutes" size={size} />
        <span className="font-mono text-2xl sm:text-4xl text-neutral-600 font-extrabold pb-6">:</span>
        <DigitCard value={view.seconds} label="Seconds" size={size} />
      </div>

      {/* Progress Bar (Visible during running / paused hackathon) */}
      {showProgress && (view.status === 'running' || isPaused) && (
        <div className="w-full max-w-md sm:max-w-lg mt-6 space-y-1.5">
          <div className="flex justify-between font-mono text-[11px] text-neutral-400">
            <span>Marathon Elapsed: {view.progressPercent}%</span>
            <span>24h Countdown</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden backdrop-blur-md">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isPaused
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-primary via-[#00f0ff] to-accent shadow-[0_0_12px_rgba(0,255,157,0.5)]'
              }`}
              style={{ width: `${view.progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
