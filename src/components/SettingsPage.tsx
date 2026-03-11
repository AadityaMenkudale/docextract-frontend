import React, { useState } from 'react';
import { Settings, Key, Bell, Globe, Shield, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:5000');
  const [notifications, setNotifications] = useState({ email: true, browser: false, weekly: true });
  const [autoApprove, setAutoApprove] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [language, setLanguage] = useState('en');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure your DocExtract AI preferences.</p>
      </div>

      <div className="space-y-6">

        {/* API Configuration */}
        <Section icon={<Key size={18} className="text-blue-600" />} title="API Configuration">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Backend API URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={e => setApiUrl(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">The URL of your Flask backend server.</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">AI Model</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>llama-3.3-70b-versatile (Text)</option>
              <option>meta-llama/llama-4-scout (Vision)</option>
            </select>
          </div>
        </Section>

        {/* Extraction Settings */}
        <Section icon={<Shield size={18} className="text-purple-600" />} title="Extraction Settings">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">
              Confidence Threshold for Review Flag: <span className="text-blue-600">{confidenceThreshold}%</span>
            </label>
            <input
              type="range" min={50} max={99} value={confidenceThreshold}
              onChange={e => setConfidenceThreshold(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>50% (lenient)</span>
              <span>99% (strict)</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Documents below this confidence will be flagged for review.</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="font-semibold text-slate-800 text-sm">Auto-Approve High Confidence</p>
              <p className="text-xs text-slate-500 mt-0.5">Automatically approve documents above the threshold.</p>
            </div>
            <button
              onClick={() => setAutoApprove(!autoApprove)}
              className={`w-12 h-6 rounded-full transition-colors relative ${autoApprove ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${autoApprove ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
        </Section>

        {/* Notifications */}
        <Section icon={<Bell size={18} className="text-amber-500" />} title="Notifications">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Get notified when extraction completes' },
            { key: 'browser', label: 'Browser Notifications', desc: 'Desktop push notifications' },
            { key: 'weekly', label: 'Weekly Summary', desc: 'Weekly report of processed documents' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="font-semibold text-slate-800 text-sm">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key as keyof typeof n] }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications[item.key as keyof typeof notifications] ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notifications[item.key as keyof typeof notifications] ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </Section>

        {/* Language */}
        <Section icon={<Globe size={18} className="text-green-600" />} title="Language & Region">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1 block">Interface Language</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </Section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            {saved ? <><CheckCircle2 size={18} /> Saved!</> : <><Save size={18} /> Save Settings</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
        {icon}
        <h2 className="font-bold text-slate-900">{title}</h2>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}
