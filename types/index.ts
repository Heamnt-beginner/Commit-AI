export type Priority = 'Low' | 'Medium' | 'High';
export type Status = 'Todo' | 'In Progress' | 'Done';

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO date string
  priority: Priority;
  status: Status;
  progress: number; // 0-100
  subtasks: Subtask[];
  createdAt: string;
  riskScore?: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
  riskAnalysis?: string;
  recoveryPlan?: string;
}
