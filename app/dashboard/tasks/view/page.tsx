"use client";

import { useState } from "react";
import { 
  ArrowLeft, 
  AlertCircle, 
  Pause, 
  Square,
  Check,
  MoreVertical,
  Plus,
  Brain,
  Zap,
  Network,
  Send,
  Edit3,
  CheckCircle2
} from "lucide-react";

export default function TaskDetailsView() {
  const [progress] = useState(0);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      {/* Top Navigation Component Header (simulated) */}
      <div className="flex items-center gap-4 text-muted-foreground mb-2">
        <ArrowLeft className="w-5 h-5 cursor-pointer hover:text-foreground transition-colors" />
        <div className="w-px h-4 bg-white/10"></div>
        <nav className="flex gap-2 font-heading text-sm font-semibold">
          <span>Project Apex</span>
          <span>/</span>
          <span className="text-primary font-bold">Deep Learning Optimization</span>
        </nav>
      </div>

      {/* Task Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 bg-primary/10 text-primary font-heading text-xs font-semibold rounded border border-primary/20">
              IN PROGRESS
            </span>
            <span className="px-2 py-1 bg-[#93000a]/20 text-[#ffb4ab] font-heading text-xs font-semibold rounded border border-[#ffb4ab]/20 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              CRITICAL
            </span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight">Refine Neural Engine Logic for Edge Devices</h2>
        </div>
        
        <div className="flex gap-4">
          <button className="px-6 py-2 bg-[#353437]/50 border border-white/10 rounded-lg font-heading text-sm font-semibold text-foreground hover:bg-[#353437] transition-all active:scale-[0.98]">
            Share Plan
          </button>
          <button className="px-6 py-2 bg-primary text-[#1000a9] rounded-lg font-heading text-sm font-bold hover:shadow-[0_0_15px_rgba(192,193,255,0.3)] transition-all active:scale-[0.98]">
            Mark Complete
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Column: Progress & Subtasks */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Progress & Time Tracking Bento Card */}
          <div className="glass-panel rounded-xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8 ai-shimmer bg-[#131315]/60 border border-white/5">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-heading text-sm font-semibold text-muted-foreground">Global Progress</span>
                <span className="font-heading text-2xl font-bold text-primary">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-[#353437] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(192,193,255,0.4)]" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <div className="flex gap-4 pt-2">
                <div className="flex-1 p-3 bg-[#1c1b1d] rounded-lg border border-white/5">
                  <p className="font-heading text-xs font-semibold text-muted-foreground">Est. Remaining</p>
                  <p className="font-heading text-sm font-bold text-foreground mt-1">4h 20m</p>
                </div>
                <div className="flex-1 p-3 bg-[#1c1b1d] rounded-lg border border-white/5">
                  <p className="font-heading text-xs font-semibold text-muted-foreground">Tasks Finished</p>
                  <p className="font-heading text-sm font-bold text-foreground mt-1">12 / 18</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-center items-center md:border-l border-white/10 space-y-4 pt-4 md:pt-0">
              <div className="text-center">
                <p className="font-heading text-xs font-semibold text-muted-foreground uppercase tracking-widest">Active Time Tracker</p>
                <p className="font-heading text-4xl font-bold text-foreground mt-2 tracking-tight">02:45:12</p>
              </div>
              <div className="flex gap-3">
                <button className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 transition-colors">
                  <Pause className="w-5 h-5 fill-current" />
                </button>
                <button className="w-10 h-10 rounded-full bg-[#353437] text-muted-foreground flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Square className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          </div>

          {/* Timeline Visualizer */}
          <div className="glass-panel rounded-xl p-8 space-y-8 bg-[#131315]/60 border border-white/5">
            <h3 className="font-heading text-sm font-bold text-foreground uppercase tracking-widest">Execution Timeline</h3>
            
            <div className="relative flex justify-between items-center px-4">
              <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-[#353437] -translate-y-1/2 z-0">
                <div className="h-full bg-primary w-[75%]"></div>
              </div>
              
              {/* Points */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_15px_rgba(192,193,255,0.3)]"></div>
                <span className="font-heading text-xs font-semibold text-foreground">Created</span>
                <span className="text-[10px] text-muted-foreground">Oct 12</span>
              </div>
              
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_15px_rgba(192,193,255,0.3)]"></div>
                <span className="font-heading text-xs font-semibold text-foreground">Started</span>
                <span className="text-[10px] text-muted-foreground">Oct 14</span>
              </div>
              
              <div className="relative z-10 flex flex-col items-center gap-2 -mt-2">
                <div className="w-6 h-6 rounded-full border-4 border-[#131315] bg-primary shadow-lg scale-125"></div>
                <span className="font-heading text-xs font-bold text-primary mt-1">Current</span>
                <span className="text-[10px] text-muted-foreground">Active</span>
              </div>
              
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#353437] border-2 border-muted-foreground"></div>
                <span className="font-heading text-xs font-semibold text-muted-foreground">Deadline</span>
                <span className="text-[10px] text-muted-foreground">Oct 20</span>
              </div>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="glass-panel rounded-xl p-8 space-y-6 bg-[#131315]/60 border border-white/5">
            <div className="flex justify-between items-center">
              <h3 className="font-heading text-sm font-bold text-foreground uppercase tracking-widest">Subtasks Checklist</h3>
              <button className="text-primary font-heading text-sm font-semibold flex items-center gap-1 hover:underline">
                <Plus className="w-4 h-4" /> Add Subtask
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Completed Subtask */}
              <div className="flex items-center gap-4 p-4 bg-[#1c1b1d]/40 rounded-lg border border-white/5 opacity-60">
                <button className="w-5 h-5 rounded bg-primary text-[#1000a9] flex items-center justify-center">
                  <Check className="w-3 h-3 font-bold" />
                </button>
                <span className="text-sm font-semibold text-foreground line-through">Audit existing floating-point operations</span>
                <span className="ml-auto font-heading text-xs text-muted-foreground">Completed</span>
              </div>
              
              {/* Active Subtask */}
              <div className="flex items-center gap-4 p-4 bg-[#1c1b1d] rounded-lg border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group">
                <button className="w-5 h-5 rounded border border-muted-foreground group-hover:border-primary transition-colors"></button>
                <span className="text-sm font-semibold text-foreground">Implement Quantization-Aware Training (QAT) layer</span>
                <div className="ml-auto flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-[#00a2e6]/20 text-[#89ceff] font-heading text-xs font-semibold rounded">High</span>
                  <MoreVertical className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
                </div>
              </div>
              
              {/* Pending Subtask */}
              <div className="flex items-center gap-4 p-4 bg-[#1c1b1d] rounded-lg border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                <button className="w-5 h-5 rounded border border-muted-foreground"></button>
                <span className="text-sm font-semibold text-foreground">Validate kernel performance on Snapdragon 8 Gen 2</span>
                <MoreVertical className="w-5 h-5 text-muted-foreground ml-auto" />
              </div>
              
              {/* AI Suggested Subtask */}
              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/10 border-dashed ai-shimmer relative overflow-hidden">
                <Brain className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary/80 italic relative z-10">Suggested: Run thermal throttling simulation</span>
                <button className="ml-auto px-3 py-1 bg-primary/20 text-primary font-heading text-xs font-bold rounded hover:bg-primary/30 transition-colors relative z-10">Accept</button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column: AI & History */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* AI Assistant Panel */}
          <div className="glass-panel rounded-xl p-8 space-y-6 border border-primary/30 relative overflow-hidden group bg-[#131315]/60 shadow-[0_0_15px_rgba(192,193,255,0.05)]">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <Brain className="w-20 h-20 text-primary" />
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="font-heading text-sm font-bold text-foreground uppercase tracking-widest">AI Workflow Engine</h3>
            </div>
            
            <p className="text-muted-foreground mb-6">Are you sure you want to delete this task? This action cannot be undone. "Or something"</p>
            <p className="text-sm text-muted-foreground relative z-10 leading-relaxed">
              The current quantization plan may lead to a 4% accuracy drop. I can suggest corrective layers.
            </p>
            
            <div className="space-y-3 relative z-10">
              <button className="w-full text-left flex items-center justify-between p-4 bg-primary text-[#1000a9] rounded-lg font-heading text-sm font-bold group/btn hover:bg-primary/90 transition-colors">
                Improve Task Plan
                <Zap className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform fill-current" />
              </button>
              
              <button className="w-full text-left flex items-center justify-between p-4 bg-[#353437]/50 border border-white/5 rounded-lg font-heading text-sm font-bold text-foreground hover:bg-white/5 transition-colors">
                Break down into steps
                <Network className="w-4 h-4" />
              </button>
              
              <div className="relative pt-2">
                <input 
                  className="w-full bg-[#0e0e10] border border-white/5 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-3 pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all" 
                  placeholder="Ask Commit AI..." 
                  type="text"
                />
                <button className="absolute right-3 top-[calc(50%+4px)] -translate-y-1/2 text-primary hover:scale-110 transition-transform">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Activity History */}
          <div className="glass-panel rounded-xl p-8 space-y-6 bg-[#131315]/60 border border-white/5">
            <h3 className="font-heading text-sm font-bold text-foreground uppercase tracking-widest">Activity History</h3>
            
            <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#353437]">
              
              <div className="relative flex items-start gap-4 pl-[32px]">
                <div className="absolute left-0 top-1 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center z-10 outline outline-4 outline-[#131315]">
                  <Brain className="w-3 h-3 text-primary" />
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-foreground">AI refined task descriptions</p>
                  <p className="font-heading text-xs font-semibold text-muted-foreground mt-1">14 minutes ago</p>
                </div>
              </div>
              
              <div className="relative flex items-start gap-4 pl-[32px]">
                <div className="absolute left-0 top-1 w-6 h-6 bg-[#353437] rounded-full flex items-center justify-center z-10 outline outline-4 outline-[#131315]">
                  <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-foreground">Subtask "Audit operations" marked complete</p>
                  <p className="font-heading text-xs font-semibold text-muted-foreground mt-1">2 hours ago</p>
                </div>
              </div>
              
              <div className="relative flex items-start gap-4 pl-[32px]">
                <div className="absolute left-0 top-1 w-6 h-6 bg-[#353437] rounded-full flex items-center justify-center z-10 outline outline-4 outline-[#131315]">
                  <Edit3 className="w-3 h-3 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-foreground">You changed priority to <span className="text-[#ffb4ab]">Critical</span></p>
                  <p className="font-heading text-xs font-semibold text-muted-foreground mt-1">Yesterday, 4:12 PM</p>
                </div>
              </div>
              
            </div>
            
            <button className="w-full py-2 text-muted-foreground font-heading text-xs font-semibold uppercase tracking-widest hover:text-foreground transition-colors border-t border-white/5 pt-4 mt-2">
              View full audit trail
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
