'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown, QrCode, LogOut, Ticket, Sparkles } from 'lucide-react';
import { useStudentAuth } from '@/context/StudentAuthContext';
import { toast } from 'sonner';

interface NavbarProps {
  eventName?: string;
  logoUrl?: string;
  sections?: Record<string, boolean>;
  registrationOpen?: boolean;
}

export default function Navbar({
  eventName = 'HACKX',
  logoUrl,
  sections = {},
  registrationOpen = true,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, ticket, logout } = useStudentAuth();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    toast.success('Logged out from hackathon portal');
  };

  // Dynamically filter links according to sections configured in Admin Portal
  const allLinks = [
    { label: 'About', href: '#about', show: sections.about !== false },
    { label: 'Tracks', href: '#tracks', show: sections.tracks !== false },
    { label: 'Schedule', href: '#schedule', show: sections.schedule !== false },
    { label: 'Prizes', href: '#prizes', show: sections.prizes !== false },
    { label: 'Rules', href: '#rules', show: sections.rules !== false },
    { label: 'Team', href: '#coordinators', show: sections.coordinators !== false },
    { label: 'Sponsors', href: '#sponsors', show: sections.sponsors !== false },
    { label: 'Gallery', href: '#gallery', show: sections.gallery !== false },
    { label: 'FAQs', href: '#faqs', show: sections.faq !== false },
    { label: 'Venue', href: '#venue', show: sections.venue !== false },
  ];

  const links = allLinks.filter((l) => l.show);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-navy border-b border-line">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo / Brand Name */}
          <Link
            href="/"
            className="flex items-center gap-3 font-mono font-bold text-lg text-offwhite tracking-wider hover:text-yellow transition-colors"
          >
            {logoUrl ? (
              <div className="relative h-8 w-28">
                <Image
                  src={logoUrl}
                  alt={eventName || 'Event Logo'}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <span>{eventName || 'HACKX'}</span>
            )}
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 font-mono text-xs">
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

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              /* Signed In Profile Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="px-3 py-1.5 border border-line bg-[#0c223f] hover:border-yellow text-offwhite font-mono text-xs flex items-center gap-2.5 transition-all shadow-hard-sm cursor-pointer"
                >
                  {/* Google Avatar or Icon */}
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="w-5 h-5 rounded-full border border-yellow"
                    />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}

                  <span className="font-bold tracking-wider max-w-[120px] truncate text-yellow">
                    {user.name.split(' ')[0] || user.email.split('@')[0]}
                  </span>

                  {ticket && (
                    <span className="px-1.5 py-0.5 bg-yellow text-navy text-[9px] font-extrabold uppercase">
                      TICKET
                    </span>
                  )}

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-offwhite/50 transition-transform ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-navy border border-yellow shadow-hard font-mono text-xs z-50 animate-fade-in">
                    {/* User Info Header */}
                    <div className="p-3.5 border-b border-line bg-[#0c223f]">
                      <div className="flex items-center gap-2.5 mb-1">
                        {user.avatar && (
                          <img
                            src={user.avatar}
                            alt=""
                            className="w-7 h-7 rounded-full border border-yellow"
                          />
                        )}
                        <div className="overflow-hidden">
                          <div className="font-bold text-offwhite truncate">{user.name}</div>
                          <div className="text-[11px] text-offwhite/60 truncate">{user.email}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] text-yellow font-bold uppercase tracking-wider flex items-center gap-1">
                        <span>[ ✓ GOOGLE VERIFIED IDENTITY ]</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-2 space-y-1">
                      {ticket ? (
                        <Link
                          href={`/register/success/${ticket.teamId}?token=${ticket.token}`}
                          onClick={() => setDropdownOpen(false)}
                          className="w-full p-2.5 bg-yellow text-navy font-bold uppercase tracking-wider flex items-center gap-2 hover:opacity-95 transition-all text-[11px]"
                        >
                          <QrCode className="w-4 h-4 shrink-0" />
                          <div className="truncate text-left">
                            <div>VIEW TEAM QR TICKET</div>
                            <div className="text-[9px] opacity-80 font-normal">
                              PASS: {ticket.teamId}
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <Link
                          href="/register"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full p-2.5 bg-yellow text-navy font-bold uppercase tracking-wider flex items-center gap-2 hover:opacity-95 transition-all text-[11px]"
                        >
                          <Ticket className="w-4 h-4 shrink-0" />
                          <span>REGISTER YOUR TEAM →</span>
                        </Link>
                      )}

                      <Link
                        href="/register"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full p-2 text-offwhite/80 hover:text-yellow hover:bg-white/5 flex items-center gap-2 transition-colors text-[11px] uppercase"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-yellow" />
                        <span>Registration Portal</span>
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full p-2 text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors text-[11px] uppercase text-left border-t border-line mt-1 pt-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>LOGOUT SESSION</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Guest State */
              <>
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
              </>
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

      {/* Full-screen Mobile Overlay Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-navy flex flex-col justify-between p-6 font-mono md:hidden animate-fade-in overflow-y-auto">
          <nav className="flex flex-col gap-5 pt-4">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xl font-display font-bold text-offwhite hover:text-yellow transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-6 border-t border-line flex flex-col gap-3 mt-6">
            {user ? (
              <div className="p-4 border border-yellow bg-[#0c223f] space-y-3">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-8 h-8 rounded-full border border-yellow"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-yellow text-navy font-bold flex items-center justify-center text-xs">
                      G
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <div className="font-bold text-offwhite truncate text-xs">{user.name}</div>
                    <div className="text-[10px] text-offwhite/60 truncate">{user.email}</div>
                  </div>
                </div>

                {ticket ? (
                  <Link
                    href={`/register/success/${ticket.teamId}?token=${ticket.token}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 text-center bg-yellow text-navy font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>VIEW TEAM QR TICKET ({ticket.teamId})</span>
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 text-center bg-yellow text-navy font-bold text-xs uppercase tracking-wider block"
                  >
                    REGISTER YOUR TEAM →
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-red-400 border border-red-500/30 text-xs uppercase"
                >
                  Logout Session
                </button>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
