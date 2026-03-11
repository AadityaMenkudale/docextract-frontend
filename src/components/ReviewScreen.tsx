import React, { useState, useEffect } from 'react';
import {
  ChevronRight, RefreshCw, CheckCircle2, ZoomIn, ZoomOut,
  Store, Calendar, CreditCard, Landmark, Edit3, Info,
  ArrowLeft, FileText, Loader2, Save, X, User, MapPin, Badge
} from 'lucide-react';
import { motion } from 'motion/react';
import { Document, ExtractionField } from '../types';
import { getDocument, reExtract, approveDocument, updateFields, getFileUrl, getExportUrl } from '../api';

interface ReviewScreenProps {
  document: Document;
  onBack: () => void;
}

export default function ReviewScreen({ document: initialDoc, onBack }: ReviewScreenProps) {
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rerunning, setRerunning] = useState(false);
  const [approving, setApproving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [zoom, setZoom] = useState(1);

  const fetchDoc = async () => {
    try {
      const data = await getDocument(initialDoc.id);
      setDoc(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoc();
    // Poll while processing
    const interval = setInterval(async () => {
      const data = await getDocument(initialDoc.id).catch(() => null);
      if (data) {
        setDoc(data);
        if (data.status !== 'Processing') clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [initialDoc.id]);

  const handleRerun = async () => {
    setRerunning(true);
    try {
      const res = await reExtract(initialDoc.id);
      setDoc(res.document);
    } catch (e) { console.error(e); }
    finally { setRerunning(false); }
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      await approveDocument(initialDoc.id);
      onBack();
    } catch (e) { console.error(e); }
    finally { setApproving(false); }
  };

  const startEdit = (field: any) => {
    setEditingId(field.id);
    setEditValue(field.value);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await updateFields(initialDoc.id, [{ id: editingId, value: editValue }]);
      setDoc(res.document);
      setEditingId(null);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const fields: any[] = doc?.fields || [];
  const overallConfidence = doc?.extraction?.overall_confidence || 0;
  const isProcessing = doc?.status === 'Processing' || loading;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <div className="w-8 h-8 text-blue-600">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h2 className="text-slate-900 text-lg font-bold leading-tight">AI Document Extractor</h2>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span>Documents</span>
              <ChevronRight size={12} />
              <span className="font-medium text-slate-700">{initialDoc.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={getExportUrl(initialDoc.id, 'csv')}
            download
            className="flex items-center justify-center rounded-lg h-10 px-4 bg-slate-100 text-slate-900 text-sm font-bold hover:bg-slate-200 transition-colors"
          >
            Export CSV
          </a>
          <button
            onClick={handleRerun}
            disabled={rerunning || isProcessing}
            className="flex min-w-[100px] items-center justify-center rounded-lg h-10 px-4 bg-slate-100 text-slate-900 text-sm font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            {rerunning ? <Loader2 size={18} className="mr-2 animate-spin" /> : <RefreshCw size={18} className="mr-2" />}
            Re-run AI
          </button>
          <button
            onClick={handleApprove}
            disabled={approving || isProcessing}
            className="flex min-w-[100px] items-center justify-center rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            {approving ? <Loader2 size={18} className="mr-2 animate-spin" /> : <CheckCircle2 size={18} className="mr-2" />}
            Approve
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Left: File Preview */}
        <div className="w-1/2 border-r border-slate-200 bg-slate-50 p-6 flex flex-col items-center overflow-y-auto">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="p-2 bg-white rounded shadow text-slate-700 hover:bg-slate-100">
              <ZoomIn size={18} />
            </button>
            <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-2 bg-white rounded shadow text-slate-700 hover:bg-slate-100">
              <ZoomOut size={18} />
            </button>
            <span className="p-2 bg-white rounded shadow text-slate-500 text-sm">{Math.round(zoom * 100)}%</span>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white shadow-2xl rounded-lg overflow-hidden border border-slate-200"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', width: '100%' }}
          >
            {initialDoc.name.match(/\.(jpg|jpeg|png)$/i) ? (
              <img
                src={getFileUrl(initialDoc.id)}
                alt="Document Preview"
                className="w-full h-auto"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/doc/800/1100'; }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-96 p-12 text-slate-400">
                <FileText size={64} className="mb-4 opacity-30" />
                <p className="font-medium text-lg">{initialDoc.name}</p>
                <p className="text-sm mt-2">PDF / DOCX Preview</p>
                <a
                  href={getFileUrl(initialDoc.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
                >
                  Open File
                </a>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right: Extracted Fields */}
        <div className="w-1/2 bg-white overflow-y-auto">
          <div className="p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Extracted Data</h2>
                <p className="text-slate-500 text-sm mt-1">Review and confirm the AI-extracted fields.</p>
              </div>
              {overallConfidence > 0 && (
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Confidence</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${overallConfidence >= 90 ? 'text-emerald-500' : overallConfidence >= 70 ? 'text-amber-500' : 'text-red-500'}`}>
                      {overallConfidence}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 size={40} className="animate-spin mb-4 text-blue-500" />
                <p className="font-medium text-lg text-slate-600">AI is extracting data...</p>
                <p className="text-sm mt-1">This usually takes a few seconds</p>
              </div>
            ) : fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <FileText size={40} className="mb-4 opacity-30" />
                <p className="font-medium">No fields extracted yet.</p>
                <button onClick={handleRerun} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">
                  Run Extraction
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field: any) => (
                  <div
                    key={field.id}
                    className={`group border rounded-xl p-4 transition-all hover:shadow-md ${field.manual_check ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 bg-slate-50/30 hover:border-blue-300'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg shrink-0 ${field.manual_check ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                          <FieldIcon icon={field.icon} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className={`text-xs font-semibold uppercase ${field.manual_check ? 'text-amber-600' : 'text-slate-500'}`}>
                            {field.label}
                          </label>
                          {editingId === field.id ? (
                            <div className="flex items-center gap-2 mt-1">
                              <input
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1 border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null); }}
                              />
                              <button onClick={saveEdit} disabled={saving} className="p-1 text-green-600 hover:bg-green-50 rounded">
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded">
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <p className="text-lg font-medium text-slate-900 truncate">{field.value || <span className="text-slate-400 italic text-sm">Not found</span>}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-3 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${field.manual_check ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {field.manual_check ? `⚠ Check (${field.confidence}%)` : `${field.confidence}% ✓`}
                        </span>
                        {editingId !== field.id && (
                          <button onClick={() => startEdit(field)} className="text-slate-400 hover:text-blue-600 transition-colors">
                            <Edit3 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {doc?.ai_insight && (
              <div className="mt-8 p-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">AI Insight</h3>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
                  <Info className="text-blue-600 shrink-0" size={20} />
                  <p className="text-sm text-slate-600 leading-relaxed">{doc.ai_insight}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function FieldIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'storefront': return <Store size={20} />;
    case 'calendar_today': return <Calendar size={20} />;
    case 'payments': return <CreditCard size={20} />;
    case 'account_balance': return <Landmark size={20} />;
    case 'person': return <User size={20} />;
    case 'location_on': return <MapPin size={20} />;
    case 'badge': return <Badge size={20} />;
    default: return <FileText size={20} />;
  }
}
