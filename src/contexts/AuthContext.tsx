import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { signInWithCustomToken, signOut as firebaseSignOut, type User } from "firebase/auth";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { UserProfile } from "../types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<{ isNewUser: boolean }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function getFirebaseCustomToken(idToken: string): Promise<string> {
  const resp = await fetch("/.netlify/functions/firebase-custom-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!resp.ok) {
    const { error } = await resp.json().catch(() => ({ error: "Token exchange failed" }));
    throw new Error(error);
  }
  const { firebaseToken } = await resp.json();
  return firebaseToken;
}

async function syncToFirestore(
  fbUser: User,
  email: string,
  name: string
): Promise<{ profile: UserProfile; isNewUser: boolean }> {
  const uid     = fbUser.uid;
  const userRef = doc(db, "users", uid);
  const snap    = await getDoc(userRef).catch(error => handleFirestoreError(error, OperationType.GET, userRef.path));

  if (!snap.exists()) {
    const newProfile: Partial<UserProfile> = {
      email,
      name: name || "New User",
      plan: "starter",
      subscriptionStatus: "inactive",
      onboardingComplete: false,
      createdAt: new Date().toISOString(),
    };
    await setDoc(userRef, newProfile).catch(error => handleFirestoreError(error, OperationType.CREATE, userRef.path));
    return { profile: { id: uid, ...newProfile } as UserProfile, isNewUser: true };
  }

  return { profile: { id: uid, ...snap.data() } as UserProfile, isNewUser: false };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    loginWithPopup,
    logout: auth0Logout,
    getIdTokenClaims,
    isAuthenticated,
    isLoading: auth0Loading,
    user: auth0User,
  } = useAuth0();

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile,      setProfile]      = useState<UserProfile | null>(null);
  const [loading,      setLoading]      = useState(true);

  // Restore Firebase session when Auth0 session already exists (page reload)
  useEffect(() => {
    if (auth0Loading) return;

    if (!isAuthenticated || !auth0User) {
      setLoading(false);
      return;
    }

    const restore = async () => {
      try {
        let fbUser = auth.currentUser;

        if (!fbUser) {
          const claims  = await getIdTokenClaims();
          const idToken = claims?.__raw;
          if (!idToken) throw new Error("No ID token");

          const firebaseToken = await getFirebaseCustomToken(idToken);
          const credential    = await signInWithCustomToken(auth, firebaseToken);
          fbUser              = credential.user;
        }

        const { profile: prof } = await syncToFirestore(
          fbUser,
          auth0User.email ?? "",
          auth0User.name  ?? ""
        );

        setFirebaseUser(fbUser);
        setProfile(prof);
      } catch (err) {
        console.error("[Auth] Session restore failed:", err);
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, [isAuthenticated, auth0Loading]);

  const signIn = async (): Promise<{ isNewUser: boolean }> => {
    await loginWithPopup();

    const claims  = await getIdTokenClaims();
    const idToken = claims?.__raw;
    if (!idToken) throw new Error("No ID token after login");

    const firebaseToken = await getFirebaseCustomToken(idToken);
    const credential    = await signInWithCustomToken(auth, firebaseToken);
    const fbUser        = credential.user;

    const { profile: prof, isNewUser } = await syncToFirestore(
      fbUser,
      (claims?.email as string | undefined) ?? "",
      (claims?.name  as string | undefined) ?? ""
    );

    setFirebaseUser(fbUser);
    setProfile(prof);
    setLoading(false);
    return { isNewUser };
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setFirebaseUser(null);
    setProfile(null);
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const refreshProfile = async () => {
    if (!firebaseUser) return;
    const userRef = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(userRef).catch(error => handleFirestoreError(error, OperationType.GET, userRef.path));
    if (snap.exists()) setProfile({ id: firebaseUser.uid, ...snap.data() } as UserProfile);
  };

  return (
    <AuthContext.Provider value={{
      user:     firebaseUser,
      profile,
      loading:  loading || auth0Loading,
      signIn,
      logout,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
