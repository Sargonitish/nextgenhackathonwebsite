import Link from 'next/link';
import {
  Mail,
  Phone,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  MessageSquare,
  Shield,
} from 'lucide-react';

interface FooterProps {
  eventName: string;
  contactEmail?: string;
  contactPhone?: string;
  socials?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
    whatsapp?: string;
  };
  organizerSignupOpen?: boolean;
}

export default function Footer({
  eventName,
  contactEmail,
  contactPhone,
  socials = {},
  organizerSignupOpen = true,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#08080d] py-12 px-4 sm:px-6 lg:px-8 font-mono text-xs z-10 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Copyright */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="font-bold text-sm text-white uppercase tracking-wider">
              {eventName || 'HackX'}
            </span>
          </div>
          <p className="text-neutral-500">
            © {currentYear} {eventName}. Engineered for builders.
          </p>
        </div>

        {/* Contact info & Socials */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-neutral-400">
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{contactEmail}</span>
            </a>
          )}
          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{contactPhone}</span>
            </a>
          )}

          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            {socials.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {socials.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {socials.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {socials.whatsapp && (
              <a
                href={socials.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Organizer Signup Link */}
        <div className="text-center md:text-right">
          {organizerSignupOpen ? (
            <Link
              href="/organizer/signup"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-primary/40 transition-all text-[11px]"
            >
              <Shield className="w-3 h-3 text-primary" />
              <span>Organizer? Request access →</span>
            </Link>
          ) : (
            <Link href="/admin/login" className="text-neutral-600 hover:text-neutral-400 text-[11px]">
              Admin Portal
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
