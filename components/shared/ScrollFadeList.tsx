'use client';

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { cn } from '@/helpers/classname-helper';

export interface ScrollFadeListProps {
  children: ReactNode;
  className?: string;
}

/**
 * Scrollable container with soft edge mask gradients that appear only where content overflows.
 */
export default function ScrollFadeList({
  children,
  className,
}: ScrollFadeListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ top: false, bottom: false });

  const updateEdges = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const top = el.scrollTop > 4;
    const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 4;
    setEdges((prev) =>
      prev.top === top && prev.bottom === bottom ? prev : { top, bottom }
    );
  }, []);

  useEffect(() => {
    updateEdges();
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children, updateEdges]);

  const maskGradient =
    edges.top && edges.bottom
      ? 'linear-gradient(to bottom, transparent, black 20px, black calc(100% - 20px), transparent)'
      : edges.top
      ? 'linear-gradient(to bottom, transparent, black 20px, black)'
      : edges.bottom
      ? 'linear-gradient(to bottom, black, black calc(100% - 20px), transparent)'
      : undefined;

  return (
    <div
      ref={containerRef}
      onScroll={updateEdges}
      className={cn('overflow-y-auto', className)}
      style={
        maskGradient
          ? { maskImage: maskGradient, WebkitMaskImage: maskGradient }
          : undefined
      }
    >
      {children}
    </div>
  );
}
