import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getActiveEvent } from '@/lib/activeEvent';
import { Toaster } from 'sonner';
import { StudentAuthProvider } from '@/context/StudentAuthContext';
import {
  DEFAULT_SEO,
  GSC_VERIFICATION_TOKEN,
  generateEventJsonLd,
  getSiteUrl,
} from '@/lib/seo';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0B1F3A',
  colorScheme: 'dark',
};

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  let eventName = DEFAULT_SEO.siteName;
  let description = DEFAULT_SEO.description;
  let faviconUrl: string | undefined = undefined;

  try {
    const event = await getActiveEvent();
    if (event) {
      if (event.name) eventName = event.name;
      if (event.content?.aboutText) {
        description = event.content.aboutText.slice(0, 160);
      }
      if (event.branding?.faviconUrl) {
        faviconUrl = event.branding.faviconUrl;
      }
    }
  } catch {
    // Database connection fallback during static generation or cold boot
  }

  const title = `${eventName} — 24-Hour Autonomous Agents Hackathon`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${eventName}`,
    },
    description,
    keywords: DEFAULT_SEO.keywords,
    authors: [{ name: eventName, url: siteUrl }],
    creator: eventName,
    publisher: eventName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: siteUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: DEFAULT_SEO.locale,
      url: siteUrl,
      siteName: eventName,
      title,
      description,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${eventName} — 24-Hour Autonomous Agents Hackathon Chennai`,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
      creator: '@hackx_2026',
    },
    verification: {
      google: GSC_VERIFICATION_TOKEN,
    },
    icons: {
      icon: faviconUrl
        ? [
            { url: faviconUrl },
            { url: '/favicon.ico' },
            { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
          ]
        : [
            { url: '/favicon.ico' },
            { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
          ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    manifest: '/site.webmanifest',
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let event = null;
  try {
    event = await getActiveEvent();
  } catch {
    // Fallback if db offline
  }

  const jsonLd = generateEventJsonLd(event);

  return (
    <html lang="en-IN" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="google-site-verification" content={GSC_VERIFICATION_TOKEN} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700..800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-navy text-offwhite antialiased selection:bg-yellow selection:text-navy">
        <StudentAuthProvider>{children}</StudentAuthProvider>
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
