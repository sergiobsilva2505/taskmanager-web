export abstract class LoggerPort {
  abstract info(message: string, context?: Record<string, unknown>): void;
  abstract error(message: string, error: unknown, context?: Record<string, unknown>): void;
}
