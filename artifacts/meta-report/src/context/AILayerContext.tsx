import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

type AILayerContextValue = {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (v: boolean) => void;
};

const STORAGE_KEY = "adclarity_ai_layer";
const AILayerContext = createContext<AILayerContextValue | null>(null);

export function AILayerProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledRaw] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "on";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  }, [enabled]);

  const setEnabled = useCallback((v: boolean) => setEnabledRaw(v), []);
  const toggle = useCallback(() => setEnabledRaw((v) => !v), []);

  return (
    <AILayerContext.Provider value={{ enabled, toggle, setEnabled }}>
      {children}
    </AILayerContext.Provider>
  );
}

export function useAILayer() {
  const ctx = useContext(AILayerContext);
  if (!ctx) throw new Error("useAILayer must be used inside <AILayerProvider>");
  return ctx;
}
