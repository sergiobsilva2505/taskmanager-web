import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { TaskRepositoryPort } from '@application/task/ports/task-repository.port';
import { TaskHttpAdapter } from '@infrastructure/http/task-http.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    { provide: TaskRepositoryPort, useClass: TaskHttpAdapter },
  ],
};
