import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AuthSession } from '@domain/user/auth-session';
import { RegisterInput } from '@application/auth/ports/auth-repository.port';
import { LoggerPort } from '@application/shared/ports/logger.port';
import { API_BASE_URL } from './api.config';
import { AuthHttpAdapter } from './auth-http.adapter';

const BASE_URL = 'http://api.test';

const sessionDto = {
  token: 'jwt-token',
  userId: 'user-1',
  expiresAt: '2099-01-01T00:00:00Z',
};

describe('AuthHttpAdapter', () => {
  let adapter: AuthHttpAdapter;
  let httpMock: HttpTestingController;
  let logger: { info: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    logger = { info: vi.fn(), error: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthHttpAdapter,
        { provide: API_BASE_URL, useValue: BASE_URL },
        { provide: LoggerPort, useValue: logger },
      ],
    });

    adapter = TestBed.inject(AuthHttpAdapter);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('login', () => {
    it('faz POST em /auth/login e converte a resposta em AuthSession', async () => {
      const promise = adapter.login({ email: 'a@b.com', password: 'secret' });

      const req = httpMock.expectOne(`${BASE_URL}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'a@b.com', password: 'secret' });
      req.flush(sessionDto);

      const session = await promise;
      expect(session).toBeInstanceOf(AuthSession);
      expect(session.userId).toBe('user-1');
      expect(logger.info).toHaveBeenCalledWith('Autenticando usuário', { email: 'a@b.com' });
      expect(logger.info).toHaveBeenCalledWith('Usuário autenticado', { userId: 'user-1' });
    });

    it('loga o erro com o e-mail (sem senha) e propaga em caso de 401', async () => {
      const promise = adapter.login({ email: 'a@b.com', password: 'wrong' });
      httpMock
        .expectOne(`${BASE_URL}/auth/login`)
        .flush('unauthorized', { status: 401, statusText: 'Unauthorized' });

      await expect(promise).rejects.toBeDefined();
      expect(logger.error).toHaveBeenCalledWith('Falha ao autenticar usuário', expect.anything(), {
        email: 'a@b.com',
      });
      const [, , context] = logger.error.mock.calls[0];
      expect(context).not.toHaveProperty('password');
    });
  });

  describe('googleLogin', () => {
    it('faz POST em /auth/google com o idToken', async () => {
      const promise = adapter.googleLogin('google-id-token');
      const req = httpMock.expectOne(`${BASE_URL}/auth/google`);
      expect(req.request.body).toEqual({ idToken: 'google-id-token' });
      req.flush(sessionDto);

      const session = await promise;
      expect(session).toBeInstanceOf(AuthSession);
    });

    it('loga o erro sem contexto ao falhar', async () => {
      const promise = adapter.googleLogin('bad-token');
      httpMock
        .expectOne(`${BASE_URL}/auth/google`)
        .flush('erro', { status: 401, statusText: 'Unauthorized' });

      await expect(promise).rejects.toBeDefined();
      expect(logger.error).toHaveBeenCalledWith(
        'Falha ao autenticar usuário via Google',
        expect.anything(),
      );
    });
  });

  describe('register', () => {
    it('faz POST em /users com o input e retorna o usuário', async () => {
      const input = new RegisterInput({
        name: 'Sergio',
        email: 'sergio@email.com',
        password: 'Senha@123',
      });
      const promise = adapter.register(input);

      const req = httpMock.expectOne(`${BASE_URL}/users`);
      expect(req.request.method).toBe('POST');
      req.flush({
        id: 'user-9',
        name: 'Sergio',
        email: 'sergio@email.com',
        createdAt: '2026-01-01T00:00:00Z',
      });

      const user = await promise;
      expect(user.id).toBe('user-9');
      expect(logger.info).toHaveBeenCalledWith('Usuário registrado', { userId: 'user-9' });
    });

    it('loga o erro com o e-mail e propaga em caso de 409', async () => {
      const input = new RegisterInput({
        name: 'Sergio',
        email: 'sergio@email.com',
        password: 'Senha@123',
      });
      const promise = adapter.register(input);
      httpMock
        .expectOne(`${BASE_URL}/users`)
        .flush('conflict', { status: 409, statusText: 'Conflict' });

      await expect(promise).rejects.toBeDefined();
      expect(logger.error).toHaveBeenCalledWith('Falha ao registrar usuário', expect.anything(), {
        email: 'sergio@email.com',
      });
    });
  });
});
