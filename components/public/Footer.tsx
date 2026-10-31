'use client';

import { useRef } from 'react';
import Link from 'next/link';

interface FooterProps {
  eventName?: string;
  contactEmail?: string;
  madeBy?: string;
  socials?: {
    instagram?: string;
    discord?: string;
    twitter?: string;
    whatsapp?: string;
    linkedin?: string;
    website?: string;
  };
}

export default function Footer({
  eventName = 'HACKX',
  contactEmail = 'contact@hackx.dev',
  madeBy = 'Made by students for builders worldwide',
  socials = {},
}: FooterProps) {
  // Easter egg: 5 clicks on HACKX inverts page palette for 3 seconds
  const clickCountRef = useRef(0);
  const revertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleWordmarkClick = () => {
    clickCountRef.current += 1;

    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      document.documentElement.classList.add('blueprint-inverted');

      if (revertTimeoutRef.current) clearTimeout(revertTimeoutRef.current);
      revertTimeoutRef.current = setTimeout(() => {
        document.documentElement.classList.remove('blueprint-inverted');
      }, 3000);
    }
  };

  const normalizeUrl = (url?: string) => {
    if (!url) return '#';
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  return (
    <footer className="border-t border-line bg-navy pt-16 overflow-hidden relative z-10 font-mono">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        {/* Top Info Strip: MadeBy, Email, Socials */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-16 text-xs text-offwhite/70">
          {/* Made by students */}
          <div className="space-y-1">
            <p className="text-offwhite/50">{madeBy}</p>
            <p className="text-offwhite/30 text-[11px]">All rights reserved © 2026</p>
          </div>

          {/* Contact Email & Socials as Plain Text Links with → */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="hover:text-yellow transition-colors inline-flex items-center gap-1.5"
              >
                <span>{contactEmail}</span>
                <span>→</span>
              </a>
            )}

            {socials.instagram && (
              <a
                href={normalizeUrl(socials.instagram)}
                target="_blank"
                rel="noreferrer"
                className="hover:text-yellow transition-colors inline-flex items-center gap-1.5"
              >
                <span>Instagram</span>
                <span>→</span>
              </a>
            )}

            {socials.linkedin && (
              <a
                href={normalizeUrl(socials.linkedin)}
                target="_blank"
                rel="noreferrer"
                className="hover:text-yellow transition-colors inline-flex items-center gap-1.5"
              >
                <span>LinkedIn</span>
                <span>→</span>
              </a>
            )}

            {socials.twitter && (
              <a
                href={normalizeUrl(socials.twitter)}
                target="_blank"
                rel="noreferrer"
                className="hover:text-yellow transition-colors inline-flex items-center gap-1.5"
              >
                <span>Twitter/X</span>
                <span>→</span>
              </a>
            )}

            {(socials.discord || socials.whatsapp) && (
              <a
                href={normalizeUrl(socials.discord || socials.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="hover:text-yellow transition-colors inline-flex items-center gap-1.5"
              >
                <span>Community</span>
                <span>→</span>
              </a>
            )}

            {socials.website && (
              <a
                href={normalizeUrl(socials.website)}
                target="_blank"
                rel="noreferrer"
                className="hover:text-yellow transition-colors inline-flex items-center gap-1.5"
              >
                <span>Website</span>
                <span>→</span>
              </a>
            )}

            <Link
              href="/admin/login"
              className="hover:text-yellow transition-colors inline-flex items-center gap-1 text-offwhite/40"
            >
              <span>Admin</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Huge Cropped Wordmark (Only Top 60-70% Visible) */}
        <div
          onClick={handleWordmarkClick}
          className="select-none cursor-pointer overflow-hidden -mb-4 sm:-mb-8 lg:-mb-12"
          title="Click 5 times for easter egg"
        >
          <div className="font-display font-black text-[20vw] leading-[0.72] tracking-tighter text-offwhite/10 hover:text-offwhite/20 transition-colors uppercase whitespace-nowrap">
            {eventName}
          </div>
        </div>
      </div>
    </footer>
  );
}
