import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { AuthProvider, useAuth } from "./AuthContext";

// All Firebase modules must be mocked before the module is imported
vi.mock("firebase/app", () => ({ initializeApp: vi.fn(() => ({})) }));
vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn((_auth, cb) => { cb(null); return () => {}; }),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  getDocFromServer: vi.fn(() => Promise.resolve()),
  collection: vi.fn(),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
}));
vi.mock("../../firebase-applet-config.json", () => ({
  default: { apiKey: "t", authDomain: "t", projectId: "t", firestoreDatabaseId: "(default)" },
}));

import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { getDoc, setDoc } from "firebase/firestore";
import { beforeEach } from "vitest";

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(AuthProvider, null, children);

describe("signIn()", () => {
  beforeEach(() => vi.clearAllMocks());
  it("propagates error when popup is cancelled — does NOT return silently", async () => {
    const popupError = Object.assign(new Error("popup-closed-by-user"), {
      code: "auth/popup-closed-by-user",
    });
    vi.mocked(signInWithPopup).mockRejectedValue(popupError);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(() => result.current.signIn())
    ).rejects.toThrow("popup-closed-by-user");
  });

  it("returns { isNewUser: true } and creates Firestore profile for first-time users", async () => {
    const mockUser = { uid: "new-uid", email: "new@test.com", displayName: "New User" };
    vi.mocked(signInWithPopup).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);
    vi.mocked(setDoc).mockResolvedValue(undefined);
    // Reset onAuthStateChanged to not fire during this test
    vi.mocked(onAuthStateChanged).mockImplementation((_auth, cb: any) => { cb(null); return () => {}; });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let signInResult: { isNewUser: boolean } | undefined;
    await act(async () => {
      signInResult = await result.current.signIn();
    });

    expect(signInResult?.isNewUser).toBe(true);
    expect(vi.mocked(setDoc)).toHaveBeenCalled();
  });

  it("returns { isNewUser: false } for returning users without creating a profile", async () => {
    const mockUser = { uid: "existing-uid", email: "old@test.com", displayName: "Old User" };
    const existingData = {
      email: "old@test.com", name: "Old User", plan: "starter",
      subscriptionStatus: "active", onboardingComplete: true, createdAt: "2026-01-01",
    };
    vi.mocked(signInWithPopup).mockResolvedValue({ user: mockUser } as any);
    vi.mocked(getDoc).mockResolvedValue({ exists: () => true, data: () => existingData } as any);

    const { result } = renderHook(() => useAuth(), { wrapper });

    let signInResult: { isNewUser: boolean } | undefined;
    await act(async () => {
      signInResult = await result.current.signIn();
    });

    expect(signInResult?.isNewUser).toBe(false);
    expect(vi.mocked(setDoc)).not.toHaveBeenCalled();
  });
});
