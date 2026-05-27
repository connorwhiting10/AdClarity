import { motion } from "framer-motion";

interface AIOrbProps {
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

const sizeClass = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-14 h-14",
};

/**
 * Kinso-style AI orb — a glowing, animated gradient button that acts as the
 * visual anchor for the AI layer. Use as a floating action (onClick) or as
 * a static decoration (no onClick).
 */
export default function AIOrb({ onClick, size = "md", pulse = true, className = "" }: AIOrbProps) {
  const interactive = !!onClick;
  return (
    <motion.button
      type={interactive ? "button" : undefined}
      onClick={onClick}
      aria-label={interactive ? "Open AI assistant" : undefined}
      disabled={!interactive}
      className={`relative ${sizeClass[size]} rounded-full overflow-hidden group ${
        interactive ? "cursor-pointer" : "cursor-default"
      } ${className}`}
      whileHover={interactive ? { scale: 1.05 } : undefined}
      whileTap={interactive ? { scale: 0.95 } : undefined}
    >
      {/* Base gradient */}
      <span
        aria-hidden
        className="absolute inset-0 bg-[conic-gradient(from_0deg,_#8b5cf6,_#ec4899,_#3b82f6,_#8b5cf6)] animate-spin"
        style={{ animationDuration: "6s" }}
      />
      {/* Glow */}
      {pulse && (
        <motion.span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-violet-500/80 via-fuchsia-500/80 to-blue-500/80 blur-md"
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {/* Inner core — tightens up to feel like a lens */}
      <span
        aria-hidden
        className="absolute inset-[20%] rounded-full bg-background/60 backdrop-blur-sm ring-1 ring-white/20"
      />
      {/* Highlight dot */}
      <span
        aria-hidden
        className="absolute top-[22%] left-[28%] w-[18%] h-[18%] rounded-full bg-white/70 blur-[1px]"
      />
    </motion.button>
  );
}
