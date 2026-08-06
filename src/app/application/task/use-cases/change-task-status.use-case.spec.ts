import { describe, it, expect } from 'vitest';
import { Injector } from '@angular/core';
import { Task } from '@domain/task/task.entity';
import { ChangeTaskStatusUseCase } from './change-task-status.use-case';
import { TaskRepositoryPort } from '../ports/task-repository.port';
import { TaskStatus } from '@domain/task/task.value-objects';

const mockTask: Task = {
  id: 'task-1',
  title: 'Tarefa',
  status: 'IN_PROGRESS',
  priority: 'MEDIUM',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function makeUseCase() {
  let lastId: string | null = null;
  let lastStatus: TaskStatus | null = null;

  const fakeRepo: TaskRepositoryPort = {
    list: () => Promise.resolve({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }),
    getById: () => Promise.resolve(mockTask),
    create: () => Promise.resolve(mockTask),
    changeStatus: (id, status) => {
      lastId = id;
      lastStatus = status;
      return Promise.resolve({ ...mockTask, status });
    },
    delete: () => Promise.resolve(),
  } as TaskRepositoryPort;

  const injector = Injector.create({
    providers: [
      { provide: TaskRepositoryPort, useValue: fakeRepo },
      { provide: ChangeTaskStatusUseCase, useClass: ChangeTaskStatusUseCase },
    ],
  });

  return {
    useCase: injector.get(ChangeTaskStatusUseCase),
    getLastId: () => lastId,
    getLastStatus: () => lastStatus,
  };
}

describe('ChangeTaskStatusUseCase', () => {
  it('retorna a tarefa com o novo status', async () => {
    const { useCase } = makeUseCase();
    const result = await useCase.execute('task-1', 'DONE');
    expect(result.status).toBe('DONE');
  });

  it('repassa o ID e o status ao repositório sem modificação', async () => {
    const { useCase, getLastId, getLastStatus } = makeUseCase();
    await useCase.execute('task-1', 'IN_PROGRESS');
    expect(getLastId()).toBe('task-1');
    expect(getLastStatus()).toBe('IN_PROGRESS');
  });

  it('aceita todos os status válidos', async () => {
    const statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'];
    for (const status of statuses) {
      const { useCase } = makeUseCase();
      const result = await useCase.execute('task-1', status);
      expect(result.status).toBe(status);
    }
  });
});
