export interface SocialAccount {
  connected: boolean;
  accessToken?: string;
  apiKey?: string;
  apiSecret?: string;
  pageId?: string;
  username?: string;
  connectedAt?: string;
  // TikTok OAuth fields
  openId?: string;
  refreshToken?: string;
  refreshExpiresIn?: number;
  expiresIn?: number;
  scope?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  company?: string;
  niche?: string;
  goals?: string;
  industry?: string;
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
  socialAccounts?: {
    linkedin?: SocialAccount;
    x?: SocialAccount;
    meta?: SocialAccount;
    tiktok?: SocialAccount;
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
  scheduledAt?: string;
  autoReply?: boolean;
  agentEngagement?: boolean;
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
}

export interface Message {
  id: string;
  leadId: string;
  sender: 'ai' | 'user';
  content: string;
  intent?: string;
  timestamp: string;
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
