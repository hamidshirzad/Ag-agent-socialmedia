import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, User, signInWithPopup, signOut } from "firebase/auth";
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const signingInRef = useRef(false);

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
        if (!signingInRef.current) {
          // Page-load / session-restore path — signIn() is not active, own the fetch here
          await fetchProfile(user.uid);
          setLoading(false);
        }
        // When signingInRef is true, signIn() owns profile fetch + setLoading
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const signIn = async (): Promise<{ isNewUser: boolean }> => {
    signingInRef.current = true;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      setUser(firebaseUser);

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
    } finally {
      signingInRef.current = false;
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout, refreshProfile }}>
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
