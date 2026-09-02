import { describe, it, expect } from 'vitest';
import { Injector } from '@angular/core';
import { Dashboard } from '@domain/task/dashboard.entity';
import { Task } from '@domain/task/task.entity';
import { GetDashboardUseCase } from './get-dashboard.use-case';
import { TaskRepositoryPort } from '../ports/task-repository.port';

const mockTask = new Task({
  id: 'task-1',
  title: 'Tarefa mock',
  status: 'TODO',
  priority: 'MEDIUM',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
});

const mockDashboard: Dashboard = {
  totalTasks: 10,
  countByStatus: {
    TODO: 4,
    IN_PROGRESS: 2,
    DONE: 3,
    CANCELLED: 1,
  },
  countByPriority: {
    HIGH: 3,
    MEDIUM: 5,
    LOW: 2,
  },
  overdueCount: 2,
  dueSoonCount: 1,
};

function makeUseCase() {
  const fakeRepo: TaskRepositoryPort = {
    list: () =>
      Promise.resolve({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }),
    getById: () => Promise.resolve(mockTask),
    create: () => Promise.resolve(mockTask),
    changeStatus: () => Promise.resolve(mockTask),
    delete: () => Promise.resolve(),
    getDashboard: () => Promise.resolve(mockDashboard),
  } as TaskRepositoryPort;

  const injector = Injector.create({
    providers: [
      { provide: TaskRepositoryPort, useValue: fakeRepo },
      { provide: GetDashboardUseCase, useClass: GetDashboardUseCase },
    ],
  });

  return injector.get(GetDashboardUseCase);
}

describe('GetDashboardUseCase', () => {
  it('retorna os dados do dashboard do repositório', async () => {
    const useCase = makeUseCase();
    const result = await useCase.execute();
    expect(result.totalTasks).toBe(10);
    expect(result.overdueCount).toBe(2);
    expect(result.dueSoonCount).toBe(1);
  });

  it('retorna contagem por status corretamente', async () => {
    const useCase = makeUseCase();
    const result = await useCase.execute();
    expect(result.countByStatus['TODO']).toBe(4);
    expect(result.countByStatus['IN_PROGRESS']).toBe(2);
    expect(result.countByStatus['DONE']).toBe(3);
    expect(result.countByStatus['CANCELLED']).toBe(1);
  });

  it('retorna contagem por prioridade corretamente', async () => {
    const useCase = makeUseCase();
    const result = await useCase.execute();
    expect(result.countByPriority['HIGH']).toBe(3);
    expect(result.countByPriority['MEDIUM']).toBe(5);
    expect(result.countByPriority['LOW']).toBe(2);
  });
});
