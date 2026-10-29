'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  KeyRound,
  QrCode,
  History,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Terminal,
} from 'lucide-react';

interface SecurityLog {
  _id: string;
  username: string;
  role: 'admin' | 'organizer';
  ip: string;
  userAgent: string;
  success: boolean;
  reason?: string;
  createdAt: string;
}

export default function AdminSecurityPage() {
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordTotp, setPasswordTotp] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // 2FA Reset state
  const [resetting2FA, setResetting2FA] = useState(false);
  const [twoFaStep, setTwoFaStep] = useState<1 | 2>(1);
  const [twoFaData, setTwoFaData] = useState<{
    secret: string;
    qrDataUrl: string;
    setupToken: string;
  } | null>(null);
  const [verifyTotpCode, setVerifyTotpCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [twoFaSuccess, setTwoFaSuccess] = useState<string | null>(null);
  const [twoFaError, setTwoFaError] = useState<string | null>(null);

  // Logs state
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await fetch('/api/admin/security/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await fetch('/api/admin/security/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          totpCode: passwordTotp,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setPasswordSuccess('Master admin password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordTotp('');
    } catch (err: any) {
      setPasswordError(err.message || 'Operation failed');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleStart2FAReset = async () => {
    try {
      setResetting2FA(true);
      setTwoFaError(null);
      setTwoFaSuccess(null);

      const res = await fetch('/api/admin/security/reset-2fa');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start 2FA reset');
      }

      setTwoFaData(data);
      setTwoFaStep(2);
    } catch (err: any) {
      setTwoFaError(err.message || 'Failed to initialize QR code');
    } finally {
      setResetting2FA(false);
    }
  };

  const handleConfirm2FAReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFaData) return;

    try {
      setResetting2FA(true);
      setTwoFaError(null);

      const res = await fetch('/api/admin/security/reset-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: verifyTotpCode,
          setupToken: twoFaData.setupToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setTwoFaSuccess(data.message || '2FA Reset Successful!');
      setTwoFaData(null);
      setTwoFaStep(1);
      setVerifyTotpCode('');
    } catch (err: any) {
      setTwoFaError(err.message || 'Verification error');
    } finally {
      setResetting2FA(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-cyan-400" />
          Security & Access Hardening
        </h1>
        <p className="text-sm text-slate-400">
          Root administrator credential controls, 2FA authenticator rotation, and security event logs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Master Password Change */}
        <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 text-white font-mono font-bold text-base">
            <Lock className="w-5 h-5 text-cyan-400" />
            <span>Change Master Password</span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Updating the master administrator password requires the current password plus your active 6-digit TOTP code.
          </p>

          {passwordSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3.5 rounded-xl flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1">Current Master Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">New Password (min 8 chars)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Current 6-Digit Authenticator Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={passwordTotp}
                onChange={(e) => setPasswordTotp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 tracking-widest text-center text-sm font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Master Password
            </button>
          </form>
        </div>

        {/* 2FA Re-enrollment */}
        <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-mono font-bold text-base">
              <QrCode className="w-5 h-5 text-cyan-400" />
              <span>Rotate 2FA Authenticator</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Re-enroll in Google Authenticator or 1Password. If you replace your phone or need to rotate keys, generate a fresh QR secret here.
            </p>

            {twoFaSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3.5 rounded-xl flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{twoFaSuccess}</span>
              </div>
            )}

            {twoFaError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{twoFaError}</span>
              </div>
            )}

            {twoFaStep === 1 && (
              <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3 text-xs text-slate-400 font-mono">
                <p>
                  Rotating your 2FA will render your current authenticator profile invalid once the new token is confirmed.
                </p>
                <button
                  type="button"
                  disabled={resetting2FA}
                  onClick={handleStart2FAReset}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs transition flex items-center gap-2 border border-slate-700"
                >
                  {resetting2FA && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Generate New Authenticator QR
                </button>
              </div>
            )}

            {twoFaStep === 2 && twoFaData && (
              <form onSubmit={handleConfirm2FAReset} className="space-y-4 text-xs font-mono">
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="bg-white p-2 rounded-lg">
                    <img
                      src={twoFaData.qrDataUrl}
                      alt="2FA QR Code"
                      className="w-32 h-32"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <p className="text-slate-300 font-semibold">
                      Scan with Google Authenticator or Aegis
                    </p>
                    <div className="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      <span className="text-[10px] text-cyan-400 select-all font-mono">
                        {twoFaData.secret}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(twoFaData.secret);
                          setCopiedSecret(true);
                          setTimeout(() => setCopiedSecret(false), 2000);
                        }}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        {copiedSecret ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">
                    Enter 6-Digit Code from New App Profile:
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verifyTotpCode}
                    onChange={(e) => setVerifyTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 tracking-widest text-center text-sm font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFaStep(1);
                      setTwoFaData(null);
                    }}
                    className="px-3 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetting2FA || verifyTotpCode.length !== 6}
                    className="flex-1 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {resetting2FA && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirm & Activate New 2FA
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Access Logs Table */}
      <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-white">
              Recent Authentication & Security Audit Logs
            </h2>
          </div>
          <button
            onClick={fetchLogs}
            disabled={logsLoading}
            className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? 'animate-spin' : ''}`} />
            Refresh Logs
          </button>
        </div>

        {logsLoading ? (
          <div className="py-12 flex justify-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-xs font-mono text-slate-500 py-8 text-center">
            No audit records logged yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">User / Identity</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">IP Address</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {log.username}
                    </td>
                    <td className="py-2.5 px-3 uppercase text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {log.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-cyan-400/80">
                      {log.ip}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          log.success
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {log.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">
                      {log.reason || (log.success ? 'Authenticated' : '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
