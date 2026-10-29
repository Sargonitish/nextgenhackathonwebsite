'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Timer,
  Palette,
  FileText,
  Users2,
  Code2,
  Clock,
  Trophy,
  BadgeDollarSign,
  Image as ImageIcon,
  HelpCircle,
  Megaphone,
  UserCheck,
  UserPlus,
  Sliders,
  ShieldAlert,
  QrCode,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';

interface EventSummary {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isArchived: boolean;
}

function AdminPanelContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventParam = searchParams.get('event');

  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContext() {
      try {
        const res = await fetch('/api/admin/context');
        if (res.status === 401 || res.status === 403) {
          router.replace('/admin/login');
          return;
        }
        const data = await res.json();
        setAdminName(data.admin?.name || 'Admin');
        setEvents(data.events || []);
        setPendingCount(data.pendingOrganizersCount || 0);

        // Select active or specified event
        const active = data.events?.find((e: EventSummary) => e.isActive);
        if (eventParam && data.events?.some((e: EventSummary) => e._id === eventParam)) {
          setSelectedEventId(eventParam);
        } else if (active) {
          setSelectedEventId(active._id);
        } else if (data.events?.length > 0) {
          setSelectedEventId(data.events[0]._id);
        }
      } catch (err) {
        console.error('Failed to load admin layout context:', err);
      } finally {
        setLoading(false);
      }
    }
    loadContext();
  }, [router, eventParam]);

  const handleEventChange = (newId: string) => {
    setSelectedEventId(newId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('event', newId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      toast.success('Logged out');
      router.replace('/admin/login');
    } catch {
      router.replace('/admin/login');
    }
  };

  const selectedEvent = events.find((e) => e._id === selectedEventId);

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Editions', href: '/admin/editions', icon: Calendar },
    { label: 'Event Timer', href: '/admin/timer', icon: Timer },
    { label: 'Branding & Theme', href: '/admin/branding', icon: Palette },
    { label: 'Site Content', href: '/admin/content', icon: FileText },
    { label: 'Coordinators', href: '/admin/coordinators', icon: Users2 },
    { label: 'Tracks', href: '/admin/tracks', icon: Code2 },
    { label: 'Schedule', href: '/admin/schedule', icon: Clock },
    { label: 'Prizes', href: '/admin/prizes', icon: Trophy },
    { label: 'Sponsors', href: '/admin/sponsors', icon: BadgeDollarSign },
    { label: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
    { label: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
    { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
    { label: 'Registrations', href: '/admin/registrations', icon: UserCheck },
    {
      label: 'Organizers',
      href: '/admin/organizers',
      icon: UserPlus,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    { label: 'QR Check-in Desk', href: '/checkin', icon: QrCode },
    { label: 'Event Settings', href: '/admin/settings', icon: Sliders },
    { label: 'Security & 2FA', href: '/admin/security', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#101018]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-mono font-bold text-xs">
            HX
          </div>
          <span className="font-mono font-bold text-sm tracking-tight">Admin Console</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg border border-white/10 text-neutral-300"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 flex-shrink-0 flex flex-col border-r border-white/10 bg-[#0d0d14] transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-mono font-bold text-sm">
              ⚡
            </div>
            <div>
              <span className="font-mono font-bold text-sm tracking-tight text-white block">
                HACKX ADMIN
              </span>
              <span className="text-[10px] font-mono text-neutral-400 block">v2026 Core Suite</span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

            const href =
              selectedEventId && item.href.startsWith('/admin')
                ? `${item.href}?event=${selectedEventId}`
                : item.href;

            return (
              <Link
                key={item.label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-primary/10 border border-primary/30 text-primary font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white font-bold text-[10px] animate-pulse">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* User bar & Logout */}
        <div className="p-3 border-t border-white/10 bg-black/40">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="truncate mr-2">
              <span className="text-[11px] font-mono text-neutral-400 block">Signed in as</span>
              <span className="text-xs font-mono font-semibold text-white truncate block">
                {adminName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#0d0d14]/80 backdrop-blur-md">
          {/* Edition Switcher */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-neutral-400 hidden sm:inline">Active Edition:</span>
            <select
              value={selectedEventId}
              onChange={(e) => handleEventChange(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-primary"
            >
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.name} {ev.isActive ? '★ LIVE' : ev.isArchived ? '⚰ ARCHIVED' : '(DRAFT)'}
                </option>
              ))}
              {events.length === 0 && <option value="">No Events Found</option>}
            </select>

            {/* Edition status pill */}
            {selectedEvent && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                  selectedEvent.isActive
                    ? 'bg-primary/10 border border-primary/30 text-primary'
                    : selectedEvent.isArchived
                    ? 'bg-neutral-800 border border-neutral-700 text-neutral-400'
                    : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
                }`}
              >
                {selectedEvent.isActive ? (
                  <>
                    <Flame className="w-3 h-3 animate-pulse" /> LIVE
                  </>
                ) : selectedEvent.isArchived ? (
                  'ARCHIVED'
                ) : (
                  'DRAFT'
                )}
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 text-xs font-mono text-neutral-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <span>View Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070913] flex items-center justify-center text-cyan-400 font-mono text-xs">
          Loading admin workspace...
        </div>
      }
    >
      <AdminPanelContent>{children}</AdminPanelContent>
    </Suspense>
  );
}
