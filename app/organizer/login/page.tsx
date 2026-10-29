'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Clock,
  XCircle,
  Ban,
  ArrowLeft,
} from 'lucide-react';

function OrganizerLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/organizer';

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/organizer/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const getErrorIcon = () => {
    if (!error) return null;
    if (error.includes('⏳') || error.includes('waiting for admin')) {
      return <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />;
    }
    if (error.includes('❌') || error.includes('rejected')) {
      return <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />;
    }
    if (error.includes('🚫') || error.includes('revoked') || error.includes('locked')) {
      return <Ban className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />;
    }
    return <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />;
  };

  return (
    <div className="min-h-screen bg-[#05070F] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-cyan-500/30">
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold font-mono tracking-tight text-white">
          Organizer Portal
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Sign in to access desk check-in, rosters, and live participant ops
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0a0f1d]/90 border border-slate-800/80 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-2xl">
          {error && (
            <div
              className={`mb-6 p-4 rounded-xl border text-xs sm:text-sm flex items-start gap-3 ${
                error.includes('waiting')
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {getErrorIcon()}
              <div className="leading-relaxed whitespace-pre-wrap">{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="organizer / staff@college.edu"
                  className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Enter Portal <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col gap-3 text-center text-xs text-slate-400 font-mono">
            <div>
              Need access?{' '}
              <Link
                href="/organizer/signup"
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4"
              >
                Apply for Organizer Access
              </Link>
            </div>
            <div>
              Administrator?{' '}
              <Link
                href="/admin/login"
                className="text-slate-500 hover:text-slate-300 transition"
              >
                Admin 2FA Terminal &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrganizerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#05070F] flex items-center justify-center text-cyan-400 font-mono text-xs">
          Loading organizer portal...
        </div>
      }
    >
      <OrganizerLoginContent />
    </Suspense>
  );
}
