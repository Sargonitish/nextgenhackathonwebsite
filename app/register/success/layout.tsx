import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registration Confirmation & Ticket Pass',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function RegistrationSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
