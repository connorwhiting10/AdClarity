import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import AIOrb from "./AIOrb";
import { useAuth } from "@/context/AuthContext";
import type { Briefing, BriefingPriority } from "@/lib/ai-briefing";

interface Props {
  briefing: Briefing;
  onOpenChat: () => void;
}

const priorityStyle: Record<BriefingPriority, { dot: string; pill: string; label: string }> = {
  high: {
    dot: "bg-red-400",
    pill: "bg-red-500/10 border-red-500/30 text-red-300",
    label: "High priority",
  },
  medium: {
    dot: "bg-amber-400",
    pill: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    label: "Medium",
  },
  low: {
    dot: "bg-emerald-400",
    pill: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    label: "Low",
  },
};

export default function AIBriefingCard({ briefing, onOpenChat }: Props) {
  const { user } = useAuth();
  const firstName = user?.firstName || user?.email?.split("@")[0] || "there";
  const greeting = briefing.greeting.replace(/\byou\b/, firstName);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-3xl p-[1px] overflow-hidden"
    >
      {/* Animated gradient border */}
      <motion.span
        aria-hidden
        className="absolute inset-0 bg-[conic-gradient(from_var(--angle),_#8b5cf6,_#ec4899,_#3b82f6,_#8b5cf6)]"
        style={{ ["--angle" as string]: "0deg" } as React.CSSProperties}
        animate={{ ["--angle" as string]: "360deg" } as Record<string, string>}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      {/* Inner card */}
      <div className="relative rounded-3xl bg-[#0d1117]/95 backdrop-blur-xl">
        <div className="flex flex-col gap-5 p-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <AIOrb size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-violet-300">
                    Daily briefing
                  </p>
                  <span className="flex items-center gap-1 rounded-full bg-violet-500/10 border border-violet-500/30 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                </div>
                <h3 className="text-lg font-display font-bold text-foreground leading-tight mt-0.5">
                  {greeting}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenChat}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200 hover:bg-violet-500/20 transition-colors"
            >
              Ask a question
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* One-liner */}
          <p className="text-sm text-foreground/80 leading-relaxed">{briefing.oneLiner}</p>

          {/* Priority items */}
          <div className="space-y-3">
            {briefing.items.map((item, i) => {
              const style = priorityStyle[item.priority];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * (i + 1) }}
                  className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4"
                >
                  <div className="flex flex-col items-center gap-2 pt-0.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                    <div className="w-px flex-1 bg-white/5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider rounded-full border px-2 py-0.5 ${style.pill}`}
                      >
                        {style.label}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/40">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-foreground mb-1">{item.headline}</p>
                    <p className="text-sm text-foreground/70 leading-relaxed mb-2">{item.detail}</p>
                    <div className="flex items-start gap-2 rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground/80 leading-relaxed">
                        <span className="font-semibold text-violet-200">Draft: </span>
                        {item.action}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
