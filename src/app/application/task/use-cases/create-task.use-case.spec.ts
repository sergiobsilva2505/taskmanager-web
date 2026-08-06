import { describe, it, expect } from 'vitest';
import { Injector } from '@angular/core';
import { Task } from '@domain/task/task.entity';
import { CreateTaskUseCase } from './create-task.use-case';
import { TaskRepositoryPort, CreateTaskInput } from '../ports/task-repository.port';

const mockTask: Task = {
  id: 'new-id',
  title: 'Nova tarefa',
  status: 'TODO',
  priority: 'HIGH',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function makeUseCase() {
  let lastInput: CreateTaskInput | null = null;

  const fakeRepo: TaskRepositoryPort = {
    list: () => Promise.resolve({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }),
    getById: () => Promise.resolve(mockTask),
    create: (input) => { lastInput = input; return Promise.resolve(mockTask); },
    changeStatus: () => Promise.resolve(mockTask),
    delete: () => Promise.resolve(),
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

  it('repassa o input ao repositório sem modificação', async () => {
    const { useCase, getLastInput } = makeUseCase();
    const input: CreateTaskInput = { title: 'Nova tarefa', priority: 'HIGH', description: 'Descrição' };
    await useCase.execute(input);
    expect(getLastInput()).toEqual(input);
  });

  it('nova tarefa sempre nasce com status TODO', async () => {
    const { useCase } = makeUseCase();
    const result = await useCase.execute({ title: 'Qualquer', priority: 'LOW' });
    expect(result.status).toBe('TODO');
  });
});
