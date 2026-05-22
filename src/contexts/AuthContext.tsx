import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserProfile } from "../types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<{ isNewUser: boolean }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const fetchProfile = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setProfile({ id: uid, ...userSnap.data() } as UserProfile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    }
  };

  useEffect(() => {
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

  const signIn = async (): Promise<{ isNewUser: boolean }> => {
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
        return { isNewUser: true };
      } else {
        setProfile({ id: firebaseUser.uid, ...userSnap.data() } as UserProfile);
        return { isNewUser: false };
      }
    } catch (error) {
      console.error("Login failed", error);
      return { isNewUser: false };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setAccessToken(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid);
  };

  return (
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
