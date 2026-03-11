import React, { useRef, useState } from 'react';
import { Bell, Search, Pencil, Check, X, Camera } from 'lucide-react';
import { UserProfile } from '../App';

interface HeaderProps {
  title: string;
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
}

export default function Header({ title, profile, setProfile }: HeaderProps) {
  const [editing, setEditing]   = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editRole, setEditRole] = useState(profile.role);
  const fileRef                 = useRef<HTMLInputElement>(null);

  const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSave = () => {
    setProfile({ ...profile, name: editName.trim() || profile.name, role: editRole.trim() || profile.role });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditName(profile.name);
    setEditRole(profile.role);
    setEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile({ ...profile, avatar: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search documents..."
            className="pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>

        {/* Bell */}
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200" />

        {/* Profile */}
        {!editing ? (
          <div className="flex items-center gap-3 group">
            {/* Name + Role */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{profile.name}</p>
              <p className="text-xs text-slate-500">{profile.role}</p>
            </div>

            {/* Avatar with hover actions */}
            <div className="relative">
              <div
                onClick={() => fileRef.current?.click()}
                className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer overflow-hidden border-2 border-transparent hover:border-blue-400 transition-all"
              >
                {profile.avatar
                  ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : initials
                }
              </div>
              {/* Camera overlay */}
              <div
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera size={13} className="text-white" />
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Edit pencil */}
            <button
              onClick={() => { setEditName(profile.name); setEditRole(profile.role); setEditing(true); }}
              className="p-1.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit profile"
            >
              <Pencil size={14} />
            </button>
          </div>
        ) : (
          /* Edit mode */
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <input
                autoFocus
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Name"
                className="text-sm px-2.5 py-1 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
              />
              <input
                value={editRole}
                onChange={e => setEditRole(e.target.value)}
                placeholder="Role"
                className="text-xs px-2.5 py-1 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-36 text-slate-500"
              />
            </div>
            <button onClick={handleSave} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><Check size={15} /></button>
            <button onClick={handleCancel} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"><X size={15} /></button>
          </div>
        )}
      </div>
    </header>
  );
}
