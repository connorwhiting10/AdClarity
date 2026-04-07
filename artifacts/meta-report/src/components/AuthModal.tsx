import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

type Mode = "login" | "signup";

type Props = {
  initialMode?: Mode;
  onClose: () => void;
  onSuccess?: () => void;
  reason?: "limit" | "signup";
};

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export function AuthModal({ initialMode = "signup", onClose, onSuccess, reason }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const { login, signup, loginWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return;
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      onSuccess?.();
      onClose();
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgot = (e: React.MouseEvent) => {
    e.preventDefault();
    setForgotSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 6 }}
        transition={{ duration: 0.18 }}
        className="relative z-10 w-full max-w-[400px] rounded-2xl border border-white/10 bg-card shadow-2xl shadow-black/40 overflow-hidden"
      >
        {/* Top accent */}
        <div className="h-0.5 w-full bg-gradient-to-r from-primary via-violet-500 to-primary/0" />

        <div className="p-8">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Logo + heading */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_12px_-3px_rgba(24,119,242,0.6)]">
              <Activity className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-display font-bold text-lg">AdClarity</span>
          </div>

          {/* Context message */}
          {reason === "limit" && (
            <div className="mb-5 rounded-xl bg-primary/8 border border-primary/20 px-4 py-3 text-sm text-foreground/80 leading-relaxed">
              You've used your free report. <strong className="text-foreground">Create a free account</strong> to get{" "}
              <strong className="text-primary">3 free reports per month</strong> — no credit card required.
            </div>
          )}

          <h2 className="text-xl font-bold mb-1">
            {mode === "signup" ? "Create your free account" : "Welcome back"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "signup"
              ? "Get 3 free reports per month. No credit card required."
              : "Sign in to access your reports."}
          </p>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all mb-4 disabled:opacity-60"
          >
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {googleLoading ? "Signing in..." : `Continue with Google`}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-muted-foreground/60">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Email/password form */}
          <AnimatePresence mode="wait">
            {!forgotSent ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-muted/20 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password (min. 6 characters)"
                      className="w-full bg-muted/20 border border-white/8 rounded-xl pl-9 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                      required
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {mode === "login" && (
                    <button
                      onClick={handleForgot}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors mt-1.5 block ml-auto"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}

                <Button type="submit" className="w-full mt-1 shadow-lg shadow-primary/20" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {mode === "signup" ? "Creating account..." : "Signing in..."}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {mode === "signup" ? "Start Free" : "Sign In"}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-4 text-center"
              >
                <p className="text-sm text-emerald-400 font-medium">Check your inbox</p>
                <p className="text-xs text-muted-foreground mt-1">
                  If an account exists for <strong>{email || "that email"}</strong>, a reset link is on its way.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Switch mode */}
          <p className="text-xs text-center text-muted-foreground mt-5">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("login"); setError(""); setForgotSent(false); }}
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => { setMode("signup"); setError(""); setForgotSent(false); }}
                  className="text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Sign up free
                </button>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
