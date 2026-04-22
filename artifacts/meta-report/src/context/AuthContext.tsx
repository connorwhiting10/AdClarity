import React, { createContext, useContext } from "react";
import { useAuth as useReplitAuth, type AuthUser } from "@/hooks/use-auth";

export type { AuthUser };

type AuthContextValue = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoaded: boolean;
  reportLimit: number;
  login: () => void;
  signup: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoggedIn: false,
  isLoaded: false,
  reportLimit: 1,
  login: () => {},
  signup: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, login, logout } = useReplitAuth();

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: isAuthenticated,
        isLoaded: !isLoading,
        reportLimit: isAuthenticated ? 3 : 1,
        login,
        signup: login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
