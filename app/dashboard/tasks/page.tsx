"use client";

import { useTaskStore } from "@/store/useTaskStore";
import { TaskCard } from "@/components/tasks/TaskCard";
import { PlusCircle, Send, Sparkles, Brain, Loader2, Bot, User, ClipboardList, CheckCircle2, Mic } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { Task, Priority } from "@/types";
import { chatWithAi } from "@/app/actions/gemini";

interface ChatMessage {
  role: "user" | "model";
  content: string;
  taskProposal?: {
    title: string;
    description: string;
    deadline: string;
    priority: Priority;
  };
}

export default function TasksPage() {
  const { tasks, addTask } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Todo' | 'In Progress' | 'Done'>('All');

  // AI Chat States
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      content: "Hello! I am your Commit AI Coach. Ask me anything about your current workload, or tell me to schedule a new task (e.g., 'Add a task to submit the mockups by Wednesday')."
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Voice recognition state & handler
  const [isListeningVoice, setIsListeningVoice] = useState(false);

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
      setChatInput(speechToText);
      setIsListeningVoice(false);
    };

    recognition.onerror = () => {
      setIsListeningVoice(false);
    };

    recognition.onend = () => {
      setIsListeningVoice(false);
    };
  };

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  // Chat Submission
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput("");

    // Append user message
    const updatedMessages = [...chatMessages, { role: "user" as const, content: userText }];
    setChatMessages(updatedMessages);
    setChatLoading(true);

    try {
      // Call Gemini API with entire context
      const reply = await chatWithAi(
        updatedMessages.map(m => ({ role: m.role, content: m.content })),
        tasks as unknown as Record<string, unknown>[]
      );

      // Check if response contains [CREATE_TASK: {...}]
      let cleanContent = reply;
      let proposal: ChatMessage["taskProposal"] = undefined;

      const match = reply.match(/\[CREATE_TASK:\s*(\{.*?\})\s*\]/);
      if (match && match[1]) {
        try {
          const parsed = JSON.parse(match[1]);
          proposal = {
            title: parsed.title || "New Goal",
            description: parsed.description || "",
            deadline: parsed.deadline || new Date().toISOString().split("T")[0],
            priority: (parsed.priority as Priority) || "Medium"
          };
          // Remove the tag from user-facing text
          cleanContent = reply.replace(/\[CREATE_TASK:\s*\{.*?\}\s*\]/, "");
        } catch (e) {
          console.error("Failed to parse task proposal from chat:", e);
        }
      }

      setChatMessages(prev => [...prev, { role: "model" as const, content: cleanContent, taskProposal: proposal }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        { role: "model" as const, content: "I encountered an error trying to process that. Please try again." }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleConfirmProposal = (proposal: NonNullable<ChatMessage["taskProposal"]>) => {
    addTask({
      title: proposal.title,
      description: proposal.description,
      deadline: proposal.deadline + "T17:00:00",
      priority: proposal.priority,
      status: "Todo",
      progress: 0,
      subtasks: []
    });

    // Append confirm success message
    setChatMessages(prev => [
      ...prev,
      {
        role: "model",
        content: `Added task "${proposal.title}" to your queue! 🎉`
      }
    ]);
  };

  // Filters
  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'All') return true;
    return t.status === activeFilter;
  });

  return (
    <div className="w-full max-w-7xl mx-auto pt-2 pb-4 flex-1 flex flex-col h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Tasks & AI Workspace</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your commitments or plan with your personal AI Coach.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => chatInputRef.current?.focus()}
            className="bg-primary/10 text-primary font-heading text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-primary/20 border border-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Create with AI
          </button>
          <button 
            onClick={() => { setEditingTask(undefined); setIsModalOpen(true); }}
            className="bg-primary text-[#1000a9] font-heading text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Create Task
          </button>
        </div>
      </div>

      {/* Split Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch flex-1 overflow-hidden w-full">
        
        {/* Left Column: Tasks Queue */}
        <div className="flex-[2] flex flex-col h-full overflow-hidden min-w-0">
          
          {/* Filters Bar */}
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5 shrink-0">
            {(['All', 'Todo', 'In Progress', 'Done'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-lg font-heading text-xs font-semibold transition-all shrink-0 ${
                  activeFilter === filter 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                {filter} ({filter === 'All' ? tasks.length : tasks.filter(t => t.status === filter).length})
              </button>
            ))}
          </div>

          {filteredTasks.length === 0 ? (
            <div className="flex-1 glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center mt-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-lg font-heading font-bold mb-2">No tasks found</h2>
              <p className="text-muted-foreground max-w-[28rem] text-sm leading-relaxed">
                {activeFilter === 'All' 
                  ? "You don&apos;t have any tasks in your workflow. Create one manually or use the AI Coach on the right!"
                  : `No tasks are currently in "${activeFilter}" state.`}
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pt-4 pb-12 custom-scrollbar pr-2">
              <div className="flex flex-col gap-4">
                {filteredTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onEdit={() => handleEditTask(task)} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Assistant Chat */}
        <div className="flex-[1] glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col h-full min-h-[400px] bg-[#131315]/80 min-w-[300px]">
          
          {/* AI Header */}
          <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
            <Brain className="text-primary w-5 h-5 fill-primary/10" />
            <div>
              <h2 className="font-heading text-sm font-bold text-foreground">AI Productivity Coach</h2>
              <p className="text-[10px] text-muted-foreground">Context-Aware Gemini Assistant</p>
            </div>
          </div>

          {/* Messages Flow */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="max-w-[85%] space-y-2">
                  <div className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary text-[#1000a9] font-medium rounded-tr-none'
                      : 'bg-white/[0.04] text-foreground border border-white/5 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>

                  {/* Dynamic Task Proposal Box */}
                  {msg.taskProposal && (
                    <div className="border border-[#4edea3]/30 bg-[#4edea3]/5 p-3 rounded-xl space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center gap-1.5 text-[#4edea3] font-bold text-[10px] uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Suggested Task Proposal</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-heading text-xs font-bold text-foreground">{msg.taskProposal.title}</h4>
                        <p className="text-[10px] text-muted-foreground line-clamp-2">{msg.taskProposal.description}</p>
                        <div className="flex gap-2 pt-1">
                          <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-muted-foreground">Deadline: {msg.taskProposal.deadline}</span>
                          <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-muted-foreground">Priority: {msg.taskProposal.priority}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleConfirmProposal(msg.taskProposal!)}
                        className="w-full py-1.5 rounded-lg bg-[#4edea3] hover:bg-[#4edea3]/90 text-[#003820] font-heading font-bold text-[10px] transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Confirm & Add Task</span>
                      </button>
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-white/5 text-muted-foreground flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl rounded-tl-none text-muted-foreground italic">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Message Input Footer */}
          <form onSubmit={handleChatSubmit} className="p-3 border-t border-white/5 bg-white/[0.01] flex gap-2">
            <input
              ref={chatInputRef}
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={isListeningVoice ? "Listening to your voice..." : "Ask AI Coach or type a task command..."}
              className="flex-1 bg-[#1c1b1d] border border-white/10 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 disabled:opacity-50"
              disabled={isListeningVoice}
            />
            <button
              type="button"
              onClick={handleVoiceTrigger}
              className={`p-2 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center shrink-0 ${isListeningVoice ? 'text-primary animate-pulse bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
              title="Speak to coach"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim() || isListeningVoice}
              className="p-2 rounded-xl bg-primary text-[#1000a9] hover:bg-primary/95 transition-all disabled:opacity-50 shrink-0 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

      <TaskFormModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        task={editingTask}
      />
    </div>
  );
}
