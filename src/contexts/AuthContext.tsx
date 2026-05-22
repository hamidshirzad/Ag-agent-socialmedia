import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth0, User as Auth0User } from "@auth0/auth0-react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserProfile } from "../types";

interface AuthContextType {
  user: Auth0User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<{ isNewUser: boolean }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
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
    }
  }, [isLoading, isAuthenticated, auth0User?.sub]);

  const signIn = async (): Promise<{ isNewUser: boolean }> => {
    await loginWithRedirect();
    return { isNewUser: false };
  };

  const logout = async () => {
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
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
