import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, X } from "lucide-react";
import AIOrb from "./AIOrb";
import { mockChatAnswer, type Briefing } from "@/lib/ai-briefing";
import type { ParsedReport } from "@/lib/excel-parser";

interface Props {
  open: boolean;
  onClose: () => void;
  report: ParsedReport;
  briefing: Briefing;
}

type Message =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; typing?: boolean };

export default function AIChatDrawer({ open, onClose, report, briefing }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const send = async (question: string) => {
    if (!question.trim() || thinking) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: question }]);
    setThinking(true);
    // Fake latency for demo realism — under a second.
    await new Promise((r) => setTimeout(r, 700));
    const answer = mockChatAnswer(question, report);
    setThinking(false);
    setMessages((m) => [...m, { role: "assistant", text: answer }]);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-[#0d1117] border-l border-white/10 flex flex-col"
          >
            {/* Header */}
            <div className="relative flex items-center justify-between gap-3 p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <AIOrb size="sm" pulse={false} />
                <div>
                  <p className="font-bold text-sm">AdClarity Assistant</p>
                  <p className="text-[11px] text-foreground/50">Asking about this report</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-violet-300 mb-2">
                      Briefing recap
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{briefing.oneLiner}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/40 mb-2">
                      Try asking
                    </p>
                    <div className="flex flex-col gap-2">
                      {briefing.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          className="text-left rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15 px-3 py-2.5 text-sm text-foreground/80 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/[0.04] border border-white/5 text-foreground/90"
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}

              {thinking && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-white/[0.04] border border-white/5 px-4 py-3">
                    <AIOrb size="sm" />
                    <div className="flex items-center gap-1">
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full bg-violet-300"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      />
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full bg-violet-300"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full bg-violet-300"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] focus-within:border-violet-500/40 focus-within:bg-white/[0.05] transition-colors pl-4 pr-1 py-1"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about this report…"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground/40 focus:outline-none py-2"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || thinking}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_14px_-2px_rgba(139,92,246,0.6)] transition-shadow"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[10px] text-foreground/30 mt-2 text-center">
                Demo mode — responses are hand-authored for this preview.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
