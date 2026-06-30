"use client";

import { useRouter } from "next/navigation";
import { TaskForm } from "@/components/tasks/TaskForm";
import { ArrowLeft } from "lucide-react";

export default function NewTaskPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/dashboard/tasks");
  };

  const handleCancel = () => {
    router.back();
  };

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
        <h1 className="font-heading text-2xl font-bold text-foreground mb-8">Create New Task</h1>
        <TaskForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
}
