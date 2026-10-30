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
  Sparkles,
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
    <footer className="border-t border-white/10 bg-[#060609] py-14 px-4 sm:px-6 lg:px-8 font-mono text-xs z-10 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Copyright */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(0,255,157,0.8)]" />
            <span className="font-bold text-sm text-white uppercase tracking-wider">
              {eventName || 'HackX'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-neutral-400">
              v2.0
            </span>
          </div>
          <p className="text-neutral-500 font-sans text-xs">
            © {currentYear} {eventName}. Engineered for builders and disruptors worldwide.
          </p>
        </div>

        {/* Contact info & Socials */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-neutral-400">
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-1.5 hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
            >
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span>{contactEmail}</span>
            </a>
          )}
          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              className="flex items-center gap-1.5 hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
            >
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>{contactPhone}</span>
            </a>
          )}

          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            {socials.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg hover:text-primary hover:bg-white/5 transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {socials.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg hover:text-primary hover:bg-white/5 transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {socials.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg hover:text-primary hover:bg-white/5 transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {socials.whatsapp && (
              <a
                href={socials.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg hover:text-primary hover:bg-white/5 transition-all"
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
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:border-primary/40 hover:bg-white/10 transition-all text-[11px]"
            >
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>Organizer? Request Access →</span>
            </Link>
          ) : (
            <Link href="/admin/login" className="text-neutral-500 hover:text-neutral-300 text-[11px]">
              Admin Portal
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
