"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useUserStore } from "@/store/useUserStore";
import { auth, db } from "@/lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { generateRecoveryPlan, calculateTaskRisk } from "@/app/actions/gemini";
import { useTaskStore } from "@/store/useTaskStore";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { AiModeProvider } from "@/context/AiModeContext";
import {
  LayoutDashboard,
  ClipboardList,
  LineChart,
  Calendar,
  Settings,
  PlusCircle,
  HelpCircle,
  Search,
  Zap,
  Bell,
  LogOut,
  Timer
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isOnboarded, resetOnboarding, theme, aiMode, setAiMode, userGeminiApiKey } = useUserStore();
  const [authChecked, setAuthChecked] = useState(false);
  const [userName, setUserName] = useState("Alex Chen");
  const [localAiReminderVisible, setLocalAiReminderVisible] = useState(false);
  const localAiReminderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.forEach((cls) => {
        if (cls.startsWith("theme-")) {
          document.documentElement.classList.remove(cls);
        }
      });
      if (theme && theme !== "default") {
        document.documentElement.classList.add(`theme-${theme}`);
      }
    }
  }, [theme]);

  const [searchQuery, setSearchQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLightningAuditing, setIsLightningAuditing] = useState(false);
  const [lightningToast, setLightningToast] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => {
      if (aiMode === "local") {
        setLocalAiReminderVisible(true);
        if (localAiReminderTimer.current) clearTimeout(localAiReminderTimer.current);
        localAiReminderTimer.current = setTimeout(() => setLocalAiReminderVisible(false), 8000);
      }
    };
    window.addEventListener("commit-ai:ai-triggered", handler);
    return () => window.removeEventListener("commit-ai:ai-triggered", handler);
  }, [aiMode]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { tasks, updateTask } = useTaskStore();
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      resetOnboarding();
      router.push('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults([]);
      return;
    }
    const filtered = tasks.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (t: any) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchQuery, tasks]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const name = user.displayName || user.email?.split("@")[0] || "User";
        setUserName(name);

        const welcomedKey = `commit-ai-welcomed-${user.uid}`;
        const hasBeenWelcomed = localStorage.getItem(welcomedKey);

        const defaultNotifs = [
          {
            id: "system-audit",
            title: "AI Risk Auditor Active",
            message: "Click the lightning icon in the top right to assess deadline risks on tasks.",
            time: "1h ago",
            isRead: false
          }
        ];

        if (!hasBeenWelcomed) {
          defaultNotifs.unshift({
            id: "welcome-notif",
            title: "Welcome to Commit AI! 🎉",
            message: `Hi ${name.split(" ")[0]}! We're excited to help you manage commitments. Use the AI input bar to plan your next goal!`,
            time: "Just now",
            isRead: false
          });
          localStorage.setItem(welcomedKey, "true");
        }
        setNotifications(defaultNotifs);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLightningAudit = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const incompleteTasks = tasks.filter((t: any) => t.status !== "Done");
    if (incompleteTasks.length === 0) {
      setLightningToast("No active tasks to audit! Create one first.");
      setTimeout(() => setLightningToast(null), 3000);
      return;
    }

    setIsLightningAuditing(true);
    setLightningToast("Running AI Risk Audit on active tasks...");

    try {
      for (const task of incompleteTasks) {
        const riskRes = await calculateTaskRisk({
          title: task.title,
          deadline: task.deadline,
          progress: task.progress,
          subtasks: task.subtasks.map((st) => ({ isCompleted: st.isCompleted }))
        }, userGeminiApiKey);

        let recoveryPlan = task.recoveryPlan || undefined;
        const isMissed = new Date(task.deadline).getTime() < Date.now();
        if (riskRes.riskLevel === "High" || isMissed) {
          recoveryPlan = await generateRecoveryPlan({
            title: task.title,
            description: task.description,
            deadline: task.deadline,
            progress: task.progress,
            subtasks: task.subtasks
          }, userGeminiApiKey);
        }

        updateTask(task.id, {
          riskScore: riskRes.riskScore,
          riskLevel: riskRes.riskLevel as "Low" | "Medium" | "High",
          riskAnalysis: riskRes.analysis,
          recoveryPlan
        });
      }
      setLightningToast("Risk Audit Completed! Check your AI insights.");
    } catch (err) {
      console.error(err);
      setLightningToast("Failed to run Risk Audit.");
    } finally {
      setIsLightningAuditing(false);
      setTimeout(() => setLightningToast(null), 3000);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        useUserStore.getState().resetOnboarding();
        setAuthChecked(true);
        router.push('/auth');
      } else {
        if (!isOnboarded) {
          try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const data = userDoc.data();
              useUserStore.getState().completeOnboarding({
                profession: data.profession || "Developer",
                workingHoursStart: data.workingHoursStart || "09:00",
                workingHoursEnd: data.workingHoursEnd || "17:00",
                customInstructions: data.customInstructions || ""
              });
            } else {
              // Automatically complete onboarding with defaults if profile does not exist in DB (e.g. logging in but missing config)
              useUserStore.getState().completeOnboarding({
                profession: "Developer",
                workingHoursStart: "09:00",
                workingHoursEnd: "17:00",
                customInstructions: ""
              });
            }
          } catch (e) {
            console.error("Error loading user profile:", e);
          }
        }
        setAuthChecked(true);
      }
    });
    return () => unsubscribe();
  }, [isOnboarded, router]);

  if (!authChecked || !isOnboarded) {
    return null; // Don't render dashboard if loading auth or redirecting
  }

  const getLinkClass = (path: string) => {
    // For exact paths or nested paths that shouldn't highlight parent
    const isActive = path === '/dashboard' 
      ? pathname === '/dashboard' 
      : path === '/dashboard/ai' 
        ? pathname === '/dashboard/ai'
        : pathname?.startsWith(path);
      
    return isActive
      ? "flex items-center gap-3 px-3 py-2 text-primary bg-primary/10 rounded-lg transition-all duration-300"
      : "flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors duration-200";
  };

  return (
    <AiModeProvider>
    <div className="flex h-screen bg-[#0e0e10] text-foreground overflow-hidden w-full">
      {/* SideNavBar Shell - Flex Layout (No hardcoded positioning) */}
      <aside className="w-56 shrink-0 bg-[#131315]/60 backdrop-blur-xl border-r border-white/5 flex flex-col p-4 z-50 h-full">
        <div className="mb-8 text-left">
          <h1 className="font-heading text-xl font-bold tracking-tighter text-foreground truncate">
            Commit AI
          </h1>
          <p className="font-heading text-xs font-semibold text-muted-foreground opacity-70">
            Precision Workflow
          </p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className={`${getLinkClass('/dashboard')} relative group/tooltip`}>
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span className="font-heading text-sm font-semibold">Dashboard</span>
            <span className="absolute left-full ml-4 px-2.5 py-1 bg-[#131315] border border-white/10 rounded text-[10px] font-heading font-semibold text-foreground opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
              Go to Dashboard
            </span>
          </Link>
          
          <Link href="/dashboard/tasks" className={`${getLinkClass('/dashboard/tasks')} relative group/tooltip`}>
            <ClipboardList className="w-5 h-5 shrink-0" />
            <span className="font-heading text-sm font-semibold">Tasks & AI Hub</span>
            <span className="absolute left-full ml-4 px-2.5 py-1 bg-[#131315] border border-white/10 rounded text-[10px] font-heading font-semibold text-foreground opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
              Tasks & AI Assistant
            </span>
          </Link>
          
          <Link href="/dashboard/focus" className={`${getLinkClass('/dashboard/focus')} relative group/tooltip`}>
            <Timer className="w-5 h-5 shrink-0" />
            <span className="font-heading text-sm font-semibold">Focus Session</span>
            <span className="absolute left-full ml-4 px-2.5 py-1 bg-[#131315] border border-white/10 rounded text-[10px] font-heading font-semibold text-foreground opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
              Pomodoro Sanctuary
            </span>
          </Link>
          
          <Link href="/dashboard/ai/plan" className={`${getLinkClass('/dashboard/ai/plan')} relative group/tooltip`}>
            <Calendar className="w-5 h-5 shrink-0" />
            <span className="font-heading text-sm font-semibold">Planning</span>
            <span className="absolute left-full ml-4 px-2.5 py-1 bg-[#131315] border border-white/10 rounded text-[10px] font-heading font-semibold text-foreground opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
              Schedule Planner
            </span>
          </Link>

          <Link href="/dashboard/calendar" className={`${getLinkClass('/dashboard/calendar')} relative group/tooltip`}>
            <Calendar className="w-5 h-5 shrink-0" />
            <span className="font-heading text-sm font-semibold">Calendar</span>
            <span className="absolute left-full ml-4 px-2.5 py-1 bg-[#131315] border border-white/10 rounded text-[10px] font-heading font-semibold text-foreground opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
              Google Calendar
            </span>
          </Link>
          
          <Link href="/dashboard/insights" className={`${getLinkClass('/dashboard/insights')} relative group/tooltip`}>
            <LineChart className="w-5 h-5 shrink-0" />
            <span className="font-heading text-sm font-semibold">Insights</span>
            <span className="absolute left-full ml-4 px-2.5 py-1 bg-[#131315] border border-white/10 rounded text-[10px] font-heading font-semibold text-foreground opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
              Productivity Metrics
            </span>
          </Link>
          
          <Link href="/dashboard/settings" className={`${getLinkClass('/dashboard/settings')} relative group/tooltip`}>
            <Settings className="w-5 h-5 shrink-0" />
            <span className="font-heading text-sm font-semibold">Settings</span>
            <span className="absolute left-full ml-4 px-2.5 py-1 bg-[#131315] border border-white/10 rounded text-[10px] font-heading font-semibold text-foreground opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
              Preferences
            </span>
          </Link>
        </nav>
        
        <div className="mt-auto space-y-2 pt-8 border-t border-white/5">
          <button 
            onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
            className="w-full bg-primary text-[#1000a9] font-heading text-sm font-bold py-2.5 rounded-xl mb-4 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative group/tooltip"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>New Task</span>
            <span className="absolute left-full ml-4 px-2.5 py-1 bg-[#131315] border border-white/10 rounded text-[10px] font-heading font-semibold text-foreground opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
              Create New Task
            </span>
          </button>
          <Link
            href="/help"
            className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors duration-200 relative group/tooltip"
          >
            <HelpCircle className="w-5 h-5 shrink-0" />
            <span className="font-heading text-sm font-semibold">Help</span>
            <span className="absolute left-full ml-4 px-2.5 py-1 bg-[#131315] border border-white/10 rounded text-[10px] font-heading font-semibold text-foreground opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
              Help Center
            </span>
          </Link>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-error transition-colors duration-200 text-left relative group/tooltip"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="font-heading text-sm font-semibold">Sign Out</span>
            <span className="absolute left-full ml-4 px-2.5 py-1 bg-[#131315] border border-white/10 rounded text-[10px] font-heading font-semibold text-foreground opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
              Logout Session
            </span>
          </button>
        </div>
      </aside>

      {/* Main Canvas - Layout naturally next to Sidebar */}
      <main className="flex-1 h-screen flex flex-col relative overflow-hidden">
        {/* TopAppBar */}
        <header className="flex justify-between items-center h-16 px-8 bg-transparent z-50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/20 bg-surface flex items-center justify-center">
              <span className="font-heading text-sm font-bold text-primary">
                {userName.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="font-heading text-sm font-semibold text-foreground">{userName}</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-heading font-bold text-primary uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Free Plan
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Working Search Bar */}
            <div ref={searchRef} className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Quick search..."
                className="bg-[#1c1b1d] border-none rounded-full py-2 pl-10 pr-4 text-sm font-heading w-64 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-[#201f22] transition-all"
              />
              {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#131315] border border-white/10 rounded-xl shadow-2xl p-2 z-[100] max-h-60 overflow-y-auto w-72">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">Search Results</div>
                  {searchResults.length > 0 ? (
                    searchResults.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => {
                          setEditingTask(task);
                          setIsModalOpen(true);
                          setSearchQuery("");
                        }}
                        className="w-full text-left p-2 hover:bg-white/5 rounded-lg flex flex-col transition-colors border-b border-white/5 last:border-0"
                      >
                        <span className="text-xs font-semibold text-foreground truncate">{task.title}</span>
                        <span className="text-[10px] text-muted-foreground truncate">{task.description || "No description"}</span>
                      </button>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground p-3 text-center">No tasks match your search</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Notification Bell Dropdown */}
              <div ref={notifRef} className="relative group/tooltip">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    // Mark all notifications as read when opening
                    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                  }}
                  className="p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer rounded-full hover:bg-white/5 relative"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.some(n => !n.isRead) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-[#0e0e10]"></span>
                  )}
                </button>
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-[#131315] border border-white/10 rounded text-[10px] font-heading font-semibold text-foreground opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  Notifications
                </span>

                {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 bg-[#131315] border border-white/10 rounded-2xl shadow-2xl p-4 z-[100] w-80 text-left">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
                      <span className="font-heading text-xs font-bold text-foreground">Notifications</span>
                      <button 
                        onClick={() => setNotifications([])}
                        className="text-[10px] text-muted-foreground hover:text-primary"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div key={n.id} className="text-xs space-y-xs p-2 rounded bg-white/[0.02] border border-white/5">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-foreground">{n.title}</span>
                              <span className="text-[9px] text-muted-foreground">{n.time}</span>
                            </div>
                            <p className="text-muted-foreground text-[11px] leading-normal">{n.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground py-6 text-center italic">No new notifications</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Local AI / Gemini Slide Toggle */}
              <div className="relative group/tooltip flex items-center">
                <button
                  onClick={() => setAiMode(aiMode === "gemini" ? "local" : "gemini")}
                  className="relative flex items-center gap-0 rounded-full border border-white/10 bg-[#1c1b1d] p-0.5 h-8 w-[120px] transition-all duration-300 hover:border-primary/30 cursor-pointer"
                  aria-label="Toggle AI Mode"
                >
                  {/* Sliding pill */}
                  <span
                    className={`absolute top-0.5 bottom-0.5 w-[56px] rounded-full transition-all duration-300 ${
                      aiMode === "gemini"
                        ? "left-0.5 bg-primary/20 border border-primary/40"
                        : "left-[calc(50%+1px)] bg-violet-500/20 border border-violet-500/40"
                    }`}
                  />
                  <span className={`relative z-10 w-1/2 text-center text-[10px] font-heading font-bold transition-colors duration-200 ${
                    aiMode === "gemini" ? "text-primary" : "text-muted-foreground"
                  }`}>
                    Gemini
                  </span>
                  <span className={`relative z-10 w-1/2 text-center text-[10px] font-heading font-bold transition-colors duration-200 ${
                    aiMode === "local" ? "text-violet-400" : "text-muted-foreground"
                  }`}>
                    Local
                  </span>
                </button>
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-[#131315] border border-white/10 rounded text-[10px] font-heading font-semibold text-foreground opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  {aiMode === "gemini" ? "Using Gemini AI" : "Using Local AI"}
                </span>
              </div>

              {/* Lightning AI Risk Auditor Trigger */}
              <div className="relative group/tooltip">
                <button 
                  onClick={handleLightningAudit}
                  disabled={isLightningAuditing}
                  className={`p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer rounded-full hover:bg-white/5 ${
                    isLightningAuditing ? 'text-primary animate-pulse' : ''
                  }`}
                >
                  <Zap className="w-5 h-5" />
                </button>
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-[#131315] border border-white/10 rounded text-[10px] font-heading font-semibold text-foreground opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  Run AI Risk Audit
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 z-10 custom-scrollbar flex flex-col justify-between">
          <div className="flex-1 flex flex-col pb-4">
            {children}
          </div>
        </div>

        {/* Global Toast for Lightning Risk Audit */}
        {lightningToast && (
          <div className="fixed bottom-4 right-4 z-[200] bg-[#1c1b1d] border border-white/10 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <Zap className="w-4 h-4 text-primary animate-bounce shrink-0" />
            <span className="text-xs font-heading font-semibold text-foreground">{lightningToast}</span>
          </div>
        )}

        {/* Local AI Reminder Toast */}
        {localAiReminderVisible && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[201] flex items-center gap-3 bg-[#131315] border border-violet-500/30 px-4 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-sm w-[calc(100%-2rem)]">
            <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
              <span className="text-violet-400 text-xs font-bold">⚡</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading text-xs font-bold text-foreground">Using Local AI</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Switch to Gemini for richer, context-aware results.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { setAiMode("gemini"); setLocalAiReminderVisible(false); }}
                className="text-[10px] font-heading font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg hover:bg-primary/20 transition-all whitespace-nowrap"
              >
                Switch
              </button>
              <button
                onClick={() => setLocalAiReminderVisible(false)}
                className="text-muted-foreground hover:text-foreground text-xs transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Task Form Modal for Search Clicks */}
        <TaskFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={editingTask}
        />
      </main>
    </div>
    </AiModeProvider>
  );
}
