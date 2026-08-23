import { describe, it, expect } from 'vitest';
import { statusProgress, canAdvance, nextStatus } from './task.value-objects';

describe('statusProgress', () => {
  it('retorna 0 para TODO', () => {
    expect(statusProgress('TODO')).toBe(0);
  });

  it('retorna 0.5 para IN_PROGRESS', () => {
    expect(statusProgress('IN_PROGRESS')).toBe(0.5);
  });

  it('retorna 1 para DONE', () => {
    expect(statusProgress('DONE')).toBe(1);
  });

  it('retorna 0 para CANCELLED', () => {
    expect(statusProgress('CANCELLED')).toBe(0);
  });
});

describe('canAdvance', () => {
  it('TODO pode avançar', () => {
    expect(canAdvance('TODO')).toBe(true);
  });

  it('IN_PROGRESS pode avançar', () => {
    expect(canAdvance('IN_PROGRESS')).toBe(true);
  });

  it('DONE não pode avançar', () => {
    expect(canAdvance('DONE')).toBe(false);
  });

  it('CANCELLED não pode avançar', () => {
    expect(canAdvance('CANCELLED')).toBe(false);
  });
});

describe('nextStatus', () => {
  it('TODO avança para IN_PROGRESS', () => {
    expect(nextStatus('TODO')).toBe('IN_PROGRESS');
  });

  it('IN_PROGRESS avança para DONE', () => {
    expect(nextStatus('IN_PROGRESS')).toBe('DONE');
  });

  it('lança erro ao pedir o próximo status de uma tarefa DONE', () => {
    expect(() => nextStatus('DONE')).toThrow();
  });

  it('lança erro ao pedir o próximo status de uma tarefa CANCELLED', () => {
    expect(() => nextStatus('CANCELLED')).toThrow();
  });
});
