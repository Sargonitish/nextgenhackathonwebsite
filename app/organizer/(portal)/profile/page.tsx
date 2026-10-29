'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
} from 'lucide-react';

interface OrganizerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  yearOrDesignation: string;
  type: string;
  duty: string;
  photoUrl?: string;
  username: string;
  permissions: {
    checkin: boolean;
    viewTeams: boolean;
    viewContacts: boolean;
  };
  status: string;
  checkinsDone: number;
}

export default function OrganizerProfilePage() {
  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/organizer/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data?.organizer) {
          const org = data.organizer;
          setProfile(org);
          setName(org.name || '');
          setPhone(org.phone || '');
          setPhotoUrl(org.photoUrl || '');
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setErrorMsg(null);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/organizer/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setPhotoUrl(data.url);
      setSuccessMsg('Photo uploaded! Remember to save profile changes.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Image upload error');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match');
      return;
    }

    try {
      setSaving(true);
      const payload: any = {
        name,
        phone,
        photoUrl,
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch('/api/organizer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setProfile(data.organizer);
      setSuccessMsg('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
        <span className="text-xs font-mono">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
          <User className="w-6 h-6 text-cyan-400" />
          My Organizer Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your credentials, contact phone, and desk preferences
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm p-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-900 border-2 border-cyan-500/40 flex items-center justify-center">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-slate-600" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black cursor-pointer transition shadow-md">
              <Upload className="w-3.5 h-3.5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg font-bold text-white">{profile?.name}</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                @{profile?.username}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {profile?.email} • {profile?.college}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Duty: {profile?.duty.replace('_', ' ')}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Total Check-Ins: {profile?.checkinsDone || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            Personal Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Phone Number (10 Digits)</label>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Change Password Block */}
        <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-cyan-400" />
            Change Password
          </h3>
          <p className="text-[11px] text-slate-400 font-mono">
            Leave blank if you do not want to change your login password.
          </p>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono tracking-wide shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Profile & Credentials
        </button>
      </form>
    </div>
  );
}
