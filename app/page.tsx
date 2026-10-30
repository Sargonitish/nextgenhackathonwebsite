import { getActiveEvent } from '@/lib/activeEvent';
import Link from 'next/link';
import MatrixBackground from '@/components/public/MatrixBackground';
import AnnouncementTicker from '@/components/public/AnnouncementTicker';
import Navbar from '@/components/public/Navbar';
import Hero from '@/components/public/Hero';
import About from '@/components/public/About';
import Tracks from '@/components/public/Tracks';
import Schedule from '@/components/public/Schedule';
import Prizes from '@/components/public/Prizes';
import Rules from '@/components/public/Rules';
import Coordinators from '@/components/public/Coordinators';
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

  // Friendly Coming Soon page when no active event exists
  if (!event) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-[#0a0a0f] text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-[#12121c]/90 p-8 backdrop-blur-xl shadow-2xl">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30 text-primary font-mono text-2xl shadow-lg shadow-primary/20">
            ⚡
          </div>
          <h1 className="mb-2 font-mono text-2xl font-bold tracking-tight text-white">
            Hackathon Coming Soon
          </h1>
          <p className="mb-6 text-xs font-mono text-neutral-400 leading-relaxed">
            No active hackathon edition is currently live. Admins can initialize the event or log in to the management console below.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center font-mono text-xs">
            <Link
              href="/admin/setup"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 font-bold text-black shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
            >
              Admin Setup
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 font-semibold text-white hover:bg-white/10 transition-all"
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
    <div className="min-h-dvh bg-[#08080c] text-white relative flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Animated Matrix Rain / Cyber Background */}
      <MatrixBackground />

      {/* 1. Sticky Navigation Bar */}
      <Navbar
        eventName={plainEvent.name}
        logoUrl={plainEvent.branding?.logoUrl}
        sections={sections}
        registrationOpen={plainEvent.settings?.registrationOpen ?? true}
      />

      {/* 2. Live Broadcast Marquee Ticker */}
      <AnnouncementTicker />

      {/* Main Sections */}
      <main className="flex-1 flex flex-col">
        {/* 3. Hero Section with Flip Countdown */}
        {sections.hero !== false && (
          <Hero
            title={plainEvent.content?.heroTitle || plainEvent.name}
            tagline={plainEvent.content?.heroTagline || ''}
            typingWords={plainEvent.content?.typingWords || ['Build', 'Innovate', 'Disrupt', 'Ship']}
            timer={plainEvent.timer}
            registrationOpen={plainEvent.settings?.registrationOpen ?? true}
            eventId={plainEvent._id.toString()}
          />
        )}

        {/* 4. About Section */}
        {sections.about !== false && (
          <About
            title={plainEvent.content?.aboutTitle || `About ${plainEvent.name}`}
            text={plainEvent.content?.aboutText || ''}
          />
        )}

        {/* 5. Tracks Grid */}
        {sections.tracks !== false && <Tracks tracks={plainEvent.tracks || []} />}

        {/* 6. Schedule Timeline */}
        {sections.schedule !== false && <Schedule schedule={plainEvent.schedule || []} />}

        {/* 7. Prizes & Awards */}
        {sections.prizes !== false && <Prizes prizes={plainEvent.prizes || []} />}

        {/* 8. Rules & Code of Conduct */}
        {sections.rules !== false && <Rules rulesText={plainEvent.content?.rulesText || ''} />}

        {/* 9. Coordinators & Organizing Team */}
        {sections.coordinators !== false && (
          <Coordinators
            coordinators={plainEvent.coordinators || []}
            showOrganizers={sections.organizers !== false}
          />
        )}

        {/* 10. Sponsors & Partners */}
        {sections.sponsors !== false && <Sponsors sponsors={plainEvent.sponsors || []} />}

        {/* 11. Gallery Grid & Lightbox */}
        {sections.gallery !== false && <Gallery gallery={plainEvent.gallery || []} />}

        {/* 12. FAQs Accordion */}
        {sections.faq !== false && <Faq faqs={plainEvent.faqs || []} />}

        {/* 13. Venue & Map */}
        {sections.venue !== false && (
          <Venue
            name={plainEvent.content?.venueName || ''}
            address={plainEvent.content?.venueAddress || ''}
            mapEmbedUrl={plainEvent.content?.mapEmbedUrl || ''}
          />
        )}
      </main>

      {/* 14. Footer with Socials & Organizer Sign-up Link */}
      {sections.contact !== false && (
        <Footer
          eventName={plainEvent.name}
          contactEmail={plainEvent.content?.contactEmail}
          contactPhone={plainEvent.content?.contactPhone}
          socials={plainEvent.content?.socials}
          organizerSignupOpen={plainEvent.settings?.organizerSignupOpen ?? true}
        />
      )}
    </div>
  );
}
