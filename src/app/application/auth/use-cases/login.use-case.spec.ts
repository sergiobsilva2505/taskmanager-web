import { describe, it, expect } from 'vitest';
import { Injector } from '@angular/core';
import { AuthSession } from '@domain/user/auth-session';
import { LoginUseCase } from './login.use-case';
import { AuthRepositoryPort, LoginInput } from '../ports/auth-repository.port';
import { User } from '@domain/user/user.entity';

const mockSession: AuthSession = {
  token: 'fake-token',
  userId: 'user-1',
  expiresAt: '2099-01-01T00:00:00Z',
};

function makeUseCase() {
  let lastInput: LoginInput | null = null;

  const fakeRepo: AuthRepositoryPort = {
    login: (input) => { lastInput = input; return Promise.resolve(mockSession); },
    googleLogin: () => Promise.resolve(mockSession),
    register: () => Promise.resolve({} as User),
  } as AuthRepositoryPort;

  const injector = Injector.create({
    providers: [
      { provide: AuthRepositoryPort, useValue: fakeRepo },
      { provide: LoginUseCase, useClass: LoginUseCase },
    ],
  });

  return { useCase: injector.get(LoginUseCase), getLastInput: () => lastInput };
}

describe('LoginUseCase', () => {
  it('retorna a sessão do repositório', async () => {
    const { useCase } = makeUseCase();
    const result = await useCase.execute({ email: 'a@b.com', password: '123' });
    expect(result.token).toBe('fake-token');
    expect(result.userId).toBe('user-1');
  });

  it('repassa o input ao repositório sem modificação', async () => {
    const { useCase, getLastInput } = makeUseCase();
    const input: LoginInput = { email: 'a@b.com', password: 'senha123' };
    await useCase.execute(input);
    expect(getLastInput()).toEqual(input);
  });
});
