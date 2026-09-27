import { GoogleGenAI } from '@google/genai';
import { PostTone, TargetLength, PostAuditMetrics } from '../types';

interface GenerationParams {
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
  apiKey?: string;
  temperature?: number;
}

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
    apiKey,
    temperature = 0.7
  } = params;

  const keyToUse = apiKey || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined);

  if (keyToUse && keyToUse !== 'MY_GEMINI_API_KEY' && keyToUse.trim().length > 10) {
    try {
      const ai = new GoogleGenAI({ apiKey: keyToUse.trim() });
      const wordCountConstraint = length === 'short' 
        ? 'under 150 words' 
        : length === 'medium' 
        ? 'between 180 and 320 words (the exact LinkedIn sweet spot)' 
        : 'between 400 and 550 words';

      const imageContext = imageUrl 
        ? `\nAttached Visual Asset: An image / framework infographic is attached to this LinkedIn post.${imageCaption ? ` Image Caption/Context: "${imageCaption}".` : ''} Explicitly reference the attached visual framework naturally in the post (e.g. "Take a look at the breakdown below 👇" or "The diagram below maps this out:").`
        : '';

      const prompt = `You are a world-class LinkedIn thought leadership ghostwriter for Fortune 500 executives, top founders, and technical leaders.
Generate a high-converting, viral LinkedIn post based on these exact constraints:

Core Topic / Story: ${topic || 'Why most founders fail in their first 90 days'}
Tone & Voice: ${tone}
Target Audience: ${audience}
Target Length: ${wordCountConstraint}
Call To Action: ${cta}
Include Emojis: ${includeEmojis ? 'Yes, tasteful high-signal emojis' : 'No emojis at all'}
Include Hashtags: ${includeHashtags ? 'Yes, 3-5 relevant niche hashtags at the bottom' : 'No hashtags'}
Include High-Dwell Viral Hook: ${includeViralHook ? 'Crucial: First 2-3 lines must be a high-tension cliffhanger that stops the scroll before LinkedIn "...see more" cutoff.' : 'Standard opening'}${imageContext}

Formatting Rules for LinkedIn Algorithm Optimization:
1. First 3 lines must have intense tension, counter-intuitive contrast, or specific numbers.
2. Generous line breaks. Maximum 1-2 sentences per paragraph to maximize dwell-time on mobile.
3. Use bullet points or arrows for scannability.
4. Bold key headings using mathematical unicode bold if appropriate.
5. End with the specified Call to Action.

Do NOT include any preamble, introduction, markdown quotes, or closing explanations. Output ONLY the raw post text ready to publish.`;

      // Check if image is a base64 data url for multimodality
      let contents: any = prompt;
      if (imageUrl && imageUrl.startsWith('data:image/')) {
        const match = imageUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (match) {
          contents = [
            {
              inlineData: {
                mimeType: match[1],
                data: match[2]
              }
            },
            { text: prompt }
          ];
        }
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          temperature
        }
      });

      if (response.text && response.text.trim().length > 50) {
        return response.text.trim();
      }
    } catch (err) {
      console.warn('Gemini API call failed or key invalid, using algorithmic generator:', err);
    }
  }

  // High-performance algorithmic fallback engine
  return generateAlgorithmicPost(params);
}

export function generateAlgorithmicPost(params: GenerationParams): string {
  const { topic, tone, length, cta, includeEmojis, includeHashtags, imageUrl, imageCaption } = params;
  const cleanTopic = topic.trim() || 'early-stage SaaS founders building things nobody pays for';

  const emoji = (symbol: string) => includeEmojis ? symbol : '';

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

export async function generateViralHooks(topic: string, angle: string, apiKey?: string): Promise<string[]> {
  const keyToUse = apiKey || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined);

  if (keyToUse && keyToUse !== 'MY_GEMINI_API_KEY' && keyToUse.trim().length > 10) {
    try {
      const ai = new GoogleGenAI({ apiKey: keyToUse.trim() });
      const prompt = `Generate 5 viral 3-line LinkedIn openers (hooks) optimized for dwell-time and the "...see more" cutoff.
Topic: "${topic || 'B2B Growth and SaaS engineering'}"
Psychological Angle: "${angle}"

Requirements:
- Each hook must have 2 to 3 lines.
- First line: High-tension cliffhanger or contrarian fact under 90 characters.
- Second/Third line: Intriguing setup that forces the reader to tap "...see more".
- Output ONLY the 5 hooks separated by '---'. Do not output any numbering or preamble.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      if (response.text) {
        const splits = response.text.split('---').map(s => s.trim()).filter(s => s.length > 20);
        if (splits.length >= 3) {
          return splits.slice(0, 5);
        }
      }
    } catch (err) {
      console.warn('Gemini Hook generation failed, using algorithmic fallbacks:', err);
    }
  }

  // Algorithmic fallbacks
  const t = topic.trim() || 'scaling B2B SaaS without paid ads';
  return [
    `90% of founders fail at ${t}. Here is the 10% playbook:\n\nMost people think it takes 80-hour workweeks and VC millions.\nThe actual secret is painfully simple:`,
    `Unpopular opinion: Stop doing ${t} the way everyone else does.\n\n99% of conventional playbooks are outdated 2021 tactics.\nHere is what top 1% operators actually do instead:`,
    `I spent 4 years building the wrong system for ${t}. Here are 5 lessons I wish I knew earlier:\n\nIn 2021, our runway evaporated to $4,200. I was forced to face the hardest truth of my career...`,
    `The biggest lie in tech right now about ${t}:\n\nOnce you see how the algorithm actually rewards this, you can never go back.`,
    `How we cracked ${t} with $0 budget (steal this exact 4-part skeleton):\n\nNo marketing agency. No cold spam emails. Just a simple 3-pillar audience flywheel:`
  ];
}

export function auditDraftPost(content: string): PostAuditMetrics {
  const text = (content || '').trim();
  const charCount = text.length;
  const words = text ? text.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const readTimeSec = Math.max(12, Math.ceil(wordCount / 3.6));

  // Extract hashtags
  const hashtags = (text.match(/#\w+/g) || []).map(t => t.trim());

  // Split lines
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const firstLine = lines[0] || '';
  const first3Lines = lines.slice(0, 3).join(' ');

  // Calculate Hook Strength
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

  // Calculate Readability (Flesch simulated)
  const avgWordLen = wordCount > 0 ? text.replace(/\s+/g, '').length / wordCount : 4.5;
  const fleschGrade = Math.max(5.2, Math.min(10.5, parseFloat((avgWordLen * 1.3).toFixed(1))));
  const readabilityScore = Math.min(98, Math.max(60, Math.round(100 - (fleschGrade - 5) * 5)));

  // Fold Status check
  const foldStatus: 'safe' | 'warning' | 'cutoff' = first3Lines.length <= 220 ? 'safe' : 'warning';

  // Reach Velocity
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
