import type { Metadata } from 'next';
import './globals.css';
import { getActiveEvent } from '@/lib/activeEvent';
import { Toaster } from 'sonner';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const event = await getActiveEvent();
    if (!event) {
      return {
        title: 'College Hackathon Platform',
        description: 'Premier collegiate hackathon platform',
      };
    }
    return {
      title: `${event.name} | ${event.content?.heroTagline || 'College Hackathon'}`,
      description: event.content?.aboutText || event.content?.heroTagline,
      icons: event.branding?.faviconUrl ? [{ url: event.branding.faviconUrl }] : undefined,
    };
  } catch {
    return {
      title: 'College Hackathon Platform',
      description: 'Premier collegiate hackathon platform',
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let primaryColor = '#00ff9d';
  let accentColor = '#7c3aed';

  try {
    const event = await getActiveEvent();
    if (event?.branding?.primaryColor) {
      primaryColor = event.branding.primaryColor;
    }
    if (event?.branding?.accentColor) {
      accentColor = event.branding.accentColor;
    }
  } catch {
    // Database connection or initial boot fallback
  }

  return (
    <html lang="en" className="dark">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `:root { --primary: ${primaryColor}; --accent: ${accentColor}; }`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] antialiased selection:bg-primary/20 selection:text-primary">
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
