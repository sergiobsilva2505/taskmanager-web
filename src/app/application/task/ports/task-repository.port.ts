import { Task } from '@domain/task/task.entity';
import { TaskPriority, TaskStatus } from '@domain/task/task.value-objects';

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

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
}

export abstract class TaskRepositoryPort {
  abstract list(query: ListTasksQuery): Promise<PagedResult<Task>>;
  abstract getById(id: string): Promise<Task>;
  abstract create(input: CreateTaskInput): Promise<Task>;
  abstract changeStatus(id: string, status: TaskStatus): Promise<Task>;
  abstract delete(id: string): Promise<void>;
}
