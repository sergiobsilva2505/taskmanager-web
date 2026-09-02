import { describe, it, expect } from 'vitest';
import { Injector } from '@angular/core';
import { Task } from '@domain/task/task.entity';
import { CreateTaskUseCase } from './create-task.use-case';
import { TaskRepositoryPort, CreateTaskInput } from '../ports/task-repository.port';

const mockTask = new Task({
  id: 'new-id',
  title: 'Nova tarefa',
  status: 'TODO',
  priority: 'HIGH',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
});

function makeUseCase() {
  let lastInput: CreateTaskInput | null = null;

  const fakeRepo: TaskRepositoryPort = {
    list: () => Promise.resolve({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }),
    getById: () => Promise.resolve(mockTask),
    create: (input) => { lastInput = input; return Promise.resolve(mockTask); },
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
      { provide: CreateTaskUseCase, useClass: CreateTaskUseCase },
    ],
  });

  return { useCase: injector.get(CreateTaskUseCase), getLastInput: () => lastInput };
}

describe('CreateTaskUseCase', () => {
  it('retorna a tarefa criada pelo repositório', async () => {
    const { useCase } = makeUseCase();
    const result = await useCase.execute({ title: 'Nova tarefa', priority: 'HIGH' });
    expect(result.id).toBe('new-id');
    expect(result.status).toBe('TODO');
  });

  it('remove espaços em branco do título e da descrição antes de enviar ao repositório', async () => {
    const { useCase, getLastInput } = makeUseCase();
    await useCase.execute({
      title: '  Nova tarefa  ',
      priority: 'HIGH',
      description: '  Descrição  ',
    });
    expect(getLastInput()?.title).toBe('Nova tarefa');
    expect(getLastInput()?.description).toBe('Descrição');
  });

  it('rejeita título vazio ou só com espaços', async () => {
    const { useCase } = makeUseCase();
    await expect(useCase.execute({ title: '   ', priority: 'LOW' })).rejects.toThrow();
  });

  it('nova tarefa sempre nasce com status TODO', async () => {
    const { useCase } = makeUseCase();
    const result = await useCase.execute({ title: 'Qualquer', priority: 'LOW' });
    expect(result.status).toBe('TODO');
  });
});
