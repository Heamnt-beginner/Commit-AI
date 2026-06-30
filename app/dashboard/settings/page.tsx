"use client";

import { useUserStore } from "@/store/useUserStore";
import { useState, useEffect } from "react";
import { 
  User, 
  Sparkles, 
  Volume2, 
  Palette, 
  Database,
  Eye,
  EyeOff,
  Link,
  ShieldAlert,
  RotateCcw,
  Loader2,
  CheckCircle,
  Archive
} from "lucide-react";

type ActiveTab = "account" | "ai" | "appearance" | "diagnostics" | "legacy";

export default function SettingsPage() {
  const { 
    profession, 
    workingHoursStart, 
    workingHoursEnd, 
    customInstructions, 
    theme, 
    enableVoice,
    userGeminiApiKey,
    updateProfile,
    resetOnboarding 
  } = useUserStore();

  // Active Tab State (Notion-style layout)
  const [activeTab, setActiveTab] = useState<ActiveTab>("account");

  // Local state for forms
  const [localProfession, setLocalProfession] = useState(profession);
  const [localStart, setLocalStart] = useState(workingHoursStart);
  const [localEnd, setLocalEnd] = useState(workingHoursEnd);
  const [localInstructions, setLocalInstructions] = useState(customInstructions);
  const [localVoice, setLocalVoice] = useState(enableVoice);
  const [localTheme, setLocalTheme] = useState(theme);
  const [localApiKey, setLocalApiKey] = useState(userGeminiApiKey || "");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Sync state if store updates
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalProfession(profession);
    setLocalStart(workingHoursStart);
    setLocalEnd(workingHoursEnd);
    setLocalInstructions(customInstructions);
    setLocalVoice(enableVoice);
    setLocalTheme(theme);
    setLocalApiKey(userGeminiApiKey || "");
  }, [profession, workingHoursStart, workingHoursEnd, customInstructions, enableVoice, theme, userGeminiApiKey]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("saving");

    setTimeout(() => {
      updateProfile({
        profession: localProfession,
        workingHoursStart: localStart,
        workingHoursEnd: localEnd,
        customInstructions: localInstructions,
        enableVoice: localVoice,
        theme: localTheme,
        userGeminiApiKey: localApiKey
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      
      {/* Container holding Sidebar & Content Panel */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-border bg-[#131315]/50 flex flex-col md:flex-row min-h-[550px] shadow-2xl">
        
        {/* Left Sidebar Menu */}
        <aside className="w-full md:w-56 shrink-0 bg-white/[0.02] border-b md:border-b-0 md:border-r border-border p-4 flex flex-col gap-2">
          
          <div className="px-3 py-2">
            <h2 className="font-heading text-xs font-bold text-muted-foreground uppercase tracking-widest">User Settings</h2>
          </div>

          <nav className="space-y-1 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-1 md:gap-0 scrollbar-none">
            
            <button
              onClick={() => setActiveTab("account")}
              className={`w-full text-left px-3 py-2 rounded-lg font-heading text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 ${
                activeTab === "account" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              My Profile
            </button>

            <button
              onClick={() => setActiveTab("ai")}
              className={`w-full text-left px-3 py-2 rounded-lg font-heading text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 ${
                activeTab === "ai" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              AI Planner
            </button>

            <button
              onClick={() => setActiveTab("appearance")}
              className={`w-full text-left px-3 py-2 rounded-lg font-heading text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 ${
                activeTab === "appearance" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Palette className="w-4 h-4 shrink-0" />
              Appearance
            </button>

            <button
              onClick={() => setActiveTab("diagnostics")}
              className={`w-full text-left px-3 py-2 rounded-lg font-heading text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 ${
                activeTab === "diagnostics" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Database className="w-4 h-4 shrink-0" />
              Diagnostics
            </button>

            <button
              onClick={() => setActiveTab("legacy")}
              className={`w-full text-left px-3 py-2 rounded-lg font-heading text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 ${
                activeTab === "legacy" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Archive className="w-4 h-4 shrink-0" />
              Removed Features
            </button>

          </nav>
        </aside>

        {/* Right Active Tab Content */}
        <main className="flex-1 p-8 flex flex-col justify-between">
          
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Account Profile Tab */}
            {activeTab === "account" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground">My Profile</h3>
                  <p className="text-xs text-muted-foreground mt-1">Configure your professional profile and core calendar constraints.</p>
                </div>
                
                <div className="h-px bg-border"></div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Profession / Role</label>
                    <input 
                      type="text"
                      value={localProfession}
                      onChange={(e) => setLocalProfession(e.target.value)}
                      placeholder="e.g. Software Engineer, Medical Student"
                      className="w-full bg-[#1c1b1d]/40 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Working Hours Start</label>
                      <input 
                        type="time"
                        value={localStart}
                        onChange={(e) => setLocalStart(e.target.value)}
                        className="w-full bg-[#1c1b1d]/40 border border-border rounded-lg px-4 py-2.5 text-sm text-[#e5e1e4] focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Working Hours End</label>
                      <input 
                        type="time"
                        value={localEnd}
                        onChange={(e) => setLocalEnd(e.target.value)}
                        className="w-full bg-[#1c1b1d]/40 border border-border rounded-lg px-4 py-2.5 text-sm text-[#e5e1e4] focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Preferences Tab */}
            {activeTab === "ai" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground">AI Planner Configuration</h3>
                  <p className="text-xs text-muted-foreground mt-1">Configure scheduling parameters and system behaviors.</p>
                </div>

                <div className="h-px bg-border"></div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      Custom Gemini API Key
                    </label>
                    <div className="relative flex items-center">
                      <input 
                        type={showApiKey ? "text" : "password"}
                        value={localApiKey}
                        onChange={(e) => setLocalApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full bg-[#1c1b1d]/40 border border-border rounded-lg pl-4 pr-12 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/35"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                      Entering a custom key runs the planner on your personal Gemini quota, saving global request tokens.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      Custom Scheduling Instructions
                    </label>
                    <textarea 
                      value={localInstructions}
                      onChange={(e) => setLocalInstructions(e.target.value)}
                      placeholder="e.g. Schedule coding focus blocks strictly before 2 PM. Avoid scheduling deep tasks on Friday afternoons."
                      className="w-full bg-[#1c1b1d]/40 border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 min-h-[120px] placeholder:text-muted-foreground/45"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#1c1b1d]/20 rounded-xl border border-border">
                    <div className="flex gap-3 items-center">
                      <Volume2 className="w-5 h-5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-foreground">AI Voice Feedback</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Let the AI read confirmation statements out loud upon scheduling.</p>
                      </div>
                    </div>
                    <input 
                      type="checkbox"
                      checked={localVoice}
                      onChange={(e) => setLocalVoice(e.target.checked)}
                      className="w-5 h-5 rounded bg-[#1c1b1d] border-border text-primary focus:ring-primary cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Themes Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground">Appearance</h3>
                  <p className="text-xs text-muted-foreground mt-1">Select your premium UI theme styling presets.</p>
                </div>

                <div className="h-px bg-border"></div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Lumina Pulse (Default) */}
                  <div 
                    onClick={() => setLocalTheme("default")}
                    className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all h-28 ${
                      localTheme === "default" 
                        ? "border-primary bg-primary/5" 
                        : "border-border bg-[#1c1b1d]/20 hover:border-white/10"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">Lumina Pulse</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Classic Slate Dark</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-mono">Default</span>
                      <div className="w-4 h-4 rounded-full bg-[#131315] border border-border flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#c0c1ff]"></div>
                      </div>
                    </div>
                  </div>

                  {/* Lumina SaaS Light */}
                  <div 
                    onClick={() => setLocalTheme("light")}
                    className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all h-28 ${
                      localTheme === "light" 
                        ? "border-primary bg-primary/5" 
                        : "border-border bg-[#1c1b1d]/20 hover:border-white/10"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">Lumina SaaS Light</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Clean SaaS light mode</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[9px] bg-secondary/20 text-secondary px-1.5 py-0.5 rounded font-mono">Indigo Light</span>
                      <div className="w-4 h-4 rounded-full bg-[#f8f9ff] border border-border flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#4648d4]"></div>
                      </div>
                    </div>
                  </div>

                  {/* Lumina Pulse Dark */}
                  <div 
                    onClick={() => setLocalTheme("dark")}
                    className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all h-28 ${
                      localTheme === "dark" 
                        ? "border-primary bg-primary/5" 
                        : "border-border bg-[#1c1b1d]/20 hover:border-white/10"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">Lumina Pulse Dark</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Ultra dark coding mode</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[9px] bg-primary/10 text-muted-foreground px-1.5 py-0.5 rounded font-mono">Nordic Dark</span>
                      <div className="w-4 h-4 rounded-full bg-[#0e0e10] border border-border flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#c0c1ff]"></div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Diagnostics Tab */}
            {activeTab === "diagnostics" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#ffb4ab]">Diagnostics & Maintenance</h3>
                  <p className="text-xs text-muted-foreground mt-1">Monitor credentials, cache instances, or reset configurations.</p>
                </div>

                <div className="h-px bg-border"></div>

                <div className="space-y-4">
                  {/* Firebase configuration details */}
                  <div className="p-4 bg-[#1c1b1d]/20 rounded-xl border border-border space-y-2">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Link className="w-3.5 h-3.5 text-primary" />
                      Firebase Project Mapping
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono leading-relaxed">
                      Project ID: commit-ai-vibe2ship-44489<br />
                      Auth Domain: commit-ai-vibe2ship-44489.firebaseapp.com<br />
                      Status: Active & Authenticated
                    </p>
                  </div>

                  {/* Reset Warning */}
                  <div className="p-4 bg-[#93000a]/10 rounded-xl border border-[#ffb4ab]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#ffb4ab] flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        Reset Onboarding State
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Signs you out of the session and resets your personal profile settings completely.
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        if (confirm("Reset onboarding? This will sign you out and reset your occupation profile.")) {
                          resetOnboarding();
                          window.location.reload();
                        }
                      }}
                      className="px-4 py-2 bg-[#93000a]/20 border border-[#ffb4ab]/20 text-[#ffb4ab] rounded-xl font-heading text-xs font-bold hover:bg-[#93000a]/30 transition-all flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Legacy Tab */}
            {activeTab === "legacy" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-200">
                <div>
                  <h3 className="font-heading text-lg font-bold text-foreground">Removed Features</h3>
                  <p className="text-xs text-muted-foreground mt-1">Features removed to support the free Firebase Spark plan.</p>
                </div>

                <div className="h-px bg-border"></div>

                <div className="space-y-4">
                  <div className="p-4 bg-[#1c1b1d]/20 rounded-xl border border-border space-y-2">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      Server-Side Rendering (SSR)
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Task details and edit pages were previously rendered on the server on-demand. To avoid triggering paid Cloud Functions, they are now fully statically exported and client-rendered.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-[#1c1b1d]/20 rounded-xl border border-border space-y-2">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      Clean URL Routing
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Dynamic path segments (e.g., /tasks/[id]) have been removed. The app now relies on query parameters (e.g., /tasks/view?id=...) or client-side state (modals) to display specific task details, ensuring Next.js outputs a static site.
                    </p>
                  </div>

                  <div className="p-4 bg-[#1c1b1d]/20 rounded-xl border border-border space-y-2">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      SEO for Specific Tasks
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Because task pages are no longer generated individually on the server, search engines will only see the static skeleton of these pages.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </form>

          {/* Action Footer */}
          <div className="mt-8 pt-4 border-t border-border flex justify-end">
            <button 
              type="button"
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              className="px-6 py-2.5 bg-primary text-[#1000a9] rounded-xl font-heading text-sm font-bold shadow-[0_0_15px_rgba(192,193,255,0.2)] hover:bg-primary/95 transition-all active:scale-[0.98] flex items-center gap-2 min-w-[130px] justify-center"
            >
              {saveStatus === "saving" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveStatus === "saved" ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}
