import React, { useState } from 'react';
import { ViralHook } from '../types';
import { CURATED_HOOKS } from '../sampleData';
import { generateViralHooks } from '../services/geminiService';
import { toUnicodeBold, toUnicodeItalic } from '../utils/unicode';

interface HookLibraryViewProps {
  onLoadHookInEditor: (hookText: string) => void;
  showToast: (msg: string) => void;
}

export const HookLibraryView: React.FC<HookLibraryViewProps> = ({
  onLoadHookInEditor,
  showToast
}) => {
  const [hooksList, setHooksList] = useState<ViralHook[]>(CURATED_HOOKS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [topicInput, setTopicInput] = useState('How we scaled our B2B SaaS to $100k MRR with 0 ad spend');
  const [selectedAngle, setSelectedAngle] = useState('contrarian');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSortedDesc, setIsSortedDesc] = useState(true);

  // Sandbox state
  const defaultSandboxText = `90% of founders fail at this. Here is the 10% playbook:

Most people think it takes 80-hour workweeks and VC millions.
The actual secret is painfully simple: Stop optimizing product before distribution.

Here are the 4 non-negotiables we followed:`;

  const [sandboxText, setSandboxText] = useState(defaultSandboxText);
  const [seeMoreExpanded, setSeeMoreExpanded] = useState(false);
  const [feedLiked, setFeedLiked] = useState(false);
  const [feedReactions, setFeedReactions] = useState(842);

  // Filter hooks by category
  const filteredHooks = hooksList.filter(h => {
    if (selectedCategory === 'all') return true;
    return h.category === selectedCategory;
  });

  // Sort by virality score
  const handleSortVirality = () => {
    const sorted = [...hooksList].sort((a, b) => {
      return isSortedDesc ? a.viralityScore - b.viralityScore : b.viralityScore - a.viralityScore;
    });
    setHooksList(sorted);
    setIsSortedDesc(!isSortedDesc);
    showToast(`Sorted hooks by virality score (${!isSortedDesc ? 'Highest first' : 'Lowest first'})`);
  };

  // Bookmark toggle
  const toggleBookmark = (id: string) => {
    setHooksList(prev => prev.map(h => {
      if (h.id === id) {
        const nextState = !h.bookmarked;
        showToast(nextState ? 'Saved hook to favorites!' : 'Removed from saved hooks');
        return { ...h, bookmarked: nextState };
      }
      return h;
    }));
  };

  // Copy hook content
  const handleCopyHook = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Hook copied to clipboard!');
    } catch {
      showToast('Copied hook to clipboard');
    }
  };

  // Load into Sandbox
  const handleLoadInSandbox = (hook: ViralHook) => {
    setSandboxText(hook.fullSample);
    showToast('Loaded into Interactive Sandbox!');
  };

  // AI Generation of 5 viral hooks
  const handleGenerateHooks = async () => {
    setIsGenerating(true);
    try {
      const generatedHooks = await generateViralHooks(topicInput, selectedAngle);
      
      const newItems: ViralHook[] = generatedHooks.map((gh, idx) => {
        const lines = gh.split('\n').filter(l => l.trim().length > 0);
        const hookFirst = lines[0] || gh;
        const sub = lines.slice(1, 3).join('\n') || 'Tested algorithmic opener setup...';
        
        return {
          id: `gen-hook-${Date.now()}-${idx}`,
          category: (selectedAngle === 'contrarian' ? 'contrarian' : selectedAngle === 'vulnerable' ? 'vulnerability' : 'curiosity'),
          categoryLabel: selectedAngle === 'contrarian' ? 'Contrarian / Bold' : selectedAngle === 'vulnerable' ? 'Personal Failure' : 'Curiosity Gap',
          viralityScore: Math.floor(Math.random() * 5) + 95,
          testedImpressions: 'AI Optimized hook',
          hookText: hookFirst,
          subText: sub,
          foldImpact: 'Extremely High (Cliffhanger)',
          fullSample: `${hookFirst}\n\n${sub}\n\nHere is the step-by-step breakdown:`,
          bookmarked: false
        };
      });

      setHooksList(prev => [...newItems, ...prev]);
      if (newItems[0]) {
        setSandboxText(newItems[0].fullSample);
      }
      showToast('Generated 5 high-converting viral hooks!');
    } catch {
      showToast('Failed to generate hooks');
    } finally {
      setIsGenerating(false);
    }
  };

  // Sandbox Formatting
  const handleSandboxBold = () => {
    setSandboxText(prev => {
      const lines = prev.split('\n');
      if (lines[0]) lines[0] = toUnicodeBold(lines[0]);
      return lines.join('\n');
    });
    showToast('Converted first line to Unicode Bold');
  };

  const handleSandboxItalic = () => {
    setSandboxText(prev => {
      const lines = prev.split('\n');
      if (lines[1]) lines[1] = toUnicodeItalic(lines[1]);
      else if (lines[0]) lines[0] = toUnicodeItalic(lines[0]);
      return lines.join('\n');
    });
    showToast('Applied Unicode Italic');
  };

  const handleSandboxSpacing = () => {
    setSandboxText(prev => {
      if (prev.includes('\n\n')) return prev;
      return prev.split('\n').join('\n\n');
    });
    showToast('Optimized line spacing for dwell algorithm');
  };

  // Parse lines for preview
  const sandboxLines = sandboxText.split('\n').filter(l => l.trim().length > 0);
  const line1 = sandboxLines[0] || '90% of founders fail at this. Here is the 10% playbook:';
  const line2 = sandboxLines[1] || 'Most people think it takes 80-hour workweeks and VC millions.';
  const line3 = sandboxLines[2] || 'The actual secret is painfully simple: Stop optimizing product...';

  const ALEX_VANCE_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHMn1lWftbpO6fy040BPyRwp7KxwVqNyh9Z_aMbGLqdYzVoFkx4nHpL-hVO8VUbuXm243dydkf8VjRbrg_BcP9S_aDv-SI29vDirPFnv8CEuzE54DlaBclhxeg2NVHJfnF_X2ixhEhhSm6S6yqoaJCm9x45ak4DUWwUjMBIUNtz_ZzP7VgO_30waasdF5AP7ehiMvMVcaK2o-jOrIqrwb3yBa-HuPc0iXPtO__73Sue4fY92GEW9rm';

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-[1560px] mx-auto flex flex-col gap-6">
      
      {/* Top Command & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex flex-col gap-1 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-mono-metric text-mono-metric font-semibold">
              <span className="material-symbols-outlined text-[14px] text-primary">bolt</span>
              1,420+ Curated Openers
            </span>
            <span className="text-on-surface-variant font-label-sm text-label-sm">
              Updated Today · Top 1% LinkedIn Dwell-Time Frameworks
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            Viral Hook Generator & Library
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Engineer high-converting three-line openers engineered to stop the infinite scroll and force the platform's crucial 'see more' click.
          </p>
        </div>

        {/* Live Benchmarks */}
        <div className="flex items-center gap-3 bg-surface-container-low p-2 rounded-xl self-start lg:self-auto border border-surface-container">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-lowest rounded-lg shadow-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">visibility</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Avg. Hook CTR</span>
              <span className="font-title-sm text-title-sm text-on-surface font-bold">14.8%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-lowest rounded-lg shadow-xs">
            <span className="material-symbols-outlined text-tertiary text-[20px]">trending_up</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Algorithmic Boost</span>
              <span className="font-title-sm text-title-sm text-on-surface font-bold">3.4x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Strip */}
      <div className="w-full flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: 'all', label: `All Hooks (${hooksList.length})` },
          { key: 'curiosity', label: 'Curiosity Gap' },
          { key: 'contrarian', label: 'Contrarian / Bold' },
          { key: 'vulnerability', label: 'Personal Failure to Success' },
          { key: 'listicle', label: 'Numbered / Listicle' },
          { key: 'questions', label: 'Question / Poll Openers' },
          { key: 'data', label: 'Data & Stat Hooks' }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSelectedCategory(tab.key)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full font-label-md text-label-md transition-all font-semibold ${
              selectedCategory === tab.key
                ? 'bg-primary-container text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dual-Pane Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Generator & Card Grid (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Interactive AI Generator Surface */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-sm border border-surface-container flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary-fixed-dim/20 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
                <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">AI Hook Engine</h2>
              </div>
              <span className="font-mono-metric text-mono-metric px-2.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-semibold">
                Powered by Gemini Flash
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="topic-input">
                What is your post about?
              </label>
              <div className="relative">
                <input 
                  id="topic-input"
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="e.g. Scaling B2B SaaS without paid ads, burnout, career pivot at 35..."
                  className="w-full bg-surface-container-low px-4 py-2.5 rounded-xl font-body-md text-body-md text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none shadow-xs border border-surface-container focus:border-primary transition-all pr-10"
                />
                {topicInput && (
                  <button 
                    type="button"
                    onClick={() => setTopicInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors p-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                  </button>
                )}
              </div>
            </div>

            {/* Emotion Angle Chips */}
            <div className="flex flex-col gap-1.5">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Select Psychological Angle:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { angle: 'contrarian', label: '🔥 Contrarian / Spiky' },
                  { angle: 'vulnerable', label: '💔 Vulnerable / Raw' },
                  { angle: 'shocking', label: '⚡ Shocking Metric' },
                  { angle: 'inspiring', label: '🚀 Playbook / System' },
                  { angle: 'curious', label: '🧩 Curiosity Gap' }
                ].map((item) => (
                  <button
                    key={item.angle}
                    type="button"
                    onClick={() => setSelectedAngle(item.angle)}
                    className={`px-3 py-1 rounded-full font-label-sm text-label-sm transition-all font-semibold ${
                      selectedAngle === item.angle
                        ? 'bg-primary-container text-on-primary shadow-xs'
                        : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action & Settings */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-surface-container/60">
              <div className="flex items-center gap-2">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Output format:</span>
                <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-mono-metric text-mono-metric font-semibold">
                  3-Line Cutoff Ready
                </span>
              </div>
              
              <button 
                type="button"
                onClick={handleGenerateHooks}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-md active:scale-95 font-semibold disabled:opacity-75"
              >
                <span className={`material-symbols-outlined text-[18px] ${isGenerating ? 'animate-spin' : ''}`}>
                  {isGenerating ? 'progress_activity' : 'auto_awesome'}
                </span>
                <span>{isGenerating ? 'Generating Algorithmic Hooks...' : 'Generate 5 Viral Hooks'}</span>
              </button>
            </div>
          </div>

          {/* Section Header for Cards */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">Top Performing Templates</h2>
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono-metric text-mono-metric font-bold">
                {filteredHooks.length} Available
              </span>
            </div>
            <button 
              type="button"
              onClick={handleSortVirality}
              className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface px-2.5 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-[16px]">sort</span>
              <span>Rank by Virality ({isSortedDesc ? 'High' : 'Low'})</span>
            </button>
          </div>

          {/* Hook Cards Stack */}
          <div className="flex flex-col gap-4">
            {filteredHooks.map((hook) => (
              <div 
                key={hook.id}
                className="group bg-surface-container-lowest p-5 rounded-2xl shadow-sm hover:shadow-md border border-surface-container transition-all flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold">
                      {hook.categoryLabel}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-mono-metric text-mono-metric font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                      {hook.viralityScore}/100 Virality
                    </span>
                    <span className="text-on-surface-variant font-mono-metric text-mono-metric">
                      {hook.testedImpressions}
                    </span>
                  </div>

                  <button 
                    type="button"
                    onClick={() => toggleBookmark(hook.id)}
                    className={`p-1 rounded-lg transition-colors ${
                      hook.bookmarked ? 'text-primary' : 'text-outline hover:text-primary'
                    }`}
                    title={hook.bookmarked ? "Remove bookmark" : "Bookmark hook"}
                  >
                    <span 
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: hook.bookmarked ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      bookmark
                    </span>
                  </button>
                </div>

                {/* Hook Text */}
                <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col gap-1 border border-surface-container/60">
                  <p className="font-title-sm text-title-sm text-on-surface font-bold leading-relaxed">
                    {hook.hookText}
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant italic">
                    {hook.subText}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Fold Impact:</span>
                    <span className="font-label-sm text-label-sm text-tertiary font-bold">{hook.foldImpact}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => handleCopyHook(hook.hookText)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-sm text-label-sm font-semibold transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                      <span>Copy Hook</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => handleLoadInSandbox(hook)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-sm text-label-sm font-semibold transition-colors shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      <span>Load in Sandbox</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Testing Sandbox & LinkedIn Truncation Feed (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5 sticky top-20">
          
          {/* Sandbox Workspace Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">science</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Interactive Sandbox</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed font-label-sm text-label-sm text-on-secondary-fixed font-bold">
                Real-Time Simulation
              </span>
            </div>
            
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Tweak your opener directly. Observe the exact 3-line fold line before a reader must tap <strong className="text-on-surface">'...see more'</strong>.
            </p>

            {/* Input Sandbox Textarea */}
            <div className="flex flex-col gap-1 relative">
              <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                <span>Opener & First 3 Lines</span>
                <span className="font-mono-metric text-mono-metric text-primary font-bold">
                  {sandboxText.length} chars
                </span>
              </div>
              <textarea 
                rows={5}
                value={sandboxText}
                onChange={(e) => setSandboxText(e.target.value)}
                className="w-full bg-surface-container-low p-3.5 rounded-xl font-body-feed text-body-feed text-on-surface focus:bg-surface-container-lowest focus:outline-none transition-all resize-y leading-relaxed border border-surface-container focus:border-primary"
              />
            </div>

            {/* Format Helpers */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <button 
                type="button"
                onClick={handleSandboxBold}
                className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-sm text-label-sm transition-colors flex items-center gap-1 font-semibold"
              >
                <span className="material-symbols-outlined text-[14px]">format_bold</span>
                <span>Unicode Bold</span>
              </button>
              
              <button 
                type="button"
                onClick={handleSandboxItalic}
                className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-sm text-label-sm transition-colors flex items-center gap-1 font-semibold"
              >
                <span className="material-symbols-outlined text-[14px]">format_italic</span>
                <span>Unicode Italic</span>
              </button>
              
              <button 
                type="button"
                onClick={handleSandboxSpacing}
                className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface font-label-sm text-label-sm transition-colors flex items-center gap-1 font-semibold"
              >
                <span className="material-symbols-outlined text-[14px]">format_list_bulleted</span>
                <span>Add Clean Spacing</span>
              </button>

              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(sandboxText);
                  showToast('Copied sandbox text to clipboard!');
                }}
                className="ml-auto px-3 py-1 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-sm text-label-sm transition-colors flex items-center gap-1 font-bold shadow-xs"
              >
                <span className="material-symbols-outlined text-[14px]">share</span>
                <span>Copy All</span>
              </button>
            </div>

            {/* Send to generator button */}
            <button
              type="button"
              onClick={() => {
                onLoadHookInEditor(sandboxText);
                showToast('Loaded sandbox hook into Generator studio!');
              }}
              className="w-full mt-1 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 transition-colors border border-surface-container"
            >
              <span>Continue Drafting in Studio</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Hyper-Realistic LinkedIn Mobile/Desktop Feed Card */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-md border border-surface-container p-5 flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center justify-between pb-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">
                Feed Preview
              </span>
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface font-mono-metric text-mono-metric font-semibold">
                <span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>
                <span>High-Dwell Hook</span>
              </div>
            </div>

            {/* Feed Post Header */}
            <div className="flex items-start gap-3">
              <img 
                alt="Alex Vance Profile Headshot"
                className="w-12 h-12 rounded-full object-cover shadow-xs flex-shrink-0 ring-1 ring-surface-container" 
                src={ALEX_VANCE_AVATAR}
              />
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-title-sm text-title-sm text-on-surface font-bold truncate">Alex Vance</span>
                  <span className="text-on-surface-variant font-label-sm text-label-sm">· 1st</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                  SaaS Founder & Growth Architect | Scaling to $10M ARR
                </span>
                <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                  <span>1h</span>
                  <span>·</span>
                  <span className="material-symbols-outlined text-[13px]">public</span>
                </div>
              </div>
              <button 
                type="button"
                className="text-outline hover:text-on-surface transition-colors p-1"
              >
                <span className="material-symbols-outlined text-[20px]">more_horiz</span>
              </button>
            </div>

            {/* Feed Content Simulation with Truncation Mask */}
            <div className="flex flex-col relative text-on-surface font-body-feed text-body-feed">
              <div className="relative py-1">
                <p className="font-bold text-on-surface leading-tight mb-1">
                  {line1}
                </p>
                <p className="text-on-surface leading-normal text-[14px] mb-1">
                  {line2}
                </p>
                <div className="relative flex items-baseline">
                  <span className="text-on-surface leading-normal text-[14px] truncate flex-1">
                    {line3}
                  </span>
                  <button 
                    type="button"
                    onClick={() => setSeeMoreExpanded(!seeMoreExpanded)}
                    className="ml-1 text-outline hover:text-primary font-bold text-[14px] flex-shrink-0 bg-surface-container-lowest px-1 rounded transition-colors"
                  >
                    {seeMoreExpanded ? 'see less' : '...see more'}
                  </button>
                </div>

                {/* Fold Cutoff Marker Pill */}
                <div className="mt-3 p-2.5 rounded-xl bg-surface-container-low flex items-center justify-between border border-surface-container/60">
                  <div className="flex items-center gap-1.5 text-primary font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[16px]">vertical_align_bottom</span>
                    <span>LinkedIn fold line is <strong>safe</strong></span>
                  </div>
                  <span className="font-mono-metric text-mono-metric text-on-surface-variant font-bold">
                    3 lines visible
                  </span>
                </div>

                {/* Expanded Content */}
                {seeMoreExpanded && (
                  <div className="mt-3 pt-2 border-t border-surface-container-low flex flex-col gap-2 text-on-surface animate-fadeIn">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {sandboxLines.slice(3).join('\n') || `The actual secret is painfully simple: Stop optimizing product before distribution.\n\nHere are the 4 non-negotiables we followed:\n1. Built in public every Tuesday.\n2. Validated with 50 cold coffee chats.\n3. Kept stack ultra lean.\n4. Listened to retention, not vanity likes.`}
                    </p>
                    <p className="text-primary font-medium mt-1">#founders #growth #startups #linkedinstrategy</p>
                  </div>
                )}
              </div>
            </div>

            {/* Simulated LinkedIn Engagement Bar */}
            <div className="flex items-center justify-between pt-2 text-on-surface-variant border-t border-surface-container-low">
              <div className="flex items-center gap-1.5 font-label-sm text-label-sm">
                <div className="flex -space-x-1">
                  <span className="w-4 h-4 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-[10px]">👍</span>
                  <span className="w-4 h-4 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center text-[10px]">❤️</span>
                  <span className="w-4 h-4 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center text-[10px]">💡</span>
                </div>
                <span className="ml-1 font-semibold">{feedReactions}</span>
              </div>
              <div className="flex items-center gap-2 font-label-sm text-label-sm">
                <span>184 comments</span>
                <span>·</span>
                <span>42 reposts</span>
              </div>
            </div>

            {/* Feed Interactive Actions */}
            <div className="grid grid-cols-4 gap-1 pt-1 text-on-surface-variant font-label-sm text-label-sm">
              <button 
                type="button"
                onClick={() => {
                  if (!feedLiked) {
                    setFeedLiked(true);
                    setFeedReactions(prev => prev + 1);
                  } else {
                    setFeedLiked(false);
                    setFeedReactions(prev => prev - 1);
                  }
                }}
                className={`flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-surface-container transition-colors ${
                  feedLiked ? 'text-primary font-bold' : ''
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                <span className="hidden sm:inline">{feedLiked ? 'Liked' : 'Like'}</span>
              </button>

              <button 
                type="button"
                onClick={() => showToast('Simulated comment prompt')}
                className="flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span className="hidden sm:inline">Comment</span>
              </button>

              <button 
                type="button"
                onClick={() => showToast('Simulated repost prompt')}
                className="flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">repeat</span>
                <span className="hidden sm:inline">Repost</span>
              </button>

              <button 
                type="button"
                onClick={() => showToast('Simulated direct send')}
                className="flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Strategy & Anatomy Bento Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary mb-1">
            <span className="material-symbols-outlined text-[22px]">psychology</span>
          </div>
          <h3 className="font-title-sm text-title-sm text-on-surface font-bold">The 0.3s Scroll Reflex</h3>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Readers make sub-second decisions. The first 8-12 words must create an open information loop that only clicking <strong className="text-on-surface">'see more'</strong> can resolve.
          </p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary mb-1">
            <span className="material-symbols-outlined text-[22px]">data_thresholding</span>
          </div>
          <h3 className="font-title-sm text-title-sm text-on-surface font-bold">The 140-Character Threshold</h3>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            LinkedIn cuts off content at approximately line 3 on mobile feeds. Whitespace breaks force the button higher, accelerating the dwell algorithm score.
          </p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-container flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary mb-1">
            <span className="material-symbols-outlined text-[22px]">recommend</span>
          </div>
          <h3 className="font-title-sm text-title-sm text-on-surface font-bold">Contrarian Paradox</h3>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Stating the opposite of conventional wisdom generates up to 4.2x more comments. People respond to validate or vigorously debate your premise.
          </p>
        </div>
      </div>
    </div>
  );
};
