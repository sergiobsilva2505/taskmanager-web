import { describe, it, expect } from 'vitest';
import { AuthSession } from './auth-session';

const baseSessionProps = {
  token: 'fake-token',
  userId: 'user-1',
  expiresAt: '2099-01-01T00:00:00Z',
};

describe('AuthSession.isExpired', () => {
  it('retorna false se expiresAt está no futuro', () => {
    expect(new AuthSession(baseSessionProps).isExpired()).toBe(false);
  });

  it('retorna true se expiresAt está no passado', () => {
    const session = new AuthSession({ ...baseSessionProps, expiresAt: '2020-01-01T00:00:00Z' });
    expect(session.isExpired()).toBe(true);
  });

  it('retorna true se expiresAt é igual ao momento atual (limite)', () => {
    const now = new Date();
    const session = new AuthSession({ ...baseSessionProps, expiresAt: now.toISOString() });
    expect(session.isExpired(now)).toBe(true);
  });

  it('retorna false um milissegundo antes de expiresAt (logo antes do limite)', () => {
    const expiresAt = new Date('2026-06-01T12:00:00.000Z');
    const now = new Date(expiresAt.getTime() - 1);
    const session = new AuthSession({ ...baseSessionProps, expiresAt: expiresAt.toISOString() });
    expect(session.isExpired(now)).toBe(false);
  });
});
