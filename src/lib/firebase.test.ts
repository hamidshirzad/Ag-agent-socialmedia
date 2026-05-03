import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleFirestoreError, OperationType, auth } from "./firebase";

// Mock auth.currentUser
vi.mock("./firebase", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    auth: {
      currentUser: null
    }
  };
});

describe("handleFirestoreError", () => {
  it("should extract message from Error object", () => {
    const error = new Error("Test error");
    expect(() => handleFirestoreError(error, OperationType.GET, "test-path"))
      .toThrow(/Test error/);
  });

  it("should convert non-Error values to string", () => {
    expect(() => handleFirestoreError("string error", OperationType.GET, "test-path"))
      .toThrow(/string error/);
  });

  it("should include auth info in the error message", () => {
    const error = new Error("Auth test");
    try {
      handleFirestoreError(error, OperationType.GET, "path");
    } catch (e: any) {
      const info = JSON.parse(e.message);
      expect(info).toHaveProperty("authInfo");
      expect(info.operationType).toBe(OperationType.GET);
      expect(info.path).toBe("path");
    }
  });

  it("should handle null currentUser gracefully", () => {
    (auth as any).currentUser = null;
    try {
      handleFirestoreError(new Error("Null user"), OperationType.WRITE, "path");
    } catch (e: any) {
      const info = JSON.parse(e.message);
      expect(info.authInfo.userId).toBeUndefined();
    }
  });
});
