export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!envUrl || envUrl.includes('localhost')) {
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    return 'https://marvelzhack.vercel.app';
  }
  return envUrl.replace(/\/+$/, '');
}

export const GSC_VERIFICATION_TOKEN = 'googleaa3aca20d0729753';

export const DEFAULT_SEO = {
  siteName: 'HACKX 2026',
  title: 'HACKX 2026 — 24-Hour Autonomous Agents Hackathon',
  description:
    'HACKX 2026 is a 24-hour collegiate hackathon in Chennai for building autonomous AI agents, intelligent systems, and production code. Register your team now.',
  keywords: [
    'HACKX 2026 hackathon',
    'autonomous agents hackathon Chennai',
    'college hackathon Tamil Nadu',
    '24 hour hackathon India',
    'AI agents hackathon 2026',
    'student hackathon India',
    'tech hackathon Chennai',
    'software engineering competition',
  ],
  locale: 'en_IN',
  themeColor: '#0B1F3A',
  googleVerification: GSC_VERIFICATION_TOKEN,
  ogImage: '/og-image.png',
};

export interface EventDataForSeo {
  name?: string;
  content?: {
    heroTitle?: string;
    heroTagline?: string;
    aboutText?: string;
    venueName?: string;
    venueAddress?: string;
    contactEmail?: string;
    contactPhone?: string;
    socials?: {
      instagram?: string;
      linkedin?: string;
      twitter?: string;
      website?: string;
      whatsapp?: string;
    };
  };
  timer?: {
    scheduledStart?: string | Date | null;
    durationMs?: number;
  };
  settings?: {
    registrationOpen?: boolean;
    registrationDeadline?: string | Date | null;
  };
}

export function generateEventJsonLd(event: EventDataForSeo | null) {
  const siteUrl = getSiteUrl();

  const eventName = event?.name || DEFAULT_SEO.siteName;
  const description = event?.content?.aboutText
    ? event.content.aboutText.slice(0, 200)
    : DEFAULT_SEO.description;

  const startDate = event?.timer?.scheduledStart
    ? new Date(event.timer.scheduledStart).toISOString()
    : '2026-03-20T09:00:00+05:30';

  const durationMs = event?.timer?.durationMs || 86400000;
  const endDate = new Date(new Date(startDate).getTime() + durationMs).toISOString();

  const venueName = event?.content?.venueName || 'Campus Grand Convention Center & Tech Hub';
  const venueAddress =
    event?.content?.venueAddress ||
    'Technology Campus, Innovation Corridor, Anna Salai, Chennai, Tamil Nadu 600025, India';

  const socials = event?.content?.socials || {};
  const sameAsLinks = Object.values(socials).filter(
    (url): url is string => typeof url === 'string' && url.startsWith('http')
  );

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: eventName,
        description: DEFAULT_SEO.description,
        inLanguage: 'en-IN',
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: eventName,
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/icon-512.png`,
          width: 512,
          height: 512,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          email: event?.content?.contactEmail || 'organizers@hackx.college.edu',
          telephone: event?.content?.contactPhone || '+91-9876543210',
          contactType: 'technical support',
          areaServed: 'IN',
          availableLanguage: ['en', 'ta'],
        },
        sameAs: sameAsLinks.length > 0 ? sameAsLinks : ['https://x.com', 'https://linkedin.com'],
      },
      {
        '@type': 'Hackathon',
        '@id': `${siteUrl}/#event`,
        name: `${eventName} — 24-Hour Autonomous Agents Hackathon`,
        description,
        url: siteUrl,
        image: [`${siteUrl}/og-image.png`],
        startDate,
        endDate,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: venueName,
          address: {
            '@type': 'PostalAddress',
            streetAddress: venueAddress,
            addressLocality: 'Chennai',
            addressRegion: 'Tamil Nadu',
            postalCode: '600025',
            addressCountry: 'IN',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: 13.0483,
            longitude: 80.2446,
          },
        },
        offers: {
          '@type': 'Offer',
          url: `${siteUrl}/register`,
          price: '0',
          priceCurrency: 'INR',
          availability: event?.settings?.registrationOpen !== false
            ? 'https://schema.org/InStock'
            : 'https://schema.org/SoldOut',
          validFrom: '2026-01-01T00:00:00+05:30',
        },
        organizer: {
          '@id': `${siteUrl}/#organization`,
        },
      },
    ],
  };
}
