'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Ban,
  Clock,
  Key,
  ShieldAlert,
  Loader2,
  Trash2,
  Edit,
  ExternalLink,
  Copy,
  Check,
  Phone,
  Mail,
  Building,
} from 'lucide-react';

interface Organizer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  yearOrDesignation: string;
  type: 'student' | 'faculty';
  duty: string;
  note?: string;
  photoUrl?: string;
  username: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejectReason?: string;
  permissions: {
    checkin: boolean;
    viewTeams: boolean;
    viewContacts: boolean;
  };
  showOnWebsite: boolean;
  checkinsDone: number;
  submittedIp: string;
  createdAt: string;
}

export default function AdminOrganizersPage() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'suspended'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Popups
  const [selectedOrg, setSelectedOrg] = useState<Organizer | null>(null);
  const [modalMode, setModalMode] = useState<'approve' | 'reject' | 'edit' | 'tempPass' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  // Form states inside modal
  const [duty, setDuty] = useState<string>('registration_desk');
  const [permissions, setPermissions] = useState({
    checkin: true,
    viewTeams: true,
    viewContacts: false,
  });
  const [showOnWebsite, setShowOnWebsite] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchOrganizers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/organizers?status=${activeTab}&search=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (res.ok) {
        setOrganizers(data.organizers || []);
      }
    } catch (err) {
      console.error('Failed to load organizers', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm]);

  useEffect(() => {
    fetchOrganizers();
  }, [fetchOrganizers]);

  const openApproveModal = (org: Organizer) => {
    setSelectedOrg(org);
    setDuty(org.duty || 'registration_desk');
    setPermissions(org.permissions || { checkin: true, viewTeams: true, viewContacts: false });
    setShowOnWebsite(org.showOnWebsite || false);
    setModalMode('approve');
  };

  const openEditModal = (org: Organizer) => {
    setSelectedOrg(org);
    setDuty(org.duty || 'registration_desk');
    setPermissions(org.permissions || { checkin: true, viewTeams: true, viewContacts: false });
    setShowOnWebsite(org.showOnWebsite || false);
    setModalMode('edit');
  };

  const openRejectModal = (org: Organizer) => {
    setSelectedOrg(org);
    setRejectReason('');
    setModalMode('reject');
  };

  const handleDecision = async (action: 'approve' | 'reject' | 'suspend' | 'reactivate' | 'reset-password') => {
    if (!selectedOrg) return;
    try {
      setActionLoading(true);
      const payload: any = { action };

      if (action === 'approve') {
        payload.duty = duty;
        payload.permissions = permissions;
        payload.showOnWebsite = showOnWebsite;
      } else if (action === 'reject') {
        payload.reason = rejectReason;
      }

      const res = await fetch(`/api/admin/organizers/${selectedOrg._id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Operation failed');
        return;
      }

      if (action === 'reset-password') {
        setTempPassword(data.tempPassword);
        setModalMode('tempPass');
        return;
      }

      setModalMode(null);
      setSelectedOrg(null);
      fetchOrganizers();
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedOrg) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/organizers/${selectedOrg._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duty,
          permissions,
          showOnWebsite,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update organizer');
        return;
      }

      setModalMode(null);
      setSelectedOrg(null);
      fetchOrganizers();
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete organizer "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/organizers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchOrganizers();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to delete');
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            Organizer Access & Review
          </h1>
          <p className="text-sm text-slate-400">
            Manage volunteer credentials, desk permissions, and check-in audit
          </p>
        </div>
      </div>

      {/* Filter Bar & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {(['pending', 'approved', 'rejected', 'suspended'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-medium capitalize transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 shadow-sm'
                  : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {tab === 'pending' && '⏳ '}
              {tab === 'approved' && '✅ '}
              {tab === 'rejected' && '❌ '}
              {tab === 'suspended' && '🚫 '}
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search name, email, college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mb-2" />
          <span className="text-xs font-mono">Loading applicants...</span>
        </div>
      ) : organizers.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400 font-mono">No organizers found in this tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {organizers.map((org) => (
            <div
              key={org._id}
              className="bg-[#0b101d] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-100 text-base">{org.name}</h3>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        @{org.username}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {org.yearOrDesignation} • {org.type === 'faculty' ? '🏛️ Faculty' : '🎓 Student'}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold ${
                      org.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : org.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : org.status === 'suspended'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {org.status}
                  </span>
                </div>

                {/* College & Department */}
                <div className="text-xs text-slate-300 space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Building className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{org.college} ({org.department})</span>
                  </div>
                  <div className="flex items-center gap-3 pt-1 text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500" /> {org.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" /> {org.phone}
                    </span>
                  </div>
                </div>

                {/* Role & Duty Details */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Duty: {org.duty?.replace('_', ' ')}
                  </span>
                  {org.status === 'approved' && (
                    <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Check-ins: {org.checkinsDone || 0}
                    </span>
                  )}
                  {org.showOnWebsite && (
                    <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      🌐 Public Roster
                    </span>
                  )}
                </div>

                {/* Note / Statement */}
                {org.note && (
                  <p className="text-xs text-slate-400 italic bg-slate-950/40 p-2 rounded border border-slate-900">
                    &quot;{org.note}&quot;
                  </p>
                )}

                {/* Rejection reason if rejected */}
                {org.status === 'rejected' && org.rejectReason && (
                  <p className="text-xs text-rose-300 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                    <strong>Reason:</strong> {org.rejectReason}
                  </p>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-slate-500">
                  Applied: {new Date(org.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  {org.status === 'pending' && (
                    <>
                      <button
                        onClick={() => openApproveModal(org)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-medium transition flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(org)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-medium transition flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  )}

                  {org.status === 'approved' && (
                    <>
                      <button
                        onClick={() => openEditModal(org)}
                        title="Edit Permissions & Duty"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrg(org);
                          handleDecision('reset-password');
                        }}
                        title="Generate Temp Password"
                        className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs transition"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrg(org);
                          if (confirm(`Suspend access for ${org.name}? Their active login sessions will be immediately invalidated.`)) {
                            handleDecision('suspend');
                          }
                        }}
                        title="Suspend Account"
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs transition"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {org.status === 'suspended' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedOrg(org);
                          handleDecision('reactivate');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-medium transition"
                      >
                        Reactivate
                      </button>
                      <button
                        onClick={() => handleDelete(org._id, org.name)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {org.status === 'rejected' && (
                    <>
                      <button
                        onClick={() => openApproveModal(org)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-medium transition"
                      >
                        Re-Approve
                      </button>
                      <button
                        onClick={() => handleDelete(org._id, org.name)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Approve or Edit */}
      {(modalMode === 'approve' || modalMode === 'edit') && selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b101d] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-cyan-400" />
              {modalMode === 'approve' ? 'Approve Organizer' : 'Edit Organizer Settings'}
            </h3>
            <p className="text-xs text-slate-400">
              Configure access roles and permissions for <strong>{selectedOrg.name}</strong> (@{selectedOrg.username}).
            </p>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1">Assigned Duty</label>
                <select
                  value={duty}
                  onChange={(e) => setDuty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="registration_desk">Registration Desk</option>
                  <option value="tech_support">Tech Support</option>
                  <option value="hospitality">Hospitality</option>
                  <option value="logistics">Logistics</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="block text-slate-400 uppercase tracking-wider text-[10px]">
                  Permissions
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={permissions.checkin}
                    onChange={(e) => setPermissions({ ...permissions, checkin: e.target.checked })}
                    className="rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                  <span>Check-In Scanner (`/checkin`)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={permissions.viewTeams}
                    onChange={(e) => setPermissions({ ...permissions, viewTeams: e.target.checked })}
                    className="rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                  <span>View Participant Rosters</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={permissions.viewContacts}
                    onChange={(e) => setPermissions({ ...permissions, viewContacts: e.target.checked })}
                    className="rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                  <span className="text-amber-400">View Unmasked Student Contacts</span>
                </label>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={showOnWebsite}
                    onChange={(e) => setShowOnWebsite(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                  <span>Show profile on public website organizing roster</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => (modalMode === 'approve' ? handleDecision('approve') : handleSaveEdit())}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold transition flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {modalMode === 'approve' ? 'Confirm Approval' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reject */}
      {modalMode === 'reject' && selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b101d] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              Reject Organizer Application
            </h3>
            <p className="text-xs text-slate-400">
              Please enter the reason for rejecting <strong>{selectedOrg.name}</strong>. This message will be shown if they attempt to sign in.
            </p>

            <textarea
              rows={3}
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Volunteer slots for this track are already filled."
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !rejectReason.trim()}
                onClick={() => handleDecision('reject')}
                className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-xs font-mono font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Temp Password */}
      {modalMode === 'tempPass' && tempPassword && selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b101d] border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold font-mono text-amber-400 flex items-center gap-2">
              <Key className="w-5 h-5" />
              Temporary Password Generated
            </h3>
            <p className="text-xs text-slate-300">
              A temporary password has been set for <strong>{selectedOrg.name}</strong>. Provide this code to the organizer securely:
            </p>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between font-mono text-sm text-cyan-400">
              <span>{tempPassword}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(tempPassword);
                  setCopiedPass(true);
                  setTimeout(() => setCopiedPass(false), 2000);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                {copiedPass ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Existing active sessions have been revoked. They should change their password after signing in.
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setModalMode(null);
                  setSelectedOrg(null);
                  setTempPassword(null);
                  fetchOrganizers();
                }}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
