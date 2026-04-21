import React, { createContext, useContext, useEffect } from "react";
import { useUser, useClerk } from "@clerk/react";

export type AuthUser = {
  email: string;
  name?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoaded: boolean;
  reportLimit: number;
  login: () => void;
  signup: () => void;
  loginWithGoogle: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoggedIn: false,
  isLoaded: false,
  reportLimit: 1,
  login: () => {},
  signup: () => {},
  loginWithGoogle: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn, isLoaded } = useUser();
  const { openSignIn, openSignUp, signOut } = useClerk();

  useEffect(() => {
    if (isSignedIn && user) {
      const email = user.primaryEmailAddress?.emailAddress;
      if (email) {
        fetch("/api/users/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }).catch(() => {});
      }
    }
  }, [isSignedIn, user]);

  const authUser: AuthUser | null =
    isSignedIn && user
      ? {
          email: user.primaryEmailAddress?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "",
          name: user.fullName ?? undefined,
        }
      : null;

  return (
    <AuthContext.Provider
      value={{
        user: authUser,
        isLoggedIn: isSignedIn ?? false,
        isLoaded,
        reportLimit: isSignedIn ? 3 : 1,
        login: () => openSignIn(),
        signup: () => openSignUp(),
        loginWithGoogle: () => openSignIn(),
        logout: () => signOut(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
