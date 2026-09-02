import { Injectable } from '@angular/core';
import { LoggerPort } from '@application/shared/ports/logger.port';

@Injectable({ providedIn: 'root' })
export class ConsoleLoggerAdapter implements LoggerPort {
  info(message: string, context?: Record<string, unknown>): void {
    console.info(`[INFO] ${message}`, context ?? '');
  }

  error(message: string, error: unknown, context?: Record<string, unknown>): void {
    console.error(`[ERROR] ${message}`, error, context ?? '');
  }
}
