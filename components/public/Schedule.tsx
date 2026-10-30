interface ScheduleItem {
  _id?: string;
  time: string;
  title: string;
  description: string;
}

export default function Schedule({ schedule = [] }: { schedule: ScheduleItem[] }) {
  // Default blueprint schedule from Section 2
  const displaySchedule: ScheduleItem[] =
    schedule.length > 0
      ? schedule
      : [
          { time: '08:00 AM', title: 'Registration & check-in', description: 'Get your badges, find your desk, set up.' },
          { time: '09:00 AM', title: 'Opening ceremony', description: 'Welcome, rules, track reveals, and the starting signal.' },
          { time: '09:30 AM', title: 'Hacking begins', description: 'Keyboards out. Clock starts. Go.' },
          { time: '01:00 PM', title: 'Mentor rounds', description: 'Industry mentors visit each team for feedback.' },
          { time: '12:00 AM', title: 'Midnight snack break', description: 'Free food. Step away from the screen for ten minutes.' },
          { time: '03:00 AM', title: 'Mid-point check', description: 'Quick standup. Show what you have built so far.' },
          { time: '08:00 AM', title: 'Submissions close', description: 'Push your code. Upload demo video. No exceptions.' },
          { time: '09:00 AM', title: 'Judging', description: 'Judges review projects. Top teams do a live demo.' },
          { time: '11:00 AM', title: 'Closing & prizes', description: 'Winners announced. Trophies. Group photo. Go sleep.' },
        ];

  // Active marker (defaults to hacking begins / item 2 as demo milestone)
  const activeIndex = 2;

  return (
    <section id="schedule" className="py-20 max-w-[1280px] mx-auto px-4 sm:px-8 border-t border-line relative z-10">
      {/* Section Label */}
      <div className="font-mono text-xs text-offwhite/50 uppercase tracking-widest mb-10">
        02 / SCHEDULE
      </div>

      <h2 className="sr-only">Schedule Timeline</h2>

      <div className="relative pl-0 sm:pl-8">
        <div className="space-y-10 sm:space-y-12">
          {displaySchedule.map((item, idx) => {
            const isActive = idx === activeIndex;

            return (
              <div
                key={item._id || idx}
                className="relative grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-8 items-start group"
              >
                {/* Left Column: Timestamp */}
                <div className="sm:col-span-3 text-left sm:text-right font-mono text-xs sm:text-sm text-offwhite/60 tracking-wider">
                  {item.time}
                </div>

                {/* Center Timeline Node Marker */}
                <div className="hidden sm:flex sm:col-span-1 justify-center relative pt-1.5">
                  {/* Vertical connecting line */}
                  {idx < displaySchedule.length - 1 && (
                    <div className="absolute top-3.5 bottom-[-48px] w-[1px] bg-line" />
                  )}

                  {/* 4x4px Square Node Marker */}
                  <div
                    className={`w-2 h-2 z-10 transition-colors ${
                      isActive ? 'bg-yellow' : 'bg-navy border border-offwhite/60 group-hover:border-yellow'
                    }`}
                  />
                </div>

                {/* Right Column: Title & Description */}
                <div className="sm:col-span-8 space-y-1 pl-4 sm:pl-0 border-l border-line sm:border-l-0">
                  <h3
                    className={`font-mono text-base sm:text-lg font-bold transition-colors ${
                      isActive ? 'text-yellow' : 'text-offwhite group-hover:text-yellow'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p className="font-mono text-xs sm:text-sm text-offwhite/60 leading-relaxed max-w-xl">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
