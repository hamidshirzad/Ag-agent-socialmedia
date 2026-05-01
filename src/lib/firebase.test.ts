import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted ensures these values are initialized before vi.mock factories run
const { mockAuth } = vi.hoisted(() => {
  const mockAuth: { currentUser: Record<string, unknown> | null } = {
    currentUser: {
      uid: "uid123",
      email: "test@example.com",
      emailVerified: true,
      isAnonymous: false,
      tenantId: null,
      providerData: [{ providerId: "google.com", email: "test@example.com" }],
    },
  };
  return { mockAuth };
});

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => mockAuth),
  GoogleAuthProvider: vi.fn(() => ({})),
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(),
  getDocFromServer: vi.fn(() => Promise.resolve()),
  collection: vi.fn(),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  setDoc: vi.fn(),
}));

vi.mock("../../firebase-applet-config.json", () => ({
  default: {
    apiKey: "test",
    authDomain: "test",
    projectId: "test",
    firestoreDatabaseId: "(default)",
  },
}));

import { handleFirestoreError, OperationType } from "./firebase";

describe("handleFirestoreError", () => {
  beforeEach(() => {
    mockAuth.currentUser = {
      uid: "uid123",
      email: "test@example.com",
      emailVerified: true,
      isAnonymous: false,
      tenantId: null,
      providerData: [{ providerId: "google.com", email: "test@example.com" }],
    };
  });

  it("extracts message from Error instances", () => {
    expect(() =>
      handleFirestoreError(new Error("permission denied"), OperationType.GET, "users/123")
    ).toThrow();

    try {
      handleFirestoreError(new Error("permission denied"), OperationType.GET, "users/123");
    } catch (e) {
      const parsed = JSON.parse((e as Error).message);
      expect(parsed.error).toBe("permission denied");
      expect(parsed.operationType).toBe("get");
      expect(parsed.path).toBe("users/123");
    }
  });

  it("converts non-Error values via String()", () => {
    try {
      handleFirestoreError("something went wrong", OperationType.CREATE, null);
    } catch (e) {
      const parsed = JSON.parse((e as Error).message);
      expect(parsed.error).toBe("something went wrong");
      expect(parsed.path).toBeNull();
    }
  });

  it("serializes auth.currentUser into authInfo", () => {
    try {
      handleFirestoreError(new Error("x"), OperationType.GET, "path");
    } catch (e) {
      const parsed = JSON.parse((e as Error).message);
      expect(parsed.authInfo.userId).toBe("uid123");
      expect(parsed.authInfo.email).toBe("test@example.com");
      expect(parsed.authInfo.emailVerified).toBe(true);
      expect(parsed.authInfo.providerInfo).toEqual([
        { providerId: "google.com", email: "test@example.com" },
      ]);
    }
  });

  it("handles null currentUser with empty/undefined authInfo fields", () => {
    mockAuth.currentUser = null;

    try {
      handleFirestoreError(new Error("x"), OperationType.DELETE, "col/doc");
    } catch (e) {
      const parsed = JSON.parse((e as Error).message);
      expect(parsed.authInfo.userId).toBeUndefined();
      expect(parsed.authInfo.email).toBeUndefined();
      expect(parsed.authInfo.providerInfo).toEqual([]);
    }
  });

  it("always throws — never just logs", () => {
    expect(() =>
      handleFirestoreError(new Error("any"), OperationType.LIST, null)
    ).toThrow();
  });

  it("thrown error message is valid JSON", () => {
    try {
      handleFirestoreError(new Error("bad"), OperationType.UPDATE, "users/x");
    } catch (e) {
      expect(() => JSON.parse((e as Error).message)).not.toThrow();
    }
  });
});
