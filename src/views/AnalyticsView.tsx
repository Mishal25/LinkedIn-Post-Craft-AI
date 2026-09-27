import React, { useState } from 'react';
import { calculateReadTime } from '../utils/unicode';

interface AnalyticsViewProps {
  showToast: (msg: string) => void;
  onSendToEditor: (content: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  showToast,
  onSendToEditor
}) => {
  const sampleAuditContent = `90% of founders fail their first LinkedIn launch. Not because their product sucks. But because their first line puts readers to sleep.

Here are 3 subtle hook frameworks I used to drive 4.2M organic impressions without spending $1 on sponsored slots:

1. The Counter-Intuitive Truth
Start with a stance people whisper about privately, but hesitate to endorse publicly.

2. The Compression of Time
Show the 5-year lesson summarized in a 45-second read.

3. The Open Narrative Loop
Break your first sentence mid-thought right before LinkedIn's dynamic cutoff fold.

Which formula feels most natural for your voice?

#Founders #GrowthStrategy #CreatorEconomy #SaaS`;

  const [auditText, setAuditText] = useState(sampleAuditContent);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditHasImage, setAuditHasImage] = useState(true);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'quarterly'>('weekly');
  const [calendarViewGridOpen, setCalendarViewGridOpen] = useState(false);

  const { words, readSeconds, gradeLevel } = calculateReadTime(auditText);
  const charCount = auditText.length;

  // Real-time calculated audit metrics based on text
  const hasStrongOpening = auditText.includes('%') || auditText.toLowerCase().includes('here are') || auditText.toLowerCase().includes('stop');
  const hookScore = hasStrongOpening ? 88 : 72;
  const readabilityScore = words > 50 && words < 350 ? 94 : 80;
  const reachVelocity = hasStrongOpening ? '+35%' : '+18%';
  const tagsFound = (auditText.match(/#\w+/g) || ['#Founders', '#GrowthStrategy', '#CreatorEconomy', '#SaaS']).slice(0, 5);

  const handleReevaluate = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      showToast('Audited unreleased draft against viral algorithmic triggers!');
    }, 700);
  };

  const handleLoadSample = () => {
    setAuditText(sampleAuditContent);
    showToast('Loaded sample draft into radar');
  };

  const handleClear = () => {
    setAuditText('');
    showToast('Cleared audit radar');
  };

  // Trajectory datasets
  const trajectoryData = {
    weekly: {
      points: "M0,165 C60,150 120,130 180,95 C240,60 300,110 360,80 C420,50 480,70 540,30 C600,20 650,45 700,15",
      todayImpressions: "148.2k",
      totalReach: "542,190",
      totalReachLift: "+24.8% vs last cycle",
      inboundTaps: "11,840",
      inboundLift: "+18.2% conversion",
      dwellFactor: "4.82x",
      ticks: ["Oct 04", "Oct 11", "Oct 18", "Oct 25", "Nov 01", "Today (148.2k)"]
    },
    monthly: {
      points: "M0,175 C80,160 160,120 240,110 C320,85 400,95 480,50 C560,35 620,40 700,20",
      todayImpressions: "420.5k",
      totalReach: "1,894,300",
      totalReachLift: "+38.4% vs last month",
      inboundTaps: "38,420",
      inboundLift: "+29.1% conversion",
      dwellFactor: "5.15x",
      ticks: ["Aug", "Sep", "Oct", "Nov", "Dec", "Today (420.5k)"]
    },
    quarterly: {
      points: "M0,185 C90,170 180,140 270,120 C360,90 450,75 540,40 C630,25 660,30 700,10",
      todayImpressions: "1.24M",
      totalReach: "5,410,000",
      totalReachLift: "+62.7% vs last year",
      inboundTaps: "112,900",
      inboundLift: "+44.3% conversion",
      dwellFactor: "5.80x",
      ticks: ["Q1", "Q2", "Q3", "Q4", "Rolling", "Today (1.24M)"]
    }
  };

  const currentDataset = trajectoryData[timeframe];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-[1560px] mx-auto flex flex-col gap-6">
      
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex flex-col gap-1 max-w-3xl">
          <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-tertiary"></span>
            <span className="font-bold">ANALYTICS • WORKBENCH AUDIT</span>
            <span className="text-outline">•</span>
            <span className="text-primary font-mono-metric text-mono-metric font-bold">LIVE ENGINE v2.4</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
            LinkedIn Creator Performance & Post Optimization Insights
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Audit unreleased drafts against viral algorithmic triggers, benchmark tone-dwell velocity, and verify release cadence.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-surface-container-low px-4 py-2 rounded-xl flex items-center gap-3 shadow-xs border border-surface-container">
            <span className="material-symbols-outlined text-[20px] text-tertiary">schedule</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Optimal Peak Window</span>
              <span className="font-title-sm text-title-sm text-on-surface font-bold">Tue & Thu • 8:30 AM EST</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleReevaluate}
            disabled={isAuditing}
            className="flex items-center gap-2 bg-primary-container text-on-primary px-4 py-2.5 rounded-xl font-label-md text-label-md shadow-md hover:bg-primary transition-all active:scale-95 font-bold disabled:opacity-75"
          >
            <span className={`material-symbols-outlined text-[20px] ${isAuditing ? 'animate-spin' : ''}`}>
              {isAuditing ? 'refresh' : 'auto_fix_high'}
            </span>
            <span>{isAuditing ? 'Analyzing Dwell...' : 'Re-evaluate Draft'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 cols) */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          
          {/* Pre-Publishing Quality Radar Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">troubleshoot</span>
                </span>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Pre-Publishing Quality Radar</h2>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Simulate dwell algorithm response before hitting broadcast</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={handleLoadSample}
                  className="px-2.5 py-1 bg-surface-container-low text-on-surface-variant rounded-lg font-label-sm text-label-sm hover:bg-surface-container transition-colors font-medium border border-surface-container"
                >
                  Load Sample Draft
                </button>
                <button 
                  type="button"
                  onClick={handleClear}
                  className="px-2.5 py-1 bg-surface-container-low text-on-surface-variant rounded-lg font-label-sm text-label-sm hover:bg-surface-container transition-colors font-medium border border-surface-container"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Input area */}
            <div className="relative flex flex-col">
              <label className="sr-only" htmlFor="postAuditInput">Post Content to Audit</label>
              <textarea 
                id="postAuditInput"
                value={auditText}
                onChange={(e) => setAuditText(e.target.value)}
                placeholder="Paste your pending LinkedIn post draft here to test hook friction, readability indexes, unicode styling balance, and hashtag distribution..."
                rows={7}
                className="w-full bg-surface-container-low rounded-xl p-4 font-body-feed text-body-feed text-on-surface placeholder:text-outline outline-none focus:bg-surface-container-lowest transition-all resize-none shadow-inner border border-surface-container focus:border-primary"
              />

              <div className="mt-2 flex items-center justify-between font-mono-metric text-mono-metric text-on-surface-variant px-1 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span>{charCount.toLocaleString()} / 3,000 characters</span>
                  <span>{words} words</span>
                  <span className="flex items-center gap-1 text-tertiary font-bold">
                    <span className="material-symbols-outlined text-[14px]">timer</span>
                    <span>~{readSeconds}s read time</span>
                  </span>
                </div>
                <span className="text-tertiary bg-surface-container-high px-2 py-0.5 rounded-md font-label-sm text-label-sm font-bold">
                  Fold Safe: 2 Lines Above Cut
                </span>
              </div>
            </div>

            {/* 4 Diagnostic Gauges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Hook Strength */}
              <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col gap-2 border border-surface-container">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-on-surface font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-primary">visibility</span>
                    Hook Strength
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container font-mono-metric text-mono-metric font-bold">
                    {hookScore}/100
                  </span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-tertiary-container h-full rounded-full transition-all duration-500" style={{ width: `${hookScore}%` }}></div>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                  <span>Curiosity Gap: High</span>
                  <span className="text-tertiary font-bold">Strong Hook Friction</span>
                </div>
              </div>

              {/* Formatting & Readability */}
              <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col gap-2 border border-surface-container">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-on-surface font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-secondary">format_list_bulleted</span>
                    Formatting & Readability
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-mono-metric text-mono-metric font-bold">
                    {readabilityScore}/100
                  </span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-primary-container h-full rounded-full transition-all duration-500" style={{ width: `${readabilityScore}%` }}></div>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                  <span>Flesch Grade: {gradeLevel.split(' ')[1] || '6.8'}</span>
                  <span className="text-primary font-bold">Clean Spacing & Bullets</span>
                </div>
              </div>

              {/* Predicted Reach Velocity */}
              <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col gap-1 border border-surface-container">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-on-surface font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-tertiary">trending_up</span>
                    Predicted Reach Velocity
                  </span>
                  <span className="font-mono-metric text-mono-metric text-tertiary font-bold text-base">
                    {reachVelocity}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant leading-tight mt-1">
                  Above median algorithmic lift. First 90 minutes trajectory modeled at ~1,400 dwell units.
                </p>
              </div>

              {/* Hashtag Density Check */}
              <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col gap-1.5 border border-surface-container">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-on-surface font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-secondary">tag</span>
                    Hashtag Density Check
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-mono-metric text-mono-metric font-bold">
                    {tagsFound.length} Tags
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {tagsFound.map((tag, i) => (
                    <span key={i} className="text-label-sm font-label-sm px-2 py-0.5 rounded-md bg-surface-container text-primary font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-on-surface-variant font-label-sm text-label-sm">Optimal tier: 3 to 5 thematic tags</span>
              </div>

              {/* Visual Asset & Media Check */}
              <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col gap-2 border border-surface-container">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-on-surface font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-primary">add_photo_alternate</span>
                    Visual Framework Multiplier
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuditHasImage(!auditHasImage);
                      showToast(auditHasImage ? 'Simulated text-only post' : 'Attached visual framework simulation (+42% dwell boost)');
                    }}
                    className={`px-2.5 py-0.5 rounded-full font-mono-metric text-mono-metric font-bold transition-all text-[11px] ${
                      auditHasImage 
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed' 
                        : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    {auditHasImage ? '📸 Media Attached' : 'No Media'}
                  </button>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                  <span>Dwell-Time Impact:</span>
                  <span className={`font-bold ${auditHasImage ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {auditHasImage ? '+42% Predicted Dwell Lift' : 'Baseline 1.0x Dwell'}
                  </span>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant leading-relaxed">
                  {auditHasImage 
                    ? 'Architecture diagrams & retention charts trigger 3.1x higher bookmark rates and mobile scroll stops.'
                    : 'Recommendation: Attach a 16:9 benchmark chart or architecture diagram to increase feed CTR.'}
                </p>
              </div>
            </div>

            {/* Quick Action: Send to Studio */}
            <div className="pt-2 flex justify-end">
              <button 
                type="button"
                onClick={() => {
                  onSendToEditor(auditText);
                  showToast('Draft sent to Generator studio for publishing!');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container text-primary font-label-md text-label-md font-bold hover:bg-primary-container hover:text-on-primary transition-all border border-surface-container"
              >
                <span>Edit in Interactive Studio</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Impression Volume Trajectory Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Impression Volume Trajectory</h2>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Cumulative and organic impressions indexed over rolling 30 days</p>
              </div>

              {/* Timeframe Toggles */}
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-surface-container">
                <button 
                  type="button"
                  onClick={() => setTimeframe('weekly')}
                  className={`px-3 py-1 rounded-lg font-label-sm text-label-sm transition-all ${
                    timeframe === 'weekly'
                      ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Weekly
                </button>
                <button 
                  type="button"
                  onClick={() => setTimeframe('monthly')}
                  className={`px-3 py-1 rounded-lg font-label-sm text-label-sm transition-all ${
                    timeframe === 'monthly'
                      ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Monthly
                </button>
                <button 
                  type="button"
                  onClick={() => setTimeframe('quarterly')}
                  className={`px-3 py-1 rounded-lg font-label-sm text-label-sm transition-all ${
                    timeframe === 'quarterly'
                      ? 'bg-surface-container-lowest text-primary shadow-xs font-bold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Quarterly
                </button>
              </div>
            </div>

            {/* SVG Chart Graphic */}
            <div className="w-full flex flex-col gap-2">
              <div className="h-56 w-full relative flex items-end">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 200">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#0a66c2" stopOpacity="0.3"></stop>
                      <stop offset="100%" stopColor="#0a66c2" stopOpacity="0.0"></stop>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line stroke="#eaedff" strokeWidth="1" x1="0" x2="700" y1="180" y2="180" />
                  <line stroke="#eaedff" strokeWidth="1" x1="0" x2="700" y1="120" y2="120" />
                  <line stroke="#eaedff" strokeWidth="1" x1="0" x2="700" y1="60" y2="60" />

                  {/* Gradient Area Fill */}
                  <path 
                    d={`${currentDataset.points} L700,200 L0,200 Z`}
                    fill="url(#chartGradient)"
                    className="transition-all duration-700"
                  />

                  {/* Main Stroke Path */}
                  <path 
                    d={currentDataset.points}
                    fill="none" 
                    stroke="#0a66c2" 
                    strokeLinecap="round" 
                    strokeWidth="3.5"
                    className="transition-all duration-700"
                  />

                  {/* Circles on Key Coordinates */}
                  <circle cx="180" cy="95" fill="#004e99" r="4" />
                  <circle cx="360" cy="80" fill="#004e99" r="4" />
                  <circle cx="540" cy="30" fill="#004e99" r="4" />
                  <circle cx="700" cy="15" fill="#007650" r="6" className="animate-pulse" />
                </svg>
              </div>

              {/* Date Ticks */}
              <div className="flex justify-between items-center text-on-surface-variant font-mono-metric text-mono-metric pt-1">
                {currentDataset.ticks.map((tick, i) => (
                  <span key={i} className={i === currentDataset.ticks.length - 1 ? 'text-tertiary font-bold' : ''}>
                    {tick}
                  </span>
                ))}
              </div>
            </div>

            {/* 3 Metric Summary Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col border border-surface-container">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Total Organic Reach</span>
                <span className="font-title-sm text-title-sm text-on-surface font-bold text-lg">{currentDataset.totalReach}</span>
                <span className="text-tertiary font-label-sm text-label-sm flex items-center gap-0.5 mt-0.5 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span> {currentDataset.totalReachLift}
                </span>
              </div>

              <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col border border-surface-container">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Profile Inbound Taps</span>
                <span className="font-title-sm text-title-sm text-on-surface font-bold text-lg">{currentDataset.inboundTaps}</span>
                <span className="text-tertiary font-label-sm text-label-sm flex items-center gap-0.5 mt-0.5 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span> {currentDataset.inboundLift}
                </span>
              </div>

              <div className="bg-surface-container-low p-3.5 rounded-xl flex flex-col border border-surface-container">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Follower Dwell Factor</span>
                <span className="font-title-sm text-title-sm text-on-surface font-bold text-lg">{currentDataset.dwellFactor}</span>
                <span className="text-primary font-label-sm text-label-sm flex items-center gap-0.5 mt-0.5 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">insights</span> Benchmark 2.1x
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          
          {/* Top Performing Post Tones Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-1">
              <span className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-secondary shadow-xs">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
              </span>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Top Performing Post Tones</h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Audience resonance categorized by semantic classification</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Storytelling Narrative */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center font-label-md text-label-md">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary-container"></span>
                    <span className="text-on-surface font-bold">Storytelling Narrative</span>
                  </div>
                  <span className="font-mono-metric text-mono-metric font-bold text-on-surface">42%</span>
                </div>
                <div className="w-full bg-surface-container-low h-3 rounded-full overflow-hidden">
                  <div className="bg-primary-container h-full rounded-full transition-all duration-500" style={{ width: '42%' }}></div>
                </div>
                <span className="text-on-surface-variant font-label-sm text-label-sm">High repost velocity & inbound private messages</span>
              </div>

              {/* Informative Playbooks */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center font-label-md text-label-md">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-tertiary-container"></span>
                    <span className="text-on-surface font-bold">Informative Playbooks</span>
                  </div>
                  <span className="font-mono-metric text-mono-metric font-bold text-on-surface">31%</span>
                </div>
                <div className="w-full bg-surface-container-low h-3 rounded-full overflow-hidden">
                  <div className="bg-tertiary-container h-full rounded-full transition-all duration-500" style={{ width: '31%' }}></div>
                </div>
                <span className="text-on-surface-variant font-label-sm text-label-sm">Highest save rate and PDF download triggers</span>
              </div>

              {/* Contrarian Debates */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center font-label-md text-label-md">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-secondary"></span>
                    <span className="text-on-surface font-bold">Contrarian Debates</span>
                  </div>
                  <span className="font-mono-metric text-mono-metric font-bold text-on-surface">27%</span>
                </div>
                <div className="w-full bg-surface-container-low h-3 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full transition-all duration-500" style={{ width: '27%' }}></div>
                </div>
                <span className="text-on-surface-variant font-label-sm text-label-sm">Generates deep comment debates (+3.4x average replies)</span>
              </div>
            </div>
          </div>

          {/* Best Engagement by Post Length Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-1">
              <span className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary shadow-xs">
                <span className="material-symbols-outlined text-[20px]">bar_chart</span>
              </span>
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Best Engagement by Post Length</h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Median Click-Through & Dwell Index vs Word Bracket</p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* < 100 words */}
              <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">&lt; 100 words</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Micro status updates</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-outline h-full" style={{ width: '32%' }}></div>
                  </div>
                  <span className="font-mono-metric text-mono-metric text-on-surface w-14 text-right font-medium">2.1% CTR</span>
                </div>
              </div>

              {/* 150 - 300 words (Peak CTR) */}
              <div className="p-3 bg-surface-container-high rounded-xl flex items-center justify-between relative overflow-hidden border border-primary/20 shadow-xs">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container"></div>
                <div className="flex flex-col pl-2">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md text-on-surface font-bold">150 - 300 words</span>
                    <span className="bg-primary-container text-on-primary text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase">Peak CTR</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-primary font-bold">Sweet spot for mobile viewport fold</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-surface-container-low h-2 rounded-full overflow-hidden">
                    <div className="bg-primary-container h-full" style={{ width: '92%' }}></div>
                  </div>
                  <span className="font-mono-metric text-mono-metric text-primary font-bold w-14 text-right">6.9% CTR</span>
                </div>
              </div>

              {/* 300 - 500 words */}
              <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">300 - 500 words</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Detailed breakdowns</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full" style={{ width: '68%' }}></div>
                  </div>
                  <span className="font-mono-metric text-mono-metric text-on-surface w-14 text-right font-medium">4.5% CTR</span>
                </div>
              </div>

              {/* 500+ words */}
              <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">500+ words</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Longform essays</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-outline h-full" style={{ width: '44%' }}></div>
                  </div>
                  <span className="font-mono-metric text-mono-metric text-on-surface w-14 text-right font-medium">3.1% CTR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Asset & Media Format Performance Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">photo_library</span>
                </span>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Visual Format & Media Impact</h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Dwell-time & repost correlation by media attachment</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-mono-metric text-[11px] font-bold">
                +42% Reach Lift
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-1.5">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Infographics / Charts</span>
                <span className="font-headline-md text-headline-md text-primary font-bold">9.2% CTR</span>
                <span className="text-[11px] text-tertiary font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">arrow_upward</span> +178% Dwell Time
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-1.5">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Architecture / Diagrams</span>
                <span className="font-headline-md text-headline-md text-primary font-bold">8.4% CTR</span>
                <span className="text-[11px] text-tertiary font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">arrow_upward</span> 3.1x Save Rate
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-1.5">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Text-Only Baseline</span>
                <span className="font-headline-md text-headline-md text-on-surface font-bold">4.2% CTR</span>
                <span className="text-[11px] text-on-surface-variant font-medium">Standard baseline</span>
              </div>
            </div>
          </div>

          {/* Weekly Content Schedule Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-sm border border-surface-container flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-tertiary shadow-xs">
                  <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                </span>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Weekly Content Schedule</h3>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Planned distribution pipeline & queue</p>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => {
                  setCalendarViewGridOpen(!calendarViewGridOpen);
                  showToast('Toggled full weekly scheduler grid');
                }}
                className="text-primary font-label-md text-label-md hover:underline flex items-center gap-0.5 font-bold"
              >
                <span>View Grid</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>

            {/* 7-Day Day Pills */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              <div className="flex flex-col gap-1 p-2 rounded-xl bg-surface-container-low border border-surface-container">
                <span className="font-label-sm text-label-sm text-on-surface-variant">MON</span>
                <span className="font-mono-metric text-mono-metric font-bold text-on-surface">11</span>
                <div className="h-1.5 w-1.5 rounded-full bg-outline self-center mt-1"></div>
              </div>

              <div className="flex flex-col gap-1 p-2 rounded-xl bg-primary-fixed shadow-xs border border-primary-fixed">
                <span className="font-label-sm text-label-sm text-on-primary-fixed font-bold">TUE</span>
                <span className="font-mono-metric text-mono-metric font-bold text-on-primary-fixed">12</span>
                <div className="h-2 w-2 rounded-full bg-primary-container self-center mt-0.5 ring-2 ring-surface-container-lowest"></div>
              </div>

              <div className="flex flex-col gap-1 p-2 rounded-xl bg-surface-container-low border border-surface-container">
                <span className="font-label-sm text-label-sm text-on-surface-variant">WED</span>
                <span className="font-mono-metric text-mono-metric font-bold text-on-surface">13</span>
                <div className="h-1.5 w-1.5 rounded-full bg-outline self-center mt-1"></div>
              </div>

              <div className="flex flex-col gap-1 p-2 rounded-xl bg-primary-fixed shadow-xs border border-primary-fixed">
                <span className="font-label-sm text-label-sm text-on-primary-fixed font-bold">THU</span>
                <span className="font-mono-metric text-mono-metric font-bold text-on-primary-fixed">14</span>
                <div className="h-2 w-2 rounded-full bg-primary-container self-center mt-0.5 ring-2 ring-surface-container-lowest"></div>
              </div>

              <div className="flex flex-col gap-1 p-2 rounded-xl bg-surface-container-low border border-surface-container">
                <span className="font-label-sm text-label-sm text-on-surface-variant">FRI</span>
                <span className="font-mono-metric text-mono-metric font-bold text-on-surface">15</span>
                <div className="h-1.5 w-1.5 rounded-full bg-tertiary self-center mt-1"></div>
              </div>

              <div className="flex flex-col gap-1 p-2 rounded-xl bg-surface-container-lowest opacity-60 border border-surface-container">
                <span className="font-label-sm text-label-sm text-on-surface-variant">SAT</span>
                <span className="font-mono-metric text-mono-metric text-on-surface-variant">16</span>
                <span className="text-[10px] text-outline mt-0.5">-</span>
              </div>

              <div className="flex flex-col gap-1 p-2 rounded-xl bg-surface-container-lowest opacity-60 border border-surface-container">
                <span className="font-label-sm text-label-sm text-on-surface-variant">SUN</span>
                <span className="font-mono-metric text-mono-metric text-on-surface-variant">17</span>
                <span className="text-[10px] text-outline mt-0.5">-</span>
              </div>
            </div>

            {/* Scheduled slots */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-2 py-1 rounded-lg bg-surface-container-high font-mono-metric text-mono-metric text-primary font-bold text-center leading-tight">
                    TUE<br />8:30a
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-title-sm text-title-sm text-on-surface font-bold truncate">
                      3 subtle hook frameworks for organic reach
                    </span>
                    <span className="font-label-sm text-label-sm text-tertiary flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span> Ready • Storytelling
                    </span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => showToast('Options: Edit schedule, Re-draft, Cancel')}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-[18px]">more_vert</span>
                </button>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-2 py-1 rounded-lg bg-surface-container-high font-mono-metric text-mono-metric text-primary font-bold text-center leading-tight">
                    THU<br />8:30a
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-title-sm text-title-sm text-on-surface font-bold truncate">
                      Why 80% of B2B lead forms are bleeding pipeline
                    </span>
                    <span className="font-label-sm text-label-sm text-secondary flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[14px]">edit_note</span> In Review • Contrarian
                    </span>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => showToast('Options: Edit schedule, Re-draft, Cancel')}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-[18px]">more_vert</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
