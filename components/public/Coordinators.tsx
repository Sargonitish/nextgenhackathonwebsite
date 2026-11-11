'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Phone, Mail, Linkedin, GraduationCap, Award } from 'lucide-react';
import { gsap, useGSAP, Flip, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';

export interface CoordinatorItem {
  _id?: string;
  name: string;
  role: string;
  type?: 'faculty' | 'student';
  phone?: string;
  email?: string;
  photoUrl?: string;
  linkedin?: string;
  department?: string;
  college?: string;
}

const DEFAULT_COORDINATORS: CoordinatorItem[] = [
  {
    name: 'Dr. S. Rajagopalan',
    role: 'Faculty Coordinator (Head of CSE)',
    type: 'faculty',
    phone: '+91 98401 23456',
    email: 'rajagopalan@college.edu',
    department: 'Computer Science & Engineering',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    linkedin: 'https://linkedin.com',
  },
  {
    name: 'Dr. Priya Sundaram',
    role: 'Faculty Advisor (Innovation Cell)',
    type: 'faculty',
    phone: '+91 98406 54321',
    email: 'priya.s@college.edu',
    department: 'Information Technology',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    linkedin: 'https://linkedin.com',
  },
  {
    name: 'Aravind Raman',
    role: 'Lead Student Coordinator',
    type: 'student',
    phone: '+91 91234 56789',
    email: 'aravind.r@student.edu',
    department: 'CSE / 4th Year',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
    linkedin: 'https://linkedin.com',
  },
  {
    name: 'Sneha Reddy',
    role: 'Joint Student Coordinator',
    type: 'student',
    phone: '+91 98765 43210',
    email: 'sneha.reddy@student.edu',
    department: 'ECE / 4th Year',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    linkedin: 'https://linkedin.com',
  },
];

export default function Coordinators({
  coordinators = [],
}: {
  coordinators?: CoordinatorItem[];
}) {
  const [filter, setFilter] = useState<'all' | 'faculty' | 'student'>('all');
  const gridRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);

  const displayList =
    coordinators && coordinators.length > 0 ? coordinators : DEFAULT_COORDINATORS;

  const filteredTeam = displayList.filter((m) => {
    if (filter === 'all') return true;
    return m.type === filter;
  });

  const handleFilterChange = (nextFilter: 'all' | 'faculty' | 'student') => {
    if (nextFilter === filter) return;
    if (!prefersReducedMotion() && gridRef.current) {
      const cards = gridRef.current.querySelectorAll<HTMLElement>('[data-flip-card]');
      flipStateRef.current = Flip.getState(cards);
    }
    setFilter(nextFilter);
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
    { dependencies: [filter], scope: gridRef }
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const normalizeUrl = (url?: string): string => {
    if (!url) return '#';
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  return (
    <section id="coordinators" className="py-16 sm:py-20 max-w-[1280px] mx-auto px-4 sm:px-8 border-t border-line relative z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-offwhite tracking-tight">
            Faculty Directors &amp; Lead Coordinators
          </h2>
          <p className="font-mono text-xs sm:text-sm text-offwhite/75 mt-2 max-w-2xl leading-relaxed">
            Faculty chairs and student directors supervising event governance, mentor panels, challenge design, and judging integrity.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 font-mono text-xs shrink-0">
          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-yellow text-navy font-bold border-yellow shadow-hard-sm'
                : 'border-line text-offwhite/80 hover:border-yellow hover:text-yellow'
            }`}
          >
            All ({displayList.length})
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('faculty')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer ${
              filter === 'faculty'
                ? 'bg-yellow text-navy font-bold border-yellow shadow-hard-sm'
                : 'border-line text-offwhite/80 hover:border-yellow hover:text-yellow'
            }`}
          >
            Faculty
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('student')}
            className={`px-3 py-1.5 border transition-colors cursor-pointer ${
              filter === 'student'
                ? 'bg-yellow text-navy font-bold border-yellow shadow-hard-sm'
                : 'border-line text-offwhite/80 hover:border-yellow hover:text-yellow'
            }`}
          >
            Student Leads
          </button>
        </div>
      </div>

      {/* Grid of Coordinator Cards */}
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredTeam.map((member, idx) => {
          const isFaculty = member.type === 'faculty';
          const flipId = member._id || `${member.name}-${member.role || idx}`;

          return (
            <div
              key={flipId}
              data-flip-card
              data-flip-id={flipId}
              className="border border-line bg-[#0c223f] hover:border-yellow shadow-hard-sm transition-colors duration-150 flex flex-col justify-between p-5 relative group"
            >
              <div>
                {/* Role Tag */}
                <div className="pb-3 mb-4 border-b border-line font-mono text-[10px]">
                  <span
                    className={`inline-block px-2 py-0.5 border font-bold uppercase tracking-wider ${
                      isFaculty
                        ? 'border-yellow/70 bg-yellow/10 text-yellow'
                        : 'border-line bg-navy text-offwhite/80'
                    }`}
                  >
                    {isFaculty ? 'Faculty Director' : 'Lead Coordinator'}
                  </span>
                </div>

                {/* Profile Header: Avatar + Name + Role */}
                <div className="space-y-3">
                  <div className="w-full aspect-square bg-navy border border-line flex items-center justify-center overflow-hidden relative shadow-sm">
                    {member.photoUrl ? (
                      <Image
                        src={member.photoUrl}
                        alt={member.name}
                        fill
                        className="object-cover filter grayscale contrast-125 group-hover:grayscale-0 group-hover:contrast-100 group-hover:scale-105 motion-reduce:group-hover:scale-100 transition-[filter,transform] duration-300 ease-in-out"
                        unoptimized
                      />
                    ) : (
                      <div className="font-display font-black text-3xl text-offwhite/65 group-hover:text-yellow transition-colors select-none">
                        {getInitials(member.name)}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-base text-offwhite group-hover:text-yellow transition-colors truncate">
                      {member.name}
                    </h3>
                    <p className="font-mono text-xs text-yellow font-bold mt-0.5 leading-snug">
                      {member.role}
                    </p>
                    {member.department && (
                      <p className="font-mono text-[11px] text-offwhite/70 mt-1 truncate">
                        {member.department}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Direct Contact Details */}
              <div className="mt-5 pt-3.5 border-t border-line font-mono text-xs space-y-2">
                {member.phone && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-offwhite/65 text-[10px] uppercase">Phone</span>
                    <a
                      href={`tel:${member.phone.replace(/\s+/g, '')}`}
                      className="text-yellow hover:underline flex items-center gap-1.5 font-bold tracking-wider text-[11px]"
                      title={`Call ${member.name}`}
                    >
                      <Phone className="w-3 h-3 text-yellow shrink-0" />
                      <span>{member.phone}</span>
                    </a>
                  </div>
                )}

                {member.email && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-offwhite/65 text-[10px] uppercase">Email</span>
                    <a
                      href={`mailto:${member.email}`}
                      className="text-offwhite/85 hover:text-yellow flex items-center gap-1.5 max-w-[170px] truncate text-[11px]"
                      title={`Email ${member.name}`}
                    >
                      <Mail className="w-3 h-3 text-offwhite/65 group-hover:text-yellow shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </a>
                  </div>
                )}

                {member.linkedin && (
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-offwhite/65 text-[10px] uppercase">Profile</span>
                    <a
                      href={normalizeUrl(member.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-offwhite/80 hover:text-yellow flex items-center gap-1 text-[11px] transition-colors"
                    >
                      <Linkedin className="w-3 h-3 text-[#4da3d9]" />
                      <span>LinkedIn ↗</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
