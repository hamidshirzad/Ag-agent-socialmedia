import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const mockUseAuth = vi.fn();
vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUser = { uid: "uid1", email: "a@b.com" };

function renderRoute(
  initialPath: string,
  requiresOnboarding = false,
  childContent = "protected-content"
) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<div>home</div>} />
        <Route path="/onboarding" element={<div>onboarding-page</div>} />
        <Route path="/dashboard" element={<div>dashboard-page</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute requiresOnboarding={requiresOnboarding}>
              <div>{childContent}</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("shows loading spinner when loading is true", () => {
    mockUseAuth.mockReturnValue({ user: null, profile: null, loading: true });
    render(
      <MemoryRouter>
        <ProtectedRoute><div>content</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText("Neural_Sync_Active")).toBeInTheDocument();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("redirects to / when not authenticated", () => {
    mockUseAuth.mockReturnValue({ user: null, profile: null, loading: false });
    renderRoute("/protected");
    expect(screen.getByText("home")).toBeInTheDocument();
  });

  it("renders children when authenticated and onboarding complete (app route)", () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      profile: { onboardingComplete: true },
      loading: false,
    });
    renderRoute("/protected", false, "dashboard-content");
    expect(screen.getByText("dashboard-content")).toBeInTheDocument();
  });

  it("redirects to /onboarding when authenticated but onboarding incomplete (app route)", () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      profile: { onboardingComplete: false },
      loading: false,
    });
    renderRoute("/protected", false);
    expect(screen.getByText("onboarding-page")).toBeInTheDocument();
  });

  it("redirects to /dashboard when requiresOnboarding=true and onboarding already complete", () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      profile: { onboardingComplete: true },
      loading: false,
    });
    renderRoute("/protected", true);
    expect(screen.getByText("dashboard-page")).toBeInTheDocument();
  });

  it("renders onboarding children when requiresOnboarding=true and not yet complete", () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      profile: { onboardingComplete: false },
      loading: false,
    });
    renderRoute("/protected", true, "onboarding-content");
    expect(screen.getByText("onboarding-content")).toBeInTheDocument();
  });
});
