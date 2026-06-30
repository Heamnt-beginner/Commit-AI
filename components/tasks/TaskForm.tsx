import React, { useState } from 'react';
import { Task, Priority, Status } from '@/types';
import { useTaskStore } from '@/store/useTaskStore';
import { useSound } from '@/hooks/useSound';

interface TaskFormProps {
  initialData?: Task;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TaskForm({ initialData, onSuccess, onCancel }: TaskFormProps) {
  const { addTask, updateTask, deleteTask } = useTaskStore();
  const { playPop } = useSound();
  
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [deadline, setDeadline] = useState(initialData ? new Date(initialData.deadline).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
  const [priority, setPriority] = useState<Priority>(initialData?.priority || 'Medium');
  const [status] = useState<Status>(initialData?.status || 'Todo');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (initialData) {
      updateTask(initialData.id, {
        title,
        description,
        deadline: new Date(deadline).toISOString(),
        priority,
        status,
      });
    } else {
      addTask({
        title,
        description,
        deadline: new Date(deadline).toISOString(),
        priority,
        status,
        progress: 0,
        subtasks: [],
      });
      playPop();
    }
    
    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block font-heading text-sm font-semibold text-foreground mb-2">Task Title</label>
        <input 
          required
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-[#1c1b1d] border border-white/10 rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
          placeholder="e.g., Q4 Engineering Roadmap"
        />
      </div>

      <div>
        <label className="block font-heading text-sm font-semibold text-foreground mb-2">Description</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-[#1c1b1d] border border-white/10 rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 min-h-[100px]"
          placeholder="Details about this task..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-heading text-sm font-semibold text-foreground mb-2">Deadline</label>
          <input 
            required
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-[#1c1b1d] border border-white/10 rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 [color-scheme:dark]"
          />
        </div>
        
        <div>
          <label className="block font-heading text-sm font-semibold text-foreground mb-2">Priority</label>
          <select 
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full bg-[#1c1b1d] border border-white/10 rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 appearance-none"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-white/5">
        {initialData && (
          <button 
            type="button"
            onClick={() => {
              if (confirm("Are you sure you want to delete this task?")) {
                deleteTask(initialData.id);
                if (onSuccess) onSuccess();
              }
            }}
            className="px-4 py-2 rounded-lg bg-[#93000a]/20 border border-[#ffb4ab]/20 text-[#ffb4ab] font-heading text-sm font-semibold hover:bg-[#93000a]/30 transition-colors"
          >
            Delete Task
          </button>
        )}
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-foreground font-heading text-sm font-semibold hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit"
          className="flex-1 px-4 py-2 rounded-lg bg-primary text-[#1000a9] font-heading text-sm font-bold hover:bg-primary/90 transition-colors"
        >
          {initialData ? 'Save Changes' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
