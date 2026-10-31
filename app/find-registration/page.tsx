'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Mail, Phone, ArrowLeft, RefreshCw, QrCode, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import GoogleSignInButton, { GoogleVerifiedUser } from '@/components/public/GoogleSignInButton';

export default function FindRegistrationPage() {
  const router = useRouter();
  const [leaderEmail, setLeaderEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (user: GoogleVerifiedUser) => {
    if (!user.token) {
      toast.error('Google token missing. Please try manual email search.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/public/find-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleToken: user.token }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'No registration found for this Google account.');
        setLoading(false);
        return;
      }

      toast.success('Registration pass located via Google verification!');
      router.push(`/register/success/${data.teamId}?token=${data.token}`);
    } catch {
      toast.error('Network error during Google lookup');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderEmail.trim() || !phone.trim()) {
      toast.error('Please enter both leader email and phone number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/public/find-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderEmail, phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Team not found with provided credentials.');
        setLoading(false);
        return;
      }

      toast.success('Registration pass located!');
      router.push(`/register/success/${data.teamId}?token=${data.token}`);
    } catch {
      toast.error('Network error during lookup');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy text-offwhite flex items-center justify-center p-4 font-mono text-xs">
      <div className="w-full max-w-md border border-line bg-navy p-7 sm:p-8 shadow-hard relative">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-offwhite/50 hover:text-yellow mb-6 transition-colors uppercase tracking-wider text-[11px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← RETURN TO HOMEPAGE</span>
        </Link>

        <div className="text-left mb-6 border-b border-line pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-yellow/40 bg-yellow/10 text-yellow uppercase tracking-widest text-[10px] mb-3">
            <Sparkles className="w-3 h-3" />
            <span>CREDENTIAL RECOVERY PORTAL</span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl font-black text-offwhite uppercase tracking-tight">
            FIND TEAM QR PASS
          </h1>
          <p className="text-offwhite/60 text-[11px] mt-1.5 leading-relaxed">
            Retrieve your official registration pass and check-in QR token.
          </p>
        </div>

        {/* 1. Fast Google 1-Click Verification Retrieval */}
        <div className="mb-6 p-4 border border-line bg-[#0c223f]">
          <div className="font-mono text-[11px] text-yellow font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>&gt;_ FAST GOOGLE LOOKUP</span>
            <span className="text-offwhite/40 font-normal">[INSTANT]</span>
          </div>
          <p className="text-offwhite/60 text-[11px] mb-3">
            If your team registered with Google, sign in below to retrieve your pass instantly:
          </p>
          <GoogleSignInButton
            label="RETRIEVE TICKET WITH GOOGLE"
            onSuccess={handleGoogleSuccess}
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5 font-mono text-[10px] text-offwhite/40 uppercase">
          <span className="h-[1px] flex-1 bg-line" />
          <span>OR MANUAL LOOKUP</span>
          <span className="h-[1px] flex-1 bg-line" />
        </div>

        {/* 2. Manual Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-offwhite/70 uppercase text-[10px] tracking-wider mb-1">
              Leader Registered Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-offwhite/30" />
              <input
                type="email"
                value={leaderEmail}
                onChange={(e) => setLeaderEmail(e.target.value)}
                placeholder="leader@college.edu"
                required
                className="w-full pl-9 pr-3 py-2 bg-[#0c223f] border border-line text-offwhite placeholder:text-offwhite/30 focus:outline-none focus:border-yellow text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-offwhite/70 uppercase text-[10px] tracking-wider mb-1">
              Leader 10-Digit Mobile *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-offwhite/30" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                required
                className="w-full pl-9 pr-3 py-2 bg-[#0c223f] border border-line text-offwhite placeholder:text-offwhite/30 focus:outline-none focus:border-yellow text-xs font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-yellow text-navy font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 border border-yellow shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm disabled:opacity-40 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                SEARCHING DATABASE...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>SEARCH REGISTRATION RECORD</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-line text-center text-offwhite/50 text-[11px]">
          Haven&apos;t registered a team yet?{' '}
          <Link href="/register" className="text-yellow hover:underline font-bold">
            REGISTER YOUR TEAM →
          </Link>
        </div>
      </div>
    </div>
  );
}
