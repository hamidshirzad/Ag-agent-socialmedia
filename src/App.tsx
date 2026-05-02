/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Wrap><Landing /></Wrap>} />
            <Route path="/contact" element={<Wrap><Contact /></Wrap>} />
            <Route path="/onboarding" element={<ProtectedRoute requiresOnboarding><Wrap><Onboarding /></Wrap></ProtectedRoute>} />
            <Route path="/dashboard"  element={<ProtectedRoute><Wrap><Dashboard /></Wrap></ProtectedRoute>} />
            <Route path="/campaigns"  element={<ProtectedRoute><Wrap><Campaigns /></Wrap></ProtectedRoute>} />
            <Route path="/content"    element={<ProtectedRoute><Wrap><ContentEngine /></Wrap></ProtectedRoute>} />
            <Route path="/leads"      element={<ProtectedRoute><Wrap><LeadInbox /></Wrap></ProtectedRoute>} />
            <Route path="/outreach"   element={<ProtectedRoute><Wrap><Outreach /></Wrap></ProtectedRoute>} />
            <Route path="/calendar"   element={<ProtectedRoute><Wrap><Calendar /></Wrap></ProtectedRoute>} />
            <Route path="/scoring"    element={<ProtectedRoute><Wrap><ScoringRules /></Wrap></ProtectedRoute>} />
            <Route path="/billing"    element={<ProtectedRoute><Wrap><Billing /></Wrap></ProtectedRoute>} />
            <Route path="/settings"   element={<ProtectedRoute><Wrap><Settings /></Wrap></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
