'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  eventName?: string;
  logoUrl?: string;
  sections?: Record<string, boolean>;
  registrationOpen?: boolean;
}

export default function Navbar({
  eventName = 'HACKX',
  registrationOpen = true,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { label: 'About', href: '#about' },
    { label: 'Tracks', href: '#tracks' },
    { label: 'Schedule', href: '#schedule' },
    { label: 'Prizes', href: '#prizes' },
    { label: 'FAQs', href: '#faqs' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-navy border-b border-line">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-mono font-bold text-lg text-offwhite tracking-wider hover:text-yellow transition-colors"
          >
            {eventName || 'HACKX'}
          </Link>

          {/* Desktop Nav Links (5 links in JetBrains Mono) */}
          <nav className="hidden md:flex items-center gap-8 font-mono text-xs">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-offwhite/70 hover:text-offwhite transition-colors tracking-wide uppercase"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Register Button (Square, Yellow, Hard Offset Shadow) */}
          <div className="hidden md:flex items-center gap-4">
            {registrationOpen ? (
              <Link
                href="/register"
                className="px-5 py-2.5 bg-yellow text-navy font-mono text-xs font-bold tracking-wider uppercase border border-yellow shadow-[4px_4px_0_rgba(242,239,230,0.3)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_rgba(242,239,230,0.3)] transition-all"
              >
                Register Now
              </Link>
            ) : (
              <span className="px-5 py-2.5 bg-line text-offwhite/40 font-mono text-xs uppercase cursor-not-allowed">
                Registrations Closed
              </span>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-offwhite border border-line"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Full-screen Mobile Overlay Menu (Flat Navy, Left-aligned) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-navy flex flex-col justify-between p-8 font-mono md:hidden animate-fade-in">
          <nav className="flex flex-col gap-6 pt-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-display font-bold text-offwhite hover:text-yellow transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-6 border-t border-line flex flex-col gap-4">
            {registrationOpen && (
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-4 text-center bg-yellow text-navy font-bold text-sm tracking-wider uppercase shadow-[4px_4px_0_rgba(242,239,230,0.3)]"
              >
                Register Your Team →
              </Link>
            )}
            <Link
              href="/find-registration"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 text-center border border-line text-offwhite/70 text-xs uppercase"
            >
              Lookup Team Pass
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
