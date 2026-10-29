'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Sun, Moon, Sparkles } from 'lucide-react';

interface NavbarProps {
  eventName: string;
  logoUrl?: string;
  sections?: Record<string, boolean>;
  registrationOpen?: boolean;
}

export default function Navbar({
  eventName,
  logoUrl,
  sections = {},
  registrationOpen = true,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const navLinks = [
    { label: 'About', href: '#about', show: sections.about !== false },
    { label: 'Tracks', href: '#tracks', show: sections.tracks !== false },
    { label: 'Schedule', href: '#schedule', show: sections.schedule !== false },
    { label: 'Prizes', href: '#prizes', show: sections.prizes !== false },
    { label: 'Rules', href: '#rules', show: sections.rules !== false },
    { label: 'Team', href: '#coordinators', show: sections.coordinators !== false },
    { label: 'Sponsors', href: '#sponsors', show: sections.sponsors !== false },
    { label: 'FAQs', href: '#faqs', show: sections.faq !== false },
    { label: 'Venue', href: '#venue', show: sections.venue !== false },
  ].filter((link) => link.show);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0a0a0f]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          {logoUrl ? (
            <div className="relative h-9 w-32">
              <Image
                src={logoUrl}
                alt={eventName}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/40 flex items-center justify-center text-primary font-mono font-black text-sm">
                ⚡
              </div>
              <span className="font-mono font-extrabold text-base tracking-tight text-white uppercase">
                {eventName || 'HACKX'}
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Anchor Links */}
        <nav className="hidden lg:flex items-center gap-6 font-mono text-xs">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-neutral-400 hover:text-white transition-colors uppercase tracking-wider"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA & Controls */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle Light/Dark Theme"
            className="p-2 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
          </button>

          {/* Registration CTA Button */}
          <Link
            href="/register"
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all shadow-lg ${
              registrationOpen
                ? 'bg-primary text-black hover:opacity-90 shadow-primary/20 hover:scale-105'
                : 'bg-white/10 text-neutral-500 cursor-not-allowed'
            }`}
          >
            {registrationOpen ? 'Register Team' : 'Registrations Closed'}
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-white/10 text-neutral-400"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg border border-white/10 text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-white/10 bg-[#0c0c14] px-4 py-6 space-y-4 font-mono text-sm">
          <div className="grid grid-cols-2 gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-lg bg-white/5 text-neutral-300 hover:text-white text-xs"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2.5 rounded-lg bg-primary text-black font-bold text-center text-xs"
            >
              {registrationOpen ? 'Register Team' : 'Registrations Closed'}
            </Link>
            <Link
              href="/find-registration"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2 rounded-lg border border-white/10 text-neutral-400 text-center text-xs"
            >
              Recover Team QR Code
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
