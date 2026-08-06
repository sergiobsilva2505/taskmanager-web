import { describe, it, expect } from 'vitest';
import { isExpired, AuthSession } from './auth-session';

const baseSession: AuthSession = {
  token: 'fake-token',
  userId: 'user-1',
  expiresAt: '2099-01-01T00:00:00Z',
};

describe('isExpired', () => {
  it('retorna false se expiresAt está no futuro', () => {
    expect(isExpired(baseSession)).toBe(false);
  });

  it('retorna true se expiresAt está no passado', () => {
    const session: AuthSession = { ...baseSession, expiresAt: '2020-01-01T00:00:00Z' };
    expect(isExpired(session)).toBe(true);
  });

  it('retorna true se expiresAt é igual ao momento atual', () => {
    const now = new Date();
    const session: AuthSession = { ...baseSession, expiresAt: now.toISOString() };
    expect(isExpired(session, now)).toBe(true);
  });
});
