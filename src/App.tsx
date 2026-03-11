import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DocumentList from './components/DocumentList';
import ReviewScreen from './components/ReviewScreen';
import Reports from './components/Reports';
import Team from './components/Team';
import SettingsPage from './components/SettingsPage';
import { Document } from './types';
import { motion, AnimatePresence } from 'motion/react';

export interface UserProfile {
  name: string;
  role: string;
  avatar: string | null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Alex Rivera',
    role: 'Administrator',
    avatar: null,
  });

  const handleReviewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setActiveTab('review');
  };

  const handleBackFromReview = () => {
    setSelectedDocument(null);
    setActiveTab('dashboard');
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Upload & Processing';
      case 'documents': return 'Document Management';
      case 'reports':   return 'Analytics Reports';
      case 'team':      return 'Team Management';
      case 'settings':  return 'Settings';
      default: return 'DocExtract AI';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {activeTab !== 'review' && (
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} setProfile={setProfile} />
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab !== 'review' && (
          <Header title={getTitle()} profile={profile} setProfile={setProfile} />
        )}

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                <Dashboard onReviewDocument={handleReviewDocument} />
              </motion.div>
            )}
            {activeTab === 'documents' && (
              <motion.div key="documents" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                <DocumentList />
              </motion.div>
            )}
            {activeTab === 'review' && selectedDocument && (
              <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="h-full">
                <ReviewScreen document={selectedDocument} onBack={handleBackFromReview} />
              </motion.div>
            )}
            {activeTab === 'reports' && (
              <motion.div key="reports" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                <Reports />
              </motion.div>
            )}
            {activeTab === 'team' && (
              <motion.div key="team" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                <Team />
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                <SettingsPage />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
