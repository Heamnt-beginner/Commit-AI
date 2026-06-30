import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { playSound } from '@/lib/audio';
import { Task, Subtask } from '@/types';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  addSubtask: (taskId: string, subtask: Omit<Subtask, 'id'>) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scheduleBlocks: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setScheduleBlocks: (blocks: any[]) => void;
}

const INITIAL_TASKS: Task[] = [];

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: INITIAL_TASKS,
      scheduleBlocks: [],
      
      setScheduleBlocks: (blocks) => set({ scheduleBlocks: blocks }),
      
      addTask: (taskData) => {
        playSound('add');
        return set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...taskData,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      },

      updateTask: (id, updates) => set((state) => {
        const oldTask = state.tasks.find(t => t.id === id);
        if (oldTask && oldTask.status !== "Done" && updates.status === "Done") {
          playSound("complete");
        }
        return {
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          )
        };
      }),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      })),

      completeTask: (id) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, status: 'Done', progress: 100 } : task
        ),
      })),

      addSubtask: (taskId, subtaskData) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: [
                  ...task.subtasks,
                  { ...subtaskData, id: crypto.randomUUID() },
                ],
              }
            : task
        ),
      })),

      toggleSubtask: (taskId, subtaskId) => set((state) => ({
        tasks: state.tasks.map((task) => {
          if (task.id === taskId) {
            const updatedSubtasks = task.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
            );
            const completedCount = updatedSubtasks.filter(st => st.isCompleted).length;
            const progress = updatedSubtasks.length > 0 
              ? Math.round((completedCount / updatedSubtasks.length) * 100)
              : task.progress;
            
            return {
              ...task,
              subtasks: updatedSubtasks,
              progress,
              status: progress === 100 ? 'Done' : progress > 0 ? 'In Progress' : 'Todo'
            };
          }
          return task;
        }),
      })),
    }),
    {
      name: 'commit-ai-tasks',
    }
  )
);
