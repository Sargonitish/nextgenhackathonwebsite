import type { Metadata } from 'next';
import './globals.css';
import { getActiveEvent } from '@/lib/activeEvent';
import { Toaster } from 'sonner';
import { StudentAuthProvider } from '@/context/StudentAuthContext';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const event = await getActiveEvent();
    if (!event) {
      return {
        title: 'HACKX 2026 — Build Autonomous Agents',
        description: '24-hour collegiate hackathon to build autonomous agents.',
      };
    }
    return {
      title: `${event.name} 2026 — Build Autonomous Agents`,
      description: event.content?.aboutText || '24-hour sprint to build agents that act on their own.',
      icons: event.branding?.faviconUrl ? [{ url: event.branding.faviconUrl }] : undefined,
    };
  } catch {
    return {
      title: 'HACKX 2026 — Build Autonomous Agents',
      description: '24-hour collegiate hackathon to build autonomous agents.',
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700..800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-navy text-offwhite antialiased selection:bg-yellow selection:text-navy">
        <StudentAuthProvider>
          {children}
        </StudentAuthProvider>
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
