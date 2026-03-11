import React, { useRef } from 'react';
import { LayoutDashboard, FolderOpen, BarChart3, Users, Settings, Camera } from 'lucide-react';
import { UserProfile } from '../App';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
}

export default function Sidebar({ activeTab, setActiveTab, profile, setProfile }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard',    icon: LayoutDashboard },
    { id: 'documents', label: 'My Documents', icon: FolderOpen },
    { id: 'reports',   label: 'Reports',      icon: BarChart3 },
    { id: 'team',      label: 'Team',         icon: Users },
  ];

  const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const fileRef  = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile({ ...profile, avatar: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <FolderOpen size={24} />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 leading-tight">DocExtract</span>
          <span className="text-xs text-slate-500 font-medium">Enterprise v2.0</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${
              activeTab === item.id
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-slate-200 space-y-3">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${
            activeTab === 'settings'
              ? 'bg-blue-50 text-blue-600 font-semibold'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>

        {/* Profile — read-only mirror, click avatar to change photo */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center gap-3">
          <div className="relative group shrink-0">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer overflow-hidden"
            >
              {profile.avatar
                ? <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                : initials
              }
            </div>
            <div
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera size={12} className="text-white" />
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm truncate">{profile.name}</p>
            <p className="text-xs text-slate-500 truncate">{profile.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
