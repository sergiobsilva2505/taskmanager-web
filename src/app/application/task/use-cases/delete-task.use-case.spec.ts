import { describe, it, expect } from 'vitest';
import { Injector } from '@angular/core';
import { Task } from '@domain/task/task.entity';
import { DeleteTaskUseCase } from './delete-task.use-case';
import { TaskRepositoryPort } from '../ports/task-repository.port';

const mockTask = new Task({
  id: 'task-1',
  title: 'Tarefa',
  status: 'TODO',
  priority: 'LOW',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
});

function makeUseCase() {
  let deletedId: string | null = null;

  const fakeRepo: TaskRepositoryPort = {
    list: () => Promise.resolve({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }),
    getById: () => Promise.resolve(mockTask),
    create: () => Promise.resolve(mockTask),
    changeStatus: () => Promise.resolve(mockTask),
    delete: (id) => { deletedId = id; return Promise.resolve(); },
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
      { provide: DeleteTaskUseCase, useClass: DeleteTaskUseCase },
    ],
  });

  return { useCase: injector.get(DeleteTaskUseCase), getDeletedId: () => deletedId };
}

describe('DeleteTaskUseCase', () => {
  it('executa sem retornar valor', async () => {
    const { useCase } = makeUseCase();
    const result = await useCase.execute('task-1');
    expect(result).toBeUndefined();
  });

  it('repassa o ID ao repositório sem modificação', async () => {
    const { useCase, getDeletedId } = makeUseCase();
    await useCase.execute('task-1');
    expect(getDeletedId()).toBe('task-1');
  });
});
