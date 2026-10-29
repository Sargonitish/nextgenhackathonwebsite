'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { ShieldCheck, Key, Lock, User, CheckCircle2, ArrowRight, RefreshCw, Copy, Check } from 'lucide-react';

export default function AdminSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [secretBase32, setSecretBase32] = useState('');
  const [code, setCode] = useState('');

  // Password Strength
  const hasMinLength = password.length >= 10;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const strengthScore = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  useEffect(() => {
    async function checkSetup() {
      try {
        const res = await fetch('/api/admin/auth/setup');
        const data = await res.json();
        if (data.setupDone) {
          toast.info('Admin is already set up. Please log in.');
          router.replace('/admin/login');
        } else {
          setQrDataUrl(data.qrDataUrl || '');
          setSecretBase32(data.secretBase32 || '');
          setLoading(false);
        }
      } catch {
        toast.error('Failed to communicate with setup service.');
        setLoading(false);
      }
    }
    checkSetup();
  }, [router]);

  const copySecret = () => {
    if (!secretBase32) return;
    navigator.clipboard.writeText(secretBase32);
    setCopied(true);
    toast.success('Secret key copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || username.length < 3) {
      toast.error('Username must be at least 3 characters.');
      return;
    }
    if (strengthScore < 5) {
      toast.error('Password does not meet all security requirements.');
      return;
    }
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error('Please enter the 6-digit code from your authenticator app.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to complete setup');
        setSubmitting(false);
        return;
      }

      toast.success('Admin configured successfully! Redirecting...');
      router.push('/admin');
    } catch {
      toast.error('An error occurred during setup');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-neutral-400">
        <RefreshCw className="w-6 h-6 animate-spin text-primary mr-2" />
        <span className="font-mono text-sm">Verifying security state...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f] text-white">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#12121a]/90 backdrop-blur-xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 text-primary mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-white">
            Super Admin Initialization
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            One-time setup for the primary administrator account
          </p>
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mt-4 font-mono text-xs">
            <span className={`px-2.5 py-1 rounded-full ${step >= 1 ? 'bg-primary text-black font-semibold' : 'bg-white/10 text-neutral-400'}`}>
              1. Credentials
            </span>
            <span className="text-neutral-600">→</span>
            <span className={`px-2.5 py-1 rounded-full ${step >= 2 ? 'bg-primary text-black font-semibold' : 'bg-white/10 text-neutral-400'}`}>
              2. Scan 2FA
            </span>
            <span className="text-neutral-600">→</span>
            <span className={`px-2.5 py-1 rounded-full ${step === 3 ? 'bg-primary text-black font-semibold' : 'bg-white/10 text-neutral-400'}`}>
              3. Verify
            </span>
          </div>
        </div>

        {/* Step 1: Credentials */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-2">
                Admin Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. hackadmin"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-primary font-mono text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-300 uppercase tracking-wider mb-2">
                Master Password (min 10 chars)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter complex password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black/40 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-primary font-mono text-sm transition-colors"
                />
              </div>

              {/* Password Strength Meter */}
              <div className="mt-3 space-y-2">
                <div className="flex gap-1 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full flex-1 transition-all ${strengthScore >= 1 ? 'bg-red-500' : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 transition-all ${strengthScore >= 3 ? 'bg-yellow-500' : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 transition-all ${strengthScore >= 4 ? 'bg-lime-500' : 'bg-transparent'}`} />
                  <div className={`h-full flex-1 transition-all ${strengthScore === 5 ? 'bg-primary' : 'bg-transparent'}`} />
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                  <span className={hasMinLength ? 'text-primary' : 'text-neutral-500'}>
                    ✓ 10+ characters
                  </span>
                  <span className={hasUpper ? 'text-primary' : 'text-neutral-500'}>
                    ✓ Uppercase letter
                  </span>
                  <span className={hasLower ? 'text-primary' : 'text-neutral-500'}>
                    ✓ Lowercase letter
                  </span>
                  <span className={hasNumber ? 'text-primary' : 'text-neutral-500'}>
                    ✓ Number
                  </span>
                  <span className={`col-span-2 ${hasSpecial ? 'text-primary' : 'text-neutral-500'}`}>
                    ✓ Special character (!@#$%^&*)
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={strengthScore < 5 || !username.trim()}
              className="w-full mt-6 py-3 rounded-lg bg-primary text-black font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Continue to 2FA Setup
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: Scan QR */}
        {step === 2 && (
          <div className="space-y-6 text-center">
            <p className="text-sm text-neutral-300">
              Scan this QR code with <strong>Google Authenticator</strong> or <strong>Authy</strong>:
            </p>

            <div className="inline-block p-4 rounded-xl bg-white shadow-xl mx-auto">
              {qrDataUrl && (
                <Image
                  src={qrDataUrl}
                  alt="TOTP 2FA QR Code"
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
              )}
            </div>

            <div className="text-left bg-black/40 border border-white/10 rounded-lg p-3">
              <span className="block text-xs font-mono text-neutral-400 mb-1">Manual Entry Secret:</span>
              <div className="flex items-center justify-between font-mono text-xs text-primary bg-white/5 p-2 rounded">
                <span className="tracking-wider break-all">{secretBase32}</span>
                <button
                  type="button"
                  onClick={copySecret}
                  className="ml-2 p-1 text-neutral-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/2 py-2.5 rounded-lg border border-white/15 text-sm text-neutral-300 hover:bg-white/5 transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-1/2 py-2.5 rounded-lg bg-primary text-black font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
              >
                Enter Code
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Enter Code */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-6 text-center">
            <p className="text-sm text-neutral-300">
              Enter the 6-digit code currently shown in your authenticator app:
            </p>

            <div className="relative max-w-[240px] mx-auto">
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                autoFocus
                required
                className="w-full py-3 text-center tracking-[0.6em] font-mono text-3xl rounded-xl bg-black/60 border border-primary/40 text-primary placeholder-neutral-700 focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-2.5 rounded-lg border border-white/15 text-sm text-neutral-300 hover:bg-white/5 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting || code.length !== 6}
                className="w-2/3 py-2.5 rounded-lg bg-primary text-black font-semibold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Setup
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
