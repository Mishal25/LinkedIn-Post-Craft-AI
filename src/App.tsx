import React, { useState, useEffect } from 'react';
import { ActiveTab, DraftPost } from './types';
import { INITIAL_DRAFTS } from './sampleData';
import { Header } from './components/Header';
import { ApiConfigModal } from './components/ApiConfigModal';
import { GeneratorView } from './views/GeneratorView';
import { HookLibraryView } from './views/HookLibraryView';
import { SavedDraftsView } from './views/SavedDraftsView';
import { AnalyticsView } from './views/AnalyticsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('generator');
  const [drafts, setDrafts] = useState<DraftPost[]>(() => {
    try {
      const saved = localStorage.getItem('linkedin_drafts_vault');
      return saved ? JSON.parse(saved) : INITIAL_DRAFTS;
    } catch {
      return INITIAL_DRAFTS;
    }
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('theme_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Gemini AI Engine Config
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [temperature, setTemperature] = useState<number>(0.7);
  const selectedModel = 'Gemini 3.8 Flash';

  // Shared editor text and image when transitioning from other views
  const [activeEditorText, setActiveEditorText] = useState<string>('');
  const [activeEditorImage, setActiveEditorImage] = useState<string>('');
  const [activeEditorImageCaption, setActiveEditorImageCaption] = useState<string>('');

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  // Sync drafts to local storage
  useEffect(() => {
    try {
      localStorage.setItem('linkedin_drafts_vault', JSON.stringify(drafts));
    } catch (e) {
      console.error(e);
    }
  }, [drafts]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme_dark_mode', darkMode ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
  }, [darkMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 2800);
  };

  const handleSavePreferences = (temp: number) => {
    setTemperature(temp);
    showToast('Gemini AI engine parameters updated!');
  };

  const handleSaveDraft = (newDraft: DraftPost) => {
    setDrafts(prev => [newDraft, ...prev]);
  };

  const handleDuplicateDraft = (draft: DraftPost) => {
    const clone: DraftPost = {
      ...draft,
      id: `draft-${Date.now()}`,
      title: `${draft.title} (Copy)`,
      status: 'Draft',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    setDrafts(prev => [clone, ...prev]);
    showToast('Draft duplicated successfully!');
  };

  const handleDeleteDraft = (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
  };

  const handleClearAllDrafts = () => {
    if (window.confirm('Are you sure you want to clear your local post history cache?')) {
      setDrafts([]);
      showToast('All drafts cleared');
    }
  };

  const handleOpenDraftInEditor = (draft: DraftPost) => {
    setActiveEditorText(draft.fullContent);
    setActiveEditorImage(draft.imageUrl || '');
    setActiveEditorImageCaption(draft.imageCaption || '');
    setActiveTab('generator');
    showToast(`Loaded "${draft.title.slice(0, 30)}..." into Studio!`);
  };

  const handleLoadHookInEditor = (hookText: string) => {
    setActiveEditorText(hookText);
    setActiveTab('generator');
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col transition-colors duration-200">
      {/* Universal Navigation Header */}
      <Header 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        draftsCount={drafts.length}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenApiConfig={() => setApiModalOpen(true)}
        selectedModel={selectedModel}
      />

      {/* Main Page Body */}
      <main className="w-full pt-16 flex-1 bg-surface">
        {activeTab === 'generator' && (
          <GeneratorView 
            onSaveToDrafts={handleSaveDraft}
            onExploreHooks={() => setActiveTab('hook-library')}
            onOpenApiConfig={() => setApiModalOpen(true)}
            showToast={showToast}
            temperature={temperature}
            selectedModel={selectedModel}
            initialPostText={activeEditorText}
            initialImageUrl={activeEditorImage}
            initialImageCaption={activeEditorImageCaption}
          />
        )}

        {activeTab === 'hook-library' && (
          <HookLibraryView 
            onLoadHookInEditor={handleLoadHookInEditor}
            showToast={showToast}
          />
        )}

        {activeTab === 'saved-drafts' && (
          <SavedDraftsView 
            drafts={drafts}
            onOpenDraftInEditor={handleOpenDraftInEditor}
            onCreateNewDraft={() => {
              setActiveEditorText('');
              setActiveEditorImage('');
              setActiveEditorImageCaption('');
              setActiveTab('generator');
            }}
            onDuplicateDraft={handleDuplicateDraft}
            onDeleteDraft={handleDeleteDraft}
            onClearAllDrafts={handleClearAllDrafts}
            showToast={showToast}
          />
        )}

        {activeTab === 'analytics-insights' && (
          <AnalyticsView 
            showToast={showToast}
            onSendToEditor={handleLoadHookInEditor}
          />
        )}
      </main>

      {/* Floating Universal Toast Notification */}
      <div 
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-2xl shadow-2xl transition-all duration-300 pointer-events-none border border-inverse-surface/20 ${
          toastVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-95'
        }`}
      >
        <span className="material-symbols-outlined text-tertiary-fixed text-[22px]">check_circle</span>
        <span className="font-label-md text-label-md font-semibold">{toastMessage}</span>
      </div>

      {/* Gemini AI Engine Modal */}
      <ApiConfigModal 
        isOpen={apiModalOpen}
        onClose={() => setApiModalOpen(false)}
        temperature={temperature}
        onSavePreferences={handleSavePreferences}
      />
    </div>
  );
}
