import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, calendarProvider, db, handleFirestoreError, OperationType } from "../lib/firebase";
import {
  signInWithPopup,
  reauthenticateWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserProfile } from "../types";

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<{ isNewUser: boolean }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  connectGoogleCalendar: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map a Firebase Auth popup error to a user-facing message. Shared by the
// login and Calendar-connect flows so both surface the same friendly text for
// common cases (popup blocked/closed, provider disabled, unauthorized domain).
function friendlyAuthError(error: unknown): string {
  if (error && typeof error === "object") {
    const code = (error as { code?: string }).code || "";
    const message = (error as { message?: string }).message || "";
    if (
      code === "auth/popup-closed-by-user" ||
      message.includes("popup-closed-by-user") ||
      code === "auth/cancelled-popup-request" ||
      message.includes("cancelled-popup-request")
    ) {
      return "The sign-in popup was closed or cancelled. If this app runs inside an iframe that blocks popups, try opening it in a new tab.";
    }
    if (code === "auth/popup-blocked" || message.includes("popup-blocked")) {
      return "The browser blocked the sign-in popup. Please enable popups for this site, or open this application in a new tab.";
    }
    if (code === "auth/operation-not-allowed" || message.includes("operation-not-allowed")) {
      return "Google sign-in is not enabled on this Firebase project. Please enable the Google provider under Authentication in your Firebase console.";
    }
    if (code === "auth/unauthorized-domain" || message.includes("unauthorized-domain")) {
      return "This domain is not authorized for sign-in. Please add it to Authorized domains in your Firebase console settings.";
    }
    if (message) return `Authentication error: ${message}`;
  }
  return "Sign-in failed. Please try again.";
}

// Clamp an identity string from the OAuth provider before persisting it.
// Values come from Google, but we still constrain type/length defensively so a
// malformed/oversized value can't be written to Firestore.
function sanitizeIdentityField(value: string | null | undefined, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim().slice(0, 256);
  return trimmed.length > 0 ? trimmed : fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Track Firebase auth state. Fires once on mount with the current user
  // (or null), then on every sign-in / sign-out.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const fetchProfile = async (uid: string) => {
    setProfileLoading(true);
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setProfile({ id: uid, ...userSnap.data() } as UserProfile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`, uid);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (firebaseUser?.uid) {
      const uid = firebaseUser.uid;
      const initOrFetchProfile = async () => {
        setProfileLoading(true);
        try {
          const userRef = doc(db, "users", uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            const newProfile: Partial<UserProfile> = {
              email: sanitizeIdentityField(firebaseUser.email, ""),
              name: sanitizeIdentityField(firebaseUser.displayName, "New User"),
              plan: "starter",
              subscriptionStatus: "inactive",
              onboardingComplete: false,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userRef, newProfile);
            setProfile({ id: uid, ...newProfile } as UserProfile);
          } else {
            setProfile({ id: uid, ...userSnap.data() } as UserProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${uid}`, uid);
        } finally {
          setProfileLoading(false);
        }
      };
      initOrFetchProfile();
    } else {
      setProfile(null);
    }
  }, [authLoading, firebaseUser?.uid]);

  const signIn = async (): Promise<{ isNewUser: boolean }> => {
    // Google sign-in via Firebase popup, using the identity-only provider (no
    // Calendar scope) so login consent stays minimal. The onAuthStateChanged
    // effect above handles first-time Firestore profile creation; navigation in
    // the UI is driven by profile.onboardingComplete, so isNewUser is
    // informational. Rethrow a friendly message so callers (Landing) can show it.
    try {
      await signInWithPopup(auth, googleProvider);
      return { isNewUser: false };
    } catch (error) {
      throw new Error(friendlyAuthError(error));
    }
  };

  const logout = async () => {
    setAccessToken(null);
    await signOut(auth);
  };

  const refreshProfile = async () => {
    const uid = auth.currentUser?.uid;
    if (uid) await fetchProfile(uid);
  };

  // Obtain a Calendar-scoped Google access token for the *already signed-in*
  // user. Uses reauthenticateWithPopup against auth.currentUser so that picking
  // a different Google account in the popup cannot silently switch the app's
  // authenticated identity (and thus the loaded users/{uid} profile). Falls
  // back to a plain popup only if somehow called while signed out.
  const connectGoogleCalendar = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const current = auth.currentUser;
      const result = current
        ? await reauthenticateWithPopup(current, calendarProvider)
        : await signInWithPopup(auth, calendarProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
        return { success: true };
      }
      return { success: false, error: "No access token returned from Google." };
    } catch (error) {
      return { success: false, error: friendlyAuthError(error) };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: firebaseUser,
        profile,
        loading: authLoading || profileLoading,
        signIn,
        logout,
        refreshProfile,
        accessToken,
        setAccessToken,
        connectGoogleCalendar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
