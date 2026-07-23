import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Task } from '@domain/task/task.entity';
import {
  CreateTaskInput,
  ListTasksQuery,
  PagedResult,
  TaskRepositoryPort,
} from '@application/task/ports/task-repository.port';
import { API_BASE_URL } from './api.config';
import { TaskStatus } from '@domain/task/task.value-objects';

@Injectable({ providedIn: 'root' })
export class TaskHttpAdapter implements TaskRepositoryPort {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(query: ListTasksQuery): Promise<PagedResult<Task>> {
    let params = new HttpParams();
    if (query.page !== undefined) params = params.set('page', query.page);
    if (query.size !== undefined) params = params.set('size', query.size);
    if (query.sortField) params = params.set('sortField', query.sortField);
    if (query.sortDirection) params = params.set('sortDirection', query.sortDirection);

    return firstValueFrom(this.http.get<PagedResult<Task>>(`${this.baseUrl}/tasks`, { params }));
  }

  getById(id: string): Promise<Task> {
    return firstValueFrom(this.http.get<Task>(`${this.baseUrl}/tasks/${id}`));
  }

  create(input: CreateTaskInput): Promise<Task> {
    return firstValueFrom(this.http.post<Task>(`${this.baseUrl}/tasks`, input));
  }

  changeStatus(id: string, status: TaskStatus): Promise<Task> {
    return firstValueFrom(this.http.patch<Task>(`${this.baseUrl}/tasks/${id}/status`, { status }));
  }

  delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/tasks/${id}`));
  }
}
