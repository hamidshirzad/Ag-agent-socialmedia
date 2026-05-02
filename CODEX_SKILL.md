# Fourdoor AI — Codex Enhancement Prompt

> **How to use:** Paste this entire file as a system prompt (or prepend it to your request) when working with OpenAI Codex, GitHub Copilot Workspace, or any AI coding assistant. It gives the model a complete picture of the codebase so it can make targeted, production-ready changes without guessing.

---

## Project Identity

**Name:** Fourdoor AI Growth Engine  
**Purpose:** Autonomous AI-driven marketing SaaS — generates social content, qualifies leads, books sales calls, and manages social distribution, all via AI agents.  
**Stack:** React 19 + Vite 6 + Tailwind CSS 4 (frontend) · Express 4 + Firebase (backend) · Firestore (database) · Firebase Auth (Google OAuth) · Gemini / Claude / OpenAI (AI) · PayPal (billing)  
**Language:** TypeScript 5.8, ESM (`"type": "module"`)  
**Test Runner:** Vitest 3 (jsdom + node environments)  
**CI:** CircleCI `node/test` orb on Node 22

---

## Codebase Map

### Frontend — `src/`

| File | Route | Purpose |
|---|---|---|
| `src/main.tsx` | — | App entry, `React.StrictMode`, mounts `<App>` to `#root` |
| `src/App.tsx` | — | `<AuthProvider>` + `<BrowserRouter>` + all 11 routes |
| `src/index.css` | — | Tailwind import, design tokens, custom animations |
| `src/types.ts` | — | All shared TypeScript interfaces (see Types section) |
| `src/pages/Landing.tsx` | `/` | Public marketing page + Google sign-in |
| `src/pages/Onboarding.tsx` | `/onboarding` | 5-step new-user wizard, seeds scoring rules |
| `src/pages/Dashboard.tsx` | `/dashboard` | KPI cards, Recharts area + pie charts, activity feed |
| `src/pages/ContentEngine.tsx` | `/content` | AI post generator, scheduling, social platform relay |
| `src/pages/Calendar.tsx` | `/calendar` | Month-view post schedule |
| `src/pages/Billing.tsx` | `/billing` | PayPal subscription management, plan grid |
| `src/pages/Campaigns.tsx` | `/campaigns` | A/B campaign manager with variation stats |
| `src/pages/LeadInbox.tsx` | `/leads` | Lead CRM, message thread, scoring display |
| `src/pages/Outreach.tsx` | `/outreach` | Outbound sequence composer |
| `src/pages/ScoringRules.tsx` | `/scoring` | Lead scoring rule builder (CRUD) |
| `src/pages/Settings.tsx` | `/settings` | API keys, social accounts, user profile |
| `src/components/ProtectedRoute.tsx` | — | Auth + onboarding gate (see Auth section) |
| `src/components/Sidebar.tsx` | — | Fixed left nav, 9 links, user avatar, sign-out |
| `src/components/StatsCard.tsx` | — | Reusable metric card with trend indicator |
| `src/contexts/AuthContext.tsx` | — | Firebase auth state + Firestore profile |
| `src/lib/firebase.ts` | — | Firebase init, `handleFirestoreError`, `OperationType` |
| `src/lib/utils.ts` | — | `cn()`, `formatDate()`, `truncate()` |
| `src/services/aiService.ts` | — | `generateContentWithEngine()` — multi-provider AI router |
| `src/services/geminiService.ts` | — | `generateMarketingContent()`, `analyzeLeadIntent()` |

### Backend — project root

| File | Purpose |
|---|---|
| `server.ts` | `createApp()` factory + `startServer()`. Routes: `GET /api/health`, `POST /api/billing/webhook`, `POST /api/schedule-post` |
| `firestore.rules` | Firestore security rules for all collections |
| `firebase-blueprint.json` | Canonical Firestore data schema (source of truth) |
| `firebase-applet-config.json` | Firebase project credentials (injected at runtime) |
| `.circleci/config.yml` | CI: `node/test` job on Node 22 |
| `vite.config.ts` | Vite + React + Tailwind; exposes `GEMINI_API_KEY` to browser |
| `vitest.config.ts` | Test config: jsdom env, globals, `src/test/setup.ts` |
| `tsconfig.json` | `moduleResolution: bundler`, `skipLibCheck: true` |
| `.env.example` | All required environment variables |

### Tests — 30 tests, 5 files

| File | Count | What it covers |
|---|---|---|
| `src/lib/firebase.test.ts` | 6 | `handleFirestoreError` — error extraction, auth context, null user |
| `src/services/aiService.test.ts` | 10 | Provider routing, missing keys, Claude JSON fallback |
| `src/components/ProtectedRoute.test.tsx` | 6 | All 6 auth/onboarding branch combinations |
| `src/contexts/AuthContext.test.tsx` | 3 | `signIn()` — error propagation, new user, returning user |
| `server.test.ts` | 5 | `GET /api/health`, PayPal webhook, `/api/schedule-post` |

---

## Types (`src/types.ts`)

```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
  company?: string;
  niche?: string;
  goals?: string;
  industry?: string;
  plan: 'starter' | 'pro' | 'agency';
  subscriptionStatus: 'active' | 'inactive';
  paypalSubscriptionId?: string;
  onboardingComplete: boolean;
  createdAt: string;
  apiKeys?: { openai?: string; anthropic?: string; gemini?: string };
  socialAccounts?: {
    linkedin?: SocialAccount;
    x?: SocialAccount;
    meta?: SocialAccount;
    tiktok?: SocialAccount;
  };
}

interface SocialAccount {
  connected: boolean;
  accessToken?: string;
  apiKey?: string;
  apiSecret?: string;
  pageId?: string;
  username?: string;
  connectedAt?: string;
}

interface Post {
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

interface Lead {
  id: string;
  userId: string;
  name: string;
  email: string;
  source?: string;
  initialMessage?: string;
  score: number;
  status: 'new' | 'qualified' | 'booked' | 'closed';
  createdAt: string;
}

interface Message {
  id: string;
  leadId: string;
  sender: 'ai' | 'user';
  content: string;
  intent?: string;
  timestamp: string;
}

interface Campaign {
  id: string;
  userId: string;
  name: string;
  niche?: string;
  goals?: string;
  active: boolean;
  variations?: {
    id: string;
    name: string;
    description: string;
    stats: { conversions: number; engagement: number };
  }[];
}

interface ScoringRule {
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
```

---

## Auth & Route Protection

### `AuthContextType`
```typescript
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<{ isNewUser: boolean }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
```

### `ProtectedRoute` props
```typescript
{ children: React.ReactNode; requiresOnboarding?: boolean }
```
- `requiresOnboarding={false}` (default) — for all app pages. Redirects to `/onboarding` if `!profile?.onboardingComplete`.
- `requiresOnboarding={true}` — for `/onboarding` only. Redirects to `/dashboard` if already complete.
- Not authenticated → redirects to `/`.
- Loading → shows "Neural_Sync_Active" spinner.

---

## Firebase Conventions

### `handleFirestoreError` — always call this in every catch block
```typescript
import { handleFirestoreError, OperationType } from '../lib/firebase';

// CORRECT
try {
  const snap = await getDoc(userRef);
} catch (error) {
  handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  // no return needed — handleFirestoreError has return type `never`
}

// WRONG — never swallow Firestore errors silently
try {
  await setDoc(ref, data);
} catch (_) { /* empty */ }
```

### `OperationType` enum values
`CREATE` · `UPDATE` · `DELETE` · `LIST` · `GET` · `WRITE`

### Firestore collections & paths
| Collection | Path | Notes |
|---|---|---|
| Users | `/users/{userId}` | One doc per auth user |
| Scoring rules | `/users/{userId}/scoringRules/{ruleId}` | Sub-collection |
| Posts | `/posts/{postId}` | `userId` field for ownership |
| Leads | `/leads/{leadId}` | `userId` field for ownership |
| Messages | `/leads/{leadId}/messages/{messageId}` | Sub-collection |
| Campaigns | `/campaigns/{campaignId}` | `userId` field for ownership |

### Dot-notation update for nested fields
```typescript
await updateDoc(userRef, {
  [`socialAccounts.${platformId}`]: account,
  [`apiKeys.gemini`]: key,
});
```

### `scheduledAt` must use `Timestamp`
```typescript
import { Timestamp } from 'firebase/firestore';

// Validate FIRST, then construct
if (isNaN(new Date(scheduleDate).getTime())) {
  alert('Invalid date');
  return;
}
const scheduledAt = Timestamp.fromDate(new Date(scheduleDate));
```

---

## Design System

### Color tokens (CSS variables in `src/index.css`)
| Token | Hex | Use |
|---|---|---|
| `sb-green` | `#006241` | Primary brand, nav active |
| `sb-accent` | `#00754A` | Action buttons, CTAs |
| `sb-house` | `#1E3932` | Dark background, sidebar |
| `sb-gold` | `#cba258` | Premium highlights |
| `sb-cream` | `#f2f0eb` | Page backgrounds |
| `sb-ceramic` | `#edebe9` | Section backgrounds |
| `sb-light` | `#d4e9e2` | Light accents |

### Utility functions (`src/lib/utils.ts`)
```typescript
cn(...inputs)        // clsx + tailwind-merge — use for all conditional classes
formatDate(date)     // → "May 01, 2026"
truncate(str, n)     // → "Long text..."
```

### Icons — `lucide-react`
All icons must come from `lucide-react`. Do not add new icon libraries.

### Animations — `motion/react`
Use `motion.div` with `initial`, `animate`, `exit` props. Use `AnimatePresence` for conditional renders.

---

## AI Service

### `generateContentWithEngine(prompt, config)` — `src/services/aiService.ts`
```typescript
interface AIConfig {
  provider: 'gemini' | 'anthropic' | 'openai';
  apiKey?: string; // optional for Gemini (falls back to GEMINI_API_KEY env var)
}

// Returns parsed JSON object or throws
const result = await generateContentWithEngine(prompt, { provider: 'gemini' });
```

### `generateMarketingContent(niche, audience, goal, apiKeys?, provider)` — `src/services/geminiService.ts`
Returns: `{ tiktokScript, linkedinPost, xThread, hashtags[], suggestedImagePrompt }`

### `analyzeLeadIntent(message, apiKeys?)` — `src/services/geminiService.ts`
Returns: `{ intent: 'casual'|'interested'|'buyer', suggestedResponse, leadScore, keyNeeds }`  
Always uses Gemini provider.

---

## Coding Rules — MUST FOLLOW

1. **Every Firestore operation** must be in try/catch → `handleFirestoreError(error, OperationType.X, path)`
2. **`signIn()` errors propagate** — never wrap the `signInWithPopup` call in a try/catch inside `signIn()`; catch in the caller
3. **`ProtectedRoute` owns auth checks** — no page component should read `user` or check `onboardingComplete` directly
4. **No inline styles** — Tailwind CSS only; use `cn()` for conditional classes
5. **No new UI libraries** — Recharts (charts), Lucide (icons), Motion (animations) are already installed
6. **No new comment blocks** — only add a comment when the WHY is genuinely non-obvious
7. **`npm run lint` must pass** after every change (`tsc --noEmit`, zero errors)
8. **`npm run test` must pass** — all 30+ tests green
9. **New routes** in `src/App.tsx` must be wrapped in `<ProtectedRoute>`
10. **New Firestore writes** must have a matching Firestore rule update in `firestore.rules`

---

## Enhancement Directives

Work through these in order. Each section is self-contained and can be applied independently.

---

### A — Security (do these first)

#### A1. Remove API key browser exposure
**Problem:** `vite.config.ts` exposes `GEMINI_API_KEY` via `define`, making it visible in the browser bundle.  
**Fix:** Remove the `define` block from `vite.config.ts`. Add a new `POST /api/generate` route in `server.ts` that calls `generateContentWithEngine()` server-side. Update `geminiService.ts` to call `/api/generate` instead of calling the SDK directly.

```typescript
// server.ts — add inside createApp()
app.post('/api/generate', async (req, res) => {
  const { prompt, provider = 'gemini', apiKey } = req.body;
  try {
    const result = await generateContentWithEngine(prompt, { provider, apiKey });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});
```

#### A2. Webhook signature verification
**Problem:** `POST /api/billing/webhook` accepts any payload with no authenticity check.  
**Fix:** Verify PayPal webhook signature using `PAYPAL_WEBHOOK_ID`. Reject requests that fail verification with 401.

#### A3. Input validation on `/api/schedule-post`
**Problem:** `postId`, `platforms`, `scheduledAt` arrive unvalidated.  
**Fix:** Add runtime validation (minimum: check types, non-empty, ISO date format). Return 400 with a descriptive error for invalid payloads.

#### A4. CORS restriction
**Problem:** `server.ts` has no CORS configuration — any origin can call the API.  
**Fix:** Add `cors` middleware (install `cors` + `@types/cors`), restrict to `process.env.APP_URL` in production, allow `*` in development.

#### A5. Firestore rules — fix undocumented gaps
In `firestore.rules`:
- Add explicit `allow delete` for `/leads/{leadId}/messages/{messageId}` (currently relying on default-deny — undocumented)
- Validate that `createdAt` on creates matches server time (use `request.time` comparison pattern)
- Add `delete` rule for `/posts/{postId}` if not already present

#### A6. Environment variable validation on startup
In `server.ts` `startServer()`, check for required env vars and log a fatal error if missing:
```typescript
const REQUIRED_ENV = ['PAYPAL_CLIENT_SECRET', 'PAYPAL_WEBHOOK_ID'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`Missing env vars: ${missing.join(', ')}`);
  process.exit(1);
}
```

---

### B — Backend

#### B1. Centralized error middleware
Add to the bottom of `createApp()` in `server.ts`:
```typescript
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});
```

#### B2. Health check enrichment
Update `GET /api/health` to include:
```json
{ "status": "ok", "timestamp": "ISO", "version": "0.0.0", "firebase": "connected" }
```
Test Firebase connectivity by attempting a lightweight Firestore read.

#### B3. `/api/schedule-post` real logic
Currently just logs and returns `{ success: true }`. Integrate with Firestore: update the post document's `status` to `'scheduled'` and set `scheduledAt` using `Timestamp`.

---

### C — Performance

#### C1. Lazy-load all page components
In `src/App.tsx`, replace direct imports with `React.lazy()` and wrap route elements in `<Suspense>`:
```typescript
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
// ... all 11 pages

// In the route tree:
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Suspense fallback={<PageSkeleton />}>
      <Dashboard />
    </Suspense>
  </ProtectedRoute>
} />
```

#### C2. Move heavy AI SDK imports server-side
`@anthropic-ai/sdk` and `openai` are currently imported in the browser bundle via `aiService.ts`. After implementing A1 (`/api/generate`), remove the SDK imports from `src/services/aiService.ts` and replace the provider calls with `fetch('/api/generate', ...)`.

#### C3. Replace `getDoc` polling with `onSnapshot`
In any component that calls `getDoc` inside a `useEffect` to load list data (Dashboard post count, LeadInbox lead list), replace with `onSnapshot` so the UI updates in real time without manual refresh:
```typescript
useEffect(() => {
  const q = query(collection(db, 'posts'), where('userId', '==', user.uid));
  return onSnapshot(q, (snap) => {
    setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Post));
  });
}, [user.uid]);
```
The returned unsubscribe function is the cleanup — return it directly.

#### C4. Memoize expensive derived values
In Dashboard and ContentEngine, wrap computed lists and stats in `useMemo`. Wrap event handlers passed as props in `useCallback`.

---

### D — User Interface

#### D1. Skeleton loading states
Create `src/components/Skeleton.tsx`:
```typescript
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-gray-200 rounded', className)} />;
}
```
Use it in every page while Firestore data is loading instead of rendering nothing or showing stale data.

#### D2. Error boundary per route
Create `src/components/ErrorBoundary.tsx` as a class component with `componentDidCatch`. Wrap each page route in `App.tsx`:
```tsx
<Suspense fallback={<PageSkeleton />}>
  <ErrorBoundary>
    <Dashboard />
  </ErrorBoundary>
</Suspense>
```

#### D3. Toast notification system (replace `alert()`)
Create `src/components/Toast.tsx` — a simple `useState`-based stack of messages rendered in a fixed bottom-right container. Export a `useToast()` hook. Replace every `alert()` call in the codebase with `toast.error(...)` or `toast.success(...)`.

#### D4. Empty states
For Campaigns, LeadInbox, ScoringRules, and ContentEngine's post list: when the Firestore result is an empty array, render an empty-state block with an icon, heading, and a CTA button — do not render a blank page.

#### D5. Character count on caption
In `ContentEngine.tsx`, below the caption textarea, add:
```tsx
<p className={cn('text-xs text-right', caption.length > 9500 && 'text-red-500')}>
  {caption.length} / 10,000
</p>
```

#### D6. Mobile responsive sidebar
In `Sidebar.tsx`, add a hamburger button visible only on `md:hidden`. Use a `useState` open/close toggle to conditionally apply `translate-x-0` vs `-translate-x-full` on the sidebar `div`. Add a dark overlay behind the open sidebar on mobile.

#### D7. Accessibility
- Add `aria-label` to every icon-only `<button>` (Sidebar sign-out, ContentEngine regenerate, etc.)
- Ensure all `<input>` elements have an associated `<label>` or `aria-label`
- Verify focus ring is visible: Tailwind's `focus:ring-2 focus:ring-sb-green` on interactive elements

---

### E — Feature Wiring

#### E1. Dashboard live data
Replace static numbers with live Firestore counts:
```typescript
// Count posts
const [postCount, setPostCount] = useState(0);
useEffect(() => {
  const q = query(collection(db, 'posts'), where('userId', '==', user!.uid));
  return onSnapshot(q, snap => setPostCount(snap.size));
}, [user]);
```
Do the same for leads. Update StatsCard values accordingly.

#### E2. Campaigns A/B stats chart
In `Campaigns.tsx`, render a Recharts `BarChart` inside each campaign card showing `variations[].stats.conversions` and `variations[].stats.engagement` per variation name. Use the existing Recharts import pattern from Dashboard.

#### E3. LeadInbox message thread
Wire the message input form in `LeadInbox.tsx`:
1. On send, call `addDoc(collection(db, 'leads', lead.id, 'messages'), { sender: 'user', content, timestamp: new Date().toISOString(), leadId: lead.id })`
2. Then call `analyzeLeadIntent(content, profile?.apiKeys)` and append the AI response as `sender: 'ai'`
3. Load messages via `onSnapshot` on the messages sub-collection, ordered by `timestamp` ascending

#### E4. Billing PayPal buttons
In `Billing.tsx`, when a user clicks "Select" on a plan, render `<PayPalButtons>` from `@paypal/react-paypal-js` (already installed):
- Use the plan's env var (`VITE_PAYPAL_PLAN_ID_STARTER`, etc.) as the subscription plan ID
- On approval, call `POST /api/billing/webhook` is the wrong target — instead, save the `subscriptionID` to Firestore: `updateDoc(userRef, { paypalSubscriptionId: data.subscriptionID, plan: selectedPlan, subscriptionStatus: 'active' })`

#### E5. ScoringRules full CRUD
Wire `ScoringRules.tsx` to Firestore:
- **Load:** `onSnapshot` on `/users/{uid}/scoringRules`
- **Create:** `addDoc(collection(db, 'users', uid, 'scoringRules'), { ...formData, userId: uid, isActive: true, createdAt: new Date().toISOString() })`
- **Toggle active:** `updateDoc(ruleRef, { isActive: !rule.isActive })`
- **Delete:** `deleteDoc(ruleRef)` — wrap in `handleFirestoreError`

#### E6. Settings social accounts persist
In `Settings.tsx`, when a platform is connected, persist to Firestore:
```typescript
await updateDoc(userRef, {
  [`socialAccounts.${platformId}`]: {
    connected: true,
    accessToken: form.accessToken,
    connectedAt: new Date().toISOString(),
  },
});
```
On disconnect: `updateDoc(userRef, { [\`socialAccounts.${platformId}.connected\`]: false })`

---

## Test Coverage Requirements

For every new function or component, add a Vitest test following these patterns:

### Mocking Firebase
```typescript
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn((_auth, cb) => { cb(null); return () => {}; }),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
}));
```

### Mock objects that must exist before `vi.mock` factories run
```typescript
const mockAuth = vi.hoisted(() => ({ currentUser: null }));
vi.mock('../lib/firebase', () => ({ auth: mockAuth, db: {}, ... }));
```

### Server route tests
```typescript
// @vitest-environment node   ← required at top of file
import request from 'supertest'; // supertest@^6
import { createApp } from './server';

it('GET /api/health returns 200', async () => {
  const res = await request(createApp()).get('/api/health');
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('ok');
});
```

### React hook tests
```typescript
const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(AuthProvider, null, children);

const { result } = renderHook(() => useAuth(), { wrapper });
await act(async () => { ... });
```

---

## Verification Checklist

Run these commands after every batch of changes:

```bash
npm run lint        # tsc --noEmit — ZERO errors required
npm run test        # vitest run — ALL tests must pass
npm run build       # vite build — dist/ must build cleanly
```

New tests must be additive — never delete existing tests to make the suite pass.

---

## Environment Variables Reference

```bash
# AI (server-side only after A1 fix)
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# App
APP_URL=
VITE_API_URL=/api
VITE_APP_URL=

# PayPal
VITE_PAYPAL_CLIENT_ID=
VITE_PAYPAL_MODE=sandbox
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=
PAYPAL_PLAN_ID_STARTER=
PAYPAL_PLAN_ID_PRO=
PAYPAL_PLAN_ID_AGENCY=

# Social OAuth (frontend)
VITE_GOOGLE_CLIENT_ID=
VITE_FACEBOOK_APP_ID=
VITE_LINKEDIN_CLIENT_ID=
VITE_X_CLIENT_ID=

# Misc
VITE_CALENDLY_BOOKING_LINK=
```

---

## Priority Order for Codex

1. **A1–A6** — Security (API key exposure, webhook verification, CORS, Firestore rule gaps)
2. **B1–B3** — Backend hardening (error middleware, health check, schedule-post)
3. **C1–C4** — Performance (lazy loading, server-side AI, onSnapshot, memoization)
4. **D1–D7** — UI polish (skeletons, error boundary, toasts, empty states, a11y)
5. **E1–E6** — Feature wiring (live data, A/B charts, message thread, billing, CRUD)
6. Tests for all new code
