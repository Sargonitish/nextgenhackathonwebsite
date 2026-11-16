import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Live Countdown & Projector Arena',
  description:
    'Real-time live countdown timer, live announcements, and stage projector display for HACKX 2026 24-hour hackathon.',
  alternates: {
    canonical: `${getSiteUrl()}/live`,
  },
  openGraph: {
    title: 'Live Arena & Real-Time Countdown | HACKX 2026',
    description:
      'Track live hackathon progress, remaining sprint time, and real-time organizer announcements at HACKX 2026.',
    url: `${getSiteUrl()}/live`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Arena & Real-Time Countdown | HACKX 2026',
    description:
      'Track live hackathon progress, remaining sprint time, and real-time organizer announcements at HACKX 2026.',
  },
};

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
