import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "adclarity_user";

export type AuthUser = {
  email: string;
  name?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  reportLimit: number;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoggedIn: false,
  reportLimit: 1,
  login: async () => {},
  signup: async () => {},
  loginWithGoogle: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const persist = (u: AuthUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const login = useCallback(async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    persist({ email });
  }, []);

  const signup = useCallback(async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 700));
    persist({ email });
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 400));
    persist({ email: "google-user@gmail.com", name: "Google User" });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        reportLimit: user ? 3 : 1,
        login,
        signup,
        loginWithGoogle,
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
