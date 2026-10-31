'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Phone, Mail, Linkedin, GraduationCap, Award } from 'lucide-react';

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

  const displayList =
    coordinators && coordinators.length > 0 ? coordinators : DEFAULT_COORDINATORS;

  const filteredTeam = displayList.filter((m) => {
    if (filter === 'all') return true;
    return m.type === filter;
  });

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
    <section id="coordinators" className="py-20 max-w-[1280px] mx-auto px-4 sm:px-8 border-t border-line relative z-10">
      {/* Section Header Metadata */}
      <div className="flex items-center justify-between font-mono text-xs text-offwhite/50 uppercase tracking-widest mb-8">
        <div>05 / EVENT COORDINATORS</div>
        <div className="hidden sm:inline">[FACULTY DIRECTORS &amp; LEAD COORDINATORS]</div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-offwhite uppercase tracking-tight">
            FACULTY DIRECTORS &amp; LEAD COORDINATORS
          </h2>
          <p className="font-mono text-xs sm:text-sm text-offwhite/70 mt-2 max-w-2xl leading-relaxed">
            Faculty chairs and student directors supervising event governance, mentor panels, challenge design, and judging integrity.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 font-mono text-xs shrink-0">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 border transition-all ${
              filter === 'all'
                ? 'bg-yellow text-navy font-bold border-yellow shadow-hard-sm'
                : 'border-line text-offwhite/70 hover:border-yellow'
            }`}
          >
            ALL [{displayList.length}]
          </button>
          <button
            type="button"
            onClick={() => setFilter('faculty')}
            className={`px-3 py-1.5 border transition-all ${
              filter === 'faculty'
                ? 'bg-yellow text-navy font-bold border-yellow shadow-hard-sm'
                : 'border-line text-offwhite/70 hover:border-yellow'
            }`}
          >
            FACULTY
          </button>
          <button
            type="button"
            onClick={() => setFilter('student')}
            className={`px-3 py-1.5 border transition-all ${
              filter === 'student'
                ? 'bg-yellow text-navy font-bold border-yellow shadow-hard-sm'
                : 'border-line text-offwhite/70 hover:border-yellow'
            }`}
          >
            STUDENT LEADS
          </button>
        </div>
      </div>

      {/* Grid of Coordinator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredTeam.map((member, idx) => {
          const isFaculty = member.type === 'faculty';

          return (
            <div
              key={member._id || idx}
              className="border border-line bg-[#0c223f] hover:border-yellow shadow-hard-sm transition-all duration-150 flex flex-col justify-between p-5 relative group"
            >
              {/* Corner Blueprint Crosshairs */}
              <span className="absolute top-2 left-2 text-[10px] text-yellow/40 select-none group-hover:text-yellow transition-colors">+</span>
              <span className="absolute top-2 right-2 text-[10px] text-yellow/40 select-none group-hover:text-yellow transition-colors">+</span>

              <div>
                {/* Category & Status Bar */}
                <div className="flex items-center justify-between font-mono text-[10px] pb-3 mb-4 border-b border-line">
                  <span
                    className={`px-2 py-0.5 border font-bold uppercase tracking-wider ${
                      isFaculty
                        ? 'border-yellow/70 bg-yellow/10 text-yellow'
                        : 'border-line bg-navy text-offwhite/70'
                    }`}
                  >
                    {isFaculty ? '[ FACULTY DIRECTOR ]' : '[ LEAD COORDINATOR ]'}
                  </span>
                  <span className="text-offwhite/40">#0{idx + 1}</span>
                </div>

                {/* Profile Header: Avatar + Name + Role */}
                <div className="space-y-3">
                  <div className="w-full aspect-square bg-navy border border-line flex items-center justify-center overflow-hidden relative shadow-sm">
                    {member.photoUrl ? (
                      <Image
                        src={member.photoUrl}
                        alt={member.name}
                        fill
                        className="object-cover filter grayscale contrast-125 group-hover:grayscale-0 group-hover:contrast-100 group-hover:scale-105 transition-all duration-300 ease-in-out"
                        unoptimized
                      />
                    ) : (
                      <div className="font-display font-black text-3xl text-offwhite/40 group-hover:text-yellow transition-colors select-none">
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
                      <p className="font-mono text-[11px] text-offwhite/50 mt-1 truncate">
                        {member.department}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Direct Contact Details Plate */}
              <div className="mt-5 pt-3.5 border-t border-line font-mono text-xs space-y-2">
                {member.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-offwhite/40 text-[10px] uppercase">PHONE:</span>
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
                  <div className="flex items-center justify-between">
                    <span className="text-offwhite/40 text-[10px] uppercase">EMAIL:</span>
                    <a
                      href={`mailto:${member.email}`}
                      className="text-offwhite hover:text-yellow flex items-center gap-1.5 max-w-[170px] truncate text-[11px]"
                      title={`Email ${member.name}`}
                    >
                      <Mail className="w-3 h-3 text-offwhite/50 group-hover:text-yellow shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </a>
                  </div>
                )}

                {member.linkedin && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-offwhite/40 text-[10px] uppercase">NETWORK:</span>
                    <a
                      href={normalizeUrl(member.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-offwhite/60 hover:text-yellow flex items-center gap-1 text-[11px] transition-colors"
                    >
                      <Linkedin className="w-3 h-3 text-[#0077b5]" />
                      <span>[LINKEDIN]</span>
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
