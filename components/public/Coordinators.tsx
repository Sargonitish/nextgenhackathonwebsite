import Image from 'next/image';

interface CoordinatorItem {
  _id?: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
}

export default function Coordinators({
  coordinators = [],
  showOrganizers = true,
}: {
  coordinators: CoordinatorItem[];
  showOrganizers?: boolean;
}) {
  if (!showOrganizers) return null;

  const defaultTeam: CoordinatorItem[] = [
    { name: 'Aarav Sharma', role: 'Lead Organizer' },
    { name: 'Diya Patel', role: 'Tech & Infrastructure' },
    { name: 'Rohan Verma', role: 'Design & Experience' },
    { name: 'Ananya Iyer', role: 'Operations & Logistics' },
    { name: 'Karan Malhotra', role: 'Sponsorships' },
    { name: 'Sneha Reddy', role: 'Outreach & Marketing' },
  ];

  const team = coordinators.length > 0 ? coordinators : defaultTeam;

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
      {/* Section Label */}
      <div className="font-mono text-xs text-offwhite/50 uppercase tracking-widest mb-10">
        05 / TEAM
      </div>

      <h2 className="sr-only">Organizing Team</h2>

      {/* Grid of Organiser Cards (3 col desktop, 2 col tablet, 1 col mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {team.map((member, idx) => (
          <div key={member._id || idx} className="group border border-line p-4 bg-white/[0.01]">
            {/* Square Photo Placeholder (Grayscale -> Full Color on hover) */}
            <div className="w-full aspect-square bg-[#0E274A] border border-line flex items-center justify-center overflow-hidden relative">
              {member.photoUrl ? (
                <Image
                  src={member.photoUrl}
                  alt={member.name}
                  fill
                  className="object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  unoptimized
                />
              ) : (
                <div className="font-display font-black text-4xl text-offwhite/30 group-hover:text-yellow transition-colors select-none">
                  {getInitials(member.name)}
                </div>
              )}
            </div>

            {/* Name & Role */}
            <div className="mt-4">
              <h3 className="font-display font-bold text-lg text-offwhite group-hover:text-yellow transition-colors">
                {member.name}
              </h3>
              <p className="font-mono text-xs text-offwhite/50 uppercase tracking-wider mt-0.5">
                {member.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
