import { useState } from "react";
import { Loader2, Wand2, X } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

export function CustomizerModal({
  isOpen,
  onClose,
  onConfirm
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customInstruction: string) => Promise<void>;
}) {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [proposal, setProposal] = useState<string | null>(null);
  
  const { workingHoursStart, workingHoursEnd } = useUserStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate AI checking if the request exceeds working hours
    // In a real implementation, this would hit an LLM endpoint.
    // For now, we do a basic heuristic check or just always present a proposal.
    const isAskingForExtraTime = prompt.toLowerCase().includes("extra") || prompt.toLowerCase().includes("more time") || prompt.toLowerCase().includes("add");
    
    setTimeout(() => {
      if (isAskingForExtraTime) {
        setProposal(`This request may require working outside your fixed hours (${workingHoursStart} - ${workingHoursEnd}). Are you okay with extending your hours temporarily, or should I try to squeeze this into your existing schedule?`);
      } else {
        // Direct apply
        handleAccept(prompt);
      }
      setIsProcessing(false);
    }, 1200);
  };

  const handleAccept = async (instruction: string) => {
    setIsProcessing(true);
    await onConfirm(instruction);
    setIsProcessing(false);
    setProposal(null);
    setPrompt("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[#1c1b1d] border border-primary/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h3 className="font-heading font-bold text-lg flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            Customize Schedule
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {!proposal ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                How would you like to adjust your schedule? (e.g. &quot;Add an extra hour for the presentation&quot;, &quot;Make time for a gym break&quot;)
              </p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type your request here..."
                className="w-full h-32 bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none"
                disabled={isProcessing}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!prompt.trim() || isProcessing}
                  className="bg-primary text-[#1000a9] font-heading font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-primary/95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    "Request Change"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <p className="text-sm font-medium text-primary/90 leading-relaxed">
                  {proposal}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleAccept(`Extend hours: ${prompt}`)}
                  disabled={isProcessing}
                  className="w-full bg-primary text-[#1000a9] font-heading font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-primary/95 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, extend my hours"}
                </button>
                <button
                  onClick={() => handleAccept(`Squeeze into existing hours: ${prompt}`)}
                  disabled={isProcessing}
                  className="w-full bg-white/5 border border-white/10 text-foreground font-heading font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "No, squeeze it in"}
                </button>
                <button
                  onClick={() => { setProposal(null); setPrompt(""); }}
                  disabled={isProcessing}
                  className="w-full text-muted-foreground hover:text-foreground text-xs font-semibold py-2 transition-colors mt-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
