import { getActiveEvent } from '@/lib/activeEvent';
import Link from 'next/link';
import BlueprintBackground from '@/components/public/BlueprintBackground';
import CustomCursor from '@/components/public/CustomCursor';
import AnnouncementTicker from '@/components/public/AnnouncementTicker';
import Navbar from '@/components/public/Navbar';
import Hero from '@/components/public/Hero';
import About from '@/components/public/About';
import Tracks from '@/components/public/Tracks';
import Schedule from '@/components/public/Schedule';
import Prizes from '@/components/public/Prizes';
import Rules from '@/components/public/Rules';
import Coordinators from '@/components/public/Coordinators';
import Organizers from '@/components/public/Organizers';
import Sponsors from '@/components/public/Sponsors';
import Gallery from '@/components/public/Gallery';
import Faq from '@/components/public/Faq';
import Venue from '@/components/public/Venue';
import Footer from '@/components/public/Footer';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let event = null;
  try {
    event = await getActiveEvent();
  } catch (err) {
    console.error('Error fetching active event:', err);
  }

  // Blueprint Coming Soon page when no active event exists
  if (!event) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 text-left bg-navy text-offwhite font-mono">
        <div className="max-w-md border border-line p-8 bg-navy shadow-hard">
          <div className="font-mono text-xs text-yellow uppercase tracking-widest mb-3">
            [ SYSTEM STATUS / STANDBY ]
          </div>
          <h1 className="font-display text-2xl font-black tracking-tight text-offwhite mb-3">
            HACKX 2026 COMING SOON
          </h1>
          <p className="mb-6 text-xs text-offwhite/70 leading-relaxed">
            No active hackathon edition is currently published in the database. Initialize event configuration or access the management console below.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 text-xs">
            <Link
              href="/admin/setup"
              className="px-5 py-2.5 bg-yellow text-navy font-bold uppercase tracking-wider text-center border border-yellow shadow-[3px_3px_0_rgba(242,239,230,0.3)]"
            >
              Admin Setup
            </Link>
            <Link
              href="/admin/login"
              className="px-5 py-2.5 border border-line text-offwhite text-center hover:text-yellow transition-colors"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const plainEvent = JSON.parse(JSON.stringify(event));
  const sections = plainEvent.branding?.sections || {};

  // Prioritize heroTitle from Content, fall back to event.name from Branding
  const displayTitle = plainEvent.content?.heroTitle || plainEvent.name || 'HACKX';
  const displayTagline = plainEvent.content?.heroTagline;

  return (
    <div className="min-h-dvh bg-navy text-offwhite relative flex flex-col selection:bg-yellow selection:text-navy">
      {/* 1. Custom Desktop Crosshair Cursor */}
      <CustomCursor />

      {/* 2. Blueprint 48px Graph-Paper Grid & Autonomous Agents Canvas */}
      <BlueprintBackground />

      {/* 3. Sticky Blueprint Navbar (Dynamic logo and sections) */}
      <Navbar
        eventName={displayTitle}
        logoUrl={plainEvent.branding?.logoUrl}
        sections={sections}
        registrationOpen={plainEvent.settings?.registrationOpen ?? true}
      />

      {/* 4. Live Broadcast Marquee Ticker */}
      <AnnouncementTicker />

      {/* Main Blueprint Sections */}
      <main className="flex-1 flex flex-col">
        {/* 5. Asymmetric Hero with Outlined 2026, Dynamic Tagline & Telemetry Box */}
        {sections.hero !== false && (
          <Hero
            title={displayTitle}
            tagline={displayTagline}
            collegeName={plainEvent.content?.collegeName || 'COLLEGE OF ENGINEERING'}
            year={plainEvent.year || 2026}
            timer={plainEvent.timer}
            registrationOpen={plainEvent.settings?.registrationOpen ?? true}
            eventId={plainEvent._id.toString()}
          />
        )}

        {/* 6. Manifesto About Section (Dynamic Title, Dynamic Paragraphs, Stats) */}
        {sections.about !== false && (
          <About
            title={plainEvent.content?.aboutTitle}
            text={plainEvent.content?.aboutText}
            prizePool={plainEvent.content?.prizePool || '₹1,00,000'}
          />
        )}

        {/* 7. Numbered Hairline Rows (01–04) Tracks List */}
        {sections.tracks !== false && <Tracks tracks={plainEvent.tracks || []} />}

        {/* 8. Vertical Timeline Schedule with Real-time Active Milestone */}
        {sections.schedule !== false && <Schedule schedule={plainEvent.schedule || []} />}

        {/* 9. Asymmetric Staggered Prizes with Oversized Numerals (1, 2, 3) */}
        {sections.prizes !== false && <Prizes prizes={plainEvent.prizes || []} />}

        {/* 10. Rules List (Compact 1–10) */}
        {sections.rules !== false && <Rules rulesText={plainEvent.content?.rulesText || ''} />}

        {/* 11. Event Coordinators (Faculty & Lead Student Coordinators) */}
        {sections.coordinators !== false && (
          <Coordinators coordinators={plainEvent.coordinators || []} />
        )}

        {/* 12. Organizing Committee & Operations Desks */}
        {sections.organizers !== false && <Organizers />}

        {/* 13. Sponsors Grid with Hairlines */}
        {sections.sponsors !== false && (
          <Sponsors
            sponsors={plainEvent.sponsors || []}
            contactEmail={plainEvent.content?.contactEmail}
          />
        )}

        {/* 13. Photo Gallery & Archival Moments */}
        {sections.gallery !== false && <Gallery gallery={plainEvent.gallery || []} />}

        {/* 14. FAQs Accordion with + / − Toggles */}
        {sections.faq !== false && <Faq faqs={plainEvent.faqs || []} />}

        {/* 15. Venue with Technical Crosshair Coordinates Pin & Dynamic Map Link */}
        {sections.venue !== false && (
          <Venue
            name={plainEvent.content?.venueName}
            address={plainEvent.content?.venueAddress}
            mapEmbedUrl={plainEvent.content?.mapEmbedUrl}
          />
        )}
      </main>

      {/* 16. Footer with Dynamic Name, All Socials & 5-Click Easter Egg */}
      {sections.contact !== false && (
        <Footer
          eventName={displayTitle}
          contactEmail={plainEvent.content?.contactEmail}
          socials={plainEvent.content?.socials}
          madeBy={plainEvent.content?.madeBy || 'Made by students for builders worldwide'}
        />
      )}
    </div>
  );
}
