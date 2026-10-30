'use client';

import { useState } from 'react';
import { Clock, Calendar, Sparkles } from 'lucide-react';

interface ScheduleItem {
  _id?: string;
  day: string;
  time: string;
  title: string;
  description: string;
  order: number;
}

export default function Schedule({ schedule = [] }: { schedule: ScheduleItem[] }) {
  if (schedule.length === 0) return null;

  // Group items by day
  const daysMap: Record<string, ScheduleItem[]> = {};
  schedule.forEach((item) => {
    const day = item.day || 'Day 1';
    if (!daysMap[day]) daysMap[day] = [];
    daysMap[day].push(item);
  });

  const dayKeys = Object.keys(daysMap);
  const [selectedDay, setSelectedDay] = useState<string>('all');

  const filteredDays =
    selectedDay === 'all'
      ? Object.entries(daysMap)
      : Object.entries(daysMap).filter(([day]) => day === selectedDay);

  return (
    <section id="schedule" className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto z-10 relative">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-xs font-semibold uppercase tracking-widest mb-4 backdrop-blur-md shadow-[0_0_15px_rgba(0,255,157,0.15)]">
          <Calendar className="w-3.5 h-3.5" />
          <span>EVENT TIMELINE</span>
        </div>
        <h2 className="font-mono text-3xl sm:text-5xl font-black text-white tracking-tight">
          Milestones & Schedule
        </h2>
        <p className="text-neutral-400 font-sans text-sm sm:text-base mt-3 leading-relaxed">
          From opening ceremonies and lightning mentorship checkpoints to midnight pizza drops and final project pitching.
        </p>

        {/* Day Selector Tabs */}
        {dayKeys.length > 1 && (
          <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl border border-white/10 bg-[#0e0f18]/80 backdrop-blur-xl">
            <button
              onClick={() => setSelectedDay('all')}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                selectedDay === 'all'
                  ? 'bg-primary text-black shadow-[0_0_15px_rgba(0,255,157,0.4)]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Days
            </button>
            {dayKeys.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                  selectedDay === day
                    ? 'bg-primary text-black shadow-[0_0_15px_rgba(0,255,157,0.4)]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-12">
        {filteredDays.map(([day, items]) => (
          <div key={day} className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary font-mono text-xs font-extrabold uppercase tracking-wider shadow-[0_0_10px_rgba(0,255,157,0.15)]">
                {day}
              </span>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-primary/30 to-transparent" />
            </div>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-primary/20 space-y-7 ml-3">
              {items.map((item, idx) => (
                <div key={item._id || idx} className="relative group">
                  {/* Glowing Milestone Node */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-3 w-4 h-4 rounded-full bg-[#08080c] border-2 border-primary group-hover:scale-125 group-hover:bg-primary group-hover:shadow-[0_0_12px_rgba(0,255,157,0.6)] transition-all" />

                  <div className="p-6 rounded-2xl border border-white/10 bg-[#0e0f18]/85 hover:border-primary/50 hover:bg-[#121422] backdrop-blur-xl transition-all duration-300 shadow-xl group-hover:translate-x-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.time}</span>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                        Phase 0{idx + 1}
                      </span>
                    </div>

                    <h4 className="font-mono text-lg font-bold text-white mb-1.5 group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>

                    {item.description && (
                      <p className="text-neutral-300 text-xs sm:text-sm font-sans leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
