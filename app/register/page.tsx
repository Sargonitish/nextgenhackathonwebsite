'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Trash2,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  QrCode,
  LogOut,
  Lock,
} from 'lucide-react';
import { teamRegistrationSchema } from '@/lib/validators';
import { toast } from 'sonner';
import GoogleSignInButton, { GoogleVerifiedUser } from '@/components/public/GoogleSignInButton';
import { useStudentAuth } from '@/context/StudentAuthContext';

interface EventConfig {
  name: string;
  tracks: { title: string }[];
  settings: {
    registrationOpen: boolean;
    registrationDeadline?: string;
    maxTeams?: number;
    minTeamSize: number;
    maxTeamSize: number;
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [closedReason, setClosedReason] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);

  const { user, ticket, login, logout, refreshTicket } = useStudentAuth();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(teamRegistrationSchema),
    defaultValues: {
      teamName: '',
      track: '',
      members: [
        { name: '', email: '', phone: '', college: '', department: '', year: '3' },
        { name: '', email: '', phone: '', college: '', department: '', year: '3' },
      ],
      agreeRules: false,
      honeypot: '',
      leaderGoogleId: '',
      isGoogleVerified: false,
      googleAvatar: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'members',
  });

  // Sync logged-in Google user into Leader form fields
  useEffect(() => {
    if (user) {
      if (user.name) {
        setValue('members.0.name', user.name, { shouldValidate: true });
      }
      if (user.email) {
        setValue('members.0.email', user.email, { shouldValidate: true });
      }
      setValue('leaderGoogleId', user.googleId);
      setValue('isGoogleVerified', true);
      setValue('googleAvatar', user.avatar || '');
    }
  }, [user, setValue]);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/public/site');
        if (res.ok) {
          const data = await res.json();
          if (!data.event) {
            setClosedReason('No active hackathon is open for registration.');
            setLoading(false);
            return;
          }

          const s = data.event.settings;
          if (!s?.registrationOpen) {
            setClosedReason('Registrations have been closed by the organizing committee.');
          } else if (s.registrationDeadline && new Date() > new Date(s.registrationDeadline)) {
            setClosedReason('The registration deadline has passed.');
          }

          setConfig(data.event);
        }
      } catch {
        toast.error('Failed to load event configuration');
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleGatewayGoogleSuccess = async (googleUser: GoogleVerifiedUser) => {
    const existingTicket = await login(googleUser);
    toast.success(`Welcome, ${googleUser.name}!`);
    if (existingTicket) {
      toast.info(`Active pass located for team: ${existingTicket.teamName || existingTicket.teamId}`);
    }
  };

  const handleLogout = () => {
    logout();
    setValue('members.0.email', '');
    setValue('members.0.name', '');
    setValue('leaderGoogleId', '');
    setValue('isGoogleVerified', false);
    setValue('googleAvatar', '');
    setManualMode(false);
    toast.success('Logged out');
  };

  const onSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        leaderGoogleId: user?.googleId || undefined,
        isGoogleVerified: Boolean(user),
        googleAvatar: user?.avatar || undefined,
      };

      const res = await fetch('/api/public/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to complete registration');
        setSubmitting(false);
        return;
      }

      // Update student ticket state in context and storage
      await refreshTicket();

      toast.success('Registration successful! Generating QR pass...');
      router.push(`/register/success/${data.teamId}?token=${data.token}`);
    } catch {
      toast.error('Network error during registration');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy text-offwhite font-mono text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-yellow" />
        INITIALIZING REGISTRATION TERMINAL...
      </div>
    );
  }

  if (closedReason) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-navy text-offwhite font-mono">
        <div className="max-w-md w-full p-8 border border-line bg-navy shadow-hard text-center">
          <div className="font-mono text-xs text-yellow uppercase tracking-widest mb-3">
            [ REGISTRATION STATUS: CLOSED ]
          </div>
          <h1 className="text-xl font-bold mb-2">Registrations Closed</h1>
          <p className="text-xs text-offwhite/60 mb-6 leading-relaxed">{closedReason}</p>
          <div className="flex flex-col gap-3 text-xs">
            <Link
              href="/"
              className="py-2.5 px-4 bg-yellow text-navy font-bold uppercase tracking-wider hover:opacity-95 transition-opacity"
            >
              Return to Homepage
            </Link>
            <Link
              href="/find-registration"
              className="py-2 px-4 border border-line text-offwhite hover:text-yellow transition-colors"
            >
              Find existing registration pass →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const minSize = config?.settings?.minTeamSize ?? 2;
  const maxSize = config?.settings?.maxTeamSize ?? 4;

  /* ========================================================================= */
  /* STEP 01: GOOGLE AUTHENTICATION GATEWAY (Shown if user is not yet logged in */
  /* and has not chosen manual fallback)                                       */
  /* ========================================================================= */
  if (!user && !manualMode) {
    return (
      <div className="min-h-screen bg-navy text-offwhite py-12 px-4 sm:px-6 lg:px-8 font-mono text-xs flex items-center justify-center">
        <div className="max-w-xl w-full border border-line bg-[#0c223f] p-6 sm:p-10 shadow-hard space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-offwhite/60 hover:text-yellow transition-colors uppercase tracking-wider text-[11px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← RETURN TO EVENT</span>
            </Link>
            <div className="text-[11px] text-yellow font-bold uppercase tracking-widest">
              [ STEP 01 / AUTH GATE ]
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-yellow/40 bg-yellow/10 text-yellow uppercase tracking-widest text-[10px] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OFFICIAL REGISTRATION ENTRANCE</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-offwhite uppercase tracking-tight">
              CONTINUE WITH GOOGLE
            </h1>
            <p className="text-offwhite/70 mt-2 text-xs leading-relaxed">
              Sign in with your Google account to auto-fill your Team Leader details, protect your team from duplication, and link your permanent check-in ticket pass.
            </p>
          </div>

          {/* Google Sign In Component */}
          <div className="p-5 border border-line bg-navy/90 space-y-3">
            <div className="text-[11px] text-yellow font-bold uppercase tracking-wider flex items-center justify-between mb-2">
              <span>&gt;_ GOOGLE IDENTITY SERVICES</span>
              <span className="text-offwhite/40">[SECURE POPUP]</span>
            </div>
            <GoogleSignInButton onSuccess={handleGatewayGoogleSuccess} />
          </div>

          {/* Telemetry Benefit Specs */}
          <div className="space-y-2 border-t border-line pt-4 text-[11px] text-offwhite/60">
            <div className="flex items-center gap-2">
              <span className="text-yellow">✓</span>
              <span>1-Click Team Leader Name &amp; Email autofill</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow">✓</span>
              <span>Persistent ticket retrieval across browser reloads &amp; devices</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow">✓</span>
              <span>Verified attendance badge for hackathon certificate</span>
            </div>
          </div>

          {/* Fallback Manual Option */}
          <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <button
              type="button"
              onClick={() => setManualMode(true)}
              className="text-offwhite/50 hover:text-yellow underline uppercase transition-colors"
            >
              [ Continue with manual registration instead → ]
            </button>
            <Link
              href="/find-registration"
              className="text-offwhite/50 hover:text-offwhite transition-colors"
            >
              Lookup existing ticket
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================================= */
  /* STEP 02: MAIN REGISTRATION FORM                                           */
  /* (Displays top-right ticket pass button when pass exists)                  */
  /* ========================================================================= */
  return (
    <div className="min-h-screen bg-navy text-offwhite py-12 px-4 sm:px-6 lg:px-8 font-mono text-xs">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-offwhite/60 hover:text-yellow transition-colors uppercase tracking-wider text-[11px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← RETURN TO HOMEPAGE</span>
          </Link>

          {/* Top Right User Profile + Ticket Status */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 border border-line bg-[#0c223f] px-3 py-1.5 shadow-hard-sm">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-4 h-4 rounded-full border border-yellow"
                  />
                ) : (
                  <span className="text-yellow font-bold">G</span>
                )}
                <span className="text-yellow font-bold text-[11px] truncate max-w-[140px]">
                  {user.name.split(' ')[0] || user.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-offwhite/40 hover:text-red-400 ml-1"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-offwhite/40 tracking-widest hidden sm:inline">
                [ MANUAL MODE ]
              </span>
            )}

            {/* In the Right Corner: VIEW TICKET PASS BUTTON */}
            {ticket && (
              <Link
                href={`/register/success/${ticket.teamId}?token=${ticket.token}`}
                className="px-3.5 py-1.5 bg-yellow text-navy font-bold uppercase tracking-wider text-xs border border-yellow shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-1.5 animate-pulse"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>VIEW TICKET ({ticket.teamId})</span>
              </Link>
            )}
          </div>
        </div>

        {/* Existing Ticket Alert Banner */}
        {ticket && (
          <div className="p-4 border border-yellow bg-yellow/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-offwhite">
            <div className="flex items-center gap-2.5">
              <QrCode className="w-5 h-5 text-yellow shrink-0" />
              <div>
                <div className="text-yellow font-bold text-xs uppercase">
                  ACTIVE REGISTRATION PASS FOUND FOR YOUR ACCOUNT
                </div>
                <div className="text-offwhite/70 text-[11px]">
                  Team: <strong className="text-offwhite">{ticket.teamName || ticket.teamId}</strong> (Pass ID: {ticket.teamId}). You can view your pass or register a new team below.
                </div>
              </div>
            </div>
            <Link
              href={`/register/success/${ticket.teamId}?token=${ticket.token}`}
              className="px-4 py-2 bg-yellow text-navy font-bold uppercase text-xs tracking-wider shrink-0"
            >
              View Ticket Pass →
            </Link>
          </div>
        )}

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-yellow/40 bg-yellow/10 text-yellow uppercase tracking-widest text-[11px] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OFFICIAL TEAM REGISTRATION ENTRY</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-offwhite uppercase">
            REGISTER FOR {config?.name || 'HACKX 2026'}
          </h1>
          <p className="text-offwhite/60 mt-2 text-xs leading-relaxed">
            Teams must consist of {minSize} to {maxSize} members. Member 1 is designated as the primary Team Leader for communications and check-in.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Honeypot field */}
          <input type="text" {...register('honeypot')} className="hidden" />

          {/* Section 1: Team & Track */}
          <div className="p-6 border border-line bg-[#0c223f] shadow-hard-sm space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-sm font-bold text-offwhite flex items-center gap-2 uppercase tracking-wider">
                <Users className="w-4 h-4 text-yellow" />
                1. TEAM IDENTITY &amp; TRACK
              </h2>
              <span className="text-[10px] text-offwhite/40">[SEC: 01]</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-offwhite/70 uppercase text-[10px] tracking-wider mb-1.5">
                  Team Name *
                </label>
                <input
                  type="text"
                  {...register('teamName')}
                  placeholder="e.g. AGENT_FORCE"
                  className="w-full px-3.5 py-2.5 bg-navy border border-line text-offwhite placeholder:text-offwhite/30 focus:outline-none focus:border-yellow text-xs font-mono"
                />
                {errors.teamName && (
                  <span className="text-red-400 text-[10px] mt-1 block">
                    {errors.teamName.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-offwhite/70 uppercase text-[10px] tracking-wider mb-1.5">
                  Challenge Track *
                </label>
                <select
                  {...register('track')}
                  className="w-full px-3.5 py-2.5 bg-navy border border-line text-offwhite focus:outline-none focus:border-yellow text-xs font-mono"
                >
                  <option value="">Select Innovation Track</option>
                  {config?.tracks?.map((t) => (
                    <option key={t.title} value={t.title}>
                      {t.title}
                    </option>
                  ))}
                </select>
                {errors.track && (
                  <span className="text-red-400 text-[10px] mt-1 block">
                    {errors.track.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Dynamic Member Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-sm font-bold text-offwhite uppercase tracking-wider">
                2. TEAM ROSTER ({fields.length} OF {maxSize})
              </h2>

              {fields.length < maxSize && (
                <button
                  type="button"
                  onClick={() =>
                    append({
                      name: '',
                      email: '',
                      phone: '',
                      college: '',
                      department: '',
                      year: '3',
                    })
                  }
                  className="px-3 py-1.5 border border-yellow bg-yellow/10 text-yellow hover:bg-yellow hover:text-navy flex items-center gap-1.5 transition-colors font-bold uppercase text-[11px]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  + ADD MEMBER
                </button>
              )}
            </div>

            {fields.map((field, index) => {
              const isLeader = index === 0;
              return (
                <div
                  key={field.id}
                  className={`p-5 border transition-all ${
                    isLeader
                      ? 'border-yellow bg-[#0d2646] shadow-hard-sm'
                      : 'border-line bg-[#0c223f]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-line">
                    <span className="font-bold text-offwhite flex items-center gap-2 uppercase tracking-wider text-xs">
                      <span
                        className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold ${
                          isLeader ? 'bg-yellow text-navy' : 'bg-line text-offwhite/60'
                        }`}
                      >
                        0{index + 1}
                      </span>
                      {isLeader ? (
                        <span className="text-yellow">TEAM LEADER // PRIMARY CONTACT</span>
                      ) : (
                        <span>MEMBER #{index + 1}</span>
                      )}
                    </span>

                    {!isLeader && fields.length > minSize && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-1 text-offwhite/40 hover:text-red-400 transition-colors"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Leader Google Status */}
                  {isLeader && user && (
                    <div className="mb-4 p-3 border border-yellow/60 bg-navy flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt=""
                            className="w-7 h-7 rounded-full border border-yellow"
                          />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-yellow shrink-0" />
                        )}
                        <div>
                          <div className="text-yellow font-bold uppercase text-[11px] flex items-center gap-1">
                            <span>✓ GOOGLE VERIFIED LEADER</span>
                          </div>
                          <div className="text-offwhite/80 text-xs">{user.email}</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-offwhite/40 uppercase">
                        [ LOCKED &amp; VERIFIED ]
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-offwhite/60 text-[10px] uppercase mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        {...register(`members.${index}.name` as const)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 bg-navy border border-line text-offwhite focus:outline-none focus:border-yellow text-xs font-mono"
                      />
                      {errors.members?.[index]?.name && (
                        <span className="text-red-400 text-[10px] mt-0.5 block">
                          {errors.members[index]?.name?.message}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-offwhite/60 text-[10px] uppercase mb-1">
                        Email Address *
                        {isLeader && user && (
                          <span className="text-yellow ml-1 font-bold">[VERIFIED]</span>
                        )}
                      </label>
                      <input
                        type="email"
                        readOnly={isLeader && Boolean(user)}
                        {...register(`members.${index}.email` as const)}
                        placeholder="john@college.edu"
                        className={`w-full px-3 py-2 bg-navy border text-offwhite focus:outline-none focus:border-yellow text-xs font-mono ${
                          isLeader && user
                            ? 'border-yellow/70 bg-navy/60 cursor-not-allowed text-yellow'
                            : 'border-line'
                        }`}
                      />
                      {errors.members?.[index]?.email && (
                        <span className="text-red-400 text-[10px] mt-0.5 block">
                          {errors.members[index]?.email?.message}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-offwhite/60 text-[10px] uppercase mb-1">
                        10-Digit Mobile *
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        {...register(`members.${index}.phone` as const)}
                        placeholder="9876543210"
                        className="w-full px-3 py-2 bg-navy border border-line text-offwhite focus:outline-none focus:border-yellow text-xs font-mono"
                      />
                      {errors.members?.[index]?.phone && (
                        <span className="text-red-400 text-[10px] mt-0.5 block">
                          {errors.members[index]?.phone?.message}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-offwhite/60 text-[10px] uppercase mb-1">
                        College / University *
                      </label>
                      <input
                        type="text"
                        {...register(`members.${index}.college` as const)}
                        placeholder="Tech Engineering College"
                        className="w-full px-3 py-2 bg-navy border border-line text-offwhite focus:outline-none focus:border-yellow text-xs font-mono"
                      />
                      {errors.members?.[index]?.college && (
                        <span className="text-red-400 text-[10px] mt-0.5 block">
                          {errors.members[index]?.college?.message}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-offwhite/60 text-[10px] uppercase mb-1">
                        Department / Branch *
                      </label>
                      <input
                        type="text"
                        {...register(`members.${index}.department` as const)}
                        placeholder="Computer Science"
                        className="w-full px-3 py-2 bg-navy border border-line text-offwhite focus:outline-none focus:border-yellow text-xs font-mono"
                      />
                      {errors.members?.[index]?.department && (
                        <span className="text-red-400 text-[10px] mt-0.5 block">
                          {errors.members[index]?.department?.message}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-offwhite/60 text-[10px] uppercase mb-1">
                        Year of Study *
                      </label>
                      <select
                        {...register(`members.${index}.year` as const)}
                        className="w-full px-3 py-2 bg-navy border border-line text-offwhite focus:outline-none focus:border-yellow text-xs font-mono"
                      >
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                        <option value="5">5th Year / PG</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section 3: Rules Agreement */}
          <div className="p-5 border border-line bg-[#0c223f]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('agreeRules')}
                className="mt-0.5 w-4 h-4 border border-line bg-navy text-yellow accent-yellow focus:ring-0 cursor-pointer"
              />
              <span className="text-offwhite/80 leading-relaxed text-xs">
                I hereby declare that our team will adhere to the hackathon code of conduct, all code will be written during the 24-hour sprint, and all registered members will bring valid college ID cards for registration desk check-in.
              </span>
            </label>
            {errors.agreeRules && (
              <span className="text-red-400 text-[10px] mt-1 block">
                {errors.agreeRules.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-yellow text-navy font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 border border-yellow shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm transition-all disabled:opacity-40 cursor-pointer"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                VALIDATING &amp; ISSUING OFFICIAL TEAM QR...
              </>
            ) : (
              <>
                <span>CONFIRM &amp; SUBMIT TEAM REGISTRATION</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
