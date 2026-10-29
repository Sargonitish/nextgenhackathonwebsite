'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  QrCode,
  Users,
  LayoutDashboard,
  User,
  LogOut,
  Shield,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface OrganizerProfile {
  id: string;
  name: string;
  username: string;
  duty: string;
  status: string;
  permissions: {
    checkin: boolean;
    viewTeams: boolean;
    viewContacts: boolean;
  };
}

export default function OrganizerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/organizer/profile')
      .then((res) => {
        if (!res.ok) {
          router.replace('/organizer/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.organizer) {
          setProfile(data.organizer);
        }
      })
      .catch(() => {
        router.replace('/organizer/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/organizer/auth/logout', { method: 'POST' });
      router.push('/organizer/login');
      router.refresh();
    } catch {
      router.push('/organizer/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070F] text-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const navLinks = [
    {
      label: 'Ops Dashboard',
      href: '/organizer',
      icon: LayoutDashboard,
      active: pathname === '/organizer',
    },
    {
      label: 'Desk Scanner',
      href: '/checkin',
      icon: QrCode,
      active: pathname === '/checkin',
      highlight: true,
    },
    {
      label: 'Participant Roster',
      href: '/organizer/teams',
      icon: Users,
      active: pathname === '/organizer/teams',
    },
    {
      label: 'My Account',
      href: '/organizer/profile',
      icon: User,
      active: pathname === '/organizer/profile',
    },
  ];

  return (
    <div className="min-h-screen bg-[#05070F] text-slate-100 flex flex-col selection:bg-cyan-500/30">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/organizer"
              className="flex items-center gap-2 font-mono font-bold text-white text-base tracking-tight hover:opacity-80 transition"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Shield className="w-4 h-4" />
              </div>
              <span>HACKX <span className="text-cyan-400">CREW</span></span>
            </Link>

            {profile && (
              <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                {profile.duty.replace('_', ' ')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-200">{profile?.name}</div>
              <div className="text-[10px] font-mono text-cyan-400">@{profile?.username}</div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile / Desktop Nav Tabs */}
        <div className="max-w-5xl mx-auto mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-around sm:justify-start sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  link.active
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : link.highlight
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-[11px] font-mono text-slate-600">
        College Hackathon Operations Engine • Organizer Session Active
      </footer>
    </div>
  );
}
