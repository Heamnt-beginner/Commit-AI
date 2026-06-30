"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { Brain, ArrowRight, User, Clock, MessageSquare } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useUserStore();
  
  const [profession, setProfession] = useState("Developer");
  const [workingHoursStart, setWorkingHoursStart] = useState("09:00");
  const [workingHoursEnd, setWorkingHoursEnd] = useState("17:00");
  const [customInstructions, setCustomInstructions] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const user = auth.currentUser;
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
          profession,
          workingHoursStart,
          workingHoursEnd,
          customInstructions,
          isOnboarded: true,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error saving onboarding data:", error);
      }
    }
    
    completeOnboarding({
      profession,
      workingHoursStart,
      workingHoursEnd,
      customInstructions
    });
    setLoading(false);
    router.push('/dashboard');
  };

  const professions = ["Student", "Developer", "Designer", "Manager", "Professional", "Other"];

  return (
    <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#89ceff]/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-2xl w-full relative z-10">
        <div className="glass-panel p-10 rounded-2xl bg-[#131315]/80 border border-white/5 shadow-2xl space-y-8 ai-glow">
          <div className="ai-shimmer absolute inset-0 pointer-events-none opacity-20"></div>
          
          <div className="text-center space-y-4 relative z-10">
            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-2">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-heading text-4xl font-bold text-foreground tracking-tight">Configure Your AI</h1>
            <p className="text-muted-foreground max-w-[28rem] mx-auto">
              Set your baseline parameters so the AI can generate highly optimized, context-aware schedules that fit your actual life.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10 mt-8">
            
            {/* Profession */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 font-heading text-sm font-bold text-foreground">
                <User className="w-4 h-4 text-primary" />
                What is your primary role?
              </label>
              <div className="flex flex-wrap gap-3">
                {professions.map((prof) => (
                  <button
                    key={prof}
                    type="button"
                    onClick={() => setProfession(prof)}
                    className={`px-4 py-2 rounded-lg font-heading text-sm font-semibold transition-all border ${
                      profession === prof 
                        ? 'bg-primary/20 border-primary text-primary' 
                        : 'bg-[#1c1b1d] border-white/5 text-muted-foreground hover:bg-white/5'
                    }`}
                  >
                    {prof}
                  </button>
                ))}
              </div>
            </div>

            {/* Working Hours */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 font-heading text-sm font-bold text-foreground">
                <Clock className="w-4 h-4 text-[#89ceff]" />
                Typical Working Hours
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-[#1c1b1d] rounded-xl border border-white/5 p-4 focus-within:border-[#89ceff] transition-colors group">
                  <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest font-semibold mb-2 group-focus-within:text-[#89ceff]">Start Time</label>
                  <input 
                    type="time" 
                    value={workingHoursStart}
                    onChange={(e) => setWorkingHoursStart(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-foreground font-heading text-lg"
                    required
                  />
                </div>
                <div className="text-muted-foreground">to</div>
                <div className="flex-1 bg-[#1c1b1d] rounded-xl border border-white/5 p-4 focus-within:border-[#89ceff] transition-colors group">
                  <label className="block text-xs text-muted-foreground font-heading uppercase tracking-widest font-semibold mb-2 group-focus-within:text-[#89ceff]">End Time</label>
                  <input 
                    type="time" 
                    value={workingHoursEnd}
                    onChange={(e) => setWorkingHoursEnd(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-foreground font-heading text-lg"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Custom Instructions */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 font-heading text-sm font-bold text-foreground">
                <MessageSquare className="w-4 h-4 text-[#4edea3]" />
                Custom AI Instructions (Optional)
              </label>
              <p className="text-xs text-muted-foreground">Tell the AI any specific rules it should follow when planning your day (e.g. &quot;I take a 1-hour lunch break at 1 PM&quot;, &quot;No meetings on Friday afternoons&quot;).</p>
              <div className="bg-[#1c1b1d] rounded-xl border border-white/5 focus-within:border-[#4edea3] transition-colors p-2">
                <textarea 
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Your personal scheduling rules..."
                  className="w-full bg-transparent border-none outline-none text-foreground text-sm p-3 min-h-[120px] resize-none"
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-primary text-[#1000a9] font-heading text-sm font-bold rounded-xl flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(192,193,255,0.3)] disabled:opacity-75"
              >
                {loading ? "Saving Setup..." : "Complete Setup & Enter Dashboard"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
