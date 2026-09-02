import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Task } from '@domain/task/task.entity';
import { CreateTaskInput } from '@application/task/ports/task-repository.port';
import { LoggerPort } from '@application/shared/ports/logger.port';
import { AuthStateService } from '@infrastructure/auth/auth-state.service';
import { API_BASE_URL } from './api.config';
import { TaskHttpAdapter } from './task-http.adapter';

const BASE_URL = 'http://api.test';

const taskDto = {
  id: 'task-1',
  title: 'Tarefa 1',
  status: 'TODO' as const,
  priority: 'MEDIUM' as const,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('TaskHttpAdapter', () => {
  let adapter: TaskHttpAdapter;
  let httpMock: HttpTestingController;
  let logger: { info: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  let userIdSignal: () => string | null;

  beforeEach(() => {
    logger = { info: vi.fn(), error: vi.fn() };
    userIdSignal = () => 'user-1';

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        TaskHttpAdapter,
        { provide: API_BASE_URL, useValue: BASE_URL },
        { provide: LoggerPort, useValue: logger },
        { provide: AuthStateService, useValue: { userId: () => userIdSignal() } },
      ],
    });

    adapter = TestBed.inject(TaskHttpAdapter);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('list', () => {
    it('faz GET em /tasks com currentUserId e parâmetros de paginação/ordenação', async () => {
      const promise = adapter.list({
        page: 2,
        size: 5,
        sortField: 'TITLE',
        sortDirection: 'ASC',
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === `${BASE_URL}/tasks` &&
          r.params.get('currentUserId') === 'user-1' &&
          r.params.get('page') === '2' &&
          r.params.get('size') === '5' &&
          r.params.get('sortField') === 'TITLE' &&
          r.params.get('sortDirection') === 'ASC',
      );
      expect(req.request.method).toBe('GET');

      req.flush({ content: [taskDto], page: 2, size: 5, totalElements: 11, totalPages: 3 });

      const result = await promise;
      expect(result.content[0]).toBeInstanceOf(Task);
      expect(result.totalElements).toBe(11);
    });

    it('omite parâmetros opcionais não informados', async () => {
      const promise = adapter.list({});
      const req = httpMock.expectOne(`${BASE_URL}/tasks?currentUserId=user-1`);
      expect(req.request.params.has('page')).toBe(false);
      expect(req.request.params.has('size')).toBe(false);
      req.flush({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 });
      await promise;
    });

    it('registra info antes e depois de listar com sucesso', async () => {
      const promise = adapter.list({ page: 0 });
      httpMock
        .expectOne((r) => r.url === `${BASE_URL}/tasks`)
        .flush({ content: [taskDto], page: 0, size: 10, totalElements: 1, totalPages: 1 });
      await promise;

      expect(logger.info).toHaveBeenCalledWith('Listando tarefas', { query: { page: 0 } });
      expect(logger.info).toHaveBeenCalledWith('Tarefas listadas', { totalElements: 1 });
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('registra error e propaga a exceção quando a requisição falha', async () => {
      const promise = adapter.list({ page: 0 });
      httpMock
        .expectOne((r) => r.url === `${BASE_URL}/tasks`)
        .flush('erro', { status: 500, statusText: 'Server Error' });

      await expect(promise).rejects.toBeDefined();
      expect(logger.error).toHaveBeenCalledWith(
        'Falha ao listar tarefas',
        expect.anything(),
        { query: { page: 0 } },
      );
    });
  });

  describe('userId guard', () => {
    it('lança "Usuário não autenticado." e não faz requisição quando não há userId', async () => {
      userIdSignal = () => null;

      await expect(adapter.getById('task-1')).rejects.toThrow('Usuário não autenticado.');
      httpMock.expectNone(() => true);
    });
  });

  describe('getById', () => {
    it('faz GET em /tasks/:id e converte a resposta em Task', async () => {
      const promise = adapter.getById('task-1');
      const req = httpMock.expectOne(`${BASE_URL}/tasks/task-1?currentUserId=user-1`);
      expect(req.request.method).toBe('GET');
      req.flush(taskDto);

      const task = await promise;
      expect(task).toBeInstanceOf(Task);
      expect(task.id).toBe('task-1');
    });

    it('loga o erro com o id e propaga em caso de 404', async () => {
      const promise = adapter.getById('task-x');
      httpMock
        .expectOne(`${BASE_URL}/tasks/task-x?currentUserId=user-1`)
        .flush('not found', { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toBeDefined();
      expect(logger.error).toHaveBeenCalledWith('Falha ao buscar tarefa', expect.anything(), {
        id: 'task-x',
      });
    });
  });

  describe('create', () => {
    it('faz POST em /tasks com o corpo do input e retorna a Task criada', async () => {
      const input = new CreateTaskInput({ title: 'Nova', priority: 'HIGH' });
      const promise = adapter.create(input);

      const req = httpMock.expectOne(`${BASE_URL}/tasks?currentUserId=user-1`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(input);
      req.flush({ ...taskDto, id: 'task-2', title: 'Nova', priority: 'HIGH' });

      const task = await promise;
      expect(task.id).toBe('task-2');
      expect(logger.info).toHaveBeenCalledWith('Tarefa criada', { id: 'task-2' });
    });
  });

  describe('changeStatus', () => {
    it('faz PATCH em /tasks/:id/status com o novo status', async () => {
      const promise = adapter.changeStatus('task-1', 'IN_PROGRESS');
      const req = httpMock.expectOne(`${BASE_URL}/tasks/task-1/status?currentUserId=user-1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'IN_PROGRESS' });
      req.flush({ ...taskDto, status: 'IN_PROGRESS' });

      const task = await promise;
      expect(task.status).toBe('IN_PROGRESS');
    });

    it('loga o erro com id e status ao falhar', async () => {
      const promise = adapter.changeStatus('task-1', 'DONE');
      httpMock
        .expectOne(`${BASE_URL}/tasks/task-1/status?currentUserId=user-1`)
        .flush('erro', { status: 400, statusText: 'Bad Request' });

      await expect(promise).rejects.toBeDefined();
      expect(logger.error).toHaveBeenCalledWith(
        'Falha ao alterar status da tarefa',
        expect.anything(),
        { id: 'task-1', status: 'DONE' },
      );
    });
  });

  describe('delete', () => {
    it('faz DELETE em /tasks/:id e resolve sem valor', async () => {
      const promise = adapter.delete('task-1');
      const req = httpMock.expectOne(`${BASE_URL}/tasks/task-1?currentUserId=user-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      await expect(promise).resolves.toBeUndefined();
      expect(logger.info).toHaveBeenCalledWith('Tarefa excluída', { id: 'task-1' });
    });
  });

  describe('getDashboard', () => {
    it('faz GET em /tasks/dashboard e retorna o dashboard', async () => {
      const dashboard = {
        totalTasks: 3,
        countByStatus: { TODO: 3 },
        countByPriority: { MEDIUM: 3 },
        overdueCount: 0,
        dueSoonCount: 1,
      };
      const promise = adapter.getDashboard();
      const req = httpMock.expectOne(`${BASE_URL}/tasks/dashboard?currentUserId=user-1`);
      expect(req.request.method).toBe('GET');
      req.flush(dashboard);

      await expect(promise).resolves.toEqual(dashboard);
    });

    it('loga o erro sem contexto ao falhar', async () => {
      const promise = adapter.getDashboard();
      httpMock
        .expectOne(`${BASE_URL}/tasks/dashboard?currentUserId=user-1`)
        .flush('erro', { status: 500, statusText: 'Server Error' });

      await expect(promise).rejects.toBeDefined();
      expect(logger.error).toHaveBeenCalledWith(
        'Falha ao carregar dashboard de tarefas',
        expect.anything(),
      );
    });
  });
});
