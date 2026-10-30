'use client';

import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(true);

  useEffect(() => {
    // Check if device supports touch
    const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouch(touchDevice);

    if (touchDevice) return;

    // Apply cursor: none to body on desktop
    document.body.classList.add('custom-cursor-active');

    let rafId: number;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    const animate = () => {
      // Smooth lerp
      currentX += (targetX - currentX) * 0.45;
      currentY += (targetY - currentY) * 0.45;
      setPosition({ x: currentX, y: currentY });
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    rafId = requestAnimationFrame(animate);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(rafId);
    };
  }, [visible]);

  if (isTouch || !visible) return null;

  return (
    <div
      className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Blueprint 16px crosshair cursor */}
      <svg
        width="21"
        height="21"
        viewBox="0 0 21 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-90"
      >
        {/* Horizontal hairline */}
        <line x1="0" y1="10.5" x2="21" y2="10.5" stroke="#F2EFE6" strokeWidth="1" />
        {/* Vertical hairline */}
        <line x1="10.5" y1="0" x2="10.5" y2="21" stroke="#F2EFE6" strokeWidth="1" />
        {/* Center tiny dot */}
        <rect x="9.5" y="9.5" width="2" height="2" fill="#FFD23F" />
      </svg>
    </div>
  );
}
