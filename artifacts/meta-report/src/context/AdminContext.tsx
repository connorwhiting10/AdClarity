import React from "react";
import { useAuth } from "@/context/AuthContext";

/**
 * Phase-4 shim: the admin-JWT system has been superseded by Supabase.
 * This file re-exports the old surface backed by AuthContext so existing
 * callers keep compiling. Phase 5 deletes it entirely.
 */

type AdminSessionShim = {
  isAdmin: boolean;
  plan: "free" | "basic" | "pro";
  email?: string | null;
} | null;

type AdminContextValue = {
  session: AdminSessionShim;
  isAdmin: boolean;
  isPro: boolean;
  loading: boolean;
  login: (email: string, accessCode: string) => Promise<void>;
  logout: () => Promise<void>;
};

export function AdminProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useAdmin(): AdminContextValue {
  const { isAdmin, plan, isLoaded, logout, user } = useAuth();
  return {
    session: user
      ? { isAdmin, plan, email: user.email }
      : null,
    isAdmin,
    isPro: plan === "pro" || isAdmin,
    loading: !isLoaded,
    login: async () => {
      // admin-JWT login is retired; real sign-in happens through AuthContext.
    },
    logout,
  };
}
