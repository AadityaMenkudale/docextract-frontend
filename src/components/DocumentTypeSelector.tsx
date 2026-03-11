import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Upload, ChevronRight, Search,
  FileText, Receipt, FileSignature, User, Heart, Building2,
  GraduationCap, ShieldCheck, Truck, Scale, Banknote,
  ClipboardList, CreditCard, Briefcase, Zap
} from 'lucide-react';

export interface DocTypeOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  fields: string[];
}

export const DOC_TYPES: DocTypeOption[] = [
  { id: 'Invoice', label: 'Invoice / Bill', description: 'Vendor invoices, bills, purchase invoices', icon: <FileText size={22} />, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', fields: ['Vendor Name', 'Invoice Number', 'Date', 'Due Date', 'Total Amount', 'Tax', 'Line Items'] },
  { id: 'Receipt', label: 'Receipt', description: 'Purchase receipts, expense receipts', icon: <Receipt size={22} />, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', fields: ['Merchant', 'Date', 'Items', 'Subtotal', 'Tax', 'Total', 'Payment Method'] },
  { id: 'Contract', label: 'Contract / Agreement', description: 'Legal contracts, NDAs, service agreements', icon: <FileSignature size={22} />, color: 'text-green-600', bg: 'bg-green-50 border-green-200', fields: ['Parties', 'Effective Date', 'Expiry Date', 'Contract Value', 'Key Terms', 'Governing Law'] },
  { id: 'Identity', label: 'Identity Document', description: 'Passport, Aadhaar, PAN, driving license', icon: <User size={22} />, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', fields: ['Full Name', 'Date of Birth', 'ID Number', 'Issue Date', 'Expiry Date', 'Nationality'] },
  { id: 'Resume', label: 'Resume / CV', description: 'Job applications, curriculum vitae', icon: <Briefcase size={22} />, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200', fields: ['Name', 'Email', 'Phone', 'Skills', 'Experience', 'Education', 'Certifications'] },
  { id: 'Medical Report', label: 'Medical Report', description: 'Lab reports, prescriptions, discharge summaries', icon: <Heart size={22} />, color: 'text-red-600', bg: 'bg-red-50 border-red-200', fields: ['Patient Name', 'Doctor', 'Diagnosis', 'Medications', 'Test Results', 'Date'] },
  { id: 'Bank Statement', label: 'Bank Statement', description: 'Account statements, transaction history', icon: <Building2 size={22} />, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200', fields: ['Account Number', 'Account Holder', 'Bank Name', 'Period', 'Opening Balance', 'Closing Balance', 'Transactions'] },
  { id: 'Academic Certificate', label: 'Certificate / Degree', description: 'Degrees, diplomas, training certificates', icon: <GraduationCap size={22} />, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', fields: ['Name', 'Course / Degree', 'Institution', 'Date of Issue', 'Grade / Score', 'Certificate Number'] },
  { id: 'Insurance Policy', label: 'Insurance Policy', description: 'Health, vehicle, life insurance documents', icon: <ShieldCheck size={22} />, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200', fields: ['Policy Number', 'Insured Name', 'Coverage Type', 'Premium', 'Start Date', 'Expiry Date', 'Sum Insured'] },
  { id: 'Payslip', label: 'Payslip / Salary Slip', description: 'Monthly salary, pay stub documents', icon: <Banknote size={22} />, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', fields: ['Employee Name', 'Employee ID', 'Designation', 'Basic Salary', 'Allowances', 'Deductions', 'Net Pay'] },
  { id: 'Purchase Order', label: 'Purchase Order', description: 'PO documents, procurement orders', icon: <ClipboardList size={22} />, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200', fields: ['PO Number', 'Supplier', 'Items', 'Quantity', 'Unit Price', 'Total Amount', 'Delivery Date'] },
  { id: 'Tax Document', label: 'Tax Document', description: 'ITR, Form 16, GST returns, tax invoices', icon: <CreditCard size={22} />, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', fields: ['Taxpayer Name', 'PAN / Tax ID', 'Assessment Year', 'Total Income', 'Tax Paid', 'Deductions', 'Refund'] },
  { id: 'Legal Document', label: 'Legal Document', description: 'Court orders, affidavits, legal notices', icon: <Scale size={22} />, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', fields: ['Case Number', 'Parties', 'Court / Authority', 'Date', 'Judgment / Order', 'Advocate'] },
  { id: 'Delivery Note', label: 'Delivery Note / Waybill', description: 'Shipping documents, delivery challan', icon: <Truck size={22} />, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', fields: ['Tracking Number', 'Sender', 'Receiver', 'Items', 'Weight', 'Delivery Date', 'Status'] },
  { id: 'Auto Detect', label: 'Auto Detect', description: 'Let AI identify and extract automatically', icon: <Zap size={22} />, color: 'text-pink-600', bg: 'bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200', fields: ['AI will detect all fields automatically'] },
];

interface Props {
  file: File;
  onConfirm: (file: File, docType: DocTypeOption) => void;
  onCancel: () => void;
}

export default function DocumentTypeSelector({ file, onConfirm, onCancel }: Props) {
  const [selected, setSelected] = useState<DocTypeOption | null>(null);
  const [search, setSearch] = useState('');

  const filtered = DOC_TYPES.filter(t =>
    t.label.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Select Document Type</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Uploading: <span className="font-semibold text-slate-700">"{file.name}"</span>
            </p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search document types..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map(type => (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(type)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                  selected?.id === type.id
                    ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                    : `border ${type.bg} hover:shadow-sm`
                }`}
              >
                {selected?.id === type.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className={`mb-2 ${selected?.id === type.id ? 'text-blue-600' : type.color}`}>{type.icon}</div>
                <p className={`font-semibold text-sm ${selected?.id === type.id ? 'text-blue-700' : 'text-slate-800'}`}>{type.label}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{type.description}</p>
              </motion.button>
            ))}
          </div>

          {/* Fields Preview */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl"
              >
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Fields that will be extracted:</p>
                <div className="flex flex-wrap gap-2">
                  {selected.fields.map(f => (
                    <span key={f} className="px-2 py-1 bg-white border border-blue-200 rounded-full text-xs text-blue-700 font-medium">{f}</span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button onClick={onCancel} className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm">Cancel</button>
          <button
            onClick={() => selected && onConfirm(file, selected)}
            disabled={!selected}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
          >
            <Upload size={16} />
            Extract with AI
            <ChevronRight size={16} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
