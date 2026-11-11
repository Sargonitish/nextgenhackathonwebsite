'use client';

import { useState, useEffect, useRef } from 'react';
import { Phone, Mail } from 'lucide-react';
import { gsap, useGSAP, Flip, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';

export interface OrganizerItem {
  _id?: string;
  name: string;
  type?: 'faculty' | 'student' | 'external';
  duty?: string;
  photoUrl?: string;
  phone?: string;
  email?: string;
  department?: string;
  college?: string;
  yearOrDesignation?: string;
}

const DEFAULT_ORGANIZERS: OrganizerItem[] = [
  {
    _id: 'def-1',
    name: 'Kavya Ramesh',
    duty: 'registration_desk',
    type: 'student',
    yearOrDesignation: '3rd Year B.Tech',
    department: 'Computer Science & Engg',
    phone: '+91 98450 11223',
    email: 'kavya.reg@hackx.dev',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
  },
  {
    _id: 'def-2',
    name: 'Arjun Swaminathan',
    duty: 'tech_support',
    type: 'student',
    yearOrDesignation: '4th Year B.Tech',
    department: 'Information Technology',
    phone: '+91 98450 44556',
    email: 'arjun.tech@hackx.dev',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  },
  {
    _id: 'def-3',
    name: 'Rohit Balakrishnan',
    duty: 'logistics',
    type: 'student',
    yearOrDesignation: '3rd Year B.Tech',
    department: 'Electronics & Comm',
    phone: '+91 98450 77889',
    email: 'rohit.logistics@hackx.dev',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  },
  {
    _id: 'def-4',
    name: 'Ananya Deshmukh',
    duty: 'hospitality',
    type: 'student',
    yearOrDesignation: '2nd Year B.Tech',
    department: 'Data Science & AI',
    phone: '+91 98450 99001',
    email: 'ananya.hosp@hackx.dev',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  },
];

const DUTY_LABELS: Record<string, string> = {
  registration_desk: 'REGISTRATION DESK',
  tech_support: 'TECH & LAB SUPPORT',
  hospitality: 'HOSPITALITY & FOOD',
  logistics: 'LOGISTICS & VENUE',
  other: 'OPERATIONS LEAD',
};

export default function Organizers() {
  const [organizers, setOrganizers] = useState<OrganizerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const gridRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchOrganizers() {
      try {
        const res = await fetch('/api/public/organizers');
        if (res.ok) {
          const json = await res.json();
          if (isMounted) {
            if (json.organizers && json.organizers.length > 0) {
              setOrganizers(json.organizers);
            } else {
              setOrganizers(DEFAULT_ORGANIZERS);
            }
          }
        } else {
          if (isMounted) setOrganizers(DEFAULT_ORGANIZERS);
        }
      } catch (err) {
        console.error('Failed to load public organizers:', err);
        if (isMounted) setOrganizers(DEFAULT_ORGANIZERS);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOrganizers();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    const frameId = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(frameId);
  }, [loading]);

  const displayList = organizers.length > 0 ? organizers : DEFAULT_ORGANIZERS;

  // Duty categories available in current list
  const availableDuties = Array.from(new Set(displayList.map((o) => o.duty || 'other')));

  const filteredList =
    activeFilter === 'all'
      ? displayList
      : displayList.filter((o) => (o.duty || 'other') === activeFilter);

  const handleFilterChange = (nextFilter: string) => {
    if (nextFilter === activeFilter) return;
    if (!prefersReducedMotion() && gridRef.current) {
      const cards = gridRef.current.querySelectorAll<HTMLElement>('[data-flip-card]');
      flipStateRef.current = Flip.getState(cards);
    }
    setActiveFilter(nextFilter);
  };

  useGSAP(
    () => {
      const state = flipStateRef.current;
      if (!state) return;
      flipStateRef.current = null;
      if (prefersReducedMotion()) return;
      Flip.from(state, {
        targets: '[data-flip-card]',
        duration: 0.4,
        ease: 'power2.out',
        scale: true,
        stagger: 0.03,
        onEnter: (elements) =>
          gsap.fromTo(
            elements,
            { opacity: 0, scale: 0.94 },
            { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out', clearProps: 'transform,opacity' }
          ),
        onComplete: () => {
          ScrollTrigger.refresh();
        },
      });
    },
    { dependencies: [activeFilter], scope: gridRef }
  );

  return (
    <section id="organizers" className="py-16 sm:py-20 max-w-[1280px] mx-auto px-4 sm:px-8 border-t border-line relative z-10">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-offwhite tracking-tight">
            Operations &amp; Desk Leads
          </h2>
          <p className="font-mono text-xs sm:text-sm text-offwhite/75 mt-2 max-w-2xl leading-relaxed">
            On-site committee leads and student organizers managing participant help desks, lab hardware, logistics, and round-the-clock hospitality.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1.5 border transition-colors uppercase tracking-wider cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-yellow text-navy border-yellow font-bold shadow-[2px_2px_0_rgba(242,239,230,0.3)]'
                : 'border-line text-offwhite/80 hover:text-yellow hover:border-yellow/50 bg-navy'
            }`}
          >
            All Desks ({displayList.length})
          </button>
          {availableDuties.map((dutyKey) => (
            <button
              key={dutyKey}
              type="button"
              onClick={() => handleFilterChange(dutyKey)}
              className={`px-3 py-1.5 border transition-colors uppercase tracking-wider cursor-pointer ${
                activeFilter === dutyKey
                  ? 'bg-yellow text-navy border-yellow font-bold shadow-[2px_2px_0_rgba(242,239,230,0.3)]'
                  : 'border-line text-offwhite/80 hover:text-yellow hover:border-yellow/50 bg-navy'
              }`}
            >
              {DUTY_LABELS[dutyKey] || dutyKey}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Organizers */}
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredList.map((org, index) => {
          const dutyLabel = DUTY_LABELS[org.duty || 'other'] || org.duty?.toUpperCase() || 'OPERATIONS';
          const flipId = org._id || `${org.name}-${org.duty || 'other'}`;

          return (
            <div
              key={flipId}
              data-flip-card
              data-flip-id={flipId}
              className="border border-line bg-navy/80 p-5 flex flex-col justify-between relative group hover:border-yellow transition-colors shadow-hard"
            >
              {/* Top: Duty Tag */}
              <div>
                <div className="mb-3">
                  <span className="inline-block px-2 py-0.5 border border-yellow/40 bg-yellow/10 font-mono text-[9px] uppercase tracking-wider text-yellow font-bold truncate">
                    {dutyLabel}
                  </span>
                </div>

                {/* Name & Academic Credentials */}
                <h3 className="font-display font-black text-lg text-offwhite tracking-tight group-hover:text-yellow transition-colors">
                  {org.name}
                </h3>

                {org.yearOrDesignation && (
                  <p className="font-mono text-xs text-yellow mt-0.5 tracking-wide font-medium">
                    {org.yearOrDesignation}
                  </p>
                )}

                {org.department && (
                  <p className="font-mono text-[11px] text-offwhite/80 mt-1 leading-snug">
                    {org.department}
                  </p>
                )}
                {org.college && (
                  <p className="font-mono text-[10px] text-offwhite/65 mt-0.5 leading-snug">
                    {org.college}
                  </p>
                )}
              </div>

              {/* Contact Links Bar */}
              <div className="mt-5 pt-3 border-t border-line/60 flex flex-col gap-2 font-mono text-xs">
                {org.phone && (
                  <a
                    href={`tel:${org.phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-2 text-offwhite/85 hover:text-yellow transition-colors truncate"
                    title={`Call ${org.name}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-yellow shrink-0" />
                    <span className="tracking-wider text-[11px]">{org.phone}</span>
                  </a>
                )}
                {org.email && (
                  <a
                    href={`mailto:${org.email}`}
                    className="flex items-center gap-2 text-offwhite/85 hover:text-yellow transition-colors truncate"
                    title={`Email ${org.name}`}
                  >
                    <Mail className="w-3.5 h-3.5 text-yellow shrink-0" />
                    <span className="tracking-wider text-[11px] truncate">{org.email}</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
