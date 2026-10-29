import { Clock, Calendar } from 'lucide-react';

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

  return (
    <section id="schedule" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto z-10 relative">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-xs uppercase tracking-widest mb-3">
          <Calendar className="w-3.5 h-3.5" />
          <span>Timeline</span>
        </div>
        <h2 className="font-mono text-3xl sm:text-4xl font-extrabold text-white">
          Event Schedule
        </h2>
        <p className="text-neutral-400 font-mono text-xs sm:text-sm mt-2">
          Milestones, mentorship rounds, pizza drops, and judging exhibition.
        </p>
      </div>

      <div className="space-y-12">
        {Object.entries(daysMap).map(([day, items]) => (
          <div key={day} className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-full bg-primary/15 border border-primary/40 text-primary font-mono text-sm font-bold uppercase tracking-wider">
                {day}
              </span>
              <div className="flex-1 h-[1px] bg-white/10" />
            </div>

            <div className="relative pl-6 sm:pl-8 border-l border-white/15 space-y-8 ml-3">
              {items.map((item, idx) => (
                <div key={item._id || idx} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-black border-2 border-primary group-hover:scale-125 group-hover:bg-primary transition-all" />

                  <div className="p-5 rounded-2xl border border-white/10 bg-[#12121c]/80 hover:border-primary/40 backdrop-blur-md transition-all shadow-lg">
                    <div className="flex items-center gap-2 text-primary font-mono text-xs font-semibold mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.time}</span>
                    </div>
                    <h4 className="font-mono text-base font-bold text-white mb-1">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-neutral-400 text-xs sm:text-sm font-sans">
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
