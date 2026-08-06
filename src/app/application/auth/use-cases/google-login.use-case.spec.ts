import { describe, it, expect } from 'vitest';
import { Injector } from '@angular/core';
import { AuthSession } from '@domain/user/auth-session';
import { GoogleLoginUseCase } from './google-login.use-case';
import { AuthRepositoryPort } from '../ports/auth-repository.port';
import { User } from '@domain/user/user.entity';

const mockSession: AuthSession = {
  token: 'google-token',
  userId: 'user-google',
  expiresAt: '2099-01-01T00:00:00Z',
};

function makeUseCase() {
  let lastIdToken: string | null = null;

  const fakeRepo: AuthRepositoryPort = {
    login: () => Promise.resolve(mockSession),
    googleLogin: (idToken) => { lastIdToken = idToken; return Promise.resolve(mockSession); },
    register: () => Promise.resolve({} as User),
  } as AuthRepositoryPort;

  const injector = Injector.create({
    providers: [
      { provide: AuthRepositoryPort, useValue: fakeRepo },
      { provide: GoogleLoginUseCase, useClass: GoogleLoginUseCase },
    ],
  });

  return { useCase: injector.get(GoogleLoginUseCase), getLastIdToken: () => lastIdToken };
}

describe('GoogleLoginUseCase', () => {
  it('retorna a sessão do repositório', async () => {
    const { useCase } = makeUseCase();
    const result = await useCase.execute('google-id-token-abc');
    expect(result.token).toBe('google-token');
    expect(result.userId).toBe('user-google');
  });

  it('repassa o idToken ao repositório sem modificação', async () => {
    const { useCase, getLastIdToken } = makeUseCase();
    await useCase.execute('google-id-token-abc');
    expect(getLastIdToken()).toBe('google-id-token-abc');
  });
});
