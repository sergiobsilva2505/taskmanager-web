import { describe, it, expect } from 'vitest';
import { Injector } from '@angular/core';
import { User } from '@domain/user/user.entity';
import { AuthSession } from '@domain/user/auth-session';
import { RegisterUseCase } from './register.use-case';
import { AuthRepositoryPort, RegisterInput } from '../ports/auth-repository.port';

const mockUser: User = {
  id: 'user-1',
  name: 'Sergio',
  email: 'sergio@email.com',
  createdAt: '2026-01-01T00:00:00Z',
};

const mockSession: AuthSession = {
  token: 'fake-token',
  userId: 'user-1',
  expiresAt: '2099-01-01T00:00:00Z',
};

function makeUseCase() {
  let lastInput: RegisterInput | null = null;

  const fakeRepo: AuthRepositoryPort = {
    login: () => Promise.resolve(mockSession),
    googleLogin: () => Promise.resolve(mockSession),
    register: (input) => { lastInput = input; return Promise.resolve(mockUser); },
  } as AuthRepositoryPort;

  const injector = Injector.create({
    providers: [
      { provide: AuthRepositoryPort, useValue: fakeRepo },
      { provide: RegisterUseCase, useClass: RegisterUseCase },
    ],
  });

  return { useCase: injector.get(RegisterUseCase), getLastInput: () => lastInput };
}

describe('RegisterUseCase', () => {
  it('retorna o usuário criado pelo repositório', async () => {
    const { useCase } = makeUseCase();
    const result = await useCase.execute({
      name: 'Sergio',
      email: 'sergio@email.com',
      password: 'Senha@123',
    });
    expect(result.id).toBe('user-1');
    expect(result.name).toBe('Sergio');
  });

  it('repassa o input ao repositório sem modificação', async () => {
    const { useCase, getLastInput } = makeUseCase();
    const input: RegisterInput = {
      name: 'Sergio',
      email: 'sergio@email.com',
      password: 'Senha@123',
    };
    await useCase.execute(input);
    expect(getLastInput()).toEqual(input);
  });

  it('retorna User, não AuthSession', async () => {
    const { useCase } = makeUseCase();
    const result = await useCase.execute({
      name: 'Sergio',
      email: 'sergio@email.com',
      password: 'Senha@123',
    });
    expect(result).toHaveProperty('name');
    expect(result).not.toHaveProperty('token');
  });
});
