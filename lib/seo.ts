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

export const DEFAULT_FAQS = [
  {
    question: 'Who is eligible to participate in HACKX 2026?',
    answer:
      'Any student currently enrolled in an undergraduate or postgraduate program at any recognized university or college is eligible. Inter-college teams are welcome.',
  },
  {
    question: 'What is the required team size?',
    answer:
      'Teams must consist of 2 to 4 members. You must declare a Team Leader during registration.',
  },
  {
    question: 'Is there any registration fee for HACKX 2026?',
    answer:
      'No! Registration and participation in HACKX 2026 are completely free. Food, midnight snacks, coffee, and hacker swag are covered for all shortlisted teams.',
  },
  {
    question: 'What should we build during the 24 hours?',
    answer:
      'Teams build autonomous AI agents, multi-agent workflows, intelligent developer tools, or automated systems addressing real-world problem statements.',
  },
  {
    question: 'How does team check-in work on event day?',
    answer:
      'Upon completing online registration, your team leader receives a unique Team ID and secure QR code pass. Show this QR pass at the campus registration desk upon arrival.',
  },
  {
    question: 'Where is HACKX 2026 taking place?',
    answer:
      'HACKX 2026 is hosted on campus in Chennai, Tamil Nadu, India, featuring high-speed connectivity, 24-hour power backup, and hardware labs.',
  },
];

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
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  sponsors?: Array<{
    name: string;
    logoUrl?: string;
    website?: string;
  }>;
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

  const rawFaqs = event?.faqs && event.faqs.length > 0 ? event.faqs : DEFAULT_FAQS;
  const faqNode = {
    '@type': 'FAQPage',
    '@id': `${siteUrl}/#faq`,
    mainEntity: rawFaqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  const sponsorNodes = (event?.sponsors || [])
    .filter((s) => s && s.name)
    .map((s) => ({
      '@type': 'Organization',
      name: s.name,
      ...(s.website ? { url: s.website } : {}),
      ...(s.logoUrl ? { logo: s.logoUrl } : {}),
    }));

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
          availability:
            event?.settings?.registrationOpen !== false
              ? 'https://schema.org/InStock'
              : 'https://schema.org/SoldOut',
          validFrom: '2026-01-01T00:00:00+05:30',
        },
        organizer: {
          '@id': `${siteUrl}/#organization`,
        },
        ...(sponsorNodes.length > 0 ? { sponsor: sponsorNodes } : {}),
      },
      faqNode,
    ],
  };
}

export function generateBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path.startsWith('http') ? item.path : `${siteUrl}${item.path.startsWith('/') ? '' : '/'}${item.path}`,
    })),
  };
}
