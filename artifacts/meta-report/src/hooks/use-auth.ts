import { useCallback } from "react";
import { useUser, useClerk } from "@clerk/react";

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

export function useAuth(): AuthState {
  const { user, isLoaded } = useUser();
  const { openSignIn, signOut } = useClerk();

  const login = useCallback(() => openSignIn(), [openSignIn]);
  const logout = useCallback(() => signOut(), [signOut]);

  return {
    user: isLoaded && user
      ? {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? null,
          firstName: user.firstName ?? null,
          lastName: user.lastName ?? null,
          profileImageUrl: user.imageUrl ?? null,
        }
      : null,
    isLoading: !isLoaded,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
