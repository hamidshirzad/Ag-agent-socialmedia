import { Auth0Provider } from "@auth0/auth0-react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/Toast";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import ContentEngine from "./pages/ContentEngine";
import LeadInbox from "./pages/LeadInbox";
import Outreach from "./pages/Outreach";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import ScoringRules from "./pages/ScoringRules";
import Billing from "./pages/Billing";
import Campaigns from "./pages/Campaigns";
import Team from "./pages/Team";
import ProtectedRoute from "./components/ProtectedRoute";

const AUTH0_DOMAIN    = import.meta.env.VITE_AUTH0_DOMAIN    ?? "";
const AUTH0_CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID ?? "";

export default function App() {
  return (
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{ redirect_uri: window.location.origin }}
      cacheLocation="localstorage"
    >
      <ToastProvider>
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
              <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
              <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </Auth0Provider>
  );
}
