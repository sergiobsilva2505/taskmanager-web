import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Injector } from '@angular/core';
import { LoggerPort } from '@application/shared/ports/logger.port';
import { ConsoleLoggerAdapter } from './console-logger.adapter';

function makeLogger(): LoggerPort {
  const injector = Injector.create({
    providers: [{ provide: LoggerPort, useClass: ConsoleLoggerAdapter }],
  });
  return injector.get(LoggerPort);
}

describe('ConsoleLoggerAdapter', () => {
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    infoSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('é resolvido pelo DI como implementação de LoggerPort', () => {
    expect(makeLogger()).toBeInstanceOf(ConsoleLoggerAdapter);
  });

  describe('info', () => {
    it('encaminha a mensagem com prefixo [INFO] e o contexto para console.info', () => {
      makeLogger().info('Listando tarefas', { query: { page: 0 } });

      expect(infoSpy).toHaveBeenCalledTimes(1);
      expect(infoSpy).toHaveBeenCalledWith('[INFO] Listando tarefas', { query: { page: 0 } });
    });

    it('usa string vazia como contexto quando ele é omitido', () => {
      makeLogger().info('Dashboard carregado');

      expect(infoSpy).toHaveBeenCalledWith('[INFO] Dashboard carregado', '');
    });

    it('não chama console.error', () => {
      makeLogger().info('qualquer coisa');
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('encaminha mensagem com prefixo [ERROR], o erro e o contexto para console.error', () => {
      const err = new Error('offline');
      makeLogger().error('Falha ao listar tarefas', err, { query: { page: 2 } });

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledWith('[ERROR] Falha ao listar tarefas', err, {
        query: { page: 2 },
      });
    });

    it('usa string vazia como contexto quando ele é omitido', () => {
      const err = new Error('boom');
      makeLogger().error('Falha genérica', err);

      expect(errorSpy).toHaveBeenCalledWith('[ERROR] Falha genérica', err, '');
    });

    it('aceita valores de erro que não são instâncias de Error', () => {
      makeLogger().error('Falha estranha', 'string-de-erro');

      expect(errorSpy).toHaveBeenCalledWith('[ERROR] Falha estranha', 'string-de-erro', '');
    });
  });
});
