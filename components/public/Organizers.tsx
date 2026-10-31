'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Phone, Mail, ShieldCheck, UserCheck, Layers } from 'lucide-react';

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

  const displayList = organizers.length > 0 ? organizers : DEFAULT_ORGANIZERS;

  // Duty categories available in current list
  const availableDuties = Array.from(new Set(displayList.map((o) => o.duty || 'other')));

  const filteredList =
    activeFilter === 'all'
      ? displayList
      : displayList.filter((o) => (o.duty || 'other') === activeFilter);

  return (
    <section id="organizers" className="py-20 max-w-[1280px] mx-auto px-4 sm:px-8 border-t border-line relative z-10">
      {/* Blueprint Header */}
      <div className="flex items-center justify-between font-mono text-xs text-offwhite/50 uppercase tracking-widest mb-8">
        <div>06 / ORGANIZING COMMITTEE &amp; OPERATIONS</div>
        <div className="hidden sm:inline">[DESK LEADS // OPERATIONS CREW]</div>
      </div>

      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-offwhite uppercase tracking-tight">
            OPERATIONS &amp; DESK LEADS
          </h2>
          <p className="font-mono text-xs sm:text-sm text-offwhite/70 mt-2 max-w-2xl leading-relaxed">
            On-site committee leads and student organizers managing participant help desks, lab hardware, logistics, and round-the-clock hospitality.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 border transition-all uppercase tracking-wider ${
              activeFilter === 'all'
                ? 'bg-yellow text-navy border-yellow font-bold shadow-[2px_2px_0_rgba(242,239,230,0.3)]'
                : 'border-line text-offwhite/70 hover:text-yellow hover:border-yellow/50 bg-navy'
            }`}
          >
            ALL DESKS ({displayList.length})
          </button>
          {availableDuties.map((dutyKey) => (
            <button
              key={dutyKey}
              type="button"
              onClick={() => setActiveFilter(dutyKey)}
              className={`px-3 py-1.5 border transition-all uppercase tracking-wider ${
                activeFilter === dutyKey
                  ? 'bg-yellow text-navy border-yellow font-bold shadow-[2px_2px_0_rgba(242,239,230,0.3)]'
                  : 'border-line text-offwhite/70 hover:text-yellow hover:border-yellow/50 bg-navy'
              }`}
            >
              {DUTY_LABELS[dutyKey] || dutyKey}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Organizers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredList.map((org, index) => {
          const dutyLabel = DUTY_LABELS[org.duty || 'other'] || org.duty?.toUpperCase() || 'OPERATIONS';

          return (
            <div
              key={org._id || `org-${index}`}
              className="border border-line bg-navy/80 p-5 flex flex-col justify-between relative group hover:border-yellow transition-colors shadow-hard"
            >
              {/* Corner Blueprint Accent */}
              <span className="absolute top-2 right-2 text-[10px] text-yellow/40 group-hover:text-yellow font-mono select-none">
                +
              </span>

              {/* Top: Duty Tag & Type */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block px-2 py-0.5 border border-yellow/40 bg-yellow/10 font-mono text-[9px] uppercase tracking-wider text-yellow font-semibold">
                    [ {dutyLabel} ]
                  </span>
                  <span className="font-mono text-[9px] text-offwhite/40 tracking-wider">
                    ORD #{String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Photo / Avatar */}
                <div className="w-full aspect-square border border-line mb-4 relative overflow-hidden bg-white/[0.02]">
                  {org.photoUrl ? (
                    <Image
                      src={org.photoUrl}
                      alt={org.name}
                      fill
                      className="object-cover filter grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center font-mono text-offwhite/30 text-xs">
                      <UserCheck className="w-8 h-8 mb-2 text-offwhite/20 group-hover:text-yellow transition-colors" />
                      <span>{org.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-navy/90 border border-line font-mono text-[8px] text-offwhite/60 tracking-wider">
                    {org.type ? `ROLE: ${org.type.toUpperCase()}` : 'ACTIVE STAFF'}
                  </div>
                </div>

                {/* Name & Academic Credentials */}
                <h3 className="font-display font-black text-lg text-offwhite uppercase tracking-tight group-hover:text-yellow transition-colors">
                  {org.name}
                </h3>

                {org.yearOrDesignation && (
                  <p className="font-mono text-xs text-yellow mt-0.5 tracking-wide">
                    {org.yearOrDesignation}
                  </p>
                )}

                {org.department && (
                  <p className="font-mono text-[11px] text-offwhite/60 mt-1 leading-snug">
                    {org.department}
                  </p>
                )}
                {org.college && (
                  <p className="font-mono text-[10px] text-offwhite/40 mt-0.5 leading-snug">
                    {org.college}
                  </p>
                )}
              </div>

              {/* Contact Links Bar */}
              <div className="mt-5 pt-3 border-t border-line/60 flex flex-col gap-2 font-mono text-xs">
                {org.phone && (
                  <a
                    href={`tel:${org.phone}`}
                    className="flex items-center gap-2 text-offwhite/80 hover:text-yellow transition-colors truncate"
                    title={`Call ${org.name}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-yellow shrink-0" />
                    <span className="tracking-wider text-[11px]">{org.phone}</span>
                  </a>
                )}
                {org.email && (
                  <a
                    href={`mailto:${org.email}`}
                    className="flex items-center gap-2 text-offwhite/80 hover:text-yellow transition-colors truncate"
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
