"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  Play, 
  CheckCircle2, 
  Flame, 
  Brain,
  Plus,
  MessageSquare,
  Mic,
  Loader2,
  Check,
  Clock,
  Edit,
  Map as MapIcon,
  X,
  Trash2,
  PlusCircle
} from "lucide-react";
import { generateTaskFromPrompt } from "@/app/actions/gemini";
import { useTaskStore } from "@/store/useTaskStore";
import { useUserStore } from "@/store/useUserStore";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { Task, Priority } from "@/types";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { playSound } from "@/lib/audio";

export default function Dashboard() {
  const router = useRouter();
  const { enableVoice } = useUserStore();
  const [userName, setUserName] = useState("User");
  const [isStartingFocus] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName?.split(" ")[0] || user.email?.split("@")[0] || "User");
      }
    });
    return () => unsubscribe();
  }, []);
  
  // AI states
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showFallbackToast, setShowFallbackToast] = useState(false);
  const [previewTask, setPreviewTask] = useState<{
    title: string;
    description: string;
    deadline: string;
    priority: Priority;
    subtasks: string[];
  } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Risk and Recovery states
  const [activeRecoveryPlan] = useState<string | null>(null);
  const [recoveryPlanTaskTitle] = useState<string>("");
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  const { tasks, addTask, updateTask } = useTaskStore();

  const handleStartFocus = () => {
    router.push('/dashboard/focus');
  };

  const handleCreateTask = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const submitAiPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    setAiLoading(true);
    setAiError(null);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("commit-ai:ai-triggered"));
    }

    try {
      const result = await generateTaskFromPrompt(promptText);
      playSound("ai");
      
      let formattedDeadline = new Date().toISOString().slice(0, 16);
      if (result.deadline) {
        try {
          formattedDeadline = new Date(result.deadline).toISOString().slice(0, 16);
        } catch {}
      }

      setPreviewTask({
        title: result.title || "",
        description: result.description || "",
        deadline: formattedDeadline,
        priority: (result.priority as Priority) || "Medium",
        subtasks: result.subtasks || []
      });
      setIsPreviewOpen(true);
      setAiPrompt("");

      if (result.isFallback) {
        setShowFallbackToast(true);
        setTimeout(() => setShowFallbackToast(false), 5000);
      }

      // Voice Response
      if (enableVoice && 'speechSynthesis' in window) {
        const msg = new SpeechSynthesisUtterance(`I have planned the task: ${result.title}. Please review it.`);
        window.speechSynthesis.speak(msg);
      }
    } catch (err: unknown) {
      console.error(err);
      setAiError(err instanceof Error ? err.message : "Failed to parse goal. Please try describing it differently.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitAiPrompt(aiPrompt);
  };

  const handleConfirmAiTask = () => {
    if (!previewTask) return;

    addTask({
      title: previewTask.title,
      description: previewTask.description,
      deadline: new Date(previewTask.deadline).toISOString(),
      priority: previewTask.priority,
      status: "Todo",
      progress: 0,
      subtasks: previewTask.subtasks.map((st) => ({
        id: crypto.randomUUID(),
        title: st,
        isCompleted: false
      }))
    });

    setIsPreviewOpen(false);
    setPreviewTask(null);
  };



  const topPriorityTask = tasks.find(t => t.priority === 'High' && t.status !== 'Done') || tasks.find(t => t.status !== 'Done');
  const nextSubtask = topPriorityTask?.subtasks?.find(st => !st.isCompleted);
  
  const completedCount = tasks.filter(t => t.status === 'Done').length;
  
  const activeTasks = tasks.filter(t => t.status !== 'Done');
  const completedTasks = tasks.filter(t => t.status === 'Done');
  const displayTasks = [...activeTasks, ...completedTasks].slice(0, 4);

  // At risk tasks summary
  // At risk tasks summary

  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceAutoSubmitTimer, setVoiceAutoSubmitTimer] = useState<number | null>(null);

  useEffect(() => {
    if (voiceAutoSubmitTimer !== null && voiceAutoSubmitTimer > 0) {
      const timerId = setTimeout(() => {
        setVoiceAutoSubmitTimer(prev => prev! - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else if (voiceAutoSubmitTimer === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVoiceAutoSubmitTimer(null);
      submitAiPrompt(aiPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceAutoSubmitTimer, aiPrompt]);

  const handleVoiceTrigger = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListeningVoice(true);
    recognition.start();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setAiPrompt(speechToText);
      setIsListeningVoice(false);
      setVoiceAutoSubmitTimer(3);
    };

    recognition.onerror = () => {
      setIsListeningVoice(false);
    };

    recognition.onend = () => {
      setIsListeningVoice(false);
    };
  };

  const handleToggleTaskStatus = (task: Task) => {
    const nextStatus = task.status === 'Done' ? 'Todo' : 'Done';
    updateTask(task.id, {
      status: nextStatus,
      progress: nextStatus === 'Done' ? 100 : 0
    });
  };

  return (
    <>
      <TaskFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
      />
      {/* Greeting & Summary - Tighter spacing */}
      <section className="mt-3 mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Good Morning, {userName} 👋</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <Sparkles className="text-primary w-4 h-4 fill-primary/20" />
            <p className="text-sm text-muted-foreground">
              You have <span className="text-primary font-semibold">{activeTasks.length} active commitments</span> today.
            </p>
          </div>
        </div>
      </section>

      {/* AI Task Creator Input Bar moved to floating section at bottom */}

      {/* Bento Layout - Tight Gap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Today's Focus Card */}
        <div className="lg:col-span-8 glass-panel rounded-xl p-5 ai-shimmer relative overflow-hidden border border-white/5 shadow-[0_0_15px_rgba(192,193,255,0.08)] flex flex-col justify-between min-h-[220px]">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-primary/20 text-primary px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest font-heading">
                  Top Priority
                </span>
                <h3 className="font-heading text-xl font-semibold mt-2.5">
                  {topPriorityTask ? topPriorityTask.title : "All caught up!"}
                </h3>
                {nextSubtask && (
                  <p className="font-heading text-sm font-medium text-muted-foreground mt-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                    Next: {nextSubtask.title}
                  </p>
                )}
              </div>
              {topPriorityTask && (
                <div className="text-right">
                  <p className="font-heading text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Deadline</p>
                  <p className="font-heading text-xs text-[#ffb4ab] font-bold mt-0.5">
                    {new Date(topPriorityTask.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-end mb-1">
                <span className="font-heading text-xs font-semibold text-muted-foreground">Session Progress</span>
                <span className="font-heading text-lg font-bold text-primary">
                  {topPriorityTask ? topPriorityTask.progress : 100}%
                </span>
              </div>
              <div className="h-2 w-full bg-[#353437] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000" 
                  style={{ width: `${topPriorityTask ? topPriorityTask.progress : 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mt-5 flex gap-3">
              <button 
                onClick={handleStartFocus}
                disabled={isStartingFocus || !topPriorityTask}
                className="flex-1 bg-primary text-[#1000a9] font-heading text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-80"
              >
                {isStartingFocus ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#1000a9]/30 border-t-[#1000a9] rounded-full animate-spin"></div>
                    Preparing Session...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Focus Session</span>
                  </>
                )}
              </button>
              <button 
                onClick={() => topPriorityTask && router.push(`/dashboard/tasks?expand=${topPriorityTask.id}`)}
                disabled={!topPriorityTask}
                className="px-6 border border-white/10 text-foreground font-heading text-xs font-bold rounded-xl hover:bg-white/5 transition-colors active:scale-[0.98] disabled:opacity-50"
              >
                Details
              </button>
            </div>
          </div>
        </div>

        {/* Productivity Summary Card (Shuffled to top right) */}
        <div className="lg:col-span-4 glass-panel rounded-xl p-5 border border-white/5 flex flex-col justify-between min-h-[220px]">
          <h4 className="font-heading text-xs text-muted-foreground uppercase tracking-widest font-semibold">Productivity</h4>
          
          <div className="space-y-3 mt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#4edea3]/10 flex items-center justify-center text-[#4edea3]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-heading text-lg font-bold leading-none">{completedCount}</p>
                  <p className="font-heading text-[10px] text-muted-foreground font-medium mt-0.5">Tasks Completed</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#89ceff]/10 flex items-center justify-center text-[#89ceff]">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-heading text-lg font-bold leading-none">{tasks.length > 0 ? "1 Day" : "0 Days"}</p>
                  <p className="font-heading text-[10px] text-muted-foreground font-medium mt-0.5">Current Streak</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-white/5">
            <p className="font-heading text-[10px] text-muted-foreground font-semibold mb-2 uppercase tracking-wider">Weekly Performance</p>
            <div className="flex items-end justify-between h-10 gap-1">
              <div className="w-full bg-[#353437] rounded-t-sm h-[10%]"></div>
              <div className="w-full bg-[#353437] rounded-t-sm h-[30%]"></div>
              <div className="w-full bg-[#353437] rounded-t-sm h-[20%]"></div>
              <div className="w-full bg-[#353437] rounded-t-sm h-[50%]"></div>
              <div className="w-full bg-[#353437] rounded-t-sm h-[0%]"></div>
              <div className="w-full bg-[#353437] rounded-t-sm h-[0%]"></div>
              <div className="w-full bg-primary rounded-t-sm h-[80%]"></div>
            </div>
          </div>
        </div>

        {/* Space-Saving Compact Queue */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="font-heading text-xs text-foreground font-semibold uppercase tracking-wider">Today&apos;s Queue</h4>
            <button onClick={() => router.push('/dashboard/tasks')} className="text-primary font-heading text-xs font-semibold hover:underline">View All</button>
          </div>
          
          <div className="space-y-2">
            {displayTasks.length > 0 ? displayTasks.map(task => (
              <div 
                key={task.id} 
                className="glass-panel border border-white/5 p-3 rounded-xl flex items-center justify-between hover:border-white/10 transition-colors group/row"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button 
                    onClick={() => handleToggleTaskStatus(task)}
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      task.status === 'Done' 
                        ? 'bg-[#4edea3] border-[#4edea3] text-black' 
                        : 'border-white/30 hover:border-primary'
                    }`}
                  >
                    {task.status === 'Done' && <Check className="w-2.5 h-2.5 stroke-[4px]" />}
                  </button>
                  <div className="min-w-0">
                    <h5 className={`text-xs font-semibold truncate ${task.status === 'Done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.title}
                    </h5>
                    <div className="flex gap-2 mt-0.5 items-center">
                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${
                        task.priority === 'High' ? 'bg-[#ffb4ab]/20 text-[#ffb4ab]' :
                        task.priority === 'Medium' ? 'bg-[#89ceff]/20 text-[#89ceff]' : 'bg-[#4edea3]/20 text-[#4edea3]'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="text-[8px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(task.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-16 text-right">
                    <span className="text-[10px] font-bold text-primary">{task.progress}%</span>
                    <div className="h-1 w-full bg-[#353437] rounded-full overflow-hidden mt-0.5">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${task.progress}%` }}></div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleEditTask(task)}
                    className="p-1 hover:bg-white/5 rounded text-muted-foreground hover:text-foreground opacity-0 group-hover/row:opacity-100 transition-opacity"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="p-6 text-center text-muted-foreground border border-white/5 rounded-xl border-dashed text-xs">
                No tasks in the queue. You&apos;re all caught up!
              </div>
            )}
          </div>
        </div>

        {/* Quick Shortcuts Grid (Cleaned and moved directly under Productivity) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <h4 className="font-heading text-xs text-foreground font-semibold uppercase tracking-wider px-1">Quick Shortcuts</h4>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleCreateTask} 
              className="glass-panel p-3.5 rounded-xl flex flex-col items-center gap-1.5 hover:border-primary/50 transition-all group hover:bg-white/[0.01]"
            >
              <Plus className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-heading text-[10px] font-semibold text-muted-foreground">Create Task</span>
            </button>
            <button 
              onClick={() => router.push('/dashboard/tasks')} 
              className="glass-panel p-3.5 rounded-xl flex flex-col items-center gap-1.5 hover:border-[#89ceff]/50 transition-all group hover:bg-white/[0.01]"
            >
              <MessageSquare className="w-4 h-4 text-[#89ceff] group-hover:scale-110 transition-transform" />
              <span className="font-heading text-[10px] font-semibold text-muted-foreground">Ask AI Coach</span>
            </button>
            <button 
              onClick={handleVoiceTrigger}
              className={`glass-panel p-3.5 rounded-xl flex flex-col items-center gap-1.5 transition-all group hover:bg-white/[0.01] ${
                isListeningVoice ? 'border-[#ffb4ab] bg-[#ffb4ab]/5 animate-pulse' : 'hover:border-[#4edea3]/50'
              }`}
            >
              <Mic className={`w-4 h-4 group-hover:scale-110 transition-transform ${isListeningVoice ? 'text-[#ffb4ab]' : 'text-[#4edea3]'}`} />
              <span className="font-heading text-[10px] font-semibold text-muted-foreground">
                {isListeningVoice ? "Listening..." : "Voice Input"}
              </span>
            </button>
            <button 
              onClick={() => router.push('/dashboard/ai/plan')} 
              className="glass-panel p-3.5 rounded-xl flex flex-col items-center gap-1.5 hover:border-white/30 transition-all group hover:bg-white/[0.01]"
            >
              <MapIcon className="w-4 h-4 text-foreground group-hover:scale-110 transition-transform" />
              <span className="font-heading text-[10px] font-semibold text-muted-foreground">View Plan</span>
            </button>
          </div>
        </div>

      </div>

      {/* AI Task Preview & Edit Modal */}
      {isPreviewOpen && previewTask && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#131315] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Sparkles className="text-primary w-5 h-5 fill-primary/20" />
                <h2 className="font-heading text-lg font-bold text-foreground">
                  AI Task Generation Setup
                </h2>
              </div>
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              
              {/* Form Input fields always styled, editable, and ready */}
              <div className="space-y-4">
                <div>
                  <label className="block font-heading text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Goal Title</label>
                  <input 
                    type="text"
                    value={previewTask.title}
                    onChange={(e) => setPreviewTask({ ...previewTask, title: e.target.value })}
                    className="w-full bg-[#1c1b1d] border border-white/10 rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                    placeholder="e.g. Exam Prep"
                  />
                </div>
                
                <div>
                  <label className="block font-heading text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Description</label>
                  <textarea 
                    value={previewTask.description}
                    onChange={(e) => setPreviewTask({ ...previewTask, description: e.target.value })}
                    className="w-full bg-[#1c1b1d] border border-white/10 rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 min-h-[70px]"
                    placeholder="Describe this plan..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-heading text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Target Deadline</label>
                    <input 
                      type="datetime-local"
                      value={previewTask.deadline}
                      onChange={(e) => setPreviewTask({ ...previewTask, deadline: e.target.value })}
                      className="w-full bg-[#1c1b1d] border border-white/10 rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block font-heading text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Priority Level</label>
                    <select 
                      value={previewTask.priority}
                      onChange={(e) => setPreviewTask({ ...previewTask, priority: e.target.value as Priority })}
                      className="w-full bg-[#1c1b1d] border border-white/10 rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block font-heading text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Generated Action Steps (Subtasks)</label>
                  <div className="space-y-2">
                    {previewTask.subtasks.map((st, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center font-heading text-xs font-bold shrink-0">{i+1}</span>
                        <input 
                          type="text"
                          value={st}
                          onChange={(e) => {
                            const updated = [...previewTask.subtasks];
                            updated[i] = e.target.value;
                            setPreviewTask({ ...previewTask, subtasks: updated });
                          }}
                          className="flex-1 bg-[#1c1b1d] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const updated = previewTask.subtasks.filter((_, idx) => idx !== i);
                            setPreviewTask({ ...previewTask, subtasks: updated });
                          }}
                          className="p-1.5 text-[#ffb4ab] hover:bg-white/5 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => setPreviewTask({ ...previewTask, subtasks: [...previewTask.subtasks, ""] })}
                      className="text-xs text-primary font-bold flex items-center gap-1 mt-2 hover:underline"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add Subtask Step</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-white/5 bg-white/[0.01]">
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 rounded-lg border border-white/10 text-foreground font-heading text-sm font-semibold hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>

              <div className="flex-1"></div>

              <button 
                onClick={handleConfirmAiTask}
                className="px-5 py-2 rounded-lg bg-primary text-[#1000a9] font-heading text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                Confirm & Create Plan
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Recovery Assistance Modal */}
      {isRecoveryModalOpen && activeRecoveryPlan && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#131315] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="text-[#89ceff] w-5 h-5" />
                <h3 className="font-heading text-lg font-bold text-foreground">AI Recovery Assistance</h3>
              </div>
              <button 
                onClick={() => setIsRecoveryModalOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto text-xs leading-relaxed text-foreground">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Suggested Plan For: {recoveryPlanTaskTitle}</p>
              <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5 font-mono text-xs whitespace-pre-wrap select-text selection:bg-primary/30">
                {activeRecoveryPlan}
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-white/5 bg-white/[0.01]">
              <button 
                onClick={() => setIsRecoveryModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-primary text-[#1000a9] font-heading text-xs font-bold hover:bg-primary/90 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
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

      {/* Floating Thick AI Task Input Bar */}
      <div className="absolute bottom-6 left-0 right-0 z-[100] px-4 lg:px-6 flex justify-center pointer-events-none">
        <form onSubmit={handleAiSubmit} className="relative w-full max-w-3xl pointer-events-auto">
          <div className="bg-[#1c1b1d]/95 p-4 pl-6 rounded-2xl flex items-center gap-4 border border-primary/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25 transition-all shadow-[0_0_40px_rgba(192,193,255,0.2)] backdrop-blur-xl">
            <Sparkles className="text-primary w-6 h-6 shrink-0" />
            <input 
              value={aiPrompt}
              onChange={(e) => {
                setAiPrompt(e.target.value);
                if (voiceAutoSubmitTimer !== null) setVoiceAutoSubmitTimer(null);
              }}
              disabled={aiLoading || isListeningVoice}
              placeholder={isListeningVoice ? "Listening to your voice..." : "What is your next commitment? Describe it (e.g. Prepare presentation by Sunday)..."}
              className="flex-1 bg-transparent border-0 text-foreground placeholder:text-muted-foreground/60 text-base font-medium focus:outline-none focus:ring-0 disabled:opacity-50"
              type="text"
            />
            <button 
              type="button"
              onClick={handleVoiceTrigger}
              disabled={aiLoading}
              className={`p-3 rounded-xl hover:bg-white/10 transition-all ${isListeningVoice ? 'text-primary animate-pulse bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
              title="Speak to add task"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button 
              type="submit"
              disabled={aiLoading || !aiPrompt.trim()}
              className="bg-primary text-[#1000a9] font-heading font-bold text-sm px-6 py-3 rounded-xl hover:bg-primary/95 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              {voiceAutoSubmitTimer !== null && voiceAutoSubmitTimer > 0 ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting in {voiceAutoSubmitTimer}...</span>
                </>
              ) : aiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Planning...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Plan with AI</span>
                </>
              )}
            </button>
          </div>
          {aiError && (
            <div className="absolute -top-10 left-4 bg-destructive/10 border border-destructive/20 text-[#ffb4ab] text-xs px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">error</span>
              {aiError}
            </div>
          )}
        </form>
      </div>
    </>
  );
}
