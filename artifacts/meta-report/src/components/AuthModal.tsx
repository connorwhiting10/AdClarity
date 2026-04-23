import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity } from "lucide-react";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import OAuthButtons from "@/components/auth/OAuthButtons";

export type AuthMode = "signin" | "signup";

interface AuthModalProps {
  open: boolean;
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (m: AuthMode) => void;
}

export default function AuthModal({ open, mode, onClose, onModeChange }: AuthModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none px-4 pb-4 sm:pb-0"
          >
            <div
              className="pointer-events-auto w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1117] shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative px-6 pt-6 pb-5">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-foreground/40 hover:text-foreground/70 hover:bg-white/5 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_18px_-4px_rgba(24,119,242,0.7)]">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-display font-bold text-base text-foreground">AdClarity</span>
                </div>

                <h2 className="font-display font-bold text-[22px] leading-snug text-foreground mb-4">
                  {mode === "signin" ? "Welcome back" : "Create your account"}
                </h2>

                <div className="flex gap-1 p-1 bg-white/5 rounded-lg mb-4">
                  <button
                    onClick={() => onModeChange("signin")}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                      mode === "signin"
                        ? "bg-white/10 text-foreground"
                        : "text-foreground/50 hover:text-foreground/80"
                    }`}
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => onModeChange("signup")}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                      mode === "signup"
                        ? "bg-white/10 text-foreground"
                        : "text-foreground/50 hover:text-foreground/80"
                    }`}
                  >
                    Sign up
                  </button>
                </div>

                {mode === "signin" ? (
                  <SignInForm onSuccess={onClose} />
                ) : (
                  <SignUpForm onSuccess={onClose} />
                )}

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 text-[11px] text-foreground/40 bg-[#0d1117]">or</span>
                  </div>
                </div>

                <OAuthButtons />

                <p className="text-center text-[11px] text-foreground/30 mt-4">
                  By continuing you agree to our{" "}
                  <a href="/legal" className="underline underline-offset-2 hover:text-foreground/50 transition-colors">
                    Terms &amp; Privacy
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
