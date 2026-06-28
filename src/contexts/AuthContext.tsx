import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, db, handleFirestoreError, OperationType } from "../lib/firebase";
import {
  signInWithPopup,
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
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || "New User",
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
    // Google sign-in via Firebase popup. The onAuthStateChanged effect above
    // handles first-time Firestore profile creation; navigation in the UI is
    // driven by profile.onboardingComplete, so isNewUser is informational.
    await signInWithPopup(auth, googleProvider);
    return { isNewUser: false };
  };

  const logout = async () => {
    setAccessToken(null);
    await signOut(auth);
  };

  const refreshProfile = async () => {
    const uid = auth.currentUser?.uid;
    if (uid) await fetchProfile(uid);
  };

  // Separate Google sign-in (via Firebase popup) used only to obtain a
  // Calendar-scoped access token. Independent of the Auth0 identity above.
  const connectGoogleCalendar = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
        return { success: true };
      }
      return { success: false, error: "No access token returned from Google." };
    } catch (error: any) {
      let friendlyMessage = "Failed to connect Google Calendar. Please try again.";
      if (error && typeof error === "object") {
        const code = error.code || "";
        const message = error.message || "";

        if (
          code === "auth/popup-closed-by-user" ||
          message.includes("popup-closed-by-user") ||
          code === "auth/cancelled-popup-request" ||
          message.includes("cancelled-popup-request")
        ) {
          friendlyMessage = "The Google Calendar connection popup was closed or cancelled. This app may run inside an iframe that blocks popups - try opening it in a new tab.";
        } else if (code === "auth/popup-blocked" || message.includes("popup-blocked")) {
          friendlyMessage = "The browser blocked the connection popup. Please enable popups for this site, or open this application in a new tab.";
        } else if (code === "auth/operation-not-allowed" || message.includes("operation-not-allowed")) {
          friendlyMessage = "Google sign-in is not enabled on this Firebase project. Please enable the Google provider under Authentication in your Firebase console.";
        } else if (code === "auth/unauthorized-domain" || message.includes("unauthorized-domain")) {
          friendlyMessage = "This domain is not authorized for OAuth in Firebase. Please add this domain to Authorized domains in your Firebase console settings.";
        } else if (message) {
          friendlyMessage = `Authentication error: ${message}`;
        }
      }
      return { success: false, error: friendlyMessage };
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
