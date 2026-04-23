import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAILayer } from "@/context/AILayerContext";

export default function AIToggle() {
  const { enabled, toggle } = useAILayer();

  return (
    <button
      type="button"
      onClick={toggle}
      className={`relative flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all overflow-hidden ${
        enabled
          ? "border-transparent text-white shadow-[0_0_24px_-6px_rgba(139,92,246,0.6)]"
          : "border-white/10 text-foreground/60 hover:text-foreground hover:border-white/20"
      }`}
      aria-pressed={enabled}
    >
      {enabled && (
        <motion.span
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500"
        />
      )}
      <span className="relative flex items-center gap-2">
        <Sparkles className={`w-3.5 h-3.5 ${enabled ? "" : "text-violet-400"}`} />
        AI Layer
        <span
          className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            enabled ? "bg-white/20 text-white" : "bg-white/5 text-foreground/40"
          }`}
        >
          {enabled ? "On" : "Off"}
        </span>
      </span>
    </button>
  );
}
