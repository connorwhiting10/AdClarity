import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, BarChart3, Download, FileSpreadsheet, ArrowRight } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
}

const perks = [
  { icon: BarChart3, label: "3 reports per month", sub: "vs 1 as a guest" },
  { icon: Download, label: "Full CSV export", sub: "download clean data" },
  { icon: FileSpreadsheet, label: "9-section analysis", sub: "all insights unlocked" },
];

export default function AuthModal({ open, onClose, onContinue }: AuthModalProps) {
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

                <h2 className="font-display font-bold text-[22px] leading-snug text-foreground mb-1.5">
                  Get more from your<br />Meta Ads data
                </h2>
                <p className="text-sm text-foreground/50 mb-5">
                  Create a free account in seconds. No credit card needed.
                </p>

                <div className="space-y-2.5 mb-6">
                  {perks.map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-foreground">{label}</span>
                        <span className="text-xs text-foreground/40 ml-2">{sub}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={onContinue}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold text-sm rounded-xl py-3 transition-all shadow-[0_0_24px_-6px_rgba(24,119,242,0.6)] hover:shadow-[0_0_28px_-4px_rgba(24,119,242,0.7)]"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-[11px] text-foreground/30 mt-3">
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
