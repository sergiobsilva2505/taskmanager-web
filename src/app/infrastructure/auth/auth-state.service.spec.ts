import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Injector } from '@angular/core';
import { AuthSession } from '@domain/user/auth-session';
import { AuthStateService } from './auth-state.service';

const validSession = new AuthSession({
  token: 'valid-token',
  userId: 'user-1',
  expiresAt: '2099-01-01T00:00:00Z',
});

const expiredSession = new AuthSession({
  token: 'expired-token',
  userId: 'user-2',
  expiresAt: '2020-01-01T00:00:00Z',
});

function makeService() {
  const injector = Injector.create({
    providers: [{ provide: AuthStateService, useClass: AuthStateService }],
  });
  return injector.get(AuthStateService);
}

describe('AuthStateService', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('inicia sem sessão quando sessionStorage está vazio', () => {
    const service = makeService();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.userId()).toBeNull();
    expect(service.token()).toBeNull();
  });

  it('salva sessão e atualiza os signals', () => {
    const service = makeService();
    service.save(validSession);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.userId()).toBe('user-1');
    expect(service.token()).toBe('valid-token');
  });

  it('persiste sessão no sessionStorage', () => {
    const service = makeService();
    service.save(validSession);
    const raw = sessionStorage.getItem('tm_session');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.token).toBe('valid-token');
  });

  it('restaura sessão válida do sessionStorage ao inicializar', () => {
    sessionStorage.setItem('tm_session', JSON.stringify(validSession));
    const service = makeService();
    expect(service.isAuthenticated()).toBe(true);
    expect(service.userId()).toBe('user-1');
  });

  it('descarta sessão expirada do sessionStorage ao inicializar', () => {
    sessionStorage.setItem('tm_session', JSON.stringify(expiredSession));
    const service = makeService();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.userId()).toBeNull();
    expect(sessionStorage.getItem('tm_session')).toBeNull();
  });

  it('clear limpa sessão e sessionStorage', () => {
    const service = makeService();
    service.save(validSession);
    service.clear();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.userId()).toBeNull();
    expect(service.token()).toBeNull();
    expect(sessionStorage.getItem('tm_session')).toBeNull();
  });

  it('isAuthenticated retorna false para sessão expirada', () => {
    const service = makeService();
    service.save(expiredSession);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('ignora sessionStorage corrompido ao inicializar', () => {
    sessionStorage.setItem('tm_session', 'json-invalido{{{{');
    const service = makeService();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.userId()).toBeNull();
  });
});
