"use client";

import { useState } from "react";
import { Mic, Brain, Calendar, AlertCircle, Timer, Tag, Sparkles, Edit3, Save, TrendingUp, Zap, Users } from "lucide-react";
import { generateTaskFromText } from "@/app/actions/ai";
import { useTaskStore } from "@/store/useTaskStore";
import { playSound } from "@/lib/audio";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Priority } from "@/types";

export default function AITaskGeneration() {
  const router = useRouter();
  const { addTask } = useTaskStore();
  const { userGeminiApiKey } = useUserStore();
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [generatedTask, setGeneratedTask] = useState<{
    title: string;
    description: string;
    deadline: string;
    priority: string;
    category: string;
    estimatedHours: number;
  } | null>(null);
  
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("Please describe a task first.");
      return;
    }
    
    setError("");
    setIsGenerating(true);
    setIsProcessing(true);
    
    try {
      playSound("ai");
      const response = await generateTaskFromText(inputText, userGeminiApiKey);
      
      if (response.success && response.data) {
        setGeneratedTask(response.data);
      } else {
        setError(response.error || "Failed to generate task.");
      }
    } catch (err: unknown) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
      setIsProcessing(false);
    }
  };

  const handleSaveTask = () => {
    if (!generatedTask) return;
    
    // Add task to store
    addTask({
      title: generatedTask.title,
      description: generatedTask.description,
      deadline: generatedTask.deadline,
      priority: generatedTask.priority as Priority,
      status: 'Todo',
      progress: 0,
      subtasks: []
    });
    
    // Redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <header className="mb-4">
        <h2 className="font-heading text-3xl font-bold text-foreground">Generate Task</h2>
        <p className="text-muted-foreground mt-2">Our AI handles the logistics. You focus on the work.</p>
      </header>

      {/* Task Input Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Main Input */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="glass-panel rounded-xl p-8 space-y-6 focus-within:ai-glow transition-all duration-500 bg-[#131315]/60 relative">
            <div className="flex items-center justify-between">
              <label className="font-heading text-sm text-primary uppercase tracking-widest font-semibold">Input Intent</label>
              <span className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
                <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-[#ffb4ab]' : 'bg-[#4edea3]'} ${isListening ? 'animate-pulse' : ''}`}></span>
                {isListening ? 'Listening...' : 'AI Listener Ready'}
              </span>
            </div>
            
            <div className="relative">
              <textarea 
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-2xl font-heading text-foreground placeholder:text-muted-foreground/30 resize-none min-h-[160px]"
                placeholder={isListening ? "Listening..." : "Describe what you need to accomplish (e.g., 'I need to prepare for my math exam next Friday')"}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="absolute bottom-0 right-0 flex gap-2">
                <button 
                  onClick={() => setIsListening(!isListening)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 group ${
                    isListening ? 'bg-[#93000a] text-[#ffdad6]' : 'bg-[#201f22] text-muted-foreground hover:text-primary hover:bg-primary/20'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="p-4 rounded-lg bg-[#93000a]/20 border border-[#93000a] text-[#ffb4ab] text-sm">
              {error}
            </div>
          )}

          {/* AI Processing Overlay */}
          {isProcessing && (
            <div className="glass-panel rounded-xl p-12 flex flex-col items-center justify-center gap-4 ai-shimmer border border-primary/20 bg-primary/5">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <Brain className="w-6 h-6 text-primary absolute" />
              </div>
              <div className="text-center mt-4">
                <h3 className="font-heading text-xl font-bold text-foreground">Analyzing your commitment...</h3>
                <p className="text-muted-foreground mt-2">Extracting parameters and estimating velocity.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Preview Area */}
        <div className="lg:col-span-5">
          <div className="glass-panel rounded-xl p-8 flex flex-col gap-6 min-h-[400px] bg-[#131315]/60 relative border border-white/5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="font-heading text-xs text-[#89ceff] uppercase tracking-widest font-semibold">Extracted Preview</label>
              <span className="text-xs text-muted-foreground font-heading font-semibold uppercase tracking-wider">
                {generatedTask ? 'Generated' : 'Draft State'}
              </span>
            </div>
            
            <div className="space-y-6">
              {/* Title Field */}
              <div className="group">
                <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wider">Title</p>
                <h3 className="text-xl font-heading font-bold text-foreground border-l-2 border-primary pl-4 py-1 group-hover:bg-white/5 transition-colors cursor-pointer rounded-r-lg">
                  {generatedTask ? generatedTask.title : 'Waiting for input...'}
                </h3>
              </div>
              
              {/* Grid Info */}
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Deadline</p>
                  <div className="flex items-center gap-2 text-foreground font-heading text-sm font-semibold">
                    <Calendar className="w-4 h-4 text-[#89ceff]" />
                    <span>{generatedTask ? format(new Date(generatedTask.deadline), 'MMM d, yyyy') : '--/--/----'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Priority</p>
                  <div className="flex items-center gap-2 text-foreground font-heading text-sm font-semibold">
                    <AlertCircle className={`w-4 h-4 ${generatedTask?.priority === 'High' ? 'text-[#ffb4ab]' : generatedTask?.priority === 'Medium' ? 'text-[#89ceff]' : 'text-[#4edea3]'}`} />
                    <span>{generatedTask ? generatedTask.priority : '--'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Time Estimate</p>
                  <div className="flex items-center gap-2 text-foreground font-heading text-sm font-semibold">
                    <Timer className="w-4 h-4 text-[#4edea3]" />
                    <span>{generatedTask ? `${generatedTask.estimatedHours} Hours` : '--'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Category</p>
                  <div className="flex items-center gap-2 text-foreground font-heading text-sm font-semibold">
                    <Tag className="w-4 h-4 text-primary" />
                    <span>{generatedTask ? generatedTask.category : '--'}</span>
                  </div>
                </div>
              </div>
              
              {generatedTask && (
                <div className="group pt-4 border-t border-white/5">
                  <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wider">Description</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {generatedTask.description}
                  </p>
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !inputText.trim()}
                className="w-full py-4 bg-primary text-[#1000a9] font-heading font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(192,193,255,0.2)] disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#1000a9]/30 border-t-[#1000a9] rounded-full animate-spin"></div>
                    Thinking...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-current" />
                    {generatedTask ? 'Regenerate from text' : 'Generate Structured Task'}
                  </>
                )}
              </button>
              
              {generatedTask && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
                  <button 
                    className="py-3 bg-[#353437] text-foreground font-heading text-sm font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#464554] transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Task
                  </button>
                  <button 
                    onClick={handleSaveTask}
                    className="py-3 bg-[#4edea3]/20 text-[#4edea3] font-heading text-sm font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-[#4edea3]/30 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Task
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bento Contextual Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-2 bg-[#131315]/40 hover:border-white/20 transition-colors">
          <TrendingUp className="w-5 h-5 text-[#89ceff] mb-2" />
          <h4 className="font-heading text-base font-semibold text-foreground">Efficiency Boost</h4>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1">AI insights on your planning efficiency will appear here.</p>
        </div>
        
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-2 bg-[#131315]/40 hover:border-white/20 transition-colors">
          <Zap className="w-5 h-5 text-[#4edea3] mb-2 fill-[#4edea3]/20" />
          <h4 className="font-heading text-base font-semibold text-foreground">Smart Resource</h4>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1">AI scheduling recommendations will appear here.</p>
        </div>
        
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-2 bg-[#131315]/40 hover:border-white/20 transition-colors">
          <Users className="w-5 h-5 text-primary mb-2" />
          <h4 className="font-heading text-base font-semibold text-foreground">Collaborators</h4>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1">AI dependency detection will appear here.</p>
        </div>
      </section>
    </div>
  );
}
