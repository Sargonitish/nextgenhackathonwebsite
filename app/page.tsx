import { getActiveEvent } from '@/lib/activeEvent';
import Link from 'next/link';
import BlueprintBackground from '@/components/public/BlueprintBackground';
import CustomCursor from '@/components/public/CustomCursor';
import Navbar from '@/components/public/Navbar';
import Hero from '@/components/public/Hero';
import About from '@/components/public/About';
import Tracks from '@/components/public/Tracks';
import Schedule from '@/components/public/Schedule';
import Prizes from '@/components/public/Prizes';
import Rules from '@/components/public/Rules';
import Coordinators from '@/components/public/Coordinators';
import Sponsors from '@/components/public/Sponsors';
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

  return (
    <div className="min-h-dvh bg-navy text-offwhite relative flex flex-col selection:bg-yellow selection:text-navy">
      {/* 1. Custom Desktop Crosshair Cursor */}
      <CustomCursor />

      {/* 2. Blueprint 48px Graph-Paper Grid & Autonomous Agents Canvas */}
      <BlueprintBackground />

      {/* 3. Flat Sticky Blueprint Navbar */}
      <Navbar
        eventName={plainEvent.name}
        logoUrl={plainEvent.branding?.logoUrl}
        sections={sections}
        registrationOpen={plainEvent.settings?.registrationOpen ?? true}
      />

      {/* Main Blueprint Sections (Asymmetric & Left-Aligned) */}
      <main className="flex-1 flex flex-col">
        {/* 4. Asymmetric Hero with Outlined 2026 & Mono Row Countdown */}
        {sections.hero !== false && (
          <Hero
            title={plainEvent.name || 'HACKX'}
            collegeName={plainEvent.content?.collegeName || 'COLLEGE OF ENGINEERING'}
            year={plainEvent.year || 2026}
            timer={plainEvent.timer}
            registrationOpen={plainEvent.settings?.registrationOpen ?? true}
            eventId={plainEvent._id.toString()}
          />
        )}

        {/* 5. Manifesto About Section (60/40 Asymmetric Split & Stats Strip) */}
        {sections.about !== false && (
          <About
            title={plainEvent.content?.aboutTitle}
            text={plainEvent.content?.aboutText}
            prizePool={plainEvent.content?.prizePool || '₹1,00,000'}
          />
        )}

        {/* 6. Numbered Hairline Rows (01–04) Tracks List */}
        {sections.tracks !== false && <Tracks tracks={plainEvent.tracks || []} />}

        {/* 7. Vertical Timeline Schedule with Real-time Active Milestone */}
        {sections.schedule !== false && <Schedule schedule={plainEvent.schedule || []} />}

        {/* 8. Asymmetric Staggered Prizes with Oversized Numerals (1, 2, 3) */}
        {sections.prizes !== false && <Prizes prizes={plainEvent.prizes || []} />}

        {/* 9. Rules List (Compact 1–10) */}
        {sections.rules !== false && <Rules rulesText={plainEvent.content?.rulesText || ''} />}

        {/* 10. Team Photo Grid (Square placeholders, grayscale -> color hover) */}
        {sections.coordinators !== false && (
          <Coordinators
            coordinators={plainEvent.coordinators || []}
            showOrganizers={sections.organizers !== false}
          />
        )}

        {/* 11. Sponsors Grid with Hairlines */}
        {sections.sponsors !== false && (
          <Sponsors
            sponsors={plainEvent.sponsors || []}
            contactEmail={plainEvent.content?.contactEmail}
          />
        )}

        {/* 12. FAQs Accordion with + / − Toggles */}
        {sections.faq !== false && <Faq faqs={plainEvent.faqs || []} />}

        {/* 13. Venue with Technical Crosshair Coordinates Pin */}
        {sections.venue !== false && (
          <Venue
            name={plainEvent.content?.venueName}
            address={plainEvent.content?.venueAddress}
            mapEmbedUrl={plainEvent.content?.mapEmbedUrl}
          />
        )}
      </main>

      {/* 14. Footer with Oversized Cropped Wordmark & 5-Click Easter Egg */}
      {sections.contact !== false && (
        <Footer
          eventName={plainEvent.name}
          contactEmail={plainEvent.content?.contactEmail}
          socials={plainEvent.content?.socials}
          madeBy={plainEvent.content?.madeBy || 'Made by students for builders worldwide'}
        />
      )}
    </div>
  );
}
