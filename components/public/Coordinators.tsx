'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Phone, Mail, Linkedin, Users, UserCheck } from 'lucide-react';

interface CoordinatorItem {
  _id?: string;
  name: string;
  role: string;
  type: 'faculty' | 'student';
  photoUrl?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
}

interface PublicOrganizer {
  name: string;
  type: string;
  duty: string;
  photoUrl?: string;
}

export default function Coordinators({
  coordinators = [],
  showOrganizers = true,
}: {
  coordinators: CoordinatorItem[];
  showOrganizers?: boolean;
}) {
  const [organizers, setOrganizers] = useState<PublicOrganizer[]>([]);

  useEffect(() => {
    if (!showOrganizers) return;
    async function loadOrganizers() {
      try {
        const res = await fetch('/api/public/organizers');
        if (res.ok) {
          const data = await res.json();
          setOrganizers(data.organizers || []);
        }
      } catch {}
    }
    loadOrganizers();
  }, [showOrganizers]);

  const faculty = coordinators.filter((c) => c.type === 'faculty');
  const students = coordinators.filter((c) => c.type === 'student');

  return (
    <section id="coordinators" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 relative">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-xs uppercase tracking-widest mb-3">
          <Users className="w-3.5 h-3.5" />
          <span>Leadership Team</span>
        </div>
        <h2 className="font-mono text-3xl sm:text-4xl font-extrabold text-white">
          Event Coordinators
        </h2>
        <p className="text-neutral-400 font-mono text-xs sm:text-sm mt-2">
          Faculty advisors and student leads steering HackX 2026.
        </p>
      </div>

      {/* Faculty Group */}
      {faculty.length > 0 && (
        <div className="mb-14">
          <h3 className="font-mono text-sm uppercase tracking-wider text-primary font-bold mb-6 text-center">
            Faculty Advisors & Chairs
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {faculty.map((c, idx) => (
              <CoordinatorCard key={c._id || idx} coordinator={c} />
            ))}
          </div>
        </div>
      )}

      {/* Student Leads */}
      {students.length > 0 && (
        <div className="mb-14">
          <h3 className="font-mono text-sm uppercase tracking-wider text-accent font-bold mb-6 text-center">
            Lead Student Organizers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {students.map((c, idx) => (
              <CoordinatorCard key={c._id || idx} coordinator={c} />
            ))}
          </div>
        </div>
      )}

      {/* Organizing Team Volunteers Sub-Section */}
      {showOrganizers && organizers.length > 0 && (
        <div className="pt-10 border-t border-white/10">
          <div className="text-center mb-8">
            <h3 className="font-mono text-sm uppercase tracking-wider text-neutral-300 font-bold">
              Organizing Crew & Volunteers
            </h3>
            <p className="text-neutral-500 font-mono text-xs mt-1">
              Field coordinators, desk managers, and technical crew
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {organizers.map((org, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-white/10 bg-[#12121c]/70 text-center flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 overflow-hidden mb-2 relative">
                  {org.photoUrl ? (
                    <Image
                      src={org.photoUrl}
                      alt={org.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-mono font-bold text-primary text-xs">
                      {org.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <h4 className="font-mono text-xs font-bold text-white truncate max-w-full">
                  {org.name}
                </h4>
                <span className="font-mono text-[10px] text-neutral-400 capitalize">
                  {org.duty.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function CoordinatorCard({ coordinator }: { coordinator: CoordinatorItem }) {
  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-[#12121c]/90 text-center flex flex-col items-center hover:border-primary/40 transition-all backdrop-blur-md shadow-xl group">
      <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-white/15 overflow-hidden mb-4 relative group-hover:border-primary transition-colors">
        {coordinator.photoUrl ? (
          <Image
            src={coordinator.photoUrl}
            alt={coordinator.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-mono text-xl font-bold text-neutral-400">
            {coordinator.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      <h4 className="font-mono text-base font-bold text-white mb-1">
        {coordinator.name}
      </h4>
      <p className="text-neutral-400 font-sans text-xs mb-4">
        {coordinator.role}
      </p>

      {/* Contact Icons */}
      <div className="flex items-center gap-3 text-neutral-400 mt-auto">
        {coordinator.phone && (
          <a
            href={`tel:${coordinator.phone}`}
            title="Call"
            className="p-1.5 rounded-lg border border-white/10 hover:text-primary hover:border-primary/40 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
        )}
        {coordinator.email && (
          <a
            href={`mailto:${coordinator.email}`}
            title="Email"
            className="p-1.5 rounded-lg border border-white/10 hover:text-primary hover:border-primary/40 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
          </a>
        )}
        {coordinator.linkedin && (
          <a
            href={coordinator.linkedin}
            target="_blank"
            rel="noreferrer"
            title="LinkedIn"
            className="p-1.5 rounded-lg border border-white/10 hover:text-primary hover:border-primary/40 transition-colors"
          >
            <Linkedin className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
