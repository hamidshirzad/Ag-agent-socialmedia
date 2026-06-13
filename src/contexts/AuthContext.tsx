import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth0, User as Auth0User } from "@auth0/auth0-react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { onAuthStateChanged, User, signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserProfile } from "../types";

interface AuthContextType {
  user: Auth0User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user: auth0User,
    isLoading,
    isAuthenticated,
    loginWithRedirect,
    logout: auth0Logout,
  } = useAuth0();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

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
    if (isLoading) return;

    if (isAuthenticated && auth0User?.sub) {
      const uid = auth0User.sub;
      const initOrFetchProfile = async () => {
        setProfileLoading(true);
        try {
          const userRef = doc(db, "users", uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            const newProfile: Partial<UserProfile> = {
              email: auth0User.email || "",
              name: auth0User.name || "New User",
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchProfile(user.uid);
      } else {
        setProfile(null);
        setAccessToken(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async (): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      setUser(firebaseUser); // Update immediately to prevent race conditions

      // Extract OAuth Credential to get Access Token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
      }

      // Initialize profile if not exists
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const newProfile: Partial<UserProfile> = {
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "New User",
          plan: 'starter',
          subscriptionStatus: 'inactive',
          onboardingComplete: false,
          createdAt: new Date().toISOString(),
        };
        await setDoc(userRef, newProfile);
        setProfile({ id: firebaseUser.uid, ...newProfile } as UserProfile);
        return { success: true, isNewUser: true };
      } else {
        setProfile({ id: firebaseUser.uid, ...userSnap.data() } as UserProfile);
        return { success: true, isNewUser: false };
      }
    } catch (error: any) {
      console.error("Login failed", error);
      
      let friendlyMessage = "Failed to sign in. Please try again.";
      if (error && typeof error === "object") {
        const code = error.code || "";
        const message = error.message || "";
        
        if (
          code === "auth/popup-closed-by-user" || 
          message.includes("popup-closed-by-user") ||
          code === "auth/cancelled-popup-request" ||
          message.includes("cancelled-popup-request")
        ) {
          friendlyMessage = "The login popup was closed or cancelled. This app runs inside an iframe (the AI Studio preview), which restricts/blocks popups. To login successfully, please allow popups in your browser settings, or open this page in a new tab using the 'Launch in New Tab' button or the editor header button for a seamless experience.";
        } else if (code === "auth/popup-blocked" || message.includes("popup-blocked")) {
          friendlyMessage = "The browser blocked the login popup. Please enable popups for this site, or open this application in a new tab.";
        } else if (code === "auth/operation-not-allowed" || message.includes("operation-not-allowed")) {
          friendlyMessage = "Google sign-in is not enabled on this Firebase project. Please enable Google provider under Authentication in your Firebase console.";
        } else if (code === "auth/unauthorized-domain" || message.includes("unauthorized-domain")) {
          friendlyMessage = "This domain is not authorized for OAuth in Firebase. Please add this preview domain to Authorized domains in your Firebase console settings.";
        } else if (message) {
          friendlyMessage = `Authentication error: ${message}`;
        }
      }
      return { success: false, error: friendlyMessage };
    }
  }, [isLoading, isAuthenticated, auth0User?.sub]);

  const signIn = async (): Promise<{ isNewUser: boolean }> => {
    await loginWithRedirect();
    return { isNewUser: false };
  };

  const logout = async () => {
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    await signOut(auth);
    setAccessToken(null);
  };

  const refreshProfile = async () => {
    if (auth0User?.sub) await fetchProfile(auth0User.sub);
  };

  return (
    <AuthContext.Provider
      value={{
        user: auth0User ?? null,
        profile,
        loading: isLoading || profileLoading,
        signIn,
        logout,
        refreshProfile,
      }}
    >
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout, refreshProfile, accessToken, setAccessToken }}>
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
