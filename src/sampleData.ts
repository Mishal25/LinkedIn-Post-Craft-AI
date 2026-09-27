import { DraftPost, ViralHook } from './types';

export const INITIAL_DRAFTS: DraftPost[] = [
  {
    id: 'draft-1',
    title: '95% of AI startups are building wrappers.',
    hook: `95% of AI startups are building wrappers destined to die in 12 months.

Here is the uncomfortable breakdown no VC will say out loud on Twitter:

If your value prop can be duplicated in a single OpenAI prompt release, you do not own a software company. You own a feature demo.`,
    fullContent: `95% of AI startups are building wrappers destined to die in 12 months.

Here is the uncomfortable breakdown no VC will say out loud on Twitter:

If your value prop can be duplicated in a single OpenAI prompt release, you do not own a software company. You own a feature demo.

Here are the 3 defensible moats that actually survive the next 24 months:

1. Proprietary Workflow State
Users must create persistent context inside your system. If switching costs are zero minutes, churn approaches 100%.

2. Multi-Player Collaboration
Single-player tools get displaced overnight. Tools with shared team permissions and real-time audit trails become structural infrastructure.

3. Low-Level System Integrations
Connect directly to messy internal databases, proprietary warehouses, and legacy CRMs that foundation models cannot crawl.

Software isn't dead. Thin wrappers with $20/mo subscriptions are.

What is your take? Are LLM feature releases killing vertical SaaS or expanding it? 👇

#GenerativeAI #VentureCapital #StartupStrategy #SaaS #TechLeadership`,
    tone: 'Contrarian Analytical',
    targetAudience: 'Tech Founders & VCs',
    status: 'Ready to Post',
    date: 'May 14',
    charCount: 1142,
    wordCount: 168,
    tags: ['#GenerativeAI', '#VentureCapital', '#StartupStrategy', '#SaaS'],
    hookScore: 94,
    readabilityGrade: 'Grade 6.8',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Defensible Moat Breakdown vs. LLM Wrapper Architecture'
  },
  {
    id: 'draft-2',
    title: 'I quit my $340k Big Tech job without a safety net.',
    hook: `I quit my $340k Big Tech job without a safety net.

My manager thought I was having a mid-career crisis.

He wasn't completely wrong. But staying inside a golden handcuff spreadsheet was silently killing my craft.

Here are the 4 counter-intuitive rules that got me to $20k MRR in 90 days:`,
    fullContent: `I quit my $340k Big Tech job without a safety net.

My manager thought I was having a mid-career crisis.

He wasn't completely wrong. But staying inside a golden handcuff spreadsheet was silently killing my craft.

Here are the 4 counter-intuitive rules that got me to $20k MRR in 90 days:

1. Kill the Perfectionist Reflex
In Big Tech, you spend 6 weeks writing an RFC for a database column. In early-stage bootstrapped life, you ship before you feel comfortable.

2. Audience Before Architecture
Do not write code until you have 10 people in your DMs pleading for a solution to their exact daily headache.

3. Sell Outcomes, Not Tooling
Nobody buys "vector databases" or "distributed caches". They buy 4 hours of their weekend back with their family.

4. Ruthless Distribution Discipline
Building product is 30% of the game. The other 70% is showing up daily with high-density insights in public.

Leaving tech security was terrifying. But building something you actually own is priceless.

Have you ever considered making the leap to solo building? What held you back?

#Engineering #CareerGrowth #Startups #Solopreneur #RemoteWork`,
    tone: 'Story-Driven Vulnerable',
    targetAudience: 'Engineers',
    status: 'Scheduled',
    scheduledTime: 'Tomorrow 8:15 AM EST',
    date: 'May 13',
    charCount: 1490,
    wordCount: 215,
    tags: ['#Engineering', '#CareerGrowth', '#Startups', '#RemoteWork'],
    hookScore: 96,
    readabilityGrade: 'Grade 6.2'
  },
  {
    id: 'draft-3',
    title: 'How we reduced API latency by 82% using local vectors.',
    hook: `How we reduced API latency by 82% using local vectors.

Architecture diagrams usually lie. Benchmarks don't.

We migrated 4.2 million user session queries from external API calls to an in-process SQLite vector engine.

The benchmark breakdown:
→ P99 went from 1,240ms to 220ms
→ Cloud bill dropped by $8,400/mo`,
    fullContent: `How we reduced API latency by 82% using local vectors.

Architecture diagrams usually lie. Benchmarks don't.

We migrated 4.2 million user session queries from external API calls to an in-process SQLite vector engine.

The benchmark breakdown:
→ P99 went from 1,240ms to 220ms
→ Cloud bill dropped by $8,400/mo
→ Uptime reached 99.98% over 60 days

Here is the exact technical blueprint we implemented:

1. In-Memory Embeddings Indexing
Rather than firing a network round-trip for static document chunks, we serialize semantic weights directly into local NVMe storage.

2. Hybrid Lexical + Vector Search
Exact keyword matching handles 65% of queries with 0ms neural latency. Only ambiguous queries route to heavy semantic passes.

3. Client-Side Quantization
We compressed embeddings from FP32 down to INT8 with less than 0.8% loss in top-5 retrieval accuracy.

Simplicity beats distributed complexity every single time.

Drop a comment if you'd like our open-source benchmark repo. 🚀

#SystemArchitecture #Performance #Databases #AIEngineering #SoftwareEngineering`,
    tone: 'Tactical Framework',
    targetAudience: 'Architects',
    status: 'Draft',
    date: 'May 11',
    charCount: 860,
    wordCount: 135,
    tags: ['#SystemArchitecture', '#Performance', '#AIEngineering'],
    hookScore: 89,
    readabilityGrade: 'Grade 7.4',
    imageUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'P99 Latency & SQLite In-Process Vector Engine Benchmark'
  },
  {
    id: 'draft-4',
    title: 'Most B2B SaaS onboarding funnels have a catastrophic leak.',
    hook: `Most B2B SaaS onboarding funnels have a catastrophic leak.

It is NOT your pricing page.
It is NOT your credit card barrier.

It is the empty dashboard screen on first login.

When a customer pays you $500/month and lands on an empty state with zero pre-populated telemetry, they experience buyer remorse within 18 seconds.`,
    fullContent: `Most B2B SaaS onboarding funnels have a catastrophic leak.

It is NOT your pricing page.
It is NOT your credit card barrier.

It is the empty dashboard screen on first login.

When a customer pays you $500/month and lands on an empty state with zero pre-populated telemetry, they experience buyer remorse within 18 seconds.

Here is the 3-step "Instant Gratification" onboarding fix:

1. Interactive Sandbox Mode
Pre-fill the workspace with realistic sample projects and dynamic analytics so they see what success feels like immediately.

2. The 90-Second Win
Guide them to complete one single, tangible micro-task before asking them to connect teammates or configure SSO.

3. Automated Success Proof
Send a trigger email 10 minutes after first login celebrating their first completed workflow with concrete time-saved metrics.

Activation isn't about teaching software features. It's about delivering emotional relief quickly.

What is the best SaaS onboarding experience you've tested this year?

#B2BMarketing #ProductManagement #CustomerSuccess #GrowthHacking #SaaS`,
    tone: 'Executive Authority',
    targetAudience: 'Growth VPs',
    status: 'Ready to Post',
    date: 'May 10',
    charCount: 1280,
    wordCount: 175,
    tags: ['#B2BMarketing', '#ProductManagement', '#SaaS'],
    hookScore: 92,
    readabilityGrade: 'Grade 6.5'
  },
  {
    id: 'draft-5',
    title: 'Stop optimizing for LinkedIn impressions.',
    hook: `Stop optimizing for LinkedIn impressions.

Optimize for direct executive InMails instead.

10,000 views from junior lurkers = $0 pipeline.
3 views from Fortune 500 Chief Information Security Officers = $480,000 ARR contract.`,
    fullContent: `Stop optimizing for LinkedIn impressions.

Optimize for direct executive InMails instead.

10,000 views from junior lurkers = $0 pipeline.
3 views from Fortune 500 Chief Information Security Officers = $480,000 ARR contract.

The difference between vanity creator reach and pipeline authority:

• Vanity content tells people "what" to think.
• Authority content demonstrates "how" you solved an expensive, painful failure inside production.

Executives do not hire loud cheerleaders.
They hire calm surgeons who have seen the disaster before and fixed it under pressure.

Write for the 5 decision-makers who can sign six-figure purchase orders, not the crowd looking for generic motivation.

Agree or disagree?

#B2BSales #ExecutiveLeadership #EnterpriseGrowth #Pipeline`,
    tone: 'Executive Authority',
    targetAudience: 'B2B Founders',
    status: 'Draft',
    date: 'May 08',
    charCount: 690,
    wordCount: 110,
    tags: ['#B2BSales', '#ExecutiveLeadership', '#EnterpriseGrowth'],
    hookScore: 95,
    readabilityGrade: 'Grade 6.0'
  },
  {
    id: 'draft-6',
    title: "Design systems don't save time if nobody adopts them.",
    hook: `Design systems don't save time if nobody adopts them.

Most design teams make one critical mistake:
They build a cathedral when the engineering team just needed a hammer.

In 2024, our team killed 80% of our custom tokens and refactored into primitive semantic styles.`,
    fullContent: `Design systems don't save time if nobody adopts them.

Most design teams make one critical mistake:
They build a cathedral when the engineering team just needed a hammer.

In 2024, our team killed 80% of our custom tokens and refactored into primitive semantic styles.

The immediate results:
✓ Pull request review cycle dropped by 45%
✓ Zero token naming debates during sprint planning
✓ Frontend engineers actually embraced the component library

The golden rule of design tooling:
If an engineer has to look up token documentation for more than 15 seconds, they will hardcode arbitrary hex codes in CSS.

Design systems are not art exhibitions. They are developer velocity accelerators.

How do you maintain design system adoption in your organization?

#DesignSystems #ProductDesign #Frontend #UXUI #TechCulture`,
    tone: 'Tactical Framework',
    targetAudience: 'Design Leads',
    status: 'Scheduled',
    scheduledTime: 'Friday 12:30 PM EST',
    date: 'May 04',
    charCount: 1030,
    wordCount: 155,
    tags: ['#DesignSystems', '#ProductDesign', '#Frontend'],
    hookScore: 91,
    readabilityGrade: 'Grade 6.4'
  }
];

export const CURATED_HOOKS: ViralHook[] = [
  {
    id: 'hook-1',
    category: 'data',
    categoryLabel: 'Data & Stat Hooks',
    viralityScore: 98,
    testedImpressions: 'Tested on 120k+ impressions',
    hookText: '90% of founders fail at this. Here is the 10% playbook:',
    subText: 'Most people think it takes 80-hour workweeks and VC millions. The actual secret is painfully simple...',
    foldImpact: 'Extremely High (Cliffhanger)',
    fullSample: `90% of founders fail at this. Here is the 10% playbook:

Most people think it takes 80-hour workweeks and VC millions.
The actual secret is painfully simple: Stop optimizing product before distribution.

Here are the 4 non-negotiables we followed:
1. Talk to 20 users before writing line 1 of code
2. Pre-sell the mockup on a simple 1-page Loom
3. Ruthlessly automate the messy manual back-office
4. Track retention cohorts, not vanity social clicks

What's the #1 operational trap you survived early on?

#StartupLessons #Founders #B2BGrowth #SaaS`,
    bookmarked: false
  },
  {
    id: 'hook-2',
    category: 'vulnerability',
    categoryLabel: 'Personal Failure to Success',
    viralityScore: 96,
    testedImpressions: 'High empathy dwell',
    hookText: 'I spent 4 years building the wrong product. Here are 5 lessons I wish I knew:',
    subText: 'In 2021, our runway evaporated to $4,200. I was forced to face the hardest truth of my career...',
    foldImpact: 'Emotional Hook',
    fullSample: `I spent 4 years building the wrong product. Here are 5 lessons I wish I knew:

In 2021, our runway evaporated to $4,200.
I was forced to face the hardest truth of my career: We built what we loved, not what anyone was willing to pay for.

Here is what changing our entire playbook unlocked in 6 months:
• Shifted from generic productivity to hyper-niche legal document compliance
• Cut feature count from 42 down to 3 core workflows
• Tripled contract pricing from $29/mo to $499/mo

Never fall in love with your solution. Fall obsessed with their specific pain point.

${'What pivot saved your business? Drop your story below 👇'}

#FounderStories #Entrepreneurship #Resilience #LessonsLearned`,
    bookmarked: true
  },
  {
    id: 'hook-3',
    category: 'contrarian',
    categoryLabel: 'Contrarian / Bold',
    viralityScore: 95,
    testedImpressions: 'Viral comment multiplier',
    hookText: 'Unpopular opinion: Stop reading 50 business books a year. Do this instead:',
    subText: '99% of business books are 1 blog post stretched across 280 repetitive pages. Here is how top operators actually learn...',
    foldImpact: 'Controversy Trigger',
    fullSample: `Unpopular opinion: Stop reading 50 business books a year. Do this instead:

99% of business books are 1 blog post stretched across 280 repetitive pages.
Here is how top operators actually learn:

1. Audit 10 real companies' public financial disclosures & earnings calls
2. Reverse-engineer top competitors' landing page evolutions using Wayback Machine
3. Buy an hour of consulting with a retired VP who did the exact job 10 years ago

Actionable battle-testing beats theoretical business school literature every single time.

Agree or disagree?

#ExecutiveMindset #LifelongLearning #Productivity #BusinessStrategy`,
    bookmarked: false
  },
  {
    id: 'hook-4',
    category: 'curiosity',
    categoryLabel: 'Curiosity Gap',
    viralityScore: 93,
    testedImpressions: 'High share rate',
    hookText: 'The biggest lie in tech right now is that AI replaces experience.',
    subText: 'Over the last 6 months, we observed junior devs generate 10x code, but senior architects debug 100x disasters...',
    foldImpact: 'Disbelief Anchor',
    fullSample: `The biggest lie in tech right now is that AI replaces experience.

Over the last 6 months, we observed junior devs generate 10x code, but senior architects debug 100x disasters.

Here is the quiet reality of AI-assisted engineering:
→ Code generation velocity has exploded
→ System architecture complexity has doubled
→ Production triage and security intuition is now 5x more valuable

Junior developers who learn architecture fundamentals will lead this decade.
Those who only copy-paste prompts without comprehension will be displaced.

How has AI shifted your engineering team's review process?

#ArtificialIntelligence #SoftwareEngineering #TechCareers #Leadership`,
    bookmarked: false
  },
  {
    id: 'hook-5',
    category: 'listicle',
    categoryLabel: 'Numbered / Listicle',
    viralityScore: 97,
    testedImpressions: 'Top save metric',
    hookText: 'How we scaled to $100k MRR with 0 ad spend (steal this framework):',
    subText: 'No marketing agency. No cold spam emails. Just a simple 3-pillar LinkedIn audience flywheel...',
    foldImpact: 'Framework Value Promise',
    fullSample: `How we scaled to $100k MRR with 0 ad spend (steal this framework):

No marketing agency. No cold spam emails. Just a simple 3-pillar LinkedIn audience flywheel:

Pillar 1: The "Behind-The-Scenes" Teardown
Share exact internal dashboards, churn spikes, and pricing experiments. Radical transparency earns executive trust.

Pillar 2: The Actionable Template Giveaway
Give away the actual Notion roadmap, checklist, or prompt library in exchange for engaged comments.

Pillar 3: The 15-Minute Coffee Chat Flywheel
Turn every high-signal comment into a casual private message. Listen before offering anything.

Consistency beats ad budget every single time.

Drop a "GROWTH" below and I'll send our exact 2025 posting cadence sheet. 🚀

#B2BGrowth #OrganicMarketing #Bootstrapped #SaaSStrategy`,
    bookmarked: true
  },
  {
    id: 'hook-6',
    category: 'questions',
    categoryLabel: 'Question / Poll Openers',
    viralityScore: 92,
    testedImpressions: 'High comment density',
    hookText: 'Why do 80% of B2B SaaS lead forms bleed pipeline before discovery calls?',
    subText: 'We tested 40 enterprise landing pages. The single biggest friction point surprised every CMO in the room...',
    foldImpact: 'High Inquiry Friction',
    fullSample: `Why do 80% of B2B SaaS lead forms bleed pipeline before discovery calls?

We tested 40 enterprise landing pages.
The single biggest friction point surprised every CMO in the room:

Requiring a phone number on page 1 caused a 64% drop-off.
Switching to an instant calendar widget increased verified demos by 2.4x.

If your buyer has to wait 24 hours for a sales rep email, they have already signed with your competitor.

How many form fields does your company ask for on demo requests?

#DemandGen #B2BMarketing #ConversionRateOptimization #SalesOps`,
    bookmarked: false
  }
];
