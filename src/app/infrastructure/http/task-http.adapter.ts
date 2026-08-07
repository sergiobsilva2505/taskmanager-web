import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Task } from '@domain/task/task.entity';
import { TaskStatus } from '@domain/task/task.value-objects';
import {
  CreateTaskInput,
  ListTasksQuery,
  PagedResult,
  TaskRepositoryPort,
} from '@application/task/ports/task-repository.port';
import { AuthStateService } from '@infrastructure/auth/auth-state.service';
import { API_BASE_URL } from './api.config';
import { Dashboard } from '@domain/task/dashboard.entity';
@Injectable({ providedIn: 'root' })
export class TaskHttpAdapter implements TaskRepositoryPort {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly authState = inject(AuthStateService);

  private get userId(): string {
    const id = this.authState.userId();
    if (!id) throw new Error('Usuário não autenticado.');
    return id;
  }

  list(query: ListTasksQuery): Promise<PagedResult<Task>> {
    let params = new HttpParams().set('currentUserId', this.userId);
    if (query.page !== undefined) params = params.set('page', query.page);
    if (query.size !== undefined) params = params.set('size', query.size);
    if (query.sortField) params = params.set('sortField', query.sortField);
    if (query.sortDirection) params = params.set('sortDirection', query.sortDirection);

    return firstValueFrom(this.http.get<PagedResult<Task>>(`${this.baseUrl}/tasks`, { params }));
  }

  getById(id: string): Promise<Task> {
    const params = new HttpParams().set('currentUserId', this.userId);
    return firstValueFrom(this.http.get<Task>(`${this.baseUrl}/tasks/${id}`, { params }));
  }

  create(input: CreateTaskInput): Promise<Task> {
    const params = new HttpParams().set('currentUserId', this.userId);
    return firstValueFrom(this.http.post<Task>(`${this.baseUrl}/tasks`, input, { params }));
  }

  changeStatus(id: string, status: TaskStatus): Promise<Task> {
    const params = new HttpParams().set('currentUserId', this.userId);
    return firstValueFrom(
      this.http.patch<Task>(`${this.baseUrl}/tasks/${id}/status`, { status }, { params }),
    );
  }

  delete(id: string): Promise<void> {
    const params = new HttpParams().set('currentUserId', this.userId);
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/tasks/${id}`, { params }));
  }

  getDashboard(): Promise<Dashboard> {
    const params = new HttpParams().set('currentUserId', this.userId);
    return firstValueFrom(this.http.get<Dashboard>(`${this.baseUrl}/tasks/dashboard`, { params }));
  }
}
