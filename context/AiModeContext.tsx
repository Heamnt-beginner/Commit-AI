"use client";

import { createContext, useContext, useCallback, useState, ReactNode } from "react";
import { useUserStore } from "@/store/useUserStore";

interface AiModeContextValue {
  aiMode: "local" | "gemini";
  setAiMode: (mode: "local" | "gemini") => void;
  /** Call this before any AI generation to possibly show the Local AI reminder */
  checkAndRemind: () => boolean; // returns true if reminder was shown
  showReminder: boolean;
  dismissReminder: () => void;
  switchToGemini: () => void;
}

const AiModeContext = createContext<AiModeContextValue | null>(null);

export function AiModeProvider({ children }: { children: ReactNode }) {
  const { aiMode, setAiMode } = useUserStore();
  const [showReminder, setShowReminder] = useState(false);

  const checkAndRemind = useCallback(() => {
    if (aiMode === "local") {
      setShowReminder(true);
      return true;
    }
    return false;
  }, [aiMode]);

  const dismissReminder = useCallback(() => {
    setShowReminder(false);
  }, []);

  const switchToGemini = useCallback(() => {
    setAiMode("gemini");
    setShowReminder(false);
  }, [setAiMode]);

  return (
    <AiModeContext.Provider value={{ aiMode, setAiMode, checkAndRemind, showReminder, dismissReminder, switchToGemini }}>
      {children}
    </AiModeContext.Provider>
  );
}

export function useAiMode() {
  const ctx = useContext(AiModeContext);
  if (!ctx) throw new Error("useAiMode must be used inside AiModeProvider");
  return ctx;
}
