import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FileText, CheckCircle2, Zap, CloudUpload, Upload,
  AlertCircle, Loader2, Trash2, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Document } from '../types';
import { uploadDocument, listDocuments, getStats, deleteDocument } from '../api';
import DocumentTypeSelector, { DocTypeOption } from './DocumentTypeSelector';

interface DashboardProps {
  onReviewDocument: (doc: Document) => void;
}

export default function Dashboard({ onReviewDocument }: DashboardProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState({ total_processed: 0, success_rate: 0, avg_confidence: 0 });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [docsRes, statsRes] = await Promise.all([
        listDocuments({ per_page: 10, search: search || undefined }),
        getStats(),
      ]);
      setDocuments(docsRes.documents);
      setStats(statsRes);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setPendingFile(files[0]);
    setShowSelector(true);
  };

  const handleConfirmUpload = async (file: File, docType: DocTypeOption) => {
    setShowSelector(false);
    setPendingFile(null);
    setUploading(true);
    setUploadError('');
    try {
      await uploadDocument(file, docType.id, docType.fields);
      await fetchData();
    } catch (e: any) {
      setUploadError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try { await deleteDocument(id); await fetchData(); }
    catch (e) { console.error(e); }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <AnimatePresence>
        {showSelector && pendingFile && (
          <DocumentTypeSelector
            file={pendingFile}
            onConfirm={handleConfirmUpload}
            onCancel={() => { setShowSelector(false); setPendingFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
          />
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={<FileText className="text-blue-600" />} label="Total Processed" value={String(stats.total_processed)} bgColor="bg-blue-50" />
        <StatCard icon={<CheckCircle2 className="text-green-600" />} label="Success Rate" value={`${stats.success_rate}%`} bgColor="bg-green-50" />
        <StatCard icon={<Zap className="text-purple-600" />} label="Avg Confidence" value={`${stats.avg_confidence}%`} bgColor="bg-purple-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl border-2 border-dashed p-12 text-center mb-10 transition-all cursor-pointer ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-blue-200 hover:border-blue-500'}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx,.txt" onChange={(e) => handleFiles(e.target.files)} />
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-transform ${uploading ? 'bg-blue-100 text-blue-400' : 'bg-blue-50 text-blue-600 hover:scale-110'}`}>
            {uploading ? <Loader2 size={32} className="animate-spin" /> : <CloudUpload size={32} />}
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {uploading ? 'Uploading & Extracting...' : 'Upload your document'}
          </h3>
          <p className="text-slate-500 mb-4 leading-relaxed">
            Upload any document — you'll select the type and AI will extract the right fields.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6 opacity-60">
            {['Invoice', 'Resume', 'Medical', 'Bank Statement', 'Contract', 'Payslip', '+ 9 more'].map(t => (
              <span key={t} className="px-2 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">{t}</span>
            ))}
          </div>
          {uploadError && <p className="text-red-500 text-sm mb-4 font-medium">{uploadError}</p>}
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            disabled={uploading}
          >
            <Upload size={18} />
            {uploading ? 'Processing...' : 'Choose File'}
          </button>
          <p className="text-xs text-slate-400 mt-4">PDF, JPG, PNG, DOCX, TXT up to 10MB</p>
        </div>
      </motion.div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400"><Loader2 size={24} className="animate-spin mr-2" /> Loading...</div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <FileText size={40} className="mb-3 opacity-40" />
              <p className="font-medium">No documents yet. Upload one above!</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  {['Document', 'Type', 'Status', 'Confidence', 'Date', 'Action'].map(h => (
                    <th key={h} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => onReviewDocument(doc)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-blue-50 text-blue-600"><FileText size={18} /></div>
                        <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-48">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-full">{doc.type}</span></td>
                    <td className="px-6 py-4"><StatusBadge status={doc.status} /></td>
                    <td className="px-6 py-4">
                      {doc.confidence > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-1.5 rounded-full ${doc.confidence > 90 ? 'bg-green-500' : doc.confidence > 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${doc.confidence}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-500">{doc.confidence}%</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{doc.date}</td>
                    <td className="px-6 py-4">
                      <button className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50" onClick={(e) => handleDelete(e, doc.id)} title="Delete"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bgColor }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'Processing': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100"><Loader2 size={12} className="animate-spin" />Processing</span>;
    case 'Success': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100"><CheckCircle2 size={12} />Success</span>;
    case 'Error': case 'Failed': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100"><AlertCircle size={12} />{status}</span>;
    case 'Review Required': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100"><AlertCircle size={12} />Review Required</span>;
    default: return null;
  }
}
