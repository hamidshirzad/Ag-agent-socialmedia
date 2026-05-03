/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";

const Landing      = lazy(() => import("./pages/Landing"));
const Contact      = lazy(() => import("./pages/Contact"));
const Dashboard    = lazy(() => import("./pages/Dashboard"));
const Onboarding   = lazy(() => import("./pages/Onboarding"));
const ContentEngine = lazy(() => import("./pages/ContentEngine"));
const LeadInbox    = lazy(() => import("./pages/LeadInbox"));
const Outreach     = lazy(() => import("./pages/Outreach"));
const Calendar     = lazy(() => import("./pages/Calendar"));
const Settings     = lazy(() => import("./pages/Settings"));
const ScoringRules = lazy(() => import("./pages/ScoringRules"));
const Billing      = lazy(() => import("./pages/Billing"));
const Campaigns    = lazy(() => import("./pages/Campaigns"));

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-sb-cream">
      <div className="w-12 h-12 rounded-full border-4 border-sb-accent border-t-transparent animate-spin" />
    </div>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<ProtectedRoute requiresOnboarding><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
          <Route path="/content" element={<ProtectedRoute><ContentEngine /></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute><LeadInbox /></ProtectedRoute>} />
          <Route path="/outreach" element={<ProtectedRoute><Outreach /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/scoring" element={<ProtectedRoute><ScoringRules /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Analytics />
      </BrowserRouter>
    </AuthProvider>
  );
}
