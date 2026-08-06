import { describe, it, expect } from 'vitest';
import { isOverdue, Task } from './task.entity';

const baseTask: Task = {
  id: '1',
  title: 'Tarefa teste',
  status: 'TODO',
  priority: 'MEDIUM',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('isOverdue', () => {
  it('retorna false se não há dueDate', () => {
    expect(isOverdue(baseTask)).toBe(false);
  });

  it('retorna true se dueDate está no passado e status é TODO', () => {
    const task: Task = { ...baseTask, dueDate: '2020-01-01T00:00:00Z' };
    expect(isOverdue(task)).toBe(true);
  });

  it('retorna true se dueDate está no passado e status é IN_PROGRESS', () => {
    const task: Task = { ...baseTask, status: 'IN_PROGRESS', dueDate: '2020-01-01T00:00:00Z' };
    expect(isOverdue(task)).toBe(true);
  });

  it('retorna false se dueDate está no passado mas status é DONE', () => {
    const task: Task = { ...baseTask, status: 'DONE', dueDate: '2020-01-01T00:00:00Z' };
    expect(isOverdue(task)).toBe(false);
  });

  it('retorna false se dueDate está no passado mas status é CANCELLED', () => {
    const task: Task = { ...baseTask, status: 'CANCELLED', dueDate: '2020-01-01T00:00:00Z' };
    expect(isOverdue(task)).toBe(false);
  });

  it('retorna false se dueDate está no futuro', () => {
    const task: Task = { ...baseTask, dueDate: '2099-01-01T00:00:00Z' };
    expect(isOverdue(task)).toBe(false);
  });
});
