import type { Metadata } from 'next';
import { getSiteUrl, generateBreadcrumbJsonLd } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Find Team Registration Pass',
  description:
    'Retrieve your HACKX 2026 registration confirmation, team access pass, and check-in QR code via registered email or phone.',
  alternates: {
    canonical: `${getSiteUrl()}/find-registration`,
  },
  openGraph: {
    title: 'Find Team Registration Pass | HACKX 2026',
    description:
      'Access your HACKX 2026 team registration pass, check status, and retrieve your verification credentials.',
    url: `${getSiteUrl()}/find-registration`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Team Registration Pass | HACKX 2026',
    description:
      'Access your HACKX 2026 team registration pass, check status, and retrieve your verification credentials.',
  },
};

export default function FindRegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Find Registration Pass', path: '/find-registration' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
