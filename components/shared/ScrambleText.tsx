'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/helpers/classname-helper';

const CIPHER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#*+=';

export interface ScrambleTextProps {
  text: string;
  trigger?: 'mount' | 'hover' | 'both';
  durationMs?: number;
  className?: string;
}

/**
 * Displays a monospace glyph-scramble reveal that settles left-to-right on the target text.
 */
export default function ScrambleText({
  text,
  trigger = 'both',
  durationMs = 450,
  className,
}: ScrambleTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(text);
  const rafRef = useRef<number | null>(null);

  const stopAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const runScramble = useCallback(() => {
    if (prefersReducedMotion) {
      setDisplay(text);
      return;
    }

    stopAnimation();
    const startTime = performance.now();
    const len = text.length;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / durationMs);
      const lockedCount = Math.floor(progress * len);

      let next = '';
      for (let i = 0; i < len; i++) {
        const ch = text[i];
        if (ch === ' ' || ch === '\n' || i < lockedCount) {
          next += ch;
        } else {
          next += CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
        }
      }

      setDisplay(next);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [durationMs, prefersReducedMotion, stopAnimation, text]);

  useEffect(() => {
    if (trigger === 'mount' || trigger === 'both') {
      runScramble();
    } else {
      setDisplay(text);
    }
    return stopAnimation;
  }, [runScramble, stopAnimation, text, trigger]);

  const handleMouseEnter = () => {
    if (trigger === 'hover' || trigger === 'both') {
      runScramble();
    }
  };

  return (
    <span
      onMouseEnter={handleMouseEnter}
      className={cn('inline-block', className)}
    >
      {display}
    </span>
  );
}
