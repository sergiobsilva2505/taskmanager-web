import { describe, it, expect } from 'vitest';
import { Injector } from '@angular/core';
import { Task } from '@domain/task/task.entity';
import { ListTasksUseCase } from './list-tasks.use-case';
import { TaskRepositoryPort, ListTasksQuery } from '../ports/task-repository.port';

const mockTask: Task = {
  id: '1',
  title: 'Tarefa mock',
  status: 'TODO',
  priority: 'MEDIUM',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function makeUseCase() {
  let lastQuery: ListTasksQuery | null = null;

  const fakeRepo: TaskRepositoryPort = {
    list: (query) => {
      lastQuery = query;
      return Promise.resolve({
        content: [mockTask],
        page: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      });
    },
    getById: () => Promise.resolve(mockTask),
    create: () => Promise.resolve(mockTask),
    changeStatus: () => Promise.resolve(mockTask),
    delete: () => Promise.resolve(),
  } as TaskRepositoryPort;

  const injector = Injector.create({
    providers: [
      { provide: TaskRepositoryPort, useValue: fakeRepo },
      { provide: ListTasksUseCase, useClass: ListTasksUseCase },
    ],
  });

  return { useCase: injector.get(ListTasksUseCase), getLastQuery: () => lastQuery };
}

describe('ListTasksUseCase', () => {
  it('retorna a lista paginada do repositório', async () => {
    const { useCase } = makeUseCase();
    const result = await useCase.execute({ page: 0, size: 10 });
    expect(result.content).toHaveLength(1);
    expect(result.content[0].title).toBe('Tarefa mock');
  });

  it('repassa o query ao repositório sem modificação', async () => {
    const { useCase, getLastQuery } = makeUseCase();
    const query: ListTasksQuery = { page: 2, size: 5, sortField: 'TITLE', sortDirection: 'ASC' };
    await useCase.execute(query);
    expect(getLastQuery()).toEqual(query);
  });

  it('executa sem query e usa defaults do repositório', async () => {
    const { useCase } = makeUseCase();
    const result = await useCase.execute();
    expect(result.totalPages).toBe(1);
  });
});
