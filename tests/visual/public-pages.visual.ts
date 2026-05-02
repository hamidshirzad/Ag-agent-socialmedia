import { test, expect } from '@applitools/eyes-playwright/fixture';

const APPLITOOLS_API_KEY = process.env.APPLITOOLS_API_KEY ?? 'sutfATFMzIOw109FJkhC1007IRRGLhDn9Dl93vSuZwHbPmQ110';

test.use({
  eyesConfig: {
    apiKey: APPLITOOLS_API_KEY,
    serverUrl: 'https://eyes.applitools.com',
    appName: 'Fourdoor AI',
    batchName: 'Fourdoor AI — Public Pages',
    failTestsOnDiff: 'afterEach',
    type: 'classic',
  },
});

// ── Landing page ──────────────────────────────────────────────────────────────

test('landing page — full', async ({ page, eyes }) => {
  await page.goto('/');
  // Wait for hero animation to settle
  await page.waitForLoadState('networkidle');
  await eyes.check('Landing — full page');
});

test('landing page — hero section', async ({ page, eyes }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await eyes.check('Landing — hero', {
    region: page.locator('header').first(),
  });
});

test('landing page — navigation bar', async ({ page, eyes }) => {
  await page.goto('/');
  await page.waitForSelector('nav');
  await eyes.check('Landing — navbar', {
    region: page.locator('nav').first(),
  });
});

// ── Contact page ──────────────────────────────────────────────────────────────

test('contact page — empty form', async ({ page, eyes }) => {
  await page.goto('/contact');
  await page.waitForLoadState('networkidle');
  await eyes.check('Contact — empty form');
});

test('contact page — validation errors', async ({ page, eyes }) => {
  await page.goto('/contact');
  await page.waitForLoadState('networkidle');
  // Submit without filling in — triggers client-side validation errors
  await page.getByRole('button', { name: /send message/i }).click();
  await eyes.check('Contact — validation errors');
});

test('contact page — filled form', async ({ page, eyes }) => {
  await page.goto('/contact');
  await page.waitForLoadState('networkidle');
  await page.fill('#contact-name', 'Jane Smith');
  await page.fill('#contact-email', 'jane@acme.com');
  await page.fill('#contact-message', 'Hello, I would love to learn more about Fourdoor AI and how it can help my business grow.');
  await eyes.check('Contact — filled form');
});

// ── 404 / redirect behaviour ──────────────────────────────────────────────────

test('unknown route redirects to landing', async ({ page, eyes }) => {
  await page.goto('/this-page-does-not-exist');
  await page.waitForLoadState('networkidle');
  await eyes.check('404 redirect — landing page');
});

// ── Responsive viewports ──────────────────────────────────────────────────────

test('landing page — mobile 375px', async ({ page, eyes }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await eyes.check('Landing — mobile 375px');
});

test('landing page — tablet 768px', async ({ page, eyes }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await eyes.check('Landing — tablet 768px');
});

test('contact page — mobile 375px', async ({ page, eyes }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/contact');
  await page.waitForLoadState('networkidle');
  await eyes.check('Contact — mobile 375px');
});
