"use client";

import { useState } from "react";
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Brain, 
  CheckCircle2, 
  Edit3,
  CalendarDays
} from "lucide-react";
import { useTaskStore } from "@/store/useTaskStore";
import { useUserStore } from "@/store/useUserStore";
import { playSound } from "@/lib/audio";
import { generateSchedule } from "@/app/actions/ai";

export default function AIPlanningView() {
  const { tasks } = useTaskStore();
  const userProfile = useUserStore();
  const [isGenerating, setIsGenerating] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [schedule, setSchedule] = useState<any>(null);
  const [error, setError] = useState("");

  const handleGenerateSchedule = async () => {
    if (tasks.length === 0) {
      setError("You have no tasks to schedule. Please create some tasks first.");
      return;
    }

    setIsGenerating(true);
    setError("");

    // Remind user if using Local AI
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("commit-ai:ai-triggered"));
    }

    try {
      const response = await generateSchedule(tasks, userProfile, userProfile.userGeminiApiKey);
      if (response.success && response.data) {
        setSchedule(response.data);
        playSound("ai");
      } else {
        setError(response.error || "Failed to generate schedule.");
      }
    } catch (err: unknown) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getSlotColor = (type: string) => {
    switch(type) {
      case "Focus Block": return "bg-[#89ceff] text-[#89ceff]";
      case "Skill Dev": return "bg-[#4edea3] text-[#4edea3]";
      case "Meeting": return "bg-[#ffb4ab] text-[#ffb4ab]";
      default: return "bg-primary text-primary";
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header Section */}
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground tracking-tight">Your AI Execution Plan</h2>
          <div className="flex items-center gap-2 mt-4 text-[#4edea3]">
            <Sparkles className="w-5 h-5 fill-current" />
            <span className="font-heading text-sm font-semibold">Optimized for Peak Performance (Bio-Rhythm Sync Active)</span>
          </div>
        </div>
        
        <button 
          onClick={handleGenerateSchedule}
          disabled={isGenerating}
          className="py-3 px-6 bg-primary text-[#1000a9] font-heading text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-[#1000a9]/30 border-t-[#1000a9] rounded-full animate-spin"></div>
              Generating...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 fill-current" />
              {schedule ? "Regenerate Plan" : "Generate Plan"}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-[#93000a]/20 border border-[#93000a] text-[#ffb4ab] text-sm">
          {error}
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Main Schedule / Calendar Timeline */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          
          <div className="glass-panel bg-[#131315]/60 rounded-xl p-8 border border-white/5 shadow-lg relative overflow-hidden min-h-[400px]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-heading text-2xl font-bold text-foreground flex items-center gap-3">
                <CalendarDays className="w-6 h-6 text-primary" />
                Daily Schedule
              </h3>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
            
            {/* Timeline */}
            <div className="flex flex-col gap-6 relative z-10">
              {!schedule && !isGenerating && (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground italic font-semibold">Waiting for AI to generate a plan based on your tasks...</p>
                </div>
              )}
              
              {isGenerating && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <Sparkles className="w-5 h-5 text-primary absolute" />
                  </div>
                  <p className="text-primary font-heading font-semibold uppercase tracking-widest text-xs">Analyzing Workload...</p>
                </div>
              )}

              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {schedule && !isGenerating && (schedule as Record<string, any>).days?.map((day: Record<string, any>, i: number) => (
                <div key={i} className="flex gap-6 group">
                  <div className="w-20 py-2 flex flex-col items-end shrink-0">
                    <span className="font-heading text-2xl font-bold text-foreground">{day.date}</span>
                    <span className="font-heading text-xs text-muted-foreground uppercase font-semibold">{day.dayName.substring(0, 3)}</span>
                  </div>
                  <div className="flex-1 relative pl-6 py-2 border-l border-white/10 flex flex-col gap-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {day.slots?.map((slot: Record<string, any>, j: number) => {
                      const colorClass = getSlotColor(slot.type);
                      
                      return (
                        <div key={j} className="glass-panel p-4 rounded-xl border border-white/5 bg-[#1c1b1d]/80 relative overflow-hidden group-hover:scale-[1.01] transition-transform shadow-md hover:border-primary/30">
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorClass.split(' ')[0]}`}></div>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-heading text-sm font-semibold text-foreground">{slot.taskTitle}</div>
                              <div className="flex items-center gap-1 mt-2 text-muted-foreground font-heading text-xs font-semibold">
                                <Clock className="w-3 h-3" />
                                {slot.timeRange}
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded ${colorClass.split(' ')[0]}/10 ${colorClass.split(' ')[1]} text-[10px] uppercase font-bold tracking-widest font-heading`}>
                              {slot.type}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                    {day.slots?.length === 0 && (
                      <div className="p-4 border border-dashed border-white/10 bg-[#1c1b1d]/40 rounded-xl text-muted-foreground font-heading text-sm font-semibold italic">
                        Free day — Time to rest!
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Explanation Section */}
          <div className="glass-panel rounded-xl p-8 bg-primary/5 border border-primary/20 relative overflow-hidden ai-glow">
            <div className="ai-shimmer absolute inset-0 pointer-events-none opacity-20"></div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Brain className="w-6 h-6 fill-current" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-foreground">Why this schedule?</h3>
            </div>
            
            <p className={`font-heading text-sm text-foreground/80 leading-relaxed relative z-10 ${!schedule ? 'italic text-muted-foreground' : ''}`}>
              {schedule ? schedule.reasoning : "Once you generate a plan, the AI will explain its reasoning here."}
            </p>
          </div>
        </div>

        {/* Distribution and Stats */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          
          {/* Task Distribution Card */}
          <div className="glass-panel rounded-xl p-8 bg-[#131315]/60 border border-white/5">
            <h3 className="font-heading text-2xl font-bold text-foreground mb-8">Task Distribution</h3>
            
            <div className="space-y-6">
              {/* Workload */}
              <div className="space-y-2">
                <div className="flex justify-between font-heading text-xs text-muted-foreground font-semibold uppercase tracking-widest">
                  <span>Workload</span>
                  <span className="text-foreground">{schedule ? schedule.workload : 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#353437] rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${schedule ? schedule.workload : 0}%` }}></div>
                </div>
              </div>
              
              {/* Time Allocation */}
              <div className="space-y-2">
                <div className="flex justify-between font-heading text-xs text-muted-foreground font-semibold uppercase tracking-widest">
                  <span>Strategic Focus</span>
                  <span className="text-foreground">{schedule ? schedule.strategicFocus : 0} hrs</span>
                </div>
                <div className="h-1.5 w-full bg-[#353437] rounded-full overflow-hidden">
                  <div className="h-full bg-[#89ceff] rounded-full transition-all duration-1000" style={{ width: `${schedule ? Math.min(100, (schedule.strategicFocus / 20) * 100) : 0}%` }}></div>
                </div>
              </div>
              
              {/* Priority */}
              <div className="space-y-2">
                <div className="flex justify-between font-heading text-xs text-muted-foreground font-semibold uppercase tracking-widest">
                  <span>Efficiency</span>
                  <span className="text-foreground">{schedule ? schedule.efficiency : 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#353437] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ffb4ab] rounded-full transition-all duration-1000" style={{ width: `${schedule ? schedule.efficiency : 0}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-[#89ceff]"></div>
                <span className="font-heading text-sm font-semibold text-foreground">Projected Burnout Risk: <span className="text-[#4edea3]">{schedule ? schedule.burnoutRisk : '--'}</span></span>
              </div>
            </div>
          </div>

          {/* Adjustment Controls */}
          {schedule && (
            <div className="flex flex-col gap-4 animate-in fade-in">
              <button className="w-full py-4 px-6 bg-primary text-[#1000a9] font-heading text-sm font-bold rounded-xl flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
                <CheckCircle2 className="w-5 h-5" />
                Accept plan
              </button>
              <button className="w-full py-4 px-6 border border-white/10 text-foreground font-heading text-sm font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-white/5 active:scale-[0.98] transition-all">
                <Edit3 className="w-4 h-4" />
                Modify plan manually
              </button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
