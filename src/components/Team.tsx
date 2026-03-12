import React, { useState, useEffect } from 'react';
import { Users, Mail, Crown, Eye, Edit3, Trash2, Plus, X, Check, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const EMAILJS_SERVICE_ID  = 'service_p2at09s';
const EMAILJS_TEMPLATE_ID = 'template_a1bgmfq';
const EMAILJS_PUBLIC_KEY  = 'Q2VrwmHgxqKsRp3YD';

const ROLES = [
  {
    id: 'Owner',
    icon: <Crown size={16} />,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Owner',
    desc: 'Full access — manage team, settings, upload, edit, approve, delete',
    permissions: ['Upload', 'Edit fields', 'Approve', 'Delete', 'Manage team', 'Settings'],
  },
  {
    id: 'Editor',
    icon: <Edit3 size={16} />,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    label: 'Editor',
    desc: 'Can upload documents, edit extracted fields and approve them',
    permissions: ['Upload', 'Edit fields', 'Approve'],
  },
  {
    id: 'Viewer',
    icon: <Eye size={16} />,
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-600',
    label: 'Viewer',
    desc: 'Read-only access — can view and export documents only',
    permissions: ['View', 'Export'],
  },
];

const INITIAL_MEMBERS = [
  { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'Owner',  avatar: 'AU', color: 'bg-blue-600',   status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@company.com',  role: 'Editor', avatar: 'JS', color: 'bg-green-600',  status: 'active' },
  { id: '3', name: 'Bob Lee',    email: 'bob@company.com',   role: 'Viewer', avatar: 'BL', color: 'bg-purple-600', status: 'active' },
];

async function sendInviteEmail(to_email: string, to_name: string, role: string, from_name: string) {
  // Load EmailJS dynamically
  const emailjs = (window as any).emailjs;
  if (!emailjs) throw new Error('EmailJS not loaded');

  return emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      to_email,
      to_name:    to_name || to_email.split('@')[0],
      from_name,
      role,
      invite_link: window.location.origin,
      team_name:  'DocExtract AI',
    },
    EMAILJS_PUBLIC_KEY
  );
}

export default function Team() {
  const [members, setMembers]       = useState(INITIAL_MEMBERS);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Viewer');
  const [sending, setSending]       = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [sendMsg, setSendMsg]       = useState('');
  const [saved, setSaved]           = useState<string | null>(null);
  const [emailJSReady, setEmailJSReady] = useState(false);

  // Load EmailJS SDK
  useEffect(() => {
    if ((window as any).emailjs) { setEmailJSReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = () => {
      (window as any).emailjs.init(EMAILJS_PUBLIC_KEY);
      setEmailJSReady(true);
    };
    document.head.appendChild(script);
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setSending(true);
    setSendStatus('idle');

    try {
      await sendInviteEmail(inviteEmail.trim(), inviteName.trim(), inviteRole, 'Admin User');

      // Add to members list as pending
      setMembers(m => [...m, {
        id:     Date.now().toString(),
        name:   inviteName.trim() || inviteEmail.split('@')[0],
        email:  inviteEmail.trim(),
        role:   inviteRole,
        avatar: (inviteName.trim() || inviteEmail).slice(0, 2).toUpperCase(),
        color:  'bg-indigo-500',
        status: 'pending',
      }]);

      setSendStatus('success');
      setSendMsg(`Invitation sent to ${inviteEmail}!`);
      setInviteName('');
      setInviteEmail('');
      setInviteRole('Viewer');

      setTimeout(() => {
        setShowInvite(false);
        setSendStatus('idle');
      }, 2000);

    } catch (err: any) {
      setSendStatus('error');
      setSendMsg('Failed to send email. Check your EmailJS setup.');
      console.error('EmailJS error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleRoleChange = (id: string, role: string) => {
    setMembers(m => m.map(mem => mem.id === id ? { ...mem, role } : mem));
    setSaved(id);
    setTimeout(() => setSaved(null), 1500);
  };

  const handleDelete = (id: string) => setMembers(m => m.filter(mem => mem.id !== id));
  const getRoleInfo  = (roleId: string) => ROLES.find(r => r.id === roleId) || ROLES[2];

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Invite Team Member</h2>
                <p className="text-xs text-slate-500 mt-0.5">They'll receive a real email invitation</p>
              </div>
              <button onClick={() => { setShowInvite(false); setSendStatus('idle'); }} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
            </div>

            {/* Success / Error */}
            {sendStatus === 'success' && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl mb-4">
                <CheckCircle2 size={20} className="text-green-600 shrink-0" />
                <p className="text-sm font-medium text-green-700">{sendMsg}</p>
              </div>
            )}
            {sendStatus === 'error' && (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                <AlertCircle size={20} className="text-red-500 shrink-0" />
                <p className="text-sm font-medium text-red-600">{sendMsg}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Full Name <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Email Address <span className="text-red-400">*</span></label>
                <input
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="jane@company.com"
                  type="email"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Role selector */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Role</label>
                <div className="space-y-2">
                  {ROLES.map(role => (
                    <button
                      key={role.id}
                      onClick={() => setInviteRole(role.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        inviteRole === role.id ? `${role.border} ${role.bg}` : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className={`mt-0.5 ${role.color}`}>{role.icon}</div>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${inviteRole === role.id ? role.color : 'text-slate-700'}`}>{role.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{role.desc}</p>
                      </div>
                      {inviteRole === role.id && <Check size={16} className={`mt-0.5 ${role.color}`} />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || sending || !emailJSReady}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending Email...</>
                ) : (
                  <><Mail size={16} /> Send Invitation Email</>
                )}
              </button>

              {!emailJSReady && (
                <p className="text-xs text-center text-slate-400">Loading email service...</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Management</h1>
          <p className="text-slate-500 text-sm mt-1">{members.length} members · real email invitations via EmailJS</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Invite Member
        </button>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {ROLES.map(role => (
          <div key={role.id} className={`p-4 rounded-xl border ${role.border} ${role.bg}`}>
            <div className={`flex items-center gap-2 mb-2 ${role.color}`}>
              {role.icon}
              <span className="font-bold text-sm">{role.label}</span>
              <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${role.badge}`}>
                {members.filter(m => m.role === role.id).length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {role.permissions.map(p => (
                <span key={p} className="text-xs px-2 py-0.5 bg-white rounded-full border font-medium opacity-80">{p}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Members List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Users size={18} className="text-slate-500" />
          <span className="font-semibold text-slate-700">Members</span>
        </div>
        <div className="divide-y divide-slate-100">
          {members.map(member => {
            const role = getRoleInfo(member.role);
            return (
              <div key={member.id} className="flex items-center px-6 py-4 hover:bg-slate-50 transition-colors gap-4">
                {/* Avatar */}
                <div className={`w-10 h-10 ${member.color} rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 relative`}>
                  {member.avatar}
                  {member.status === 'pending' && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white" title="Invitation pending" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 truncate">{member.name}</p>
                    {member.status === 'pending' && (
                      <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full font-medium shrink-0">Pending</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                    <Mail size={11} /><span className="truncate">{member.email}</span>
                  </div>
                </div>

                {/* Role toggle */}
                <div className="flex items-center gap-2 shrink-0">
                  {saved === member.id && <Check size={14} className="text-green-500" />}
                  {member.role === 'Owner' ? (
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${role.badge} border ${role.border}`}>
                      {role.icon} Owner
                    </span>
                  ) : (
                    <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-semibold">
                      {ROLES.filter(r => r.id !== 'Owner').map((r, i) => (
                        <button
                          key={r.id}
                          onClick={() => handleRoleChange(member.id, r.id)}
                          className={`px-3 py-1.5 flex items-center gap-1 transition-colors ${
                            i < ROLES.filter(r => r.id !== 'Owner').length - 1 ? 'border-r border-slate-200' : ''
                          } ${member.role === r.id ? `${r.bg} ${r.color}` : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                          {r.icon} {r.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {member.role !== 'Owner' && (
                    <button onClick={() => handleDelete(member.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
