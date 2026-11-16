import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Team Registration',
  description:
    'Register your collegiate team for HACKX 2026. 24-hour sprint in Chennai to build production-grade autonomous agents and systems.',
  alternates: {
    canonical: `${getSiteUrl()}/register`,
  },
  openGraph: {
    title: 'Register for HACKX 2026 | 24-Hour Autonomous Agents Hackathon',
    description:
      'Form your team of 2-4 engineers and secure your spot at HACKX 2026 in Chennai. Free registration, mentorship, and prize pool.',
    url: `${getSiteUrl()}/register`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Register for HACKX 2026 | 24-Hour Autonomous Agents Hackathon',
    description:
      'Form your team of 2-4 engineers and secure your spot at HACKX 2026 in Chennai. Free registration, mentorship, and prize pool.',
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
