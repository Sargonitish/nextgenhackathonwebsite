'use client';

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/helpers/classname-helper';

export interface HoldToConfirmButtonProps {
  onConfirm: () => void | Promise<void>;
  holdDurationMs?: number;
  disabled?: boolean;
  label?: string;
  holdingLabel?: string;
  className?: string;
  title?: string;
  icon?: ReactNode;
  compact?: boolean;
}

/**
 * Deliberate confirmation control that prevents accidental deletions by requiring
 * a continuous press-and-hold fill gesture.
 */
export default function HoldToConfirmButton({
  onConfirm,
  holdDurationMs = 1100,
  disabled = false,
  label = 'Hold to Delete',
  holdingLabel = 'Keep Holding...',
  className,
  title = 'Press and hold to confirm permanent deletion',
  icon,
  compact = false,
}: HoldToConfirmButtonProps) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const triggeredRef = useRef(false);

  const cancelHold = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setHolding(false);
    setProgress(0);
    triggeredRef.current = false;
  }, []);

  useEffect(() => cancelHold, [cancelHold]);

  const startHold = useCallback(() => {
    if (disabled || holding) return;
    triggeredRef.current = false;
    setHolding(true);
    const startTime = performance.now();

    const tick = (now: number) => {
      const next = Math.min(1, (now - startTime) / holdDurationMs);
      setProgress(next);

      if (next >= 1 && !triggeredRef.current) {
        triggeredRef.current = true;
        cancelHold();
        void onConfirm();
        return;
      }

      if (next < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [cancelHold, disabled, holdDurationMs, holding, onConfirm]);

  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      aria-label={label}
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
          e.preventDefault();
          startHold();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          cancelHold();
        }
      }}
      className={cn(
        'relative isolate select-none overflow-hidden rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs font-bold',
        holding && 'border-red-400 text-white',
        className
      )}
    >
      {/* Sweep progress background */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 -z-10 bg-red-600/80 transition-none"
        style={{ width: `${Math.round(progress * 100)}%` }}
      />

      <span className="relative z-10 inline-flex items-center justify-center gap-1.5">
        {icon ?? <Trash2 className="h-3.5 w-3.5 shrink-0" />}
        <span>{holding ? holdingLabel : label}</span>
      </span>
    </button>
  );
}
