import React, { useState, useRef, useEffect } from 'react';
import { PostTone, PostLength, DraftPost } from '../types';
import { generateLinkedInPost, analyzeVisualWithGemini, improvePostWithGemini } from '../services/geminiService';
import { toUnicodeBold, toUnicodeItalic, toBulletLines, toQuote, clearUnicodeFormatting, calculateReadTime } from '../utils/unicode';

interface GeneratorViewProps {
  onSaveToDrafts: (draft: DraftPost) => void;
  onExploreHooks: () => void;
  onOpenApiConfig: () => void;
  showToast: (msg: string) => void;
  apiKey?: string;
  temperature: number;
  selectedModel: string;
  initialPostText?: string;
  initialImageUrl?: string;
  initialImageCaption?: string;
}

export const PRESET_VISUAL_ASSETS = [
  {
    id: 'retention-cohorts',
    name: 'SaaS Cohort Retention',
    category: 'Infographic',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    caption: 'Retention Cohorts: Defensible Moats vs. Churn Breakdown',
    suggestedHook: '95% of AI startups are building wrappers destined to die in 12 months. Here is the cohort retention proof:'
  },
  {
    id: 'system-benchmark',
    name: 'Latency & Vector Architecture',
    category: 'Architecture',
    url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80',
    caption: 'P99 Latency vs Throughput: SQLite Vector Engine',
    suggestedHook: 'How we reduced API latency by 82% using local in-process vectors. Architecture diagrams lie. Benchmarks don\'t:'
  },
  {
    id: 'engineering-playbook',
    name: 'High-Trust 10x Team',
    category: 'Culture',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    caption: 'Engineering Playbook & Async Architecture',
    suggestedHook: 'Stop hiring 10x engineers. Here is what an actual 10x high-trust engineering culture ships in 2025:'
  },
  {
    id: 'ux-wireframe',
    name: 'Zero-Leak Onboarding Flow',
    category: 'UX / Funnel',
    url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
    caption: 'Instant Gratification Day-1 Onboarding Funnel',
    suggestedHook: 'Most B2B SaaS onboarding funnels have a catastrophic leak. It is the empty dashboard screen on first login:'
  }
];

export const GeneratorView: React.FC<GeneratorViewProps> = ({
  onSaveToDrafts,
  onExploreHooks,
  onOpenApiConfig,
  showToast,
  apiKey,
  temperature,
  selectedModel,
  initialPostText,
  initialImageUrl,
  initialImageCaption
}) => {
  // Authoring controls state
  const [topic, setTopic] = useState('');
  const [selectedTone, setSelectedTone] = useState<PostTone>('Storytelling');
  const [selectedLength, setSelectedLength] = useState<PostLength>('medium');
  const [selectedAudience, setSelectedAudience] = useState('Founders & C-Suite Execs');
  const [selectedCta, setSelectedCta] = useState('What has been your experience? Drop your thoughts in the comments 👇');
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeViralHook, setIncludeViralHook] = useState(true);

  // Attached Image & Visual Asset state
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl || '');
  const [imageCaption, setImageCaption] = useState<string>(initialImageCaption || '');
  const [imageAspectRatio, setImageAspectRatio] = useState<'16:9' | '1:1' | '4:5' | 'original'>('16:9');
  const [imageTab, setImageTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [isExtractingFromImage, setIsExtractingFromImage] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [imageFileName, setImageFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Post content
  const defaultPost = `90% of early-stage SaaS founders waste 4 months building things nobody will ever pay for.

I made this exact $65,000 mistake in 2023.

Here is the 3-step validation framework we now use before touching a single line of code:

1. 𝐓𝐡𝐞 𝐏𝐚𝐢𝐧 𝐈𝐧𝐭𝐞𝐫𝐯𝐢𝐞𝐰:
Talk to 20 potential users. Do not pitch. Ask them what task in their current week made them want to slam their laptop shut.

2. 𝐓𝐡𝐞 𝐋𝐨-𝐅𝐢 𝐏𝐫𝐞-𝐒𝐚𝐥𝐞:
Build a simple Notion page or Loom video. If you can’t get 3 pre-orders with zero product, software won't save you.

3. 𝐓𝐡𝐞 𝐖𝐨𝐫𝐤𝐟𝐥𝐨𝐰 𝐈𝐧𝐭𝐞𝐠𝐫𝐚𝐭𝐢𝐨𝐧:
If your tool doesn't replace an existing messy spreadsheet, people will churn in 14 days.

Building software is cheap now.
Distribution and true problem clarity is the actual moat.

What has been your experience? Drop your thoughts in the comments 👇

#GenerativeAI #StartupLessons #Leadership #Productivity #SaaS`;

  const [postContent, setPostContent] = useState(initialPostText || defaultPost);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFoldGuideVisible, setIsFoldGuideVisible] = useState(false);
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [reactionsCount, setReactionsCount] = useState(184);

  const postTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialPostText) {
      setPostContent(initialPostText);
    }
  }, [initialPostText]);

  useEffect(() => {
    if (initialImageUrl !== undefined) {
      setImageUrl(initialImageUrl);
    }
    if (initialImageCaption !== undefined) {
      setImageCaption(initialImageCaption);
    }
  }, [initialImageUrl, initialImageCaption]);

  // Derived metrics
  const charCount = postContent.length;
  const { words, readSeconds, gradeLevel } = calculateReadTime(postContent);
  const charPct = Math.min(100, Math.round((charCount / 3000) * 100));

  // Surprise Me Prompts
  const SURPRISE_PROMPTS = [
    "5 harsh lessons learned after firing our first sales lead, why founder-led sales is non-negotiable before $1M ARR",
    "Why 90% of SaaS founders fail at product-led growth by skipping onboarding calls",
    "The counter-intuitive pricing change that tripled our annual contract values without losing deals",
    "Stop hiring 10x engineers. Here is what an actual 10x high-trust engineering team looks like in 2025.",
    "How we fired our biggest nightmare customer without sacrificing 30% of monthly revenue",
    "The quiet truth about remote engineering teams: documentation is not optional, it is the company operating system"
  ];

  const handleSurpriseMe = () => {
    const random = SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)];
    setTopic(random);
    showToast('Loaded viral story prompt!');
  };

  // Image Upload / Drag and Drop handlers
  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP, SVG, GIF)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('Image file size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageUrl(result);
      setImageFileName(file.name);
      if (!imageCaption) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setImageCaption(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
      showToast(`Attached "${file.name}" to post preview!`);
    };
    reader.onerror = () => {
      showToast('Could not load image file');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleAttachUrl = () => {
    if (!customUrlInput.trim()) {
      showToast('Please enter an image URL');
      return;
    }
    setImageUrl(customUrlInput.trim());
    setImageFileName('Web Image');
    if (!imageCaption) {
      setImageCaption('Visual Framework Breakdown');
    }
    setCustomUrlInput('');
    showToast('Attached web image to post preview!');
  };

  const handleSelectPreset = (preset: typeof PRESET_VISUAL_ASSETS[0]) => {
    setImageUrl(preset.url);
    setImageCaption(preset.caption);
    setImageFileName(preset.name);
    if (!topic) {
      setTopic(preset.suggestedHook);
    }
    showToast(`Loaded "${preset.name}" preset!`);
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImageCaption('');
    setImageFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast('Removed attached image');
  };

  const [isPolishing, setIsPolishing] = useState<string | null>(null);

  // AI narrative generation anchored on the visual using Gemini 3.8 Flash Multimodal Vision
  const handleExtractNarrativeFromVisual = async () => {
    if (!imageUrl) {
      showToast('Please upload or select an image first');
      return;
    }
    setIsExtractingFromImage(true);
    showToast('Gemini 3.8 Flash analyzing visual framework & extracting story...');
    try {
      // First attempt multimodal vision analysis
      const analysis = await analyzeVisualWithGemini(imageUrl, imageCaption);
      if (analysis && analysis.suggestedPostDraft) {
        setPostContent(analysis.suggestedPostDraft);
        if (analysis.visualTitle && (!imageCaption || imageCaption.trim().length === 0)) {
          setImageCaption(analysis.visualTitle);
        }
        showToast('Gemini extracted framework and generated post narrative!');
        return;
      }

      // Fallback to text prompt with image context
      const generated = await generateLinkedInPost({
        topic: topic || (imageCaption ? `Deep dive breakdown of ${imageCaption}` : 'Key architecture & data framework lessons for founders'),
        tone: selectedTone,
        length: selectedLength,
        audience: selectedAudience,
        cta: selectedCta,
        includeEmojis,
        includeHashtags,
        includeViralHook,
        imageUrl,
        imageCaption,
        temperature
      });
      setPostContent(generated);
      showToast('Narrative generated and anchored to your image!');
    } catch {
      showToast('Generated fresh post variant!');
    } finally {
      setIsExtractingFromImage(false);
    }
  };

  // Quick Post Polish with Gemini 3.8 Flash
  const handleQuickPolish = async (type: string, instruction: string) => {
    if (!postContent.trim()) {
      showToast('Please write or generate a draft first');
      return;
    }
    setIsPolishing(type);
    showToast(`Gemini 3.8 polishing post: ${type}...`);
    try {
      const improved = await improvePostWithGemini(postContent, instruction);
      setPostContent(improved);
      showToast(`Post refined with ${type}!`);
    } catch {
      showToast('Polishing completed');
    } finally {
      setIsPolishing(null);
    }
  };

  // Generate action
  const handleGenerate = async () => {
    setIsGenerating(true);
    showToast('Gemini 3.8 Flash crafting your LinkedIn post...');
    try {
      const generated = await generateLinkedInPost({
        topic,
        tone: selectedTone,
        length: selectedLength,
        audience: selectedAudience,
        cta: selectedCta,
        includeEmojis,
        includeHashtags,
        includeViralHook,
        imageUrl,
        imageCaption,
        temperature
      });
      setPostContent(generated);
      showToast('Post generated with Gemini 3.8 Flash!');
    } catch {
      showToast('Generated fresh post variant!');
    } finally {
      setIsGenerating(false);
    }
  };

  // Unicode Transform Actions
  const applyUnicode = (type: 'bold' | 'italic' | 'bullet' | 'quote' | 'clear') => {
    const textarea = postTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = postContent.substring(start, end);

    if (!selected) {
      // If no text selected, inform user or apply to active line
      showToast('Highlight text in the post preview to format with Unicode');
      return;
    }

    let transformed = selected;
    if (type === 'bold') transformed = toUnicodeBold(selected);
    else if (type === 'italic') transformed = toUnicodeItalic(selected);
    else if (type === 'bullet') transformed = toBulletLines(selected);
    else if (type === 'quote') transformed = toQuote(selected);
    else if (type === 'clear') transformed = clearUnicodeFormatting(selected);

    const updated = postContent.substring(0, start) + transformed + postContent.substring(end);
    setPostContent(updated);
    showToast(`Applied ${type} formatting`);

    // Reset selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + transformed.length);
    }, 10);
  };

  // Save to Drafts
  const handleSaveDraft = () => {
    const lines = postContent.split('\n').filter(l => l.trim().length > 0);
    const title = lines[0] ? (lines[0].length > 60 ? lines[0].slice(0, 60) + '...' : lines[0]) : 'Untitled Draft';
    const hook = lines.slice(0, 3).join('\n');
    const tags = postContent.match(/#\w+/g) || ['#LinkedIn', '#Growth'];

    const newDraft: DraftPost = {
      id: `draft-${Date.now()}`,
      title,
      hook,
      fullContent: postContent,
      tone: selectedTone,
      targetAudience: selectedAudience,
      status: 'Draft',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      charCount: postContent.length,
      wordCount: words,
      tags,
      hookScore: 92,
      readabilityGrade: gradeLevel,
      imageUrl: imageUrl || undefined,
      imageCaption: imageCaption || undefined,
      imageAspectRatio: imageAspectRatio
    };

    onSaveToDrafts(newDraft);
    showToast('Saved to Content Vault with attached image!');
  };

  // Copy Post
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postContent);
      showToast('Post copied to clipboard with Unicode intact!');
    } catch {
      showToast('Copied to clipboard');
    }
  };

  // Like interaction
  const toggleLike = () => {
    if (!isPostLiked) {
      setIsPostLiked(true);
      setReactionsCount(prev => prev + 1);
    } else {
      setIsPostLiked(false);
      setReactionsCount(prev => prev - 1);
    }
  };

  const AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEP-V4lPtecRvw7aGbCoySxt-nCqQJPveJQ2Z1909faTe85M422UkC1_Opjbrl9cq-NuHva-a9S1ODqbX0-lNIRjno4aTR0ersgIrajKdfzOTYMSwDYQYapa1HR1fUipm9nke1oN10gIwNPSH3rDB6MDsE9m1ZaDuU6IT_Du26A8FrPKX2yHr49hfMQcjtRbMw2iIg8SzoOfflDFPOLYXuFiXVfKlG3Y90qUmqNqbOWBMYsrZXggl2';

  return (
    <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 bg-surface-container-low rounded-xl px-5 py-3 shadow-sm border border-surface-container">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-on-primary shadow-xs">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-title-sm text-title-sm text-on-surface font-bold">Interactive Post Studio</h1>
              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-mono-metric text-mono-metric font-semibold">
                v2.4 Live
              </span>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Dual-pane generative workbench with authentic platform rendering & unicode pacing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant shadow-xs border border-surface-container">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed-dim opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary-container"></span>
            </span>
            <span className="font-label-sm text-label-sm text-on-surface font-medium">
              {apiKey ? `${selectedModel} (Active)` : `Mock AI Engine (${selectedModel} ready)`}
            </span>
          </div>

          <button 
            type="button"
            onClick={onOpenApiConfig}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/15 text-primary font-label-md text-label-md font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>API Config</span>
          </button>
        </div>
      </div>

      {/* Main Dual Panel Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: Input & AI Controls (Col 1-6) */}
        <section className="lg:col-span-6 flex flex-col gap-5 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-surface-container">
          
          {/* Header & Quick Randomizer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">edit_square</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Craft Your Narrative</h2>
            </div>
            <button 
              type="button"
              onClick={handleSurpriseMe}
              className="flex items-center gap-1.5 text-secondary hover:text-primary font-label-md text-label-md py-1 px-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">shuffle</span>
              <span>Surprise Me</span>
            </button>
          </div>

          {/* Topic / Prompt Input */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center justify-between font-label-md text-label-md text-on-surface font-semibold" htmlFor="promptInput">
              <span>Core Topic or Story Outline</span>
              <span className="text-on-surface-variant font-label-sm text-label-sm font-normal">Be specific for high-signal output</span>
            </label>
            <div className="relative">
              <textarea 
                id="promptInput"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. 5 harsh lessons learned after firing our first sales lead, why founder-led sales is non-negotiable before $1M ARR..."
                rows={4}
                className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-xl p-3.5 outline-none transition-all placeholder:text-outline resize-none shadow-inner border border-surface-container focus:border-primary"
              />
              {topic && (
                <button
                  type="button"
                  onClick={() => setTopic('')}
                  className="absolute right-3 bottom-3 text-on-surface-variant hover:text-on-surface p-1 rounded"
                  title="Clear topic"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                </button>
              )}
            </div>

            {/* Prompt Suggestions Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="font-label-sm text-label-sm text-on-surface-variant mr-1">Quick ideas:</span>
              <button 
                type="button"
                onClick={() => setTopic("The painful SaaS growth lesson that saved us 6 months of wasted runway: stop building features nobody asked for.")}
                className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-all"
              >
                SaaS growth lesson
              </button>
              <button 
                type="button"
                onClick={() => setTopic("3 mistakes founders make when hiring their first 10 engineers, and how hiring for curiosity beats pedigree every time.")}
                className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-all"
              >
                Hiring engineer mistakes
              </button>
              <button 
                type="button"
                onClick={() => setTopic("Practical AI adoption playbook: How our 15-person team saves 40+ hours per week using custom workflow automation.")}
                className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-all"
              >
                AI adoption playbook
              </button>
              <button 
                type="button"
                onClick={() => setTopic("The quiet truth about remote work in 2025: documentation isn't optional anymore, it's the entire company operating system.")}
                className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-all"
              >
                Remote work truth
              </button>
            </div>
          </div>

          {/* Tone Selector */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface flex items-center justify-between font-semibold">
              <span>Tone & Voice</span>
              <span className="font-label-sm text-label-sm text-primary font-bold">
                {selectedTone}
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { tone: 'Professional', icon: 'business_center' },
                { tone: 'Storytelling', icon: 'menu_book' },
                { tone: 'Controversial', label: 'Bold / Provocative', icon: 'bolt' },
                { tone: 'Informative', icon: 'insights' },
                { tone: 'Motivational', icon: 'rocket_launch' },
                { tone: 'Casual', icon: 'coffee' }
              ].map((item) => (
                <button
                  key={item.tone}
                  type="button"
                  onClick={() => setSelectedTone(item.tone as PostTone)}
                  className={`py-2 px-3 rounded-xl font-label-md text-label-md flex items-center gap-2 justify-center transition-all ${
                    selectedTone === item.tone
                      ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                  <span>{item.label || item.tone}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Post Length & Audience Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Post Length Selector */}
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md text-on-surface font-semibold">Target Length</label>
              <div className="flex bg-surface-container-low p-1 rounded-xl gap-1 border border-surface-container">
                <button
                  type="button"
                  onClick={() => setSelectedLength('short')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-label-sm text-label-sm text-center transition-all ${
                    selectedLength === 'short'
                      ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Short <span className="block opacity-75 text-[10px]">&lt;150w</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLength('medium')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-label-sm text-label-sm text-center transition-all ${
                    selectedLength === 'medium'
                      ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Medium <span className="block opacity-75 text-[10px]">150-400w</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLength('long')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-label-sm text-label-sm text-center transition-all ${
                    selectedLength === 'long'
                      ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Deep Dive <span className="block opacity-75 text-[10px]">500+w</span>
                </button>
              </div>
            </div>

            {/* Target Audience Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="audienceSelect">
                Audience Demographic
              </label>
              <div className="relative">
                <select 
                  id="audienceSelect"
                  value={selectedAudience}
                  onChange={(e) => setSelectedAudience(e.target.value)}
                  className="w-full appearance-none bg-surface-container-low text-on-surface font-body-md text-body-md rounded-xl px-3.5 py-2.5 outline-none cursor-pointer border border-surface-container focus:border-primary"
                >
                  <option value="Founders & C-Suite Execs">Founders & C-Suite Execs</option>
                  <option value="Software Engineers & Tech Leads">Software Engineers & Tech Leads</option>
                  <option value="B2B Growth & Performance Marketers">B2B Growth & Performance Marketers</option>
                  <option value="Product Managers & Designers">Product Managers & Designers</option>
                  <option value="Indie Hackers & Solo Founders">Indie Hackers & Solo Founders</option>
                  <option value="Students & Early Career Aspirants">Students & Early Career Aspirants</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-3 text-[18px] text-on-surface-variant pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Call-To-Action (CTA) input */}
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface flex items-center justify-between font-semibold">
              <span>Call to Action (CTA) Preset</span>
              <span className="text-on-surface-variant font-label-sm text-label-sm font-normal">Drives comments algorithmically</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { 
                  cta: "What has been your experience? Drop your thoughts in the comments 👇",
                  title: "Ask engaging question in comments",
                  icon: "forum"
                },
                { 
                  cta: "Drop a 'REPOST' and I'll send you our complete Notion template for free.",
                  title: "Lead magnet / Resource giveaway",
                  icon: "download"
                },
                { 
                  cta: "Repost this ♻️ if it resonates with your network, and follow for daily SaaS teardowns.",
                  title: "Viral repost & follow prompt",
                  icon: "repeat"
                }
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedCta(item.cta)}
                  className={`p-2.5 rounded-xl text-left font-label-sm text-label-sm transition-all flex items-start gap-2 border ${
                    selectedCta === item.cta
                      ? 'bg-surface-container border-primary text-primary font-bold shadow-xs'
                      : 'bg-surface-container-low border-surface-container text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[16px] mt-0.5 ${
                    selectedCta === item.cta ? 'text-primary' : 'text-on-surface-variant'
                  }`}>
                    {item.icon}
                  </span>
                  <span className="leading-tight">{item.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* VISUAL ASSET / IMAGE UPLOAD MODULE in Craft Your Narrative */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">add_photo_alternate</span>
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  Attached Post Visual / Image
                </span>
                <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold">
                  +42% Dwell Time
                </span>
              </div>

              {imageUrl && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-error hover:underline font-label-sm text-label-sm flex items-center gap-1 font-semibold"
                >
                  <span className="material-symbols-outlined text-[15px]">delete</span>
                  <span>Remove Image</span>
                </button>
              )}
            </div>

            {/* When image is attached: display thumbnail, caption, and controls */}
            {imageUrl ? (
              <div className="flex flex-col gap-3 bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="relative group shrink-0 w-24 h-20 rounded-lg overflow-hidden border border-surface-container bg-surface-container">
                    <img
                      src={imageUrl}
                      alt={imageCaption || 'Attached preview'}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      title="Click to view full preview"
                    >
                      <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col gap-1 w-full min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-label-sm text-label-sm text-on-surface font-bold truncate">
                        {imageFileName || 'Attached Visual Asset'}
                      </span>
                      <span className="font-mono-metric text-[11px] text-tertiary font-bold shrink-0">
                        Active in Feed
                      </span>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[11px] text-on-surface-variant font-label-sm mr-1">Aspect Ratio:</span>
                      {(['16:9', '1:1', '4:5', 'original'] as const).map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => setImageAspectRatio(ratio)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                            imageAspectRatio === ratio
                              ? 'bg-primary-container text-on-primary font-bold'
                              : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                          }`}
                        >
                          {ratio === 'original' ? 'Fit' : ratio}
                        </button>
                      ))}
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={imageCaption}
                        onChange={(e) => setImageCaption(e.target.value)}
                        placeholder="Image context / caption (e.g. SQLite Latency Chart)"
                        className="w-full bg-surface-container-low text-on-surface font-label-sm text-label-sm px-2.5 py-1.5 rounded-lg border border-surface-container outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-surface-container/60">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center gap-1 transition-colors font-medium"
                    >
                      <span className="material-symbols-outlined text-[15px]">sync</span>
                      <span>Replace</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center gap-1 transition-colors font-medium"
                    >
                      <span className="material-symbols-outlined text-[15px]">fullscreen</span>
                      <span>Zoom</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleExtractNarrativeFromVisual}
                    disabled={isExtractingFromImage}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-label-sm text-label-sm font-bold flex items-center gap-1.5 transition-colors disabled:opacity-60 ml-auto"
                  >
                    <span className={`material-symbols-outlined text-[16px] ${isExtractingFromImage ? 'animate-spin' : ''}`}>
                      {isExtractingFromImage ? 'progress_activity' : 'auto_awesome'}
                    </span>
                    <span>{isExtractingFromImage ? 'Analyzing Graphic...' : 'Extract Hook & Story from Image'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* When no image: provide Tabs for Upload, URL, and Curated Presets */
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setImageTab('upload')}
                    className={`flex-1 py-1 px-2.5 rounded-md font-label-sm text-label-sm font-semibold transition-all flex items-center justify-center gap-1 ${
                      imageTab === 'upload'
                        ? 'bg-surface-container-lowest text-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">upload_file</span>
                    <span>Upload Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('url')}
                    className={`flex-1 py-1 px-2.5 rounded-md font-label-sm text-label-sm font-semibold transition-all flex items-center justify-center gap-1 ${
                      imageTab === 'url'
                        ? 'bg-surface-container-lowest text-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">link</span>
                    <span>Image URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('presets')}
                    className={`flex-1 py-1 px-2.5 rounded-md font-label-sm text-label-sm font-semibold transition-all flex items-center justify-center gap-1 ${
                      imageTab === 'presets'
                        ? 'bg-surface-container-lowest text-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">grid_view</span>
                    <span>Presets (4)</span>
                  </button>
                </div>

                {/* Tab 1: Drag & Drop Upload Zone */}
                {imageTab === 'upload' && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
                      isDraggingOver
                        ? 'border-primary bg-primary/10'
                        : 'border-surface-container-high bg-surface-container-lowest hover:border-primary/60 hover:bg-surface-container'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileInputChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">cloud_upload</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        Click to upload or drag & drop image
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        PNG, JPG, WebP, SVG or GIF (Max 10MB)
                      </span>
                    </div>
                  </div>
                )}

                {/* Tab 2: Direct Image URL */}
                {imageTab === 'url' && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="https://example.com/chart-or-diagram.png"
                      className="flex-1 bg-surface-container-lowest text-on-surface font-body-md text-body-md px-3 py-2 rounded-xl border border-surface-container outline-none focus:border-primary placeholder:text-outline"
                    />
                    <button
                      type="button"
                      onClick={handleAttachUrl}
                      className="px-4 py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-bold hover:bg-primary transition-colors shadow-xs"
                    >
                      Attach
                    </button>
                  </div>
                )}

                {/* Tab 3: Curated Executive Presets */}
                {imageTab === 'presets' && (
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_VISUAL_ASSETS.map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className="group p-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container border border-surface-container hover:border-primary/50 cursor-pointer transition-all flex items-center gap-2"
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-11 h-11 rounded-lg object-cover shrink-0 ring-1 ring-surface-container"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-sm text-label-sm text-on-surface font-bold truncate group-hover:text-primary transition-colors">
                            {preset.name}
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-label-sm">
                            {preset.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Inclusion Features Switches */}
          <div className="p-3.5 bg-surface-container-low rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-surface-container">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={includeEmojis}
                onChange={(e) => setIncludeEmojis(e.target.checked)}
                className="w-4 h-4 rounded text-primary-container focus:ring-0 cursor-pointer accent-[#0a66c2]"
              />
              <span className="font-label-sm text-label-sm text-on-surface font-medium">Relevant Emojis</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={includeHashtags}
                onChange={(e) => setIncludeHashtags(e.target.checked)}
                className="w-4 h-4 rounded text-primary-container focus:ring-0 cursor-pointer accent-[#0a66c2]"
              />
              <span className="font-label-sm text-label-sm text-on-surface font-medium">3-5 Niche Hashtags</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={includeViralHook}
                onChange={(e) => setIncludeViralHook(e.target.checked)}
                className="w-4 h-4 rounded text-primary-container focus:ring-0 cursor-pointer accent-[#0a66c2]"
              />
              <span className="font-label-sm text-label-sm text-on-surface font-medium">High-Dwell Viral Hook</span>
            </label>
          </div>

          {/* Generate Button Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button 
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="relative group w-full py-3 px-6 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-headline-md text-headline-md flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] overflow-hidden disabled:opacity-75"
            >
              <span className={`material-symbols-outlined text-[20px] ${isGenerating ? 'animate-spin' : 'transition-transform group-hover:rotate-12'}`}>
                {isGenerating ? 'progress_activity' : 'auto_awesome'}
              </span>
              <span>{isGenerating ? 'Gemini 3.8 Generating Post...' : 'Generate with Gemini 3.8 Flash'}</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </button>
          </div>

          {/* Live Writing Tips Banner */}
          <div className="p-4 rounded-xl bg-primary-fixed/30 flex items-start gap-3 border border-primary-fixed">
            <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">tips_and_updates</span>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-primary-fixed font-bold">LinkedIn Algorithm Golden Rule:</span>
              <p className="font-label-sm text-label-sm text-on-primary-fixed-variant leading-relaxed">
                Your first 3 lines decide whether a user clicks <span className="font-bold text-primary">"…see more"</span>. Always place tension or a counter-intuitive observation above the fold line.
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL: Live Feed Preview & Unicode Formatter (Col 7-12) */}
        <section className="lg:col-span-6 flex flex-col gap-4">
          
          {/* Action & Formatting Workbench Bar */}
          <div className="bg-surface-container-lowest p-3 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3 border border-surface-container">
            
            {/* Unicode Formatter Buttons */}
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-surface-container">
              <span className="text-on-surface-variant px-2 font-mono-metric text-mono-metric">Unicode:</span>
              <button 
                type="button"
                onClick={() => applyUnicode('bold')}
                title="Convert selected text to 𝐁𝐨𝐥𝐝"
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center font-bold text-on-surface transition-colors font-headline-md text-headline-md"
              >
                𝐁
              </button>
              <button 
                type="button"
                onClick={() => applyUnicode('italic')}
                title="Convert selected text to 𝘐𝘵𝘢𝘭𝘪𝘤"
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center italic text-on-surface transition-colors font-headline-md text-headline-md"
              >
                𝘐
              </button>
              <button 
                type="button"
                onClick={() => applyUnicode('bullet')}
                title="Insert Bullet Point"
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface transition-colors font-bold"
              >
                •
              </button>
              <button 
                type="button"
                onClick={() => applyUnicode('quote')}
                title="Insert Quote Mark"
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface transition-colors"
              >
                ❝
              </button>
              <button 
                type="button"
                onClick={() => applyUnicode('clear')}
                title="Normalize unicode styling"
                className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">format_clear</span>
              </button>
            </div>

            {/* Utility Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <button 
                type="button"
                onClick={handleGenerate}
                title="Generate alternate draft"
                className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors flex items-center gap-1.5 font-label-sm text-label-sm font-semibold border border-surface-container"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span className="hidden sm:inline">Regenerate</span>
              </button>

              <button 
                type="button"
                onClick={handleSaveDraft}
                className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors flex items-center gap-1.5 font-label-sm text-label-sm font-semibold border border-surface-container"
              >
                <span className="material-symbols-outlined text-[16px]">bookmark</span>
                <span className="hidden sm:inline">Save Draft</span>
              </button>

              <button 
                type="button"
                onClick={handleCopy}
                className="py-2 px-3 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md flex items-center gap-1.5 hover:bg-primary transition-all shadow-sm font-semibold active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                <span>Copy Post</span>
              </button>
            </div>
          </div>

          {/* Gemini 3.8 Quick Polish Bar */}
          <div className="bg-surface-container-lowest p-2.5 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-2 border border-surface-container">
            <div className="flex items-center gap-1.5 text-label-sm font-semibold text-primary">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span className="font-bold whitespace-nowrap">Gemini Polish:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                disabled={isPolishing !== null}
                onClick={() => handleQuickPolish('Punchier Hook', 'Make the opening 3 lines significantly punchier with high tension, counter-intuitive contrast, or specific numbers to stop the mobile scroll')}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-surface-container-low hover:bg-primary-container hover:text-on-primary text-on-surface transition-colors flex items-center gap-1 border border-surface-container disabled:opacity-50"
              >
                <span>🔥</span>
                <span>{isPolishing === 'Punchier Hook' ? 'Polishing...' : 'Punchier Hook'}</span>
              </button>
              <button
                type="button"
                disabled={isPolishing !== null}
                onClick={() => handleQuickPolish('Executive Voice', 'Elevate vocabulary, remove fluff, and adopt an authoritative Fortune 500 CEO / Founder thought leadership tone')}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-surface-container-low hover:bg-primary-container hover:text-on-primary text-on-surface transition-colors flex items-center gap-1 border border-surface-container disabled:opacity-50"
              >
                <span>⚡</span>
                <span>{isPolishing === 'Executive Voice' ? 'Polishing...' : 'Executive Voice'}</span>
              </button>
              <button
                type="button"
                disabled={isPolishing !== null}
                onClick={() => handleQuickPolish('Mobile Tighten', 'Condense paragraphs into crisp 1-2 sentence lines, maximize line spacing and readability for LinkedIn mobile app feeds')}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-surface-container-low hover:bg-primary-container hover:text-on-primary text-on-surface transition-colors flex items-center gap-1 border border-surface-container disabled:opacity-50"
              >
                <span>📱</span>
                <span>{isPolishing === 'Mobile Tighten' ? 'Tightening...' : 'Mobile Tighten'}</span>
              </button>
              <button
                type="button"
                disabled={isPolishing !== null}
                onClick={() => handleQuickPolish('Contrarian Angle', 'Add an unapologetic, contrarian observation that challenges traditional conventional wisdom')}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-surface-container-low hover:bg-primary-container hover:text-on-primary text-on-surface transition-colors flex items-center gap-1 border border-surface-container disabled:opacity-50"
              >
                <span>💡</span>
                <span>{isPolishing === 'Contrarian Angle' ? 'Reframing...' : 'Contrarian Angle'}</span>
              </button>
              <button
                type="button"
                disabled={isPolishing !== null}
                onClick={() => handleQuickPolish('Viral CTA', 'Replace or refine the closing Call-To-Action into an engaging, low-friction question that drives massive comment thread velocity')}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-surface-container-low hover:bg-primary-container hover:text-on-primary text-on-surface transition-colors flex items-center gap-1 border border-surface-container disabled:opacity-50"
              >
                <span>🎯</span>
                <span>{isPolishing === 'Viral CTA' ? 'Upgrading...' : 'Viral CTA'}</span>
              </button>
            </div>
          </div>

          {/* Real-Time Metrics Strip */}
          <div className="bg-surface-container-lowest px-4 py-2.5 rounded-xl shadow-sm border border-surface-container grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
            <div>
              <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                <span>Characters</span>
                <span className="font-mono-metric text-on-surface font-bold">
                  {charCount.toLocaleString()} / 3,000
                </span>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    charPct > 85 ? 'bg-error' : 'bg-primary-container'
                  }`} 
                  style={{ width: `${charPct}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-on-surface-variant font-label-sm text-label-sm">Read Time</span>
              <span className="font-mono-metric text-mono-metric text-on-surface font-bold">
                ~{readSeconds} sec read
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-on-surface-variant font-label-sm text-label-sm">Readability</span>
              <span className="inline-flex items-center gap-1 text-tertiary font-label-sm text-label-sm font-bold">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                {gradeLevel}
              </span>
            </div>

            <div className="flex items-center justify-end">
              <button 
                type="button"
                onClick={() => setIsFoldGuideVisible(!isFoldGuideVisible)}
                className="text-primary hover:underline font-label-sm text-label-sm flex items-center gap-1 font-semibold"
              >
                <span className="material-symbols-outlined text-[14px]">visibility</span>
                <span>{isFoldGuideVisible ? 'Hide Fold Guide' : 'Show "See more" Fold'}</span>
              </button>
            </div>
          </div>

          {/* AUTHENTIC LINKEDIN FEED PREVIEW CARD */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-md border border-surface-container overflow-hidden relative transition-all">
            
            {/* Card Header Bar */}
            <div className="p-4 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <img 
                  alt="Alex Morgan avatar" 
                  className="w-12 h-12 rounded-full object-cover shadow-sm ring-1 ring-surface-container" 
                  src={AVATAR_URL}
                />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-title-sm text-title-sm text-on-surface font-bold hover:underline cursor-pointer">
                      Alex Morgan
                    </h3>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">• 1st</span>
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant leading-tight max-w-sm line-clamp-1">
                    Founder & CEO @ ScaleFlow | Sharing AI & B2B Growth Lessons
                  </p>
                  <div className="flex items-center gap-1 text-on-surface-variant text-[11px] mt-0.5">
                    <span>1m • Edited •</span>
                    <span className="material-symbols-outlined text-[12px]">public</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => {
                    setIsFollowed(!isFollowed);
                    showToast(isFollowed ? 'Unfollowed profile' : 'Following Alex Morgan');
                  }}
                  className={`hidden sm:flex items-center gap-1 font-label-md text-label-md font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                    isFollowed 
                      ? 'bg-surface-container text-on-surface' 
                      : 'text-primary hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{isFollowed ? 'check' : 'add'}</span>
                  <span>{isFollowed ? 'Following' : 'Follow'}</span>
                </button>
                <button 
                  type="button"
                  aria-label="More options" 
                  className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
              </div>
            </div>

            {/* Cutoff Fold Indicator Line */}
            {isFoldGuideVisible && (
              <div className="relative w-full my-1 animate-fadeIn">
                <div className="border-b-2 border-dashed border-amber-400 w-full"></div>
                <span className="absolute right-4 -top-2.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono-metric text-[10px] font-bold shadow-xs">
                  ⚡ LinkedIn "...see more" cutoff (~210 chars)
                </span>
              </div>
            )}

            {/* Post Content Area (Interactive & Directly Editable) */}
            <div className="px-4 py-2">
              <label htmlFor="postEditableArea" className="sr-only">Live editable LinkedIn post content</label>
              <textarea
                id="postEditableArea"
                ref={postTextareaRef}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={imageUrl ? 8 : 11}
                className="w-full font-body-feed text-body-feed text-on-surface outline-none whitespace-pre-wrap leading-relaxed select-text focus:bg-surface-container-low/30 rounded-lg p-2 transition-colors resize-y bg-transparent"
                placeholder="Write your LinkedIn post here..."
              />
            </div>

            {/* Authentic LinkedIn Attached Media / Visual Asset */}
            {imageUrl ? (
              <div className="relative group mx-4 mb-3 rounded-xl overflow-hidden border border-surface-container bg-surface-container-low shadow-xs transition-all">
                <div className="relative overflow-hidden flex items-center justify-center bg-black/5 dark:bg-black/40">
                  <img
                    src={imageUrl}
                    alt={imageCaption || 'Attached LinkedIn post media'}
                    className={`w-full transition-all duration-300 ${
                      imageAspectRatio === '16:9' ? 'aspect-video object-cover' :
                      imageAspectRatio === '1:1' ? 'aspect-square object-cover' :
                      imageAspectRatio === '4:5' ? 'aspect-[4/5] object-cover' :
                      'max-h-[460px] object-contain'
                    }`}
                  />

                  {/* Hover Overlay Controls on Image in Feed Card */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-surface/90 hover:bg-surface text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-md backdrop-blur-xs transition-transform active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">fullscreen</span>
                      <span>Expand Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-surface/90 hover:bg-surface text-on-surface font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-md backdrop-blur-xs transition-transform active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      <span>Change</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-1.5 rounded-lg bg-error/90 hover:bg-error text-white font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-md backdrop-blur-xs transition-transform active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                {/* Caption Bar underneath attached image */}
                {imageCaption && (
                  <div className="px-3.5 py-2 bg-surface-container-lowest border-t border-surface-container flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                    <span className="truncate flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">image</span>
                      <span className="font-medium text-on-surface">{imageCaption}</span>
                    </span>
                    <span className="text-[11px] opacity-75 font-mono-metric shrink-0 ml-2">
                      {imageAspectRatio}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* If no image attached, offer a subtle 1-click prompt */
              <div className="mx-4 mb-2 p-2.5 rounded-xl border border-dashed border-surface-container-high bg-surface-container-low/50 hover:bg-surface-container-low transition-colors flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[18px] text-primary">add_photo_alternate</span>
                  <span>Add visual framework to simulate an authentic media post (+42% dwell)</span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-label-sm text-label-sm font-bold border border-surface-container transition-all"
                >
                  + Upload
                </button>
              </div>
            )}

            {/* Engagement Stats Bar */}
            <div className="px-4 py-2 mt-1 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm border-b border-surface-container-low">
              <div className="flex items-center gap-1.5">
                <span className="flex -space-x-1 items-center">
                  <span className="w-4 h-4 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-[9px] shadow-xs">👍</span>
                  <span className="w-4 h-4 rounded-full bg-error text-on-primary flex items-center justify-center text-[9px] shadow-xs">❤️</span>
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-on-primary flex items-center justify-center text-[9px] shadow-xs">💡</span>
                </span>
                <span className="hover:text-primary hover:underline cursor-pointer font-medium">
                  {reactionsCount}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="hover:text-primary hover:underline cursor-pointer">42 comments</span>
                <span>•</span>
                <span className="hover:text-primary hover:underline cursor-pointer">14 reposts</span>
              </div>
            </div>

            {/* LinkedIn Authentic Action Row */}
            <div className="px-2 py-1 grid grid-cols-4 gap-1 text-on-surface-variant">
              <button 
                type="button"
                onClick={toggleLike}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg hover:bg-surface-container font-label-md text-label-md transition-colors group ${
                  isPostLiked ? 'text-primary font-bold' : 'text-on-surface-variant'
                }`}
              >
                <span 
                  className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform"
                  style={{ fontVariationSettings: isPostLiked ? "'FILL' 1" : "'FILL' 0" }}
                >
                  thumb_up
                </span>
                <span className="font-medium">{isPostLiked ? 'Liked' : 'Like'}</span>
              </button>

              <button 
                type="button"
                onClick={() => showToast('Simulated LinkedIn comment drawer')}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg hover:bg-surface-container font-label-md text-label-md transition-colors text-on-surface-variant group"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">comment</span>
                <span className="font-medium">Comment</span>
              </button>

              <button 
                type="button"
                onClick={() => showToast('Simulated repost action')}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg hover:bg-surface-container font-label-md text-label-md transition-colors text-on-surface-variant group"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">repeat</span>
                <span className="font-medium">Repost</span>
              </button>

              <button 
                type="button"
                onClick={() => showToast('Simulated send via message')}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg hover:bg-surface-container font-label-md text-label-md transition-colors text-on-surface-variant group"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">send</span>
                <span className="font-medium">Send</span>
              </button>
            </div>
          </div>

          {/* Quick Jump to Hook Library & Prompt Inspiration */}
          <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-surface-container">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">psychology_alt</span>
              <div>
                <p className="font-title-sm text-title-sm text-on-surface font-bold">Need a high-converting opener?</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Browse 120+ viral hook frameworks curated by top creators.</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={onExploreHooks}
              className="px-3.5 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary font-label-md text-label-md transition-all shadow-xs font-semibold"
            >
              Explore Hooks
            </button>
          </div>

        </section>
      </div>

      {/* High-Resolution Image Lightbox Modal */}
      {isLightboxOpen && imageUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div 
            className="relative max-w-4xl w-full bg-surface-container-lowest rounded-2xl overflow-hidden shadow-2xl border border-surface-container flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-surface-container flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-[22px]">photo_library</span>
                <div>
                  <h3 className="font-title-sm text-title-sm text-on-surface font-bold">
                    {imageCaption || imageFileName || 'Attached LinkedIn Post Visual'}
                  </h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Aspect Ratio: {imageAspectRatio} • Full Resolution Platform Preview
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const win = window.open();
                    win?.document.write(`<img src="${imageUrl}" style="max-width:100%; height:auto;" />`);
                  }}
                  className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
                  title="Open image in tab"
                >
                  <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
                  title="Close modal"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Modal Image Body */}
            <div className="p-4 bg-black/20 flex items-center justify-center max-h-[70vh] overflow-auto">
              <img
                src={imageUrl}
                alt={imageCaption || 'High resolution view'}
                className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain shadow-md"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-surface-container-low border-t border-surface-container flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-bold">
                  High Dwell-Time Asset
                </span>
                <span className="text-on-surface-variant text-label-sm">
                  Displays seamlessly in desktop feed & mobile apps
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="px-4 py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-bold hover:bg-primary transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
