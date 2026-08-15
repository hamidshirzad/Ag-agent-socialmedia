export interface UserProfile {
  id: string;
  name: string;
  email: string;
  company?: string;
  plan: 'starter' | 'pro' | 'agency';
  subscriptionStatus: string;
  paypalSubscriptionId?: string;
  onboardingComplete: boolean;
  createdAt: string;
  apiKeys?: {
    openai?: string;
    anthropic?: string;
    gemini?: string;
  };
}

export interface Post {
  id: string;
  userId: string;
  campaignId?: string;
  variationId?: string;
  type: 'video' | 'image' | 'text';
  platforms: string[];
  caption: string;
  mediaUrl?: string;
  scheduledAt: string;
  status: 'draft' | 'scheduled' | 'posted';
  createdAt: string;
}

export interface Lead {
  id: string;
  userId: string;
  name: string;
  email: string;
  source: string;
  initialMessage?: string;
  score: number;
  status: 'new' | 'qualified' | 'booked' | 'closed';
  createdAt: string;
  // AI follow-up automation
  intent?: 'casual' | 'interested' | 'buyer';
  draftReplies?: boolean;
  autoSendThreshold?: number;    // 0–100; auto-sends when AI confidence ≥ this
  reviewRequiredThreshold?: number; // 0–100; always flags for review when AI confidence < this
}

export interface Message {
  id: string;
  leadId: string;
  sender: 'ai' | 'user';
  content: string;
  intent?: string;
  timestamp: string;
  // AI draft state
  status?: 'draft' | 'approved' | 'sent';
  confidence?: number; // 0–100, from analyzeLeadIntent leadScore
}

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  niche: string;
  goals: string;
  active: boolean;
  variations?: {
    id: string;
    name: string;
    description: string;
    stats: {
      conversions: number;
      engagement: number;
    };
  }[];
  // Automation mission fields
  objective?: string;
  targetAudience?: string;
  budgetRange?: string;
  channels?: string[];
  cadence?: 'daily' | 'weekly' | 'biweekly';
  status?: 'draft' | 'active' | 'paused';
  lastRunAt?: any;
  nextRunAt?: any;
}

export interface AutomationJob {
  id: string;
  userId: string;
  campaignId: string;
  type: 'content_creation' | 'lead_follow_up' | 'performance_review';
  status: 'pending' | 'running' | 'completed' | 'failed';
  scheduledFor: any;
  createdAt: any;
  resultSummary?: string;
}

export interface ScoringRule {
  id: string;
  userId: string;
  attribute: string;
  operator: string;
  value: string;
  points: number;
  isActive: boolean;
  category: 'attribute' | 'engagement' | 'crm';
  createdAt: string;
}
