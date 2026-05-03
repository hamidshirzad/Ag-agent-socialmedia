import { vi } from 'vitest';

// User factory
export const createUserFactory = (overrides = {}) => ({
  uid: `user-${Date.now()}`,
  email: 'user@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/avatar.jpg',
  emailVerified: true,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
  ...overrides,
});

// Profile factory
export const createProfileFactory = (overrides = {}) => ({
  id: `profile-${Date.now()}`,
  userId: `user-${Date.now()}`,
  username: 'testuser',
  bio: 'Test bio description',
  avatar: 'https://example.com/avatar.jpg',
  website: 'https://example.com',
  location: 'Test Location',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Post factory
export const createPostFactory = (overrides = {}) => ({
  id: `post-${Date.now()}`,
  content: 'This is a test post content',
  authorId: `user-${Date.now()}`,
  authorName: 'Test User',
  authorAvatar: 'https://example.com/avatar.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  likes: 0,
  comments: [],
  hashtags: ['#test', '#post'],
  media: [],
  ...overrides,
});

// AI Response factory
export const createAIResponseFactory = (overrides = {}) => ({
  title: 'Generated Social Media Post',
  content: 'This is AI-generated content for social media',
  hashtags: ['#ai', '#socialmedia', '#generated'],
  tone: 'professional',
  platform: 'twitter',
  ...overrides,
});

// Firebase Document Snapshot factory
export const createDocumentSnapshotFactory = (data: any, exists = true) => ({
  data: () => data,
  exists: () => exists,
  id: `doc-${Date.now()}`,
  metadata: {},
});

// Firebase Query Snapshot factory
export const createQuerySnapshotFactory = (docs: any[] = []) => ({
  docs: docs.map(doc => createDocumentSnapshotFactory(doc)),
  size: docs.length,
  empty: docs.length === 0,
  forEach: (callback: Function) => docs.forEach(doc => callback(createDocumentSnapshotFactory(doc))),
});

// API Response factory
export const createAPIResponseFactory = (data: any, status = 200, message = 'Success') => ({
  status,
  message,
  data,
  timestamp: new Date().toISOString(),
});

// Error factory
export const createErrorFactory = (message: string, code = 'UNKNOWN') => {
  const error = new Error(message) as any;
  error.code = code;
  error.response = {
    status: 400,
    data: { message, code },
  };
  return error;
};

// Mock AI Provider responses
export const createGeminiResponseFactory = (text: string) => ({
  text: () => text,
  candidates: [
    {
      content: {
        parts: [{ text }],
        role: 'model',
      },
    },
  ],
});

export const createOpenAIResponseFactory = (text: string) => ({
  choices: [
    {
      message: {
        content: text,
        role: 'assistant',
      },
    },
  ],
});

export const createAnthropicResponseFactory = (text: string) => ({
  content: [
    {
      type: 'text',
      text,
    },
  ],
});

// Test data builders
export class TestDataBuilder {
  private data: any = {};

  constructor(initialData = {}) {
    this.data = { ...initialData };
  }

  withId(id: string) {
    this.data.id = id;
    return this;
  }

  withTimestamp(override?: string) {
    this.data.createdAt = override || new Date().toISOString();
    this.data.updatedAt = override || new Date().toISOString();
    return this;
  }

  withAuthor(authorId: string, authorName?: string) {
    this.data.authorId = authorId;
    if (authorName) {
      this.data.authorName = authorName;
    }
    return this;
  }

  withContent(content: string) {
    this.data.content = content;
    return this;
  }

  build() {
    return { ...this.data };
  }
}

// Mock service factories
export const createMockAuthService = () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
  resetPassword: vi.fn(),
  updateProfile: vi.fn(),
});

export const createMockPostService = () => ({
  createPost: vi.fn(),
  getPosts: vi.fn(),
  getPost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
  likePost: vi.fn(),
  unlikePost: vi.fn(),
});

export const createMockAIService = () => ({
  generateContent: vi.fn(),
  generatePost: vi.fn(),
  generateHashtags: vi.fn(),
  analyzeSentiment: vi.fn(),
});

// Environment configuration for tests
export const createTestEnvironment = (overrides = {}) => ({
  NODE_ENV: 'test',
  VITE_FIREBASE_API_KEY: 'test-api-key',
  VITE_FIREBASE_PROJECT_ID: 'test-project',
  VITE_GEMINI_API_KEY: 'test-gemini-key',
  VITE_OPENAI_API_KEY: 'test-openai-key',
  VITE_ANTHROPIC_API_KEY: 'test-anthropic-key',
  ...overrides,
});
