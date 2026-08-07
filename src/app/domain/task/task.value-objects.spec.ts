import { describe, it, expect } from 'vitest';
import { statusProgress, nextStatus } from './task.value-objects';

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

describe('nextStatus', () => {
  it('TODO avança para IN_PROGRESS', () => {
    expect(nextStatus('TODO')).toBe('IN_PROGRESS');
  });

  it('IN_PROGRESS avança para DONE', () => {
    expect(nextStatus('IN_PROGRESS')).toBe('DONE');
  });

  it('DONE não tem próximo status', () => {
    expect(nextStatus('DONE')).toBeNull();
  });

  it('CANCELLED não tem próximo status', () => {
    expect(nextStatus('CANCELLED')).toBeNull();
  });
});
