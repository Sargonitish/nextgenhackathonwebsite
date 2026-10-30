'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Sun, Moon, Sparkles, ArrowRight } from 'lucide-react';

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className="sticky top-0 z-50 w-full px-3 sm:px-6 lg:px-8 pt-3 pb-2 transition-all duration-300">
      <div
        className={`max-w-7xl mx-auto rounded-2xl border transition-all duration-300 px-4 sm:px-6 h-16 flex items-center justify-between ${
          scrolled
            ? 'bg-[#08080c]/90 border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl'
            : 'bg-[#0e0f17]/75 border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.4)] backdrop-blur-xl'
        }`}
      >
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
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
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-mono font-black text-sm shadow-[0_0_12px_rgba(0,255,157,0.3)] group-hover:scale-105 group-hover:border-primary transition-all">
                ⚡
              </div>
              <span className="font-mono font-black text-base tracking-tight text-white uppercase group-hover:text-primary transition-colors">
                {eventName || 'HACKX 2026'}
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Anchor Links */}
        <nav className="hidden lg:flex items-center gap-1.5 font-mono text-xs">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider font-semibold"
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
            className="p-2 rounded-xl border border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:border-white/20 transition-all"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
          </button>

          {/* Registration CTA Button */}
          <Link
            href="/register"
            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg ${
              registrationOpen
                ? 'bg-primary text-black hover:opacity-95 shadow-[0_0_20px_rgba(0,255,157,0.3)] hover:scale-105 hover:shadow-[0_0_25px_rgba(0,255,157,0.5)]'
                : 'bg-white/10 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <span>{registrationOpen ? 'Register Now' : 'Closed'}</span>
            {registrationOpen && <ArrowRight className="w-3.5 h-3.5" />}
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-white/10 bg-white/5 text-neutral-400"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl border border-white/10 bg-white/5 text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Glass Drawer */}
      {mobileOpen && (
        <div className="lg:hidden mt-2 max-w-7xl mx-auto rounded-2xl border border-white/15 bg-[#0a0a12]/95 backdrop-blur-2xl p-5 space-y-4 font-mono text-sm shadow-2xl animate-fade-in">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-neutral-300 hover:text-white hover:border-primary/30 text-xs font-semibold"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="w-full py-3 rounded-xl bg-primary text-black font-extrabold text-center text-xs shadow-[0_0_15px_rgba(0,255,157,0.3)]"
            >
              {registrationOpen ? 'Register Team Now' : 'Registrations Closed'}
            </Link>
            <Link
              href="/find-registration"
              onClick={() => setMobileOpen(false)}
              className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 text-neutral-400 text-center text-xs"
            >
              Recover Registration Pass
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
