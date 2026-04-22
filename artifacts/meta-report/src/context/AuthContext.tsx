import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth as useReplitAuth, type AuthUser } from "@/hooks/use-auth";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, login: doOidcLogin, logout } = useReplitAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const handleContinue = useCallback(() => {
    setModalOpen(false);
    doOidcLogin();
  }, [doOidcLogin]);

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
