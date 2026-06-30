import { Check, Clock, Edit3, Trash2, ChevronDown, ChevronUp, Bot, Loader2, ListTree } from "lucide-react";
import { Task } from "@/types";
import { useTaskStore } from "@/store/useTaskStore";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { generateSubtasks } from "@/app/actions/gemini";
import { useSound } from "@/hooks/useSound";

export function TaskCard({ task, onEdit }: { task: Task; onEdit: (task: Task) => void }) {
  const { completeTask, deleteTask, updateTask, toggleSubtask: storeToggleSubtask } = useTaskStore();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { playChime } = useSound();

  useEffect(() => {
    if (searchParams?.get("expand") === task.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsExpanded(true);
    }
  }, [searchParams, task.id]);

  const isCompleted = task.status === 'Done';

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#ffb4ab';
      case 'Medium': return '#89ceff';
      case 'Low': return '#4edea3';
      default: return '#89ceff';
    }
  };

  const priorityColor = getPriorityColor(task.priority);
  const formattedTime = format(new Date(task.deadline), 'h:mm a');

  const handleGenerateSubtasks = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const subtaskTitles = await generateSubtasks(task.title, task.description);
      updateTask(task.id, {
        subtasks: subtaskTitles.map((t: string) => ({ 
          id: crypto.randomUUID(), 
          title: t, 
          isCompleted: false 
        }))
      });
    } catch (error) {
      console.error("Failed to generate subtasks", error);
      alert("Failed to generate subtasks. Please check console.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSubtask = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    storeToggleSubtask(task.id, task.subtasks[index].id);
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    completeTask(task.id);
    playChime();
  };

  return (
    <div 
      className={`relative w-full rounded-2xl border ${isCompleted ? 'border-primary/20 bg-[#121113]' : 'border-white/10 bg-[#1c1b1d]'} overflow-hidden cursor-pointer hover:bg-white/[0.02] hover:scale-[1.01] transition-all duration-200 group`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: isCompleted ? 'rgba(255,255,255,0.2)' : priorityColor }}></div>

      {/* Top Header / Collapsed View */}
      <div className="p-4 flex items-start gap-4 cursor-pointer">
        <div 
          onClick={isCompleted ? undefined : handleComplete}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
            isCompleted ? 'bg-primary border-primary' : 'border-muted-foreground hover:border-primary cursor-pointer'
          }`}
        >
          <Check className={`w-4 h-4 ${isCompleted ? 'text-primary' : 'text-primary opacity-0 group-hover:opacity-100 transition-opacity'}`} />
        </div>

        <div className="flex-1">
          <p className={`font-heading text-sm font-medium text-foreground ${isCompleted ? 'line-through' : ''}`}>
            {task.title}
          </p>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            {isCompleted ? (
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Completed</span>
            ) : (
              <>
                <span className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: priorityColor }}>
                  {task.priority} Priority
                </span>
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formattedTime}
                </span>
                {task.riskLevel && (
                  <span className={`text-[10px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded ${task.riskLevel === 'High' ? 'bg-[#ffb4ab]/20 text-[#ffb4ab]' :
                      task.riskLevel === 'Medium' ? 'bg-[#e3c28c]/20 text-[#e3c28c]' : 'bg-[#4edea3]/20 text-[#4edea3]'
                    }`}>
                    {task.riskLevel} Risk
                  </span>
                )}
                {task.subtasks.length > 0 && (
                  <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                    <ListTree className="w-3 h-3" /> {task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              className="p-1.5 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                if (confirm("Are you sure you want to delete this task?")) {
                  deleteTask(task.id); 
                }
              }}
              className="p-1.5 hover:bg-white/5 rounded-lg text-[#ffb4ab] hover:text-[#ffdad6] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <button className="p-1.5 text-muted-foreground hover:text-foreground">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded View */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 ml-10 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">

          {task.description && (
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              Action Plan
            </h4>

            {task.subtasks.length > 0 ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  {task.subtasks.map((subtask, idx) => (
                    <div
                      key={idx}
                      onClick={(e) => toggleSubtask(e, idx)}
                      className="flex items-start gap-3 p-2 hover:bg-white/[0.02] rounded-lg cursor-pointer border border-transparent hover:border-white/5 transition-all"
                    >
                      <div className={`mt-0.5 w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${subtask.isCompleted ? 'bg-primary/20 border-primary' : 'border-white/20'}`}>
                        {subtask.isCompleted && <Check className="w-2.5 h-2.5 text-primary" />}
                      </div>
                      <span className={`text-xs ${subtask.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground/90'}`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2 border-t border-white/5">
                  <button
                    onClick={handleGenerateSubtasks}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors text-[10px] font-bold uppercase tracking-wider disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
                    {isGenerating ? "Regenerating..." : "Regenerate Subtasks"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 flex flex-col items-center justify-center gap-3 text-center">
                <p className="text-[10px] text-muted-foreground">No subtasks defined yet.</p>
                <button
                  onClick={handleGenerateSubtasks}
                  disabled={isGenerating}
                  className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                  {isGenerating ? "Generating..." : "Generate AI Subtasks"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
