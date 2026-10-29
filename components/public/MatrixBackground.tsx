'use client';

import { useEffect, useRef } from 'react';

export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const chars = '01HACKX2026</>{}[]=+*~#';
    const fontSize = 14;
    let columns = Math.floor(width / fontSize);
    let drops: number[] = new Array(columns).fill(1);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = new Array(columns).fill(1);
    };

    window.addEventListener('resize', handleResize);

    const draw = () => {
      // Semi-transparent black background creates fading trailing rain effect
      ctx.fillStyle = 'rgba(10, 10, 15, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(0, 255, 157, 0.25)'; // neon primary subtle color
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    // Pause on hidden tab to conserve CPU/battery
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-40"
    />
  );
}
