'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Terminal, Shield, Lock, User, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/admin';

  const [stage, setStage] = useState<'credentials' | 'totp'>('credentials');
  const [loading, setLoading] = useState(false);

  // Stage 1
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Stage 2 (6 OTP digits)
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first OTP input on transition to Stage 2
  useEffect(() => {
    if (stage === 'totp') {
      inputRefs.current[0]?.focus();
    }
  }, [stage]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      toast.success(data.message || 'Credentials accepted');
      setStage('totp');
      setLoading(false);
    } catch {
      toast.error('Network error during authentication');
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Pasting full 6 digits
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      if (digits.length === 6) {
        submitTotp(digits.join(''));
      }
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when 6th digit entered
    if (digit && index === 5 && newOtp.every((d) => d !== '')) {
      submitTotp(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const digits = pasted.split('');
    const newOtp = [...otp];
    digits.forEach((d, i) => {
      newOtp[i] = d;
    });
    setOtp(newOtp);
    if (digits.length === 6) {
      submitTotp(pasted);
    } else {
      inputRefs.current[digits.length]?.focus();
    }
  };

  const submitTotp = async (codeString?: string) => {
    const code = codeString || otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/auth/verify-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Verification failed');
        setLoading(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      toast.success('Access granted! Redirecting to panel...');
      window.location.href = nextUrl;
    } catch {
      toast.error('Verification error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f] text-white">
      {/* Background neon ambient */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,255,157,0.06)_0%,transparent_60%)]" />

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101018]/90 backdrop-blur-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10 font-mono text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            <span className="ml-2 text-neutral-300">hackx://admin.auth</span>
          </div>
          <span className="text-primary font-mono text-[10px]">SECURE-TTY</span>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 text-primary mb-3">
            {stage === 'credentials' ? <Terminal className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
          </div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-white">
            {stage === 'credentials' ? 'Admin Portal Authentication' : 'Two-Factor Challenge'}
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            {stage === 'credentials'
              ? 'Authorized personnel only. Password + TOTP required.'
              : 'Enter the 6-digit dynamic token from your Authenticator app.'}
          </p>
        </div>

        {/* Stage 1: Username & Password */}
        {stage === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-2">
                Administrator Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-primary font-mono text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-primary font-mono text-sm transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 rounded-lg bg-primary text-black font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition-all font-mono"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  Proceed to 2FA
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Stage 2: 6 OTP Input Boxes */}
        {stage === 'totp' && (
          <div className="space-y-6">
            <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center font-mono text-2xl font-bold rounded-lg bg-black/60 border border-white/20 text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStage('credentials');
                  setOtp(['', '', '', '', '', '']);
                }}
                className="w-1/3 py-2.5 rounded-lg border border-white/15 text-xs font-mono text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => submitTotp()}
                disabled={loading || otp.some((d) => !d)}
                className="w-2/3 py-2.5 rounded-lg bg-primary text-black font-mono font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    Verify & Enter
                    <Shield className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-white/5 text-center font-mono text-[11px] text-neutral-500">
          <span>Organizer needing access? </span>
          <Link href="/organizer/login" className="text-primary hover:underline">
            Organizer Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070913] flex items-center justify-center text-cyan-400 font-mono text-xs">
          Loading admin terminal...
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}
