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
import { LoggerPort } from '@application/shared/ports/logger.port';
import { AuthStateService } from '@infrastructure/auth/auth-state.service';
import { API_BASE_URL } from './api.config';
import { Dashboard } from '@domain/task/dashboard.entity';
@Injectable({ providedIn: 'root' })
export class TaskHttpAdapter implements TaskRepositoryPort {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly authState = inject(AuthStateService);
  private readonly logger = inject(LoggerPort);

  private get userId(): string {
    const id = this.authState.userId();
    if (!id) throw new Error('Usuário não autenticado.');
    return id;
  }

  async list(query: ListTasksQuery): Promise<PagedResult<Task>> {
    this.logger.info('Listando tarefas', { query });
    let params = new HttpParams().set('currentUserId', this.userId);
    if (query.page !== undefined) params = params.set('page', query.page);
    if (query.size !== undefined) params = params.set('size', query.size);
    if (query.sortField) params = params.set('sortField', query.sortField);
    if (query.sortDirection) params = params.set('sortDirection', query.sortDirection);

    try {
      const result = await firstValueFrom(
        this.http.get<PagedResult<Task>>(`${this.baseUrl}/tasks`, { params }),
      );
      this.logger.info('Tarefas listadas', { totalElements: result.totalElements });
      return result;
    } catch (error) {
      this.logger.error('Falha ao listar tarefas', error, { query });
      throw error;
    }
  }

  async getById(id: string): Promise<Task> {
    this.logger.info('Buscando tarefa por id', { id });
    const params = new HttpParams().set('currentUserId', this.userId);
    try {
      const task = await firstValueFrom(this.http.get<Task>(`${this.baseUrl}/tasks/${id}`, { params }));
      this.logger.info('Tarefa encontrada', { id });
      return task;
    } catch (error) {
      this.logger.error('Falha ao buscar tarefa', error, { id });
      throw error;
    }
  }

  async create(input: CreateTaskInput): Promise<Task> {
    this.logger.info('Criando tarefa', { input });
    const params = new HttpParams().set('currentUserId', this.userId);
    try {
      const task = await firstValueFrom(
        this.http.post<Task>(`${this.baseUrl}/tasks`, input, { params }),
      );
      this.logger.info('Tarefa criada', { id: task.id });
      return task;
    } catch (error) {
      this.logger.error('Falha ao criar tarefa', error, { input });
      throw error;
    }
  }

  async changeStatus(id: string, status: TaskStatus): Promise<Task> {
    this.logger.info('Alterando status da tarefa', { id, status });
    const params = new HttpParams().set('currentUserId', this.userId);
    try {
      const task = await firstValueFrom(
        this.http.patch<Task>(`${this.baseUrl}/tasks/${id}/status`, { status }, { params }),
      );
      this.logger.info('Status da tarefa alterado', { id, status });
      return task;
    } catch (error) {
      this.logger.error('Falha ao alterar status da tarefa', error, { id, status });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.info('Excluindo tarefa', { id });
    const params = new HttpParams().set('currentUserId', this.userId);
    try {
      await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/tasks/${id}`, { params }));
      this.logger.info('Tarefa excluída', { id });
    } catch (error) {
      this.logger.error('Falha ao excluir tarefa', error, { id });
      throw error;
    }
  }

  async getDashboard(): Promise<Dashboard> {
    this.logger.info('Carregando dashboard de tarefas');
    const params = new HttpParams().set('currentUserId', this.userId);
    try {
      const dashboard = await firstValueFrom(
        this.http.get<Dashboard>(`${this.baseUrl}/tasks/dashboard`, { params }),
      );
      this.logger.info('Dashboard de tarefas carregado');
      return dashboard;
    } catch (error) {
      this.logger.error('Falha ao carregar dashboard de tarefas', error);
      throw error;
    }
  }
}
