import React, { useState } from 'react';
import { DraftPost, PostStatus } from '../types';

interface SavedDraftsViewProps {
  drafts: DraftPost[];
  onOpenDraftInEditor: (draft: DraftPost) => void;
  onCreateNewDraft: () => void;
  onDuplicateDraft: (draft: DraftPost) => void;
  onDeleteDraft: (id: string) => void;
  onClearAllDrafts: () => void;
  showToast: (msg: string) => void;
}

export const SavedDraftsView: React.FC<SavedDraftsViewProps> = ({
  drafts,
  onOpenDraftInEditor,
  onCreateNewDraft,
  onDuplicateDraft,
  onDeleteDraft,
  onClearAllDrafts,
  showToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedTone, setSelectedTone] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState<string>('newest');
  const [filterMediaOnly, setFilterMediaOnly] = useState<boolean>(false);
  const [isListView, setIsListView] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Drawer state
  const [inspectingDraft, setInspectingDraft] = useState<DraftPost | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Delete modal state
  const [draftToDelete, setDraftToDelete] = useState<DraftPost | null>(null);

  // Filter & Sort
  const filteredDrafts = drafts.filter(draft => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      draft.title.toLowerCase().includes(q) ||
      draft.hook.toLowerCase().includes(q) ||
      draft.targetAudience.toLowerCase().includes(q) ||
      draft.tags.some(t => t.toLowerCase().includes(q));

    const matchesStatus = selectedStatus === 'All' || draft.status === selectedStatus;
    const matchesTone = selectedTone === 'All' || draft.tone === selectedTone;
    const matchesMedia = !filterMediaOnly || Boolean(draft.imageUrl);

    return matchesSearch && matchesStatus && matchesTone && matchesMedia;
  }).sort((a, b) => {
    if (selectedSort === 'longest') return b.charCount - a.charCount;
    if (selectedSort === 'shortest') return a.charCount - b.charCount;
    if (selectedSort === 'oldest') return a.id.localeCompare(b.id);
    return b.id.localeCompare(a.id);
  });

  // Export handlers
  const handleExport = (format: 'json' | 'md' | 'csv') => {
    setExportDropdownOpen(false);
    if (format === 'json') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(drafts, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "linkedin_craft_vault.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(`Exported ${drafts.length} posts as JSON`);
    } else if (format === 'md') {
      const mdContent = drafts.map(d => `# ${d.title}\n\n**Status:** ${d.status} | **Tone:** ${d.tone} | **Audience:** ${d.targetAudience}\n\n${d.fullContent}\n\n---\n`).join('\n');
      const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(mdContent);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "linkedin_vault_posts.md");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Exported Markdown thought leadership bundle');
    } else {
      const csvRows = [
        ['Title', 'Status', 'Tone', 'Audience', 'Characters', 'Content'],
        ...drafts.map(d => [
          `"${d.title.replace(/"/g, '""')}"`,
          `"${d.status}"`,
          `"${d.tone}"`,
          `"${d.targetAudience}"`,
          d.charCount,
          `"${d.fullContent.replace(/"/g, '""')}"`
        ])
      ];
      const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.map(e => e.join(",")).join("\n"));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", csvContent);
      downloadAnchor.setAttribute("download", "linkedin_buffer_import.csv");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Exported LinkedIn Buffer CSV spreadsheet');
    }
  };

  const handleOpenInspector = (draft: DraftPost) => {
    setInspectingDraft(draft);
    setDrawerOpen(true);
  };

  const handleCloseInspector = () => {
    setDrawerOpen(false);
    setTimeout(() => setInspectingDraft(null), 300);
  };

  const handleConfirmDelete = () => {
    if (draftToDelete) {
      onDeleteDraft(draftToDelete.id);
      setDraftToDelete(null);
      showToast('Draft removed from Content Vault');
    }
  };

  const scheduledCount = drafts.filter(d => d.status === 'Scheduled').length;
  const avgWordCount = drafts.length 
    ? Math.round(drafts.reduce((acc, d) => acc + d.wordCount, 0) / drafts.length)
    : 280;

  const AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEP-V4lPtecRvw7aGbCoySxt-nCqQJPveJQ2Z1909faTe85M422UkC1_Opjbrl9cq-NuHva-a9S1ODqbX0-lNIRjno4aTR0ersgIrajKdfzOTYMSwDYQYapa1HR1fUipm9nke1oN10gIwNPSH3rDB6MDsE9m1ZaDuU6IT_Du26A8FrPKX2yHr49hfMQcjtRbMw2iIg8SzoOfflDFPOLYXuFiXVfKlG3Y90qUmqNqbOWBMYsrZXggl2';

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-[1560px] mx-auto flex flex-col gap-6">
      
      {/* Top Action & Navigation Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex flex-col gap-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-primary-fixed text-on-primary-fixed rounded-full font-label-sm text-label-sm font-bold tracking-wide uppercase">
              Repository
            </span>
            <span className="text-on-surface-variant font-label-sm text-label-sm">• Executive Vault v2.4</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Saved Drafts & Content Vault
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Curate, simulate, and fine-tune your thought leadership pipeline with authentic feed fidelity, algorithmic hook scoring, and scheduled publishing control.
          </p>
        </div>

        {/* Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            type="button"
            onClick={onClearAllDrafts}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-label-md hover:bg-error-container hover:text-on-error-container transition-colors font-medium border border-surface-container"
          >
            <span className="material-symbols-outlined text-[18px]">clear_all</span>
            <span>Clear History</span>
          </button>

          {/* Export dropdown */}
          <div className="relative">
            <button 
              type="button"
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-low text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors shadow-xs font-semibold border border-surface-container"
            >
              <span className="material-symbols-outlined text-[18px]">ios_share</span>
              <span>Export All</span>
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>

            {exportDropdownOpen && (
              <div 
                className="absolute right-0 mt-1 w-52 bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container p-1.5 z-30 flex flex-col gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  type="button"
                  onClick={() => handleExport('json')}
                  className="w-full text-left px-3 py-2 rounded-xl text-on-surface font-label-sm text-label-sm hover:bg-surface-container flex items-center justify-between"
                >
                  <span className="font-medium">Export as JSON</span>
                  <span className="font-mono-metric text-[11px] text-on-surface-variant">.json</span>
                </button>
                <button 
                  type="button"
                  onClick={() => handleExport('md')}
                  className="w-full text-left px-3 py-2 rounded-xl text-on-surface font-label-sm text-label-sm hover:bg-surface-container flex items-center justify-between"
                >
                  <span className="font-medium">Export as Markdown</span>
                  <span className="font-mono-metric text-[11px] text-on-surface-variant">.md</span>
                </button>
                <button 
                  type="button"
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-3 py-2 rounded-xl text-on-surface font-label-sm text-label-sm hover:bg-surface-container flex items-center justify-between"
                >
                  <span className="font-medium">Buffer CSV Format</span>
                  <span className="font-mono-metric text-[11px] text-on-surface-variant">.csv</span>
                </button>
              </div>
            )}
          </div>

          <button 
            type="button"
            onClick={onCreateNewDraft}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-colors shadow-md font-bold active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Create New Draft</span>
          </button>
        </div>
      </div>

      {/* Bento Overview Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Saved Drafts */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Total Saved</span>
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
                {drafts.length}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant ml-1.5">posts</span>
            </div>
            <span className="inline-flex items-center font-label-sm text-label-sm text-tertiary font-bold">
              <span className="material-symbols-outlined text-[16px]">trending_up</span> +3 this week
            </span>
          </div>
          {/* Sparkline Visualisation SVG */}
          <div className="mt-2 pt-1">
            <svg className="w-full h-8 text-primary overflow-visible" fill="none" viewBox="0 0 100 24">
              <path d="M0 18 Q 20 8, 35 14 T 70 6 T 100 12" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
              <path d="M0 18 Q 20 8, 35 14 T 70 6 T 100 12 L 100 24 L 0 24 Z" fill="currentColor" opacity="0.08" />
            </svg>
          </div>
        </div>

        {/* Card 2: Scheduled Posts */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Scheduled</span>
            <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
              <span className="material-symbols-outlined text-[18px]">calendar_clock</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
                {scheduledCount}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant">queued</span>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
              Next drop: Tomorrow @ 8:15 AM EST
            </p>
          </div>
          <div className="mt-2 pt-1">
            <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
              <div className="bg-tertiary h-2 rounded-full transition-all" style={{ width: `${Math.min(100, (scheduledCount / 5) * 100)}%` }}></div>
            </div>
            <div className="flex justify-between items-center mt-1 text-[11px] font-label-sm text-on-surface-variant">
              <span>Slots {scheduledCount}/5 filled</span>
              <span className="text-tertiary font-bold">Optimal window</span>
            </div>
          </div>
        </div>

        {/* Card 3: Average Word Count */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Avg. Word Count</span>
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
              <span className="material-symbols-outlined text-[18px]">short_text</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
                {avgWordCount}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant">words / post</span>
            </div>
            <p className="font-label-sm text-label-sm text-tertiary font-bold mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">verified</span> LinkedIn Sweet Spot (250-320)
            </p>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-mono-metric text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            <span>Avg. read completion rate: ~74%</span>
          </div>
        </div>

        {/* Card 4: Top Content Pillars */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">Top Pillars</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
              <span className="material-symbols-outlined text-[18px]">category</span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-label-sm text-label-sm font-medium">#AI Engineering (6)</span>
            <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-label-sm text-label-sm font-medium">#Startup Moats (4)</span>
            <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-label-sm text-label-sm font-medium">#B2B Growth (3)</span>
            <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-label-sm text-label-sm font-medium">#Design Systems (1)</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-label-sm text-on-surface-variant">
            <span>Pillar balance</span>
            <span className="text-primary font-bold">High Diversity</span>
          </div>
        </div>
      </div>

      {/* Search, Filter & View Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface-container-lowest shadow-xs border border-surface-container">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search first line hook, topic keyword, or body snippet..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-bright transition-colors border border-surface-container focus:border-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-xl border border-surface-container">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Status:</span>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer font-semibold"
            >
              <option value="All">All Statuses ({drafts.length})</option>
              <option value="Draft">Draft</option>
              <option value="Ready to Post">Ready to Post</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Published">Published</option>
            </select>
          </div>

          {/* Tone Filter */}
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-xl border border-surface-container">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Tone:</span>
            <select 
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              className="bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer font-semibold"
            >
              <option value="All">All Tones</option>
              <option value="Executive Authority">Executive Authority</option>
              <option value="Contrarian Analytical">Contrarian Analytical</option>
              <option value="Story-Driven Vulnerable">Story-Driven Vulnerable</option>
              <option value="Tactical Framework">Tactical Framework</option>
              <option value="Storytelling">Storytelling</option>
            </select>
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-xl border border-surface-container">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Sort:</span>
            <select 
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer font-semibold"
            >
              <option value="newest">Created (Newest first)</option>
              <option value="oldest">Created (Oldest first)</option>
              <option value="longest">Characters (Longest)</option>
              <option value="shortest">Characters (Shortest)</option>
            </select>
          </div>

          {/* Media Filter Button */}
          <button
            type="button"
            onClick={() => setFilterMediaOnly(!filterMediaOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all font-label-md text-label-md font-semibold ${
              filterMediaOnly
                ? 'bg-primary-container text-on-primary border-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface border-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">photo_camera</span>
            <span>With Media</span>
            {filterMediaOnly && <span className="material-symbols-outlined text-[14px]">close</span>}
          </button>

          {/* View Switcher */}
          <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-surface-container ml-auto md:ml-0">
            <button 
              type="button"
              onClick={() => setIsListView(false)}
              className={`p-1.5 rounded-lg transition-colors ${
                !isListView ? 'bg-surface-container-lowest text-primary shadow-xs font-bold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Card Grid View"
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button 
              type="button"
              onClick={() => setIsListView(true)}
              className={`p-1.5 rounded-lg transition-colors ${
                isListView ? 'bg-surface-container-lowest text-primary shadow-xs font-bold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Compact List View"
            >
              <span className="material-symbols-outlined text-[18px]">table_rows</span>
            </button>
          </div>
        </div>
      </div>

      {/* Drafts Grid Container */}
      {filteredDrafts.length > 0 ? (
        <div className={`grid gap-5 ${isListView ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {filteredDrafts.map((draft) => (
            <div 
              key={draft.id}
              className="group p-5 rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md border border-surface-container transition-all flex flex-col justify-between"
            >
              <div className="flex flex-col gap-3">
                {/* Card Header & Status */}
                <div className="flex items-center justify-between gap-2">
                  {draft.status === 'Ready to Post' && (
                    <span className="px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-tertiary-container text-on-tertiary-container flex items-center gap-1.5 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed"></span> Ready to Post
                    </span>
                  )}
                  {draft.status === 'Scheduled' && (
                    <span className="px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-secondary-fixed text-on-secondary-fixed flex items-center gap-1.5 font-bold">
                      <span className="material-symbols-outlined text-[14px]">alarm</span>
                      {draft.scheduledTime ? `Scheduled: ${draft.scheduledTime}` : 'Scheduled'}
                    </span>
                  )}
                  {draft.status === 'Draft' && (
                    <span className="px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant flex items-center gap-1.5 font-bold">
                      <span className="material-symbols-outlined text-[14px]">edit_note</span> Working Draft
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    <span className="text-on-surface-variant font-label-sm text-label-sm">{draft.date}</span>
                    <button 
                      type="button"
                      onClick={() => handleOpenInspector(draft)}
                      className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
                      title="Inspect in Feed Simulator"
                    >
                      <span className="material-symbols-outlined text-[18px]">open_in_full</span>
                    </button>
                  </div>
                </div>

                {/* Hook & Title */}
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-headline-md text-headline-md text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                    {draft.title}
                  </h3>
                  <div className="font-body-feed text-body-feed text-on-surface-variant line-clamp-3 leading-relaxed bg-surface-container-low/60 p-3 rounded-xl border border-surface-container/60">
                    {draft.hook}
                  </div>
                </div>

                {/* Attached Image Thumbnail Preview */}
                {draft.imageUrl && (
                  <div 
                    onClick={() => handleOpenInspector(draft)}
                    className="relative group/thumb h-32 rounded-xl overflow-hidden border border-surface-container bg-surface-container cursor-pointer transition-all hover:border-primary/50 shadow-xs"
                    title="Click to inspect in Feed Simulator"
                  >
                    <img 
                      src={draft.imageUrl} 
                      alt={draft.imageCaption || draft.title} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 font-label-sm text-label-sm font-semibold">
                      <span className="material-symbols-outlined text-[18px]">open_in_full</span>
                      <span>Simulate in Feed</span>
                    </div>
                    {draft.imageCaption && (
                      <span className="absolute bottom-2 left-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium truncate">
                        {draft.imageCaption}
                      </span>
                    )}
                  </div>
                )}

                {/* Metadata Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {draft.imageUrl && (
                    <span className="px-2 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm flex items-center gap-1 font-bold">
                      <span className="material-symbols-outlined text-[13px]">image</span> Media Post
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[14px]">psychology</span> {draft.tone}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[14px]">groups</span> {draft.targetAudience}
                  </span>
                  <span className="font-mono-metric text-mono-metric text-on-surface-variant ml-auto font-bold">
                    {draft.charCount.toLocaleString()} chars
                  </span>
                </div>
              </div>

              {/* Footer Actions Bar */}
              <div className="mt-5 pt-3 border-t border-surface-container flex items-center justify-between gap-2 bg-surface-container-lowest">
                <div className="flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(draft.fullContent);
                      showToast('Copied raw draft content to clipboard!');
                    }}
                    className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                    title="Copy Raw Content"
                  >
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => onDuplicateDraft(draft)}
                    className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                    title="Duplicate Draft"
                  >
                    <span className="material-symbols-outlined text-[18px]">content_paste_go</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setDraftToDelete(draft)}
                    className="p-2 rounded-xl text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors"
                    title="Delete Draft"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>

                <button 
                  type="button"
                  onClick={() => onOpenDraftInEditor(draft)}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-surface-container-low text-primary font-label-md text-label-md hover:bg-primary-container hover:text-on-primary transition-all font-bold"
                >
                  <span>Open in Editor</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State Fallback */
        <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xs text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant mb-4">
            <span className="material-symbols-outlined text-[32px]">manage_search</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface">No matching saved drafts found</h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mt-1 mb-4">
            Try relaxing your filter parameters or search for alternative first line keywords.
          </p>
          <button 
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedStatus('All');
              setSelectedTone('All');
              setSelectedSort('newest');
            }}
            className="px-4 py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md shadow-xs font-semibold hover:bg-primary transition-colors"
          >
            Reset Search & Filters
          </button>
        </div>
      )}

      {/* Bottom Vault Pagination & Sync Metadata */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 font-label-sm text-label-sm text-on-surface-variant border-t border-surface-container">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-tertiary"></span>
          <span>Auto-synced to Cloud Storage 2 mins ago</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Showing {filteredDrafts.length} of {drafts.length} drafts</span>
          <div className="flex items-center gap-1">
            <button 
              type="button" 
              disabled 
              className="p-1.5 rounded-lg bg-surface-container text-on-surface disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <span className="px-2.5 py-0.5 rounded-lg bg-primary-container text-on-primary font-bold">1</span>
            <button 
              type="button" 
              className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide-Over Inspection & Direct Feed Simulator Drawer */}
      {drawerOpen && inspectingDraft && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-fadeIn"
          onClick={handleCloseInspector}
        >
          <div 
            className="h-full w-full max-w-2xl bg-surface-container-lowest shadow-2xl flex flex-col z-50 animate-slideLeft"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="h-16 px-6 flex items-center justify-between bg-surface-container-low border-b border-surface-container">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[22px]">visibility</span>
                <div>
                  <h3 className="font-title-sm text-title-sm text-on-surface font-bold">Feed Simulator & Post Inspector</h3>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Algorithm Preview Fidelity</span>
                </div>
              </div>
              <button 
                type="button"
                onClick={handleCloseInspector}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
              {/* Target Info & Meta Bar */}
              <div className="p-3.5 rounded-2xl bg-surface-container-low flex flex-wrap items-center justify-between gap-3 border border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full font-label-sm text-label-sm bg-tertiary-container text-on-tertiary-container font-bold">
                    {inspectingDraft.status}
                  </span>
                  <span className="px-3 py-0.5 rounded-full font-label-sm text-label-sm bg-primary-fixed text-on-primary-fixed font-bold">
                    {inspectingDraft.tone}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-on-surface-variant font-mono-metric text-mono-metric">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">timer</span> ~1.5 min dwell
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">format_shapes</span> {inspectingDraft.charCount} chars
                  </span>
                </div>
              </div>

              {/* Hyper-Realistic LinkedIn Simulator Card */}
              <div className="rounded-2xl bg-surface-container-lowest shadow-md border border-surface-container overflow-hidden flex flex-col">
                {/* Post Author Header */}
                <div className="p-4 flex items-start gap-3">
                  <img 
                    alt="Author Profile" 
                    className="w-12 h-12 rounded-full object-cover ring-1 ring-surface-container" 
                    src={AVATAR_URL}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-title-sm text-title-sm text-on-surface font-bold truncate">Alex Morgan</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">• 1st</span>
                    </div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant truncate">Founder & CEO @ ScaleFlow | Sharing AI & B2B Growth Lessons</p>
                    <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                      <span>Just now</span>
                      <span>•</span>
                      <span className="material-symbols-outlined text-[14px]">public</span>
                    </div>
                  </div>
                  <button type="button" className="text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </div>

                {/* Feed Post Body Simulator with Fold */}
                <div className="px-4 pb-3 flex flex-col">
                  <div className="font-body-feed text-body-feed text-on-surface whitespace-pre-wrap font-bold leading-relaxed">
                    {inspectingDraft.hook}
                  </div>

                  {/* Simulated Platform Fold Cutoff Indicator */}
                  <div className="my-3 relative py-2 flex items-center justify-between">
                    <div className="absolute inset-x-0 h-0.5 border-t-2 border-dashed border-secondary"></div>
                    <span className="relative z-10 px-3 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold shadow-xs">
                      LinkedIn Desktop Hook Fold (Line 3 Cutoff)
                    </span>
                    <span className="relative z-10 font-label-sm text-label-sm text-primary font-bold bg-surface-container-lowest px-1">
                      ...see more
                    </span>
                  </div>

                  <div className="font-body-feed text-body-feed text-on-surface whitespace-pre-wrap leading-relaxed">
                    {inspectingDraft.fullContent.replace(inspectingDraft.hook, '').trim() || inspectingDraft.fullContent}
                  </div>
                </div>

                {/* Simulated Post Attached Image */}
                {inspectingDraft.imageUrl ? (
                  <div className="mx-4 mb-3 rounded-xl overflow-hidden border border-surface-container bg-surface-container-low shadow-xs">
                    <img 
                      src={inspectingDraft.imageUrl} 
                      alt={inspectingDraft.imageCaption || inspectingDraft.title}
                      className="w-full max-h-[380px] object-cover" 
                    />
                    {inspectingDraft.imageCaption && (
                      <div className="px-3.5 py-2 bg-surface-container-lowest border-t border-surface-container flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                        <span className="flex items-center gap-1.5 truncate">
                          <span className="material-symbols-outlined text-[16px] text-primary">image</span>
                          <span className="font-medium text-on-surface">{inspectingDraft.imageCaption}</span>
                        </span>
                        <span className="text-[11px] opacity-75 font-mono-metric">Attached Media</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mx-4 mb-3 p-3 rounded-xl bg-surface-container-low/40 border border-dashed border-surface-container flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-on-surface-variant text-label-sm">
                      <span className="material-symbols-outlined text-[16px] text-secondary">image_not_supported</span>
                      <span>Text-only draft • No visual asset attached</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenDraftInEditor(inspectingDraft);
                        handleCloseInspector();
                      }}
                      className="text-primary hover:underline text-label-sm font-semibold flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">add_photo_alternate</span>
                      <span>Attach in Studio</span>
                    </button>
                  </div>
                )}

                {/* Simulated Post Engagement Stats */}
                <div className="px-4 py-2 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm bg-surface-container-lowest border-t border-surface-container-low">
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                      <span className="w-4 h-4 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-[9px] font-bold">👍</span>
                      <span className="w-4 h-4 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center text-[9px]">💡</span>
                      <span className="w-4 h-4 rounded-full bg-secondary-fixed text-on-secondary flex items-center justify-center text-[9px]">❤️</span>
                    </div>
                    <span className="pl-1 font-medium">Predicted reach: ~14.8k impressions</span>
                  </div>
                  <span>34 comments • 12 reposts</span>
                </div>

                {/* Engagement Action Bar */}
                <div className="p-1 grid grid-cols-4 bg-surface-container-low text-on-surface-variant font-label-md text-label-md">
                  <button type="button" className="py-2 flex items-center justify-center gap-1 hover:bg-surface-container rounded-lg transition-colors font-medium">
                    <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                    <span>Like</span>
                  </button>
                  <button type="button" className="py-2 flex items-center justify-center gap-1 hover:bg-surface-container rounded-lg transition-colors font-medium">
                    <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                    <span>Comment</span>
                  </button>
                  <button type="button" className="py-2 flex items-center justify-center gap-1 hover:bg-surface-container rounded-lg transition-colors font-medium">
                    <span className="material-symbols-outlined text-[18px]">repeat</span>
                    <span>Repost</span>
                  </button>
                  <button type="button" className="py-2 flex items-center justify-center gap-1 hover:bg-surface-container rounded-lg transition-colors font-medium">
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>Send</span>
                  </button>
                </div>
              </div>

              {/* Quick AI Polish Recommendations */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-title-sm text-title-sm text-on-surface font-bold">Algorithmic Polish Recommendations</span>
                  <span className="font-label-sm text-label-sm text-tertiary font-bold">89/100 Hook Score</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-surface-container flex items-start gap-2.5 border border-surface-container">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">bolt</span>
                    <div>
                      <span className="font-label-md text-label-md text-on-surface font-bold block">Strong Negation Hook</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Opening challenge creates tension within the first 65 characters.
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-container flex items-start gap-2.5 border border-surface-container">
                    <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5">checklist</span>
                    <div>
                      <span className="font-label-md text-label-md text-on-surface font-bold block">Optimal Line Spacing</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        White space cadence ensures effortless skimmability on mobile apps.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 bg-surface-container-low border-t border-surface-container flex items-center justify-between gap-3">
              <button 
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(inspectingDraft.fullContent);
                  showToast('Post copied to clipboard with formatting intact!');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors shadow-xs font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                <span>Copy Post Content</span>
              </button>

              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => {
                    onOpenDraftInEditor(inspectingDraft);
                    handleCloseInspector();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors shadow-xs font-semibold"
                >
                  Send to Editor
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    showToast('Pushed directly to LinkedIn scheduler queue!');
                    handleCloseInspector();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-opacity shadow-md font-bold"
                >
                  <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                  <span>Push to LinkedIn</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {draftToDelete && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setDraftToDelete(null)}
        >
          <div 
            className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 text-error">
              <span className="material-symbols-outlined text-[28px]">warning</span>
              <h3 className="font-headline-md text-headline-md text-on-surface">Delete Saved Draft?</h3>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Are you sure you want to permanently discard <strong className="text-on-surface">"{draftToDelete.title}"</strong>? This action cannot be reversed.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
              <button 
                type="button"
                onClick={() => setDraftToDelete(null)}
                className="px-4 py-2 rounded-xl text-on-surface-variant font-label-md text-label-md hover:bg-surface-container transition-colors font-medium"
              >
                Keep Draft
              </button>
              <button 
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-error text-on-error font-label-md text-label-md hover:opacity-90 transition-opacity font-bold shadow-xs"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
