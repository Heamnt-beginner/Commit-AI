"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useTaskStore } from "@/store/useTaskStore";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { Task } from "@/types";

function EditTaskContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { tasks } = useTaskStore();
  const [task, setTask] = useState<Task | undefined>(undefined);

  useEffect(() => {
    if (id) {
      const found = tasks.find(t => t.id === id);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (found) setTask(found);
    }
  }, [id, tasks]);

  const handleSuccess = () => {
    router.push("/dashboard/tasks");
  };

  const handleCancel = () => {
    router.back();
  };

  if (!task) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <button 
        onClick={handleCancel}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-heading text-sm font-semibold">Back</span>
      </button>

      <div className="glass-panel p-8 rounded-2xl">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-8">Edit Task</h1>
        <TaskForm initialData={task} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
}

export default function EditTaskPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    }>
      <EditTaskContent />
    </Suspense>
  );
}
