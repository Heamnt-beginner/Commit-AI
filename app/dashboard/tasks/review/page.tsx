"use client";


import { 
  ArrowLeft, 
  Clock, 
  Plus, 
  Check, 
  GripVertical, 
  Brain, 
  CheckCircle2, 
  Save, 
  RefreshCw,
  Sparkles,
  Lightbulb,
  Verified
} from "lucide-react";

export default function AITaskReview() {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      {/* Top Navigation Bar Component (simulated for inside dashboard) */}
      <div className="flex items-center gap-2 text-muted-foreground mb-4 cursor-pointer hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-heading text-sm font-semibold">Back to Workspace</span>
      </div>

      {/* Task Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2 py-1 bg-[#93000a] text-[#ffdad6] text-[10px] font-bold rounded uppercase tracking-tighter font-heading">High Priority</span>
            <span className="text-muted-foreground text-xs font-heading font-semibold">• ID: AI-742</span>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight">Quarterly Market Intelligence Report</h2>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="font-heading text-xs text-muted-foreground font-semibold uppercase tracking-widest">Deadline</p>
            <p className="font-heading text-sm text-foreground font-bold mt-1">Oct 24, 2024</p>
          </div>
          <div className="h-10 w-px bg-white/10"></div>
          <div className="flex flex-col items-end">
            <p className="font-heading text-xs text-muted-foreground font-semibold uppercase tracking-widest">Status</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse"></span>
              <span className="font-heading text-sm text-foreground font-bold">AI Drafting</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Editor Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Basic Info Card */}
          <section className="glass-panel bg-[#1c1b1d]/80 rounded-xl p-8 ai-shimmer relative overflow-hidden border border-white/5">
            <h3 className="font-heading text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-6">General Parameters</h3>
            
            <div className="space-y-6 relative z-10">
              <div>
                <label className="block font-heading text-xs text-muted-foreground font-semibold mb-2">Task Title</label>
                <input 
                  type="text" 
                  defaultValue="Quarterly Market Intelligence Report"
                  className="w-full bg-[#131315] border border-white/5 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm py-3 px-4 text-foreground outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block font-heading text-xs text-muted-foreground font-semibold mb-2">Description</label>
                <textarea 
                  rows={4}
                  defaultValue="Analyze emerging trends in the fintech sector for Q3. Focus on AI integration, regulatory shifts in EMEA, and competitive landscape shifts. The final output must be ready for the board of directors."
                  className="w-full bg-[#131315] border border-white/5 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm py-3 px-4 text-foreground outline-none transition-all resize-y min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-heading text-xs text-muted-foreground font-semibold mb-2">Category</label>
                  <select className="w-full bg-[#131315] border border-white/5 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm py-3 px-4 text-foreground outline-none transition-all appearance-none cursor-pointer">
                    <option>Market Research</option>
                    <option>Strategic Planning</option>
                    <option>Product Development</option>
                  </select>
                </div>
                
                <div>
                  <label className="block font-heading text-xs text-muted-foreground font-semibold mb-2">Estimated Duration</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      defaultValue="6 hours"
                      className="w-full bg-[#131315] border border-white/5 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm py-3 px-4 text-foreground outline-none transition-all"
                    />
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* AI Subtasks */}
          <section className="glass-panel bg-[#1c1b1d]/80 rounded-xl p-8 border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading text-xs text-muted-foreground uppercase tracking-widest font-semibold">AI Generated Subtasks</h3>
              <button className="text-primary font-heading text-sm font-semibold flex items-center gap-1 hover:underline transition-all">
                <Plus className="w-4 h-4" />
                Add Subtask
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Subtask 1 */}
              <div className="group flex items-center gap-4 p-4 bg-[#131315] rounded-lg border border-white/5 hover:border-primary/50 transition-all cursor-pointer">
                <div className="w-5 h-5 border-2 border-muted-foreground/30 rounded flex items-center justify-center group-hover:border-primary transition-colors">
                  <Check className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Initial Sector Research</p>
                  <p className="text-xs text-muted-foreground mt-1">Scrape top 50 fintech journals for keyword &apos;LLM integration&apos;</p>
                </div>
                <GripVertical className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 cursor-grab" />
              </div>
              
              {/* Subtask 2 */}
              <div className="group flex items-center gap-4 p-4 bg-[#131315] rounded-lg border border-white/5 hover:border-primary/50 transition-all cursor-pointer">
                <div className="w-5 h-5 border-2 border-muted-foreground/30 rounded flex items-center justify-center group-hover:border-primary transition-colors">
                  <Check className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Draft Executive Outline</p>
                  <p className="text-xs text-muted-foreground mt-1">Synthesize findings into 4 key thematic pillars</p>
                </div>
                <GripVertical className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 cursor-grab" />
              </div>
              
              {/* Subtask 3 */}
              <div className="group flex items-center gap-4 p-4 bg-[#131315] rounded-lg border border-white/5 hover:border-primary/50 transition-all cursor-pointer">
                <div className="w-5 h-5 border-2 border-muted-foreground/30 rounded flex items-center justify-center group-hover:border-primary transition-colors">
                  <Check className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Final Work & Visualization</p>
                  <p className="text-xs text-muted-foreground mt-1">Generate 3 interactive charts for the board deck</p>
                </div>
                <GripVertical className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 cursor-grab" />
              </div>
            </div>
          </section>
        </div>

        {/* AI Sidebar Column */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* AI Recommendation Panel */}
          <section className="glass-panel bg-primary/5 rounded-xl p-8 border border-primary/20 ai-glow relative overflow-hidden shadow-[0_0_20px_rgba(192,193,255,0.1)]">
            <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
              <Sparkles className="w-16 h-16 text-primary" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <Brain className="w-5 h-5" />
                <h3 className="font-heading text-sm font-bold uppercase tracking-wider">Suggested Approach</h3>
              </div>
              
              <p className="text-sm text-foreground/80 mb-8 leading-relaxed">
                Complete <span className="text-primary font-bold">sector research</span> in its entirety before attempting the draft. Intelligence indicates that EMEA regulatory shifts are currently volatile; deferring the final write-up until Friday&apos;s update will ensure 100% accuracy.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold font-heading text-[#4edea3]">
                  <Verified className="w-4 h-4" />
                  94% Efficiency Score Predicted
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold font-heading text-muted-foreground">
                  <Lightbulb className="w-4 h-4" />
                  Recommended Focus: Deep Research
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <section className="space-y-4">
            <button className="w-full py-4 px-6 bg-primary text-[#1000a9] font-heading font-bold rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
              Confirm Task
              <CheckCircle2 className="w-5 h-5" />
            </button>
            
            <button className="w-full py-4 px-6 bg-[#353437]/40 border border-white/10 text-foreground font-heading text-sm font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-[#353437]/80 transition-all">
              Save Changes
              <Save className="w-4 h-4" />
            </button>
            
            <div className="pt-4 border-t border-white/5">
              <button className="w-full py-4 px-6 border border-primary/30 text-primary font-heading text-sm font-semibold rounded-xl flex items-center justify-center gap-3 group hover:bg-primary/10 transition-all">
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                Regenerate with AI
              </button>
            </div>
          </section>

          {/* Metadata */}
          <section className="p-6 bg-[#0e0e10] rounded-xl border border-white/5 space-y-3">
            <div className="flex justify-between font-heading text-xs font-semibold">
              <span className="text-muted-foreground">Created</span>
              <span className="text-foreground">Oct 20, 11:42 AM</span>
            </div>
            <div className="flex justify-between font-heading text-xs font-semibold">
              <span className="text-muted-foreground">Model</span>
              <span className="text-foreground">Commit-LLM-v4.2</span>
            </div>
            <div className="flex justify-between font-heading text-xs font-semibold">
              <span className="text-muted-foreground">Tokens Used</span>
              <span className="text-foreground">1,402</span>
            </div>
          </section>
          
        </div>
      </div>
    </div>
  );
}
