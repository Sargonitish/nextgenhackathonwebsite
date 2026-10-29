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
  AlertCircle,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { teamRegistrationSchema } from '@/lib/validators';
import { toast } from 'sonner';

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

  const {
    register,
    control,
    handleSubmit,
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
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'members',
  });

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

  const onSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/public/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to complete registration');
        setSubmitting(false);
        return;
      }

      toast.success('Registration successful! Generating QR code...');
      router.push(`/register/success/${data.teamId}?token=${data.token}`);
    } catch {
      toast.error('Network error during registration');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-neutral-400 font-mono text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-primary" />
        Loading registration portal...
      </div>
    );
  }

  if (closedReason) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f] text-white">
        <div className="max-w-md w-full p-8 rounded-3xl border border-white/10 bg-[#12121c] text-center font-mono shadow-2xl">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center text-xl mb-4">
            🚫
          </div>
          <h1 className="text-xl font-bold mb-2">Registrations Closed</h1>
          <p className="text-xs text-neutral-400 mb-6 leading-relaxed">{closedReason}</p>
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white transition-colors"
            >
              Return to Homepage
            </Link>
            <Link
              href="/find-registration"
              className="py-2 px-4 rounded-xl text-neutral-400 hover:text-white text-xs"
            >
              Already registered? Find your QR Code
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const minSize = config?.settings?.minTeamSize ?? 2;
  const maxSize = config?.settings?.maxTeamSize ?? 4;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white py-12 px-4 sm:px-6 lg:px-8 font-mono text-xs">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Event</span>
        </Link>

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Team Entry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Register for {config?.name || 'HackX 2026'}
          </h1>
          <p className="text-neutral-400 mt-2 text-xs">
            Teams must have {minSize} to {maxSize} members. Member 1 is the Team Leader.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Honeypot field (hidden from real users) */}
          <input type="text" {...register('honeypot')} className="hidden" />

          {/* Section 1: Team & Track */}
          <div className="p-6 rounded-2xl border border-white/10 bg-[#12121c] space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              1. Team Identity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 mb-1">Team Name *</label>
                <input
                  type="text"
                  {...register('teamName')}
                  placeholder="e.g. ByteForce"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
                />
                {errors.teamName && (
                  <span className="text-red-400 text-[10px] mt-1 block">
                    {errors.teamName.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-neutral-300 mb-1">Challenge Track *</label>
                <select
                  {...register('track')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary"
                >
                  <option value="">Select an Innovation Track</option>
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
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">
                2. Team Members ({fields.length} of {maxSize})
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
                  className="px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1.5 transition-colors font-bold"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add Member
                </button>
              )}
            </div>

            {fields.map((field, index) => {
              const isLeader = index === 0;
              return (
                <div
                  key={field.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isLeader
                      ? 'border-primary/40 bg-[#14181f]'
                      : 'border-white/10 bg-[#12121c]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                          isLeader ? 'bg-primary text-black font-extrabold' : 'bg-white/10 text-neutral-300'
                        }`}
                      >
                        {index + 1}
                      </span>
                      {isLeader ? 'Team Leader (Contact Person)' : `Member #${index + 1}`}
                    </span>

                    {!isLeader && fields.length > minSize && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-1 rounded text-neutral-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-neutral-400 text-[10px] uppercase mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        {...register(`members.${index}.name` as const)}
                        placeholder="John Doe"
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary text-xs"
                      />
                      {errors.members?.[index]?.name && (
                        <span className="text-red-400 text-[10px] mt-0.5 block">
                          {errors.members[index]?.name?.message}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-neutral-400 text-[10px] uppercase mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        {...register(`members.${index}.email` as const)}
                        placeholder="john@college.edu"
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary text-xs"
                      />
                      {errors.members?.[index]?.email && (
                        <span className="text-red-400 text-[10px] mt-0.5 block">
                          {errors.members[index]?.email?.message}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-neutral-400 text-[10px] uppercase mb-1">
                        10-Digit Phone *
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        {...register(`members.${index}.phone` as const)}
                        placeholder="9876543210"
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary text-xs"
                      />
                      {errors.members?.[index]?.phone && (
                        <span className="text-red-400 text-[10px] mt-0.5 block">
                          {errors.members[index]?.phone?.message}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-neutral-400 text-[10px] uppercase mb-1">
                        College / University *
                      </label>
                      <input
                        type="text"
                        {...register(`members.${index}.college` as const)}
                        placeholder="Tech Engineering College"
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 text-[10px] uppercase mb-1">
                        Department / Branch *
                      </label>
                      <input
                        type="text"
                        {...register(`members.${index}.department` as const)}
                        placeholder="Computer Science"
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 text-[10px] uppercase mb-1">
                        Year of Study *
                      </label>
                      <select
                        {...register(`members.${index}.year` as const)}
                        className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-white focus:outline-none focus:border-primary text-xs"
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
          <div className="p-5 rounded-2xl border border-white/10 bg-[#12121c]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('agreeRules')}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-black/40 text-primary focus:ring-primary"
              />
              <span className="text-neutral-300 leading-relaxed text-xs">
                I hereby declare that our team will adhere to the hackathon code of conduct, all code will be written during the event, and all submitted members will bring valid college ID cards for registration desk check-in.
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
            className="w-full py-4 rounded-xl bg-primary hover:opacity-90 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all disabled:opacity-40"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Validating & Issuing Official Team QR...
              </>
            ) : (
              <>
                Confirm & Submit Team Registration
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
