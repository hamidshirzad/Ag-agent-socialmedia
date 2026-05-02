import { test, expect } from '@applitools/eyes-playwright/fixture';

const APPLITOOLS_API_KEY = process.env.APPLITOOLS_API_KEY ?? 'sutfATFMzIOw109FJkhC1007IRRGLhDn9Dl93vSuZwHbPmQ110';

/**
 * These tests inject a fake Firebase auth session into localStorage so the app
 * thinks the user is signed in, allowing visual testing of protected routes
 * without a real Google OAuth flow.
 */

// Firebase stores the user token under a key like:
//   firebase:authUser:<apiKey>:[DEFAULT]
const FIREBASE_API_KEY = 'AIzaSyBWu606xHmANdRkxBXMSb08DPHyO9s_M_I';
const FIREBASE_STORAGE_KEY = `firebase:authUser:${FIREBASE_API_KEY}:[DEFAULT]`;

const FAKE_USER = JSON.stringify({
  uid: 'visual-test-user-001',
  email: 'visual@test.fourdoor.ai',
  displayName: 'Visual Tester',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  providerData: [{
    providerId: 'google.com',
    uid: 'visual-test-user-001',
    displayName: 'Visual Tester',
    email: 'visual@test.fourdoor.ai',
    phoneNumber: null,
    photoURL: null,
  }],
  stsTokenManager: {
    refreshToken: 'fake-refresh-token',
    accessToken: 'fake-access-token',
    expirationTime: Date.now() + 3600 * 1000,
  },
  createdAt: String(Date.now()),
  lastLoginAt: String(Date.now()),
  apiKey: FIREBASE_API_KEY,
  appName: '[DEFAULT]',
});

test.use({
  eyesConfig: {
    apiKey: APPLITOOLS_API_KEY,
    serverUrl: 'https://eyes.applitools.com',
    appName: 'Fourdoor AI',
    batchName: 'Fourdoor AI — Protected Pages',
    failTestsOnDiff: 'afterEach',
    type: 'classic',
  },
});

// Helper: inject fake auth session before navigating
async function injectAuth(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(
    ([key, value]) => localStorage.setItem(key, value),
    [FIREBASE_STORAGE_KEY, FAKE_USER],
  );
}

// ── PageLoader / Suspense spinner ─────────────────────────────────────────────

test('page loader spinner appearance', async ({ page, eyes }) => {
  // Slow the network so the Suspense fallback is visible
  await page.route('**/*.js', route => setTimeout(() => route.continue(), 400));
  await page.goto('/dashboard');
  // Capture the spinner state
  const spinner = page.locator('.animate-spin').first();
  await spinner.waitFor({ state: 'visible', timeout: 3000 }).catch(() => null);
  await eyes.check('Page loader spinner');
});

// ── Unauthenticated redirect ──────────────────────────────────────────────────

test('protected route without auth redirects to landing', async ({ page, eyes }) => {
  // Clear any existing auth state
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  await eyes.check('Protected route redirect — landing');
});

// ── Sign-in button states ─────────────────────────────────────────────────────

test('landing sign-in buttons visible and styled', async ({ page, eyes }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const buttons = page.locator('nav button');
  await buttons.first().waitFor({ state: 'visible' });
  await eyes.check('Landing — sign-in CTA buttons', {
    region: page.locator('nav').first(),
  });
});
