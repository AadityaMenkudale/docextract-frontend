import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, CheckCircle2, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { getStats } from '../api';

export default function Reports() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats().then(s => { setStats(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <Loader2 size={28} className="animate-spin mr-2" /> Loading reports...
    </div>
  );

  const byType = stats?.by_type || {};
  const total = stats?.total_processed || 0;

  const typeColors: Record<string, string> = {
    Invoice: 'bg-blue-500',
    Contract: 'bg-green-500',
    Receipt: 'bg-orange-500',
    Identity: 'bg-purple-500',
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Analytics Reports</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your document extraction performance.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Processed" value={total} icon={<FileText size={20} className="text-blue-600" />} bg="bg-blue-50" />
        <StatCard label="Success Rate" value={`${stats?.success_rate ?? 0}%`} icon={<TrendingUp size={20} className="text-green-600" />} bg="bg-green-50" />
        <StatCard label="Avg Confidence" value={`${stats?.avg_confidence ?? 0}%`} icon={<CheckCircle2 size={20} className="text-purple-600" />} bg="bg-purple-50" />
        <StatCard label="Needs Review" value={stats?.review_required ?? 0} icon={<AlertCircle size={20} className="text-amber-600" />} bg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Status Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: 'Success', value: stats?.success ?? 0, color: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Review Required', value: stats?.review_required ?? 0, color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
              { label: 'Processing', value: stats?.processing ?? 0, color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },
              { label: 'Failed / Error', value: stats?.failed ?? 0, color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.bg} ${item.text}`}>{item.value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all`}
                    style={{ width: total > 0 ? `${(item.value / total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document Types */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Document Types</h3>
          {Object.keys(byType).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <BarChart3 size={36} className="mb-2 opacity-30" />
              <p className="text-sm">No data yet — upload documents to see stats</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(byType).map(([type, count]: any) => (
                <div key={type}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-700">{type}</span>
                    <span className="text-xs font-bold text-slate-500">{count} docs</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${typeColors[type] || 'bg-slate-400'} rounded-full`}
                      style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confidence Score */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Confidence Score</h3>
          <p className="text-slate-500 text-sm mb-6">Average AI extraction confidence across all documents.</p>
          <div className="flex items-center gap-6">
            <div className="relative w-36 h-36 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={stats?.avg_confidence >= 90 ? '#22c55e' : stats?.avg_confidence >= 70 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="3"
                  strokeDasharray={`${stats?.avg_confidence ?? 0}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">{stats?.avg_confidence ?? 0}%</span>
                <span className="text-xs text-slate-500">Avg</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {[
                { label: 'High Confidence (90%+)', pct: total > 0 ? Math.round((stats?.success ?? 0) / total * 100) : 0, color: 'bg-green-500' },
                { label: 'Medium Confidence (70-90%)', pct: total > 0 ? Math.round((stats?.review_required ?? 0) / total * 100) : 0, color: 'bg-amber-500' },
                { label: 'Low Confidence (<70%)', pct: total > 0 ? Math.round((stats?.failed ?? 0) / total * 100) : 0, color: 'bg-red-500' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-bold text-slate-700">{item.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${bg} rounded-lg flex items-center justify-center`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
