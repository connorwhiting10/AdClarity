import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  getStoredToken,
  verifySession,
  adminLogin,
  adminLogout,
  clearToken,
  type AdminSession,
} from "@/lib/admin-auth";

type AdminContextValue = {
  session: AdminSession | null;
  isAdmin: boolean;
  isPro: boolean;
  loading: boolean;
  login: (email: string, accessCode: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminContext = createContext<AdminContextValue>({
  session: null,
  isAdmin: false,
  isPro: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    verifySession(token).then((s) => {
      setSession(s);
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, accessCode: string) => {
    await adminLogin(email, accessCode);
    const token = getStoredToken();
    if (token) {
      const s = await verifySession(token);
      setSession(s);
    }
  }, []);

  const logout = useCallback(async () => {
    await adminLogout();
    clearToken();
    setSession(null);
  }, []);

  return (
    <AdminContext.Provider
      value={{
        session,
        isAdmin: session?.isAdmin === true,
        isPro: session?.plan === "pro",
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
