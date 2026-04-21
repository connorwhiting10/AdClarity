import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { X, Activity, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

type Props = {
  initialMode?: "login" | "signup";
  onClose: () => void;
  onSuccess?: () => void;
  reason?: "limit" | "signup";
};

export function AuthModal({ initialMode = "signup", onClose, reason }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);
  const { login, signup } = useAuth();

  const handleSignUp = () => {
    signup();
    onClose();
  };

  const handleSignIn = () => {
    login();
    onClose();
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
        <div className="h-0.5 w-full bg-gradient-to-r from-primary via-violet-500 to-primary/0" />

        <div className="p-8">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_12px_-3px_rgba(24,119,242,0.6)]">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg">AdClarity</span>
          </div>

          {reason === "limit" ? (
            <>
              <h2 className="text-xl font-bold mb-2">You've used your free report</h2>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Create a free account to get <strong className="text-foreground">3 reports per month</strong> — no credit card required.
              </p>

              <div className="rounded-xl border border-white/5 bg-muted/10 p-4 mb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">What you get for free</p>
                {[
                  "3 full reports per month",
                  "Complete written analysis",
                  "CSV export",
                  "Campaign & audience breakdowns",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-foreground/80 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <Button className="w-full mb-3 shadow-lg shadow-primary/20" onClick={handleSignUp}>
                <Zap className="w-4 h-4 mr-2" />
                Create Free Account
              </Button>
              <button
                onClick={handleSignIn}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Already have an account? Sign in
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-2">
                {initialMode === "signup" ? "Create your free account" : "Welcome back"}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {initialMode === "signup"
                  ? "Get 3 free reports per month. No credit card required."
                  : "Sign in to access your reports."}
              </p>

              <Button className="w-full mb-3 shadow-lg shadow-primary/20" onClick={handleSignUp}>
                {initialMode === "signup" ? "Create Free Account" : "Sign Up"}
              </Button>
              <button
                onClick={handleSignIn}
                className="w-full text-sm text-center text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                {initialMode === "signup" ? "Already have an account? Sign in" : "Sign In"}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
