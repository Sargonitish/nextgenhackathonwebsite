'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Mail, Phone, ArrowLeft, RefreshCw, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export default function FindRegistrationPage() {
  const router = useRouter();
  const [leaderEmail, setLeaderEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

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
        toast.error(data.error || 'Team not found');
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
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-4 font-mono text-xs">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#12121c] p-8 shadow-2xl relative overflow-hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>

        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-3 shadow-lg">
            <QrCode className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-white">Find Team QR Pass</h1>
          <p className="text-neutral-400 text-[11px] mt-1 leading-relaxed">
            Enter the team leader&apos;s registered email and phone number to retrieve your official pass.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-neutral-300 uppercase text-[10px] tracking-wider mb-1">
              Leader Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                value={leaderEmail}
                onChange={(e) => setLeaderEmail(e.target.value)}
                placeholder="leader@college.edu"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 uppercase text-[10px] tracking-wider mb-1">
              Leader Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-primary text-black font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition-all shadow-lg shadow-primary/20"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Retrieve Registration QR
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/5 text-center text-neutral-500 text-[11px]">
          Need to make a new team?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}
