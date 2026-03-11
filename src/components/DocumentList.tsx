import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, MoreHorizontal, Search, Filter, Download,
  Trash2, RefreshCw, TrendingUp, CheckCircle, Clock,
  ChevronLeft, ChevronRight, FileCode, FileImage, Loader2
} from 'lucide-react';
import { Document } from '../types';
import { StatusBadge } from './Dashboard';
import { listDocuments, deleteDocument, getStats, getExportUrl } from '../api';

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState({ total_processed: 0, avg_confidence: 0, review_required: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const PER_PAGE = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [docsRes, statsRes] = await Promise.all([
        listDocuments({ page, per_page: PER_PAGE, status: statusFilter || undefined, type: typeFilter || undefined, search: search || undefined }),
        getStats(),
      ]);
      setDocuments(docsRes.documents);
      setTotalPages(docsRes.total_pages);
      setTotal(docsRes.total);
      setStats(statsRes);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    await deleteDocument(id).catch(console.error);
    fetchData();
  };

  return (
    <div className="p-8 lg:p-10 flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Document Management</h1>
          <p className="text-slate-500 text-sm mt-1">Review, filter, and export extracted data.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Processed" value={String(stats.total_processed)} trend="" trendIcon={<TrendingUp size={14} />} />
        <SummaryCard label="AI Accuracy" value={`${stats.avg_confidence}%`} trend="" trendIcon={<CheckCircle size={14} />} />
        <SummaryCard label="Pending Review" value={String(stats.review_required)} trend="" isWarning />
        <SummaryCard label="Current Page" value={`${page} / ${totalPages}`} trend="" trendIcon={<Clock size={14} />} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="Invoice">Invoice</option>
              <option value="Contract">Contract</option>
              <option value="Receipt">Receipt</option>
              <option value="Identity">Identity</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="Success">Success</option>
              <option value="Processing">Processing</option>
              <option value="Review Required">Review Required</option>
              <option value="Error">Error</option>
            </select>
          </div>
          <button onClick={fetchData} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 size={24} className="animate-spin mr-2" /> Loading...
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <FileText size={40} className="mb-3 opacity-40" />
              <p className="font-medium">No documents found</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-4 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">Document</th>
                  <th className="p-4 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="p-4 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="p-4 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">Confidence</th>
                  <th className="p-4 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded flex items-center justify-center ${doc.name.endsWith('.pdf') ? 'bg-red-50 text-red-600' : doc.name.endsWith('.docx') ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                          {doc.name.endsWith('.pdf') ? <FileText size={16} /> : doc.name.endsWith('.docx') ? <FileCode size={16} /> : <FileImage size={16} />}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{doc.name}</span>
                      </div>
                    </td>
                    <td className="p-4"><span className="text-sm text-slate-600">{doc.type}</span></td>
                    <td className="p-4"><span className="text-sm text-slate-600">{doc.date}</span></td>
                    <td className="p-4">
                      {doc.confidence > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-1.5 rounded-full ${doc.confidence > 90 ? 'bg-green-500' : doc.confidence > 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${doc.confidence}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-500">{doc.confidence}%</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4"><StatusBadge status={doc.status} /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <a href={getExportUrl(doc.id, 'csv')} download title="Export CSV" className="text-slate-400 hover:text-blue-600 transition-colors">
                          <Download size={16} />
                        </a>
                        <button onClick={() => handleDelete(doc.id)} title="Delete" className="text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500">Showing {documents.length} of {total} documents</span>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30">
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded text-sm font-medium ${page === p ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {p}
              </button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, trend, trendIcon, isWarning }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <h3 className="text-2xl font-bold text-slate-900 leading-none">{value}</h3>
        {trend && (
          <span className={`${isWarning ? 'text-amber-500' : 'text-green-500'} text-xs font-bold mb-0.5 flex items-center gap-0.5`}>
            {trendIcon} {trend}
          </span>
        )}
      </div>
    </div>
  );
}
