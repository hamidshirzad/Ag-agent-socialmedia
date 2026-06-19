export interface ApiKeys {
  gemini?:    string;
  anthropic?: string;
  openai?:    string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  company?: string;
  niche?: string;
  goals?: string;
  plan: 'starter' | 'pro' | 'agency';
  subscriptionStatus: string;
  paypalSubscriptionId?: string;
  onboardingComplete: boolean;
  createdAt: string;
  apiKeys?: ApiKeys;
  socialAccounts?: {
    platform: 'linkedin' | 'x' | 'meta' | 'tiktok';
    accessToken: string;
    username: string;
    avatarUrl?: string;
    autoReply: boolean;
    agentEngagement: boolean;
  }[];
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
  scheduledAt: any; // Firestore Timestamp or ISO String
  status: 'draft' | 'scheduled' | 'posted';
  autoReply?: boolean;
  agentEngagement?: boolean;
  createdAt: string;
  metrics?: {
    views: number;
    clicks: number;
    engagements: number;
  };
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
  imageUrl?: string;
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

export interface TeamMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: 'Manager' | 'Analyst' | 'Content Editor';
  status: 'Active' | 'Pending';
  createdAt: any;
}

export interface OutreachContact {
  id: string;
  userId: string;
  name: string;
  email?: string;
  linkedinUrl?: string;
  status: 'pending' | 'personalizing' | 'sent' | 'failed';
  personalizedMessage?: string;
  createdAt: any;
}
