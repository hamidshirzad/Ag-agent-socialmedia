import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";

vi.mock("../contexts/AuthContext", () => ({
  useAuth: vi.fn()
}));

describe("ProtectedRoute", () => {
  it("should show spinner when loading", () => {
    (useAuth as any).mockReturnValue({ loading: true });
    render(
      <MemoryRouter>
        <ProtectedRoute><div>Children</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText(/Neural_Sync_Active/i)).toBeInTheDocument();
  });

  it("should redirect to / when not logged in", () => {
    (useAuth as any).mockReturnValue({ loading: false, user: null });
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/" element={<div>Landing</div>} />
          <Route path="/dashboard" element={<ProtectedRoute><div>Dashboard</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Landing")).toBeInTheDocument();
  });

  it("should redirect to /onboarding if profile not complete (app route)", () => {
    (useAuth as any).mockReturnValue({ 
      loading: false, 
      user: { uid: "123" }, 
      profile: { onboardingComplete: false } 
    });
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/onboarding" element={<div>Onboarding</div>} />
          <Route path="/dashboard" element={<ProtectedRoute><div>Dashboard</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Onboarding")).toBeInTheDocument();
  });

  it("should allow access to dashboard if onboarding complete", () => {
    (useAuth as any).mockReturnValue({ 
      loading: false, 
      user: { uid: "123" }, 
      profile: { onboardingComplete: true } 
    });
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <ProtectedRoute><div>Dashboard Page</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });

  it("should redirect to /dashboard if already complete (onboarding route)", () => {
    (useAuth as any).mockReturnValue({ 
      loading: false, 
      user: { uid: "123" }, 
      profile: { onboardingComplete: true } 
    });
    render(
      <MemoryRouter initialEntries={["/onboarding"]}>
        <Routes>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="/onboarding" element={<ProtectedRoute requiresOnboarding><div>Onboarding</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
