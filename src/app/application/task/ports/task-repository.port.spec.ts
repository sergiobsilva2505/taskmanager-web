import { describe, it, expect } from 'vitest';
import { CreateTaskInput } from './task-repository.port';

describe('CreateTaskInput', () => {
  it('aceita título com um único caractere não-espaço (limite mínimo válido)', () => {
    const input = new CreateTaskInput({ title: 'a', priority: 'LOW' });
    expect(input.title).toBe('a');
  });

  it('rejeita título vazio', () => {
    expect(() => new CreateTaskInput({ title: '', priority: 'LOW' })).toThrow();
  });

  it('rejeita título só com espaços', () => {
    expect(() => new CreateTaskInput({ title: '   ', priority: 'LOW' })).toThrow();
  });

  it('remove espaços nas bordas do título', () => {
    const input = new CreateTaskInput({ title: '  Tarefa  ', priority: 'LOW' });
    expect(input.title).toBe('Tarefa');
  });

  it('converte descrição só com espaços em undefined', () => {
    const input = new CreateTaskInput({ title: 'Tarefa', priority: 'LOW', description: '   ' });
    expect(input.description).toBeUndefined();
  });

  it('mantém descrição ausente como undefined', () => {
    const input = new CreateTaskInput({ title: 'Tarefa', priority: 'LOW' });
    expect(input.description).toBeUndefined();
  });

  it('preserva priority e dueDate sem alteração', () => {
    const input = new CreateTaskInput({
      title: 'Tarefa',
      priority: 'HIGH',
      dueDate: '2026-01-01T00:00:00Z',
    });
    expect(input.priority).toBe('HIGH');
    expect(input.dueDate).toBe('2026-01-01T00:00:00Z');
  });
});
