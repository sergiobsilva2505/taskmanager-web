import { TaskPriority, TaskStatus, canAdvance, nextStatus, statusProgress } from './task.value-objects';

export interface TaskProps {
  id: string; // uuid
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // date-time
  createdAt: string;
  updatedAt: string;
}

export class Task {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly dueDate?: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(props: TaskProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.status = props.status;
    this.priority = props.priority;
    this.dueDate = props.dueDate;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isOverdue(now: Date = new Date()): boolean {
    if (!this.dueDate || this.status === 'DONE' || this.status === 'CANCELLED') return false;
    return new Date(this.dueDate) < now;
  }

  canAdvance(): boolean {
    return canAdvance(this.status);
  }

  nextStatus(): TaskStatus {
    return nextStatus(this.status);
  }

  progress(): number {
    return statusProgress(this.status);
  }
}
