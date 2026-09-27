export type AppTab = 'generator' | 'hook-library' | 'saved-drafts' | 'analytics-insights';
export type ActiveTab = AppTab;

export type PostTone = 
  | 'Storytelling'
  | 'Controversial'
  | 'Professional'
  | 'Informative'
  | 'Motivational'
  | 'Casual'
  | 'Executive Authority'
  | 'Contrarian Analytical'
  | 'Story-Driven Vulnerable'
  | 'Tactical Framework';

export type TargetLength = 'short' | 'medium' | 'long';
export type PostLength = TargetLength;

export type DraftStatus = 'Ready to Post' | 'Scheduled' | 'Draft' | 'Published';
export type PostStatus = DraftStatus;

export interface DraftPost {
  id: string;
  title: string;
  hook: string;
  fullContent: string;
  tone: PostTone;
  targetAudience: string;
  status: PostStatus;
  scheduledTime?: string;
  date: string;
  charCount: number;
  wordCount: number;
  tags: string[];
  hookScore?: number;
  readabilityGrade?: string;
  imageUrl?: string;
  imageCaption?: string;
  imageAspectRatio?: '16:9' | '1:1' | '4:5' | 'original';
}

export interface ViralHook {
  id: string;
  category: 'curiosity' | 'contrarian' | 'vulnerability' | 'listicle' | 'questions' | 'data';
  categoryLabel: string;
  viralityScore: number;
  testedImpressions: string;
  hookText: string;
  subText: string;
  foldImpact: string;
  fullSample: string;
  bookmarked: boolean;
}

export interface AnalyticsSummary {
  totalOrganicReach: number;
  totalOrganicReachLift: string;
  profileInboundTaps: number;
  profileInboundTapsLift: string;
  followerDwellFactor: number;
  benchmarkDwell: string;
  hookAvgCtr: string;
  algorithmicBoost: string;
}

export interface SavedDraft {
  id: string;
  title: string;
  content: string;
  hookTop: string;
  bodyRest: string;
  tone: string;
  targetAudience: string;
  status: DraftStatus;
  scheduledTime?: string;
  createdDate: string;
  chars: number;
  wordCount: number;
  isBookmarked?: boolean;
  imageUrl?: string;
  imageCaption?: string;
}

export interface HookTemplate {
  id: string;
  category: 'curiosity' | 'contrarian' | 'vulnerability' | 'listicle' | 'questions' | 'data';
  categoryLabel: string;
  viralityScore: number;
  testedImpressions: string;
  mainHook: string;
  subHook: string;
  foldImpact: string;
  foldImpactType?: 'Cliffhanger' | 'Emotional' | 'Controversy' | 'Disbelief' | 'Framework';
  isBookmarked?: boolean;
  sampleFull: string;
}

export interface PostAuditMetrics {
  charCount: number;
  wordCount: number;
  readTimeSec: number;
  hookStrengthScore: number;
  hookCategory: string;
  readabilityScore: number;
  fleschGrade: number;
  reachVelocityPct: number;
  dwellUnits: number;
  hashtags: string[];
  foldStatus: 'safe' | 'warning' | 'cutoff';
}
