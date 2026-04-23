import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import AuthModal from "@/components/AuthModal";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Plan = Database["public"]["Enums"]["plan_enum"];

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

type ModalMode = "signin" | "signup";

type AuthContextValue = {
  // Back-compat surface (do not break existing consumers)
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoaded: boolean;
  reportLimit: number;
  login: () => void;
  signup: () => void;
  logout: () => Promise<void>;

  // New Supabase surface
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  plan: Plan;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signInWithOAuth: (provider: "google" | "facebook") => Promise<{ error: string | null }>;
  sendMagicLink: (email: string) => Promise<{ error: string | null }>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(
  sUser: SupabaseUser | null,
  profile: Profile | null,
): AuthUser | null {
  if (!sUser) return null;
  return {
    id: sUser.id,
    email: profile?.email ?? sUser.email ?? null,
    firstName: profile?.first_name ?? null,
    lastName: profile?.last_name ?? null,
    profileImageUrl: profile?.avatar_url ?? null,
  };
}

function limitForPlan(plan: Plan): number {
  if (plan === "basic" || plan === "pro") return Infinity;
  return 3;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("signin");

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const [{ data: p }, { data: adminRow }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("admins").select("user_id").eq("user_id", userId).maybeSingle(),
      ]);
      setProfile(p ?? null);
      setIsAdmin(!!adminRow);
    } catch (err) {
      console.error("loadProfile failed", err);
      // Leave whatever profile we already have; don't block the UI.
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Flip isLoaded as soon as we know the session, regardless of whether
    // the profile fetch has finished — a stalled profile query must not
    // wedge the whole app in a loading spinner.
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setIsLoaded(true);
      if (data.session?.user) void loadProfile(data.session.user.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      if (newSession?.user) {
        void loadProfile(newSession.user.id);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const plan: Plan = profile?.plan ?? "free";
  const reportLimit = isAdmin
    ? Infinity
    : !session
      ? 1 // guest (no account) — nudge to sign up after first report
      : limitForPlan(plan);

  const openLogin = useCallback(() => {
    setModalMode("signin");
    setModalOpen(true);
  }, []);
  const openSignup = useCallback(() => {
    setModalMode("signup");
    setModalOpen(true);
  }, []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("signOut failed; clearing session locally", err);
    } finally {
      // Force local state clear so UI updates even if the server call hung.
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
    }
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    // If the project requires email confirmation, data.session is null and the user must click the link.
    return {
      error: error?.message ?? null,
      needsEmailConfirmation: !error && !data.session,
    };
  }, []);

  const signInWithOAuth = useCallback(async (provider: "google" | "facebook") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error?.message ?? null };
  }, []);

  const sendMagicLink = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error?.message ?? null };
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error: error?.message ?? null };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const user = useMemo(() => mapUser(session?.user ?? null, profile), [session, profile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoggedIn: !!session,
      isLoaded,
      reportLimit,
      login: openLogin,
      signup: openSignup,
      logout,
      session,
      profile,
      isAdmin,
      plan,
      signInWithPassword,
      signUp,
      signInWithOAuth,
      sendMagicLink,
      sendPasswordReset,
      refreshProfile,
    }),
    [
      user,
      session,
      isLoaded,
      reportLimit,
      openLogin,
      openSignup,
      logout,
      profile,
      isAdmin,
      plan,
      signInWithPassword,
      signUp,
      signInWithOAuth,
      sendMagicLink,
      sendPasswordReset,
      refreshProfile,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal
        open={modalOpen}
        mode={modalMode}
        onModeChange={setModalMode}
        onClose={closeModal}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
