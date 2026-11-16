import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Organizer Operations Portal',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function OrganizerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
