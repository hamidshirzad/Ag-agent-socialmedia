import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthProvider } from '@/contexts/AuthContext';

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };

// Test helpers
export const createMockUser = (overrides = {}) => ({
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  ...overrides,
});

export const createMockProfile = (overrides = {}) => ({
  id: 'test-profile-id',
  userId: 'test-user-id',
  username: 'testuser',
  bio: 'Test bio',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

// Mock data generators
export const generateMockPosts = (count: number) => 
  Array.from({ length: count }, (_, i) => ({
    id: `post-${i}`,
    content: `Test post content ${i}`,
    authorId: `user-${i}`,
    createdAt: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
    likes: Math.floor(Math.random() * 100),
    comments: Math.floor(Math.random() * 50),
  }));

export const generateMockAIResponse = (overrides = {}) => ({
  title: 'Generated Title',
  content: 'Generated content for social media post',
  hashtags: ['#socialmedia', '#test'],
  ...overrides,
});

// Mock Firebase utilities
export const mockFirebaseError = (code: string, message: string) => {
  const error = new Error(message) as any;
  error.code = code;
  return error;
};

// Test environment helpers
export const setupMockIntersectionObserver = () => {
  const observe = vi.fn();
  const unobserve = vi.fn();
  const disconnect = vi.fn();

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      observe,
      unobserve,
      disconnect,
    })),
  });

  return { observe, unobserve, disconnect };
};

export const setupMockResizeObserver = () => {
  const observe = vi.fn();
  const unobserve = vi.fn();
  const disconnect = vi.fn();

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      observe,
      unobserve,
      disconnect,
    })),
  });

  return { observe, unobserve, disconnect };
};

// Async test helpers
export const flushPromises = () => new Promise(setImmediate);

export const actAsync = async (callback: () => void | Promise<void>) => {
  const { act } = await import('@testing-library/react');
  await act(callback);
};
