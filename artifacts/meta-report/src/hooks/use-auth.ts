import { useState, useEffect, useCallback } from "react";

// TODO (Clerk): Replace this entire hook with Clerk hooks:
//
// import { useUser, useClerk } from "@clerk/react";
//
// export function useAuth(): AuthState {
//   const { user, isLoaded } = useUser();
//   const { signOut, openSignIn } = useClerk();
//
//   const login = useCallback(() => openSignIn(), [openSignIn]);
//   const logout = useCallback(() => signOut(), [signOut]);
//
//   return {
//     user: isLoaded && user
//       ? { id: user.id, email: user.primaryEmailAddress?.emailAddress ?? null,
//           firstName: user.firstName ?? null, lastName: user.lastName ?? null,
//           profileImageUrl: user.imageUrl ?? null }
//       : null,
//     isLoading: !isLoaded,
//     isAuthenticated: !!user,
//     login,
//     logout,
//   };
// }

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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/user", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ user: AuthUser | null }>;
      })
      .then((data) => {
        if (!cancelled) {
          setUser(data.user ?? null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  const login = useCallback(() => {
    const base = (import.meta.env.BASE_URL ?? "/").replace(/\/+$/, "") || "/";
    window.location.href = `/api/login?returnTo=${encodeURIComponent(base)}`;
  }, []);

  const logout = useCallback(() => {
    window.location.href = "/api/logout";
  }, []);

  return { user, isLoading, isAuthenticated: !!user, login, logout };
}
