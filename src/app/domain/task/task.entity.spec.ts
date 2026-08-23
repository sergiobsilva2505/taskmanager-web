import { describe, it, expect } from 'vitest';
import { Task, TaskProps } from './task.entity';

const baseTaskProps: TaskProps = {
  id: '1',
  title: 'Tarefa teste',
  status: 'TODO',
  priority: 'MEDIUM',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('Task.isOverdue', () => {
  it('retorna false se não há dueDate', () => {
    expect(new Task(baseTaskProps).isOverdue()).toBe(false);
  });

  it('retorna true se dueDate está no passado e status é TODO', () => {
    const task = new Task({ ...baseTaskProps, dueDate: '2020-01-01T00:00:00Z' });
    expect(task.isOverdue()).toBe(true);
  });

  it('retorna true se dueDate está no passado e status é IN_PROGRESS', () => {
    const task = new Task({ ...baseTaskProps, status: 'IN_PROGRESS', dueDate: '2020-01-01T00:00:00Z' });
    expect(task.isOverdue()).toBe(true);
  });

  it('retorna false se dueDate está no passado mas status é DONE', () => {
    const task = new Task({ ...baseTaskProps, status: 'DONE', dueDate: '2020-01-01T00:00:00Z' });
    expect(task.isOverdue()).toBe(false);
  });

  it('retorna false se dueDate está no passado mas status é CANCELLED', () => {
    const task = new Task({ ...baseTaskProps, status: 'CANCELLED', dueDate: '2020-01-01T00:00:00Z' });
    expect(task.isOverdue()).toBe(false);
  });

  it('retorna false se dueDate está no futuro', () => {
    const task = new Task({ ...baseTaskProps, dueDate: '2099-01-01T00:00:00Z' });
    expect(task.isOverdue()).toBe(false);
  });

  it('retorna false quando dueDate é exatamente igual ao momento atual (limite)', () => {
    const now = new Date('2026-06-01T12:00:00.000Z');
    const task = new Task({ ...baseTaskProps, dueDate: now.toISOString() });
    expect(task.isOverdue(now)).toBe(false);
  });

  it('retorna true um milissegundo após o dueDate (logo após o limite)', () => {
    const dueDate = new Date('2026-06-01T12:00:00.000Z');
    const now = new Date(dueDate.getTime() + 1);
    const task = new Task({ ...baseTaskProps, dueDate: dueDate.toISOString() });
    expect(task.isOverdue(now)).toBe(true);
  });
});

describe('Task.canAdvance / Task.nextStatus', () => {
  it('delega para o estado do status atual: TODO pode avançar para IN_PROGRESS', () => {
    const task = new Task({ ...baseTaskProps, status: 'TODO' });
    expect(task.canAdvance()).toBe(true);
    expect(task.nextStatus()).toBe('IN_PROGRESS');
  });

  it('delega para o estado do status atual: DONE não pode avançar', () => {
    const task = new Task({ ...baseTaskProps, status: 'DONE' });
    expect(task.canAdvance()).toBe(false);
    expect(() => task.nextStatus()).toThrow();
  });
});

describe('Task.progress', () => {
  it('reflete o progresso do status atual', () => {
    expect(new Task({ ...baseTaskProps, status: 'IN_PROGRESS' }).progress()).toBe(0.5);
  });
});
