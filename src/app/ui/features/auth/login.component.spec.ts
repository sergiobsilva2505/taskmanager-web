import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { AuthSession } from '@domain/user/auth-session';
import { LoginUseCase } from '@application/auth/use-cases/login.use-case';
import { GoogleLoginUseCase } from '@application/auth/use-cases/google-login.use-case';
import { LoggerPort } from '@application/shared/ports/logger.port';
import { AuthStateService } from '@infrastructure/auth/auth-state.service';
import { LoginComponent } from './login.component';

const session = new AuthSession({
  token: 'jwt',
  userId: 'user-1',
  expiresAt: '2099-01-01T00:00:00Z',
});

describe('LoginComponent', () => {
  let loginExecute: ReturnType<typeof vi.fn>;
  let googleExecute: ReturnType<typeof vi.fn>;
  let loggerError: ReturnType<typeof vi.fn>;
  let authSave: ReturnType<typeof vi.fn>;
  let navigateByUrl: ReturnType<typeof vi.spyOn>;
  let returnUrl: string | null;

  beforeEach(() => {
    // impede o polling de setInterval do botão do Google de vazar entre os testes
    vi.spyOn(window, 'setInterval').mockReturnValue(0 as unknown as ReturnType<typeof setInterval>);

    loginExecute = vi.fn().mockResolvedValue(session);
    googleExecute = vi.fn().mockResolvedValue(session);
    loggerError = vi.fn();
    authSave = vi.fn();
    returnUrl = null;

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: LoginUseCase, useValue: { execute: loginExecute } },
        { provide: GoogleLoginUseCase, useValue: { execute: googleExecute } },
        { provide: LoggerPort, useValue: { info: vi.fn(), error: loggerError } },
        { provide: AuthStateService, useValue: { save: authSave } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => returnUrl } } },
        },
      ],
    });

    navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('não autentica quando e-mail ou senha estão vazios', async () => {
    const { componentInstance } = createComponent();
    componentInstance.email = '   ';
    componentInstance.password = '';

    await componentInstance.submit();

    expect(loginExecute).not.toHaveBeenCalled();
  });

  it('autentica, salva a sessão e redireciona para a raiz quando não há returnUrl', async () => {
    const { componentInstance } = createComponent();
    componentInstance.email = '  a@b.com  ';
    componentInstance.password = 'secret';

    await componentInstance.submit();

    expect(loginExecute).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret' });
    expect(authSave).toHaveBeenCalledWith(session);
    expect(navigateByUrl).toHaveBeenCalledWith('/');
    expect(componentInstance.loading()).toBe(false);
    expect(componentInstance.error()).toBeNull();
  });

  it('redireciona para a returnUrl informada na query string', async () => {
    returnUrl = '/tasks/7';
    const { componentInstance } = createComponent();
    componentInstance.email = 'a@b.com';
    componentInstance.password = 'secret';

    await componentInstance.submit();

    expect(navigateByUrl).toHaveBeenCalledWith('/tasks/7');
  });

  it('loga o erro e exibe mensagem amigável quando a autenticação falha', async () => {
    loginExecute.mockRejectedValue(new Error('401'));
    const { componentInstance } = createComponent();
    componentInstance.email = 'a@b.com';
    componentInstance.password = 'wrong';

    await componentInstance.submit();

    expect(loggerError).toHaveBeenCalledWith('Falha ao autenticar usuário', expect.any(Error), {
      email: 'a@b.com',
    });
    expect(componentInstance.error()).toBe('E-mail ou senha incorretos.');
    expect(authSave).not.toHaveBeenCalled();
    expect(navigateByUrl).not.toHaveBeenCalled();
    expect(componentInstance.loading()).toBe(false);
  });

  it('renderiza a mensagem de erro no template', async () => {
    loginExecute.mockRejectedValue(new Error('nope'));
    const fixture = createComponent();
    fixture.componentInstance.email = 'a@b.com';
    fixture.componentInstance.password = 'wrong';

    await fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error')?.textContent).toContain(
      'E-mail ou senha incorretos.',
    );
  });
});
