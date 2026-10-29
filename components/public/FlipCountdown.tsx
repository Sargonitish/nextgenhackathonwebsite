'use client';

import { useState, useEffect, useRef } from 'react';
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
    sm: 'w-10 h-12 text-lg sm:w-12 sm:h-14 sm:text-xl',
    md: 'w-14 h-16 text-2xl sm:w-20 sm:h-24 sm:text-4xl',
    lg: 'w-16 h-20 text-3xl sm:w-24 sm:h-28 sm:text-5xl md:w-28 md:h-32 md:text-6xl',
    xl: 'w-20 h-24 text-4xl sm:w-32 sm:h-40 sm:text-7xl md:w-40 md:h-48 md:text-8xl',
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
        className={`relative rounded-xl border border-white/15 bg-gradient-to-b from-[#181824] to-[#0c0c14] font-mono font-extrabold text-white shadow-2xl flex items-center justify-center overflow-hidden backdrop-blur-md ${cardSizes[size as keyof typeof cardSizes]}`}
      >
        {/* Horizontal Card Divider Line */}
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/60 z-10 shadow-sm" />

        {/* Animated Digits */}
        <AnimatePresence mode="popLayout">
          <motion.span
            key={formatted}
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="text-primary drop-shadow-[0_0_12px_rgba(0,255,157,0.4)]"
          >
            {formatted}
          </motion.span>
        </AnimatePresence>
      </div>

      <span
        className={`mt-2 font-mono uppercase tracking-widest text-neutral-400 font-semibold ${labelSizes[size as keyof typeof labelSizes]}`}
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
      {/* Dynamic Status / Mode Label */}
      <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
        <span
          className={`w-2 h-2 rounded-full ${
            view.status === 'running'
              ? 'bg-primary animate-pulse'
              : isPaused
              ? 'bg-amber-400 animate-pulse'
              : 'bg-neutral-500'
          }`}
        />
        <span
          className={`font-mono text-xs font-semibold tracking-wider uppercase ${
            isPaused ? 'text-amber-400' : 'text-neutral-300'
          }`}
        >
          {view.label}
        </span>
      </div>

      {/* Flip Clock Grid */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
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
            <span>Progress: {view.progressPercent}%</span>
            <span>24h Marathon</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden backdrop-blur-md">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isPaused
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-primary via-[#00ffcc] to-accent'
              }`}
              style={{ width: `${view.progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
