'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  KeyRound,
  FileText,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

export default function OrganizerSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    department: '',
    yearOrDesignation: '',
    type: 'student' as 'student' | 'faculty',
    duty: 'registration_desk' as
      | 'registration_desk'
      | 'tech_support'
      | 'hospitality'
      | 'logistics'
      | 'other',
    username: '',
    password: '',
    note: '',
    signupCode: '',
    hpField: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/organizer/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          confirmPassword: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#05070F] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0a0f1d]/90 border border-emerald-500/30 rounded-2xl p-8 backdrop-blur-xl shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-mono tracking-tight text-white">
              Request Received
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your application to join the organizing crew has been submitted.
              The lead administrators will review your credentials and enable
              access.
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-left text-slate-300 font-mono space-y-1">
            <div>
              <span className="text-slate-500">Applicant:</span> {formData.name}
            </div>
            <div>
              <span className="text-slate-500">Username:</span> @
              {formData.username.toLowerCase()}
            </div>
            <div>
              <span className="text-slate-500">Duty:</span>{' '}
              {formData.duty.replace('_', ' ')}
            </div>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/organizer/login"
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              Go to Organizer Login <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-medium text-sm transition-all duration-200"
            >
              Return to Hackathon Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
          Join Organizing Crew
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-slate-400">
          Apply for volunteer, coordinator, or desk staff access for the hackathon
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-[#0a0f1d]/90 border border-slate-800/80 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-2xl">
          {error && (
            <div className="mb-6 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot field */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="hpField"
                tabIndex={-1}
                value={formData.hpField}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>

            {/* Role Type toggle */}
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-2">
                Affiliation
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, type: 'student' }))
                  }
                  className={`py-2.5 px-4 rounded-xl text-xs font-mono font-medium border transition-all ${
                    formData.type === 'student'
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  🎓 Student Organizer
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, type: 'faculty' }))
                  }
                  className={`py-2.5 px-4 rounded-xl text-xs font-mono font-medium border transition-all ${
                    formData.type === 'faculty'
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  🏛️ Faculty / Staff
                </button>
              </div>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane@college.edu"
                    className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Phone (10 Digits) *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  {formData.type === 'student' ? 'Year of Study *' : 'Designation *'}
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    name="yearOrDesignation"
                    required
                    value={formData.yearOrDesignation}
                    onChange={handleChange}
                    placeholder={
                      formData.type === 'student' ? '3rd Year B.Tech' : 'Assistant Professor'
                    }
                    className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  College / Institution *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    name="college"
                    required
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="Institute of Technology"
                    className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Department *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Computer Science & Engg"
                    className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Duty Preference */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Preferred Area of Duty *
              </label>
              <select
                name="duty"
                value={formData.duty}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition"
              >
                <option value="registration_desk">
                  Registration & Check-In Desk
                </option>
                <option value="tech_support">Technical Support & Mentorship</option>
                <option value="hospitality">Hospitality & Refreshments</option>
                <option value="logistics">Logistics & Stage Management</option>
                <option value="other">General Volunteering / Other</option>
              </select>
            </div>

            {/* Account Credentials */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Desired Username *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="janedoe"
                    className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Password (min 8 chars) *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Note & Passcode */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Why do you want to join? / Relevant experience
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <textarea
                  name="note"
                  rows={2}
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Share a short note on how you can assist the event..."
                  className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Access Passcode (if provided by organizers)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  name="signupCode"
                  value={formData.signupCode}
                  onChange={handleChange}
                  placeholder="Optional verification passcode"
                  className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  Submit Organizer Request <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already approved?{' '}
            <Link
              href="/organizer/login"
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4"
            >
              Sign In to Organizer Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
