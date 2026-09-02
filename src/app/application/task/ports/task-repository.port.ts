import { Task } from '@domain/task/task.entity';
import { TaskPriority, TaskStatus } from '@domain/task/task.value-objects';
import { Dashboard } from '@domain/task/dashboard.entity';

export type TaskSortField = 'TITLE' | 'CREATED_AT' | 'DUE_DATE' | 'PRIORITY';
export type SortDirection = 'ASC' | 'DESC';

export interface ListTasksQuery {
  page?: number;
  size?: number;
  sortField?: TaskSortField;
  sortDirection?: SortDirection;
}

export interface PagedResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateTaskParams {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
}

export class CreateTaskInput {
  readonly title: string;
  readonly description?: string;
  readonly priority: TaskPriority;
  readonly dueDate?: string;

  constructor(params: CreateTaskParams) {
    const title = params.title.trim();
    if (!title) throw new Error('O título da tarefa é obrigatório.');

    this.title = title;
    this.description = params.description?.trim() || undefined;
    this.priority = params.priority;
    this.dueDate = params.dueDate;
  }
}

export abstract class TaskRepositoryPort {
  abstract list(query: ListTasksQuery): Promise<PagedResult<Task>>;
  abstract getById(id: string): Promise<Task>;
  abstract create(input: CreateTaskInput): Promise<Task>;
  abstract changeStatus(id: string, status: TaskStatus): Promise<Task>;
  abstract delete(id: string): Promise<void>;
  abstract getDashboard(): Promise<Dashboard>;
}

