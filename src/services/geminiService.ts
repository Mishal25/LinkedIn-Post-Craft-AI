import { PostTone, TargetLength, PostAuditMetrics } from '../types';

export interface GenerationParams {
  topic: string;
  tone: PostTone;
  length: TargetLength;
  audience: string;
  cta: string;
  includeEmojis: boolean;
  includeHashtags: boolean;
  includeViralHook: boolean;
  imageUrl?: string;
  imageCaption?: string;
  temperature?: number;
}

export interface ImageAnalysisResult {
  visualTitle: string;
  coreTakeaway: string;
  keyPoints: string[];
  suggestedHook: string;
  suggestedPostDraft: string;
}

export interface GeminiStatus {
  ok: boolean;
  hasKey: boolean;
  model: string;
}

/**
 * Checks server-side Gemini API connectivity and configuration.
 */
export async function checkGeminiStatus(): Promise<GeminiStatus> {
  try {
    const res = await fetch('/api/gemini/status');
    if (res.ok) {
      const data = await res.json();
      return {
        ok: true,
        hasKey: Boolean(data.hasKey),
        model: data.model || 'gemini-3.8-flash'
      };
    }
  } catch (err) {
    console.warn('Could not query Gemini status endpoint:', err);
  }
  return { ok: false, hasKey: false, model: 'gemini-3.8-flash' };
}

/**
 * Generates an executive LinkedIn post using the server-side Gemini 3.8 Flash model.
 * Seamlessly falls back to the algorithmic generator if server-side Gemini is unreachable.
 */
export async function generateLinkedInPost(params: GenerationParams): Promise<string> {
  const {
    topic,
    tone,
    length,
    audience,
    cta,
    includeEmojis,
    includeHashtags,
    includeViralHook,
    imageUrl,
    imageCaption,
    temperature = 0.7
  } = params;

  try {
    const res = await fetch('/api/gemini/generate-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        tone,
        length,
        audience,
        cta,
        includeEmojis,
        includeHashtags,
        includeViralHook,
        imageUrl,
        imageCaption,
        temperature
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.post && data.post.trim().length > 30) {
        return data.post.trim();
      }
    }
  } catch (err) {
    console.warn('Server Gemini generate-post call error, falling back to algorithmic engine:', err);
  }

  // High-performance algorithmic fallback engine
  return generateAlgorithmicPost(params);
}

/**
 * Generates 5 viral, high-dwell LinkedIn openers (hooks) using Gemini 3.8 Flash.
 */
export async function generateViralHooks(topic: string, angle: string): Promise<string[]> {
  try {
    const res = await fetch('/api/gemini/generate-hooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, angle })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.hooks) && data.hooks.length > 0) {
        return data.hooks;
      }
    }
  } catch (err) {
    console.warn('Server Gemini generate-hooks call error, using curated patterns:', err);
  }

  // Algorithmic hook fallback
  const t = topic.trim() || 'scaling B2B SaaS without paid ads';
  return [
    `90% of founders fail at ${t}. Here is the 10% playbook:\n\nMost people think it takes 80-hour workweeks and VC millions.\nThe actual secret is painfully simple:`,
    `Unpopular opinion: Stop doing ${t} the way everyone else does.\n\n99% of conventional playbooks are outdated 2021 tactics.\nHere is what top 1% operators actually do instead:`,
    `I spent 4 years building the wrong system for ${t}. Here are 5 lessons I wish I knew earlier:\n\nIn 2021, our runway evaporated to $4,200. I was forced to face the hardest truth of my career...`,
    `The biggest lie in tech right now about ${t}:\n\nOnce you see how the algorithm actually rewards this, you can never go back.`,
    `How we cracked ${t} with $0 budget (steal this exact 4-part skeleton):\n\nNo marketing agency. No cold spam emails. Just a simple 3-pillar audience flywheel:`
  ];
}

/**
 * Multimodal image analysis using Gemini 3.8 Flash.
 * Extracts key strategic points, narrative hooks, and publish-ready LinkedIn copy from an infographic or chart.
 */
export async function analyzeVisualWithGemini(imageUrl: string, context?: string): Promise<ImageAnalysisResult | null> {
  try {
    const res = await fetch('/api/gemini/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, context })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.data) {
        return data.data as ImageAnalysisResult;
      }
    }
  } catch (err) {
    console.warn('Server Gemini analyze-image error:', err);
  }
  return null;
}

/**
 * Rewrites and polishes an existing LinkedIn post draft using Gemini 3.8 Flash.
 */
export async function improvePostWithGemini(postContent: string, instruction: string): Promise<string> {
  try {
    const res = await fetch('/api/gemini/improve-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postContent, instruction })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.improvedPost) {
        return data.improvedPost.trim();
      }
    }
  } catch (err) {
    console.warn('Server Gemini improve-post error:', err);
  }
  return postContent;
}

/**
 * Algorithmic generator fallback with verified executive templates.
 */
export function generateAlgorithmicPost(params: GenerationParams): string {
  const { topic, tone, length, cta, includeEmojis, includeHashtags, imageUrl, imageCaption } = params;
  const cleanTopic = topic.trim() || 'early-stage SaaS founders building things nobody pays for';

  const hookTemplates: Record<string, string[]> = {
    Storytelling: [
      `90% of early-stage SaaS founders waste 4 months building things nobody will ever pay for.\n\nI made this exact $65,000 mistake in 2023.\n\nHere is the 3-step validation framework we now use before touching a single line of code:`,
      `In 2021, I managed a team of 14 high-performers.\nBy 2022, 5 of them had silently checked out.\n\nI thought they wanted higher salaries.\nI was completely wrong.\n\nHere is the uncomfortable lesson about micro-management that changed our culture forever:`,
      `We spent 9 months building a feature everyone said they wanted.\n\nWe launched on a Tuesday.\nFirst week active users: exactly 4.\n\nHere is what happens when you listen to polite opinions instead of tracking actual purchase intent:`
    ],
    Controversial: [
      `Unpopular opinion: 95% of LinkedIn personal branding is hollow noise.\n\nYou don't need:\n❌ Carousels explaining basic arithmetic\n❌ "I interviewed 50 billionaires" threads\n❌ Fluffy motivational platitudes\n\nHere is what actually builds eight-figure pipeline authority:`,
      `Stop offering free 30-day pilots to enterprise clients.\n\nWhen you charge $0, you receive:\n→ $0 of executive priority\n→ $0 implementation urgency\n→ Zero respect for your engineering team's calendar\n\nCommitment follows currency. If they won't pay $500 for proof, they will never sign a $50,000 contract:`,
      `The biggest trap in modern tech: Building a complex distributed architecture for a problem that could be solved with a single SQLite database.\n\nComplexity is not sophistication.\nComplexity is technical debt with good PR.`
    ],
    Professional: [
      `Quarterly audit on operational AI deployment efficiency across our portfolio:\n\nOver the last 90 days, we evaluated automated workflow pipelines across 3 core departments.\nHere are the validated benchmark outcomes:`,
      `Most executive leadership teams focus entirely on top-of-funnel customer acquisition.\n\nYet our audited telemetry shows that 68% of contract churn occurs in the first 14 days of post-sale onboarding.\n\nHere is the 4-phase onboarding cadence we implemented:`,
      `Regarding: "${cleanTopic}"\n\nA strategic breakdown of why traditional execution playbooks are deteriorating in 2025:`
    ],
    Informative: [
      `How we scaled our infrastructure to handle 4.2M daily events with zero downtime:\n\nNo multi-million dollar cloud bill.\nNo bloated microservices maze.\n\nHere is the step-by-step engineering playbook:`,
      `5 non-obvious metrics that predict whether a B2B startup will hit $10M ARR or stall at $1.5M:\n\n(Spoiler: It is NOT your CAC payback period)\n\nLet's break down the actual indicators:`
    ],
    Motivational: [
      `You are only one uncomfortable conversation away from your next breakthrough.\n\nEvery time our company hit a multi-month plateau, the bottleneck wasn't marketing.\nIt was a tough conversation we were putting off.\n\nHere are 3 truths every ambitious builder needs to hear today:`,
      `Don't let people who gave up on their dreams talk you out of yours.\n\nWhen we launched, 8 out of 10 people warned us the market was "too crowded".\nToday, those same 8 people ask for advice on how we carved out our niche.`
    ],
    Casual: [
      `Hot take after a cup of morning coffee:\n\nMost meetings could have been an email.\nMost emails could have been a 2-minute Loom.\nAnd most Looms could have been a clear decision made by someone empowered to take ownership.\n\nHere is how we killed meeting bloat:`
    ]
  };

  const pool = hookTemplates[tone] || hookTemplates.Storytelling;
  let hook = pool[Math.floor(Math.random() * pool.length)];

  if (topic.trim() && !hook.includes(topic.trim())) {
    hook = hook.replace('early-stage SaaS founders', cleanTopic);
  }

  let body = '';
  if (length === 'short') {
    body = `1. ${includeEmojis ? '🎯 ' : ''}The Pain Interview:
Talk to 15 real users. Do not pitch. Ask them what spreadsheet caused them the most agony this week.

2. ${includeEmojis ? '⚡ ' : ''}The Lo-Fi Pre-Sale:
Build a simple Notion page or Loom demo. If you can't collect 3 pre-orders, software won't save you.

Building is cheap now.
True distribution clarity is the only durable moat.`;
  } else if (length === 'long') {
    body = `Here is the comprehensive breakdown:

1. 𝐓𝐡𝐞 𝐏𝐚𝐢𝐧 𝐈𝐧𝐭𝐞𝐫𝐯𝐢𝐞𝐰:
Talk to 20 potential users. Do not pitch. Ask them what task in their current week made them want to slam their laptop shut.
Document their exact words and phrases. Those exact sentences will become your future landing page copy.

2. 𝐓𝐡𝐞 𝐋𝐨-𝐅𝐢 𝐏𝐫𝐞-𝐒𝐚𝐥𝐞:
Build a simple Notion page or Loom video. If you can't get 3 pre-orders with zero product, writing 10,000 lines of React code won't save you.
Commitment is measured in dollars deposited, not polite "sounds cool" feedback.

3. 𝐓𝐡𝐞 𝐖𝐨𝐫𝐤𝐟𝐥𝐨𝐰 𝐈𝐧𝐭𝐞𝐠𝐫𝐚𝐭𝐢𝐨𝐧:
If your tool doesn't replace an existing messy spreadsheet or painful manual process, people will churn in 14 days.
Frictionless migration is the number one driver of net revenue retention.

4. 𝐓𝐡𝐞 𝐀𝐮𝐝𝐢𝐞𝐧𝐜𝐞 𝐅𝐥𝐲𝐰𝐡𝐞𝐞𝐥:
Document the building process publicly every single week.
Share the real churn metrics, the technical bugs, and the pricing shifts.
Executives trust builders with visible battle scars over anonymous corporate brochures.

Building software is remarkably accessible in 2025.
Distribution and true problem clarity is the actual moat that endures.`;
  } else {
    body = `1. 𝐓𝐡𝐞 𝐏𝐚𝐢𝐧 𝐈𝐧𝐭𝐞𝐫𝐯𝐢𝐞𝐰:
Talk to 20 potential users. Do not pitch. Ask them what task in their current week made them want to slam their laptop shut.

2. 𝐓𝐡𝐞 𝐋𝐨-𝐅𝐢 𝐏𝐫𝐞-𝐒𝐚𝐥𝐞:
Build a simple Notion page or Loom video. If you can’t get 3 pre-orders with zero product, software won't save you.

3. 𝐓𝐡𝐞 𝐖𝐨𝐫𝐤𝐟𝐥𝐨𝐰 𝐈𝐧𝐭𝐞𝐠𝐫𝐚𝐭𝐢𝐨𝐧:
If your tool doesn't replace an existing messy spreadsheet, people will churn in 14 days.

Building software is cheap now.
Distribution and true problem clarity is the actual moat.`;
  }

  const ctaLine = cta || 'What has been your experience? Drop your thoughts in the comments 👇';

  const visualAnchor = imageUrl 
    ? `\n\n(See full breakdown in the graphic attached below ⬇️${imageCaption ? ` • ${imageCaption}` : ''})`
    : '';

  const hashtags = includeHashtags 
    ? '\n\n#GenerativeAI #StartupLessons #Leadership #Productivity #SaaS' 
    : '';

  return `${hook}\n\n${body}${visualAnchor}\n\n${ctaLine}${hashtags}`;
}

/**
 * Audits post mechanics, character and word counts, hook friction, and readability.
 */
export function auditDraftPost(content: string): PostAuditMetrics {
  const text = (content || '').trim();
  const charCount = text.length;
  const words = text ? text.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const readTimeSec = Math.max(12, Math.ceil(wordCount / 3.6));

  const hashtags = (text.match(/#\w+/g) || []).map(t => t.trim());
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const firstLine = lines[0] || '';
  const first3Lines = lines.slice(0, 3).join(' ');

  let hookScore = 75;
  if (/^\d+%|^Unpopular opinion|^Stop |^How we |^I spent |^The biggest lie/i.test(firstLine)) {
    hookScore += 16;
  }
  if (firstLine.includes(':') || firstLine.includes('?') || firstLine.includes('—')) {
    hookScore += 6;
  }
  if (first3Lines.length > 50 && first3Lines.length < 240) {
    hookScore += 5;
  }
  hookScore = Math.min(99, Math.max(50, hookScore));

  const avgWordLen = wordCount > 0 ? text.replace(/\s+/g, '').length / wordCount : 4.5;
  const fleschGrade = Math.max(5.2, Math.min(10.5, parseFloat((avgWordLen * 1.3).toFixed(1))));
  const readabilityScore = Math.min(98, Math.max(60, Math.round(100 - (fleschGrade - 5) * 5)));

  const foldStatus: 'safe' | 'warning' | 'cutoff' = first3Lines.length <= 220 ? 'safe' : 'warning';
  const reachVelocityPct = Math.round(20 + (hookScore - 70) * 0.7);
  const dwellUnits = Math.round(wordCount * 14.5 + hookScore * 2);

  return {
    charCount,
    wordCount,
    readTimeSec,
    hookStrengthScore: hookScore,
    hookCategory: hookScore > 85 ? 'Strong Hook Friction' : 'Moderate Curiosity Gap',
    readabilityScore,
    fleschGrade,
    reachVelocityPct,
    dwellUnits,
    hashtags: hashtags.length > 0 ? hashtags : ['#Founders', '#GrowthStrategy', '#CreatorEconomy', '#SaaS'],
    foldStatus
  };
}
