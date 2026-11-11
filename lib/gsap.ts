'use client';

import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Flip } from 'gsap/Flip';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(
    useGSAP,
    ScrollTrigger,
    ScrollToPlugin,
    SplitText,
    ScrambleTextPlugin,
    Flip,
    DrawSVGPlugin
  );
}

/**
 * Helper to check OS reduced-motion preference safely on the client.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export {
  gsap,
  useGSAP,
  ScrollTrigger,
  ScrollToPlugin,
  SplitText,
  ScrambleTextPlugin,
  Flip,
  DrawSVGPlugin,
};
