# CLAUDE.md
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Fourdoor AI is an autonomous AI-driven marketing and lead generation SaaS platform. It generates social media content, engages users, qualifies leads, and books sales calls — all via AI agents.

## Commands

### Frontend (React/Vite)
- `npm install`        # Install dependencies
- `npm run dev`        # Dev server at port 3000
- `npm run build`      # Production build (outputs to dist/)
- `npm run lint`       # ESLint (TypeScript + React hooks rules)

### Backend (Node.js/Express)
- `tsx server.ts`      # Runs the main entry point

## Architecture
- **Frontend**: Vite + React 19 + Tailwind CSS 4. Path alias `@` maps to project root.
- **Backend**: Express-based server in `server.ts` with Vite middleware for development.
- **Database**: Firebase Firestore.
- **Auth**: Firebase Authentication (Google Provider).
- **AI**: Google Gemini API via `@google/genai`.

## AI Agents
1. **content_agent**: Generates platform-specific posts (caption, hook, hashtags, script).
2. **engagement_agent**: Replies to DMs/comments; detects intent (casual/interested/buyer).
3. **sales_agent**: Qualifies leads and calculates lead scores.
4. **analytics_agent**: Performance pattern analysis and strategy optimization.

## Key Files
- `server.ts`: Main backend entry point and Vite middleware.
- `src/lib/firebase.ts`: Firebase initialization and Firestore error handling.
- `src/services/geminiService.ts`: Integration with Google Gemini for AI generation.
- `src/contexts/AuthContext.tsx`: User authentication and profile management.
- `firebase-blueprint.json`: IR for Firestore data structure.
- `firestore.rules`: Security rules for database access.

## Plan Limits
- **Starter** (€29/month)
- **Pro** (€79/month)
- **Agency** (€199/month)

## Key Conventions
- **New Routes**: Add to `src/App.tsx`. Use `<ProtectedRoute>` for authenticated pages.
- **Components**: Functional components with Tailwind CSS for styling.
- **Security**: Use `isValid[Entity]` helpers in Firestore rules for all writes.
- **Error Handling**: Use `handleFirestoreError` for all Firestore operations.
