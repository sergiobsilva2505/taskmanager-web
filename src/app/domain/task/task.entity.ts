import { TaskPriority, TaskStatus } from './task.value-objects';

export interface Task {
  id: string; // uuid
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // date-time
  createdAt: string;
  updatedAt: string;
}

export function isOverdue(task: Task, now: Date = new Date()): boolean {
  if (!task.dueDate || task.status === 'DONE' || task.status === 'CANCELLED') return false;
  return new Date(task.dueDate) < now;
}
