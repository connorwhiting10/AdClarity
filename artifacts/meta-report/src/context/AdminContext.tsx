import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  getStoredToken,
  verifySession,
  adminLogin,
  adminLogout,
  clearToken,
  decodeTokenPayload,
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

    // Apply session immediately from the stored token (no network needed)
    const localSession = decodeTokenPayload(token);
    setSession(localSession);
    setLoading(false);

    // Background server verification — quietly updates or clears if token invalid
    verifySession(token).then((serverSession) => {
      if (serverSession) {
        setSession(serverSession);
      } else {
        // Server says token is invalid — clear it
        clearToken();
        setSession(null);
      }
    });
  }, []);

  const login = useCallback(async (email: string, accessCode: string) => {
    // Call the server to sign the token
    await adminLogin(email, accessCode);
    const token = getStoredToken();
    if (!token) throw new Error("Login failed — no token received");

    // Apply session immediately from the freshly stored token
    const localSession = decodeTokenPayload(token);
    if (!localSession) throw new Error("Login failed — invalid token");
    setSession(localSession);

    // Background verification (non-blocking)
    verifySession(token).then((serverSession) => {
      if (serverSession) setSession(serverSession);
    });
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
