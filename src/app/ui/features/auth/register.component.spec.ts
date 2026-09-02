import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { RegisterUseCase } from '@application/auth/use-cases/register.use-case';
import { LoggerPort } from '@application/shared/ports/logger.port';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let registerExecute: ReturnType<typeof vi.fn>;
  let loggerError: ReturnType<typeof vi.fn>;
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    registerExecute = vi.fn().mockResolvedValue({ id: 'user-1' });
    loggerError = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: RegisterUseCase, useValue: { execute: registerExecute } },
        { provide: LoggerPort, useValue: { info: vi.fn(), error: loggerError } },
      ],
    });

    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
    return fixture;
  }

  function fill(component: RegisterComponent) {
    component.name = 'Sergio';
    component.email = 'sergio@email.com';
    component.password = 'Senha@123';
  }

  it('não chama o caso de uso quando algum campo está vazio', async () => {
    const { componentInstance } = createComponent();
    componentInstance.name = '  ';
    componentInstance.email = 'sergio@email.com';
    componentInstance.password = 'Senha@123';

    await componentInstance.submit();

    expect(registerExecute).not.toHaveBeenCalled();
  });

  it('registra o usuário, exibe sucesso e redireciona para /login após 1,5s', async () => {
    const { componentInstance } = createComponent();
    fill(componentInstance);

    await componentInstance.submit();

    expect(registerExecute).toHaveBeenCalledWith({
      name: 'Sergio',
      email: 'sergio@email.com',
      password: 'Senha@123',
    });
    expect(componentInstance.success()).toBe(true);
    expect(componentInstance.loading()).toBe(false);

    expect(navigateSpy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1500);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('faz trim de nome e e-mail antes de enviar', async () => {
    const { componentInstance } = createComponent();
    componentInstance.name = '  Sergio  ';
    componentInstance.email = '  sergio@email.com  ';
    componentInstance.password = 'Senha@123';

    await componentInstance.submit();

    expect(registerExecute).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Sergio', email: 'sergio@email.com' }),
    );
  });

  describe('tratamento de erro', () => {
    it('loga o erro e usa a mensagem de Error quando o caso de uso lança Error', async () => {
      registerExecute.mockRejectedValue(new Error('Informe um e-mail válido.'));
      const { componentInstance } = createComponent();
      fill(componentInstance);

      await componentInstance.submit();

      expect(loggerError).toHaveBeenCalledWith('Falha ao registrar usuário', expect.any(Error), {
        email: 'sergio@email.com',
      });
      expect(componentInstance.error()).toBe('Informe um e-mail válido.');
      expect(componentInstance.success()).toBe(false);
      expect(componentInstance.loading()).toBe(false);
    });

    it('mapeia status 409 para "Este e-mail já está cadastrado."', async () => {
      registerExecute.mockRejectedValue({ status: 409 });
      const { componentInstance } = createComponent();
      fill(componentInstance);

      await componentInstance.submit();

      expect(componentInstance.error()).toBe('Este e-mail já está cadastrado.');
    });

    it('mapeia status 400 para mensagem de dados inválidos', async () => {
      registerExecute.mockRejectedValue({ status: 400 });
      const { componentInstance } = createComponent();
      fill(componentInstance);

      await componentInstance.submit();

      expect(componentInstance.error()).toBe(
        'Verifique os dados informados e tente novamente.',
      );
    });

    it('usa mensagem genérica para erros desconhecidos', async () => {
      registerExecute.mockRejectedValue({ status: 500 });
      const { componentInstance } = createComponent();
      fill(componentInstance);

      await componentInstance.submit();

      expect(componentInstance.error()).toBe(
        'Não foi possível criar a conta. Tente novamente.',
      );
    });

    it('não redireciona quando o registro falha', async () => {
      registerExecute.mockRejectedValue(new Error('falha'));
      const { componentInstance } = createComponent();
      fill(componentInstance);

      await componentInstance.submit();
      vi.advanceTimersByTime(5000);

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  it('exibe a mensagem de erro no template', async () => {
    registerExecute.mockRejectedValue(new Error('Erro visível'));
    const fixture = createComponent();
    fill(fixture.componentInstance);

    await fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error')?.textContent).toContain('Erro visível');
  });
});
