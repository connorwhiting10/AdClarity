import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth as useClerkAuth, type AuthUser } from "@/hooks/use-auth";
import AuthModal from "@/components/AuthModal";

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

/**
 * Derives the Clerk hosted sign-in URL from the publishable key.
 * Clerk's publishable key encodes the frontend API host in base64.
 * This lets us navigate directly to Clerk's hosted sign-in page, which
 * works in all environments (including iframes and unlisted domains).
 */
function buildClerkSignInUrl(): string {
  const pk = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string) ?? "";
  const b64 = pk.replace(/^pk_(test|live)_/, "");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const frontendApi = atob(padded).replace(/\$+$/, "").trim();
  const returnUrl = encodeURIComponent(window.location.href);
  return `https://${frontendApi}/sign-in?redirect_url=${returnUrl}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useClerkAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const handleContinue = useCallback(() => {
    setModalOpen(false);
    // Navigate the top-level window so it works even inside Replit's iframe preview
    const target = window.top ?? window;
    target.location.href = buildClerkSignInUrl();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: isAuthenticated,
        isLoaded: !isLoading,
        reportLimit: isAuthenticated ? 3 : 1,
        login: openModal,
        signup: openModal,
        logout,
      }}
    >
      {children}
      <AuthModal open={modalOpen} onClose={closeModal} onContinue={handleContinue} />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
