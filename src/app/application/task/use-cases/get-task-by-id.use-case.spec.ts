import { describe, it, expect } from 'vitest';
import { Injector } from '@angular/core';
import { Task } from '@domain/task/task.entity';
import { GetTaskByIdUseCase } from './get-task-by-id.use-case';
import { TaskRepositoryPort } from '../ports/task-repository.port';

const mockTask = new Task({
  id: 'task-123',
  title: 'Tarefa por ID',
  status: 'TODO',
  priority: 'LOW',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
});

function makeUseCase() {
  let lastId: string | null = null;

  const fakeRepo: TaskRepositoryPort = {
    list: () => Promise.resolve({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }),
    getById: (id) => { lastId = id; return Promise.resolve(mockTask); },
    create: () => Promise.resolve(mockTask),
    changeStatus: () => Promise.resolve(mockTask),
    delete: () => Promise.resolve(),
    getDashboard: () =>
      Promise.resolve({
        totalTasks: 0,
        countByStatus: {},
        countByPriority: {},
        overdueCount: 0,
        dueSoonCount: 0,
      }),
  } as TaskRepositoryPort;

  const injector = Injector.create({
    providers: [
      { provide: TaskRepositoryPort, useValue: fakeRepo },
      { provide: GetTaskByIdUseCase, useClass: GetTaskByIdUseCase },
    ],
  });

  return { useCase: injector.get(GetTaskByIdUseCase), getLastId: () => lastId };
}

describe('GetTaskByIdUseCase', () => {
  it('retorna a tarefa correspondente ao ID', async () => {
    const { useCase } = makeUseCase();
    const result = await useCase.execute('task-123');
    expect(result.id).toBe('task-123');
    expect(result.title).toBe('Tarefa por ID');
  });

  it('repassa o ID ao repositório sem modificação', async () => {
    const { useCase, getLastId } = makeUseCase();
    await useCase.execute('task-123');
    expect(getLastId()).toBe('task-123');
  });
});
