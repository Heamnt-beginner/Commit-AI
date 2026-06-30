"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  TrendingUp, 
  Brain, 
  Clock, 
  Target, 
  Zap, 
  BarChart3, 
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Cpu,
  Bot
} from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { getInsights, geminiDeepSuggestion } from "@/app/actions/ai";
import { localDeepSuggestion } from "@/lib/localAi";
import { useAiMode } from "@/context/AiModeContext";

type DeepSuggestionData = {
  headline: string;
  suggestion: string;
  focusTip: string;
  productivityScore: number;
};

// Reusable slide toggle component for the per-card override
function AiSlideToggle({
  mode,
  onChange,
}: {
  mode: "local" | "gemini";
  onChange: (m: "local" | "gemini") => void;
}) {
  return (
    <button
      onClick={() => onChange(mode === "gemini" ? "local" : "gemini")}
      className="relative flex items-center rounded-full border border-white/10 bg-[#1c1b1d] p-0.5 h-7 w-[110px] transition-all duration-300 hover:border-primary/30 cursor-pointer shrink-0"
      aria-label="Toggle deep suggestion AI mode"
    >
      <span
        className={`absolute top-0.5 bottom-0.5 w-[52px] rounded-full transition-all duration-300 ${
          mode === "gemini"
            ? "left-0.5 bg-primary/20 border border-primary/40"
            : "left-[calc(50%+1px)] bg-violet-500/20 border border-violet-500/40"
        }`}
      />
      <span className={`relative z-10 w-1/2 text-center text-[9px] font-heading font-bold transition-colors duration-200 ${
        mode === "gemini" ? "text-primary" : "text-muted-foreground"
      }`}>
        Gemini
      </span>
      <span className={`relative z-10 w-1/2 text-center text-[9px] font-heading font-bold transition-colors duration-200 ${
        mode === "local" ? "text-violet-400" : "text-muted-foreground"
      }`}>
        Local
      </span>
    </button>
  );
}

export default function InsightsView() {
  const { tasks } = useTaskStore();
  const { aiMode: globalAiMode } = useAiMode();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskData, setRiskData] = useState<Record<string, unknown> | null>(null);
  const [recoveryData, setRecoveryData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [showFallbackToast, setShowFallbackToast] = useState(false);

  // Deep suggestion state
  const [deepMode, setDeepMode] = useState<"local" | "gemini">(globalAiMode);
  const [deepData, setDeepData] = useState<DeepSuggestionData | null>(null);
  const [deepLoading, setDeepLoading] = useState(false);
  const [deepError, setDeepError] = useState("");

  // Sync deepMode when global toggle changes (initial sync only)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setDeepMode(globalAiMode); }, [globalAiMode]);

  const completedTasks = tasks.filter(t => t.status === 'Done');
  const highPriorityCompleted = completedTasks.filter(t => t.priority === 'High').length;
  // eslint-disable-next-line
  const delayedTasks = tasks.filter(t => new Date(t.deadline).getTime() < Date.now() && t.status !== 'Done');

  const runAnalysis = async (force: boolean = false) => {
    if (tasks.length === 0) return;
    
    const currentHash = JSON.stringify(tasks.map(t => ({ id: t.id, status: t.status, progress: t.progress, deadline: t.deadline })));
    if (!force) {
      const cached = localStorage.getItem("commit_ai_insights_cache");
      if (cached) {
        try {
          const { risk, recovery, tasksHash } = JSON.parse(cached);
          if (tasksHash === currentHash) {
            setRiskData(risk);
            setRecoveryData(recovery);
            return;
          }
        } catch {
          // Ignore parse errors
        }
      }
    }

    setIsAnalyzing(true);
    setError("");

    // Fire reminder event if using local AI
    if (globalAiMode === "local") {
      window.dispatchEvent(new Event("commit-ai:ai-triggered"));
    }

    try {
      const serverCacheKey = force ? `${currentHash}-${Date.now()}` : currentHash;
      const res = await getInsights(serverCacheKey, tasks, delayedTasks);
      
      if (res.success && res.data) {
        setRiskData(res.data.riskAnalysis);
        setRecoveryData(res.data.recoveryPlan);
        localStorage.setItem("commit_ai_insights_cache", JSON.stringify({
          risk: res.data.riskAnalysis,
          recovery: res.data.recoveryPlan,
          tasksHash: currentHash
        }));
        if (res.isFallback) {
          setShowFallbackToast(true);
          setTimeout(() => setShowFallbackToast(false), 5000);
        }
      } else {
        setError(res.error || "Failed to retrieve AI insights.");
      }
    } catch (err: unknown) {
      console.error(err);
      setError("Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runDeepSuggestion = useCallback(async (mode: "local" | "gemini") => {
    if (tasks.length === 0) {
      setDeepData({ headline: "No Tasks Yet", suggestion: "Add some tasks to get personalized deep planning suggestions.", focusTip: "Start by creating your first task using the + button.", productivityScore: 0 });
      return;
    }

    // Fire reminder if using local AI
    if (mode === "local") {
      window.dispatchEvent(new Event("commit-ai:ai-triggered"));
    }

    setDeepLoading(true);
    setDeepError("");

    try {
      if (mode === "local") {
        // Instant heuristic result — no network call
        const result = localDeepSuggestion(tasks);
        setDeepData(result);
      } else {
        const res = await geminiDeepSuggestion(tasks);
        if (res.success && res.data) {
          setDeepData(res.data);
        } else {
          // Fallback to local if Gemini fails
          setDeepData(localDeepSuggestion(tasks));
          setDeepError("Gemini unavailable — showing Local AI suggestion instead.");
        }
      }
    } catch {
      setDeepData(localDeepSuggestion(tasks));
      setDeepError("Fell back to Local AI suggestion.");
    } finally {
      setDeepLoading(false);
    }
  }, [tasks]);

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runAnalysis(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  // Auto-run deep suggestion when tasks or mode changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runDeepSuggestion(deepMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, deepMode]);

  const handleDeepModeChange = (mode: "local" | "gemini") => {
    setDeepMode(mode);
  };

  const scoreColor = deepData
    ? deepData.productivityScore >= 70
      ? "text-[#4edea3]"
      : deepData.productivityScore >= 40
      ? "text-[#89ceff]"
      : "text-[#ffb4ab]"
    : "text-muted-foreground";

  const scoreRingColor = deepData
    ? deepData.productivityScore >= 70
      ? "#4edea3"
      : deepData.productivityScore >= 40
      ? "#89ceff"
      : "#ffb4ab"
    : "#444";

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-4 pb-6">
      <header className="mb-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground tracking-tight">Weekly AI Insights</h2>
          <p className="text-muted-foreground mt-1 text-xs">Your performance analytics and AI-driven optimizations.</p>
        </div>
        
        <button 
          onClick={() => runAnalysis(true)}
          disabled={isAnalyzing || tasks.length === 0}
          className="py-2.5 px-5 bg-primary/10 text-primary border border-primary/20 font-heading text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Brain className="w-3.5 h-3.5" />
          )}
          {isAnalyzing ? "Analyzing..." : "Refresh Insights"}
        </button>
      </header>

      {error && (
        <div className="p-3 rounded-lg bg-[#93000a]/20 border border-[#93000a] text-[#ffb4ab] text-xs">
          {error}
        </div>
      )}

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl bg-[#1c1b1d]/80 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-12 h-12 text-[#4edea3]" />
          </div>
          <div className="relative z-10">
            <p className="font-heading text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Efficiency Score</p>
            <h3 className="font-heading text-2xl font-bold text-foreground">
              {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
            </h3>
            <p className="text-[10px] text-muted-foreground font-semibold mt-1 flex items-center gap-1">
              Based on completion rate
            </p>
          </div>
        </div>
        
        <div className="glass-panel p-4 rounded-xl bg-[#1c1b1d]/80 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-12 h-12 text-[#89ceff]" />
          </div>
          <div className="relative z-10">
            <p className="font-heading text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Total Tasks</p>
            <h3 className="font-heading text-2xl font-bold text-foreground">{tasks.length}</h3>
            <p className="text-[10px] text-[#89ceff] font-semibold mt-1 flex items-center gap-1">
              Active workflow
            </p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl bg-[#1c1b1d]/80 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target className="w-12 h-12 text-primary" />
          </div>
          <div className="relative z-10">
            <p className="font-heading text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Tasks Completed</p>
            <h3 className="font-heading text-2xl font-bold text-foreground">{completedTasks.length}</h3>
            <p className="text-[10px] text-muted-foreground font-semibold mt-1">{highPriorityCompleted} High Priority</p>
          </div>
        </div>
      </div>

      {/* ── AI DEEP SUGGESTION CARD (UNLOCKED) ── */}
      <div className="glass-panel rounded-xl bg-[#131315]/80 border border-primary/20 overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-sm font-bold text-foreground">AI Deep Suggestion</span>
                <span className="bg-primary/15 text-primary font-heading font-black text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-primary/20">
                  {deepMode === "local" ? "Local" : "Gemini"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Personalized planning insight based on your task execution patterns.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AiSlideToggle mode={deepMode} onChange={handleDeepModeChange} />
            <button
              onClick={() => runDeepSuggestion(deepMode)}
              disabled={deepLoading}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-white/5 transition-colors"
              title="Refresh suggestion"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${deepLoading ? "animate-spin text-primary" : ""}`} />
            </button>
          </div>
        </div>

        {/* Card body */}
        <div className="p-5">
          {deepLoading ? (
            <div className="flex items-center gap-3 py-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {deepMode === "local" ? (
                  <Cpu className="w-4 h-4 text-violet-400 animate-pulse" />
                ) : (
                  <Bot className="w-4 h-4 text-primary animate-pulse" />
                )}
              </div>
              <div className="space-y-1.5">
                <div className="h-2.5 w-48 bg-white/5 rounded-full animate-pulse" />
                <div className="h-2.5 w-72 bg-white/5 rounded-full animate-pulse" />
                <div className="h-2.5 w-60 bg-white/5 rounded-full animate-pulse" />
              </div>
            </div>
          ) : deepData ? (
            <div className="flex flex-col sm:flex-row gap-5">
              {/* Score ring */}
              <div className="flex flex-col items-center justify-center shrink-0 sm:w-28">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                    <circle
                      cx="40" cy="40" r="32" fill="none"
                      stroke={scoreRingColor}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - (deepData.productivityScore / 100))}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`font-heading text-xl font-black ${scoreColor}`}>{deepData.productivityScore}</span>
                    <span className="text-[8px] text-muted-foreground font-heading font-bold uppercase">Score</span>
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground mt-1.5 font-heading font-semibold text-center uppercase tracking-wider">
                  Productivity
                </p>
              </div>

              {/* Suggestion text */}
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {deepMode === "local" ? (
                      <Cpu className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-primary shrink-0" />
                    )}
                    <h4 className="font-heading text-sm font-bold text-foreground">{deepData.headline}</h4>
                  </div>
                  <p className="text-xs text-foreground/75 leading-relaxed">{deepData.suggestion}</p>
                </div>

                <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/15 rounded-xl">
                  <Zap className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-heading text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">Focus Tip</p>
                    <p className="text-[11px] text-foreground/80 leading-relaxed">{deepData.focusTip}</p>
                  </div>
                </div>

                {deepError && (
                  <p className="text-[10px] text-[#89ceff] italic">{deepError}</p>
                )}

                {deepMode === "local" && (
                  <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                    <Cpu className="w-2.5 h-2.5 text-violet-400" />
                    Generated by Local AI heuristics · Switch to Gemini for richer context
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-muted-foreground italic">
              Add tasks to unlock your personalized planning suggestion.
            </div>
          )}
        </div>
      </div>

      {/* Main Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Burnout Risk & Health */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 bg-[#131315]/60 border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Risk Analysis
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#1c1b1d] rounded-lg border border-white/5 flex items-start gap-3">
              <div className={`p-1.5 rounded-lg ${riskData?.riskLevel === 'High' ? 'bg-[#93000a] text-[#ffdad6]' : riskData?.riskLevel === 'Medium' ? 'bg-[#89ceff]/20 text-[#89ceff]' : 'bg-[#4edea3]/20 text-[#4edea3]'}`}>
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-heading text-[10px] font-semibold text-muted-foreground uppercase">Burnout / Failure Risk</p>
                <p className="font-heading text-base font-bold text-foreground mt-0.5">{riskData ? String(riskData.riskLevel) : '--'}</p>
              </div>
            </div>
            
            <div className="p-3 bg-[#1c1b1d] rounded-lg border border-white/5 flex items-start gap-3">
              <div className={`p-1.5 rounded-lg ${delayedTasks.length > 0 ? 'bg-[#93000a] text-[#ffdad6]' : 'bg-[#4edea3]/20 text-[#4edea3]'}`}>
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div>
                <p className="font-heading text-[10px] font-semibold text-muted-foreground uppercase">Delayed Tasks</p>
                <p className="font-heading text-base font-bold text-foreground mt-0.5">{delayedTasks.length}</p>
              </div>
            </div>
          </div>
          
          {Array.isArray(riskData?.urgentTasks) && riskData.urgentTasks.length > 0 && (
            <div className="pt-3 border-t border-white/10">
              <h4 className="font-heading text-xs font-bold text-foreground mb-2">Urgent Tasks At Risk:</h4>
              <ul className="space-y-1">
                {(riskData.urgentTasks as string[]).map((title: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-[#ffb4ab]">
                    <div className="w-1 h-1 rounded-full bg-[#ffb4ab]"></div>
                    {title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* AI Action Items / Recovery Plan */}
        <div className="lg:col-span-1 glass-panel rounded-xl p-5 bg-[#131315]/60 border border-white/5 flex flex-col">
          <h3 className="font-heading text-base font-bold text-foreground mb-4">AI Recovery Plan</h3>
          
          <div className="space-y-3 flex-1">
            {!recoveryData && delayedTasks.length === 0 && (
              <div className="p-4 bg-[#1c1b1d]/80 rounded-lg border border-white/5 border-dashed flex items-center justify-center h-full min-h-[100px]">
                <p className="text-xs text-muted-foreground italic text-center">
                  You have no delayed tasks! Keep up the great work.
                </p>
              </div>
            )}
            
            {!recoveryData && delayedTasks.length > 0 && (
              <div className="p-4 bg-[#1c1b1d]/80 rounded-lg border border-white/5 border-dashed flex items-center justify-center h-full min-h-[100px]">
                <p className="text-xs text-muted-foreground italic text-center">
                  Generating recovery plan for delayed tasks...
                </p>
              </div>
            )}
 
            {recoveryData && (
              <div className="flex flex-col gap-2 animate-in fade-in">
                <p className="text-xs text-[#89ceff] font-semibold">{String(recoveryData.strategy)}</p>
                
                <div className="space-y-2 mt-2">
                  {(recoveryData.actionSteps as string[]).map((step: string, i: number) => (
                    <div key={i} className="p-2.5 bg-[#1c1b1d]/80 rounded-lg border border-white/5 hover:border-primary/30 transition-colors flex items-start gap-2.5 group">
                      <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground/80 leading-relaxed group-hover:text-foreground">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {recoveryData && (
            <button className="mt-4 w-full py-2.5 bg-primary text-[#1000a9] rounded-xl font-heading text-xs font-bold shadow-[0_0_15px_rgba(192,193,255,0.2)] hover:bg-primary/90 transition-all active:scale-[0.98]">
              Apply AI Adjustments
            </button>
          )}
        </div>
      </div>

      {/* Fallback Toast Notification */}
      {showFallbackToast && (
        <div className="fixed bottom-6 right-6 z-[999] bg-[#1c1b1d] border border-primary/30 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-sm">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-sm font-bold animate-pulse">wifi_off</span>
          </div>
          <div>
            <p className="font-heading text-xs font-bold text-foreground">Local AI Active</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Gemini rate limit reached. Offline heuristic model running.</p>
          </div>
        </div>
      )}
    </div>
  );
}
