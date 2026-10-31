'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Phone, Mail, Linkedin, Users, GraduationCap, Award } from 'lucide-react';

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
  duty?: string;
}

const DEFAULT_TEAM: CoordinatorItem[] = [
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
    role: 'Operations & Tech Infrastructure',
    type: 'student',
    phone: '+91 98765 43210',
    email: 'sneha.reddy@student.edu',
    department: 'ECE / 3rd Year',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    linkedin: 'https://linkedin.com',
  },
  {
    name: 'Karan Malhotra',
    role: 'Sponsorships & Industry Liaisons',
    type: 'student',
    phone: '+91 94455 66778',
    email: 'karan.m@student.edu',
    department: 'AI & Data Science',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    linkedin: 'https://linkedin.com',
  },
  {
    name: 'Diya Patel',
    role: 'Registration Desk & Logistics Lead',
    type: 'student',
    phone: '+91 98888 77766',
    email: 'diya.patel@student.edu',
    department: 'CSE / 3rd Year',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
    linkedin: 'https://linkedin.com',
  },
];

export default function Coordinators({
  coordinators = [],
  showOrganizers = true,
}: {
  coordinators: CoordinatorItem[];
  showOrganizers?: boolean;
}) {
  const [filter, setFilter] = useState<'all' | 'faculty' | 'student'>('all');
  const [mergedTeam, setMergedTeam] = useState<CoordinatorItem[]>([]);

  useEffect(() => {
    async function loadOrganizers() {
      // 1. Start with coordinators from Event model (or defaults if empty)
      const baseList: CoordinatorItem[] =
        coordinators && coordinators.length > 0 ? [...coordinators] : [...DEFAULT_TEAM];

      if (!showOrganizers) {
        setMergedTeam(baseList);
        return;
      }

      // 2. Fetch approved organizers with showOnWebsite: true
      try {
        const res = await fetch('/api/public/organizers');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.organizers) && data.organizers.length > 0) {
            const formatted: CoordinatorItem[] = data.organizers.map((org: any) => ({
              _id: org._id,
              name: org.name,
              role: org.duty ? org.duty.replace(/_/g, ' ').toUpperCase() : 'ORGANIZER',
              type: org.type === 'faculty' ? 'faculty' : 'student',
              phone: org.phone,
              email: org.email,
              photoUrl: org.photoUrl,
              department: org.department,
              college: org.college,
              duty: org.duty,
            }));

            // Avoid duplicate entries if name matches
            const existingNames = new Set(baseList.map((m) => m.name.toLowerCase().trim()));
            const nonDuplicates = formatted.filter(
              (o) => !existingNames.has(o.name.toLowerCase().trim())
            );

            setMergedTeam([...baseList, ...nonDuplicates]);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to load public organizers:', err);
      }

      setMergedTeam(baseList);
    }

    loadOrganizers();
  }, [coordinators, showOrganizers]);

  if (!showOrganizers && mergedTeam.length === 0) return null;

  const filteredTeam = mergedTeam.filter((m) => {
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

  return (
    <section id="coordinators" className="py-20 max-w-[1280px] mx-auto px-4 sm:px-8 border-t border-line relative z-10">
      {/* Section Header Metadata */}
      <div className="flex items-center justify-between font-mono text-xs text-offwhite/50 uppercase tracking-widest mb-8">
        <div>05 / TEAM &amp; ORGANIZERS</div>
        <div className="hidden sm:inline">[PERSONNEL TELEMETRY // DIRECT CONTACT]</div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-offwhite uppercase tracking-tight">
            ORGANIZING COMMITTEE &amp; LEADS
          </h2>
          <p className="font-mono text-xs sm:text-sm text-offwhite/70 mt-2 max-w-2xl leading-relaxed">
            Faculty directors, core student leads, and logistics coordinators responsible for event execution. Reach out directly for support.
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
            ALL [{mergedTeam.length}]
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
            STUDENTS
          </button>
        </div>
      </div>

      {/* Grid of Coordinator & Organizer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    {isFaculty ? '[ FACULTY COORDINATOR ]' : '[ STUDENT COMMITTEE ]'}
                  </span>
                  <span className="text-offwhite/40">#0{idx + 1}</span>
                </div>

                {/* Profile Header: Avatar + Name + Role */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-navy border border-line flex items-center justify-center overflow-hidden relative shadow-sm">
                    {member.photoUrl ? (
                      <Image
                        src={member.photoUrl}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="font-display font-black text-2xl text-offwhite/40 group-hover:text-yellow transition-colors select-none">
                        {getInitials(member.name)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-base sm:text-lg text-offwhite group-hover:text-yellow transition-colors truncate">
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
                {/* Phone Link */}
                {member.phone ? (
                  <div className="flex items-center justify-between">
                    <span className="text-offwhite/40 text-[10px] uppercase">PHONE:</span>
                    <a
                      href={`tel:${member.phone.replace(/\s+/g, '')}`}
                      className="text-yellow hover:underline flex items-center gap-1.5 font-bold tracking-wider"
                      title={`Call ${member.name}`}
                    >
                      <Phone className="w-3 h-3 text-yellow" />
                      <span>{member.phone}</span>
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px] text-offwhite/30">
                    <span>PHONE:</span>
                    <span>VIA HELPDESK</span>
                  </div>
                )}

                {/* Email Link */}
                {member.email ? (
                  <div className="flex items-center justify-between">
                    <span className="text-offwhite/40 text-[10px] uppercase">EMAIL:</span>
                    <a
                      href={`mailto:${member.email}`}
                      className="text-offwhite hover:text-yellow flex items-center gap-1.5 max-w-[200px] truncate text-[11px]"
                      title={`Email ${member.name}`}
                    >
                      <Mail className="w-3 h-3 text-offwhite/50 group-hover:text-yellow" />
                      <span className="truncate">{member.email}</span>
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px] text-offwhite/30">
                    <span>EMAIL:</span>
                    <span>HACKX@COLLEGE.EDU</span>
                  </div>
                )}

                {/* LinkedIn Profile */}
                {member.linkedin && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-offwhite/40 text-[10px] uppercase">NETWORK:</span>
                    <a
                      href={member.linkedin}
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
